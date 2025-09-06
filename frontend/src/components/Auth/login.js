import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBalanceScale } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

function LoginPage() {
  const[userType, setUserType]=useState('regular');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const response = await fetch('http://127.0.0.1:8000/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username,
        password,
        userType,
      })
    });
  
    const data = await response.json();
  
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', data.userType);
  
      if (userType === 'Law Firm') {
        navigate('/lawfirmdashboard');
      } else {
        navigate('/user-dashboard');
      }
    } else {
      alert(data.error || 'Login failed');
    }
  };

  return (
    <div className="min-vh-100 bg-light text-dark">
      {/* Header */}
      <header className="bg-primary text-white p-3 d-flex align-items-center justify-content-between" >
        <div className="d-flex align-items-center">
          <FaBalanceScale size={32} className="me-2" />
          <h1 className="h4">Justice Platform</h1>
        </div>
        <nav >
          <a href="/" className="text-white me-3 text-decoration-none">Home</a>
          <a href="/register" className="text-white me-3 text-decoration-none">Register</a>
          <a href="/login" className="text-white text-decoration-none">Login</a>
        </nav>
      </header>

      {/* Login Form */}
      <section className="d-flex flex-column align-items-center justify-content-center mt-5">
        <h2 className="mb-3">Welcome Back</h2>
        <p className="text-secondary mb-4">Log in to access your dashboard.</p>

        <div style={{ backgroundColor: '#e7f3fe', border: '1px solid #2196f3', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
        <strong>Demo Credentials:</strong><br />
        <b>Law Firm:</b> <code>demo_lawfirm</code> / <code>password123</code><br />
        <b>Regular User:</b> <code>demo_user</code> / <code>password123</code>
      </div>
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow w-100" style={{ maxWidth: '400px' }}>

          <div className='mb-3'>
            <label className="form-label">User Type: </label>
            <select name="userType" value={userType} onChange={(e)  => setUserType(e.target.value)} className="form-select">
              <option value="regular">Regular User</option>
              <option value="Law Firm">Law Firm</option>
            </select> 
          </div>
        
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="mt-5 bg-dark text-white text-center py-3">
        <p>&copy; 2025 Justice Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LoginPage;