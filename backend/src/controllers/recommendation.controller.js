// src/controllers/recommendation.controller.js
const User = require('../models/User.model');
const Item = require('../models/Item.model');
const mongoose = require('mongoose');

// Define weights for different interaction types
const INTERACTION_WEIGHTS = {
    'view': 1,
    'like': 2,
    'complete': 3,
    'rating': 0.5, // You could adjust this, or map ratings (1-5) to weights
    'bookmark': 1.5,
};

// --- Helper function: Calculate Cosine Similarity ---
// Takes two tag-frequency maps (like vectors) and computes their cosine similarity
const calculateCosineSimilarity = (vectorA, vectorB, allUniqueTags) => {
    if (Object.keys(vectorA).length === 0 || Object.keys(vectorB).length === 0) {
        return 0;
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (const tag of allUniqueTags) { // Iterate over all unique tags for consistent dimensions
        const valA = vectorA[tag] || 0;
        const valB = vectorB[tag] || 0;

        dotProduct += valA * valB;
        magnitudeA += valA * valA;
        magnitudeB += valB * valB;
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
};

// --- NEW Helper function: Calculate Inverse Document Frequency (IDF) for all tags ---
// This will be called once per recommendation request. For very large datasets,
// this should be pre-calculated and cached.
const calculateIdfScores = (allTagsInCorpus, totalDocuments) => {
    const idfScores = {};
    const tagDocumentCounts = {}; // How many documents each tag appears in

    allTagsInCorpus.forEach(tags => {
        const uniqueTagsInDoc = new Set(tags.map(tag => tag.toLowerCase()));
        uniqueTagsInDoc.forEach(tag => {
            tagDocumentCounts[tag] = (tagDocumentCounts[tag] || 0) + 1;
        });
    });

    for (const tag in tagDocumentCounts) {
        // IDF = log(Total number of documents / Number of documents containing the term)
        idfScores[tag] = Math.log(totalDocuments / tagDocumentCounts[tag]);
    }
    return idfScores;
};

// --- NEW Helper function: Calculate Term Frequency (TF) for a given item's tags ---
const calculateTfScores = (itemTags) => {
    const tfScores = {};
    if (!itemTags || itemTags.length === 0) return tfScores;

    itemTags.forEach(tag => {
        const lowerCaseTag = tag.toLowerCase();
        tfScores[lowerCaseTag] = (tfScores[lowerCaseTag] || 0) + 1; // Count occurrences
    });
    // Optional: Normalize TF (e.g., divide by total tags in item, though less common for tag lists)
    return tfScores;
};


const getRecommendationsForUser = async (req, res, next) => {
    console.log('RECOMMENDATION CONTROLLER - getRecommendationsForUser called.');
    try {
        const { userId } = req.params;

        if (req.user._id.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized: Cannot get recommendations for another user.' });
        }

        // Populate interactionHistory with actual item details, specifically 'tags' and '_id'
        const user = await User.findById(userId).populate('interactionHistory.itemId', 'tags type');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // --- 1. Build Weighted User Interest Profile ---
        const userInterestMap = {}; // Will store { tag: weighted_frequency }
        const interactedItemIds = new Set(); // To filter out already interacted items

        user.interactionHistory.forEach(interaction => {
            if (interaction.itemId && interaction.itemId.tags && interaction.itemId.tags.length > 0) {
                interactedItemIds.add(interaction.itemId._id.toString());

                const weight = INTERACTION_WEIGHTS[interaction.interactionType] || 0;

                if (weight > 0) {
                    interaction.itemId.tags.forEach(tag => {
                        const lowerCaseTag = tag.toLowerCase();
                        userInterestMap[lowerCaseTag] = (userInterestMap[lowerCaseTag] || 0) + weight;
                    });
                }
            }
        });

        const userProfileIsEmpty = Object.keys(userInterestMap).length === 0;

        // --- Cold start strategy ---
        if (userProfileIsEmpty) {
            console.log('RECOMMENDATION CONTROLLER - No specific interaction history for user. Fetching popular items.');
            const popularItems = await Item.find().sort({ createdAt: -1 }).limit(10);
            return res.status(200).json({
                message: 'No specific recommendations yet. Here are some popular/new items.',
                recommendations: popularItems
            });
        }

        // --- 2. Prepare Item Data & Calculate Global IDF ---
        const allItemsInDb = await Item.find({}); // Fetch ALL items for IDF calculation
        const allTagsInCorpus = allItemsInDb.map(item => item.tags || []);
        const totalDocuments = allItemsInDb.length;

        const idfScores = calculateIdfScores(allTagsInCorpus, totalDocuments);

        // Collect all unique tags for consistent vector dimensions in cosine similarity
        const allUniqueTagsForVectors = new Set();
        allItemsInDb.forEach(item => {
            if (item.tags && item.tags.length > 0) {
                item.tags.forEach(tag => allUniqueTagsForVectors.add(tag.toLowerCase()));
            }
        });
        Object.keys(userInterestMap).forEach(tag => allUniqueTagsForVectors.add(tag));


        // 3. Find items not interacted with and calculate TF-IDF for each
        const itemsToRecommendFrom = allItemsInDb.filter(item => !interactedItemIds.has(item._id.toString()));

        const scoredRecommendations = itemsToRecommendFrom.map(item => {
            const tfScores = calculateTfScores(item.tags);
            const itemTfIdfVector = {};

            // Calculate TF-IDF for item
            for (const tag in tfScores) {
                itemTfIdfVector[tag] = tfScores[tag] * (idfScores[tag] || 0); // Multiply TF by IDF
            }

            const similarity = calculateCosineSimilarity(userInterestMap, itemTfIdfVector, Array.from(allUniqueTagsForVectors));
            return { item, similarity };
        });

        // Sort, filter, and limit
        scoredRecommendations.sort((a, b) => b.similarity - a.similarity);
        const filteredRecommendations = scoredRecommendations.filter(rec => rec.similarity > 0);
        const finalRecommendations = filteredRecommendations.slice(0, 10).map(rec => rec.item);

        console.log(`RECOMMENDATION CONTROLLER - Found ${finalRecommendations.length} recommendations for user ${userId} using TF-IDF.`);
        res.status(200).json({
            message: 'Recommendations generated successfully using TF-IDF.',
            recommendations: finalRecommendations
        });

    } catch (error) {
        console.error('RECOMMENDATION CONTROLLER - Error generating recommendations with TF-IDF:', error);
        next(error);
    }
};

module.exports = {
    getRecommendationsForUser
};