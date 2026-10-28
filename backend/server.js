
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Check whether the backend is running
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Send Crypto API is running.",
  });
});

// Calculate the amount the recipient receives
app.post("/api/calculate", (req, res) => {
  try {
    const { asset, amountToSend, networkFee, exchangeFeeRate } = req.body;

    if (
      typeof asset !== "string" ||
      !["BTC", "ETH", "USDT", "SOL"].includes(asset) ||
      amountToSend === undefined ||
      networkFee === undefined ||
      exchangeFeeRate === undefined ||
      amountToSend === "" ||
      networkFee === "" ||
      exchangeFeeRate === ""
    ) {
      return res.status(400).json({
        error: "Please provide a valid cryptocurrency and all fee values.",
      });
    }

    const amount = Number(amountToSend);
    const fee = Number(networkFee);
    const rate = Number(exchangeFeeRate);

    if (
      !Number.isFinite(amount) ||
      !Number.isFinite(fee) ||
      !Number.isFinite(rate)
    ) {
      return res.status(400).json({
        error: "All values must be valid numbers.",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        error: "The amount to send must be greater than zero.",
      });
    }

    if (fee < 0 || rate < 0 || rate > 100) {
      return res.status(400).json({
        error: "Fees cannot be negative. Exchange fee must be between 0 and 100%.",
      });
    }

    const exchangeFee = (amount * rate) / 100;
    const totalFees = fee + exchangeFee;
    const amountReceived = amount - totalFees;

    if (amountReceived < 0) {
      return res.status(400).json({
        error: "The total fees cannot exceed the amount you send.",
      });
    }

    // Round displayed results to 8 decimal places
    const roundCrypto = (value) =>
      Number(value.toFixed(8));

    return res.status(200).json({
      asset,
      amountToSend: roundCrypto(amount),
      networkFee: roundCrypto(fee),
      exchangeFeeRate: rate,
      exchangeFee: roundCrypto(exchangeFee),
      totalFees: roundCrypto(totalFees),
      amountReceived: roundCrypto(amountReceived),
    });
  } catch (error) {
    console.error("Calculation error:", error);

    return res.status(500).json({
      error: "An internal server error occurred.",
    });
  }
});

app.use("/api", (req, res) => {
  res.status(404).json({
    error: "API route not found.",
  });
});

app.listen(PORT, () => {
  console.log(`Send Crypto backend running at http://localhost:${PORT}`);
});