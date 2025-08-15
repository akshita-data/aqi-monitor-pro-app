# Drone AQI Simulation – India (CPCB-NAQI Compliant)

## 📌 Overview
This Python script **simulates** a drone travelling between multiple Indian cities, capturing air quality data from two simulated sources:
- **Station** (fixed AQ monitoring station)
- **Mobile** (handheld or drone sensor)

It then **cleans** the data, computes **India’s official AQI (NAQI)** using CPCB’s methodology, flags anomalies, and generates outputs for analysis and visualization.

This is for **educational/demo** purposes — results are simulated, **not** official AQI values.

---

## ⚙️ Features
- Visits **all major Indian cities** in `CITY_COORDS` (customizable)
- **Hotspot influence** to simulate higher pollution near large metro areas
- **ML-style data cleaning**:
  - Range clamping (removing absurd readings)
  - Rolling mean smoothing
  - Z-score based anomaly detection
- **CPCB NAQI AQI** computation with:
  - Correct pollutant breakpoints
  - Max-subindex method
  - Minimum data rule (≥3 pollutants incl. PM2.5 or PM10)
- **Dual Source**: Station + simulated Mobile readings
- Outputs:
  - CSV with all readings + anomalies
  - Interactive HTML map (heatmap + coloured markers)
  - Console summary with **best/worst AQI cities & states**

---

## 📦 Requirements
Install Python 3.8+ and the following packages:

---

## ▶️ How to Run
**Files generated:**
- `drone_aqi_data_full.csv` – full log of readings
- `drone_aqi_map_full.html` – interactive heatmap
- Console output – live readings + final report

---

## 📂 Output Details
### **CSV columns**
- `timestamp` – UNIX timestamp of reading
- `lat`, `lon` – Coordinates
- `city`, `state` – Location info
- `target_city` – Next waypoint in drone’s route
- `source` – `Station` or `Mobile`
- Pollutant values: `PM2.5`, `PM10`, `CO`, `NO2`, `SO2`
- `AQI`, `AQI_Category`, `Prominent` pollutant
- `anom_*` – Anomaly flags (1 if outlier)

### **HTML Map**
- Heatmap layer shows AQI intensity
- Clickable coloured markers per city:
  - City, State
  - AQI & Category
  - Pollutant readings

---

## ❓ Frequently Asked Questions

### Purpose & Data
**Q: Does this use real AQI data?**  
A: No — generates simulated values based on realistic ranges and hotspot influence.

**Q: Which AQI standard is used?**  
A: India’s **CPCB National AQI (NAQI)**, not US EPA.

**Q: What is `target_city` in the output?**  
A: The next destination the simulated drone is moving toward. `city` is where the current reading was taken.

---

### Cities & States
**Q: Which cities are included?**  
A: Major cities from multiple states/UTs defined in `CITY_COORDS`.

**Q: How can I run it for only one state?**  
A: Filter `CITY_COORDS` to only that state before running.

**Q: Why does `state` sometimes say "Unknown State"?**  
A: Reverse geocoding failed (service timeout or no match).

---

### AQI Calculation
**Q: How is AQI calculated?**  
A: For each pollutant, a sub-index is computed using CPCB breakpoints. Overall AQI is the **maximum** sub-index if ≥3 pollutants present incl. PM2.5 or PM10.

**Q: What are CPCB categories?**  
- Good (0–50)  
- Satisfactory (51–100)  
- Moderately Polluted (101–200)  
- Poor (201–300)  
- Very Poor (301–400)  
- Severe (401–500)

---

### Data Cleaning & Anomalies
**Q: What is smoothing?**  
A: Rolling mean of recent readings to reduce noise.

**Q: How are anomalies detected?**  
A: Z-score > 3 from the recent mean.

**Q: Are anomalies removed?**  
A: No — just flagged in CSV (`anom_pollutant`).

---

### Simulation Logic
**Q: What does the drone do?**  
A: Moves step-by-step between city waypoints, generating readings.

**Q: What is `DRONE_STEP_DEG`?**  
A: Distance moved each simulation step (degrees lat/lon).

**Q: Station vs Mobile readings?**  
A: `Station` is fixed point, `Mobile` is simulated sensor with slight noise.

---

### Hotspot Influence
**Q: What are hotspots?**  
A: Cities with high pollution influence; increase readings nearby.

**Q: How close for effect?**  
A: Within `HOTSPOT_RADIUS_DEG` (~5–6 km).

---

### Output & Visualization
**Q: Where is the map?**  
A: `drone_aqi_map_full.html` — open in a browser.

**Q: How are marker colors chosen?**  
A: Mapped from AQI category (good=green, poor=red, etc.).

---

### Performance & Customization
**Q: How to speed it up?**  
A:  
- Reduce number of cities  
- Increase `DRONE_STEP_DEG`  
- Lower `SIM_INTERVAL_SEC`  
- Disable reverse geocoding

**Q: How to add more pollutants?**  
A: Add to `POLLUTANT_RANGES` and `CPCB_BREAKPOINTS`.

**Q: How to use real AQI data?**  
A: Replace `generate_pollutants()` with API fetch from sources like CPCB or OpenAQ.

---

### Troubleshooting
**Q: Heatmap missing?**  
A: Ensure there are valid AQI >= 0 readings in `heat_data`.

**Q: Many "Insufficient Data"?**  
A: Needs ≥3 pollutants recorded incl. PM2.5 or PM10 for AQI calculation.

**Q: Encoding issues for µg/m³?**  
A: Save file UTF-8; ensure console supports Unicode.

---

## ⚠️ Disclaimer
This is a **simulation**. All AQI values generated are **synthetic** and should **NOT** be used for public health or safety decisions.

---

## 📜 License
MIT — use, modify, and share with attribution.
