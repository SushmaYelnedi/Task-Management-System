import React from 'react';
import { Link } from 'react-router-dom';
import orbiflowLogo from '../assets/OrbiFlow.png';

const Home = () => {
  return (
    <div className="App">
      {/* Enhanced Header */}
      <header className="header">
        <div className="container">
          <div className="nav-brand">
            <img src={orbiflowLogo} alt="OrbiFlow" className="logo-image" />
          </div>
          <nav className="nav">
            <a href="#features" className="nav-link">Features <span className="nav-subtitle">Organize & Track Tasks</span></a>
            <a href="#pricing" className="nav-link">Pricing <span className="nav-subtitle">Affordable Plans</span></a>
            <a href="#about" className="nav-link">About <span className="nav-subtitle">Our Story & Mission</span></a>
            <a href="#contact" className="nav-link">Contact <span className="nav-subtitle">Get in Touch</span></a>
          </nav>
          <div className="auth-buttons">
            <Link to="/signin" className="btn btn-outline">Login</Link>
            <Link to="/signup" className="btn btn-primary">Sign Up</Link>
          </div>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Organize Your Tasks,<br />
                <span className="gradient-text">Achieve More Every Day</span>
              </h1>
              <p className="hero-subtitle">
                Transform your productivity with OrbiFlow's intuitive task management.
                Plan projects, collaborate with teams, and never miss a deadline again.
              </p>
              <div className="hero-cta">
                <Link to="/signup" className="btn btn-primary btn-large">Get Started Free</Link>
                <button className="btn btn-outline btn-large">Watch Demo</button>
              </div>
            </div>
            <div className="hero-image">
              <div className="hero-illustration">
                {/* Task Board Illustration */}
                <div className="task-board">
                  <div className="task-column">
                    <h4>To Do</h4>
                    <div className="task-item">Design Homepage</div>
                    <div className="task-item">Write Documentation</div>
                  </div>
                  <div className="task-column">
                    <h4>In Progress</h4>
                    <div className="task-item">Develop API</div>
                    <div className="task-item">User Testing</div>
                  </div>
                  <div className="task-column">
                    <h4>Done</h4>
                    <div className="task-item">Setup Database</div>
                    <div className="task-item">Create Mockups</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Everything you need to stay organized</h2>
            <p className="section-subtitle">Powerful features to boost your team's productivity</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Task Management</h3>
              <p>Create, organize, and prioritize tasks with intuitive drag-and-drop interface.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Team Collaboration</h3>
              <p>Assign tasks, track progress, and communicate seamlessly with your team.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>Monitor project progress with detailed analytics and reporting tools.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <h3>Deadline Management</h3>
              <p>Never miss a deadline with smart notifications and reminder systems.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Role-Based Access</h3>
              <p>Secure access control with Admin, Manager, and Employee roles.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Responsive Design</h3>
              <p>Access your tasks anywhere, anytime with our mobile-friendly interface.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">What our users say</h2>
            <p className="section-subtitle">Trusted by teams worldwide</p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial">
              <div className="testimonial-content">
                <p>"OrbiFlow transformed how our team manages projects. The intuitive interface and powerful features help us stay organized and meet every deadline."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">S</div>
                <div className="author-info">
                  <span className="author-name">Sarah Johnson</span>
                  <span className="author-role">Project Manager</span>
                </div>
              </div>
            </div>
            <div className="testimonial">
              <div className="testimonial-content">
                <p>"The role-based access control is perfect for our organization. Employees, managers, and admins all have exactly what they need."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">M</div>
                <div className="author-info">
                  <span className="author-name">Mike Chen</span>
                  <span className="author-role">IT Director</span>
                </div>
              </div>
            </div>
            <div className="testimonial">
              <div className="testimonial-content">
                <p>"Simple, effective, and exactly what we needed. OrbiFlow helped us increase our team productivity by 40%."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">A</div>
                <div className="author-info">
                  <span className="author-name">Alex Rivera</span>
                  <span className="author-role">Team Lead</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Ready to boost your productivity?</h2>
            <p className="cta-subtitle">Join thousands of teams already using OrbiFlow to achieve their goals.</p>
            <div className="cta-buttons">
              <Link to="/signup" className="btn btn-primary btn-large">Get Started Free</Link>
              <button className="btn btn-outline btn-large">Schedule Demo</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <img src={orbiflowLogo} alt="OrbiFlow" className="footer-logo" />
              <p>Empowering teams to achieve more through better task management.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#integrations">Integrations</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#careers">Careers</a>
                <a href="#contact">Contact</a>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="#help">Help Center</a>
                <a href="#docs">Documentation</a>
                <a href="#status">Status</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 OrbiFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;