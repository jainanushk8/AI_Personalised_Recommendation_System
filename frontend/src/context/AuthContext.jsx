// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, signupUser, getUserProfile } from '../api/api'; // Import API functions

// Create the Auth Context
export const AuthContext = createContext(null);

// Custom hook to use the Auth Context easily
export const useAuth = () => useContext(AuthContext);

// Auth Provider component
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null); // Stores user details like _id, username, email
    const [token, setToken] = useState(null);

    // Function to attempt login
    const login = async (email, password) => {
        try {
            const data = await loginUser(email, password); // Call API login function
            const { token: receivedToken, user: userData } = data;

            localStorage.setItem('jwtToken', receivedToken); // Store token in local storage
            localStorage.setItem('userId', userData._id); // Store user ID
            localStorage.setItem('username', userData.username); // Store username

            setToken(receivedToken);
            setUser(userData);
            setIsAuthenticated(true);
            return { success: true, message: 'Login successful!' };
        } catch (error) {
            console.error('Login failed:', error.message);
            return { success: false, message: error.message || 'Login failed' };
        }
    };

    // Function to attempt signup
    const signup = async (username, email, password) => {
        try {
            const data = await signupUser(username, email, password); // Call API signup function
            // After successful signup, often you'd automatically log them in
            // For simplicity here, we just return success and then user can manually login
            return { success: true, message: data.message || 'Signup successful!' };
        } catch (error) {
            console.error('Signup failed:', error.message);
            return { success: false, message: error.message || 'Signup failed' };
        }
    };

    // Function to logout
    const logout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('username'); // Clear username
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        // Optional: Redirect to login page after logout (handled by App.jsx routing)
    };

    // Effect to check for stored token on app load
    useEffect(() => {
        const storedToken = localStorage.getItem('jwtToken');
        const storedUserId = localStorage.getItem('userId');
        const storedUsername = localStorage.getItem('username'); // Retrieve username

        if (storedToken && storedUserId && storedUsername) {
            // Optionally verify token with backend if necessary for security
            setToken(storedToken);
            setUser({ _id: storedUserId, username: storedUsername }); // Populate user object
            setIsAuthenticated(true);
            // console.log('Authenticated from localStorage:', storedUsername); // For debugging
        }
    }, []); // Run once on component mount

    // The context value that will be provided to consumers
    const authContextValue = {
        isAuthenticated,
        user,
        token,
        login,
        signup,
        logout,
        // You can add more user-related states or functions here if needed
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};