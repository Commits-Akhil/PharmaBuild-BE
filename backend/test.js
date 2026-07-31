const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.send("Hello");
});

app.listen(5001, () => {
    console.log("Running on 5001");
});