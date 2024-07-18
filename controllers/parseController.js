// const Vehicles = require("../models/vehiclesModel");
const asyncHandler = require("express-async-handler");
// const bodyParser = require("body-parser");
// const cheerio = require("cheerio");
// const axios = require("axios");

// helper function

// function for getting specific vehicle array listing.
// example of target URL = Germany_aircraft

// GET request handle

exports.vehicle_list = asyncHandler(async (req, res, next) => {
  res.send("VEHICLE LIST NOT IMPLEMENTED");
});

exports.hello = asyncHandler(async (req, res, next) => {
  res.send("hello");
});
