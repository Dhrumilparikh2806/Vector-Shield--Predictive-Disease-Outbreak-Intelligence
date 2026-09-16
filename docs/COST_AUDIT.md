# Vector Shield — Cost & Unit Economics Audit

Prepared 2026-09-16. Companion file: [MISSING_INPUTS.md](../MISSING_INPUTS.md) (read that first — it lists every gap this model had to assume around).

**Legend:** `VERIFIED` = read directly from the codebase or a dated, sourced external price. `ASSUMPTION` = reasoned estimate, no direct source — flagged inline. FX rate used throughout: **$1 = ₹83** (`ASSUMPTION`, verify current rate).

---

## 0. Reality check — read this before the numbers

`VERIFIED` (full codebase audit, see §1): Vector Shield today is a **pre-revenue demo-stage product**.
- No AWS account/SDK anywhere in the code. Actual current hosting is **Vercel (frontend, free) + Render (backend, free/~$7/mo) + Neon or Supabase (Postgres, free tier)** — documented in `HOSTING.md`.
- No LLM/AI API calls anywhere — the "AI/ML" is 100% locally-run scikit-learn (RandomForest, IsolationForest, DBSCAN) on the same small server. Zero per-inference API cost today.
- No SMS/WhatsApp/email/push notification code exists. "Alerts" are an in-app data feed only.
- No payment/billing integration (no Stripe or equivalent) despite a live pricing page with dollar figures.
- No real IoT hardware is wired to the water-quality data that drives outbreak risk — that dataset is static CSV. Only temperature/humidity/moisture/rainfall have an optional (demo-capable) Arduino serial path.
- Only account activity in the database is 1 seeded admin + 3 explicitly-commented demo/investor tenant accounts.
- The live pricing page (`frontend/src/pages/PricingPage.jsx`) shows **Starter $0 / Professional $249/mo / Enterprise Custom** — this does **not** match the ₹1,000 / ₹4,500 structure in the audit brief. Both are tested in §16; which is authoritative is an open question (see MISSING_INPUTS §1).

**Consequence for this audit:** every cost figure below at 10/100/1,000 hospitals is a *forward model built on verified unit prices*, not a measurement of an existing bill — because no such bill exists yet. Treat the numbers as directionally sound scaffolding for pricing decisions, not audited actuals.

---

## 1. Codebase Inventory

| Category | Finding | Evidence |
|---|---|---|
| Frontend | React 18 + Vite 5, Tailwind CSS, Recharts, Leaflet/react-leaflet (free OSM tiles, no API key) | `frontend/package.json` |
| Backend | Python + FastAPI, Uvicorn, no task queue | `backend/main.py`, `requirements.txt` |
| Database | Dual-mode: SQLite (local/dev) → Postgres via `DATABASE_URL` (prod, intended Neon/Supabase). SQLAlchemy ORM, no Alembic migrations | `backend/database.py`, `HOSTING.md` |
| Auth | Real JWT (pyjwt) + bcrypt, HS256, 7-day expiry, two-tier hospital/admin roles, approval workflow. No OAuth/Auth0/Firebase | `backend/auth.py` |
| AI/ML | 100% local scikit-learn: RandomForest (48h outbreak forecast), IsolationForest (anomaly), DBSCAN (hotspot clustering). Risk score is a hand-coded weighted formula, not a model. **Zero external AI API usage** | `backend/ml_engine.py` |
| External APIs | **None found** — no payment, SMS/email, maps API (beyond free Leaflet+OSM), cloud-vendor SDK, or APM vendor anywhere in the repo | repo-wide grep, both agents |
| Notifications | **None found** — alerts are an in-app JSON feed only, no delivery mechanism | `backend/services/alert_engine.py`, `routes/alerts.py` |
| Maps | Leaflet + OpenStreetMap (free, no key) | `frontend/package.json` |
| Cloud/Deploy | Vercel (frontend) + Render (backend, Docker) + Neon/Supabase (Postgres). Local Docker Compose for dev. No AWS/GCP/Azure SDK or IaC anywhere | `HOSTING.md`, `render.yaml`, `docker-compose.yml` |
| IoT/Hardware | Optional Arduino-over-serial path for temp/humidity/moisture/rainfall, with a random-value demo-mode fallback. No LoRa, no BOM, no ₹ figures anywhere in trackable repo content | `backend/arduino_listener.py` |
| Monitoring | stdlib `logging` only. No Sentry/DataDog/CloudWatch | `backend/main.py` |
| CI/CD | None — no `.github/workflows` or any CI config | repo search |
| Env vars | `DATABASE_URL`, `JWT_SECRET_KEY`, `ADMIN_EMAIL/PASSWORD`, `API_HOST/PORT`, `ENVIRONMENT`, `VITE_API_BASE_URL`. No AI/payment/notification/cloud-vendor keys | `.env.example` |

