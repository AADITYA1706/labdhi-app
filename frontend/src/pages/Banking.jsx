import { useEffect, useState } from "react";
import axios from "axios";

export default function Banking() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    let active = true;

    axios
      .get("/api/banking")
      .then((res) => {
        if (active) {
          setAccounts(Array.isArray(res.data?.accounts) ? res.data.accounts : []);
        }
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h1>Bank Accounts</h1>

      <table style={{ width: "100%", marginTop: 20 }}>
        <thead>
          <tr>
            <th>Bank</th>
            <th>Type</th>
            <th>Balance</th>
          </tr>
        </thead>

        <tbody>
          {accounts.map((acc, i) => (
            <tr key={i}>
              <td>{acc.bank}</td>
              <td>{acc.type}</td>
              <td>₹{Number(acc.balance || 0).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}