const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data.json");

function readData() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw).applications;
}

function writeData(applications) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ applications }, null, 2));
}

function sendSuccess(res, status, data) {
  res.status(status).json({
    success: true,
    data,
  });
}

function sendError(res, status, message) {
  res.status(status).json({
    success: false,
    error: message,
  });
}

// GET /applications
exports.getAllApplication = (req, res) => {
  const { status, sort, page, limit } = req.query;

  let result = readData();

  if (status) {
    result = result.filter((app) => app.status === status);
  }

  if (sort === "date") {
    result.sort((a, b) => new Date(a.appliedDate) - new Date(b.appliedDate));
  }

  if (page && limit) {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const start = (pageNum - 1) * limitNum;

    result = result.slice(start, start + limitNum);
  }

  sendSuccess(res, 200, result);
};

// GET /applications/stats
exports.getStats = (req, res) => {
  const applications = readData();

  const stats = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  sendSuccess(res, 200, stats);
};

// GET /applications/:id
exports.getApplicationById = (req, res) => {
  const applications = readData();

  const application = applications.find(
    (app) => app.id === Number(req.params.id),
  );

  if (!application) {
    return sendError(res, 404, "Application not found");
  }

  sendSuccess(res, 200, application);
};
