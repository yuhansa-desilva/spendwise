import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [status, setStatus] = useState("Checking backend...");

  useEffect(() => {
    fetch(`${API_URL}/`)
      .then((res) => res.json())
      .then((data) => setStatus(data.message))
      .catch(() => setStatus("Could not reach the backend"));
  }, []);

  return (
    <div className="app">
      <h1>SpendWise</h1>
      <p>Backend says: {status}</p>
    </div>
  );
}

export default App;