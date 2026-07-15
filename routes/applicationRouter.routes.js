const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applications.controller");

router.get("/", applicationController.getAllApplication);

router.get("/stats", applicationController.getStats);

router.get("/view/:id", applicationController.getApplicationById);

router.post("/create", applicationController.createApplication);

router.put("/update/:id", applicationController.updateApplication);

router.delete("/delete/:id", applicationController.deleteApplication);

module.exports = router;
