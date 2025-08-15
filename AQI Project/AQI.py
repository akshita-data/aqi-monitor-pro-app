import math
import random
import time
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError

# --- Constants and Configuration ---

# Approximate geographical range for India
INDIA_LAT_MIN = 10.0
INDIA_LAT_MAX = 30.0
INDIA_LON_MIN = 70.0
INDIA_LON_MAX = 90.0

# Base GPS coordinates (approximate center of India for initial drone placement)
BASE_LAT = 23.0
BASE_LON = 79.0

# Updated Fictional hotspot locations focused on main cities across various Indian regions
HOTSPOTS = {
    "Delhi (National Capital Region)": {"lat": 28.61, "lon": 77.20, "impact_factor": 1.8},
    "Mumbai (Maharashtra)": {"lat": 19.07, "lon": 72.87, "impact_factor": 1.9},
    "Bengaluru (Karnataka)": {"lat": 12.97, "lon": 77.59, "impact_factor": 1.85},
    "Kolkata (West Bengal)": {"lat": 22.57, "lon": 88.36, "impact_factor": 1.75},
    "Chennai (Tamil Nadu)": {"lat": 13.08, "lon": 80.27, "impact_factor": 1.7},
    "Hyderabad (Telangana)": {"lat": 17.38, "lon": 78.48, "impact_factor": 1.65},
    "Ahmedabad (Gujarat)": {"lat": 23.02, "lon": 72.57, "impact_factor": 1.6},
    "Pune (Maharashtra)": {"lat": 18.52, "lon": 73.85, "impact_factor": 1.55},
    "Lucknow (Uttar Pradesh)": {"lat": 26.84, "lon": 80.94, "impact_factor": 1.4},
    "Jaipur (Rajasthan)": {"lat": 26.91, "lon": 75.78, "impact_factor": 1.35},
    "Bhubaneswar (Odisha)": {"lat": 20.29, "lon": 85.82, "impact_factor": 1.45},
    "Kochi (Kerala)": {"lat": 9.93, "lon": 76.26, "impact_factor": 1.3},
    "Patna (Bihar)": {"lat": 25.59, "lon": 85.13, "impact_factor": 1.4},
    "Chandigarh (Punjab/Haryana)": {"lat": 30.73, "lon": 76.77, "impact_factor": 1.35},
    "Bhopal (Madhya Pradesh)": {"lat": 23.25, "lon": 77.41, "impact_factor": 1.25},
    "Guwahati (Assam)": {"lat": 26.18, "lon": 91.73, "impact_factor": 1.2}
}

# Radius (in degrees) within which a hotspot influences pollution readings.
HOTSPOT_RADIUS_DEG = 0.01  # ~1.1 km

# Realistic normal ranges for various pollution parameters
POLLUTANT_NORMAL_RANGES = {
    "PM2.5": {"min": 10, "max": 70},
    "PM10": {"min": 20, "max": 150},
    "CO": {"min": 0.5, "max": 5.0},
    "NO2": {"min": 10, "max": 80},
    "SO2": {"min": 5, "max": 50}
}

# CPCB AQI Breakpoints
AQI_BREAKPOINTS_CPCB = {
    "PM2.5": [
        (0, 50, 0, 30),
        (51, 100, 31, 60),
        (101, 200, 61, 90),
        (201, 300, 91, 120),
        (301, 400, 121, 250),
        (401, 500, 251, 500)
    ],
    "PM10": [
        (0, 50, 0, 50),
        (51, 100, 51, 100),
        (101, 200, 101, 250),
        (201, 300, 251, 350),
        (301, 400, 351, 430),
        (401, 500, 431, 1000)
    ],
    "CO": [
        (0, 50, 0.0, 1.0),
        (51, 100, 1.1, 2.0),
        (101, 200, 2.1, 10.0),
        (201, 300, 10.1, 17.0),
        (301, 400, 17.1, 34.0),
        (401, 500, 34.1, 50.0)
    ],
    "NO2": [
        (0, 50, 0, 40),
        (51, 100, 41, 80),
        (101, 200, 81, 180),
        (201, 300, 181, 280),
        (301, 400, 281, 400),
        (401, 500, 401, 800)
    ],
    "SO2": [
        (0, 50, 0, 40),
        (51, 100, 41, 80),
        (101, 200, 81, 380),
        (201, 300, 381, 800),
        (301, 400, 801, 1600),
        (401, 500, 1601, 2000)
    ]
}

