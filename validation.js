const { z } = require('zod');

const customerSchema = z.object({
  first_name: z.string().min(1, "first_name is required"),
  last_name: z.string().min(1, "last_name is required"),
  date_of_birth: z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    "date_of_birth must be a valid date (YYYY-MM-DD)"
  ),
  email: z.string().email("email must be a valid email address"),
});

const vehicleSchema = z.object({
  customer_id: z.number().int().positive("customer_id must be a positive integer"),
  make: z.string().min(1, "make is required"),
  model: z.string().min(1, "model is required"),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1, "year is invalid"),
  value: z.number().positive("value must be a positive number"),
});

const quoteSchema = z.object({
  customer_id: z.number().int().positive("customer_id must be a positive integer"),
  vehicle_id: z.number().int().positive("vehicle_id must be a positive integer"),
  coverage_type: z.enum(['liability', 'collision', 'full'], {
    errorMap: () => ({ message: "coverage_type must be one of: liability, collision, full" })
  }),
});

const policySchema = quoteSchema.extend({
  monthly_premium: z.number().positive("monthly_premium must be a positive number"),
});

module.exports = { customerSchema, vehicleSchema, quoteSchema, policySchema };