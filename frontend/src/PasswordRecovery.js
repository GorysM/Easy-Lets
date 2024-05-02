import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { NavigationBar } from './components/NavBar';
import ChatButton from './components/ChatButton';
import 'bootstrap/dist/css/bootstrap.min.css';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const auth = getAuth(); // Initialize Firebase Auth

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(''); // Clear previous messages
    setError(''); // Clear previous errors

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setMessage('Check your email for the password reset link.'); // Display success message
      })
      .catch((error) => {
        const errorCode = error.code;
        if (errorCode === 'auth/user-not-found') {
          setError('No user found with this email. Please try again.'); // Display error message for no user found
        } else {
          setError('Failed to send password reset email. Try again later.'); // Display other error messages
        }
      });
  };

  return (
    <div className="home-container vh-100 d-flex align-items-center justify-content-center">
      <NavigationBar />
      <div className="login-box">
        <div className="logo-container mb-2 mx-auto" style={{ width: "200px" }} />
        <h2 className="text-center text-light mb-4">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3"> 
            <label className="text-light">Email Address</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" required />
          </div>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          <button type="submit" className="btn btn-primary w-100">
            Request New Password
          </button>
        </form>
        <div className="text-center text-light mt-2">
          Don't have an account? <Link to="/register" className="text-light">Register</Link>
        </div>
        <ChatButton />
      </div>
    </div>
  );
};

export default ForgotPassword;
