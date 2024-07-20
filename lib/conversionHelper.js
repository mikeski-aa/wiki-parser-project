/// function for converting speed recieved from x,xxx to xxxx
function convertNumber(inputSpeed) {
  //   let temp = inputSpeed.split(" ");

  if (inputSpeed.length <= 3) {
    const nanCheck = checkForNaN(inputSpeed);
    return nanCheck;
  } else {
    let tempHolder = inputSpeed.split(",");
    const formattedSpeed = tempHolder.filter((x) => x != ",").join("");

    const nanCheck = checkForNaN(formattedSpeed);

    return nanCheck;
  }
}

// convertNumber("1,000");

function convertAlt(inputAltString) {
  const temp_max_speed = inputAltString.split("(")[1];
  const new_temp = temp_max_speed.split(" ")[2];
  const formatted_alt = new_temp
    .split("")
    .filter((x) => x != ",")
    .join("");

  const nanCheck = checkForNaN(formatted_alt);

  return nanCheck;
}

// convertAlt("Max Speed (km/h at 2222222,323286 m)");

// check for NaN values
function checkForNaN(inputValue) {
  if (isNaN(+inputValue)) {
    return 0;
  } else {
    return +inputValue;
  }
}
// checkForNullNan("17.2");

// check for null or undefined values
function nullChecker(input) {
  if (input == null || input === undefined || input === "") {
    console.log("null detected");
    return "0";
  } else {
    console.log("value not null");
    return input;
  }
}

// nullChecker("");

// checker for null values in squadron or premium
function premiumSquadronChecker(input) {
  if (input === null) {
    return false;
  } else {
    return true;
  }
}

// check for market vehicle
function marketChecker(input) {
  if (input === "Bundle or Gift") {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  convertNumber,
  convertAlt,
  checkForNaN,
  nullChecker,
  premiumSquadronChecker,
  marketChecker,
};
