const Airplanes = require("../models/airplaneModel");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const stat_helper = require("../lib/vehicle_stat_helper");
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
  // const airplanes = [{ name: "Yak-3" }, { name: "BF-109" }];
  const airplanes = await Airplanes.find({}, "name rating_RB", {}).exec();
  console.log(airplanes);
  res.render("vehicle_compare", {
    title: "Compare planes",
    airplanes: airplanes,
  });
});

// post request for submitting the form
// needs to get fixed. probably need to pass through plane RB with post request
exports.vehicle_compare_post = [
  body("br").isLength({ min: 1 }).trim(),
  body("plane").isLength({ min: 1 }).trim(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // convert ugly req string to object
    const plane = stat_helper.parsePOSTstring(req.body.plane);
    // convert battle ratings, return as object
    const ratingRangeObj = stat_helper.convertRating(plane.rating, req.body.br);
    let items;

    if (req.body.radioChoice == "speedDesc") {
      console.log(req.body.radioChoice);
      items = await Airplanes.find(
        {
          rating_RB: { $gte: ratingRangeObj.min, $lte: ratingRangeObj.max },
        },

        {}
      )
        .sort({ max_speed_RB: -1 })
        .exec();
    } else if (req.body.radioChoice == "turnAsc") {
      console.log(req.body.radioChoice);
      items = await Airplanes.find(
        {
          rating_RB: { $gte: ratingRangeObj.min, $lte: ratingRangeObj.max },
        },

        {}
      )
        .sort({ turn_time_RB: 1 })
        .exec();
    } else if (req.body.radioChoice == "climbDesc") {
      console.log(req.body.radioChoice);
      items = await Airplanes.find(
        {
          rating_RB: { $gte: ratingRangeObj.min, $lte: ratingRangeObj.max },
        },

        {}
      )
        .sort({ max_climb_RB: -1 })
        .exec();
    } else {
      console.log(req.body.radioChoice);
      items = await Airplanes.find(
        {
          rating_RB: { $gte: ratingRangeObj.min, $lte: ratingRangeObj.max },
        },

        {}
      ).exec();
    }

    if (!errors.isEmpty()) {
      // errors found re-render
      res.render("vehicle_compare", {
        title: "Compare planes",
        airplanes: airplanes,
        errors: errors.array(),
      });
      return;
    } else {
      //validation checked
      res.render("vehicle_compare", {
        title: "Compare your vehicle",
        renderCompare: true,
        br: req.body.br,
        name: plane.name,
        plane_br: plane.rating,
        items: items,
      });
    }

    // res.render("vehicle_compare", {
    //   title: "Comparing a vehicle",
    //   renderCompare: true,
    //   br: req.body.br,
    //   name: req.body.name,
    // });
  }),
];

// get request for plane details
exports.vehicle_detail_get = asyncHandler(async (req, res, next) => {
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
