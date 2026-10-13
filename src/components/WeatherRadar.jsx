import { useState } from 'react';
import { CloudRain, Compass, Cpu, Droplets, Radio, Sun, Thermometer, Wind, Zap } from 'lucide-react';

const SECTORS = [
  { id: 'sec-01', name: 'Sector 01 - North Valley', temp: '27°C', humidity: '58%', moisture: '19%', wind: '12 km/h NE', status: 'Optimal Tillage Window', advisory: 'Ideal moisture for seed drill & deep tillage.' },
  { id: 'sec-02', name: 'Sector 02 - Central Plains', temp: '31°C', humidity: '44%', moisture: '12%', wind: '18 km/h E', status: 'Dry Harvest Cycle', advisory: 'Grain moisture under 14%. Combine harvesters recommended.' },
  { id: 'sec-03', name: 'Sector 03 - South Delta', temp: '26°C', humidity: '72%', moisture: '34%', wind: '8 km/h NW', status: 'Wet Sowing Condition', advisory: 'Paddy transplanter & power tillers recommended.' },
];

export default function WeatherRadar() {
  const [activeSector, setActiveSector] = useState(SECTORS[0]);

  return (
    <div className="weather-radar-card">
      <div className="radar-header">
        <div className="radar-title-group">
          <span className="radar-live-badge"><Radio size={12} className="pulse-icon" /> TELEMETRY RADAR // LIVE</span>
          <h3>Agro-Climate & Soil Telemetry</h3>
        </div>
        <div className="sector-switcher">
          {SECTORS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`sector-btn ${activeSector.id === s.id ? 'active' : ''}`}
              onClick={() => setActiveSector(s)}
            >
              {s.name.split(' - ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="radar-grid">
        <div className="radar-metric">
          <div className="metric-icon"><Thermometer size={16} /></div>
          <div>
            <span className="metric-label">Ambient Temp</span>
            <strong className="metric-value">{activeSector.temp}</strong>
          </div>
        </div>

        <div className="radar-metric">
          <div className="metric-icon"><Droplets size={16} /></div>
          <div>
            <span className="metric-label">Soil Moisture</span>
            <strong className="metric-value">{activeSector.moisture}</strong>
          </div>
        </div>

        <div className="radar-metric">
          <div className="metric-icon"><Wind size={16} /></div>
          <div>
            <span className="metric-label">Wind Velocity</span>
            <strong className="metric-value">{activeSector.wind}</strong>
          </div>
        </div>

        <div className="radar-metric highlight">
          <div className="metric-icon"><Zap size={16} /></div>
          <div>
            <span className="metric-label">Field Recommendation</span>
            <strong className="metric-value status-text">{activeSector.status}</strong>
          </div>
        </div>
      </div>

      <div className="radar-footer">
        <span className="advisory-pill"><Cpu size={13} /> ADVISORY</span>
        <p>{activeSector.advisory}</p>
      </div>
    </div>
  );
}
