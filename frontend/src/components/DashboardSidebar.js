import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from "firebase/auth";
import ChatButton from './ChatButton';

function DashboardSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleSignOut = () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            navigate('/App');
        }).catch((error) => {
            console.error('Sign out error', error);
        });
    };

    const toggleSidebar = () => {
        setIsOpen(prevState => !prevState);
        document.body.style.overflow = !isOpen ? 'hidden' : 'auto';
    };

    return (
        <>
            <div className="d-flex align-items-center">
                <button className="btn burger-button" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebarOffcanvas" aria-controls="sidebarOffcanvas" onClick={toggleSidebar}>
                    <i className="fas fa-bars ps-2 pt-2 fa-2x"></i>
                </button>
            </div>
            <div className="offcanvas offcanvas-start text-bg-dark" data-bs-backdrop="false" tabIndex="-1" id="sidebarOffcanvas" aria-labelledby="sidebarOffcanvasLabel">
                <div className="offcanvas-header d-flex align-items-center justify-content-between">
                <h5 className="offcanvas-title mx-auto" id="sidebarOffcanvasLabel">Easy Lets PMS</h5>
                    <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close" onClick={toggleSidebar}></button>
                </div>
                <div className="offcanvas-body">
                    <nav className="nav flex-column">
                        <li className="nav-item">
                            <Link to="/dashboard" className="nav-link text-white" onClick={toggleSidebar}>
                                <i className="fas fa-tachometer-alt"></i> Dashboard</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/properties" className="nav-link text-white" onClick={toggleSidebar}>
                                <i className="fas fa-home"></i> Properties</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/tenants" className="nav-link text-white" onClick={toggleSidebar}>
                                <i className="fas fa-user"></i> Tenants</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/maintenance" className="nav-link text-white" onClick={toggleSidebar}>
                                <i className="fas fa-wrench"></i> Maintenance</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/financials" className="nav-link text-white" onClick={toggleSidebar}>
                                <i className="fas fa-dollar-sign"></i> Financials</Link>
                        </li>
                    </nav>
                    <div className="sign-out-button mt-3">
                        <button onClick={handleSignOut} className="btn btn-primary w-100">Sign Out</button>
                    </div>
                    <ChatButton />
                </div>
            </div>
        </>
    );
}

export default DashboardSidebar;
