export async function login() {
    const adminPanelBtn = document.getElementById('adminPanelBtn');
    const loginDialog = document.getElementById('login-dialog');
    const loginBtn = document.getElementById('loginButton');
    const navContainer = document.getElementById('nav-container');
    const loginInput = document.getElementById('login');
    const passwordInput = document.getElementById('password');
    const closeBtn = document.getElementById('closeBtn');
    const loginForm = document.getElementById('login-form');
    const adminPanelLabel = document.getElementById('adminPanelLabel');
    let isLoggedIn = false;

    if (!adminPanelBtn || !loginDialog || !loginBtn || !navContainer || !loginInput || !passwordInput || !closeBtn || !loginForm || !adminPanelLabel) {
        console.error("Login elements are missing from the page");
        return;
    }

    function setLoggedIn(loggedIn) {
        isLoggedIn = loggedIn;
        navContainer.hidden = !loggedIn;
        adminPanelLabel.textContent = loggedIn ? 'Logout' : 'Admin';
    }

    async function logOut() {
        await fetch("/logout", {
            method: "POST",
            credentials: "same-origin"
        });

        setLoggedIn(false);
    }

    const errorMessage = document.createElement('p');
    errorMessage.className = 'login-error';
    errorMessage.hidden = true;
    loginBtn.insertAdjacentElement('afterend', errorMessage);

    setLoggedIn(false);

    try {
        const sessionResponse = await fetch("/session", {
            credentials: "same-origin"
        });

        if (sessionResponse.ok) {
            const session = await sessionResponse.json();
            setLoggedIn(Boolean(session.authenticated));
        }
    } catch (error) {
        console.error("Session check failed:", error);
    }

    adminPanelBtn.addEventListener('click', async () => {
        if (isLoggedIn) {
            try {
                await logOut();
            } catch (error) {
                console.error("Logout failed:", error);
                alert("Could not log out.");
            }
            return;
        }

        loginDialog.showModal();
    });

    closeBtn.addEventListener('click', () => {
        loginDialog.close();
    });

    loginForm.addEventListener('submit', event => {
        event.preventDefault();
    });

    loginBtn.addEventListener('click', async () => {
        const username = loginInput.value.trim();
        const password = passwordInput.value;

        try {
            const response = await fetch("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const result = await response.json().catch(() => ({}));

                if (response.status === 401) {
                    errorMessage.textContent = result.error || 'Invalid login or password';
                    errorMessage.hidden = false;
                    return;
                }
                
                throw new Error(result.error || `Login failed: ${response.status}`);
            }

            setLoggedIn(true);
            errorMessage.hidden = true;
            loginInput.value = '';
            passwordInput.value = '';
            loginDialog.close();
        } catch (error) {
            console.error("Login failed:", error);
            errorMessage.textContent = 'Could not connect to the login server';
            errorMessage.hidden = false;
        }
    });
}
