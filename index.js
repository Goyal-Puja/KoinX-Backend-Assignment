const connectToMongo = require("./db");
const express = require("express");
const axios = require("axios");
const Crypto = require("./CryptoModel");
const cron = require("node-cron");

connectToMongo();

const app = express();
const port = 5000;

async function updateCrypto() {
  try {
    const response = await axios(
      "https://api.coingecko.com/api/v3/coins/list?include_platform=false"
    );
    const cryptos = response.data;
    await Crypto.deleteMany({});
    await Crypto.insertMany(cryptos);
    console.log("Cryptocurrency list updated successfully!");
  } catch (error) {
    console.error("Error updating cryptocurrency list:", error.message);
  }
}

cron.schedule("0 * * * *", () => {
  console.log("Running updateCrypto Job..");
  updateCrypto();
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

updateCrypto();
