/// function for converting speed recieved from x,xxx to xxxx
function convertNumber(inputSpeed) {
  //   let temp = inputSpeed.split(" ");

  if (inputSpeed.length <= 3) {
    return +inputSpeed;
  } else {
    let tempHolder = inputSpeed.split(",");
    const formattedSpeed = tempHolder.filter((x) => x != ",").join("");

    const nanCheck = checkForNullNan(formattedSpeed);

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

  const nanCheck = checkForNullNan(formatted_alt);

  return nanCheck;
}

// convertAlt("Max Speed (km/h at 2222222,323286 m)");

// check for NaN values / null values
function checkForNullNan(inputValue) {
  if (isNaN(+inputValue)) {
    return 0;
  } else {
    return +inputValue;
  }
}
// checkForNullNan("17.2");

module.exports = {
  convertNumber,
  convertAlt,
  checkForNullNan,
};
