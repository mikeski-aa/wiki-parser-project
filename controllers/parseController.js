const Airplanes = require("../models/airplaneModel");
const asyncHandler = require("express-async-handler");
// const bodyParser = require("body-parser");
// const cheerio = require("cheerio");
// const axios = require("axios");

// helper function

// function for getting specific vehicle array listing.
// example of target URL = Germany_aircraft

// GET request handle

exports.vehicle_list = asyncHandler(async (req, res, next) => {
  const airplanes = await Airplanes.find({})
    .sort({ turn_time_RB_upgraded: 1 })
    .exec();
  res.render("vehicle_list_view", {
    title: "Max upgraded speed",
    airplanes: airplanes,
  });
});

exports.hello = asyncHandler(async (req, res, next) => {
  res.send("hello");
});
