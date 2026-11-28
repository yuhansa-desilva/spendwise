import { Link } from "react-router-dom";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="app">
      <h1>Welcome, {user ? user.name : "guest"}</h1>
      <p>Your expenses and charts will appear here.</p>
      <p>
        <Link to="/login">Back to login</Link>
      </p>
    </div>
  );
}

export default Dashboard;