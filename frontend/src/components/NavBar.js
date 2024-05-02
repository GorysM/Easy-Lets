import React, { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

function NavigationBar() {
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;  
    document.body.style.overflow = 'visible';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <nav className="navbar navbar-dark bg-dark fixed-top ">
      <div className="container-fluid">
        <div className="row w-100">
          <div className="col text-center">
            <Link className="navbar-brand" to="/">
              <img src="logo.png" className="custom-logo" alt="Logo" style={{ width: '40px', borderRadius: '100px' }} />
            </Link>
            <Link className="navbar-brand ps-2" to="/App">
              Easy Lets
            </Link>
          </div>
          <div className="col-auto">
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasDarkNavbar"
              aria-controls="offcanvasDarkNavbar"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
        </div>
        <div className="offcanvas offcanvas-end text-bg-dark" tabIndex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="offcanvasDarkNavbarLabel">Menu Options</h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body">
            <ul className="navbar-nav flex-grow-1 pe-3 text-center">
              <li className="nav-item">
                <Link className="nav-link active " aria-current="page" to="/App">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/Pricing">
                  Pricing
                </Link>
              </li>
              <li className="nav-item dropdown ">
                <Link
                  className="nav-link dropdown-toggle "
                  to="/User"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  User
                </Link>
                <ul className="dropdown-menu bg-dark ">
                  <li>
                    <Link className="dropdown-item text-light" to="/User">
                      Login
                    </Link>
                  </li>
                  <hr className="dropdown-divider" />
                  <li>
                    <Link className="dropdown-item text-light" to="/Register">
                      Register
                    </Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <Link className="dropdown-item text-light" to="/ContactUs">
                      Contact us
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export { NavigationBar };