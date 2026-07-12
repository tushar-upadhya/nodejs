const express = require("express");
const app = express();

app.use(express.json());

app.use((req, res, next) => {
  console.log(`method is ${req.method} & URL is ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.send("welcome");
});

// app.get("/application/:id", (req, res) => {
//   res.send(`fetching application with id ${req.params.id}`);
// });

app.get("/application", (req, res) => {
  const { status } = req.query;

  res.send(`filtering by status: ${status}`);
});

app.listen(3000, () => console.log("running"));
