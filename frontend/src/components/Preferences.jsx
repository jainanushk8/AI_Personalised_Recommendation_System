// frontend/src/components/Preferences.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserProfile } from '../api/api';
import styles from './Preferences.module.css'; // Import CSS Module

function Preferences() {
    const { user, token, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            // Redirect to login if not authenticated or missing user/token info
            if (!isAuthenticated || !user || !user._id || !token) {
                navigate('/login');
                return;
            }

            // Set loading state to true and clear any previous errors at the start of the fetch operation
            setLoading(true);
            setError(null);

            console.log('Fetching user profile...'); // Log to confirm when the fetch is initiated
            try {
                // Perform the API call to get user profile using the authenticated token
                const data = await getUserProfile(user._id, token);
                setProfile(data); // Update the profile state with the data received from the backend
                console.log('Profile data fetched and state updated:', data); // Log the fetched data for debugging
            } catch (err) {
                // Handle any errors during the API call
                console.error("Error fetching user profile:", err);
                setError("Failed to load user profile. Please try again.");
                // If the error is due to an invalid token, log out the user
                if (err.message.includes('Unauthorized') || err.message.includes('token')) {
                    logout();
                }
            } finally {
                // Always set loading to false after the fetch attempt completes (whether success or error)
                setLoading(false);
            }
        };

        // Call the fetch function when dependencies change
        fetchUserProfile();
    }, [isAuthenticated, user, token, navigate, logout, location.key]); // location.key ensures re-fetch on navigation

    // Conditional rendering based on loading, error, or profile state
    if (loading) {
        return <p className={styles.loadingMessage}>Loading profile...</p>;
    }

    if (error) {
        return <p className={styles.errorMessage}>{error}</p>;
    }

    if (!profile) {
        return <p className={styles.notFoundMessage}>User profile not found.</p>;
    }

    // Console logs to verify the profile and interactionHistory content just before rendering
    console.log('Rendering Preferences component. Current profile:', profile);
    console.log('Interaction History being rendered:', profile?.interactionHistory);


    return (
        <div className={styles.profileContainer}>
            <h2 className={styles.profileHeading}>Your Profile</h2>
            <div className={styles.profileDetails}>
                <div className={styles.detailItem}>
                    <strong>Username:</strong> <span>{profile.username}</span>
                </div>
                <div className={styles.detailItem}>
                    <strong>Email:</strong> <span>{profile.email}</span>
                </div>
                <div className={styles.detailItem}>
                    <strong>Role:</strong> <span>{profile.role}</span>
                </div>
            </div>

            {/* Conditionally render interactions section if history exists and has items */}
            {profile.interactionHistory && profile.interactionHistory.length > 0 && (
                <div className={styles.interactionsSection}>
                    <h3 className={styles.sectionHeading}>Your Recent Interactions</h3>
                    <ul className={styles.interactionsList}>
                        {profile.interactionHistory
                            // Sort the array by timestamp in descending order (most recent first)
                            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                            .slice(0, 10) // Then take the first 10 items (which are now the most recent)
                            .map((interaction) => (
                                <li key={interaction._id} className={styles.interactionItem}>
                                    <span className={styles.interactionType}>{interaction.interactionType}</span>&nbsp;
                                    with&nbsp;
                                    <span className={styles.interactionItemTitle}>{interaction.itemId?.title || 'Unknown Item'}</span>&nbsp;
                                    on&nbsp;
                                    <span className={styles.interactionTimestamp}>
                                        {new Date(interaction.timestamp).toLocaleString()}
                                    </span>
                                </li>
                            ))}
                    </ul>
                </div>
            )}
            {/* Display message if no interactions are recorded */}
            {profile.interactionHistory && profile.interactionHistory.length === 0 && (
                     <p className={styles.noInteractionsMessage}>No interactions recorded yet.</p>
            )}

            <button onClick={logout} className={styles.logoutButton}>
                Logout
            </button>
        </div>
    );
}

export default Preferences;