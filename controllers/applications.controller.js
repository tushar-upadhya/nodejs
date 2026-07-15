const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data.json");

// Helpers
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw).applications || [];
  } catch (error) {
    console.error("Error reading data file:", error);
    return [];
  }
}

function writeData(applications) {
  try {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ applications }, null, 2),
      "utf-8",
    );
    return true;
  } catch (error) {
    console.error("Error writing data file:", error);
    return false;
  }
}

function sendSuccess(res, status, data) {
  return res.status(status).json({ success: true, data });
}

function sendError(res, status, message) {
  return res.status(status).json({ success: false, error: message });
}

function validateApplication(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate) {
    if (!data.company?.trim()) errors.push("Company is required");
    if (!data.role?.trim()) errors.push("Role is required");
    if (!data.status?.trim()) errors.push("Status is required");
    if (!data.location?.trim()) errors.push("Location is required");
    if (!data.type?.trim()) errors.push("Type is required");
    if (!data.appliedDate) errors.push("Applied Date is required");
    if (!data.source?.trim()) errors.push("Source is required");
    if (data.salary == null) errors.push("Salary is required");
  }

  // Common validations
  if (
    data.salary !== undefined &&
    (typeof data.salary !== "number" || data.salary < 0)
  ) {
    errors.push("Salary must be a valid positive number");
  }

  if (data.appliedDate) {
    const date = new Date(data.appliedDate);
    if (isNaN(date.getTime())) {
      errors.push("Applied Date must be a valid date (YYYY-MM-DD)");
    }
  }

  if (data.status) {
    const validStatuses = ["applied", "interview", "offer", "rejected"];
    if (!validStatuses.includes(data.status.toLowerCase())) {
      errors.push("Status must be one of: applied, interview, offer, rejected");
    }
  }

  return errors;
}

// get all
exports.getAllApplication = (req, res) => {
  let applications = readData();

  const { status, sort, page, limit, search } = req.query;

  if (search) {
    const keyword = search.toLowerCase();
    applications = applications.filter(
      (app) =>
        app.company?.toLowerCase().includes(keyword) ||
        app.role?.toLowerCase().includes(keyword),
    );
  }

  if (status) {
    applications = applications.filter(
      (app) => app.status?.toLowerCase() === status.toLowerCase(),
    );
  }

  if (sort === "date") {
    applications.sort(
      (a, b) => new Date(b.appliedDate) - new Date(a.appliedDate),
    );
  }

  const total = applications.length;

  if (page && limit) {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const start = (pageNum - 1) * limitNum;
    applications = applications.slice(start, start + limitNum);

    return res.status(200).json({
      success: true,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      data: applications,
    });
  }

  sendSuccess(res, 200, applications);
};

// get stats
exports.getStats = (req, res) => {
  const applications = readData();
  const stats = { total: applications.length };

  applications.forEach((app) => {
    stats[app.status] = (stats[app.status] || 0) + 1;
  });

  sendSuccess(res, 200, stats);
};

// get by ID
exports.getApplicationById = (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return sendError(res, 400, "Invalid application id");

  const applications = readData();
  const application = applications.find((app) => app.id === id);

  if (!application) return sendError(res, 404, "Application not found");

  sendSuccess(res, 200, application);
};

// create
exports.createApplication = (req, res) => {
  const errors = validateApplication(req.body);
  if (errors.length > 0) {
    return sendError(res, 400, errors.join(", "));
  }

  const applications = readData();
  const nextId =
    applications.length > 0
      ? Math.max(...applications.map((a) => a.id)) + 1
      : 1;

  const newApplication = {
    id: nextId,
    company: req.body.company.trim(),
    role: req.body.role.trim(),
    status: req.body.status.toLowerCase(),
    location: req.body.location.trim(),
    type: req.body.type.trim(),
    appliedDate: req.body.appliedDate,
    source: req.body.source.trim(),
    notes: req.body.notes || "",
    salary: Number(req.body.salary),
  };

  applications.push(newApplication);
  writeData(applications);

  sendSuccess(res, 201, newApplication);
};

// update
exports.updateApplication = (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return sendError(res, 400, "Invalid application id");

  const applications = readData();
  const index = applications.findIndex((app) => app.id === id);

  if (index === -1) return sendError(res, 404, "Application not found");

  // Check ID mismatch
  if (req.body.id && Number(req.body.id) !== id) {
    return sendError(res, 400, "ID in body does not match ID in URL");
  }

  const errors = validateApplication(req.body, true);
  if (errors.length > 0) {
    return sendError(res, 400, errors.join(", "));
  }

  const allowedFields = [
    "company",
    "role",
    "status",
    "location",
    "type",
    "appliedDate",
    "source",
    "notes",
    "salary",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === "salary") {
        applications[index][field] = Number(req.body[field]);
      } else if (field === "status") {
        applications[index][field] = req.body[field].toLowerCase();
      } else if (typeof req.body[field] === "string") {
        applications[index][field] = req.body[field].trim();
      } else {
        applications[index][field] = req.body[field];
      }
    }
  });

  writeData(applications);
  sendSuccess(res, 200, applications[index]);
};

// delete
exports.deleteApplication = (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return sendError(res, 400, "Invalid application id");

  const applications = readData();
  const index = applications.findIndex((app) => app.id === id);

  if (index === -1) return sendError(res, 404, "Application not found");

  const deleted = applications.splice(index, 1)[0];
  writeData(applications);

  sendSuccess(res, 200, {
    message: "Application deleted successfully",
    application: deleted,
  });
};
