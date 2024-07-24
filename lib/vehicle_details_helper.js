const Airplanes = require("../models/airplaneModel");
// help to get vehicle details

async function ratingsCompare(vehicle) {
  const [speedResponse, turnResponse, climbResponse] = await Promise.all([
    Airplanes.find(
      {
        rating_RB: vehicle.rating_RB,
      },

      {}
    )
      .sort({ max_speed_RB: -1 })
      .exec(),
    Airplanes.find(
      {
        rating_RB: vehicle.rating_RB,
      },

      {}
    )
      .sort({ turn_time_RB: -1 })
      .exec(),
    Airplanes.find(
      {
        rating_RB: vehicle.rating_RB,
      },

      {}
    )
      .sort({ max_climb_RB: -1 })
      .exec(),
  ]);

  const speedArray = await compareDetails(speedResponse, vehicle);
  const turnArray = await compareDetails(turnResponse, vehicle);
  const climbArray = await compareDetails(climbResponse, vehicle);

  return {
    speedArray,
    turnArray,
    climbArray,
  };
}

async function compareDetails(response, plane) {
  let positionInResults;
  for (let x = 0; x < response.length; x++) {
    if (response[x].name == plane.name) {
      console.log("target found, index is " + x);
      positionInResults = x + 1;
    }
  }
  let percentage =
    (Math.round(
      ((response.length - positionInResults) / (response.length - 1)) * 100
    ) *
      100) /
    100;

  if (percentage == 0) {
    percentage = 100;
  }

  let returnString = `${positionInResults} out of ${response.length - 1}`;

  return [returnString, percentage];
}

module.exports = {
  ratingsCompare,
};
