
import React, { createContext, useState, useEffect, useContext } from 'react';

// --- Authorization Context ---
const AuthContext = createContext();

// Mock JWT
const MOCK_TOKEN_SECRET = 'secret_key';
const TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 mins for demo

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Generate Token
    const generateToken = (email) => {
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const payload = btoa(JSON.stringify({
            email,
            exp: Date.now() + TOKEN_EXPIRY_MS
        }));
        return `${header}.${payload}.${MOCK_TOKEN_SECRET}`;
    };

    // Schedule Refresh
    const scheduleRefresh = (delay) => {
        setTimeout(() => {
            if (sessionStorage.getItem('authToken')) {
                // Check if still logged in
                const newToken = generateToken('ompatel@gmail.com');
                sessionStorage.setItem('authToken', newToken);
                console.log("Silent Token Refresh...");
                scheduleRefresh(TOKEN_EXPIRY_MS - 60 * 1000);
            }
        }, Math.max(0, delay));
    };

    // Initialize auth state from sessionStorage on load
    useEffect(() => {
        const token = sessionStorage.getItem('authToken');
        if (token) {
            // Simple mock validation
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp > Date.now()) {
                    setUser({ email: payload.email });
                    scheduleRefresh(payload.exp - Date.now());
                } else {
                    logout(); // Expired
                }
            } catch (e) {
                logout(); // Invalid
            }
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Mock API call
        if (email === 'ompatel@gmail.com' && password === 'Test@123') {
            const token = generateToken(email);
            sessionStorage.setItem('authToken', token);
            setUser({ email });
            scheduleRefresh(TOKEN_EXPIRY_MS - 60000); // Refresh 1 min before expiry
            return true;
        }
        return false;
    };

    const logout = () => {
        sessionStorage.removeItem('authToken');
        setUser(null);
    };



    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

// --- Higher Order Component for Protection ---
export const withAuth = (WrappedComponent) => {
    return (props) => {
        const { user } = useAuth();
        if (!user) {
            // Redirect logic handled by router usually, but here we can return null or Login
            // Ideally, HOC works with routing.
            return null;
        }
        return <WrappedComponent {...props} />;
    };
};
