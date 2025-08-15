import React, { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Activity, Calendar, Smartphone, Radio, AlertCircle, Info } from 'lucide-react';

// Mock data for different states
const stateData = {
  'Delhi': {
    currentAQI: 189,
    forecast: [189, 195, 201, 178, 162, 145, 156, 171, 183, 167, 152],
    coordinates: '28.7041, 77.1025',
    stations: 37
  },
  'Andhra Pradesh': {
    currentAQI: 112,
    forecast: [112, 118, 125, 108, 102, 95, 101, 114, 119, 106, 99],
    coordinates: '15.9129, 79.7400',
    stations: 18
  },
  'Arunachal Pradesh': {
    currentAQI: 45,
    forecast: [45, 48, 52, 41, 38, 35, 39, 46, 49, 43, 40],
    coordinates: '28.2180, 94.7278',
    stations: 8
  },
  'Assam': {
    currentAQI: 78,
    forecast: [78, 82, 87, 74, 71, 66, 72, 80, 85, 77, 73],
    coordinates: '26.2006, 92.9376',
    stations: 15
  },
  'Bihar': {
    currentAQI: 167,
    forecast: [167, 173, 180, 159, 152, 145, 153, 165, 172, 161, 154],
    coordinates: '25.0961, 85.3131',
    stations: 21
  },
  'Chhattisgarh': {
    currentAQI: 134,
    forecast: [134, 140, 147, 128, 122, 115, 123, 136, 142, 131, 125],
    coordinates: '21.2787, 81.8661',
    stations: 16
  },
  'Goa': {
    currentAQI: 58,
    forecast: [58, 62, 67, 54, 51, 47, 53, 60, 64, 57, 52],
    coordinates: '15.2993, 74.1240',
    stations: 6
  },
  'Gujarat': {
    currentAQI: 145,
    forecast: [145, 152, 158, 139, 132, 125, 131, 146, 151, 144, 137],
    coordinates: '23.0225, 72.5714',
    stations: 24
  },
  'Haryana': {
    currentAQI: 178,
    forecast: [178, 184, 191, 169, 162, 155, 163, 176, 182, 170, 164],
    coordinates: '29.0588, 76.0856',
    stations: 19
  },
  'Himachal Pradesh': {
    currentAQI: 52,
    forecast: [52, 56, 61, 48, 45, 41, 47, 54, 58, 51, 46],
    coordinates: '31.1048, 77.1734',
    stations: 12
  },
  'Jharkhand': {
    currentAQI: 156,
    forecast: [156, 162, 169, 148, 141, 134, 142, 154, 160, 149, 143],
    coordinates: '23.6102, 85.2799',
    stations: 17
  },
  'Karnataka': {
    currentAQI: 98,
    forecast: [98, 105, 112, 89, 94, 87, 91, 103, 108, 95, 88],
    coordinates: '15.3173, 75.7139',
    stations: 22
  },
  'Kerala': {
    currentAQI: 64,
    forecast: [64, 68, 73, 59, 56, 52, 58, 66, 70, 63, 57],
    coordinates: '10.8505, 76.2711',
    stations: 14
  },
  'Madhya Pradesh': {
    currentAQI: 142,
    forecast: [142, 148, 155, 135, 128, 121, 129, 141, 147, 136, 130],
    coordinates: '22.9734, 78.6569',
    stations: 26
  },
  'Maharashtra': {
    currentAQI: 127,
    forecast: [127, 134, 142, 125, 119, 108, 115, 129, 135, 128, 121],
    coordinates: '19.7515, 75.7139',
    stations: 28
  },
  'Manipur': {
    currentAQI: 67,
    forecast: [67, 71, 76, 62, 59, 55, 61, 69, 73, 66, 60],
    coordinates: '24.6637, 93.9063',
    stations: 7
  },
  'Meghalaya': {
    currentAQI: 49,
    forecast: [49, 53, 58, 45, 42, 38, 44, 51, 55, 48, 43],
    coordinates: '25.4670, 91.3662',
    stations: 9
  },
  'Mizoram': {
    currentAQI: 41,
    forecast: [41, 45, 50, 37, 34, 31, 37, 43, 47, 40, 36],
    coordinates: '23.1645, 92.9376',
    stations: 5
  },
  'Nagaland': {
    currentAQI: 56,
    forecast: [56, 60, 65, 51, 48, 44, 50, 58, 62, 55, 49],
    coordinates: '26.1584, 94.5624',
    stations: 8
  },
  'Odisha': {
    currentAQI: 119,
    forecast: [119, 125, 132, 113, 107, 100, 108, 121, 127, 116, 110],
    coordinates: '20.9517, 85.0985',
    stations: 20
  },
  'Punjab': {
    currentAQI: 172,
    forecast: [172, 178, 185, 164, 157, 150, 158, 170, 176, 165, 159],
    coordinates: '31.1471, 75.3412',
    stations: 23
  },
  'Rajasthan': {
    currentAQI: 158,
    forecast: [158, 164, 171, 150, 143, 136, 144, 156, 162, 151, 145],
    coordinates: '27.0238, 74.2179',
    stations: 25
  },
  'Sikkim': {
    currentAQI: 38,
    forecast: [38, 42, 47, 34, 31, 28, 34, 40, 44, 37, 33],
    coordinates: '27.5330, 88.5122',
    stations: 4
  },
  'Tamil Nadu': {
    currentAQI: 76,
    forecast: [76, 82, 89, 71, 68, 63, 69, 78, 84, 77, 72],
    coordinates: '11.1271, 78.6569',
    stations: 19
  },
  'Telangana': {
    currentAQI: 124,
    forecast: [124, 130, 137, 118, 112, 105, 113, 126, 132, 121, 115],
    coordinates: '18.1124, 79.0193',
    stations: 16
  },
  'Tripura': {
    currentAQI: 73,
    forecast: [73, 77, 82, 68, 65, 61, 67, 75, 79, 72, 66],
    coordinates: '23.9408, 91.9882',
    stations: 6
  },
  'Uttar Pradesh': {
    currentAQI: 201,
    forecast: [201, 208, 215, 192, 185, 178, 187, 199, 206, 194, 181],
    coordinates: '26.8467, 80.9462',
    stations: 31
  },
  'Uttarakhand': {
    currentAQI: 89,
    forecast: [89, 93, 98, 84, 81, 76, 82, 91, 95, 88, 83],
    coordinates: '30.0668, 79.0193',
    stations: 13
  },
  'West Bengal': {
    currentAQI: 148,
    forecast: [148, 154, 161, 141, 134, 127, 135, 147, 153, 142, 136],
    coordinates: '22.9868, 87.8550',
    stations: 27
  },
  // Union Territories
  'Andaman and Nicobar Islands': {
    currentAQI: 32,
    forecast: [32, 36, 41, 28, 25, 22, 28, 34, 38, 31, 27],
    coordinates: '11.7401, 92.6586',
    stations: 3
  },
  'Chandigarh': {
    currentAQI: 165,
    forecast: [165, 171, 178, 157, 150, 143, 151, 163, 169, 158, 152],
    coordinates: '30.7333, 76.7794',
    stations: 8
  },
  'Dadra and Nagar Haveli and Daman and Diu': {
    currentAQI: 92,
    forecast: [92, 96, 101, 87, 84, 79, 85, 94, 98, 91, 86],
    coordinates: '20.1809, 73.0169',
    stations: 5
  },
  'Jammu and Kashmir': {
    currentAQI: 71,
    forecast: [71, 75, 80, 66, 63, 58, 64, 73, 77, 70, 65],
    coordinates: '34.0837, 74.7973',
    stations: 11
  },
  'Ladakh': {
    currentAQI: 28,
    forecast: [28, 32, 37, 24, 21, 18, 24, 30, 34, 27, 23],
    coordinates: '34.1526, 77.5771',
    stations: 4
  },
  'Lakshadweep': {
    currentAQI: 25,
    forecast: [25, 29, 34, 21, 18, 15, 21, 27, 31, 24, 20],
    coordinates: '10.5667, 72.6417',
    stations: 2
  },
  'Puducherry': {
    currentAQI: 81,
    forecast: [81, 85, 90, 76, 73, 68, 74, 83, 87, 80, 75],
    coordinates: '11.9416, 79.8083',
    stations: 4
  }
};

