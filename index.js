const express = require("express");
const app = express();
require("dotenv").config();
const client = require("./db/client");
client.connect();
const PORT = 3000;
app.use(express.json());

app.use("/api", require("./api"));

app.get("/", (req, res) => {
    res.send("Hello from server");
});

app.get("*", (req, res) => {
    res.status(404).send({
        error: "404 - Not Found",
        message: "No route found for the requested URL",
    });
})

app.use((error, req, res, next) => {
    console.log("ERROR", error);
    if (res.statusCode , 400) res.status(500);
    res.send({
        message: error.message,
        name: error.name,
    });
});

app.listen(PORT, () => {
    console.log(`Server alive on port ${PORT}`);
});