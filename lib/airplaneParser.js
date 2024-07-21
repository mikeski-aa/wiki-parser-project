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
    vehicleName === "Wing_Loong_I"
  ) {
    const specs = {
      turn_rate: 22,
      speed: 220,
      speed_alt: 1000,
      climb_rate: 2.5,
      rating_RB: 10.7,
      category: ["Strike Drone"],
      squadron: false,
      premium: false,
      market: false,
      wiki_url: `https://wiki.warthunder.com/${vehicleName}`,
      rank: 7,
    };
    // console.log(specs);
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

      // the table location on the page is dynamic, find table location by the table selector
      const tableSelector = `table.wikitable[style*="text-align:center"]`;
      const table = $(tableSelector);

      // table layout is the same between pages, use this layout to get relevant values
      // IMPORTANT - WHEN USING table.find -> trim selector to start with "tbody" otherwise NULL values will be returned

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
        .find("tbody > tr:nth-child(3) > td:nth-child(8)")
        .html();

      // max rate of climb upgraded
      const max_climb_upgraded = table
        .find("tbody > tr:nth-child(4) > td:nth-child(7)")
        .html();

      // RB rating
      const rating = $(
        "#mw-content-text > div.mw-parser-output > div.specs_card_main > div.specs_card_main_info > div.general_info_2 > div.general_info_br > table > tbody > tr:nth-child(2) > td:nth-child(2)"
      )
        .html()
        .trim();

      // get the rank of the vehicle from the page
      const rank = $(
        "#mw-content-text > div.mw-parser-output > div.specs_card_main > div.specs_card_main_info > div.general_info > div.general_info_rank > a"
      ).html();

      let convertedRank = conversionHelpers.rankConverter(rank);

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
      // return true or false depending if market vehicle
      marketVehicle = conversionHelpers.marketChecker(marketVehicle);

      // getting list of all categories for a specific aircraft
      // this was a much bigger headache than it seems - the returned .text() includes line breaks
      let categoriesRaw = $(
        "#mw-content-text > div.mw-parser-output > div.specs_card_main > div.specs_card_main_info > div.general_info_2 > div.general_info_class"
      ).text();

      let categoriesClean = conversionHelpers.premiumTagRemover(categoriesRaw);

      // if premium and market tags are present, market tag is removed
      if (premium === true && marketVehicle === true) {
        marketVehicle = false;
      }

      // using conversion helper to manage all speeds that are written in x,xxx format instead of xxxx
      // the helper also handles null values returned when certain info is not present (i.e for vehicles that do not need upgrading)
      // due to some vehicles not having stock values, I've decided to ONLY keep upgraded values for comparison
      // full vehicle information can be found on the wiki
      const specs = {
        turn_rate: conversionHelpers.checkSmaller(
          conversionHelpers.checkForNaN(turn_rate_stock),
          conversionHelpers.checkForNaN(turn_rate_upgraded)
        ),
        speed: conversionHelpers.checkBigger(
          conversionHelpers.convertNumber(max_speed_stock),
          conversionHelpers.convertNumber(max_speed_upgraded)
        ),

        climb_rate: conversionHelpers.checkBigger(
          conversionHelpers.checkForNaN(max_climb_stock),
          conversionHelpers.checkForNaN(max_climb_upgraded)
        ),
        speed_alt: conversionHelpers.convertAlt(max_speed_alt),
        rating_RB: conversionHelpers.checkForNaN(rating),
        category: categoriesClean,
        squadron: squadron,
        premium: premium,
        market: marketVehicle,
        wiki_url: url,
        rank: convertedRank,
      };
      // console.log(specs);
      return specs;
    } catch (err) {
      console.log(err);
    }
  }
}

// getSmallDetails("Wing_Loong_I");

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

async function getVehicleArray(targetURL, input_nation) {
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
    for (let x = 1; x < 40; x++) {
      for (let y = 1; y < 40; y++) {
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
    // IN CASE OF PARSER CRASH -> CHANGE X TO THE VALUE OF LAST DISPLAYED AIRCRAFT!
    for (let x = 0; x < array.length; x++) {
      let details = await getSmallDetails(urlNameClean(array[x]));
      let airplane = new Airplane({
        name: array[x],
        vehicle_img: await getVehicleImage(urlNameClean(array[x])),
        dynamic_url: await getDynamicImageURL(urlNameClean(array[x])),
        turn_time_RB: details.turn_rate,
        max_speed_RB: details.speed,
        max_climb_RB: details.climb_rate,
        speed_alt: details.speed_alt,
        rating_RB: details.rating_RB,
        category: details.category,
        rating_RB: details.rating_RB,
        squadron: details.squadron,
        market: details.market,
        premium: details.premium,
        nation: input_nation,
        rank: details.rank,
        wiki_url: details.wiki_url,
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

// getVehicleArray("USA_aircraft", "USA");
// getVehicleArray("Britain_aircraft", "Britain");
// getVehicleArray("Germany_aircraft", "Germany");
// getVehicleArray("USSR_aircraft", "USSR");
// getVehicleArray("China_aircraft", "China");
// getVehicleArray("Japan_aircraft", "Japan");
// getVehicleArray("Italy_aircraft", "Italy");
// getVehicleArray("France_aircraft", "France");
// getVehicleArray("Sweden_aircraft", "Sweden");
getVehicleArray("Israel_aircraft", "Israel");

// name: { type: String, required: true, maxLength: 100 },
// vehicle_img: { type: String },
// dynamic_url: { type: String },
// turn_time_RB_stock: { type: Number },
// turn_time_RB_upgraded: { type: Number },
// max_speed_RB_stock: { type: Number },
// max_speed_RB_upgraded: { type: Number },
