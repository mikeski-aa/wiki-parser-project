const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AirplaneModelSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  vehicle_img: { type: String },
  dynamic_url: { type: String },
  turn_time_RB: { type: Number },
  max_speed_RB: { type: Number },
  max_climb_RB: { type: Number },
  sped_alt: { type: Number },
  rating_RB: { type: Number },
  category: { type: Array },
  squadron: { type: Boolean },
  premium: { type: Boolean },
  market: { type: Boolean },
  nation: { type: String },
  rank: { type: String },
  wiki_url: { type: String },
});

// virtual for url

AirplaneModelSchema.virtual("url").get(function () {
  return `/vehicles/${this.id}`;
});

module.exports = mongoose.model("Airplane", AirplaneModelSchema);

// copy in case I break everything
// const AirplaneModelSchema = new Schema({
//   name: { type: String, required: true, maxLength: 100 },
//   vehicle_img: { type: String },
//   dynamic_url: { type: String },
//   turn_time_RB_stock: { type: Number },
//   turn_time_RB_upgraded: { type: Number },
//   max_speed_RB_stock: { type: Number },
//   max_speed_RB_upgraded: { type: Number },
//   max_climb_RB_stock: { type: Number },
//   max_climb_RB_upgraded: { type: Number },
//   sped_alt: { type: Number },
//   rating_RB: { type: Number },
//   category: { type: Array },
//   squadron: { type: Boolean },
//   premium: { type: Boolean },
//   nation: { type: String },
//   rank: { type: String },
// });
