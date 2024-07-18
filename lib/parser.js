const bodyParser = require("body-parser");
const cheerio = require("cheerio");
const axios = require("axios");
const Vehicle = require("../models/vehiclesModel");
const mongoose = require("mongoose");
require("dotenv").config();

// create valid url from input name
function urlNameClean(name) {
  const arrayName = name.split(" ");
  let nameForURL = arrayName.join("_");
  console.log(nameForURL);
  return nameForURL;
}

// helper function for creating vehicle image url
// target url example: P-26A-34_M2
// spaces in URL need to be replaced by _ underscores
function getVehicleImage(targetURL) {
  const url = `https://encyclopedia.warthunder.com/i/images/${targetURL}.png`;
  console.log(url);
  return url;
}

// function for getting specific vehicle array listing.
// example of target URL = Germany_aircraft
// saves the vehicle data to DB directly

async function getVehicleArray(targetURL) {
  await mongoose.connect(process.env.MONGODB_URL);
  const url = `https://wiki.warthunder.com/Category:${targetURL}`;

  try {
    const response = await axios.get(url);
    const html = response.data;
    let array = [];
    const $ = cheerio.load(html);

    // need to do a double loop for 1 to last-child
    // there is probably a way to find max child number but Cheerio docs gave me brain damage
    for (let x = 1; x < 24; x++) {
      for (let y = 1; y < 24; y++) {
        const model = $(
          `#mw-pages > div > div > div:nth-child(${x}) > ul > li:nth-child(${y}) > a`
        )
          .text()
          .trim();

        if (model === "") {
          break;
        } else {
          array.push(model);
        }
      }
    }
    console.log(array.length);

    // now I need to go through the array, and push data into DB
    for (let x = 0; x < 3; x++) {
      let vehicle = new Vehicle({
        name: array[x],
        vehicle_img: getVehicleArray(urlNameClean(array[x])),
      });

      await vehicle.save();
    }
    console.log("Saving to DB complete");
    mongoose
      .disconnect(process.env.MONGODB_URL)
      .then((res) => console.log("MongoDB disconnected"));
  } catch (err) {
    console.log(err);
  }
}

// getVehicleArray("Germany_aircraft");
