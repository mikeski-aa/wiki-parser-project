const bodyParser = require("body-parser");
const cheerio = require("cheerio");
const axios = require("axios");
const Airplane = require("../models/airplaneModel");
const mongoose = require("mongoose");
require("dotenv").config();
const puppeteer = require("puppeteer");
const conversionHelpers = require("../lib/conversionHelper");

// find specific details for a plane
async function getSmallDetails(vehicleName) {
  // the drones have same stats and are lacking a lot of variables other planes have
  // crashes the parser if drones are being parsed like regular planes
  // likely a better way to write this for exceptions
  if (
    vehicleName === "MQ-1" ||
    vehicleName === "Orion" ||
    vehicleName === "Wing Loong I"
  ) {
    const specs = {
      turn_stock: 22,
      turn_upgrade: 0,
      speed_stock: 220,
      speed_upgraded: 0,
      speed_alt: 1000,
      rating: 10.7,
    };
    // console.log(specs);
    return specs;
  } else {
    const url = `https://wiki.warthunder.com/${vehicleName}`;
    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html, {
        decodeEntities: false,
        encoding: "utf-8",
      });

      // the table location is dynamic, find table location by the table selector
      const tableSelector = `table.wikitable[style*="text-align:center"]`;
      const table = $(tableSelector);

      // upgraded turn rate in RB
      // tbody > tr:nth-child(4) > td:nth-child(5)

      // table layout is the same between pages, use this layout to get relevant values
      // unupgraded turn rate location
      const turn_rate_stock = table
        .find("tbody > tr:nth-child(3) > td:nth-child(6)")
        .html()
        .trim();

      // upgraded turn rate location
      const turn_rate_upgraded = table
        .find("tbody > tr:nth-child(4) > td:nth-child(5)")
        .html()
        .trim();

      // max speed unupgraded
      const max_speed_stock = table
        .find("tbody > tr:nth-child(3) > td:nth-child(3)")
        .html()
        .trim();

      // max speed upgraded
      const max_speed_upgraded = table
        .find("tbody > tr:nth-child(4) > td:nth-child(3)")
        .html()
        .trim();

      // max specific alt for max speed
      const max_speed_alt = table
        .find("tbody > tr:nth-child(1) > th:nth-child(2)")
        .html()
        .trim();

      // max rate of climb stock
      const max_climb_stock = table
        .find(
          "#mw-content-text > div.mw-parser-output > table:nth-child(12) > tbody > tr:nth-child(3) > td:nth-child(8)"
        )
        .html();
      // max rate of climb upgraded
      const max_climb_upgraded = table
        .find(
          "#mw-content-text > div.mw-parser-output > table:nth-child(12) > tbody > tr:nth-child(4) > td:nth-child(7)"
        )
        .html();
      // RB rating
      const rating = $(
        "#mw-content-text > div.mw-parser-output > div.specs_card_main > div.specs_card_main_info > div.general_info_2 > div.general_info_br > table > tbody > tr:nth-child(2) > td:nth-child(2)"
      )
        .html()
        .trim();

      // squadron
      let squadron = $(
        "#mw-content-text > div.mw-parser-output > div.specs_card_main > div.specs_card_main_info > div.general_info_2 > div.general_info_class > div.squadron > a"
      ).html();
      // return true or false depending if premium is found
      squadron = conversionHelpers.premiumSquadronChecker(squadron);
      // premium
      let premium = $(
        "#mw-content-text > div.mw-parser-output > div.specs_card_main > div.specs_card_main_info > div.general_info_2 > div.general_info_class > div.premium > a"
      ).html();
      // return true or false depending if premium / squadron is found
      premium = conversionHelpers.premiumSquadronChecker(premium);

      let marketVehicle = $(
        "#mw-content-text > div > div.specs_card_main > div.specs_card_main_info > div.general_info_price > div > span.value.small > a"
      ).html();

      marketVehicle = conversionHelpers.marketChecker(marketVehicle);

      // console.log("Logging values to see what the problem is");
      // console.log(turn_rate_stock);
      // console.log(turn_rate_upgraded);
      // console.log(max_speed_stock);
      // console.log(max_speed_upgraded);
      // console.log(max_speed_alt);
      // using conversion helper to manage all speeds that are written in x,xxx format instead of xxxx
      const specs = {
        turn_stock: conversionHelpers.checkForNaN(turn_rate_stock),
        turn_upgrade: conversionHelpers.checkForNaN(turn_rate_upgraded),
        speed_stock: conversionHelpers.convertNumber(max_speed_stock),
        speed_upgraded: conversionHelpers.convertNumber(max_speed_upgraded),
        climb_stock: conversionHelpers.checkForNaN(max_climb_stock),
        climb_upgraded: conversionHelpers.checkForNaN(max_climb_upgraded),
        speed_alt: conversionHelpers.convertAlt(max_speed_alt),
        rating_RB: conversionHelpers.checkForNaN(rating),
        squadron: squadron,
        premium: premium,
        market: marketVehicle,
      };
      console.log(specs);
      return specs;
    } catch (err) {
      console.log(err);
    }
  }
}

getSmallDetails("Sea_Harrier_FRS.1");

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
  return nameForURL;
}

// helper function for creating vehicle image url
// target url example: P-26A-34_M2
// spaces in URL need to be replaced by _ underscores
function getVehicleImage(targetURL) {
  const url = `https://encyclopedia.warthunder.com/i/images/${targetURL}.png`;
  return url;
}

// function for getting specific vehicle array listing.
// example of target URL = Germany_aircraft
// saves the vehicle data to DB directly

async function getVehicleArray(targetURL) {
  mongoose.set("strictQuery", false);
  const mongoDB = process.env.MONGODB_URL;
  main()
    .then(console.log("mongoDB connecting"))
    .finally("mongoDB connected")
    .catch((err) => console.log(err));
  async function main() {
    await mongoose.connect(mongoDB);
  }

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
    console.log("Total number of aircrafts to parse: " + array.length);

    // now I need to go through the array, and push data into DB
    for (let x = 98; x < 99; x++) {
      let details = await getSmallDetails(urlNameClean(array[x]));
      let airplane = new Airplane({
        name: array[x],
        vehicle_img: await getVehicleImage(urlNameClean(array[x])),
        dynamic_url: await getDynamicImageURL(urlNameClean(array[x])),
        turn_time_RB_stock: details.turn_stock,
        turn_time_RB_upgraded: details.turn_upgrade,
        max_speed_RB_stock: details.speed_stock,
        max_speed_RB_upgraded: details.speed_upgraded,
        speed_alt: details.speed_alt,
        rating_RB: details.rating_RB,
      });
      console.log(x + 1 + " aircraft out of " + array.length);
      console.log(airplane);

      await airplane.save();
    }
    console.log("Saving to DB complete");
    mongoose
      .disconnect(process.env.MONGODB_URL)
      .then(() => console.log("MongoDB disconnected"));
    return;
  } catch (err) {
    console.log(err);
  }
}

// getVehicleArray("USA_aircraft");

// name: { type: String, required: true, maxLength: 100 },
// vehicle_img: { type: String },
// dynamic_url: { type: String },
// turn_time_RB_stock: { type: Number },
// turn_time_RB_upgraded: { type: Number },
// max_speed_RB_stock: { type: Number },
// max_speed_RB_upgraded: { type: Number },
