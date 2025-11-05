// Session validation script for protected pages
// Add this script to all pages that require authentication

(function() {
    'use strict';
    
    // Check if user is logged in
    function checkAuthentication() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');
        const loggedInUser = sessionStorage.getItem('loggedInUser');
        
        // If not logged in, redirect to login page
        if (isLoggedIn !== 'true' || !loggedInUser) {
            // Clear any remaining session data
            sessionStorage.clear();
            
            // Redirect to login page
            window.location.replace('../login/login_page.html');
            return false;
        }
        
        return true;
    }
    
    // Prevent back button after logout
    function preventBackButton() {
        window.history.pushState(null, null, window.location.href);
        
        window.addEventListener('popstate', function(event) {
            // Check if still logged in
            if (sessionStorage.getItem('isLoggedIn') !== 'true') {
                window.location.replace('../login/login_page.html');
            } else {
                window.history.pushState(null, null, window.location.href);
            }
        });
    }
    
    // Logout function for navbar logout button
    window.handleLogout = function(event) {
        if (event) {
            event.preventDefault();
        }
        
        // Clear all session data
        sessionStorage.clear();
        
        // Clear browser cache for this session
        if (window.caches) {
            caches.keys().then(function(names) {
                for (let name of names) {
                    caches.delete(name);
                }
            });
        }
        
        // Redirect to welcome page and prevent back navigation
        window.location.replace('../index.html');
    };
    
    // Check session on page load
    window.addEventListener('load', function() {
        if (checkAuthentication()) {
            preventBackButton();
        }
    });
    
    // Check session periodically (every 5 seconds)
    setInterval(function() {
        if (sessionStorage.getItem('isLoggedIn') !== 'true') {
            sessionStorage.clear();
            window.location.replace('../login/login_page.html');
        }
    }, 5000);
    
})();
