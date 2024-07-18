const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VehicleModelSchema = new Schema({
  name: { type: String, required: true },
  vehicle_img: { type: String, required: false },
});

// virtual for url

VehicleModelSchema.virtual("url").get(function () {
  return `/${this.id}`;
});

module.exports = mongoose.model("Vehicles", VehicleModelSchema);
