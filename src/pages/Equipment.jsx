import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  BatteryCharging,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Cpu,
  Gauge,
  Layers,
  Navigation,
  Radio,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tractor,
  Zap,
} from 'lucide-react';
import api, { errorText } from '../api';
import EquipmentVisual from '../components/EquipmentVisual.jsx';
import WeatherRadar from '../components/WeatherRadar.jsx';

const pageSize = 20;
const categories = [
  'All Categories',
  'Crop Care',
  'Fertilizing',
  'Field Maintenance',
  'Harvesting',
  'Irrigation',
  'Land Preparation',
  'Planting',
  'Post-harvest',
  'Sowing',
  'Tillage',
  'Transport',
  'Tractor',
];

const emptyForm = {
  name: '',
  category: '',
  dailyRate: '',
  quantity: 1,
  description: '',
  uses: '',
  imageUrl: '',
  powerRating: '',
  fuelType: '',
  autonomousLevel: 'RTK Level 2 Autosteer',
  soilSuitability: '',
  gpsEnabled: true,
};

export default function Equipment({ user }) {
  const [catalog, setCatalog] = useState({ content: [], totalElements: 0, totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const catQuery = category === 'All Categories' ? '' : category;
    api.get('/equipment', { params: { page, size: pageSize, search, category: catQuery }, signal: controller.signal })
      .then(({ data }) => setCatalog(data))
      .catch((error) => { if (error.name !== 'CanceledError') { setMessage(errorText(error)); setIsError(true); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, search, category, refresh]);

  function notify(text, error = false) {
    setMessage(text);
    setIsError(error);
  }

  async function addEquipment(event) {
    event.preventDefault();
    try {
      await api.post('/equipment', {
        ...form,
        dailyRate: Number(form.dailyRate),
        quantity: Number(form.quantity),
      });
      setForm(emptyForm);
      notify('New autonomous equipment deployed to the live network.');
      setPage(0);
      setRefresh((value) => value + 1);
    } catch (error) {
      notify(errorText(error), true);
    }
  }

  // Client-side sorting for rapid UI responsiveness
  let displayItems = [...(catalog.content || [])];
  if (sortBy === 'rate-asc') {
    displayItems.sort((a, b) => Number(a.dailyRate) - Number(b.dailyRate));
  } else if (sortBy === 'rate-desc') {
    displayItems.sort((a, b) => Number(b.dailyRate) - Number(a.dailyRate));
  } else if (sortBy === 'units') {
    displayItems.sort((a, b) => Number(b.quantity) - Number(a.quantity));
  }

  const firstItem = catalog.totalElements === 0 ? 0 : page * pageSize + 1;
  const lastItem = Math.min((page + 1) * pageSize, catalog.totalElements);

  return (
    <div className="catalog-page">
      {/* Futuristic Hero Section */}
      <section className="cyber-hero">
        <div className="hero-grid-background" />
        <div className="hero-content">
          <div className="hero-left">
            <div className="telemetry-pill">
              <span className="live-dot" />
              <span>TERRAGRID PROTOCOL // AUTONOMOUS AGRI-FLEET</span>
            </div>
            <h1 className="cyber-title">
              Precision Machinery.<br />
              <span className="gradient-text">Autonomous Scale.</span>
            </h1>
            <p className="hero-description">
              Access certified high-performance agricultural machinery with RTK GPS autosteer,
              live IoT telemetry, and instant sector dispatch across verified farming clusters.
            </p>

            <div className="hero-stats-row">
              <div className="hero-stat-card">
                <span className="hero-stat-number">{catalog.totalElements.toString().padStart(2, '0')}</span>
                <span className="hero-stat-label">Active Fleet Units</span>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-number">99.8%</span>
                <span className="hero-stat-label">RTK Precision Lock</span>
              </div>
              <div className="hero-stat-card">
                <span className="hero-stat-number">0%</span>
                <span className="hero-stat-label">Capital Upfront</span>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <WeatherRadar />
          </div>
        </div>
      </section>

      {/* Cyber Filters Toolbar */}
      <section className="cyber-toolbar" aria-label="Filter equipment">
        <div className="search-field cyber-input">
          <Search size={18} className="cyber-icon-muted" />
          <input
            type="search"
            value={search}
            maxLength="120"
            onChange={(event) => { setSearch(event.target.value); setPage(0); }}
            placeholder="Search machinery by name, specs or guidance tech..."
            aria-label="Search machinery"
          />
          {search && (
            <button type="button" className="clear-search-btn" onClick={() => setSearch('')}>Clear</button>
          )}
        </div>

        <div className="category-field cyber-select">
          <SlidersHorizontal size={17} className="cyber-icon-muted" />
          <select
            value={category}
            onChange={(event) => { setCategory(event.target.value); setPage(0); }}
            aria-label="Filter by category"
          >
            {categories.map((item) => (
              <option key={item} value={item === 'All Categories' ? '' : item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="sort-field cyber-select">
          <Layers size={17} className="cyber-icon-muted" />
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort machinery"
          >
            <option value="default">Sort: Default Protocol</option>
            <option value="rate-asc">Rate: Low to High</option>
            <option value="rate-desc">Rate: High to Low</option>
            <option value="units">Fleet Availability</option>
          </select>
        </div>

        <span className="page-size-note telemetry-code">DISPATCH://{catalog.totalElements}_UNITS</span>
      </section>

      {/* Admin Deployment Terminal */}
      {isAdmin && (
        <form className="admin-terminal" onSubmit={addEquipment}>
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <div className="terminal-title">
              <CirclePlus size={16} />
              <span>COMMAND://DEPLOY_NEW_FLEET_UNIT</span>
            </div>
          </div>

          <div className="admin-add-fields">
            <input
              placeholder="Unit Name (e.g. John Deere Autonomous 8R)"
              maxLength="120"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              placeholder="Category (e.g. Tractor, Harvesting, Planting)"
              maxLength="80"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Daily Rate (Rs.)"
              value={form.dailyRate}
              onChange={(e) => setForm({ ...form, dailyRate: e.target.value })}
              required
            />
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Fleet Units Available"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
            <input
              placeholder="Power Rating (e.g. 75 HP / 55 kW)"
              maxLength="60"
              value={form.powerRating}
              onChange={(e) => setForm({ ...form, powerRating: e.target.value })}
            />
            <input
              placeholder="Autonomous Tech (e.g. RTK Level 2 / Drone Assist)"
              maxLength="60"
              value={form.autonomousLevel}
              onChange={(e) => setForm({ ...form, autonomousLevel: e.target.value })}
            />
            <input
              placeholder="Fuel / Powertrain (e.g. Turbo Diesel, Hybrid EV)"
              maxLength="60"
              value={form.fuelType}
              onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
            />
            <input
              type="url"
              maxLength="500"
              placeholder="Photo URL (https://...)"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
            <textarea
              className="span-2"
              placeholder="Operational Description & Specifications..."
              maxLength="2000"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <textarea
              className="span-2"
              placeholder="Primary Agricultural Uses & Sector Compatibility..."
              maxLength="2000"
              value={form.uses}
              onChange={(e) => setForm({ ...form, uses: e.target.value })}
              required
            />
          </div>

          <button className="button button-primary cyber-btn" type="submit">
            <Zap size={16} /> Deploy Machine Listing <ArrowUpRight size={16} />
          </button>
        </form>
      )}

      {message && (
        <p className={isError ? 'cyber-message error' : 'cyber-message success'} role="status">
          {message}
        </p>
      )}

      <div className="catalog-results-heading">
        <h2>
          Verified Fleet Inventory
          <span className="results-counter">
            {loading ? 'SYNCING SATELLITE FEED...' : `${firstItem}-${lastItem} OF ${catalog.totalElements} UNITS ACTIVE`}
          </span>
        </h2>
      </div>

      {loading && (
        <div className="cyber-loading">
          <div className="cyber-spinner" />
          <span>INITIALIZING SATELLITE FLEET TELEMETRY...</span>
        </div>
      )}

      {!loading && displayItems.length === 0 && (
        <div className="empty-state cyber-empty">
          <Search size={32} className="cyber-icon-muted" />
          <h3>No Fleet Units Found</h3>
          <p>Adjust your search filters or select All Categories to view available machines.</p>
          <button className="button button-quiet" type="button" onClick={() => { setSearch(''); setCategory(''); }}>
            Reset Filters
          </button>
        </div>
      )}

      {!loading && displayItems.length > 0 && (
        <div className="equipment-grid cyber-grid">
          {displayItems.map((equipment, index) => (
            <article className="equipment-card cyber-card" key={equipment.id} style={{ '--card-index': index }}>
              <Link className="equipment-image-link" to={`/equipment/${equipment.id}`} aria-label={`View ${equipment.name}`}>
                <EquipmentVisual equipment={equipment} />
              </Link>

              <div className="equipment-card-body">
                <div className="equipment-card-meta">
                  <span className="category-label cyber-badge">{equipment.category}</span>
                  <span className={equipment.quantity > 0 ? 'availability available' : 'availability unavailable'}>
                    <span className="availability-pulse" />
                    {equipment.quantity > 0 ? `${equipment.quantity} Ready` : 'In Rotation'}
                  </span>
                </div>

                <h3>
                  <Link to={`/equipment/${equipment.id}`}>{equipment.name}</Link>
                </h3>

                <p className="card-desc">
                  {equipment.description || 'Certified heavy farm equipment ready for immediate sector dispatch.'}
                </p>

                {/* Telemetry specs badges */}
                <div className="card-specs-row">
                  {equipment.powerRating && (
                    <span className="spec-chip" title="Power Rating">
                      <Gauge size={12} /> {equipment.powerRating}
                    </span>
                  )}
                  {equipment.fuelType && (
                    <span className="spec-chip" title="Powertrain">
                      <BatteryCharging size={12} /> {equipment.fuelType}
                    </span>
                  )}
                </div>

                <div className="equipment-card-foot">
                  <div className="daily-rate cyber-price">
                    <span className="currency-label">Rs.</span>
                    <strong>{Number(equipment.dailyRate).toLocaleString('en-IN')}</strong>
                    <small>/ day</small>
                  </div>
                  <Link className="cyber-action-btn" to={`/equipment/${equipment.id}`} aria-label={`Inspect ${equipment.name}`}>
                    <span>Dispatch</span>
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && catalog.totalPages > 1 && (
        <nav className="pagination cyber-pagination" aria-label="Catalog pages">
          <button
            className="button button-quiet"
            type="button"
            onClick={() => setPage((v) => Math.max(0, v - 1))}
            disabled={page === 0}
          >
            <ChevronLeft size={17} /> Previous
          </button>
          <span className="pagination-info">
            CYCLE <strong>{page + 1}</strong> OF {catalog.totalPages}
          </span>
          <button
            className="button button-quiet"
            type="button"
            onClick={() => setPage((v) => Math.min(catalog.totalPages - 1, v + 1))}
            disabled={page + 1 >= catalog.totalPages}
          >
            Next <ChevronRight size={17} />
          </button>
        </nav>
      )}
    </div>
  );
}
