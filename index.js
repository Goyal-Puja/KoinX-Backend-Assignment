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

async function getCompaniesHoldingCrypto(currency) {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/companies/public_treasury/${currency}`
    );
    return response.data;
    console.log(response.data);
  } catch (error) {
    throw new Error(
      `Error fetching companies holding ${currency}: ${error.message}`
    );
  }
}

cron.schedule("0 * * * *", () => {
  console.log("Running updateCrypto Job..");
  updateCrypto();
});

app.get("/companies/:currency", async (req, res) => {
  const currency = req.params.currency.toLowerCase();
  try {
    const companies = await getCompaniesHoldingCrypto(currency);
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// http://localhost:5000/getPrice?ids=1bch&vs_currencies=btc

// app.get('/getPrice', async (req, res) => {
//     const { ids, vs_currencies } = req.query;

//     try {
//         const price = await getPrice(ids, vs_currencies);
//         res.json({ price });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Function to fetch the current price of cryptocurrencies
// async function getPrice(ids, vs_currencies) {
//     try {
//         const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs_currencies}&include_last_updated_at=true&include_24hr_change=true`);

//         if (response.data) {
//             return response.data;
//         } else {
//             throw new Error(`No price data available for the specified cryptocurrencies`);
//         }
//     } catch (error) {
//         throw new Error(`Error fetching price: ${error.message}`);
//     }
// }

// Route to handle requests for fetching cryptocurrency price on a particular date
app.get('/getPrice', async (req, res) => {
    const { fromCurrency, toCurrency, date } = req.query;

    try {
        const price = await getPrice(fromCurrency, toCurrency, date);
        res.json({ price });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Function to fetch the price of one cryptocurrency in terms of another on a particular date
async function getPrice(fromCurrency, toCurrency, date) {
    try {
        // Format date to YYYY-MM-DD for Coingecko API
        const formattedDate = formatDate(date);

        // Fetch historical price data for fromCurrency in terms of toCurrency on the specified date
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${fromCurrency}/history?date=${formattedDate}&localization=false`);

        // Check if the response contains price data for the specified date
        if (response.data.market_data && response.data.market_data.current_price) {
            // Extract the price of fromCurrency in terms of toCurrency
            const priceInToCurrency = response.data.market_data.current_price[toCurrency.toLowerCase()];
            return priceInToCurrency;
        } else {
            throw new Error(`No price data available for ${fromCurrency} on ${date}`);
        }
    } catch (error) {
        throw new Error(`Error fetching price: ${error.message}`);
    }
}

// Function to format date to YYYY-MM-DD
function formatDate(date) {
    const [year, month, day] = date.split('-');
    return `${year}-${month}-${day}`;
}

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

updateCrypto();
