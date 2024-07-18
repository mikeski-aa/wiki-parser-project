const bodyParser = require("body-parser");
const cheerio = require("cheerio");
const axios = require("axios");
const Vehicle = require("../models/vehiclesModel");
const mongoose = require("mongoose");
require("dotenv").config();

// function for getting specific vehicle array listing.
// example of target URL = Germany_aircraft

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
        vehicle_img: "temp",
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

getVehicleArray("Germany_aircraft");
