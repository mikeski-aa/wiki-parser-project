const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VehicleModelSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  vehicle_img: { type: String },
  dynamic_url: { type: String },
});

// virtual for url

VehicleModelSchema.virtual("url").get(function () {
  return `/${this.id}`;
});

module.exports = mongoose.model("Vehicle", VehicleModelSchema);
