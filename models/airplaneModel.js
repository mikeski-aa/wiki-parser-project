const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AirplaneModelSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  vehicle_img: { type: String },
  dynamic_url: { type: String },
  turn_time_RB_stock: { type: Number },
  turn_time_RB_upgraded: { type: Number },
  max_speed_RB_stock: { type: Number },
  max_speed_RB_upgraded: { type: Number },
  sped_alt: { type: Number },
  rating_RB: { type: Number },
});

// virtual for url

AirplaneModelSchema.virtual("url").get(function () {
  return `/${this.id}`;
});

module.exports = mongoose.model("Airplane", AirplaneModelSchema);
