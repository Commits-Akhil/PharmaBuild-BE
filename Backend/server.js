require('dotenv').config();
const express = require('express');

const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const prescriptionRoutes = require('./routes/prescriptions');

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/prescriptions', prescriptionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RxConnect API running on port ${PORT}`));
