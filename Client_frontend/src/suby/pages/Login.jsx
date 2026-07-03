import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // ✅ Added Link
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('https://food-delivery-application-zcdk.onrender.com/api/login', { email, password });
      localStorage.setItem('token', res.data.token);
      alert('Login successful');
      navigate('/');
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="auth-btn">Login</button>
      </form>

      {/* ✅ Signup link added here */}
      <p style={{ marginTop: '1rem' }}>
        Don't have an account?{' '}
        <Link to="/signup" style={{ color: 'blue', textDecoration: 'underline' }}>
          Signup here
        </Link>
      </p>
    </div>
  );
};

export default Login;
