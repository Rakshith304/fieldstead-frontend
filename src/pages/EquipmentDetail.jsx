import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  CalendarDays,
  Check,
  CircleAlert,
  Cpu,
  Edit3,
  Gauge,
  Layers,
  MapPin,
  Navigation,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import api, { errorText } from '../api';
import EquipmentVisual from '../components/EquipmentVisual.jsx';

function localToday() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

export default function EquipmentDetail({ user }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    dailyRate: '',
    quantity: 1,
    imageUrl: '',
    description: '',
    uses: '',
    powerRating: '',
    fuelType: '',
    autonomousLevel: '',
    soilSuitability: '',
    gpsEnabled: true,
  });
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    api.get(`/equipment/${id}`, { signal: controller.signal })
      .then(({ data }) => {
        setEquipment(data);
        setEditForm({
          name: data.name || '',
          category: data.category || '',
          dailyRate: data.dailyRate || '',
          quantity: data.quantity ?? 1,
          imageUrl: data.imageUrl || '',
          description: data.description || '',
          uses: data.uses || '',
          powerRating: data.powerRating || '',
          fuelType: data.fuelType || '',
          autonomousLevel: data.autonomousLevel || '',
          soilSuitability: data.soilSuitability || '',
          gpsEnabled: data.gpsEnabled !== false,
        });
      })
      .catch((error) => { if (error.name !== 'CanceledError') { setMessage(errorText(error)); setIsError(true); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);

  async function requestRental(event) {
    event.preventDefault();
    if (!user?.token) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (dates.endDate < dates.startDate) {
      setMessage('Choose an end date on or after the start date.');
      setIsError(true);
      return;
    }
    try {
      await api.post('/rentals', { equipmentId: equipment.id, ...dates });
      navigate('/rentals', { state: { notice: 'Field dispatch protocol registered. Awaiting station approval.' } });
    } catch (error) {
      setMessage(errorText(error));
      setIsError(true);
    }
  }

  async function saveEquipment(event) {
    event.preventDefault();
    try {
      const payload = {
        ...editForm,
        dailyRate: Number(editForm.dailyRate),
        quantity: Number(editForm.quantity),
      };
      const { data } = await api.put(`/equipment/${equipment.id}`, payload);
      setEquipment(data);
      setIsEditing(false);
      setMessage('Machinery specifications updated successfully.');
      setIsError(false);
    } catch (error) {
      setMessage(errorText(error));
      setIsError(true);
    }
  }

  async function archiveEquipment() {
    if (!window.confirm(`Decommission ${equipment.name}? It will be archived from the live dispatch catalog.`)) return;
    try {
      await api.delete(`/equipment/${equipment.id}`);
      navigate('/catalog');
    } catch (error) {
      setMessage(errorText(error));
      setIsError(true);
    }
  }

  if (loading) {
    return (
      <div className="cyber-loading page-loading">
        <div className="cyber-spinner" />
        <span>FETCHING UNIT TELEMETRY & HARDWARE REPOSITORY...</span>
      </div>
    );
  }

  if (!equipment) {
    return (
      <section className="empty-state cyber-empty detail-empty">
        <CircleAlert size={36} className="cyber-icon-muted" />
        <h2>Machinery Unit Unavailable</h2>
        <p>{message || 'This listing may have been decommissioned or moved to another sector.'}</p>
        <Link className="button button-primary cyber-btn" to="/catalog">
          <ArrowLeft size={16} /> Return to Fleet Exchange
        </Link>
      </section>
    );
  }

  const days = dates.startDate && dates.endDate && dates.endDate >= dates.startDate
    ? Math.round((new Date(`${dates.endDate}T00:00:00`) - new Date(`${dates.startDate}T00:00:00`)) / 86400000) + 1 : 0;
  const estimate = days * Number(equipment.dailyRate);

  return (
    <div className="detail-page cyber-detail">
      <Link className="back-link cyber-back-link" to="/catalog">
        <ArrowLeft size={17} /> Back to Fleet Grid
      </Link>

      <div className="detail-layout cyber-detail-layout">
        <div className="detail-main cyber-detail-main">
          <EquipmentVisual equipment={equipment} className="detail-hero-visual" />

          <div className="detail-header-block">
            <div className="header-meta-row">
              <span className="category-label cyber-badge">{equipment.category}</span>
              <span className="telemetry-chip">
                <Navigation size={12} /> {equipment.autonomousLevel || 'RTK Autonomous'}
              </span>
              <span className={equipment.quantity > 0 ? 'availability available' : 'availability unavailable'}>
                <span className="availability-pulse" />
                {equipment.quantity > 0 ? `${equipment.quantity} Units in Fleet` : 'In Field Rotation'}
              </span>
            </div>

            <h1 className="detail-title">{equipment.name}</h1>
            <p className="detail-intro">{equipment.description}</p>
          </div>

          {/* Interactive Telemetry & Specs Tabs */}
          <div className="cyber-tabs-nav">
            <button
              type="button"
              className={`cyber-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              <Cpu size={15} /> Telemetry & Specs
            </button>
            <button
              type="button"
              className={`cyber-tab-btn ${activeTab === 'uses' ? 'active' : ''}`}
              onClick={() => setActiveTab('uses')}
            >
              <Wrench size={15} /> Field Applications
            </button>
            <button
              type="button"
              className={`cyber-tab-btn ${activeTab === 'safety' ? 'active' : ''}`}
              onClick={() => setActiveTab('safety')}
            >
              <ShieldCheck size={15} /> Safety Protocols
            </button>
          </div>

          <div className="cyber-tab-content">
            {activeTab === 'specs' && (
              <div className="specs-dashboard-grid">
                <div className="spec-card">
                  <span className="spec-card-icon"><Gauge size={18} /></span>
                  <div>
                    <span className="spec-card-label">Power & Output</span>
                    <strong>{equipment.powerRating || 'Standard Commercial PTO'}</strong>
                  </div>
                </div>

                <div className="spec-card">
                  <span className="spec-card-icon"><BatteryCharging size={18} /></span>
                  <div>
                    <span className="spec-card-label">Powertrain / Fuel</span>
                    <strong>{equipment.fuelType || 'High-Efficiency EcoDiesel'}</strong>
                  </div>
                </div>

                <div className="spec-card">
                  <span className="spec-card-icon"><Navigation size={18} /></span>
                  <div>
                    <span className="spec-card-label">Autonomous Protocol</span>
                    <strong>{equipment.autonomousLevel || 'RTK Sub-Inch Guidance'}</strong>
                  </div>
                </div>

                <div className="spec-card">
                  <span className="spec-card-icon"><Layers size={18} /></span>
                  <div>
                    <span className="spec-card-label">Soil & Terrain Profile</span>
                    <strong>{equipment.soilSuitability || 'Compatible across dry & moisture-retained plots'}</strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'uses' && (
              <div className="tab-pane-box">
                <h3>Recommended Field Operations</h3>
                <p>{equipment.uses || 'Consult operator manual for specialized attachment calibrations.'}</p>
              </div>
            )}

            {activeTab === 'safety' && (
              <div className="tab-pane-box">
                <h3>Operator Guidelines & Calibration Protocol</h3>
                <p>
                  Deploy only with certified operators or activate RTK satellite geofencing before autonomous engagement.
                  Ensure 360-degree LiDAR clearance in proximity to farm structures and livestock boundaries.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dispatch & Booking Aside Panel */}
        <aside className="booking-panel cyber-panel">
          <div className="panel-badge">
            <Zap size={14} /> {isAdmin ? 'FLEET DISPATCH CONSOLE' : 'INSTANT DISPATCH PROTOCOL'}
          </div>

          <h2>{isAdmin ? (isEditing ? 'Modify Specifications' : 'Unit Administration') : 'Schedule Sector Dispatch'}</h2>
          <p className="panel-sub">
            {isAdmin
              ? 'Update hardware telemetry and live rental pricing.'
              : 'Select field operation dates. Real-time cost calculation applied.'}
          </p>

          {!isAdmin ? (
            <form className="booking-form cyber-form" onSubmit={requestRental}>
              <label className="field-label cyber-field">
                <span>Start Deployment</span>
                <input
                  type="date"
                  min={localToday()}
                  value={dates.startDate}
                  onChange={(e) => setDates({
                    ...dates,
                    startDate: e.target.value,
                    endDate: dates.endDate && dates.endDate < e.target.value ? '' : dates.endDate,
                  })}
                  required
                />
              </label>

              <label className="field-label cyber-field">
                <span>End Deployment</span>
                <input
                  type="date"
                  min={dates.startDate || localToday()}
                  value={dates.endDate}
                  onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
                  required
                />
              </label>

              {days > 0 && (
                <div className="cost-breakdown-card">
                  <div className="cost-row">
                    <span>Duration:</span>
                    <strong>{days} {days === 1 ? 'Day' : 'Days'}</strong>
                  </div>
                  <div className="cost-row">
                    <span>Base Rate:</span>
                    <span>Rs. {Number(equipment.dailyRate).toLocaleString('en-IN')} / day</span>
                  </div>
                  <div className="cost-row">
                    <span>Telemetry Calibration:</span>
                    <span className="free-tag">INCLUDED</span>
                  </div>
                  <div className="cost-divider" />
                  <div className="cost-total-row">
                    <span>Total Protocol Cost:</span>
                    <strong>Rs. {estimate.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              )}

              <button
                className="button button-primary cyber-submit-btn"
                type="submit"
                disabled={equipment.quantity < 1}
              >
                {user?.token ? 'Confirm & Request Dispatch' : 'Sign In to Authorize Dispatch'} <ArrowRight size={17} />
              </button>
            </form>
          ) : isEditing ? (
            <form className="booking-form cyber-form admin-edit-grid" onSubmit={saveEquipment}>
              <label className="field-label">
                <span>Unit Name</span>
                <input value={editForm.name} maxLength="120" onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
              </label>
              <label className="field-label">
                <span>Category</span>
                <input value={editForm.category} maxLength="80" onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} required />
              </label>
              <label className="field-label">
                <span>Daily Rate (Rs)</span>
                <input type="number" min="0.01" step="0.01" value={editForm.dailyRate} onChange={(e) => setEditForm({ ...editForm, dailyRate: e.target.value })} required />
              </label>
              <label className="field-label">
                <span>Fleet Units</span>
                <input type="number" min="0" step="1" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} required />
              </label>
              <label className="field-label">
                <span>Power Rating</span>
                <input value={editForm.powerRating} maxLength="60" onChange={(e) => setEditForm({ ...editForm, powerRating: e.target.value })} placeholder="e.g. 75 HP" />
              </label>
              <label className="field-label">
                <span>Autonomous Tech</span>
                <input value={editForm.autonomousLevel} maxLength="60" onChange={(e) => setEditForm({ ...editForm, autonomousLevel: e.target.value })} placeholder="e.g. RTK Autosteer" />
              </label>
              <label className="field-label">
                <span>Powertrain / Fuel</span>
                <input value={editForm.fuelType} maxLength="60" onChange={(e) => setEditForm({ ...editForm, fuelType: e.target.value })} placeholder="e.g. Turbo Diesel" />
              </label>
              <label className="field-label">
                <span>Photo URL</span>
                <input type="url" maxLength="500" value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} placeholder="https://..." />
              </label>
              <label className="field-label span-2">
                <span>Description</span>
                <textarea maxLength="2000" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} required />
              </label>
              <label className="field-label span-2">
                <span>Field Applications</span>
                <textarea maxLength="2000" value={editForm.uses} onChange={(e) => setEditForm({ ...editForm, uses: e.target.value })} required />
              </label>

              <div className="admin-action-row">
                <button className="button button-primary cyber-btn" type="submit"><Check size={16} /> Save Changes</button>
                <button className="button button-quiet" type="button" onClick={() => setIsEditing(false)}><X size={16} /> Cancel</button>
              </div>
            </form>
          ) : (
            <div className="admin-console-actions">
              <button className="button button-primary cyber-btn" type="button" onClick={() => setIsEditing(true)}>
                <Edit3 size={16} /> Edit Unit Telemetry
              </button>
              <button className="button button-quiet" type="button" onClick={archiveEquipment}>
                <Trash2 size={16} /> Decommission Machine
              </button>
            </div>
          )}

          {message && (
            <p className={isError ? 'cyber-message error' : 'cyber-message success'} role="status">
              {message}
            </p>
          )}

          {!isAdmin && (
            <div className="panel-security-guarantee">
              <Check size={14} className="accent-check" />
              <span>Zero cancellation fee prior to station dispatch authorization</span>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}