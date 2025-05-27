// frontend/src/components/ItemDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getItemById, recordInteraction } from '../api/api';
import { useAuth } from '../context/AuthContext';
import styles from './ItemDetail.module.css'; // Import CSS Module

function ItemDetail() {
    const { id } = useParams(); // Get item ID from URL parameters
    const navigate = useNavigate(); // Hook to navigate back
    const { user, token, isAuthenticated } = useAuth(); // Get user and token from auth context

    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [interactionMessage, setInteractionMessage] = useState('');

    useEffect(() => {
        const fetchItem = async () => {
            if (!isAuthenticated || !token) {
                navigate('/login'); // Redirect to login if not authenticated
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const data = await getItemById(id, token);
                setItem(data);
            } catch (err) {
                console.error("Error fetching item details:", err);
                setError("Failed to load item details. Item may not exist or network error.");
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [id, isAuthenticated, token, navigate]); // Re-fetch if ID, auth status, token, or navigate changes

    // Function to record an interaction
    const handleInteraction = async (interactionType) => {
        if (!isAuthenticated || !user || !user._id || !token || !item) {
            setInteractionMessage({ type: 'error', text: 'You must be logged in to record interactions.' });
            return;
        }

        try {
            // For 'view' interaction, we can optionally record duration or just a single view
            // For simplicity, 'view' will just be a basic record.
            const duration = (interactionType === 'view') ? 1 : null; // Example: record 1 unit duration for view
            const response = await recordInteraction(user._id, item._id, interactionType, duration, token);
            setInteractionMessage({ type: 'success', text: `Interaction '${interactionType}' recorded successfully!` });
            console.log('Interaction recorded:', response);
        } catch (err) {
            setInteractionMessage({ type: 'error', text: `Failed to record interaction: ${err.message}` });
            console.error('Error recording interaction:', err);
        }
    };

    // Auto-record a 'view' interaction when the item details are loaded
    useEffect(() => {
        if (item && isAuthenticated && user && user._id && token) {
            // Check if it's the first render for this item to avoid duplicate views
            const hasViewed = sessionStorage.getItem(`viewed_${item._id}`);
            if (!hasViewed) {
                handleInteraction('view');
                sessionStorage.setItem(`viewed_${item._id}`, 'true');
            }
        }
        // Clear session storage if component unmounts or item changes
        return () => {
            sessionStorage.removeItem(`viewed_${id}`);
        };
    }, [item, isAuthenticated, user, token, id]); // Depend on item to ensure it's loaded

    if (loading) {
        return <p className={styles.loadingMessage}>Loading item details...</p>;
    }

    if (error) {
        return <p className={styles.errorMessage}>{error}</p>;
    }

    if (!item) {
        return <p className={styles.notFoundMessage}>Item not found.</p>;
    }

    return (
        <div className={styles.detailContainer}>
            <h2 className={styles.detailHeading}>{item.title}</h2>
            <p className={styles.itemType}>Type: {item.type}</p>
            <p className={styles.itemDescription}>{item.description}</p>
            {/* You can add more item details here if your model has them */}

            <div className={styles.interactionSection}>
                <h3>Record Your Interaction</h3>
                {interactionMessage.text && (
                    <p className={`${styles.message} ${interactionMessage.type === 'success' ? styles.successMessage : styles.errorMessage}`}>
                        {interactionMessage.text}
                    </p>
                )}
                <button
                    className={`${styles.interactionButton} ${styles.like}`}
                    onClick={() => handleInteraction('like')}
                    disabled={!isAuthenticated}
                >
                    Like
                </button>
                <button
                    className={`${styles.interactionButton}`}
                    onClick={() => handleInteraction('bookmark')}
                    disabled={!isAuthenticated}
                >
                    Bookmark
                </button>
                <button
                    className={`${styles.interactionButton} ${styles.complete}`}
                    onClick={() => handleInteraction('complete')}
                    disabled={!isAuthenticated}
                >
                    Mark as Complete
                </button>
            </div>

            <Link to="/items" className={styles.backButton}>Back to Dashboard</Link>
        </div>
    );
}

export default ItemDetail;