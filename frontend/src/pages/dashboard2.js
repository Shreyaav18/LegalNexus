import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";

export default function UserDashboard() {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    fetch("https://api.quotable.io/random?tags=inspirational")
      .then(res => res.json())
      .then(data => setQuote(data.content))
      .catch(err => setQuote("Justice is truth in action. - Benjamin Disraeli"));
  }, []);

  return (
    <div style={{ background: 'linear-gradient(to right, #e3f2fd, #bbdefb)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-white p-4 mb-4 d-flex justify-content-between align-items-center shadow"
        style={{ backgroundColor: '#0d47a1' }}
      >
        <div>
          <h2 className="mb-0">Welcome to LawAI</h2>
          <p className="mb-0">Empowering Justice with Technology</p>
        </div>
        <button className="btn btn-light fw-semibold">Logout</button>
      </motion.header>

      <div className="flex-grow-1 px-5">
        <div className="row gy-5 gx-5">
          {/* Left Column */}
          <div className="col-lg-6 d-flex flex-column gap-5">
            {/* User Profile */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="card shadow-lg border-0 rounded-4 p-4">
                <h5 className="text-primary">👤 User Profile</h5>
                <p><strong>Name:</strong> Jane Doe</p>
                <p><strong>Email:</strong> jane.doe@example.com</p>
                <p><strong>Member Since:</strong> Jan 2024</p>
              </div>
            </motion.div>

            {/* Legal Tip of the Day */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="card shadow-lg border-0 rounded-4 p-4">
                <h5 className="text-primary">📘 Legal Tip of the Day</h5>
                <p className="mb-0">Always read contracts carefully before signing, and seek legal advice if unsure.</p>
              </div>
            </motion.div>

            {/* Daily Quote */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
              <div className="card shadow-lg border-0 rounded-4 p-4 bg-light">
                <h5 className="text-primary">💬 Daily Quote</h5>
                <blockquote className="mb-0 fst-italic">{quote}</blockquote>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <div className="card shadow-lg border-0 rounded-4 p-4">
                <h5 className="text-primary">🔗 Quick Links</h5>
                <div className="d-flex gap-3 flex-wrap">
                  <button className="btn btn-outline-primary rounded-pill px-4">View Cases</button>
                  <button className="btn btn-outline-primary rounded-pill px-4">Legal Guidelines</button>
                  <button className="btn btn-outline-primary rounded-pill px-4">Submit Document</button>
                  <button className="btn btn-outline-primary rounded-pill px-4">Request Lawyer</button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="col-lg-6 d-flex flex-column gap-5">
            {/* Latest News */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="card shadow-lg border-0 rounded-4 p-4">
                <h5 className="text-primary">📰 Latest Legal News</h5>
                <ul className="mb-0">
                  <li>Supreme Court issues new guidelines on cybercrime.</li>
                  <li>Amendments made to data privacy law.</li>
                  <li>Online dispute resolution platform launched.</li>
                </ul>
              </div>
            </motion.div>

            {/* Case Progress */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="card shadow-lg border-0 rounded-4 p-4">
                <h5 className="text-primary">📈 Case Progress</h5>
                <div className="mb-3">
                  <strong>Case #1456 - Investigation Phase</strong>
                  <div className="progress rounded-pill" style={{ height: '20px' }}>
                    <div className="progress-bar bg-info" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <strong>Case #2378 - Trial Scheduled</strong>
                  <div className="progress rounded-pill" style={{ height: '20px' }}>
                    <div className="progress-bar bg-success" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Upcoming Hearings */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <div className="card shadow-lg border-0 rounded-4 p-4">
                <h5 className="text-primary">📅 Upcoming Hearings</h5>
                <ul className="mb-0">
                  <li><strong>Case #1456:</strong> April 10, 2025</li>
                  <li><strong>Case #2378:</strong> April 15, 2025</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <footer className="text-white text-center p-3 mt-5" style={{ backgroundColor: '#0d47a1' }}>
        &copy; {new Date().getFullYear()} LawAI. All rights reserved.
      </footer>
    </div>
  );
}


<div className="alert alert-info mt-4">
              <strong>Demo Login:</strong><br />
              Username: <code>demo@lawfirm.com</code><br />
              Password: <code>demo123</code><br />
              Type: <code>Law Firm</code><br />
              <Link 
                to="/lawfirmdashboard"
                className="btn btn-outline-secondary btn-sm mt-2"
                onClick={() => {
                  setUsername("demo_lawfirm@gmail.com");
                  setPassword("password123");
                  setUserType("Law Firm");
                }}
              >
                Autofill Demo Credentials
              </Link> {/* ✅ Proper closing tag */}
            </div>
