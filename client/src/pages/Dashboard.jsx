import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api.js";
import Charts from "../components/Charts.jsx";

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

function sortNewestFirst(list) {
  return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
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

  function handleApiError(err) {
    if (isAuthError(err.message)) {
      clearSession();
      navigate("/login");
    } else {
      setError(err.message);
    }
  }

  function resetForm() {
    setEditingId(null);
    setDescription("");
    setAmount("");
    setCategory("Food");
    setDate(today());
  }

  function handleEdit(exp) {
    setError("");
    setEditingId(exp._id);
    setDescription(exp.description);
    setAmount(String(exp.amount));
    setCategory(exp.category);
    setDate(exp.date.slice(0, 10));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const body = JSON.stringify({
      description,
      amount: Number(amount),
      category,
      date,
    });

    try {
      if (editingId) {
        const updated = await apiRequest(`/api/expenses/${editingId}`, {
          method: "PUT",
          body,
        });
        setExpenses((prev) =>
          sortNewestFirst(prev.map((x) => (x._id === editingId ? updated : x)))
        );
      } else {
        const created = await apiRequest("/api/expenses", {
          method: "POST",
          body,
        });
        setExpenses((prev) => sortNewestFirst([created, ...prev]));
      }
      resetForm();
    } catch (err) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this expense?")) return;
    setError("");

    try {
      await apiRequest(`/api/expenses/${id}`, { method: "DELETE" });
      setExpenses((prev) => prev.filter((x) => x._id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      handleApiError(err);
    }
  }

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryOptions = CATEGORIES.includes(category)
    ? CATEGORIES
    : [category, ...CATEGORIES];

  return (
    <div className="app wide">
      <div className="header-row">
        <h1>Welcome, {user ? user.name : "guest"}</h1>
        <button className="secondary" onClick={handleLogout}>
          Log out
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <Charts refreshKey={expenses} />

      <h2>{editingId ? "Edit expense" : "Add expense"}</h2>
      <form className="expense-form" onSubmit={handleSubmit}>
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
            {categoryOptions.map((c) => (
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

        <div className="form-buttons">
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save changes" : "Add expense"}
          </button>
          {editingId && (
            <button type="button" className="secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
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
                <div className="row-actions">
                  <span className="amount">{exp.amount.toLocaleString()}</span>
                  <button className="small" onClick={() => handleEdit(exp)}>
                    Edit
                  </button>
                  <button
                    className="small danger"
                    onClick={() => handleDelete(exp._id)}
                  >
                    Delete
                  </button>
                </div>
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