const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 5013;

app.use(cors());

// Endpoint to get Kraken Bitcoin price in USD
app.get("/kraken-price", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.kraken.com/0/public/Depth?pair=XBTUSD"
    );
    const asks = response.data.result.XXBTZUSD.asks;
    const krakenPrice = parseFloat(asks[0][0]); // Using the first ask price
    res.json({ krakenPrice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Kraken Server Error" });
  }
});

// Endpoint to get Luno Bitcoin price in ZAR
app.get("/luno-price", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.luno.com/api/1/tickers?pair=XBTZAR"
    );
    const lunoPrice = parseFloat(response.data.tickers[0].bid); // Using the bid price
    res.json({ lunoPrice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Luno Server Error" });
  }
});

// Endpoint to calculate arbitrage rate
app.get("/arbitrage-rate", async (req, res) => {
  try {
    const krakenResponse = await axios.get(
      "https://api.kraken.com/0/public/Depth?pair=XBTUSD"
    );
    const lunoResponse = await axios.get(
      "https://api.luno.com/api/1/tickers?pair=XBTZAR"
    );

    const krakenPrice = parseFloat(
      krakenResponse.data.result.XXBTZUSD.asks[0][0]
    );
    const zarUsdRate = parseFloat(lunoResponse.data.tickers[0].bid);

    const convertedZarUsdPrice = krakenPrice * zarUsdRate;

    const lunoPrice = parseFloat(lunoResponse.data.tickers[0].bid);

    const difference = lunoPrice - convertedZarUsdPrice;
    const arbitrageRate = difference / convertedZarUsdPrice;

    res.json({ arbitrageRate });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
