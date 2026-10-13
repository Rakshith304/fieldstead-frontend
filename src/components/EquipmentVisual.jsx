import { Activity, Cpu, Navigation, Sprout, Tractor, Wheat, Wrench } from 'lucide-react';

export default function EquipmentVisual({ equipment, className = '' }) {
  const category = equipment.category?.toLowerCase() || '';
  const MachineIcon = category.includes('harvest') || category.includes('post-harvest') ? Wheat
    : category.includes('plant') || category.includes('sow') || category.includes('crop') ? Sprout
      : category.includes('tillage') || category.includes('land') ? Tractor : Wrench;
  const imageUrl = equipment.imageUrl?.startsWith('https://') ? equipment.imageUrl : '';
  const isGps = equipment.gpsEnabled !== false;

  return (
    <div className={`machine-visual ${className}`} aria-label={`${equipment.name} product image`}>
      <div className="hud-corner top-left" />
      <div className="hud-corner top-right" />
      <div className="hud-corner bottom-left" />
      <div className="hud-corner bottom-right" />
      
      <div className="visual-top-bar">
        <span className="visual-stamp">
          <Activity size={10} className="pulse-dot-icon" />
          {equipment.autonomousLevel || 'RTK GUIDED'}
        </span>
        {isGps && (
          <span className="gps-lock-tag" title="RTK Satellite Precision Lock Active">
            <Navigation size={10} /> RTK LOCK
          </span>
        )}
      </div>

      <div className="scanline-overlay" />
      <MachineIcon className="machine-icon" strokeWidth={1.2} aria-hidden="true" />
      
      {imageUrl && (
        <img
          src={imageUrl}
          alt={equipment.name}
          loading="lazy"
          onError={(event) => { event.currentTarget.dataset.failed = 'true'; }}
        />
      )}

      <div className="visual-bottom-telemetry">
        <span className="telemetry-unit-code">SYS://ID-{String(equipment.id || '0').padStart(4, '0')}</span>
        <span className="telemetry-status-dot">
          <span className="dot-pulse" />
          {equipment.quantity > 0 ? 'READY TO DISPATCH' : 'IN FIELD ROTATION'}
        </span>
      </div>
    </div>
  );
}