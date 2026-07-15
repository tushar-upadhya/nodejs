const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data.json");

function readData() {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw).applications;
}

function writeData(applications) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({ applications }, null, 2),
    "utf-8",
  );
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

// create
exports.createApplication = (req, res) => {
  const {
    company,
    role,
    status,
    location,
    type,
    appliedDate,
    source,
    notes,
    salary,
  } = req.body;

  if (
    !company ||
    !role ||
    !status ||
    !location ||
    !type ||
    !appliedDate ||
    !source ||
    !notes ||
    salary == null
  ) {
    return sendError(res, 400, "All fields are required");
  }
  const applications = readData();
  const nextId =
    applications.length > 0
      ? Math.max(...applications.map((a) => a.id)) + 1
      : 1;
  // const appliedDate = new Date().toISOString().split("T")[0];

  const newApplicationPlayload = {
    id: nextId,
    company,
    role,
    status: status || "applied",
    appliedDate: appliedDate || new Date().toISOString().split("T")[0],
    location,
    type,
    source,
    notes,
    salary,
  };
  applications.push(newApplicationPlayload);
  writeData(applications);
  sendSuccess(res, 200, newApplicationPlayload);
};

// update
exports.updateApplication = (req, res) => {
  const id = Number(req.params.id);

  const applications = readData();

  const application = applications.find((app) => app.id === id);

  if (!application) {
    return sendError(res, 404, "Application not found");
  }

  Object.assign(application, req.body);

  writeData(applications);

  return sendSuccess(res, 200, application);
};
