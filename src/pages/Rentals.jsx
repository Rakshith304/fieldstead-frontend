import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  ArrowUpRight,
  Check,
  CheckCircle2,
  CircleAlert,
  Clock3,
  CreditCard,
  FileText,
  Filter,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Tractor,
  XCircle,
  Zap,
} from 'lucide-react';
import api, { errorText } from '../api';

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    let script = document.querySelector('script[data-razorpay]');
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.dataset.razorpay = 'true';
      script.async = true;
    }
    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', () => {
      script.remove();
      reject(new Error('Secure checkout could not load. Check your network connection.'));
    }, { once: true });
    if (!script.isConnected) document.body.appendChild(script);
  });
}

export default function Rentals({ user }) {
  const isAdmin = user.role === 'ADMIN';
  const location = useLocation();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState(location.state?.notice || '');
  const [isError, setIsError] = useState(false);
  const [payingRentalId, setPayingRentalId] = useState(null);

  async function loadRentals() {
    try {
      const { data } = await api.get(isAdmin ? '/rentals' : '/rentals/my');
      setRentals(data);
    } catch (error) {
      setMessage(errorText(error));
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRentals(); }, []);

  async function act(id, action) {
    try {
      await api.patch(`/rentals/${id}/${action}`);
      setMessage(`Protocol #${String(id).padStart(4, '0')} successfully updated to ${action.toUpperCase()}.`);
      setIsError(false);
      await loadRentals();
    } catch (error) {
      setMessage(errorText(error));
      setIsError(true);
    }
  }

  async function startCheckout(rental) {
    setPayingRentalId(rental.id);
    setMessage('');
    try {
      await loadRazorpay();
      const { data: order } = await api.post(`/payments/rentals/${rental.id}/order`);
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Fieldstead TerraPulse',
        description: `${order.description} dispatch authorization`,
        order_id: order.orderId,
        prefill: { name: order.customerName, email: order.customerEmail },
        theme: { color: '#00ff88' },
        handler: async (response) => {
          try {
            await api.post(`/payments/rentals/${rental.id}/verify`, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setMessage('Payment verified. Machinery dispatch authorization confirmed.');
            setIsError(false);
            await loadRentals();
          } catch (error) {
            setMessage(errorText(error));
            setIsError(true);
          } finally {
            setPayingRentalId(null);
          }
        },
        modal: { ondismiss: () => setPayingRentalId(null) },
      });
      checkout.on('payment.failed', (event) => {
        setMessage(event.error?.description || 'Payment failed. Please try again.');
        setIsError(true);
        setPayingRentalId(null);
      });
      checkout.open();
    } catch (error) {
      setMessage(error.response ? errorText(error) : error.message);
      setIsError(true);
      setPayingRentalId(null);
    }
  }

  // Filter rentals
  const filteredRentals = rentals.filter((r) => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch = !searchTerm || (
      r.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(r.id).includes(searchTerm) ||
      (r.farmer?.name && r.farmer.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return matchesStatus && matchesSearch;
  });

  // Calculate HUD Metrics
  const totalValue = rentals.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0);
  const activeCount = rentals.filter((r) => r.status === 'APPROVED').length;
  const pendingCount = rentals.filter((r) => r.status === 'PENDING').length;
  const returnedCount = rentals.filter((r) => r.status === 'RETURNED').length;

  return (
    <section className="rentals-page cyber-rentals">
      {/* Top Operations Header */}
      <div className="rentals-header-row">
        <div>
          <div className="telemetry-pill">
            <span className="live-dot" />
            <span>DISPATCH CONTROL // {isAdmin ? 'CENTRAL FLEET REGISTRY' : 'ACTIVE OPERATOR CONTRACTS'}</span>
          </div>
          <h1 className="cyber-title-sm">{isAdmin ? 'Fleet Operations Desk' : 'My Field Operations'}</h1>
          <p className="page-desc">
            {isAdmin
              ? 'Real-time telemetry, authorization queues, and sector return confirmations.'
              : 'Monitor equipment dispatch status, digital authorizations, and settlement protocol.'}
          </p>
        </div>

        <div className="rentals-top-actions">
          <button className="button button-quiet" type="button" onClick={() => window.print()}>
            <Printer size={15} /> Print Docket
          </button>
          <Link className="button button-primary cyber-btn" to="/catalog">
            <Zap size={15} /> Request Equipment <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      {/* Fleet Telemetry Stats HUD */}
      <div className="telemetry-hud-grid">
        <div className="hud-card">
          <span className="hud-label">Total Protocol Value</span>
          <strong className="hud-value highlight-green">Rs. {totalValue.toLocaleString('en-IN')}</strong>
          <span className="hud-sub">Across all sector contracts</span>
        </div>
        <div className="hud-card">
          <span className="hud-label">Active In Field</span>
          <strong className="hud-value highlight-cyan">{activeCount}</strong>
          <span className="hud-sub">Units currently operational</span>
        </div>
        <div className="hud-card">
          <span className="hud-label">Pending Approval</span>
          <strong className="hud-value highlight-amber">{pendingCount}</strong>
          <span className="hud-sub">Awaiting station clearance</span>
        </div>
        <div className="hud-card">
          <span className="hud-label">Completed Cycles</span>
          <strong className="hud-value highlight-muted">{returnedCount}</strong>
          <span className="hud-sub">Successfully returned</span>
        </div>
      </div>

      {message && (
        <p className={isError ? 'cyber-message error' : 'cyber-message success'} role="status">
          {message}
        </p>
      )}

      {/* Controls Bar: Search & Status Tabs */}
      <div className="rentals-controls-bar">
        <div className="status-tabs-row">
          {['ALL', 'PENDING', 'APPROVED', 'RETURNED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              type="button"
              className={`status-tab-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'ALL' ? 'All Dispatches' : status}
              <span className="tab-count">
                {status === 'ALL' ? rentals.length : rentals.filter((r) => r.status === status).length}
              </span>
            </button>
          ))}
        </div>

        <div className="rentals-search-input">
          <Search size={16} className="cyber-icon-muted" />
          <input
            placeholder="Search by equipment, farmer, or #ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="cyber-loading">
          <div className="cyber-spinner" />
          <span>QUERYING DISPATCH TELEMETRY...</span>
        </div>
      )}

      {!loading && filteredRentals.length === 0 && (
        <div className="empty-state cyber-empty">
          <Clock3 size={36} className="cyber-icon-muted" />
          <h2>No Operations Found</h2>
          <p>No dispatch contracts match the selected filters or search terms.</p>
          <Link className="button button-primary cyber-btn" to="/catalog">
            Explore Machinery Grid <ArrowUpRight size={16} />
          </Link>
        </div>
      )}

      {!loading && filteredRentals.length > 0 && (
        <div className="rental-list cyber-rental-list">
          {filteredRentals.map((rental) => (
            <article className="rental-row cyber-rental-card" key={rental.id}>
              <div className="rental-docket-header">
                <div className="docket-id-group">
                  <span className="protocol-prefix">PROTOCOL</span>
                  <strong className="protocol-id">#REQ-{String(rental.id).padStart(4, '0')}</strong>
                </div>
                <div className="docket-status-group">
                  <span className={`cyber-pill status-${rental.status.toLowerCase()}`}>
                    <span className="pill-dot" />
                    {rental.status}
                  </span>
                  {rental.status === 'APPROVED' && (
                    <span className={`cyber-pill payment-${rental.paymentStatus.toLowerCase()}`}>
                      {rental.paymentStatus === 'PAID' ? 'PAID // VERIFIED' : 'PAYMENT DUE'}
                    </span>
                  )}
                </div>
              </div>

              <div className="rental-card-content">
                <div className="rental-unit-title">
                  <h3>{rental.equipment.name}</h3>
                  <span className="rental-category-chip">{rental.equipment.category}</span>
                </div>

                <div className="rental-meta-grid">
                  <div className="meta-col">
                    <span className="meta-label">Operation Dates</span>
                    <span className="meta-value">{rental.startDate} &rarr; {rental.endDate}</span>
                  </div>
                  <div className="meta-col">
                    <span className="meta-label">Agreed Daily Rate</span>
                    <span className="meta-value">Rs. {Number(rental.agreedRate).toLocaleString('en-IN')} / day</span>
                  </div>
                  <div className="meta-col">
                    <span className="meta-label">Total Protocol Value</span>
                    <strong className="meta-value highlight-amount">Rs. {Number(rental.totalAmount).toLocaleString('en-IN')}</strong>
                  </div>
                  {isAdmin && (
                    <div className="meta-col">
                      <span className="meta-label">Registered Farmer</span>
                      <span className="meta-value">{rental.farmer.name} ({rental.farmer.email})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="rental-actions cyber-actions-row">
                {!isAdmin && rental.status === 'PENDING' && (
                  <button className="button button-quiet" onClick={() => act(rental.id, 'cancel')}>
                    Cancel Request
                  </button>
                )}

                {!isAdmin && rental.status === 'APPROVED' && rental.paymentStatus !== 'PAID' && (
                  <button
                    className="button button-primary cyber-btn"
                    onClick={() => startCheckout(rental)}
                    disabled={payingRentalId !== null}
                  >
                    <CreditCard size={15} />
                    {payingRentalId === rental.id ? 'Connecting Gateway...' : 'Settle Settlement (Razorpay)'}
                  </button>
                )}

                {isAdmin && rental.status === 'PENDING' && (
                  <>
                    <button className="button button-quiet" onClick={() => act(rental.id, 'reject')}>
                      <XCircle size={15} /> Decline
                    </button>
                    <button className="button button-primary cyber-btn" onClick={() => act(rental.id, 'approve')}>
                      <Check size={15} /> Authorize Dispatch
                    </button>
                  </>
                )}

                {isAdmin && rental.status === 'APPROVED' && (
                  <button className="button button-primary cyber-btn" onClick={() => act(rental.id, 'return')}>
                    <CheckCircle2 size={15} /> Confirm Station Return
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
