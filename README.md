# Insurance Quote API

A REST API for managing auto insurance customers, vehicles, and policies — including a rules-based premium calculation engine.

Built as a portfolio project to demonstrate backend API design, relational database modeling, and business logic implementation in Node.js.

**Live demo:** https://insurance-api-7fek.onrender.com (hosted on Render free tier — may take 30-50 seconds to wake up if it's been idle)

## What it does

- Create customers and their vehicles
- Generate a real-time insurance quote based on rating factors (age, vehicle age, vehicle value, coverage type)
- Purchase a policy and store it
- Look up all policies for a given customer

## Tech stack

- **Node.js / Express** — REST API server
- **PostgreSQL** (hosted on [Neon](https://neon.tech)) — relational database
- **pg** — PostgreSQL driver for Node
- **dotenv** — environment variable management

## Premium calculation logic

Premiums are calculated using a simplified rating model based on common real-world auto insurance factors:

| Factor | Rule |
|---|---|
| Base rate | Liability: $40, Collision: $65, Full: $95 |
| Driver age | Under 25: ×1.6, 25–65: ×1.0, Over 65: ×1.25 |
| Vehicle age | Over 10 years: ×0.85, Under 2 years: ×1.1 |
| Vehicle value | Adds 0.2% of vehicle value (collision/full only) |

This is intentionally simplified — real underwriting includes many more factors (driving history, location, credit-based insurance score, etc.) — but it demonstrates a working multi-factor rating engine rather than a flat-rate placeholder.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/customers` | Create a new customer |
| POST | `/api/vehicles` | Add a vehicle for a customer |
| POST | `/api/quote` | Calculate a quote (no DB write) |
| POST | `/api/policies` | Purchase a policy (creates DB record) |
| GET | `/api/customers/:id/policies` | List all policies for a customer |

### Example: Get a quote

**Request**
```http
POST /api/quote
Content-Type: application/json

{
  "customer_id": 1,
  "vehicle_id": 1,
  "coverage_type": "full"
}
```

**Response**
```json
{
  "coverage_type": "full",
  "monthly_premium": 131
}
```

## Database schema

Three related tables: `customers` → `vehicles` → `policies`, linked by foreign keys. Full schema in [`schema.sql`](./schema.sql).

## Running it locally

```bash
git clone https://github.com/StephanieWolfe/insurance-api.git
cd insurance-api
npm install
```

Create a `.env` file in the root with your own PostgreSQL connection string:
```
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
```

Run the schema against your database (via Neon's SQL editor, or `psql`), then:
```bash
npm run dev
```

Server runs on `http://localhost:3000`.

## Background

Built while transitioning from an IT leadership role back into hands-on software engineering, as a way to get current with modern backend practices (REST API design, relational schema design, Git workflows, cloud-hosted databases) after several years split between coding and team management.

## Roadmap

- [ ] Input validation (currently minimal)
- [ ] Authentication
- [ ] Deploy to Render
- [ ] Unit tests
