var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const bodyParser = require("body-parser");
const cheerio = require("cheerio");
const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
let vehicleRoutes = require("./routes/vehicleRoutes");

var app = express();

// mongoDB connect setup
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URL;

// wait for db to connect, logging an error if there is a problem
main()
  .then(console.log("mongoDB connecting"))
  .finally("mongoDB connected")
  .catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/vehicles", vehicleRoutes);

// testing route for getting an item

// app.get("/parse", async (req, res, next) => {
//   const url = "https://wiki.warthunder.com/Category:Germany_aircraft";

//   try {
//     const response = await axios.get(url);
//     const html = response.data;
//     let array = [];
//     const $ = cheerio.load(html);

//     // need to do a double loop for 1 to last-child
//     // there is probably a way to find max child number but Cheerio docs gave me brain damage
//     for (let x = 1; x < 24; x++) {
//       for (let y = 1; y < 24; y++) {
//         const model = $(
//           `#mw-pages > div > div > div:nth-child(${x}) > ul > li:nth-child(${y}) > a`
//         )
//           .text()
//           .trim();

//         if (model === "") {
//           break;
//         } else {
//           array.push(model);
//         }
//       }
//     }
//     console.log(array);
//     res.send(array);
//   } catch (err) {
//     next(err);
//   }
// });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
