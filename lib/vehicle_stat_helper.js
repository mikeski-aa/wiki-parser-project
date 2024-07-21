// functions for helping with vehicle stats, primarily for vehicleController

// function to parse string and turn it into object
// array manipulation required, as certain planes have more spaces than others in their name
function parsePOSTstring(input) {
  let tempHolder = input.split("");
  let ratingValue = tempHolder.pop();
  let nameValue = tempHolder.join("");

  console.log("TEMP DEBUGGING SECTION");
  console.log(input.split(""));
  console.log(nameValue);
  console.log(ratingValue);

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

module.exports = {
  parsePOSTstring,
  convertRating,
};
