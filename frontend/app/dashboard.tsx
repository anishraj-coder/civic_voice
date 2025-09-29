import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, IssueReport } from '../services/api';
import Card1Image from '../assets/images/card1.png';
import Card2Image from '../assets/images/card2.png';
import Card3Image from '../assets/images/card3.png';
import Card4Image from '../assets/images/card4.png';
import Card5Image from '../assets/images/card5.png';

// Map issue categories to specific images
const categoryImages = {
    'ROADS': Card1Image,        // Roads/Infrastructure issues
    'SANITATION': Card2Image,   // Sanitation/Cleanliness issues  
    'LIGHTING': Card3Image,     // Street lighting issues
    'WASTE': Card4Image,        // Waste management issues
    'WATER': Card5Image         // Water supply issues
};

const cardData = [
    {
        id: 1,
        image: Card1Image,
        title: 'Pothole on Main Street near Town Hall',
        status: 'Pending',
        statusColor: '#FF6B6B',
        time: '2h ago',
        location: 'Main St, Downtown',
        category: 'ROADS'
    },
    {
        id: 2,
        image: Card3Image,
        title: 'Broken street light at Elm Avenue, making',
        status: 'In Progress',
        statusColor: '#FF9500',
        time: '1d ago',
        location: 'Elm Ave, Residential',
        category: 'LIGHTING'
    },
    {
        id: 3,
        image: Card4Image,
        title: 'Overflowing public trash bins at Central',
        status: 'Resolved',
        statusColor: '#4CAF50',
        time: '3d ago',
        location: 'Central Park, Green Area',
        category: 'WASTE'
    },
    {
        id: 4,
        image: Card2Image,
        title: 'Poor sanitation conditions at market area',
        status: 'Pending',
        statusColor: '#FF6B6B',
        time: '5h ago',
        location: 'Community Center, North Side',
        category: 'SANITATION'
    },
    {
        id: 5,
        image: Card5Image,
        title: 'Water supply disruption on Oak Street',
        status: 'In Progress',
        statusColor: '#FF9500',
        time: '2d ago',
        location: 'Oak St, Industrial Area',
        category: 'WATER'
    }
];

