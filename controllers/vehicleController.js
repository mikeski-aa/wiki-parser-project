const Airplanes = require("../models/airplaneModel");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
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

exports.vehicle_compare_get = asyncHandler(async (req, res, next) => {
  const airplanes = await Airplanes.find({}, "name", {}).exec();
  console.log(airplanes);
  res.render("vehicle_compare", {
    title: "Compare planes",
    airplanes: airplanes,
  });
});

// post request for submitting the form
exports.vehicle_compare_post = [
  body("name").isLength({ min: 1 }).trim(),
  body("br").isLength({ min: 1 }).trim(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const airplanes = await Airplanes.find({}, "name", {}).exec();

    if (!errors) {
      // errors in validation of post request
      res.render("vehicle_compare", {
        title: "Compare planes",
        airplanes: airplanes,
        errors: errors.array(),
      });
    } else {
      //validation checked

      res.render("new_compare", {
        title: "Comparing a vehicle",
        br: req.body.br,
        name: req.body.name,
      });
    }
  }),
];
// get request for plane details
exports.exports.vehicle_detail = asyncHandler(async (req, res, next) => {
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