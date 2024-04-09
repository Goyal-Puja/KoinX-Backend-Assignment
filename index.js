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

async function getCompaniesHoldingCrypto(currency){
    try{
       const response = await axios.get(`https://api.coingecko.com/api/v3/companies/public_treasury/${currency}`);
       return response.data;
       console.log(response.data);
    } catch (error) {
         throw new Error(`Error fetching companies holding ${currency}: ${error.message}`);
    }
}

cron.schedule("0 * * * *", () => {
  console.log("Running updateCrypto Job..");
  updateCrypto();
});

app.get('/companies/:currency', async(req, res) => {
    const currency = req.params.currency.toLowerCase();
    try{
        const companies = await getCompaniesHoldingCrypto(currency);
        res.json(companies);
    } catch ( error ){
        res.status(500).json({ error : error.message});
    }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

updateCrypto();
