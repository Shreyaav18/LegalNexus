import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBalanceScale } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

function LoginPage() {
  const [userType, setUserType] = useState('client'); // Changed from 'regular'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Updated API endpoint
      const response = await fetch('http://127.0.0.1:8000/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password,
          // Remove userType from request body as backend doesn't need it for login
        })
      });
    
      const data = await response.json();
    
      if (response.ok) {
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('userType', data.user_type); // Backend returns user_type
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('username', data.user.username);
    
        // Navigate based on actual user type from backend
        if (data.user_type === 'lawyer') {
          navigate('/lawfirmdashboard');
        } else if (data.user_type === 'client') {
          navigate('/user-dashboard');
        } else if (data.user_type === 'admin') {
          navigate('/admin-dashboard'); // Optional admin dashboard
        }
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light text-dark">
      {/* Header */}
      <header className="bg-primary text-white p-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <FaBalanceScale size={32} className="me-2" />
          <h1 className="h4">Legal Nexus</h1> {/* Updated name */}
        </div>
        <nav>
          <a href="/" className="text-white me-3 text-decoration-none">Home</a>
          <a href="/register" className="text-white me-3 text-decoration-none">Register</a>
          <a href="/login" className="text-white text-decoration-none">Login</a>
        </nav>
      </header>

      {/* Login Form */}
      <section className="d-flex flex-column align-items-center justify-content-center mt-5">
        <h2 className="mb-3">Welcome Back</h2>
        <p className="text-secondary mb-4">Log in to access your dashboard.</p>

        {/* Updated Demo Credentials */}
        <div style={{ backgroundColor: '#e7f3fe', border: '1px solid #2196f3', padding: '15px', marginBottom: '20px', borderRadius: '5px', maxWidth: '400px' }}>
          <strong>Demo Credentials:</strong><br />
          <b>Admin:</b> <code>admin</code> / <code>admin123</code><br />
          <b>Lawyers:</b><br />
          • <code>sarah_johnson</code> / <code>password123</code><br />
          • <code>michael_brown</code> / <code>password123</code><br />
          • <code>emily_davis</code> / <code>password123</code><br />
          <b>Clients:</b><br />
          • <code>john_doe</code> / <code>password123</code><br />
          • <code>jane_smith</code> / <code>password123</code><br />
          • <code>robert_wilson</code> / <code>password123</code>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow w-100" style={{ maxWidth: '400px' }}>
          {/* Removed user type selector since backend determines user type */}
          
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-control"
              required
              disabled={loading}
              placeholder="Enter your username"
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
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          <div className="mt-3 text-center">
            <p className="mb-0">
              Don't have an account? <Link to="/register" className="text-primary">Register here</Link>
            </p>
          </div>
        </form>
      </section>

      {/* Footer */}
      <footer className="mt-5 bg-dark text-white text-center py-3">
        <p>&copy; 2025 Legal Nexus. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LoginPage;