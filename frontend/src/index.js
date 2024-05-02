import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './index.css';
import UserProfile from './User';
import Home from './App';
import reportWebVitals from './reportWebVitals';
import ForgotPassword from './PasswordRecovery';
import Registration from './components/Register';
import ContactUs from './Contactus';
import PricingPage from './Pricing';
import NotFound from './components/NotFound';
import Dashboard from './Dashboard';
import PropertyManagement from './Properties';
import Tenants from './Tenants';
import MaintenanceModal from './Maintenance';
import Financials from './Financials';

const container = document.getElementById('root');
const root = createRoot(container); 

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="*" element={<NotFound/>}/>
        <Route path="/" element={<Navigate replace to="/App" />} />
        <Route path="/User" element={<UserProfile />} />
        <Route path="/App" element={<Home />} />
        <Route path="/PasswordRecovery" element={<ForgotPassword />} />
        <Route path="/Register" element={<Registration/>}/>
        <Route path="/ContactUs" element={<ContactUs/>}/>
        <Route path="/Pricing"  element={<PricingPage/>}/>
        <Route path="/Dashboard"  element={<Dashboard/>}/>
        <Route path="/Properties" element={<PropertyManagement/>}/>
        <Route path='/Tenants' element= {<Tenants/>}/>
        <Route path='/Maintenance' element=  {<MaintenanceModal/>}/>
        <Route path='/Financials' element=  {<Financials/>}/>
        </Routes>
    </Router>
  </React.StrictMode>
);

// Reporting web vitals
reportWebVitals();