const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());

// process.on("exit", (code) => {
//     console.log("Process exited with code:", code);
// });

// process.on("SIGINT", () => {
//     console.log("SIGINT received");
// });

// process.on("SIGTERM", () => {
//     console.log("SIGTERM received");
// });

// process.on("uncaughtException", (err) => {
//     console.error("Uncaught Exception:", err);
// });

// process.on("unhandledRejection", (err) => {
//     console.error("Unhandled Rejection:", err);
// });
app.use('/auth',require('./APIs/Auth/routes'));
const orderRoutes = require("./APIs/OrdercheckStock/routes");

const pharmacistRoutes = require("./APIs/Pharmacist/routes");

app.use('/medicines',require('./APIs/Medicines/routes'));

app.use('/customer',require('./APIs/Customer/routes'));

app.use('/placeorder',require('./APIs/placeorder/routes'));

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