# Drone movement parameters
DRONE_SPEED_DEG_PER_STEP = 0.005
SIMULATION_INTERVAL_SEC = 0.3

# Initialize Nominatim geolocator for reverse geocoding
geolocator = Nominatim(user_agent="drone_aqi_simulator_india")

# --- Console Color Helpers (ANSI) ---

RESET = "\033[0m"
BOLD = "\033[1m"
RED = "\033[31m"
YELLOW = "\033[33m"
GREEN = "\033[32m"
MAGENTA = "\033[35m"
CYAN = "\033[36m"

def color_for_aqi(aqi):
    if 0 <= aqi <= 50:
        return GREEN
    elif 51 <= aqi <= 100:
        return CYAN
    elif 101 <= aqi <= 200:
        return YELLOW
    elif 201 <= aqi <= 300:
        return MAGENTA
    else:
        return RED

def warning_for_aqi(aqi):
    # Consider "high AQI" as Poor or worse: AQI>=201
    if aqi >= 201:
        return f"{BOLD}{RED}⚠ HIGH AQI AREA!{RESET}"
    return ""

# --- Utility Functions ---

def calculate_euclidean_distance(lat1, lon1, lat2, lon2):
    return math.sqrt((lat2 - lat1)**2 + (lon2 - lon1)**2)

def calculate_sub_index(Cp, pollutant_breakpoints):
    for ILo, IHi, BPLo, BPHi in pollutant_breakpoints:
        if BPLo <= Cp <= BPHi:
            if BPHi == BPLo:
                return ILo
            Ip = ((IHi - ILo) / (BPHi - BPLo)) * (Cp - BPLo) + ILo
            return round(Ip)
    if Cp < pollutant_breakpoints[0][2]:
        return pollutant_breakpoints[0][0]
    else:
        return pollutant_breakpoints[-1][1]

def get_pollution_values(latitude, longitude):
    pollution_data = {}
    current_impact_factor = 1.0

    for hotspot_name, hotspot_info in HOTSPOTS.items():
        dist = calculate_euclidean_distance(latitude, longitude,
                                            hotspot_info["lat"], hotspot_info["lon"])
        if dist < HOTSPOT_RADIUS_DEG:
            distance_ratio = 1 - (dist / HOTSPOT_RADIUS_DEG)
            impact_from_this_hotspot = 1 + (hotspot_info["impact_factor"] - 1) * distance_ratio
            current_impact_factor *= impact_from_this_hotspot
            current_impact_factor += random.uniform(-0.05, 0.1)

    pollutant_concentrations = {}
    for pollutant, ranges in POLLUTANT_NORMAL_RANGES.items():
        base_min, base_max = ranges["min"], ranges["max"]
        value = random.uniform(base_min, base_max) * current_impact_factor
        value += random.uniform(-value * 0.05, value * 0.05)

        if pollutant == "PM2.5": value = max(0.0, min(value, 550.0))
        elif pollutant == "PM10": value = max(0.0, min(value, 1100.0))
        elif pollutant == "CO": value = max(0.0, min(value, 60.0))
        elif pollutant == "NO2": value = max(0.0, min(value, 900.0))
        elif pollutant == "SO2": value = max(0.0, min(value, 2100.0))

        pollutant_concentrations[pollutant] = value
        pollution_data[pollutant] = value

    sub_indices = {}
    for pollutant, breakpoints in AQI_BREAKPOINTS_CPCB.items():
        if pollutant in pollutant_concentrations:
            sub_indices[pollutant] = calculate_sub_index(pollutant_concentrations[pollutant], breakpoints)

    overall_aqi = 0
    if (len(sub_indices) >= 3 and ("PM2.5" in sub_indices or "PM10" in sub_indices)):
        overall_aqi = max(sub_indices.values()) if sub_indices else 0
    else:
        overall_aqi = 0

    # AQI category aligned to the breakpoints scale used above
    if 0 <= overall_aqi <= 50:
        aqi_category = "Good"
    elif 51 <= overall_aqi <= 100:
        aqi_category = "Satisfactory"
    elif 101 <= overall_aqi <= 200:
        aqi_category = "Moderate"
    elif 201 <= overall_aqi <= 300:
        aqi_category = "Poor"
    elif 301 <= overall_aqi <= 400:
        aqi_category = "Very Poor"
    else:
        aqi_category = "Severe"

    pollution_data["AQI"] = int(overall_aqi)
    pollution_data["AQI_Category"] = aqi_category

    return pollution_data

