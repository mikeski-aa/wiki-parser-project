// functions for helping with vehicle stats, primarily for vehicleController

// function to parse string and turn it into object
function parsePOSTstring(input) {
  let tempHolder = input.split(" ");
  let tempObj = {
    name: tempHolder[0],
    rating: tempHolder[1],
  };

  return tempObj;
}

// funtion for converting ratings
function convertRating(rating, input) {
  if (+input == null || +input == undefined) {
    console.log("Error with provided rating string");
  }

  let maxBR = +rating + +input;
  let minBR = +rating - +input;

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

module.exports = {
  parsePOSTstring,
  convertRating,
};
