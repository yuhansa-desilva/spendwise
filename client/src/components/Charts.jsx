import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { apiRequest } from "../api.js";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#64748b",
];

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function Charts({ refreshKey }) {
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  // Fetch the summary when the month changes, or when expenses change
  useEffect(() => {
    if (!month) return;

    apiRequest(`/api/expenses/summary?month=${month}`)
      .then((data) => {
        setSummary(data);
        setError("");
      })
      .catch((err) => setError(err.message));
  }, [month, refreshKey]);

  const pieData = summary
    ? summary.byCategory.map((c, i) => ({
        ...c,
        fill: COLORS[i % COLORS.length],
      }))
    : [];

  return (
    <div className="charts">
      <div className="charts-header">
        <h2>Spending overview</h2>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
      </div>

      {error && <div className="error">{error}</div>}

      {summary && (
        <div className="chart-grid">
          <div className="chart-box">
            <h3>
              By category: {summary.month} (total{" "}
              {summary.monthTotal.toLocaleString()})
            </h3>
            {pieData.length === 0 ? (
              <p className="muted">No expenses in this month.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="total"
                    nameKey="category"
                    outerRadius={80}
                  />
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-box">
            <h3>Total per month</h3>
            {summary.byMonth.length === 0 ? (
              <p className="muted">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={summary.byMonth}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Charts;