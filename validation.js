const { z } = require('zod');

const customerSchema = z.object({
  first_name: z.string({ error: "first_name is required" }).min(1, "first_name cannot be empty"),
  last_name: z.string({ error: "last_name is required" }).min(1, "last_name cannot be empty"),
  date_of_birth: z.string({ error: "date_of_birth is required" }).refine(
    (val) => !isNaN(Date.parse(val)),
    "date_of_birth must be a valid date (YYYY-MM-DD)"
  ),
  email: z.string({ error: "email is required" }).email("email must be a valid email address"),
});

const vehicleSchema = z.object({
  customer_id: z.number({ error: "customer_id is required" }).int().positive("customer_id must be a positive integer"),
  make: z.string({ error: "make is required" }).min(1, "make cannot be empty"),
  model: z.string({ error: "model is required" }).min(1, "model cannot be empty"),
  year: z.number({ error: "year is required" }).int().min(1900).max(new Date().getFullYear() + 1, "year is invalid"),
  value: z.number({ error: "value is required" }).positive("value must be a positive number"),
});

const quoteSchema = z.object({
  customer_id: z.number({ error: "customer_id is required" }).int().positive("customer_id must be a positive integer"),
  vehicle_id: z.number({ error: "vehicle_id is required" }).int().positive("vehicle_id must be a positive integer"),
  coverage_type: z.enum(['liability', 'collision', 'full'], {
    error: "coverage_type must be one of: liability, collision, full"
  }),
});

const policySchema = quoteSchema.extend({
  monthly_premium: z.number({ error: "monthly_premium is required" }).positive("monthly_premium must be a positive number"),
});

module.exports = { customerSchema, vehicleSchema, quoteSchema, policySchema };