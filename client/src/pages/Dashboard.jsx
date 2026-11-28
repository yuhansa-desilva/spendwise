import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api.js";

const CATEGORIES = [
  "Food",
  "Groceries",
  "Transport",
  "Bills",
  "Entertainment",
  "Health",
  "Shopping",
  "Other",
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function isAuthError(message) {
  return message === "Invalid or expired token" || message === "No token provided";
}

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(today());
  const [saving, setSaving] = useState(false);

  // Load my expenses once, when the page first appears
  useEffect(() => {
    apiRequest("/api/expenses")
      .then(setExpenses)
      .catch((err) => {
        if (isAuthError(err.message)) {
          clearSession();
          navigate("/login");
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  function handleLogout() {
    clearSession();
    navigate("/login");
  }

  async function handleAdd(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const created = await apiRequest("/api/expenses", {
        method: "POST",
        body: JSON.stringify({
          description,
          amount: Number(amount),
          category,
          date,
        }),
      });

      setExpenses((prev) =>
        [created, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date))
      );
      setDescription("");
      setAmount("");
    } catch (err) {
      if (isAuthError(err.message)) {
        clearSession();
        navigate("/login");
      } else {
        setError(err.message);
      }
    } finally {
      setSaving(false);
    }
  }

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="app wide">
      <div className="header-row">
        <h1>Welcome, {user ? user.name : "guest"}</h1>
        <button className="secondary" onClick={handleLogout}>
          Log out
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <h2>Add expense</h2>
      <form className="expense-form" onSubmit={handleAdd}>
        <label className="full">
          Description
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Lunch at KFC"
            required
          />
        </label>

        <label>
          Amount
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>

        <label>
          Category
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Add expense"}
        </button>
      </form>

      <h2>Your expenses</h2>
      {loading ? (
        <p>Loading...</p>
      ) : expenses.length === 0 ? (
        <p>No expenses yet.</p>
      ) : (
        <>
          <ul className="expense-list">
            {expenses.map((exp) => (
              <li key={exp._id}>
                <div>
                  <strong>{exp.description}</strong>
                  <span className="meta">
                    {exp.category} · {exp.date.slice(0, 10)}
                  </span>
                </div>
                <span className="amount">{exp.amount.toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <p className="total">Total: {total.toLocaleString()}</p>
        </>
      )}
    </div>
  );
}

export default Dashboard;