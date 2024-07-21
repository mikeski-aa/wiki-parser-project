const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");

// get praser for vehicl list

router.get("/", vehicleController.all_vehicles);

// GET parser for airplane list
router.get("/compare", vehicleController.vehicle_compare_get);

// POST parser for airplane list
router.post("/compare", vehicleController.vehicle_compare_post);

router.get("/:id/", vehicleController.vehicle_detail_get);

// TEST GET
router.get("/hello", vehicleController.hello);

module.exports = router;