**Key negative findings** (these matter as much as positive ones): no billing system, no live water-quality sensor hardware, no BOM in-repo, no CI compute cost, no external API spend exposure today.

---

## 2. Cloud/Infrastructure Cost Model

### 2a. As-built stack (Render + Neon/Supabase + Vercel) — `VERIFIED` current architecture, `ASSUMPTION` tier sizing

| Hospitals (shared, multi-tenant — NOT per-hospital infra) | Stack | Monthly cost (total) | Source |
|---|---|---|---|
| 1–10 | Render Starter $7/mo + Vercel Pro $20/mo (`ASSUMPTION`: free Hobby tier likely violates Vercel's non-commercial ToS — see MISSING_INPUTS §5) + Neon free tier $0 | **~$27/mo** | render.com/pricing, `VERIFY` |
| 10–25 | Render Standard ~$25/mo + Vercel Pro $20 + Neon paid tier (`ASSUMPTION` ~$19/mo, unverified this session) | **~$64/mo** | `VERIFY` Neon pricing |
| 25–50 | 2x Render Standard ~$50 + Vercel Pro $20 + Neon Scale (`ASSUMPTION` ~$69/mo) + basic monitoring (Sentry Team ~$26/mo) | **~$165/mo** | |

Beyond ~50 hospitals, the managed-PaaS stack (Render/Neon) becomes cost-inefficient vs. self-managed AWS at this traffic tier — migration point flagged in §17.

### 2b. AWS-equivalent model (relevant for 100+ hospitals / government-scale, Scenario E) — `VERIFIED` unit prices, `ASSUMPTION` architecture sizing (no real traffic data exists to size against — see MISSING_INPUTS §4)

Sourced unit prices (ap-south-1 Mumbai, checked 2026-09-16, several cross-checked via third-party AWS pricing trackers rather than AWS's own JS-rendered pages — `VERIFY` at calculator.aws before finalizing):

| Resource | Price | Source |
|---|---|---|
| EC2 t3.micro | $0.0112/hr (~$8.18/mo) | doit.com AWS pricing tracker |
| EC2 t3.small | ~$0.0224/hr (~$16.35/mo) | vantage.sh |
| EC2 t3.medium | ~$0.0449/hr (~$32.78/mo) | vantage.sh |
| RDS db.t3.micro Postgres Single-AZ | ~$34.27/mo (aggregator; notably above global baseline — `VERIFY`) | aiven.io |
| RDS storage (gp3) | $0.115/GB-month | cloudzero.com |
| S3 Standard storage | $0.023/GB-month | itforsme.in |
| S3 PUT/COPY/POST/LIST | $0.005/1,000 requests | amnic.com |
| CloudWatch Logs | $0.50/GB ingest + $0.03/GB-month storage (us-east-1 baseline) | signoz.io |
| ALB | $0.0225/hr (~$16.43/mo) + $0.008/LCU-hr | cloudchipr.com |
| Data transfer OUT | $0.109/GB first 10TB/mo, 100GB/mo free | AWS re:Post |
| New-account credits | $100 signup + $100 for onboarding tasks (no longer a flat 12-mo free tier) | aws.amazon.com/free |

Modeled sizing (`ASSUMPTION` — traffic-blind, illustrative only):

| Hospitals | Illustrative architecture | Monthly $ | $/hospital/mo |
|---|---|---|---|
| 100 | ALB + 3× t3.medium ($98) + RDS Multi-AZ t3.medium (~$280) + S3/CloudWatch (~$60) + WAF (~$50) + monitoring (~$99) | **~$700** | $7.00 |
| 500 | ALB + 6× t3.large + RDS r6g.large Multi-AZ + WAF + full observability | **~$2,500** (`ASSUMPTION`) | $5.00 |
| 1,000 | Autoscaling group + RDS cluster/Aurora + WAF + multi-region backup | **~$4,500–6,000** (`ASSUMPTION`) | ~$5.00 |

**Formula:** `$/hospital/mo = total infra $/mo ÷ active hospital count`. Because compute/DB is shared multi-tenant infrastructure, this is a **step function, not linear** — see §9.

---

## 3. AI/ML Cost

`VERIFIED`: no LLM API is used. Cost of the current ML pipeline = amortized into backend compute (§2) — retraining `ml_engine.py` is a periodic batch job (minutes of CPU on the same small instance), effectively **$0 marginal cost per prediction today.**

**Contingency only** — if a future LLM feature (e.g. an AI-assisted alert summarizer or chat interface) is added, sourced current pricing (checked 2026-09-16):

| Model | Input $/M tokens | Output $/M tokens | Source |
|---|---|---|---|
| Claude Haiku 4.5 | $1.00 | $5.00 | anthropic.com (official) |
| Claude Sonnet 5 | $2.00 | $10.00 | anthropic.com (official) |
| GPT-5 (base) | $1.25 | $10.00 | openai.com/api/pricing (official) |

Illustrative cost per hospital/month if a Haiku-class model summarized, say, 50 alerts/day at ~500 input + 300 output tokens each: `50 × 30 × (500×$1/1e6 + 300×$5/1e6) = 50×30×(0.0005+0.0015) = $3.00/hospital/mo`. Purely hypothetical — no such feature exists (`ASSUMPTION`, flagged in MISSING_INPUTS §2).

---

## 4. Data & Database Cost

`ASSUMPTION` (no fixed reporting interval found in code — MISSING_INPUTS §4): 1 pod reading every 5 minutes = 288 readings/day.

- Record size: ~200–300 bytes/row (5–15 fields incl. indexes) → **~86 KB/day/pod ≈ 2.6 MB/month/pod**.
- At 1,000 hospitals × 10 pods/hospital = 10,000 pods → **~26 GB/month growth**, ~312 GB/year accumulated.
- Storage cost at RDS gp3 rate ($0.115/GB-mo): 312 GB × $0.115 ≈ **$36/month by year-end at full 1,000-hospital, 10-pod scale.**

**Formula:** `monthly storage cost = accumulated GB × $0.115`. This confirms database storage is a **minor cost driver** even at full scale — hardware and personnel dominate, not data (see §17).

Backups: RDS automated snapshots are typically ~100% of DB storage size for a 7-day retention window — add another ~$36/mo at full scale as a rough doubling.

---

## 5. IoT Pod Cost (BOM)

`VERIFIED` current Indian retail component pricing (checked 2026-09-16, Robokits/ElectronicsComp/Probots/IndiaMART):

| Component | Item | Unit price | Source |
|---|---|---|---|
| MCU | ESP32 DevKitC | ₹284 | robokits.co.in |
| LoRa | SX1278 RA-02 433MHz | ₹260 | robokits.co.in |
| Sensors | pH+Temp (economy) ₹1,450 + Turbidity ₹562 + TDS ₹1,205 + DS18B20 temp probe ₹83 | **₹3,300** | robokits.co.in |
| Power | Solar 6V/1W ₹199 + 18650 Li-ion (Grade-A) ₹86 + TP4056 charger ₹20 | ₹305 | robokits.co.in, probots.co.in |
| Enclosure | IP65 ABS box (~150mm) | ₹150–450 (using ₹300 mid) | tradeindia.com |
| Misc | Cable glands + protoboard + wiring | ₹180 | indiamart.com, robocraze.com |
| **Total single-unit COGS** | | **₹4,629 (~₹4,600–4,900 range)** | recomputed from above |

**Correction to the internal ₹3,000 estimate: real single-unit COGS is ~54–63% higher, ~₹4,750 central estimate.** The sensor stack alone (₹3,300) exceeds the entire old total-COGS target — this is the dominant driver and the #1 lever for cost reduction. Casing (₹300 vs. ₹500–600 assumed) and power (₹305 vs. ₹500 assumed) were actually *overestimated* in the original brief.

**Important gap** (MISSING_INPUTS §2): the water-quality dataset the ML model actually uses includes fecal coliform and dissolved oxygen — neither is priced above, because no simple low-cost module for either was found; real-time fecal-coliform sensing in particular is a lab-grade, not IoT-grade, capability. Confirm actual sensor scope before finalizing BOM.

### Bulk economics — `ASSUMPTION` (no supplier publishes public bulk tiers; all require direct RFQ — see MISSING_INPUTS §2)

Modeled using a generic electronics-manufacturing bulk-discount curve, **not sourced for this specific BOM**:

| Qty | Modeled unit COGS | Discount |
|---|---|---|
| 1 | ₹4,750 | — |
| 10 | ₹4,500 | 5% |
| 50 | ₹4,100 | 13% |
| 100 | ₹3,800 | 20% |
| 500 | ₹3,350 | 30% |
| 1,000 | ₹3,100 | 35% |
| 5,000 | ₹2,850 | 40% |
| 10,000 | ₹2,700 | 43% (may go lower with a custom PCB integrating MCU+LoRa+sensor interface, at the cost of ₹2–5 lakh NRE — not modeled) |

**Action item:** get real RFQs from Robokits/Robu/ElectronicsComp and 1–2 China-direct suppliers (Utsource/Alibaba) at 100/500/1,000/5,000 units — this single data point moves hardware gross margin more than any other input in this audit.

---

## 6. Installation Cost

Proposed: ₹500/pod. `ASSUMPTION` reality check (Indian field-technician day rate ₹1,200–1,500 + travel ₹300–800, general market estimate — not sourced, MISSING_INPUTS §3):

**Formula:** `cost/pod = (day rate + travel) ÷ pods installed per visit`

| Pods/visit | Cost/pod |
|---|---|
| 1 (pilot/single install) | ₹1,700–2,300 |
| 5 | ₹340–460 |
| 10 | ₹170–230 |
| 50 | ₹34–46 |

**Conclusion: ₹500/pod is only realistic for batched installs of ~5+ pods per site visit.** Single-pod pilot installs cost 3–5x more. This does **not** yet include (all `ASSUMPTION`, unpriced in current model):
- LoRa gateway setup per hospital (one-time, ₹5,000–15,000 estimated — no gateway hardware appears anywhere in the codebase at all, MISSING_INPUTS §3)
- Hospital network/IT integration labor
- Staff training (2–4 hrs, ~₹1,000–2,000 value)
- Initial sensor calibration consumables (~₹100–200/pod)

---

## 7. Pod Maintenance

`ASSUMPTION` throughout (no Vector Shield field data exists yet — MISSING_INPUTS §3), based on general IoT/environmental-sensor deployment norms:

| Cost element | Annual estimate/pod | Basis |
|---|---|---|
| Technician visits (2x/year — pH sensors need recalibration every 3–6 months, a well-established property of pH electrodes) | ₹680 | same batched day-rate math as §6, 5 pods/visit |
| Replacement parts (~10%/yr failure rate × ~₹1,500 avg part cost) | ₹150 | |
| Battery (18650, ~2.5yr life) amortized | ₹34 | ₹86 ÷ 2.5 |
| Remote support/troubleshooting overhead | ₹200 | shared support staff allocation, §12 |
| **Total modeled annual maintenance/pod** | **~₹1,064** | |

= **₹266/quarter, ₹89/month/pod (modeled).**

**Vs. the proposed ₹750/quarter charge: ~2.8x headroom under current assumptions.** Even if real-world failure rates run 2–3x worse than assumed (plausible — IP65 enclosures in Indian monsoon conditions are a known failure point), ₹750/quarter likely still covers cost. This is the maintenance section's biggest confidence caveat: it's built on generic IoT-deployment norms, not measured Vector Shield data.

**Billing cadence:** quarterly billing aligns with the realistic 2x/year calibration-visit cadence — no operational reason found to require monthly billing.

---

## 8–9. Hospital Operating Cost & Multi-Tenant Scaling

Because the backend/DB is shared multi-tenant infrastructure, **most cloud/AI/DB cost is approximately fixed** (a step function that jumps at each tier upgrade), not linear per hospital. Variable per-hospital costs are: pod hardware+install+maintenance, notification volume (if built), and support time.

| Cost type | Scales how | Elements |
|---|---|---|
| Fixed (steps, ~flat per band) | Cloud compute/DB (§2), monitoring, CI/CD, domain/SSL, core engineering headcount | |
| Variable (linear per hospital or per pod) | Pod COGS (§5), installation (§6), maintenance (§7), notifications (§10), customer success time | |

### Multi-tenant scenarios (formula: `total cost = fixed infra tier cost + hospitals × pods/hospital × (pod COGS amortized + install amortized + maintenance) + hospitals × support cost`)

| Scenario | Hospitals | Pods | Fixed infra/mo | Variable/mo (hardware amortized over 3yr + maintenance + install amortized) | Total/mo | $/hospital equiv |
|---|---|---|---|---|---|---|
| A | 1 | 1 | $27 (§2a) | ₹4,750/36mo + ₹500 install/36mo + ₹266/qtr → ≈₹221/mo ≈ $2.66 | ~$30 | $30 |
| B | 5 | 5 | $27 | 5×$2.66=$13.3 | ~$40 | $8 |
| C | 25 | 25 | $165 (§2a) | 25×$2.66=$66.5 | ~$232 | $9.28 |
| D | 100 | 100 | $700 (§2b) | 100×$2.66=$266 | ~$966 | $9.66 |
| E | 500+ | 500+ | $2,500 (§2b) | 500×$2.66=$1,330 | ~$3,830 | $7.66 |

**Fixed costs falling per-hospital as scale increases (economies of scale) is the dominant effect below ~500 hospitals; past that, infra must step up to a bigger tier, temporarily raising $/hospital again until the next density threshold — classic step-function SaaS cost curve, not a smooth decline.**

---

## 10. Notification Costs

`VERIFIED`: none exist in the codebase today — this entire section is hypothetical infrastructure that would need to be built (MISSING_INPUTS notes this isn't even scoped yet). Sourced India pricing (checked 2026-09-16):

| Channel | Price | Source |
|---|---|---|
| SMS (MSG91, DLT-compliant) | ₹0.16–0.25/SMS + 18% GST, tiered by volume | msg91.com/in/pricing (official) |
| SMS (Twilio India) | $0.0832/SMS (~₹6.9) — much pricier, avoid | twilio.com (official) |
| WhatsApp Business (Meta, India) | Marketing ₹0.86/msg, Utility/Auth ₹0.115/msg + BSP fee + 18% GST | business.whatsapp.com (official rate card) |
| Email (AWS SES) | $0.10/1,000 emails | aws.amazon.com/ses/pricing (official) |
| Push (Firebase Cloud Messaging) | **Free, unlimited** | firebase.google.com/pricing (official) |

**Cheapest reliable architecture:** FCM push (free) for in-app-installed users + WhatsApp Utility-template for critical outbreak alerts (₹0.115/msg, far cheaper than SMS, high open rate in India) + SES email as fallback. Avoid Twilio SMS for India traffic.

| Notifications/month | SMS-only cost | WhatsApp Utility cost | Email (SES) cost |
|---|---|---|---|
| 100 | ₹16–25 | ₹12 | ₹0.83 (~$0.01) |
| 1,000 | ₹160–250 | ₹115 | ₹8.3 |
| 10,000 | ₹1,600–2,500 | ₹1,150 | ₹83 |
| 100,000 | ₹16,000–25,000 | ₹11,500 | ₹830 |

---

## 11. Security & Compliance Costs

| Requirement | Status | Notes |
|---|---|---|
| DPDP Act 2023 | **Required** if any data is linkable to an identifiable individual | Rules gazetted Nov 13 2025, phased commencement through May 2027. Source: PIB/MeitY (official). Applicability to facility-level-only water data is ambiguous — MISSING_INPUTS §6 |
| CDSCO medical device classification | **Potentially required** — ambiguous | Not a patient-contact/diagnostic device on its face, but CDSCO classification is intent/claims-based; flag for legal review if outputs drive clinical decisions. Source: cdsco.gov.in |
| DISHA (Digital Information Security in Healthcare Act) | **Not applicable** — never enacted, remained a draft bill, subsumed into the DPDP framework | Source: PIB (official), sflc.in |
| ISO 27001 | **Recommended**, not legally required — common hospital-procurement trust signal | ~₹3–8 lakh (`ASSUMPTION`) for a first certification, not currently sourced this session |
| SOC 2 | **Not applicable / not typical for India-only sales** — relevant only if selling to US-based health systems | |
| WAF, secrets management, backups | **Recommended technical baseline** regardless of certification status | AWS WAF ~$5/mo + $1/rule-hour (§2 pricing); backups costed in §4 |

Separate technical infra cost (WAF, encryption, backups — priced in §2/§4) from certification/legal cost (audit fees, consultant retainers — not currently budgeted, MISSING_INPUTS §6).

---

## 12. Human Operational Costs

`ASSUMPTION` — general Indian startup salary-band knowledge, not freshly sourced this session (MISSING_INPUTS §7). Company-level, not per-hospital.

| Stage | Hospitals | Team | Illustrative annual cost |
|---|---|---|---|
| Early | 1–10 | Founders + 1 backend eng + 1 part-time IoT technician (contractor) | ₹15–25 lakh/yr beyond founders |
| Growth | 10–100 | + ML engineer, DevOps, 2–3 customer success, 2 IoT technicians, 1 sales lead | ₹80 lakh–1.2 crore/yr |
| Scale | 100–1,000 | ~20–30 people incl. regional IoT technician network, dedicated compliance/legal retainer | ₹3–5 crore/yr |

**Company-level personnel cost must be allocated across the hospital base to get "fully loaded" per-hospital cost** — see §13.

---

## 13–14. Cost Per Hospital & Unit Economics

**Variable cost/hospital/month** (cloud+AI+DB+storage+notifications+maintenance allocation, excludes company personnel):
`= (fixed infra tier / hospital count) + (pods/hospital × pod monthly cost incl. amortized hardware+install+maintenance) + notification volume cost`

| Hospitals | Variable $/hospital/mo |
|---|---|
| 1 | ~$30 |
| 10 | ~$9 |
| 100 | ~$10 |
| 1,000 | ~$8 (`ASSUMPTION`, extrapolated from §9 Scenario E) |

**Fully loaded cost/hospital/month** = variable cost + (annual personnel cost ÷ 12 ÷ hospital count):

| Stage | Personnel/mo | Hospitals | Personnel $/hospital (`ASSUMPTION`, $1=₹83) | + Variable | **Fully loaded** |
|---|---|---|---|---|---|
| Early (10) | ₹1.7 lakh (~$205) | 10 | $20.5 | $9 | **~$30/hospital/mo** |
| Growth (100) | ₹8.3 lakh (~$1,000) | 100 | $10 | $10 | **~$20/hospital/mo** |
| Scale (1,000) | ₹33 lakh (~$4,000) | 1,000 | $4 | $8 | **~$12/hospital/mo** |

Hardware unit economics (per pod, `VERIFIED` BOM + `ASSUMPTION` field costs):

| Item | One-time | Recurring |
|---|---|---|
| Pod COGS | ₹4,750 (single unit) → ₹3,100 at 1,000 units | — |
| Installation | ₹500 (batched) – ₹2,300 (single) | — |
| **Total initial deployment/pod** | **₹5,250–7,050 (single-unit pricing)** | |
| Maintenance | — | ₹266/quarter (₹1,064/yr) modeled |

---

## 15. Pricing Simulation

Using fully-loaded cost/hospital at the **Growth stage (~$20/hospital/mo ≈ ₹1,660/mo)** as the reference cost baseline, plus hardware economics from §14:

| Model | Price/hospital/mo | Gross profit/hospital/mo | Gross margin | Notes |
|---|---|---|---|---|
| **A — Low penetration** | ₹1,000 (~$12) | ₹1,000 − ₹1,660 = **−₹660** | **Negative** | Below fully-loaded cost at Growth stage; only viable at Scale-stage cost (~$12/hosp ≈ ₹1,000) where it roughly breaks even — thin, no margin for hardware/CAC recovery |
| **B — Sustainable** | ₹2,500 (~$30) | ₹2,500 − ₹1,660 = **₹840** | **~34%** | Reasonable SaaS-adjacent margin once hardware is priced/billed separately |
| **C — Premium healthcare** | ₹5,000 (~$60) | ₹5,000 − ₹1,660 = **₹3,340** | **~67%** | Enterprise/clinical-decision-support positioning; needs a justified value story (outbreak prevention ROI) to defend vs. ₹4,500 Pro tier already in the brief |

**Break-even point (hospitals needed to cover Growth-stage fixed personnel ₹8.3 lakh/mo):**
`= fixed monthly cost ÷ gross profit per hospital`
- Model A: not achievable (negative margin)
- Model B: ₹8,30,000 ÷ ₹840 ≈ **988 hospitals**
- Model C: ₹8,30,000 ÷ ₹3,340 ≈ **249 hospitals**

**Payback period on hardware** (pod COGS + install, assuming SaaS fee alone repays hardware, ignoring maintenance revenue):
`= (COGS + install) ÷ monthly gross profit`
- Model B: ₹5,250 ÷ ₹840 ≈ **6.3 months**
- Model C: ₹5,250 ÷ ₹3,340 ≈ **1.6 months**

---

## 16. Test Current Proposed Pricing

### Brief's proposed structure (₹)

| Tier | Price | vs. fully-loaded cost (~₹1,660/mo at Growth stage) | Margin |
|---|---|---|---|
| Starter ₹1,000/mo | Below cost | **Negative (~−66%)** | Loses money per hospital at Growth-stage cost structure; only breaks even once cost falls to Scale-stage (~₹1,000/mo) |
| Additional hospital ₹500/mo | Far below cost | **Deeply negative** unless this reflects true marginal cost only (no support/CS allocation) — plausible if "additional hospital" under one org shares the fixed cost of the first, but even the ~$9–10 pure variable cost (§13) exceeds ₹500 (~$6) | |
| Pro ₹4,500/mo (5-hospital min ≈ ₹900/hospital) | Above Scale-stage cost, below Growth-stage cost | **Marginal to positive** depending on stage | |
| Hardware ₹3,000 COGS assumed | **Understated by ~54–63%** — real COGS ~₹4,750 (§5) | | |
| Installation ₹500/pod | **Realistic only for batched (5+) installs**, 3–5x too low for single-pod deployments (§6) | | |
| Maintenance ₹750/quarter | **~2.8x the modeled ₹266/quarter cost** — healthy headroom under current assumptions (§7) | | |

### Live code's pricing (frontend, USD)

| Tier | Price | Assessment |
|---|---|---|
| Starter $0/mo | Free tier, no margin question — presumably a lead-gen/pilot tier, not meant to cover cost | |
| Professional $249/mo (≈₹20,700) | **Comfortably covers fully-loaded cost at every modeled stage** (~$20–30/hospital) — large margin (~85%+), likely undershooting on volume/positioning rather than margin risk | |
| Enterprise Custom | Not assessable without a number | |

**Bottom line: the SaaS/subscription price (₹4,500 Pro tier, or the $249 web price) is not the risk — it's the ₹1,000 Starter tier and the ₹3,000 hardware/₹500-install/₹750-maintenance hardware bundle that need revisiting**, since real hardware COGS is ~58% higher than assumed and the Starter SaaS price sits below fully-loaded cost until the company reaches meaningful scale.

---

## 17. Economies of Scale

**Hardware COGS by volume** (§5): ₹4,750 (qty 1) → ₹3,100 (qty 1,000) → ₹2,700 (qty 10,000), a **~43% reduction** at full scale — `ASSUMPTION`, needs real RFQs.

**Software infra $/hospital** (§9): $30 (1 hospital) → ~$8 (5–10) → ~$7–9 (25–100, before AWS migration) → ~$5–8 (500–1,000, after AWS migration) — **cloud cost/hospital falls sharply in the first 10–25 hospitals, then plateaus with step-jumps at each infra-tier upgrade.**

| Transition point | What happens |
|---|---|
| ~10–25 hospitals | Free-tier DB/hosting limits exhausted; must move to paid Render/Neon tiers |
| ~50–100 hospitals | Managed-PaaS stack becomes cost-inefficient vs. AWS; migration point for infra |
| ~10 hospitals | First IoT technician hire becomes justified vs. ad hoc contractor visits |
| ~50–100 hospitals | Dedicated customer success role justified |
| ~100+ hospitals | Multi-AZ/HA database, WAF, and formal monitoring become operationally necessary (uptime SLA exposure) |
| ~500+ hospitals (govt/network scale) | Regional technician network or local installation-partner model likely needed; single-city technician coverage no longer sufficient |

---

## 18. Investor Metrics (illustrative — `ASSUMPTION`, see MISSING_INPUTS §7 for CAC/GTM gaps)

| Metric | Formula | Illustrative value (Model B, ₹2,500/mo) |
|---|---|---|
| MRR (100 hospitals) | price × hospitals | ₹2,50,000 |
| ARR (100 hospitals) | MRR × 12 | ₹30,00,000 |
| Hardware revenue (100 pods) | COGS+margin — not separately priced in brief; if hardware sold at cost+20%: ₹3,800×1.2 | ₹4,56,000 one-time |
| SaaS revenue (100 hosp/yr) | ARR above | ₹30,00,000 |
| Maintenance revenue (100 pods/yr) | ₹750×4×100 | ₹3,00,000 |
| ARPU (avg revenue/hospital/mo) | SaaS + amortized hardware + maintenance | ~₹2,750 |
| Gross margin | (revenue − COGS) / revenue, Growth stage | ~34% (§15) |
| LTV (simple, 3yr avg tenure `ASSUMPTION`) | ARPU × gross margin% × 36mo | ₹2,750×0.34×36 ≈ ₹33,660 |
| CAC | **Not derivable from repo — no sales/marketing spend data exists** | `MISSING INPUT` |
| LTV/CAC | Cannot compute without CAC | `MISSING INPUT` |
| Break-even hospitals (Growth stage, Model B) | §15 | ~988 |
| Break-even pods | ≈ break-even hospitals × pods/hospital (1) | ~988 |
| Payback period (hardware) | §15 | ~6.3 months (Model B) |

---

## 19. Three-Year Simulation (illustrative, growth rates are placeholders — `ASSUMPTION`, flag for real GTM input)

| Year | Hospitals (conservative/base/aggressive) | Pods | MRR (Model B, ₹2,500) | ARR | Gross profit/mo (Model B) |
|---|---|---|---|---|---|
| Year 1 | 5 / 10 / 25 | = hospitals | ₹12,500 / ₹25,000 / ₹62,500 | ₹1.5L / ₹3L / ₹7.5L | Negative — below Early-stage fixed cost (§12) at all three |
| Year 2 | 25 / 75 / 200 | = hospitals | ₹62,500 / ₹1,87,500 / ₹5,00,000 | ₹7.5L / ₹22.5L / ₹60L | Approaching break-even in aggressive case only |
| Year 3 | 75 / 300 / 800 | = hospitals | ₹1,87,500 / ₹7,50,000 / ₹20,00,000 | ₹22.5L / ₹90L / ₹2.4Cr | Base/aggressive cases clear the ~988-hospital break-even threshold only in aggressive Year 3+ |

**These growth numbers are placeholders, not a GTM forecast** — the repo has zero real customer-acquisition data to anchor them. Treat this table as a structure to fill in once the company has a sales pipeline, not a prediction.

---

## 20. Assumption Sheet & Sources — see [MISSING_INPUTS.md](../MISSING_INPUTS.md)

Every `ASSUMPTION` tag above is indexed there by topic, with what real input would replace it.
