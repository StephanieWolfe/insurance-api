const { customerSchema, vehicleSchema, quoteSchema, policySchema } = require('../validation');

const express = require('express');
const router = express.Router();
const pool = require('../db');

// --- Premium calculation logic ---
function calculatePremium(dateOfBirth, vehicleYear, vehicleValue, coverageType) {
  const age = Math.floor(
    (Date.now() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  );

  // Base rate by coverage type
  const baseRates = { liability: 40, collision: 65, full: 95 };
  let premium = baseRates[coverageType];

  // Age factor — under-25 and over-70 carry higher risk in real underwriting
  if (age < 25) premium *= 1.6;
  else if (age >= 25 && age <= 65) premium *= 1.0;
  else premium *= 1.25;

  // Vehicle age factor — older cars cost less to insure for collision/full
  const vehicleAge = new Date().getFullYear() - vehicleYear;
  if (vehicleAge > 10) premium *= 0.85;
  else if (vehicleAge < 2) premium *= 1.1;

  // Vehicle value factor — higher value increases collision/full cost
  if (coverageType !== 'liability') {
    premium += vehicleValue * 0.002;
  }

  return Math.round(premium * 100) / 100;
}

// --- Create a customer ---
router.post('/customers', async (req, res) => {
  const parsed = customerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }
  const { first_name, last_name, date_of_birth, email } = parsed.data;

  try {
    const result = await pool.query(
      `INSERT INTO customers (first_name, last_name, date_of_birth, email)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [first_name, last_name, date_of_birth, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A customer with this email already exists' });
    }
    res.status(500).json({ error: 'Something went wrong creating the customer' });
  }
});

// --- Add a vehicle for a customer ---
router.post('/vehicles', async (req, res) => {
  const { customer_id, make, model, year, value } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO vehicles (customer_id, make, model, year, value)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [customer_id, make, model, year, value]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Get a quote (no database write, just calculates) ---
router.post('/quote', async (req, res) => {
  const { customer_id, vehicle_id, coverage_type } = req.body;
  try {
    const customerResult = await pool.query('SELECT * FROM customers WHERE id = $1', [customer_id]);
    const vehicleResult = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicle_id]);

    if (!customerResult.rows[0] || !vehicleResult.rows[0]) {
      return res.status(404).json({ error: 'Customer or vehicle not found' });
    }

    const customer = customerResult.rows[0];
    const vehicle = vehicleResult.rows[0];

    const premium = calculatePremium(
      customer.date_of_birth,
      vehicle.year,
      parseFloat(vehicle.value),
      coverage_type
    );

    res.json({ coverage_type, monthly_premium: premium });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Purchase a policy (creates the actual policy record) ---
router.post('/policies', async (req, res) => {
  const { customer_id, vehicle_id, coverage_type, monthly_premium } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO policies (customer_id, vehicle_id, coverage_type, monthly_premium)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [customer_id, vehicle_id, coverage_type, monthly_premium]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- List all policies for a customer ---
router.get('/customers/:id/policies', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM policies WHERE customer_id = $1',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;