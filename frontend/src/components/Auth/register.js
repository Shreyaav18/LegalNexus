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
    });
  
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
  
    const handleChange = (e) => {
      setDetails({ ...details, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = async (e) => {
        e.preventDefault();
      
        const payload = {
          username: details.username,  // ✅ must match serializer
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
            alert("Registered!");
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
                        <label className='form-label'>Name</label>
                        <input type='text' name='user_name' value={details.user_name} onChange={handleChange} className='form-control' required>

                        </input>
                    </div>

                    <div className='mb-3'>
                        <label className='form-label'> Email</label>
                        <input type='email' value={details.user_email} name='user_email' onChange={handleChange} className='form-control' required></input>
                    </div>

                    <div className='mb-3'>
                        <label className='form-label'> Password</label>
                        <input type='password' name='user_password' value={details.user_password} onChange={handleChange} className='form-control' required></input>
                    </div>

                    <div className='mb-3'>
                        <label className='form-label'>Re-enter your password</label>
                        <input type='password' name='user_confirm' value={details.user_confirm} onChange={handleChange} className='form-control' required></input>
                    </div>

                    <div className='mb-3'>
                        <label className='form-label'> Date of Birth</label>
                        <input type='date' name='user_dob' value={details.user_dob} onChange={handleChange} className='form-control' required></input>
                    </div>

                    <div className='mb-3'>
                        <label classname='form-label'>User type</label>
                        <select name='user_type' value={details.user_type} onChange={handleChange} className='=form-control' required>
                            <option value="regular">Users</option>
                            <option value="judicial department"> Law Firm</option>
                        </select>
                    </div>

                    <button type='submit' className='btn btn-primary'>Register</button>
                </form>
            </div></>
    )
}


export default Register;
