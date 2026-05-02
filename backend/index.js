const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is working 🚀");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

mongoose.connect("mongodb://127.0.0.1:27017/ecommerce")
.then(() => console.log("DB connected"))
.catch(err => console.log(err));