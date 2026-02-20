const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description : String,
    image: {
        type: String,
        default :
         "https://unsplash.com/photos/body-of-water-near-trees-and-mountain-cliff-during-daytime-TWoL-QCZubY ",
        set :(v) =>
        v === "" 
        ? "https://unsplash.com/photos/body-of-water-near-trees-and-mountain-cliff-during-daytime-TWoL-QCZubY "
        : v,
    },
    price: Number,
    location: String,
    Country: String,
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

