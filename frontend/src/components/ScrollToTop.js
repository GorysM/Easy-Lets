import React from 'react';

const ScrollToTop = () => {
  const scrollToTop = () => {
    try {
      // For modern browsers
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      // For older browsers
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0; // For Safari
    } catch (error) {
      console.error('Failed to scroll to top:', error);
    }
  };

  return (
    <div className="position-fixed bottom-0 start-0 mb-2 ms-2">
      <button
        onClick={scrollToTop}
        className="btn-lg btn-outline-warning"
        style={{ cursor: 'pointer' }}
      >
        <div className="fas fa-arrow-up"/>
      </button>
    </div>
);
};

export default ScrollToTop;
