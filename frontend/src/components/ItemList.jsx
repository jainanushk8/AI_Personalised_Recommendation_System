// frontend/src/components/ItemList.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllItems, getRecommendationsForUser } from '../api/api'; // Import API functions
import { Link } from 'react-router-dom';
import styles from './ItemList.module.css'; // Import CSS Module

function ItemList() {
    const { user, token, isAuthenticated } = useAuth();
    const [items, setItems] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loadingItems, setLoadingItems] = useState(true);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false); // Changed to false initially
    const [error, setError] = useState(null);

    // Fetch all items when the component mounts or user/token changes
    useEffect(() => {
        const fetchItems = async () => {
            if (!isAuthenticated || !token) {
                // If not authenticated, clear items and stop loading
                setItems([]);
                setRecommendations([]);
                setLoadingItems(false);
                setLoadingRecommendations(false);
                return;
            }

            setLoadingItems(true);
            setError(null);
            try {
                const data = await getAllItems(token);
                setItems(data);
            } catch (err) {
                setError("Failed to fetch items. Please try again.");
                console.error("Error fetching all items:", err);
            } finally {
                setLoadingItems(false);
            }
        };

        fetchItems();
    }, [isAuthenticated, token]); // Re-fetch if auth status or token changes

    // Fetch recommendations after items are loaded and user is authenticated
    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!isAuthenticated || !user || !user._id || !token || loadingItems) {
                // Only fetch recommendations if authenticated, user ID is available, and items are done loading
                setRecommendations([]);
                setLoadingRecommendations(false); // Ensure loading is false if conditions not met
                return;
            }

            setLoadingRecommendations(true);
            try {
                const data = await getRecommendationsForUser(user._id, token);
                setRecommendations(data);
            } catch (err) {
                console.error("Error fetching recommendations:", err);
                // Display a user-friendly message, but don't stop the whole page
                // setError("Failed to fetch recommendations."); // Maybe just log for now
                setRecommendations([]); // Clear recommendations if failed
            } finally {
                setLoadingRecommendations(false);
            }
        };

        fetchRecommendations();
    }, [isAuthenticated, user, token, loadingItems]); // Re-fetch if auth, user, token, or item loading status changes

    if (loadingItems) {
        return <p className={styles.loadingMessage}>Loading items...</p>;
    }

    if (error) {
        return <p className={styles.errorMessage}>{error}</p>;
    }

    return (
        <div className={styles.dashboardContainer}>
            <h1 className={styles.heading}>Welcome to Your Dashboard, {user?.username || 'User'}!</h1>

            {/* Recommendations Section */}
            {isAuthenticated && recommendations.length > 0 && (
                <>
                    <h2 className={styles.sectionHeading}>Personalized Recommendations</h2>
                    <div className={styles.itemListGrid}>
                        {recommendations.map((item) => (
                            <div key={item._id} className={styles.itemCard}>
                                <div>
                                    <h3 className={styles.itemCardTitle}>{item.title}</h3>
                                    <p className={styles.itemCardType}>{item.type}</p>
                                    <p className={styles.itemCardDescription}>{item.description}</p>
                                </div>
                                <div className={styles.itemCardActions}>
                                    <Link to={`/items/${item._id}`} className={styles.viewDetailsButton}>
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    {loadingRecommendations && <p className={styles.loadingMessage}>Loading more recommendations...</p>}
                </>
            )}

            {/* All Items Section */}
            <h2 className={styles.sectionHeading}>Browse All Content</h2>
            {items.length === 0 ? (
                <p>No items available yet. Check back later!</p>
            ) : (
                <div className={styles.itemListGrid}>
                    {items.map((item) => (
                        <div key={item._id} className={styles.itemCard}>
                            <div>
                                <h3 className={styles.itemCardTitle}>{item.title}</h3>
                                <p className={styles.itemCardType}>{item.type}</p>
                                <p className={styles.itemCardDescription}>{item.description}</p>
                            </div>
                            <div className={styles.itemCardActions}>
                                <Link to={`/items/${item._id}`} className={styles.viewDetailsButton}>
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ItemList;