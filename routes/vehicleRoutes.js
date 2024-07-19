const express = require("express");
const router = express.Router();
const parseController = require("../controllers/parseController");

// GET parser for airplane list
router.get("/airplane_list", parseController.vehicle_list);

// TEST GET
router.get("/hello", parseController.hello);

module.exports = router;
