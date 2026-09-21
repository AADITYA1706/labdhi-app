import { useEffect, useState } from "react";
import axios from "axios";

export default function Insurance() {
  const [policies, setPolicies] = useState([]);

  useEffect(() => {
    let active = true;

    axios
      .get("/api/insurance")
      .then((res) => {
        if (active) {
          setPolicies(Array.isArray(res.data?.policies) ? res.data.policies : []);
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
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>Insurance Policies</h1>

      {policies.map((p, i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            padding: "18px",
            borderRadius: "12px",
            marginTop: "15px",
            boxShadow: "0 4px 12px rgba(0,0,0,.08)"
          }}
        >
          <h3>{p.name}</h3>

          <p>Coverage: {p.coverage}</p>
          <p>Premium: ₹{Number(p.premium || 0).toLocaleString()}</p>

          <span
            style={{
              color: p.status === "Active" ? "green" : "orange",
              fontWeight: "bold"
            }}
          >
            {p.status}
          </span>
        </div>
      ))}
    </div>
  );
}