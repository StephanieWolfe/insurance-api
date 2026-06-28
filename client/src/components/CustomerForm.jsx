import { useState } from 'react';
import API_BASE from '../api';

function CustomerForm() {
  const [customer, setCustomer] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    email: '',
  });
  const [vehicle, setVehicle] = useState({
    make: '',
    model: '',
    year: '',
    value: '',
  });

  const [customerId, setCustomerId] = useState(null);
  const [vehicleId, setVehicleId] = useState(null);
  const [quote, setQuote] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [situation, setSituation] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleCreateCustomerAndVehicle(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const customerRes = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });
      const customerData = await customerRes.json();
      if (!customerRes.ok) throw new Error(customerData.error);
      setCustomerId(customerData.id);

      const vehicleRes = await fetch(`${API_BASE}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerData.id,
          make: vehicle.make,
          model: vehicle.model,
          year: parseInt(vehicle.year),
          value: parseFloat(vehicle.value),
        }),
      });
      const vehicleData = await vehicleRes.json();
      if (!vehicleRes.ok) throw new Error(vehicleData.error);
      setVehicleId(vehicleData.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGetQuote(coverageType) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          vehicle_id: vehicleId,
          coverage_type: coverageType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuote(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGetRecommendation() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          vehicle_id: vehicleId,
          situation_description: situation,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRecommendation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePurchase() {
    if (!quote) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          vehicle_id: vehicleId,
          coverage_type: quote.coverage_type,
          monthly_premium: quote.monthly_premium,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(`Policy purchased! Policy ID: ${data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="customer-form">
      {error && <p className="error">{error}</p>}

      {!customerId && (
        <form onSubmit={handleCreateCustomerAndVehicle}>
          <h2>Your Information</h2>
          <input
            placeholder="First name"
            value={customer.first_name}
            onChange={(e) => setCustomer({ ...customer, first_name: e.target.value })}
            required
          />
          <input
            placeholder="Last name"
            value={customer.last_name}
            onChange={(e) => setCustomer({ ...customer, last_name: e.target.value })}
            required
          />
          <input
            type="date"
            value={customer.date_of_birth}
            onChange={(e) => setCustomer({ ...customer, date_of_birth: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={customer.email}
            onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            required
          />

          <h2>Your Vehicle</h2>
          <input
            placeholder="Make"
            value={vehicle.make}
            onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })}
            required
          />
          <input
            placeholder="Model"
            value={vehicle.model}
            onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Year"
            value={vehicle.year}
            onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Value ($)"
            value={vehicle.value}
            onChange={(e) => setVehicle({ ...vehicle, value: e.target.value })}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Continue'}
          </button>
        </form>
      )}

      {customerId && !quote && (
        <div className="quote-section">
          <h2>Get a Quote</h2>
          <button onClick={() => handleGetQuote('liability')} disabled={loading}>Liability</button>
          <button onClick={() => handleGetQuote('collision')} disabled={loading}>Collision</button>
          <button onClick={() => handleGetQuote('full')} disabled={loading}>Full Coverage</button>
        </div>
      )}

      {quote && (
        <div className="quote-result">
          <h2>Your Quote</h2>
          <p>{quote.coverage_type}: ${quote.monthly_premium}/month</p>
          <button onClick={handlePurchase} disabled={loading}>Purchase Policy</button>

          <h3>Want a recommendation?</h3>
          <textarea
            placeholder="Describe your situation..."
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
          />
          <button onClick={handleGetRecommendation} disabled={loading || !situation}>
            Get AI Recommendation
          </button>

          {recommendation && (
            <div className="recommendation">
              <p>{recommendation.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CustomerForm;