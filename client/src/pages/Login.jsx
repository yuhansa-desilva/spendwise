import { Link } from "react-router-dom";

function Login() {
  return (
    <div className="app">
      <h1>Log in</h1>
      <p>The login form is coming in the next step.</p>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default Login;