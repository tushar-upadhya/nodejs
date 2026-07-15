const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applications.controller");

// get methods
router.get("/", applicationController.getAllApplication);
// get application counts by status
router.get("/stats", applicationController.getStats);
//get single application by id
router.get("/:id", applicationController.getApplicationById);

// create new
router.post("/", applicationController.createApplication);

// update
router.post("/:id", applicationController.updateApplication);

module.exports = router;
