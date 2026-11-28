import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="app">
      <h1>Welcome, {user ? user.name : "guest"}</h1>
      <p>Your expenses and charts will appear here.</p>
      <button className="secondary" onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
}

export default Dashboard;