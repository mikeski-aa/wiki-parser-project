var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const bodyParser = require("body-parser");
const cheerio = require("cheerio");
const axios = require("axios");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// testing route for getting an item
app.get("/parse", async (req, res, next) => {
  const url = "https://wiki.warthunder.com/Category:Britain_aircraft";

  try {
    const response = await axios.get(url);
    const html = response.data;
    let array = [];
    // // load into cheerio context
    // const $ = cheerio.load(html);
    // const tableData = [];
    // $("table > tbody > tr").each(function () {
    //   const row = $(this)
    //     .find("td")
    //     .map((i, el) => $(el).text())
    //     .get();
    //   tableData.push(row);
    // });

    // console.log(tableData);

    const $ = cheerio.load(html);

    // need to do a double loop for 1 to last-child

    for (let x = 1; x < 24; x++) {
      for (let y = 1; y < 24; y++) {
        const model = $(
          `#mw-pages > div > div > div:nth-child(${x}) > ul > li:nth-child(${y}) > a`
        )
          .text()
          .trim();

        if (model == undefined || model == null) {
          return;
        } else {
          array.push(model);
        }
      }
    }

    // const model = $(
    //   "#mw-pages > div > div > div:nth-child(21) > ul > li:nth-child(1) > a"
    // )
    //   .text()
    //   .trim();

    // let x = model.split(" ");
    console.log(array);
    res.send(array);
  } catch (err) {
    next(err);
  }

  // await axios
  //   .get(url)
  //   .then((response) => {
  //     const html = response.data;

  //     // load into cheerio context
  //     const $ = cheerio.load(html);
  //     const model = $("h1").text().trim();
  //     console.log(model);
  //   })
  //   .catch((err) => {
  //     next(err);
  //   });
});

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
