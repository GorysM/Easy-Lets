import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Alert } from 'react-bootstrap';
import { NavigationBar } from './NavBar';
import ChatButton from './ChatButton';
// Firebase imports
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; // Import for Firebase Authentication
import { doc, setDoc } from "firebase/firestore"; // Import for Firestore
import { db } from '../firebase-config'; // Import the Firestore instance

const Registration = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const navigate = useNavigate();

  const handleRegistration = (e) => {
    e.preventDefault();
    const auth = getAuth(); // Initialize Firebase Auth

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // Create a document in Firestore for the new user
        const userDocRef = doc(db, "User", user.uid); 
        return setDoc(userDocRef, {
          name: name,
          email: email,
          password: password,
          createdAt: new Date(), // Store the creation date
        });
      })
      .then(() => {
        console.log('User document created in Firestore');
        navigate('/Dashboard'); // Navigate to dashboard after registered
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.error('Registration error:', errorMessage);
        setAlertMessage(`Registration failed: ${errorMessage}`);
        setShowAlert(true);
      });
  };

  return (
    <div className="home-container">
      <NavigationBar />
      <div className="register-box">
        <div className="logo-container mb-2 mx-auto" style={{ width: "200px" }}/>
        <h2 className="text-center text-light mb-4">Join Us!</h2>
        <form onSubmit={handleRegistration}>
          <div className="input-group mb-3">
            <input type="text" className="form-control" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="input-group mb-3">
            <input type="email" className="form-control" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="input-group mb-3">
            <input type="password" className="form-control" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="col-12">
            <Button variant="primary" type="submit" className="w-100">Register</Button>
          </div>
        </form>
        {showAlert && <Alert variant="danger">{alertMessage}</Alert>}
        <p className="mt-3 mb-3 text-center text-light">
          <a href="/PasswordRecovery" className="text-light">Forgot Password?</a>
        </p>
        <p className="mb-0 text-center text-light">
          Already have an account? <a href="/User" className="text-light">Login</a>
        </p>
        <ChatButton />
      </div>
    </div>
  );
};

export default Registration;
