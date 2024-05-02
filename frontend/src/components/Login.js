import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import ChatButton from './ChatButton';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import firebaseConfig from '../firebase-config';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();
  const [alertVariant, setAlertVariant] = useState('danger');
  const [alertMessage, setAlertMessage] = useState('');

  const auth = getAuth();
  const handleLogin = (e) => {
    e.preventDefault();
    setShowAlert(false); // Reset alert state
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        console.log('User logged in: ', userCredential.user);
        navigate('/Dashboard'); // Navigate to dashboard after login
      })
      .catch((error) => {
        console.log("Firebase error code:", error.code); // Log the error code for debugging
      
        let errorMessage = ''; // Initialize errorMessage variable
      
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No user found with this email. Please check your email and try again.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password. Please try again.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'The email address is badly formatted.';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'The provided credentials are invalid. Please check and try again.';
            break;
          default:
            errorMessage = 'An error occurred. Please try again.';
        }
      
        // Display the custom or default error message
        setShowAlert(true);
        setAlertVariant('danger');
        setAlertMessage(errorMessage);
      });
  };

  return (
    <div className="home-container">
      <div className="login-box">
        {showAlert && <Alert variant={alertVariant}>{alertMessage}</Alert>}
        <div className="logo-container mb-2 mx-auto" style={{ width: "200px" }}/>
        <h2 className="text-center text-light mb-4">Login</h2>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Form.Group>
          <Button variant="primary" type="submit" className="w-100">Login</Button>
        </Form>
        <div className="text-center text-light mt-3">
          <Link to="/PasswordRecovery" className="text-light">Forgot Password?</Link>
        </div>
        <div className="text-center text-light mt-2">
          Don't have an account? <Link to="/register" className="text-light">Register</Link>
        </div>
        <ChatButton />
      </div>
    </div>
  );
}

export default Login;
