import { Link } from "react-router-dom";

function Register() {
  return (
    <div className="app">
      <h1>Register</h1>
      <p>The register form is coming in the next step.</p>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

export default Register;