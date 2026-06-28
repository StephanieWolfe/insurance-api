import { useState, useEffect } from 'react';
import API_BASE from '../api';

function AdminView() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/customers`)
      .then((res) => res.json())
      .then(setCustomers)
      .catch(() => setError('Could not load customers'));
  }, []);

  async function handleSelectCustomer(customer) {
    setSelectedCustomer(customer);
    setError(null);
    try {
      const vehiclesRes = await fetch(`${API_BASE}/customers/${customer.id}/vehicles`);
      setVehicles(await vehiclesRes.json());

      const policiesRes = await fetch(`${API_BASE}/customers/${customer.id}/policies`);
      setPolicies(await policiesRes.json());
    } catch (err) {
      setError('Could not load customer details');
    }
  }

  return (
    <div className="admin-view">
      {error && <p className="error">{error}</p>}

      <div className="admin-layout">
        <div className="customer-list">
          <h2>Customers</h2>
          {customers.length === 0 && <p>No customers yet.</p>}
          <ul>
            {customers.map((c) => (
              <li
                key={c.id}
                className={selectedCustomer?.id === c.id ? 'selected' : ''}
                onClick={() => handleSelectCustomer(c)}
              >
                {c.first_name} {c.last_name} — {c.email}
              </li>
            ))}
          </ul>
        </div>

        {selectedCustomer && (
          <div className="customer-detail">
            <h2>{selectedCustomer.first_name} {selectedCustomer.last_name}</h2>
            <p>{selectedCustomer.email}</p>
            <p>DOB: {selectedCustomer.date_of_birth?.slice(0, 10)}</p>

            <h3>Vehicles</h3>
            {vehicles.length === 0 && <p>No vehicles on file.</p>}
            <ul>
              {vehicles.map((v) => (
                <li key={v.id}>{v.year} {v.make} {v.model} — ${v.value}</li>
              ))}
            </ul>

            <h3>Policies</h3>
            {policies.length === 0 && <p>No active policies.</p>}
            <ul>
              {policies.map((p) => (
                <li key={p.id}>{p.coverage_type} — ${p.monthly_premium}/month ({p.status})</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminView;