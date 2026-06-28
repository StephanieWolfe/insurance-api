const cors = require('cors');
const express = require('express');
const policiesRouter = require('./routes/policies');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Insurance API is running' });
});

app.use('/api', policiesRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});