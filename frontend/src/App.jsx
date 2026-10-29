
import { useState } from "react";
import "./App.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_URL = `${API_BASE_URL}/api/calculate`;

function App() {
  const [asset, setAsset] = useState("ETH");
  const [amountToSend, setAmountToSend] = useState("");
  const [networkFee, setNetworkFee] = useState("");
  const [exchangeFeeRate, setExchangeFeeRate] = useState("0.1");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function calculateAmount(event) {
    event.preventDefault();
    setError("");
    setResult(null);

    const amount = Number(amountToSend);
    const fee = Number(networkFee);
    const rate = Number(exchangeFeeRate);

    if (
      !amountToSend.trim() ||
      !networkFee.trim() ||
      !exchangeFeeRate.trim() ||
      !Number.isFinite(amount) ||
      !Number.isFinite(fee) ||
      !Number.isFinite(rate) ||
      amount <= 0 ||
      fee < 0 ||
      rate < 0 ||
      rate > 100
    ) {
      setError("Enter a positive amount and valid fee values.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset,
          amountToSend: amount,
          networkFee: fee,
          exchangeFeeRate: rate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to calculate the amount.");
      }

      setResult(data);
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the backend. Please check your internet connection and backend deployment."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header>
        <div className="brand">
          <span className="brand-icon">₿</span>
          <span>CryptoSend</span>
        </div>
        <span className="header-label">Transfer Calculator</span>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">SMART CRYPTO TRANSFERS</p>
          <h1>Send crypto with clarity.</h1>
          <p className="hero-text">
            Calculate your transfer fees and see exactly how much your
            recipient will receive.
          </p>
        </section>

        <section className="calculator-layout">
          <section className="calculator">
            <h2>Transfer details</h2>
            <p className="section-description">
              Enter your transfer amount and applicable fees.
            </p>

            <form onSubmit={calculateAmount}>
              <label htmlFor="asset">Cryptocurrency</label>
              <select
                id="asset"
                value={asset}
                onChange={(e) => {
                  setAsset(e.target.value);
                  setResult(null);
                  setError("");
                }}
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">Tether (USDT)</option>
                <option value="SOL">Solana (SOL)</option>
              </select>

              <label htmlFor="amount">Amount to send ({asset})</label>
              <input
                id="amount"
                type="number"
                min="0.00000001"
                step="any"
                placeholder="e.g. 0.5"
                value={amountToSend}
                onChange={(e) => setAmountToSend(e.target.value)}
                required
              />

              <label htmlFor="networkFee">Network / withdrawal fee ({asset})</label>
              <input
                id="networkFee"
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 0.005"
                value={networkFee}
                onChange={(e) => setNetworkFee(e.target.value)}
                required
              />

              <label htmlFor="exchangeFee">Exchange fee (%)</label>
              <input
                id="exchangeFee"
                type="number"
                min="0"
                max="100"
                step="any"
                placeholder="e.g. 0.1"
                value={exchangeFeeRate}
                onChange={(e) => setExchangeFeeRate(e.target.value)}
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? "Calculating..." : "Calculate amount received →"}
              </button>

              {error && <p className="error">{error}</p>}
            </form>
          </section>

          <section className="result">
            {result ? (
              <>
                <p className="result-label">RECIPIENT WILL RECEIVE</p>
                <h2 className="received-amount">
                  {Number(result.amountReceived).toFixed(8)}
                </h2>
                <p className="asset-label">{result.asset}</p>

                <div className="result-divider" />

                <div className="result-row">
                  <span>Amount sent</span>
                  <strong>
                    {Number(result.amountToSend).toFixed(8)} {result.asset}
                  </strong>
                </div>

                <div className="result-row">
                  <span>Network fee</span>
                  <strong>
                    {Number(result.networkFee).toFixed(8)} {result.asset}
                  </strong>
                </div>

                <div className="result-row">
                  <span>Exchange fee ({result.exchangeFeeRate}%)</span>
                  <strong>
                    {Number(result.exchangeFee).toFixed(8)} {result.asset}
                  </strong>
                </div>

                <div className="result-row total-fees">
                  <span>Total fees</span>
                  <strong>
                    {Number(result.totalFees).toFixed(8)} {result.asset}
                  </strong>
                </div>

                <button
                  type="button"
                  className="reset-button"
                  onClick={() => {
                    setResult(null);
                    setError("");
                  }}
                >
                  Reset results
                </button>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">↗</div>
                <h3>Your results will appear here</h3>
                <p>
                  Enter your transfer details to calculate the final amount
                  your recipient receives.
                </p>
              </div>
            )}
          </section>
        </section>

        <p className="disclaimer">
          Estimates only. Actual fees depend on the exchange, network, and
          transfer method. This tool does not fetch live exchange fees.
        </p>
      </main>
    </>
  );
}

export default App;
