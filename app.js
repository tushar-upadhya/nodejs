const express = require("express");
const applicationRouter = require("./routes/applicationRouter.routes");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Logger
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

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
