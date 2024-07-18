const express = require("express");
const router = express.Router();
const parseController = require("../controllers/parseController");

// GET parser
router.get("/", parseController.vehicle_list);

// TEST GET
router.get("/hello", parseController.hello);

module.exports = router;
