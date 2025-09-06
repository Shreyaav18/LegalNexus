import React, {useState} from 'react'
import { useNavigate } from 'react-router-dom';
import { FaBalanceScale } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './register.css'

function Register() {
    const [details, setDetails] = useState({
      username: '',
      email: '',
      password: '',
      confirm: '',
      dob: '',
      userType: 'regular'
    });
  
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
  
    const handleChange = (e) => {
      setDetails({ ...details, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (details.password !== details.confirm) {
            alert("Passwords don't match!");
            return;
        }
      
        const payload = {
          username: details.username,
          email: details.email,
          password: details.password
        };
      
        try {
          const response = await fetch("http://localhost:8000/register/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      
          const data = await response.json();
          console.log("Response:", data);
      
          if (response.ok) {
            alert("Registered successfully!");
            localStorage.setItem("token", data.token);
            navigate("/login");
          } else {
            alert("Error: " + JSON.stringify(data));
          }
        } catch (error) {
          console.error("Error:", error);
          alert("Registration failed.");
        }
      };
      

    return(

        <><header className="bg-primary text-white p-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
                <FaBalanceScale size={32} className="me-2" />
                <h1 className="h4">Legal Nexus</h1>
            </div>
            <nav>
                <a href="/" className="text-white me-3 text-decoration-none">Home</a>
                <a href="/register" className="text-white me-3 text-decoration-none">Register</a>
                <a href="/login" className="text-white text-decoration-none">Login</a>
            </nav>
        </header>
        
        <div className='container mt-5'>
                <h2 className='mb-4'>Register Yourself!</h2>
                {message && <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className='mb-3'>
                        <label className='form-label'>Username</label>
                        <input 
                            type='text' 
                            name='username' 
                            value={details.username} 
                            onChange={handleChange} 
                            className='form-control' 
                            required
                        />
                    </div>

                    <div className='mb-3'>
                        <label className='form-label'>Email</label>
                        <input 
                            type='email' 
                            value={details.email} 
                            name='email' 
                            onChange={handleChange} 
                            className='form-control' 
                            required
                        />
                    </div>

                    <div className='mb-3'>
                        <label className='form-label'>Password</label>
                        <input 
                            type='password' 
                            name='password' 
                            value={details.password} 
                            onChange={handleChange} 
                            className='form-control' 
                            required
                        />
                    </div>

                    <div className='mb-3'>
                        <label className='form-label'>Confirm Password</label>
                        <input 
                            type='password' 
                            name='confirm' 
                            value={details.confirm} 
                            onChange={handleChange} 
                            className='form-control' 
                            required
                        />
                    </div>

                    <div className='mb-3'>
                        <label className='form-label'>Date of Birth</label>
                        <input 
                            type='date' 
                            name='dob' 
                            value={details.dob} 
                            onChange={handleChange} 
                            className='form-control' 
                            required
                        />
                    </div>

                    <div className='mb-3'>
                        <label className='form-label'>User Type</label>
                        <select 
                            name='userType' 
                            value={details.userType} 
                            onChange={handleChange} 
                            className='form-control' 
                            required
                        >
                            <option value="regular">Regular User</option>
                            <option value="Law Firm">Law Firm</option>
                        </select>
                    </div>

                    <button type='submit' className='btn btn-primary'>Register</button>
                </form>
            </div></>
    )
}

export default Register;