export default function Dashboard() {
    const [userIssues, setUserIssues] = useState<any[]>([]);
    const [allIssues, setAllIssues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statistics, setStatistics] = useState<any>(null);

    const loadIssues = async () => {
        setLoading(true);
        setError(null);

        try {
            // Try to fetch issues from backend API
            const apiIssues = await apiService.getAllIssues();

            // Transform API issues to match the expected format
            const transformedApiIssues = apiIssues.map((issue: IssueReport) => ({
                id: issue.id,
                image: issue.photoUrl || getCategoryImage(issue.category || 'ROADS'), // Use photoUrl from backend, fallback to category-specific image
                title: issue.description ? issue.description.substring(0, 50) + (issue.description.length > 50 ? '...' : '') : 'No description', // Use description as title since backend doesn't have title field
                status: issue.status || 'Pending',
                statusColor: getStatusColor(issue.status || 'Pending'),
                time: issue.createdAt ? formatTime(issue.createdAt) : 'Just now',
                location: issue.city && issue.locality ? `${issue.locality.name}, ${issue.city.name}` : 'Unknown location', // Combine city and locality for location
                description: issue.description,
                category: issue.category,
                isFromAPI: true // Mark as API data
            }));

            // Also load local issues for offline support
            const stored = await AsyncStorage.getItem('userIssues');
            const localIssues = stored ? JSON.parse(stored).map((issue: any) => ({
                ...issue,
                isFromAPI: false // Mark local issues as not from API
            })) : [];

            setUserIssues(localIssues);
            setAllIssues([...transformedApiIssues, ...localIssues]);

            // Load statistics
            try {
                const stats = await apiService.getIssueStatistics();
                setStatistics(stats);
            } catch (statsError) {
                console.log('Failed to load statistics:', statsError);
            }

        } catch (apiError) {
            console.log('API Error, falling back to local storage:', apiError);
            setError('Failed to load issues from server. Showing local data only.');

            // Fallback to local storage only
            try {
                const stored = await AsyncStorage.getItem('userIssues');
                const issues = stored ? JSON.parse(stored).map((issue: any) => ({
                    ...issue,
                    isFromAPI: false
                })) : [];
                const mockData = cardData.map(item => ({
                    ...item,
                    isFromAPI: false
                }));
                setUserIssues(issues);
                setAllIssues([...issues, ...mockData]);
            } catch (localError) {
                console.log('Error loading local issues:', localError);
                setAllIssues(cardData);
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string): string => {
        switch (status.toLowerCase()) {
            case 'resolved':
                return '#4CAF50';
            case 'in progress':
                return '#FF9500';
            case 'pending':
            default:
                return '#FF6B6B';
        }
    };

    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    const getCategoryImage = (category: string) => {
        return categoryImages[category as keyof typeof categoryImages] || Card1Image;
    };

    const getCategoryDescription = (category: string) => {
        switch (category) {
            case 'ROADS': return 'Road & Infrastructure';
            case 'SANITATION': return 'Sanitation & Cleanliness';
            case 'LIGHTING': return 'Street Lighting';
            case 'WASTE': return 'Waste Management';
            case 'WATER': return 'Water Supply';
            default: return 'General Issue';
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadIssues();
        }, [])
    );

    const renderCard = (item: any) => (
        <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => {
                // Only navigate to issue details if it's a real API issue (has numeric ID from backend)
                // Mock data has IDs 1-5, but we need to check if it's from API
                if (item.isFromAPI) {
                    router.push({
                        pathname: '/issue-details',
                        params: {
                            id: item.id.toString()
                        }
                    });
                } else {
                    // For mock data, show an alert or handle differently
                    Alert.alert('Demo Data', 'This is demo data. Real issue details are not available.');
                }
            }}
        >
            <Image
                source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                style={styles.cardImage}
            />
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: item.statusColor }]}>
                        <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                    <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <View style={styles.locationContainer}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.locationText}>{item.location}</Text>
                    <Text style={styles.arrowIcon}>→</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar hidden={true} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Civic Issues</Text>
                <TouchableOpacity style={styles.notificationButton}>
                    <Text style={styles.notificationIcon}>🔔</Text>
                </TouchableOpacity>
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {statistics && (
                <View style={styles.statsContainer}>
                    <Text style={styles.statsTitle}>Issue Statistics</Text>
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: '#FFA726' }]}>
                            <Text style={styles.statNumber}>{statistics.submitted}</Text>
                            <Text style={styles.statLabel}>Submitted</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#42A5F5' }]}>
                            <Text style={styles.statNumber}>{statistics.inProgress}</Text>
                            <Text style={styles.statLabel}>In Progress</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#66BB6A' }]}>
                            <Text style={styles.statNumber}>{statistics.resolved}</Text>
                            <Text style={styles.statLabel}>Resolved</Text>
                        </View>
                        <View style={[styles.statCard, { backgroundColor: '#EF5350' }]}>
                            <Text style={styles.statNumber}>{statistics.rejected}</Text>
                            <Text style={styles.statLabel}>Rejected</Text>
                        </View>
                    </View>
                </View>
            )}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4A90E2" />
                    <Text style={styles.loadingText}>Loading issues...</Text>
                </View>
            ) : (
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {allIssues.length > 0 ? (
                        allIssues.map(renderCard)
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No issues reported yet</Text>
                            <Text style={styles.emptySubText}>Tap the + button to report your first issue</Text>
                        </View>
                    )}
                </ScrollView>
            )}

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/report-issue')}
            >
                <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>

            <View style={styles.bottomTabs}>
                <TouchableOpacity style={styles.tabItem}>
                    <Text style={styles.tabIcon}>🏠</Text>
                    <Text style={styles.tabLabel}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/report-issue')}>
                    <Text style={styles.tabIcon}>📋</Text>
                    <Text style={styles.tabLabel}>Report</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/map')}>
                    <Text style={styles.tabIcon}>🗺️</Text>
                    <Text style={styles.tabLabel}>Map</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/profile')}>
                    <Text style={styles.tabIcon}>👤</Text>
                    <Text style={styles.tabLabel}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    notificationButton: {
        padding: 8,
    },
    notificationIcon: {
        fontSize: 24,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginVertical: 8,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    cardContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        lineHeight: 20,
        marginBottom: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    timeText: {
        fontSize: 12,
        color: '#666',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    locationText: {
        fontSize: 12,
        color: '#666',
        flex: 1,
    },
    arrowIcon: {
        fontSize: 16,
        color: '#666',
    },
    addButton: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF6B6B',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    addButtonText: {
        fontSize: 30,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    bottomTabs: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingVertical: 10,
        paddingBottom: 20,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
    },
    tabIcon: {
        fontSize: 20,
        marginBottom: 4,
    },
    tabLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    errorContainer: {
        backgroundColor: '#FEE',
        padding: 12,
        marginHorizontal: 20,
        marginVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FCC',
    },
    errorText: {
        color: '#C33',
        fontSize: 14,
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    statsContainer: {
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    statsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    statCard: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#FFFFFF',
        textAlign: 'center',
    },
});