const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");

// get praser for vehicl list

router.get("/", vehicleController.all_vehicles);

// GET parser for airplane list
router.get("/compare", vehicleController.compare);

router.get("/:id/", vehicleController.vehicle_detail);

// TEST GET
router.get("/hello", vehicleController.hello);

module.exports = router;
