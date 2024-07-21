const mongoose = require("mongoose");
const Airplanes = require("../models/airplaneModel");
// functions for helping with vehicle stats, primarily for vehicleController

// function to parse string and turn it into object
// array manipulation required, as certain planes have more spaces than others in their name
// had to include @BREAK@ in the input string to enable easier seperation
function parsePOSTstring(input) {
  let tempHolder = input.split("@BREAK@");
  let ratingValue = tempHolder.pop();
  let nameValue = tempHolder.join("");

  let tempObj = {
    name: nameValue,
    rating: ratingValue,
  };

  return tempObj;
}

// funtion for converting ratings
function convertRating(rating, input) {
  let maxBR = +rating + +input;
  let minBR = +rating - +input;

  // log any issues with wrong values being passed
  if (+input == null || +input == undefined) {
    console.log("Error with provided rating string");
  }

  // check for values below minimum (1)
  if (minBR < 1) {
    minBR = 1;
  }

  let ratingObj = {
    max: maxBR,
    min: minBR,
  };

  return ratingObj;
}

// moved this ugly af function away from controller
async function getDataFromInput(inputChoice, ratingRangeObj) {
  try {
    let response = "";
    if (inputChoice == "speedDesc") {
      console.log(inputChoice);
      response = await Airplanes.find(
        {
          rating_RB: { $gte: ratingRangeObj.min, $lte: ratingRangeObj.max },
        },

        {}
      )
        .sort({ max_speed_RB: -1 })
        .exec();
      return response;
    } else if (inputChoice == "turnAsc") {
      console.log(inputChoice);
      response = await Airplanes.find(
        {
          rating_RB: { $gte: ratingRangeObj.min, $lte: ratingRangeObj.max },
        },

        {}
      )
        .sort({ turn_time_RB: 1 })
        .exec();
      return response;
    } else if (inputChoice == "climbDesc") {
      console.log(inputChoice);
      response = await Airplanes.find(
        {
          rating_RB: { $gte: ratingRangeObj.min, $lte: ratingRangeObj.max },
        },

        {}
      )
        .sort({ max_climb_RB: -1 })
        .exec();
      return response;
    } else {
      console.log(inputChoice);
      response = await Airplanes.find(
        {
          rating_RB: { $gte: ratingRangeObj.min, $lte: ratingRangeObj.max },
        },

        {}
      ).exec();
      return response;
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  parsePOSTstring,
  convertRating,
  getDataFromInput,
};
