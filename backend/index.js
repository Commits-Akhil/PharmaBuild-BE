const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

// CORS — allow Next.js frontend (port 3000) to call this API
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Serve uploaded prescription images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());

app.use('/auth', require('./APIs/Auth/routes'));

const orderRoutes = require("./APIs/OrdercheckStock/routes");
const pharmacistRoutes = require("./APIs/Pharmacist/routes");

app.use('/medicines', require('./APIs/Medicines/routes'));

app.use('/customer', require('./APIs/Customer/routes'));

// FIX: placeorder routes must be mounted under /orders so POST /orders/place works
app.use('/orders', require('./APIs/placeorder/routes'));

// FIX: prescriptions route was never mounted
app.use('/prescriptions', require('./APIs/Prescriptions/routes'));

app.use("/pharmacist", pharmacistRoutes);

app.use("/orders", orderRoutes);

const adminRoutes = require("./APIs/Admin/routes");

app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.listen(PORT, () => {
    console.log(`Server Started on ${PORT}`);
});