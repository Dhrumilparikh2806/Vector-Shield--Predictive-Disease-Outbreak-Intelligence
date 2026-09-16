"""
Single source of truth for city/branch -> [lat, lng] used by ml_engine.py (training)
and the live simulation. Extending the roster here is enough to make a new
location show up correctly placed on every map in the app.
"""

# Original pilot dataset (16 cities)
DEFAULT_CITIES = {
    'Delhi': [28.6139, 77.2090],
    'New Delhi': [28.6139, 77.2090],
    'Mumbai': [19.0760, 72.8777],
    'Chennai': [13.0827, 80.2707],
    'Kolkata': [22.5726, 88.3639],
    'Bengaluru': [12.9716, 77.5946],
    'Bangalore': [12.9716, 77.5946],
    'Hyderabad': [17.3850, 78.4867],
    'Pune': [18.5204, 73.8567],
    'Jaipur': [26.9124, 75.7873],
    'Lucknow': [26.8467, 80.9462],
    'Nagpur': [21.1458, 79.0882],
    'Kochi': [9.9312, 76.2673],
    'Varanasi': [25.3176, 82.9739],
    'Vellore': [12.9165, 79.1325],
    'Puducherry': [11.9416, 79.8083],
    'Gurugram': [28.4595, 77.0266],
    'Chandigarh': [30.7333, 76.7794],
}

# "National Government Hospital Network" tenant — broad, real spread across
# every region of India (north/south/east/west/northeast/central) so the map
# genuinely reads as a pan-India government network, not a cluster.
GOVERNMENT_CITIES = {
    'Bhopal': [23.2599, 77.4126],
    'Indore': [22.7196, 75.8577],
    'Patna': [25.5941, 85.1376],
    'Ranchi': [23.3441, 85.3096],
    'Raipur': [21.2514, 81.6296],
    'Bhubaneswar': [20.2961, 85.8245],
    'Guwahati': [26.1445, 91.7362],
    'Dehradun': [30.3165, 78.0322],
    'Shimla': [31.1048, 77.1734],
    'Panaji': [15.4909, 73.8278],
    'Imphal': [24.8170, 93.9368],
    'Agartala': [23.8315, 91.2868],
    'Shillong': [25.5788, 91.8933],
    'Itanagar': [27.0844, 93.6053],
    'Gangtok': [27.3389, 88.6065],
    'Aizawl': [23.7271, 92.7176],
    'Kohima': [25.6751, 94.1086],
    'Srinagar': [34.0837, 74.7973],
    'Jammu': [32.7266, 74.8570],
    'Thiruvananthapuram': [8.5241, 76.9366],
    'Coimbatore': [11.0168, 76.9558],
    'Surat': [21.1702, 72.8311],
    'Ahmedabad': [23.0225, 72.5714],
    'Amritsar': [31.6340, 74.8723],
    'Ludhiana': [30.9010, 75.8573],
    'Visakhapatnam': [17.6868, 83.2185],
    'Bhilai': [21.2090, 81.4285],
    'Jodhpur': [26.2389, 73.0243],
}

# "Meridian Health Network" tenant — a large fictional private chain (deliberately
# not naming a real hospital group here — see conversation for why). 100 branches,
# built as several branches per metro so they scatter realistically around each city.
_MERIDIAN_METROS = {
    'Mumbai': [19.0760, 72.8777],
    'Delhi': [28.6139, 77.2090],
    'Bengaluru': [12.9716, 77.5946],
    'Chennai': [13.0827, 80.2707],
    'Hyderabad': [17.3850, 78.4867],
    'Pune': [18.5204, 73.8567],
    'Kolkata': [22.5726, 88.3639],
    'Ahmedabad': [23.0225, 72.5714],
    'Jaipur': [26.9124, 75.7873],
    'Lucknow': [26.8467, 80.9462],
    'Chandigarh': [30.7333, 76.7794],
    'Kochi': [9.9312, 76.2673],
    'Nagpur': [21.1458, 79.0882],
    'Indore': [22.7196, 75.8577],
    'Surat': [21.1702, 72.8311],
    'Bhopal': [23.2599, 77.4126],
    'Coimbatore': [11.0168, 76.9558],
    'Visakhapatnam': [17.6868, 83.2185],
    'Patna': [25.5941, 85.1376],
    'Guwahati': [26.1445, 91.7362],
}
_MERIDIAN_LOCALITIES = ['Central', 'North', 'South', 'East', 'West']


def _build_meridian_branches():
    """5 branches x 20 metros = 100 uniquely-named, uniquely-placed locations."""
    import hashlib
    branches = {}
    for city, (lat, lng) in _MERIDIAN_METROS.items():
        for locality in _MERIDIAN_LOCALITIES:
            label = f"{city} - {locality}"
            # Deterministic small jitter (~2-8km) so branches scatter around the metro
            # instead of stacking on the exact same point.
            digest = hashlib.md5(label.encode('utf-8')).digest()
            jitter_lat = ((digest[0] / 255.0) - 0.5) * 0.16
            jitter_lng = ((digest[1] / 255.0) - 0.5) * 0.16
            branches[label] = [round(lat + jitter_lat, 4), round(lng + jitter_lng, 4)]
    return branches


MERIDIAN_BRANCHES = _build_meridian_branches()

# "Ram Dayal Hospital" tenant — a single-facility hospital in one town.
RAMDAYAL_CITIES = {
    'Sitapur': [27.5667, 80.6833],
}

GEO_MAPPING = {
    **DEFAULT_CITIES,
    **GOVERNMENT_CITIES,
    **MERIDIAN_BRANCHES,
    **RAMDAYAL_CITIES,
}

# India's geographic center, used as a fallback for any name not in the map above.
FALLBACK_COORDS = [20.5937, 78.9629]