def get_location_name(latitude, longitude):
    try:
        location = geolocator.reverse((latitude, longitude), timeout=5)
        if location:
            return location.address
        else:
            return "Unknown Location"
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        return f"Location lookup failed: {e}"
    except Exception as e:
        return f"An unexpected error occurred during location lookup: {e}"

# --- Drone Class ---

class Drone:
    def __init__(self, start_lat, start_lon, speed):
        self.latitude = start_lat
        self.longitude = start_lon
        self.speed = speed

    def get_current_location(self):
        return self.latitude, self.longitude

    def move_to(self, target_lat, target_lon):
        current_lat, current_lon = self.get_current_location()
        dist = calculate_euclidean_distance(current_lat, current_lon, target_lat, target_lon)
        if dist < self.speed:
            self.latitude = target_lat
            self.longitude = target_lon
            return True
        dx = target_lon - current_lon
        dy = target_lat - current_lat
        if dist > 0:
            norm_dx = dx / dist
            norm_dy = dy / dist
        else:
            return True
        self.longitude += self.speed * norm_dx
        self.latitude += self.speed * norm_dy
        return False

# --- Helpers for Summary/City Extraction ---

def extract_city_from_address(address: str) -> str:
    # Try to pull a concise city/locality from the full address string
    # Strategy: take first 1-2 segments before the first comma-heavy region
    # This is heuristic and may be adjusted per need.
    if not address or "Location lookup failed" in address or "An unexpected error" in address:
        return "Unknown"
    parts = [p.strip() for p in address.split(",")]
    if len(parts) == 0:
        return "Unknown"
    # Prefer the first two parts if sensible
    if len(parts) >= 2:
        return f"{parts[0]}, {parts[1]}"
    return parts[0]

# --- Main Simulation ---

