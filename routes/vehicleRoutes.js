const express = require("express");
const router = express.Router();
const parseController = require("../controllers/parseController");

// get praser for vehicl list

router.get("/", parseController.all_vehicles);

// GET parser for airplane list
router.get("/airplane_list", parseController.vehicle_list);

router.get("/:id/", parseController.vehicle_detail);

// TEST GET
router.get("/hello", parseController.hello);

module.exports = router;
