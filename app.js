const express = require("express");
const applicationRouter = require("./routes/applicationRouter.routes");

const app = express();

app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/applications", applicationRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
