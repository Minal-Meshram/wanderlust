const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Chat = require("./models/chats.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const WrapAsync = require("./utils/wrapasync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");

// MongoDB Connection
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("Mongo Error:", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// View Engine Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));

// Validation Middleware
const validateListing = (req, res, next) => {
  console.log("BODY =>", req.body);

  let { error } = listingSchema.validate(req.body);

  if (error) {
    let msg = error.details.map((el) => el.message).join(",");
    console.log("VALIDATION ERROR =>", msg);

    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// Root Route
app.get("/", (req, res) => {
  res.render("home");
});

// ================= INDEX ROUTE =================
app.get(
  "/listings",
  WrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

// ================= NEW ROUTE =================
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// ================= SHOW ROUTE =================
app.get(
  "/listings/:id",
  WrapAsync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    res.render("listings/show.ejs", { listing });
  })
);

// ================= CREATE ROUTE =================
app.post(
  "/listings",
  validateListing,
  WrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);

    await newListing.save();

    res.redirect("/listings");
  })
);

// ================= EDIT ROUTE =================
app.get(
  "/listings/:id/edit",
  WrapAsync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);

    res.render("listings/edit.ejs", { listing });
  })
);

// ================= UPDATE ROUTE =================
app.put(
  "/listings/:id",
  validateListing,
  WrapAsync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findByIdAndUpdate(
      id,
      { ...req.body.listing },
      { new: true }
    );

    res.redirect(`/listings/${listing._id}`);
  })
);

// ================= DELETE ROUTE =================
app.delete(
  "/listings/:id",
  WrapAsync(async (req, res) => {
    let { id } = req.params;

    await Listing.findByIdAndDelete(id);

    res.redirect("/listings");
  })
);

// 404 Middleware
app.use((req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// Error Middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;

  res.status(statusCode).render("error.ejs", {
    err,
  });
});

// Server
const PORT = 8080;

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});