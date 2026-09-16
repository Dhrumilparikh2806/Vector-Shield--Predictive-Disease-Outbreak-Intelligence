# Missing Inputs — Vector Shield Cost & Unit Economics Audit

The audit in [docs/COST_AUDIT.md](docs/COST_AUDIT.md) is built from two kinds of numbers:
1. **Verified** — read directly from the codebase, or from a live, sourced, dated external price.
2. **Modeled/assumed** — reasoned estimates used to fill gaps, clearly labeled `ASSUMPTION` in the audit.

Everything below is a gap the model currently fills with an assumption. Providing real numbers for these will materially improve accuracy — roughly in priority order.

## 1. Business reality check (blocks everything downstream)
- **Which pricing structure is authoritative?** The live code (`frontend/src/pages/PricingPage.jsx`) shows Starter $0 / Professional $249 / Enterprise Custom. The audit brief describes Starter ₹1,000/hospital, Pro ₹4,500 (5-hospital minimum), Pro Max, Enterprise. These are two different, currently-conflicting pricing schemes. Which one is real / current?
- **Does Vector Shield have any paying customers or live pod deployments today?** The codebase shows only demo/investor tenant accounts (`backend/auth.py`) and no billing integration (no Stripe/payment code). If there are zero real deployments, every "cost at N hospitals" figure in the audit is a forward projection, not a measurement — worth stating explicitly to any investor/board reading the summary.
- Currency for the whole model: is the company pricing in INR, USD, or both by segment (domestic vs. NRI/international hospital chains)? The audit uses an assumed FX rate of **$1 = ₹83** — confirm current rate.

## 2. Hardware BOM & manufacturing
- **Real supplier quotes at volume.** No supplier (Robu, Robokits, ElectronicsComp) publishes public bulk pricing for the LoRa module, MCU, or sensor set — every one requires a direct B2B/RFQ conversation. The bulk-discount curve in the audit (§17) is a **generic industry heuristic, not sourced for this BOM** — this is the single biggest lever on hardware gross margin and needs real quotes at 50/500/1,000/5,000/10,000 units.
- **Final sensor spec.** The repo's water-quality dataset (pH, turbidity, fecal coliform, residual chlorine, dissolved oxygen, temperature) is *not* currently wired to any live sensor — it's imported from static CSVs. If pods are meant to sense all of these in real time, fecal-coliform and dissolved-oxygen sensors are the expensive/hard ones (lab-grade equipment, not a $5 module) and are **not priced in the current BOM at all**. Confirm which of the 6 water parameters the physical pod is actually meant to measure.
- Whether a custom PCB (combining MCU+LoRa+sensor interface) is planned at scale — this changes COGS materially past ~1,000 units but requires NRE (non-recurring engineering) spend not modeled here.
- Enclosure exact size/spec (IP65 vs IP67, dimensions) — priced as a range (₹150–450) pending a real spec.

## 3. Field operations
- **Real Indian field-technician day rates and travel cost** for install/maintenance — the audit uses a general-market estimate (₹1,200–1,500/day + ₹300–800 travel), not a sourced figure.
- **How many pods get installed per site visit?** This single number swings per-pod install/maintenance cost by 3–5x (batched vs. single-pod visits).
- **LoRa gateway requirement per hospital** — does each hospital need a dedicated LoRa gateway/concentrator, or does Vector Shield operate shared regional gateways? No gateway hardware or cost appears anywhere in the repo.
- **Actual sensor calibration interval and failure/replacement rate** — the audit assumes pH-sensor drift requires calibration every 3–6 months and ~10%/year hardware failure, based on general IoT-deployment norms, not Vector Shield field data (none exists yet).

## 4. Product/traffic assumptions
- **Expected data volume per pod** — how often does a pod report (interval in seconds/minutes)? `backend/arduino_listener.py` has no fixed interval in the reviewed code path; the audit assumes one reading every 5 minutes as a placeholder.
- **Expected dashboard/API request volume per hospital** (page loads, polling frequency) — this drives compute/instance sizing at scale, and there's no load-test or production-traffic data since the product has no live users.
- **Number of pods per hospital in a typical deployment** — pricing brief assumes 1 pod/hospital; real epidemiological coverage of a hospital catchment area may need more.

## 5. Cloud/infra decisions not yet made
- Whether the company intends to stay on the current Render+Neon+Vercel stack indefinitely or migrate to AWS at scale — the audit models both, but AWS instance sizing (§2) is illustrative (no real traffic to size against).
- **Neon/Supabase paid-tier pricing was not independently verified this session** — flagged as unsourced in the audit; check neon.tech/pricing or supabase.com/pricing directly.
- Confirm whether **Vercel's free Hobby tier is actually permitted for this commercial use** — Vercel's terms restrict the free tier to non-commercial use; if Vector Shield is selling subscriptions, a Vercel Pro plan (~$20/mo/seat) is likely required. This wasn't something the codebase could answer.

## 6. Compliance
- Whether any data Vector Shield stores is legally "personal data" under India's DPDP Act (i.e., is any water/sensor reading ever linked to an identifiable patient, or is it facility-level only?) — this determines whether DPDP obligations apply in full.
- Whether CDSCO would classify the product as a medical device if outbreak-risk outputs are used in clinical decision-making — flagged as ambiguous by research; needs a regulatory consultant, not derivable from search.
- Target certifications (ISO 27001, SOC 2) and timeline — these have real cost (audit + consultant fees, typically ₹3–8 lakh for a first ISO 27001 cert) not included in the current model since no target was given.

## 7. Team & go-to-market
- Actual/planned headcount, salaries, and hiring timeline — §12 of the audit uses generic Indian startup salary bands (general market knowledge, not sourced this session).
- Sales motion and CAC assumptions — how hospitals are actually acquired (direct sales, government tender, channel partner) drastically changes CAC; the audit uses an illustrative placeholder.
- Existing runway/funding stage — needed to judge whether the 3-year growth scenarios in the audit are realistic for this company specifically.

---
**How to use this file:** each item above is also called out inline in `docs/COST_AUDIT.md` as `ASSUMPTION:` or `VERIFY:`. Replacing these with real numbers and re-running the model will tighten the pricing recommendation significantly — the current recommendation should be read as a *directionally correct range*, not a final price.
