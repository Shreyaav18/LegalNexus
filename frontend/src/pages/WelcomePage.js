import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route, Link } from "react-router-dom";


export default function LawFirmHomePage() {
  const [legalTip] = useState("Always read contracts thoroughly before signing.");

  return (
    <div className="container-fluid p-0" style={{ backgroundColor: '#e3f2fd' }}>
      {/* Top Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#003366' }}>
        <a className="navbar-brand fw-bold fs-4 ps-5" href="#">Legal Nexus</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto pe-5">
            <li className="nav-item">
              <a className="nav-link" href="#">Home</a>
            </li>

            <li className="nav-item">
            <Link to="/Priority-dashboard" className="btn btn-light me-2 px-4 py-2 rounded-pill fw-semibold shadow-sm">
              Priority Dashboard
            </Link>

            </li>

            <li className="nav-item">
            <Link to="/lawfirmdashboard" className="btn btn-light me-2 px-4 py-2 rounded-pill fw-semibold shadow-sm">
              Law Firm Dashboard
            </Link>
        
            </li>
            <li className="nav-item">
            <Link to="/user-dashboard" className="btn btn-light me-2 px-4 py-2 rounded-pill fw-semibold shadow-sm">
              User Dashboard
            </Link>

            </li>
            <li className="nav-item">
              <Link to="/login" className="btn btn-outline-light me-2 px-4 py-2 rounded-pill fw-semibold shadow-sm">Login</Link>
            </li>
            <li className="nav-item">
             <Link to="/register" className="btn btn-warning text-dark px-4 py-2 rounded-pill fw-semibold shadow-sm">Register</Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="d-flex align-items-center justify-content-between px-5 py-5 flex-wrap hero-section" style={{ background: 'linear-gradient(to right, #2193b0, #6dd5ed)', color: '#fff' }}>
        <div className="w-100 w-md-50 mb-4 mb-md-0">
          <h1 className="display-4 fw-bold mb-3">Empowering Your Legal Journey</h1>
          <p className="lead mb-4">Combining expert legal advice with AI efficiency to serve justice faster and better.</p>
          <ul className="list-unstyled mb-4">
            <li className="mb-2"><i className="bi bi-check-circle-fill text-light me-2"></i> Connect with verified lawyers</li>
            <li className="mb-2"><i className="bi bi-check-circle-fill text-light me-2"></i> Manage documents securely</li>
            <li className="mb-2"><i className="bi bi-check-circle-fill text-light me-2"></i> Track your case progress in real-time</li>
          </ul>
          <button className="btn btn-light btn-lg text-primary fw-bold">Get Started</button>
        </div>
      </header>

      {/* Info Section */}
      <section className="px-5 py-5" style={{ backgroundColor: '#e9f1f7' }}>
        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <div className="p-4 border rounded shadow-sm bg-white h-100">
              <img src="https://cdn-icons-png.flaticon.com/512/2920/2920257.png" alt="Lawyers" className="mb-3" width="60" />
              <h4 className="text-primary">Trusted Lawyers</h4>
              <p>Connect with qualified attorneys based on your legal needs.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="p-4 border rounded shadow-sm bg-white h-100">
              <img src="https://cdn-icons-png.flaticon.com/512/2910/2910768.png" alt="Documents" className="mb-3" width="60" />
              <h4 className="text-primary">Document Management</h4>
              <p>Upload, manage and retrieve your legal documents securely.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4">
            <div className="p-4 border rounded shadow-sm bg-white h-100">
              <img src="https://cdn-icons-png.flaticon.com/512/2936/2936881.png" alt="Updates" className="mb-3" width="60" />
              <h4 className="text-primary">Live Updates</h4>
              <p>Stay informed with the latest crime reports and legal news.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation + Tips Split Section */}
      <section className="px-5 py-5" style={{ backgroundColor: '#f1f7ff' }}>
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card p-4 shadow border-0 h-100">
              <h4 className="mb-3 text-success">Book a Consultation</h4>
              <input type="text" placeholder="Your Name" className="form-control mb-2" />
              <input type="email" placeholder="Email" className="form-control mb-2" />
              <input type="date" className="form-control mb-2" />
              <div className="text-center">
                <button className="btn btn-outline-success px-4">Schedule</button>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card p-4 shadow text-center h-100 d-flex flex-column justify-content-center border-0" style={{ backgroundColor: '#fffef4' }}>
              <h5 className="text-primary">Legal Tip of the Day</h5>
              <p className="lead mb-0">{legalTip}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-5 py-5 bg-white">
        <h3 className="text-center mb-4 text-primary">What Our Clients Say</h3>
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card p-4 shadow-sm border-0 h-100">
              <p className="mb-2">"Excellent legal support with fast documentation turnaround! Highly recommend."</p>
              <small className="text-muted">— Priya Sharma, Delhi</small>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card p-4 shadow-sm border-0 h-100">
              <p className="mb-2">"The updates and ease of accessing lawyers made the process stress-free."</p>
              <small className="text-muted">— Rohan Mehta, Mumbai</small>
            </div>
          </div>
        </div>
      </section>
      <footer className="text-white text-center p-3 mt-5" style={{ backgroundColor: '#0d47a1' }}>
        &copy; {new Date().getFullYear()} LawAI. All rights reserved.
      </footer>
    </div>
  );
}
