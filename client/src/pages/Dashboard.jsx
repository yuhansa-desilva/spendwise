import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="app">
      <h1>Dashboard</h1>
      <p>Your expenses and charts will appear here.</p>
      <p>
        <Link to="/login">Back to login</Link>
      </p>
    </div>
  );
}

export default Dashboard;