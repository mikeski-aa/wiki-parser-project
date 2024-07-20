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
    return "0";
  } else {
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

// check for greater number and return it
// used for climb and max speed
function checkBigger(input1, input2) {
  if (input1 > input2) {
    return input1;
  } else {
    return input2;
  }
}

// check for smaller number and return it
// used for turn rate
// if one of the values is zero return another
function checkSmaller(input1, input2) {
  if (input1 === 0) {
    return input2;
  } else if (input2 === 0) {
    return input1;
  }

  if (input1 < input2) {
    return input1;
  } else {
    return input2;
  }
}

// checking whether categories includes premium vehicle tag or not
function premiumTagRemover(input) {
  if (input.includes("PREMIUM")) {
    let categoriesClean = input
      .split("PREMIUM")[1]
      .replaceAll("\n", "")
      .split(/(?=[A-Z])/);

    return categoriesClean;
  } else {
    let categoriesClean = input
      .split("Class:")[1]
      .replaceAll("\n", "")
      .split(/(?=[A-Z])/);

    return categoriesClean;
  }
}

// funtion for cleaning rank and converting it to arabic numbers
function rankConverter(input) {
  let temp = input.split(" ")[0];

  // very stupid way of managing the conversion from roman numerals but it works
  if (temp === "I") {
    return 1;
  } else if (temp === "II") {
    return 2;
  } else if (temp === "III") {
    return 3;
  } else if (temp === "IV") {
    return 4;
  } else if (temp === "V") {
    return 5;
  } else if (temp === "VI") {
    return 6;
  } else if (temp === "VII") {
    return 7;
  } else if (temp === "VIII") {
    return 8;
  } else if (temp === "IX") {
    return 9;
  }
}

module.exports = {
  convertNumber,
  convertAlt,
  checkForNaN,
  nullChecker,
  premiumSquadronChecker,
  marketChecker,
  checkBigger,
  checkSmaller,
  premiumTagRemover,
  rankConverter,
};
