// Admin Authentication Middleware
class AdminAuth {
    constructor() {
        // Never commit real credentials. Optionally seed via localStorage:
        // localStorage.setItem('sitefy_admin_credentials', JSON.stringify({ 'you@example.com': 'strong-password' }))
        this.adminCredentials = JSON.parse(localStorage.getItem('sitefy_admin_credentials') || '{}');
        this.sessionTimeout = 2 * 60 * 60 * 1000; // 2 hours
        this.devHosts = ['localhost', '127.0.0.1'];
        this.defaultDevCreds = { 'admin@sitefy.co': 'admin123' };
    }

    // Check if user is authenticated admin
    isAuthenticated() {
        const session = this.getSession();
        if (!session) return false;
        
        const now = Date.now();
        if (now > session.expires) {
            this.logout();
            return false;
        }
        
        return true;
    }

    // Get current session
    getSession() {
        const sessionData = localStorage.getItem('sitefy_admin_session');
        return sessionData ? JSON.parse(sessionData) : null;
    }

    // Admin login
    async login(email, password) {
        const token = (localStorage.getItem('sitefy_admin_api_token') || '').trim();
        const isLocal = this.devHosts.some(h => (window.location.hostname || '').includes(h));

        // Decide which credentials to use
        const hasSeededCreds = Object.keys(this.adminCredentials || {}).length > 0;
        const creds = hasSeededCreds ? this.adminCredentials : (isLocal ? this.defaultDevCreds : {});

        // Accept if (a) creds match OR (b) token exists (production)
        const ok = (creds[email] === password) || Boolean(token);

        if (ok) {
            const session = {
                email: email,
                role: 'admin',
                loginTime: Date.now(),
                expires: Date.now() + this.sessionTimeout
            };
            localStorage.setItem('sitefy_admin_session', JSON.stringify(session));
            return { success: true, session };
        }
        
        const msg = isLocal
            ? 'Use admin@sitefy.co / admin123 (or seed creds via console).'
            : 'Paste ADMIN_DASHBOARD_TOKEN in Advanced options to login (required in production).';
        return { success: false, message: msg };
    }

    // Admin logout
    logout() {
        localStorage.removeItem('sitefy_admin_session');
        window.location.href = '/admin-login.html';
    }

    // Extend session
    extendSession() {
        const session = this.getSession();
        if (session) {
            session.expires = Date.now() + this.sessionTimeout;
            localStorage.setItem('sitefy_admin_session', JSON.stringify(session));
        }
    }

    // Check authentication on page load
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/admin-login.html';
            return false;
        }
        
        // Auto-extend session on activity
        this.extendSession();
        return true;
    }

    // Get admin email
    getAdminEmail() {
        const session = this.getSession();
        return session ? session.email : null;
    }
}

// Global admin auth instance
window.adminAuth = new AdminAuth();
