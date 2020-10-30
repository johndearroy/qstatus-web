const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");


const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
const categories = require("./route/api/category");
const quotes = require("./route/api/quote");
app.use("/api/categories", categories);
app.use("/api/quotes", quotes);

// Handle the prod version
app.use(express.static(`${__dirname}/public/`));
app.get("/.*/", (req, res) => res.send(`${__dirname}/public/index.html`));



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});