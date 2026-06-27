require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function getRecommendation({ situationDescription, age, vehicleYear, vehicleValue, premiumsByType }) {
  const prompt = `You are an auto insurance assistant. A customer described their situation as: "${situationDescription}"

Here is their actual data and the real calculated monthly premiums from our rating system:
- Age: ${age}
- Vehicle year: ${vehicleYear}
- Vehicle value: $${vehicleValue}
- Liability coverage: $${premiumsByType.liability}/month
- Collision coverage: $${premiumsByType.collision}/month
- Full coverage: $${premiumsByType.full}/month

Using ONLY the real premium numbers provided above, recommend a coverage type for this customer and briefly explain why, in 2-3 sentences. Do not invent or guess at different prices — only reference the exact numbers given above.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].text;
}

module.exports = { getRecommendation };