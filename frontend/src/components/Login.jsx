// frontend/src/components/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('demouser@example.com'); // Pre-fill for convenience
    const [password, setPassword] = useState('demopass'); // Pre-fill for convenience
    const [message, setMessage] = useState('');
    const { login } = useAuth(); // Get the login function from AuthContext
    const navigate = useNavigate(); // Hook to navigate programmatically

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setMessage(''); // Clear previous messages

        const result = await login(email, password); // Call the login function from context

        if (result.success) {
            setMessage(result.message);
            // Redirect to dashboard or home page on successful login
            navigate('/items');
        } else {
            setMessage(`Error: ${result.message}`);
        }
    };

    return (
        <div className="container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            {message && (
                <p className={message.startsWith('Error') ? 'error-message' : 'success-message'}>
                    {message}
                </p>
            )}
        </div>
    );
}

export default Login;