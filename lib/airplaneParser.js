const bodyParser = require("body-parser");
const cheerio = require("cheerio");
const axios = require("axios");
const Airplane = require("../models/airplaneModel");
const mongoose = require("mongoose");
require("dotenv").config();
const puppeteer = require("puppeteer");

// find specific details for a plane
async function getSmallDetails(vehicleName) {
  const url = `https://wiki.warthunder.com/${vehicleName}`;
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html, { decodeEntities: false, encoding: "utf-8" });
    // const upgraded_turn = $(
    //   `#mw-content-text > div.mw-parser-output > table:nth-child(12) > tbody > tr:nth-child(4) > td:nth-child(5)`
    // )
    //   .text()
    //   .trim();
    // console.log(upgraded_turn);
    // const model = $(
    //   `#mw-content-text > div.mw-parser-output > table:nth-child(12) > tbody > tr:nth-child(4) > th`
    // )
    //   .text()
    //   .trim();
    // console.log(model);

    // const modelhtml = $(
    //   `#mw-content-text > div.mw-parser-output > table:nth-child(14) > tbody > tr:nth-child(3) > td:nth-child(3)`
    // )
    //   .text()
    //   .trim();
    // console.log(modelhtml);
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

    // return stock_turn;
    const tableSelector = `table.wikitable[style*="text-align:center"]`; // Removed width="70%"

    const table = $(tableSelector);

    const targetElement = table.find(
      "tbody > tr:nth-child(3) > td:nth-child(6)"
    );
    console.log(targetElement.html());

    // if (table.length > 0) {
    //   console.log("Found the table with center alignment!");
    //   // Access the table element here (e.g., get its text content or HTML structure)
    //   const tableText = table.text().trim();
    //   const tableHtml = table.html();

    //   console.log("Table text content:", tableText);
    //   console.log("Table HTML:", tableHtml);
    // } else {
    //   console.log("Table not found");
    // }
  } catch (err) {
    console.log(err);
  }
}

getSmallDetails("Yak-1");

// getSmallDetails("Alpha_Jet_A");

// test getting the url from specific selector
// puppeteer is required for this because the content is dynamically loaded
// async function test(vehicleName) {
//   try {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto(`https://wiki.warthunder.com/MiG-3-15_(BK)`);
//     await page.waitForSelector(
//       "#mw-content-text > div.mw-parser-output > table:nth-child(12)"
//     );
//     let element = await page.$(
//       "#mw-content-text > div.mw-parser-output > table:nth-child(12)"
//     );
//     let imageLink = await page.evaluate((el) => el.className, element);

//     await browser.close();
//     console.log(imageLink);
//   } catch (err) {
//     console.log(err);
//   }
// }

// test();

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
