import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [data, setData] = useState({
    accounts: [],
    transactions: [],
    dmat: [],
    insurance: [],
  });
  const [loading, setLoading] = useState(true);

  const fullname = localStorage.getItem("fullname") || "CAMS User";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const camsData = JSON.parse(localStorage.getItem("camsData")) || {};

        const payload = {
          sessionId: camsData.sessionId || "",
          userId: camsData.userId || "kunalr@labdhi.in",
          consentId: localStorage.getItem("consentId") || camsData.consentId || "",
          aaCustomerHandleId: camsData.aaCustomerHandleId || "9940353097@CAMSAA",
          aaCustomerMobile: camsData.aaCustomerMobile || "9940353097",
        };

        const res = await axios.post("http://localhost:5000/api/auth/dashboard-data", payload);
        const apiData = res.data?.data || {};

        const consentStatus = apiData.consentStatus || {};
        const consentData = apiData.consentData || {};
        const periodicData = apiData.periodicData || {};

        const accounts =
          periodicData.accounts ||
          consentData.accounts ||
          consentStatus.accounts ||
          [];

        const transactions =
          periodicData.transactions ||
          consentData.transactions ||
          consentStatus.transactions ||
          [];

        const dmat =
          periodicData.dmat ||
          consentData.dmat ||
          consentStatus.dmat ||
          [];

        const insurance =
          periodicData.insurance ||
          consentData.insurance ||
          consentStatus.insurance ||
          [];

        setData({ accounts, transactions, dmat, insurance });

        if (consentStatus.consentHandle) {
          localStorage.setItem("consentId", consentStatus.consentHandle);
        }
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalBalance = (data.accounts || []).reduce(
    (sum, acc) => sum + Number(acc.balance || 0),
    0
  );

  const monthlyIncome = (data.transactions || [])
    .filter((t) => Number(t.amount) > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  if (loading) {
    return (
      <div className="page-stack">
        <div className="loading-box">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Labdhi Banking Dashboard</h1>
          <p>Welcome back, {fullname}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card accent">
          <span>Total Balance</span>
          <strong>
            ₹ {totalBalance.toLocaleString("en-IN")}
          </strong>
          <small>Across all linked accounts</small>
        </div>

        <div className="stat-card">
          <span>Monthly Income</span>
          <strong>
            ₹ {monthlyIncome.toLocaleString("en-IN")}
          </strong>
          <small>Current month credits</small>
        </div>

        <div className="stat-card">
          <span>Credit Score</span>
          <strong>785</strong>
          <small>Excellent profile</small>
        </div>
      </div>

      {/* Banking + Transactions */}
      <div className="content-grid">
        <section className="panel">
          <div className="panel-header">
            <h3>Bank Accounts</h3>
            <span className="tag">
              {data.accounts.length} Linked
            </span>
          </div>

          <div className="card-list">
            {data.accounts.length === 0 ? (
              <div className="mini-card">
                No Bank Accounts Found
              </div>
            ) : (
              data.accounts.map((acc, i) => (
                <div key={i} className="mini-card">
                  <div className="mini-card-top">
                    <strong>{acc.bankName}</strong>
                    <span className="tag muted">
                      {acc.accountType || "Savings"}
                    </span>
                  </div>

                  <small>{acc.accountNumber}</small>

                  <h2>
                    ₹{" "}
                    {Number(acc.balance).toLocaleString(
                      "en-IN"
                    )}
                  </h2>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>Recent Transactions</h3>
          </div>

          <ul className="transaction-list">
            {data.transactions.length === 0 ? (
              <li>No Transactions</li>
            ) : (
              data.transactions.map((tx, i) => (
                <li key={i}>
                  <div>
                    <strong>{tx.title}</strong>
                    <small>{tx.date}</small>
                  </div>

                  <span
                    className={
                      Number(tx.amount) >= 0
                        ? "credit"
                        : "debit"
                    }
                  >
                    ₹ {Number(tx.amount).toLocaleString("en-IN")}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      {/* DMAT */}
      <section className="panel">
        <div className="panel-header">
          <h3>DMAT Holdings</h3>
          <span className="tag">
            {data.dmat.length} Holdings
          </span>
        </div>

        <div className="account-grid">
          {data.dmat.length === 0 ? (
            <div className="account-card">
              No Holdings Available
            </div>
          ) : (
            data.dmat.map((item, i) => (
              <div key={i} className="account-card">
                <div className="account-topline">
                  <strong>{item.securityName}</strong>
                  <span className="tag muted">
                    Qty {item.quantity}
                  </span>
                </div>

                <h2>
                  ₹{" "}
                  {Number(item.currentValue).toLocaleString(
                    "en-IN"
                  )}
                </h2>

                <small>Current Market Value</small>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Insurance */}
      <section className="panel">
        <div className="panel-header">
          <h3>Insurance Policies</h3>
          <span className="tag">
            {data.insurance.length} Active
          </span>
        </div>

        <div className="account-grid">
          {data.insurance.length === 0 ? (
            <div className="account-card insurance-card">
              No Insurance Policies
            </div>
          ) : (
            data.insurance.map((p, i) => (
              <div
                key={i}
                className="account-card insurance-card"
              >
                <strong>{p.policyName}</strong>

                <h2>
                  ₹{" "}
                  {Number(p.coverage).toLocaleString("en-IN")}
                </h2>

                <small>Coverage Amount</small>

                <span className="tag muted">
                  Premium ₹ {p.premium}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}