const express = require("express");
const apiRoute = require("./routes/routes");

const app = express();

app.use(express.json());
app.use("/whatsapp", apiRoute);

module.exports = app;
