
function login() {
    var identifier = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ identifier: identifier, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Store identifier and session flag in sessionStorage
            sessionStorage.setItem('loggedInUser', identifier);
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('loginTime', new Date().getTime());
            
            // Prevent back button after logout
            window.history.pushState(null, null, window.location.href);
            
            if(identifier == "admin") {
                window.location.replace("../admin/admin_portal.html");
            }
            else {
                window.location.replace("../home page/home_page.html");
            }
        } else {
            alert("Invalid credentials");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    });
}

// Logout function
function logout() {
    // Clear all session data
    sessionStorage.clear();
    
    // Redirect to login and prevent back navigation
    window.location.replace("../login/login_page.html");
}

// Check if already logged in when on login page
window.addEventListener('load', function() {
    if (window.location.pathname.includes('login_page.html')) {
        if (sessionStorage.getItem('isLoggedIn') === 'true') {
            const user = sessionStorage.getItem('loggedInUser');
            if (user === 'admin') {
                window.location.replace("../admin/admin_portal.html");
            } else {
                window.location.replace("../home page/home_page.html");
            }
        }
    }
});

// Admin: Add new alumni user (userid and password same)
function addAlumniUser() {
    var userid = prompt("Enter new alumni userid:");
    if (!userid) return alert("Userid required");
    fetch("http://localhost:5000/add-user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ userid: userid })
    })
    .then(response => response.json())
    .then(data => {
        if (data.userid) {
            alert("Alumni user added: " + data.userid);
        } else {
            alert("Error: " + (data.message || data.error));
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
    });
}