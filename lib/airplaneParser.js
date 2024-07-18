const bodyParser = require("body-parser");
const cheerio = require("cheerio");
const axios = require("axios");
const Airplane = require("../models/airplaneModel");
const mongoose = require("mongoose");
require("dotenv").config();
const puppeteer = require("puppeteer");

// find specific details for a plane
async function getSmallDetails(vehicleName) {
  try {
    const response = await axios.get(
      `https://wiki.warthunder.com/${vehicleName}`
    );
    const html = response.data;
    const $ = cheerio.load(html);
    const upgraded_turn = $(
      `#mw-content-text > div.mw-parser-output > table:nth-child(12) > tbody > tr:nth-child(4) > td:nth-child(5)`
    ).text();
    // const stock_turn = $(
    //   "#mw-content-text > div.mw-parser-output > table:nth-child(12) > tbody > tr:nth-child(3) > td:nth-child(6)"
    // );
    // const upgraded_speed = $(
    //   "#mw-content-text > div.mw-parser-output > table:nth-child(12) > tbody > tr:nth-child(4) > td:nth-child(3)"
    // );
    // const stock_speed = $(
    //   "#mw-content-text > div.mw-parser-output > table:nth-child(12) > tbody > tr:nth-child(3) > td:nth-child(3)"
    // );

    // const results = {
    //   st: stock_turn,
    //   ut: upgraded_turn,
    //   ss: stock_speed,
    //   us: upgraded_speed,
    // };
    console.log(upgraded_turn);
    // return stock_turn;
  } catch (err) {
    console.log(err);
  }
}

getSmallDetails("Alpha_Jet_A");

// test getting the url from specific selector
// puppeteer is required for this because the content is dynamically loaded
async function getDynamicImageURL(vehicleName) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://wiki.warthunder.com/${vehicleName}`);
    await page.waitForSelector(
      "#mw-content-text > div.mw-parser-output > div.specs_card_main > div.specs_card_main_slider > div > div:nth-child(4) > a > img"
    );
    let element = await page.$(
      "#mw-content-text > div.mw-parser-output > div.specs_card_main > div.specs_card_main_slider > div > div:nth-child(4) > a > img"
    );
    let imageLink = await page.evaluate((el) => el.src, element);

    await browser.close();
    console.log(imageLink);
    return imageLink;
  } catch (err) {
    console.log(err);
  }
}

// getDynamicImageURL("Alpha_Jet_A");

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
    for (let x = 0; x < 2; x++) {
      let details = await getSmallDetails(array[x]);
      let vehicle = new Airplane({
        name: array[x],
        vehicle_img: getVehicleImage(urlNameClean(array[x])),
        dynamic_url: await getDynamicImageURL(urlNameClean(array[x])),
        turn_time_RB_stock: await getSmallDetails(array[x]),
        // turn_time_RB_upgraded: details.ut,
        // max_speed_RB_stock: details.ss,
        // max_speed_RB_upgraded: details.us,
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

// name: { type: String, required: true, maxLength: 100 },
// vehicle_img: { type: String },
// dynamic_url: { type: String },
// turn_time_RB_stock: { type: Number },
// turn_time_RB_upgraded: { type: Number },
// max_speed_RB_stock: { type: Number },
// max_speed_RB_upgraded: { type: Number },