const Airplanes = require("../models/airplaneModel");
const asyncHandler = require("express-async-handler");
// const bodyParser = require("body-parser");
// const cheerio = require("cheerio");
// const axios = require("axios");

// helper function

// function for getting specific vehicle array listing.
// example of target URL = Germany_aircraft

// get all vehicle list
exports.all_vehicles = asyncHandler(async (req, res, next) => {
  const numberOfVehicles = await Airplanes.countDocuments({}).exec();

  res.render("vehicles", {
    title: "Welcome to the vehicle list",
    number: numberOfVehicles,
  });
});

// GET request handle for list of sorted planes
// example sort, i will need to create others

exports.vehicle_list = asyncHandler(async (req, res, next) => {
  const airplanes = await Airplanes.find({
    max_speed_RB_upgraded: { $gt: 1 },
  })
    .sort({ max_speed_RB_upgraded: -1 })
    .exec();
  res.render("vehicle_list_view", {
    title: "Max upgraded speed",
    airplanes: airplanes,
  });
});

// get request for plane details
exports.vehicle_detail = asyncHandler(async (req, res, next) => {
  const vehicle = await Airplanes.findById(req.params.id).exec();

  console.log(vehicle);

  if (vehicle === null) {
    // no vehicle found
    res.render("vehicle_details", {
      title: "Vehile details",
      error: "vehicle not found",
    });
  }

  res.render("vehicle_details", {
    title: "Vehicle details",
    airplane: vehicle,
  });
});

exports.hello = asyncHandler(async (req, res, next) => {
  res.send("hello");
});