def main():
    print("--- Drone AQI Monitoring Simulation Across India ---")

    num_waypoints = 15
    waypoints = []
    for i in range(num_waypoints):
        lat = random.uniform(INDIA_LAT_MIN, INDIA_LAT_MAX)
        lon = random.uniform(INDIA_LON_MIN, INDIA_LON_MAX)
        waypoints.append((lat, lon))

    drone = Drone(start_lat=BASE_LAT, start_lon=BASE_LON, speed=DRONE_SPEED_DEG_PER_STEP)

    print(f"Starting at Lat: {drone.latitude:.4f}, Lon: {drone.longitude:.4f}")
    print(f"Hotspot Locations (Influence Radius: {HOTSPOT_RADIUS_DEG:.4f} degrees, approx {HOTSPOT_RADIUS_DEG * 111.0:.2f} km):")
    for name, loc in HOTSPOTS.items():
        print(f"  - {name}: Lat={loc['lat']:.4f}, Lon={loc['lon']:.4f}, Impact Factor: {loc['impact_factor']:.1f}x")

    print("\n--- Initiating Drone Flight Across India ---")

    waypoint_index = 0
    step_count = 0
    all_aqi_observations = []

    while waypoint_index < len(waypoints):
        target_lat, target_lon = waypoints[waypoint_index]
        arrived = drone.move_to(target_lat, target_lon)
        current_lat, current_lon = drone.get_current_location()

        current_location_name = get_location_name(current_lat, current_lon)
        pollution_readings = get_pollution_values(current_lat, current_lon)

        observation = {
            "aqi": pollution_readings["AQI"],
            "category": pollution_readings["AQI_Category"],
            "location": current_location_name,
            "city": extract_city_from_address(current_location_name),
            "lat": current_lat,
            "lon": current_lon
        }
        all_aqi_observations.append(observation)

        aqi = pollution_readings['AQI']
        aqi_cat = pollution_readings['AQI_Category']
        col = color_for_aqi(aqi)
        warn = warning_for_aqi(aqi)

        print(f"\nStep: {step_count}")
        print(f"Location: {current_location_name} (Lat={current_lat:.4f}, Lon={current_lon:.4f})")
        print(f"Target Waypoint {waypoint_index + 1}: Lat={target_lat:.4f}, Lon={target_lon:.4f}")
        print(f"  AQI: {col}{BOLD}{aqi}{RESET} ({col}{aqi_cat}{RESET}) {warn}")
        # Highlight individual pollutants if they are very high (simple cues)
        def fmt_val(label, val, unit):
            return f"{label}: {val:.2f} {unit}"
        print(f"  {fmt_val('PM2.5', pollution_readings['PM2.5'], 'µg/m³')}")
        print(f"  {fmt_val('PM10',  pollution_readings['PM10'],  'µg/m³')}")
        print(f"  {fmt_val('CO',    pollution_readings['CO'],    'mg/m³')}")
        print(f"  {fmt_val('NO2',   pollution_readings['NO2'],   'µg/m³')}")
        print(f"  {fmt_val('SO2',   pollution_readings['SO2'],   'µg/m³')}")

        if arrived:
            print(f"--- Arrived at Waypoint {waypoint_index + 1} ---")
            waypoint_index += 1
            if waypoint_index < len(waypoints):
                print(f"Moving to next waypoint: Lat={waypoints[waypoint_index][0]:.4f}, Lon={waypoints[waypoint_index][1]:.4f}")
            else:
                print("--- All waypoints visited. Simulation complete. ---")
                break

        step_count += 1
        time.sleep(SIMULATION_INTERVAL_SEC)

    # --- AQI Report Section (Printed after simulation completes) ---
    print("\n" + "="*30)
    print("        AQI Report Summary")
    print("="*30)

    if all_aqi_observations:
        best_aqi_obs = min(all_aqi_observations, key=lambda x: x['aqi'])
        worst_aqi_obs = max(all_aqi_observations, key=lambda x: x['aqi'])

        # Detailed best/worst
        print("\nBest Air Quality Observed:")
        print(f"  Location: {best_aqi_obs['location']}")
        print(f"  AQI: {best_aqi_obs['aqi']} ({best_aqi_obs['category']})")
        print(f"  Coordinates: Lat={best_aqi_obs['lat']:.4f}, Lon={best_aqi_obs['lon']:.4f}")

        print("\nWorst Air Quality Observed:")
        print(f"  Location: {worst_aqi_obs['location']}")
        print(f"  AQI: {worst_aqi_obs['aqi']} ({worst_aqi_obs['category']})")
        print(f"  Coordinates: Lat={worst_aqi_obs['lat']:.4f}, Lon={worst_aqi_obs['lon']:.4f}")

        # Compact “Good city / Bad city” report
        print("\n" + "-"*30)
        print("Good/Bad City Report")
        print("-"*30)
        print(f"  Good city (lowest AQI): {best_aqi_obs['city']} | AQI {best_aqi_obs['aqi']} ({best_aqi_obs['category']})")
        print(f"  Bad city (highest AQI): {worst_aqi_obs['city']} | AQI {worst_aqi_obs['aqi']} ({worst_aqi_obs['category']})")
    else:
        print("No AQI data was collected during the simulation.")

    print("="*30)

if __name__ == "__main__":
    main()
