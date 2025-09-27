const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/nestify";


main()
    .then(() => {
        console.log("successfully connected to the database");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "68ce7e940e18e0ec9a904a5b"
    }));
    await Listing.insertMany(initData.data);
    console.log("Database Initialized with Sample Data Successfully");
};

initDB();