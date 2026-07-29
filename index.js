const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());

const orderRoutes = require("./APIs/OrdercheckStock/routes");

app.use("/orders", orderRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server Started on ${PORT}`);
});