import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { apiService, IssueReport } from '../services/api';

// Import category-specific images
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

const { width, height } = Dimensions.get('window');

interface MapIssue extends IssueReport {
    distance?: number;
}

export default function MapView() {
    const [issues, setIssues] = useState<MapIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(null);
    const [mapCenter, setMapCenter] = useState({ lat: 34.0522, lng: -118.2437 });
    const [filterCategory, setFilterCategory] = useState<string>('ALL');

    const categories = [
        { value: 'ALL', label: 'All Issues' },
        { value: 'ROADS', label: 'Roads' },
        { value: 'SANITATION', label: 'Sanitation' },
        { value: 'LIGHTING', label: 'Lighting' },
        { value: 'WATER', label: 'Water' },
        { value: 'WASTE', label: 'Waste' }
    ];

    useEffect(() => {
        loadIssuesAndLocation();
    }, []);

    const loadIssuesAndLocation = async () => {
        setLoading(true);

        try {
            // Request location permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                setUserLocation(location);
                setMapCenter({
                    lat: location.coords.latitude,
                    lng: location.coords.longitude
                });
            }

            // Load issues from API - use nearby if location is available, otherwise get all
            let apiIssues;
            if (userLocation) {
                try {
                    apiIssues = await apiService.getNearbyIssues(
                        userLocation.coords.latitude,
                        userLocation.coords.longitude,
                        20 // 20km radius
                    );
                } catch (error) {
                    console.log('Nearby issues not available, falling back to all issues');
                    apiIssues = await apiService.getAllIssues();
                }
            } else {
                apiIssues = await apiService.getAllIssues();
            }

            // Calculate distances if user location is available
            const issuesWithDistance = apiIssues.map((issue: IssueReport) => {
                let distance = undefined;
                if (userLocation && issue.latitude && issue.longitude) {
                    distance = calculateDistance(
                        userLocation.coords.latitude,
                        userLocation.coords.longitude,
                        issue.latitude,
                        issue.longitude
                    );
                }
                return { ...issue, distance };
            });

            setIssues(issuesWithDistance);
        } catch (error) {
            console.error('Error loading map data:', error);
            Alert.alert('Error', 'Failed to load map data');
        } finally {
            setLoading(false);
        }
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'SUBMITTED': return '#FFA726';
            case 'IN_PROGRESS': return '#42A5F5';
            case 'RESOLVED': return '#66BB6A';
            case 'REJECTED': return '#EF5350';
            default: return '#9E9E9E';
        }
    };

    const getCategoryColor = (category?: string) => {
        switch (category) {
            case 'ROADS': return '#795548';
            case 'SANITATION': return '#607D8B';
            case 'LIGHTING': return '#FFC107';
            case 'WASTE': return '#4CAF50';
            case 'WATER': return '#2196F3';
            default: return '#9E9E9E';
        }
    };

    const getCategoryImage = (category: string) => {
        return categoryImages[category as keyof typeof categoryImages] || Card1Image;
    };

    const filteredIssues = filterCategory === 'ALL'
        ? issues
        : issues.filter(issue => issue.category === filterCategory);

    const getCategoryLabel = (value: string) => {
        const category = categories.find(c => c.value === value);
        return category ? category.label : value;
    };

    const openInMaps = (latitude: number, longitude: number) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        Alert.alert(
            'Open in Maps',
            'This will open the location in your default maps app.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Open', onPress: () => {
                        // In a real app, you would use Linking.openURL(url)
                        Alert.alert('Info', 'Map integration would open here in a real app');
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <StatusBar hidden={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4A90E2" />
                    <Text style={styles.loadingText}>Loading map data...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar hidden={true} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Issues Map</Text>
                <TouchableOpacity onPress={loadIssuesAndLocation} style={styles.refreshButton}>
                    <Text style={styles.refreshIcon}>↻</Text>
                </TouchableOpacity>
            </View>

            {/* Category Filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterContainer}
                contentContainerStyle={styles.filterContent}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.value}
                        style={[
                            styles.filterButton,
                            filterCategory === category.value && styles.filterButtonActive
                        ]}
                        onPress={() => setFilterCategory(category.value)}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            filterCategory === category.value && styles.filterButtonTextActive
                        ]}>
                            {category.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Map Placeholder */}
            <View style={styles.mapContainer}>
                <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapTitle}>Issues Near You</Text>
                    <Text style={styles.mapSubtitle}>
                        {userLocation
                            ? `Center: ${mapCenter.lat.toFixed(4)}, ${mapCenter.lng.toFixed(4)}`
                            : 'Location access not granted'
                        }
                    </Text>

                    {/* Simulated Map Pins */}
                    <View style={styles.mapPins}>
                        {filteredIssues.slice(0, 8).map((issue, index) => (
                            <TouchableOpacity
                                key={issue.id}
                                style={[
                                    styles.mapPin,
                                    {
                                        backgroundColor: getStatusColor(issue.status),
                                        left: `${20 + (index % 4) * 20}%`,
                                        top: `${30 + Math.floor(index / 4) * 25}%`
                                    }
                                ]}
                                onPress={() => setSelectedIssue(issue)}
                            >
                                <Text style={styles.mapPinText}>📍</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {userLocation && (
                        <View style={[styles.userLocationPin, { left: '50%', top: '50%' }]}>
                            <Text style={styles.userLocationText}>📍</Text>
                            <Text style={styles.userLocationLabel}>You</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Issues List */}
            <View style={styles.issuesContainer}>
                <Text style={styles.issuesTitle}>
                    Nearby Issues ({filteredIssues.length})
                </Text>

                <ScrollView style={styles.issuesList} showsVerticalScrollIndicator={false}>
                    {filteredIssues.map((issue) => (
                        <TouchableOpacity
                            key={issue.id}
                            style={[
                                styles.issueCard,
                                selectedIssue?.id === issue.id && styles.issueCardSelected
                            ]}
                            onPress={() => {
                                setSelectedIssue(issue);
                                if (issue.latitude && issue.longitude) {
                                    setMapCenter({ lat: issue.latitude, lng: issue.longitude });
                                }
                            }}
                        >
                            <View style={styles.issueCardHeader}>
                                <View style={[
                                    styles.categoryBadge,
                                    { backgroundColor: getCategoryColor(issue.category) }
                                ]}>
                                    <Text style={styles.categoryText}>{issue.category}</Text>
                                </View>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: getStatusColor(issue.status) }
                                ]}>
                                    <Text style={styles.statusText}>{issue.status}</Text>
                                </View>
                            </View>

                            <Text style={styles.issueDescription} numberOfLines={2}>
                                {issue.description}
                            </Text>

                            <View style={styles.issueFooter}>
                                <Text style={styles.issueLocation}>
                                    📍 {issue.city?.name || 'Unknown'}, {issue.locality?.name || 'Unknown'}
                                </Text>
                                {issue.distance && (
                                    <Text style={styles.issueDistance}>
                                        {issue.distance.toFixed(1)} km away
                                    </Text>
                                )}
                            </View>

                            <View style={styles.issueActions}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => router.push({
                                        pathname: '/issue-details',
                                        params: { id: issue.id?.toString() }
                                    })}
                                >
                                    <Text style={styles.actionButtonText}>View Details</Text>
                                </TouchableOpacity>

                                {issue.latitude && issue.longitude && (
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.mapActionButton]}
                                        onPress={() => openInMaps(issue.latitude!, issue.longitude!)}
                                    >
                                        <Text style={styles.actionButtonText}>Open in Maps</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}

                    {filteredIssues.length === 0 && (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No issues found</Text>
                            <Text style={styles.emptySubText}>
                                {filterCategory === 'ALL'
                                    ? 'No issues reported in this area yet'
                                    : `No ${filterCategory} issues found`
                                }
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5DC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backArrow: {
        fontSize: 24,
        color: '#333',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    refreshButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    refreshIcon: {
        fontSize: 20,
        color: '#333',
    },
    filterContainer: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    filterContent: {
        paddingRight: 24,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    filterButtonActive: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },
    filterButtonText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: '#FFFFFF',
    },
    mapContainer: {
        height: height * 0.35,
        marginHorizontal: 24,
        marginBottom: 16,
    },
    mapPlaceholder: {
        flex: 1,
        backgroundColor: '#E8F4FD',
        borderRadius: 12,
        padding: 16,
        position: 'relative',
        overflow: 'hidden',
    },
    mapTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    mapSubtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 16,
    },
    mapPins: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    mapPin: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    mapPinText: {
        fontSize: 12,
        color: '#FFFFFF',
    },
    userLocationPin: {
        position: 'absolute',
        alignItems: 'center',
        transform: [{ translateX: -12 }, { translateY: -12 }],
    },
    userLocationText: {
        fontSize: 20,
        color: '#007AFF',
    },
    userLocationLabel: {
        fontSize: 10,
        color: '#007AFF',
        fontWeight: '600',
        marginTop: 2,
    },
    issuesContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    issuesTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    issuesList: {
        flex: 1,
    },
    issueCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    issueCardSelected: {
        borderWidth: 2,
        borderColor: '#4A90E2',
    },
    issueCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    categoryBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    issueDescription: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 8,
    },
    issueFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    issueLocation: {
        fontSize: 12,
        color: '#666',
        flex: 1,
    },
    issueDistance: {
        fontSize: 12,
        color: '#4A90E2',
        fontWeight: '500',
    },
    issueActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#4A90E2',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignItems: 'center',
    },
    mapActionButton: {
        backgroundColor: '#FF6B6B',
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#FFFFFF',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
    },
});