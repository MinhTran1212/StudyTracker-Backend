const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const submitBtn = document.getElementById('submit-btn');
const toggleLink = document.getElementById('toggle-auth-mode');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const togglePrompt = document.getElementById('toggle-prompt');
const messageDisplay = document.getElementById('message');

// Đổi tên biến đồng bộ thành API_BASE để khớp với logic bên dưới
const API_BASE = window.location.origin;
let isLoginMode = true; 

toggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    messageDisplay.innerText = ""; 

    if (isLoginMode) {
        authTitle.innerText = "Welcome Back";
        authSubtitle.innerText = "Log in to track your study grinds";
        submitBtn.innerText = "Sign In";
        togglePrompt.innerText = "Don't have an account?";
        toggleLink.innerText = "Sign Up here";
    } else {
        authTitle.innerText = "Create Account";
        authSubtitle.innerText = "Join StudyTracker to log your progress";
        submitBtn.innerText = "Sign Up";
        togglePrompt.innerText = "Already have an account?";
        toggleLink.innerText = "Sign In here";
    }
});

submitBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    messageDisplay.innerText = ""; 

    const endpointSuffix = isLoginMode ? 'login' : 'signup';
    // Gọi chính xác API_BASE đường dẫn Render
    const targetUrl = `${API_BASE}/register/${endpointSuffix}`;

    try {
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            messageDisplay.style.color = "red";
            messageDisplay.innerText = data.error || "Authentication failed";
            return;
        }

        localStorage.setItem('token', data.token);
        messageDisplay.style.color = "green";
        messageDisplay.innerText = isLoginMode ? "Logged in successfully!" : "Account created successfully!";

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);

    } catch (error) {
        messageDisplay.style.color = "red";
        messageDisplay.innerText = "Could not connect to authentication services.";
    }
});