const getAQIStatus = (aqi: number) => {
  if (aqi <= 50) return { label: 'Good', color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-300' };
  if (aqi <= 100) return { label: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-300' };
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-300' };
  if (aqi <= 200) return { label: 'Unhealthy', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-300' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-300' };
  return { label: 'Hazardous', color: 'text-red-800', bg: 'bg-red-200', border: 'border-red-400' };
};

const getAQIColor = (aqi: number) => {
  if (aqi <= 50) return 'bg-green-500';
  if (aqi <= 100) return 'bg-yellow-500';
  if (aqi <= 150) return 'bg-orange-500';
  if (aqi <= 200) return 'bg-red-500';
  if (aqi <= 300) return 'bg-purple-500';
  return 'bg-red-700';
};

const ForecastChart = ({ forecast, currentAQI }: { forecast: number[], currentAQI: number }) => {
  const maxAQI = Math.max(...forecast);
  const minAQI = Math.min(...forecast);
  const range = maxAQI - minAQI;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-blue-600" />
        10-Day AQI Forecast
      </h3>
      <div className="relative h-64 bg-gray-50 rounded-lg p-4 overflow-x-auto">
        <svg className="w-full h-full min-w-[600px]" viewBox="0 0 600 200">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={i * 40}
              x2="600"
              y2={i * 40}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* AQI line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={forecast.map((aqi, index) => {
              const x = (index / (forecast.length - 1)) * 580 + 10;
              const y = 180 - ((aqi - minAQI) / range) * 160;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {forecast.map((aqi, index) => {
            const x = (index / (forecast.length - 1)) * 580 + 10;
            const y = 180 - ((aqi - minAQI) / range) * 160;
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#3b82f6"
                  className="hover:r-6 transition-all"
                />
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#4b5563"
                >
                  {aqi}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500 min-w-[600px]">
          {['Today', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'].map(day => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [selectedState, setSelectedState] = useState('Delhi');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentData = stateData[selectedState as keyof typeof stateData];
  const aqiStatus = getAQIStatus(currentData.currentAQI);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AQI Monitor Pro</h1>
                <p className="text-sm text-gray-600">Technological AQI Prediction System</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>{currentTime.toLocaleDateString()}</p>
              <p>{currentTime.toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* State Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select State for AQI Monitoring
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full sm:w-96 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            {Object.keys(stateData).map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main AQI Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-gray-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedState}</h2>
                    <p className="text-sm text-gray-500">{currentData.coordinates}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${aqiStatus.bg} ${aqiStatus.color} ${aqiStatus.border} border`}>
                  {aqiStatus.label}
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-gray-900 mb-2">
                  {currentData.currentAQI}
                </div>
                <p className="text-gray-600">Current Air Quality Index</p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ${getAQIColor(currentData.currentAQI)}`}
                    style={{ width: `${Math.min((currentData.currentAQI / 300) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <ForecastChart forecast={currentData.forecast} currentAQI={currentData.currentAQI} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Monitoring Stations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Radio className="h-5 w-5 text-green-600" />
                Monitoring Network
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Mobile Stations</span>
                  </div>
                  <span className="text-blue-600 font-semibold">{Math.floor(currentData.stations * 0.6)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Fixed Stations</span>
                  </div>
                  <span className="text-green-600 font-semibold">{Math.floor(currentData.stations * 0.4)}</span>
                </div>
                <div className="text-center pt-2 border-t">
                  <span className="text-lg font-bold text-gray-900">{currentData.stations}</span>
                  <p className="text-sm text-gray-600">Total Active Stations</p>
                </div>
              </div>
            </div>

            {/* Health Recommendations */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Health Advisory
              </h3>
              <div className={`p-4 rounded-lg ${aqiStatus.bg} border ${aqiStatus.border}`}>
                <p className={`font-medium ${aqiStatus.color}`}>{aqiStatus.label}</p>
                <p className="text-sm text-gray-700 mt-2">
                  {currentData.currentAQI <= 50 && "Air quality is good. Ideal for outdoor activities."}
                  {currentData.currentAQI > 50 && currentData.currentAQI <= 100 && "Air quality is acceptable. Unusually sensitive people should consider limiting outdoor activities."}
                  {currentData.currentAQI > 100 && currentData.currentAQI <= 150 && "Sensitive groups should reduce outdoor activities."}
                  {currentData.currentAQI > 150 && currentData.currentAQI <= 200 && "Everyone should limit outdoor activities."}
                  {currentData.currentAQI > 200 && currentData.currentAQI <= 300 && "Health warnings. Everyone should avoid outdoor activities."}
                  {currentData.currentAQI > 300 && "Emergency conditions. Everyone should avoid all outdoor activities."}
                </p>
              </div>
            </div>

            {/* Technology Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-purple-600" />
                Technology Stack
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>IoT-enabled mobile monitoring units</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Satellite data integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Machine learning prediction models</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Real-time data processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AQI Scale Reference */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-600" />
            AQI Scale Reference
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { range: '0-50', label: 'Good', color: 'bg-green-500' },
              { range: '51-100', label: 'Moderate', color: 'bg-yellow-500' },
              { range: '101-150', label: 'Unhealthy for Sensitive', color: 'bg-orange-500' },
              { range: '151-200', label: 'Unhealthy', color: 'bg-red-500' },
              { range: '201-300', label: 'Very Unhealthy', color: 'bg-purple-500' },
              { range: '301+', label: 'Hazardous', color: 'bg-red-700' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`h-3 ${item.color} rounded-full mb-2`}></div>
                <p className="text-xs font-medium text-gray-900">{item.range}</p>
                <p className="text-xs text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2">AQI Monitor Pro - Advanced Air Quality Prediction System</p>
          <p className="text-gray-400 text-sm">Hackathon Project: Technological Solutions for AQI Monitoring</p>
        </div>
      </footer>
    </div>
  );
}

export default App;