import React, { useState, useEffect, useRef } from 'react';
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
import { WebView } from 'react-native-webview';
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
    const webViewRef = useRef<WebView>(null);
    const [issues, setIssues] = useState<MapIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [selectedIssue, setSelectedIssue] = useState<MapIssue | null>(null);
    const [mapCenter, setMapCenter] = useState({ lat: 23.3441, lng: 85.3096 }); // Ranchi, Jharkhand
    const [filterCategory, setFilterCategory] = useState<string>('ALL');
    const [mapReady, setMapReady] = useState(false);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

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

    // Generate HTML for Leaflet map
    const generateMapHTML = () => {
        const issuesData = JSON.stringify(filteredIssues.map(issue => ({
            id: issue.id,
            lat: issue.latitude,
            lng: issue.longitude,
            title: issue.description?.substring(0, 50) + '...',
            category: issue.category,
            status: issue.status,
            location: issue.city?.name + ', ' + issue.locality?.name
        })));

        const userLocationData = userLocation ? JSON.stringify({
            lat: userLocation.coords.latitude,
            lng: userLocation.coords.longitude
        }) : 'null';

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Civic Issues Map</title>
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <style>
                body { margin: 0; padding: 0; }
                #map { height: 100vh; width: 100vw; }
                .custom-popup {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                .popup-title {
                    font-weight: 600;
                    font-size: 14px;
                    margin-bottom: 8px;
                    color: #333;
                }
                .popup-category {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: 500;
                    color: white;
                    margin-bottom: 6px;
                }
                .popup-status {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: 500;
                    color: white;
                    margin-left: 6px;
                    margin-bottom: 6px;
                }
                .popup-location {
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 8px;
                }
                .popup-button {
                    background: #4A90E2;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    width: 100%;
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <script>
                const issues = ${issuesData};
                const userLocation = ${userLocationData};
                
                // Initialize map
                const map = L.map('map').setView([${mapCenter.lat}, ${mapCenter.lng}], 12);
                
                // Add tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);
                
                // Category colors
                const categoryColors = {
                    'ROADS': '#795548',
                    'SANITATION': '#607D8B',
                    'LIGHTING': '#FFC107',
                    'WASTE': '#4CAF50',
                    'WATER': '#2196F3'
                };
                
                // Status colors
                const statusColors = {
                    'SUBMITTED': '#FFA726',
                    'IN_PROGRESS': '#42A5F5',
                    'RESOLVED': '#66BB6A',
                    'REJECTED': '#EF5350'
                };
                
                // Add user location marker
                if (userLocation) {
                    const userIcon = L.divIcon({
                        html: '<div style="background: #007AFF; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                        iconSize: [20, 20],
                        className: 'user-location-marker'
                    });
                    
                    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
                        .addTo(map)
                        .bindPopup('<div class="custom-popup"><strong>Your Location</strong></div>');
                }
                
                // Add issue markers
                issues.forEach(issue => {
                    if (issue.lat && issue.lng) {
                        const categoryColor = categoryColors[issue.category] || '#9E9E9E';
                        const statusColor = statusColors[issue.status] || '#9E9E9E';
                        
                        const markerIcon = L.divIcon({
                            html: '<div style="background: ' + categoryColor + '; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                            iconSize: [16, 16],
                            className: 'issue-marker'
                        });
                        
                        const popupContent = \`
                            <div class="custom-popup">
                                <div class="popup-title">\${issue.title}</div>
                                <div>
                                    <span class="popup-category" style="background: \${categoryColor};">\${issue.category}</span>
                                    <span class="popup-status" style="background: \${statusColor};">\${issue.status}</span>
                                </div>
                                <div class="popup-location">📍 \${issue.location}</div>
                                <button class="popup-button" onclick="selectIssue(\${issue.id})">View Details</button>
                            </div>
                        \`;
                        
                        L.marker([issue.lat, issue.lng], { icon: markerIcon })
                            .addTo(map)
                            .bindPopup(popupContent);
                    }
                });
                
                // Function to handle issue selection
                function selectIssue(issueId) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'selectIssue',
                        issueId: issueId
                    }));
                }
                
                // Notify React Native that map is ready
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'mapReady'
                }));
                
                // Handle map events
                map.on('click', function(e) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'mapClick',
                        lat: e.latlng.lat,
                        lng: e.latlng.lng
                    }));
                });
            </script>
        </body>
        </html>
        `;
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

    // Handle messages from WebView
    const handleWebViewMessage = (event: any) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);

            switch (message.type) {
                case 'mapReady':
                    setMapReady(true);
                    break;

                case 'selectIssue':
                    const issue = issues.find(i => i.id === message.issueId);
                    if (issue) {
                        setSelectedIssue(issue);
                        router.push({
                            pathname: '/issue-details',
                            params: { id: issue.id?.toString() }
                        });
                    }
                    break;

                case 'mapClick':
                    console.log('Map clicked at:', message.lat, message.lng);
                    break;

                default:
                    console.log('Unknown message type:', message.type);
            }
        } catch (error) {
            console.error('Error parsing WebView message:', error);
        }
    };

    // Update map when issues or filter changes
    useEffect(() => {
        if (mapReady && webViewRef.current) {
            const updateScript = `
                // Clear existing markers except user location
                map.eachLayer(function (layer) {
                    if (layer instanceof L.Marker && !layer.options.isUserLocation) {
                        map.removeLayer(layer);
                    }
                });
                
                // Add updated issue markers
                const updatedIssues = ${JSON.stringify(filteredIssues.map(issue => ({
                id: issue.id,
                lat: issue.latitude,
                lng: issue.longitude,
                title: issue.description?.substring(0, 50) + '...',
                category: issue.category,
                status: issue.status,
                location: issue.city?.name + ', ' + issue.locality?.name
            })))};
                
                updatedIssues.forEach(issue => {
                    if (issue.lat && issue.lng) {
                        const categoryColor = categoryColors[issue.category] || '#9E9E9E';
                        const statusColor = statusColors[issue.status] || '#9E9E9E';
                        
                        const markerIcon = L.divIcon({
                            html: '<div style="background: ' + categoryColor + '; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                            iconSize: [16, 16],
                            className: 'issue-marker'
                        });
                        
                        const popupContent = \`
                            <div class="custom-popup">
                                <div class="popup-title">\${issue.title}</div>
                                <div>
                                    <span class="popup-category" style="background: \${categoryColor};">\${issue.category}</span>
                                    <span class="popup-status" style="background: \${statusColor};">\${issue.status}</span>
                                </div>
                                <div class="popup-location">📍 \${issue.location}</div>
                                <button class="popup-button" onclick="selectIssue(\${issue.id})">View Details</button>
                            </div>
                        \`;
                        
                        L.marker([issue.lat, issue.lng], { icon: markerIcon })
                            .addTo(map)
                            .bindPopup(popupContent);
                    }
                });
            `;

            webViewRef.current.injectJavaScript(updateScript);
        }
    }, [filteredIssues, mapReady]);

    // Update map center when user location changes
    useEffect(() => {
        if (userLocation && mapReady && webViewRef.current) {
            const centerScript = `
                map.setView([${userLocation.coords.latitude}, ${userLocation.coords.longitude}], 13);
            `;
            webViewRef.current.injectJavaScript(centerScript);
        }
    }, [userLocation, mapReady]);

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

            {/* Category Filter Dropdown */}
            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Filter by Category:</Text>
                <TouchableOpacity
                    style={styles.dropdown}
                    onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                    <Text style={styles.dropdownText}>{getCategoryLabel(filterCategory)}</Text>
                    <Text style={styles.dropdownIcon}>{showCategoryDropdown ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {showCategoryDropdown && (
                    <View style={styles.dropdownOptions}>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category.value}
                                style={[
                                    styles.dropdownOption,
                                    filterCategory === category.value && styles.dropdownOptionActive
                                ]}
                                onPress={() => {
                                    setFilterCategory(category.value);
                                    setShowCategoryDropdown(false);
                                }}
                            >
                                <Text style={[
                                    styles.dropdownOptionText,
                                    filterCategory === category.value && styles.dropdownOptionTextActive
                                ]}>
                                    {category.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Interactive Leaflet Map */}
            <View style={styles.mapContainer}>
                {!mapReady && (
                    <View style={styles.mapLoadingOverlay}>
                        <ActivityIndicator size="large" color="#4A90E2" />
                        <Text style={styles.mapLoadingText}>Loading map...</Text>
                    </View>
                )}
                <WebView
                    ref={webViewRef}
                    source={{ html: generateMapHTML() }}
                    style={styles.webView}
                    onMessage={handleWebViewMessage}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Horizontal Issues Carousel */}
            <View style={styles.issuesContainer}>
                <Text style={styles.issuesTitle}>
                    Nearby Issues ({filteredIssues.length})
                </Text>

                {filteredIssues.length > 0 ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.carouselContainer}
                        style={styles.carousel}
                    >
                        {filteredIssues.map((issue) => (
                            <TouchableOpacity
                                key={issue.id}
                                style={[
                                    styles.carouselCard,
                                    selectedIssue?.id === issue.id && styles.carouselCardSelected
                                ]}
                                onPress={() => {
                                    setSelectedIssue(issue);
                                    if (issue.latitude && issue.longitude && mapReady && webViewRef.current) {
                                        setMapCenter({ lat: issue.latitude, lng: issue.longitude });
                                        // Center map on selected issue
                                        const centerScript = `
                                            map.setView([${issue.latitude}, ${issue.longitude}], 15);
                                        `;
                                        webViewRef.current.injectJavaScript(centerScript);
                                    }
                                }}
                            >
                                <View style={styles.carouselCardHeader}>
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

                                <Text style={styles.carouselDescription} numberOfLines={3}>
                                    {issue.description}
                                </Text>

                                <View style={styles.carouselFooter}>
                                    <Text style={styles.carouselLocation} numberOfLines={2}>
                                        📍 {issue.city?.name || 'Unknown'}, {issue.locality?.name || 'Unknown'}
                                    </Text>
                                    {issue.distance && (
                                        <Text style={styles.carouselDistance}>
                                            {issue.distance.toFixed(1)} km away
                                        </Text>
                                    )}
                                </View>

                                <View style={styles.carouselActions}>
                                    <TouchableOpacity
                                        style={styles.carouselActionButton}
                                        onPress={() => router.push({
                                            pathname: '/issue-details',
                                            params: { id: issue.id?.toString() }
                                        })}
                                    >
                                        <Text style={styles.carouselActionButtonText}>View Details</Text>
                                    </TouchableOpacity>

                                    {issue.latitude && issue.longitude && (
                                        <TouchableOpacity
                                            style={[styles.carouselActionButton, styles.carouselMapActionButton]}
                                            onPress={() => openInMaps(issue.latitude!, issue.longitude!)}
                                        >
                                            <Text style={styles.carouselActionButtonText}>Maps</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No issues found</Text>
                        <Text style={styles.emptySubText}>
                            {filterCategory === 'ALL'
                                ? 'No issues reported in this area yet'
                                : `No ${getCategoryLabel(filterCategory)} issues found`
                            }
                        </Text>
                    </View>
                )}
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
        position: 'relative',
        zIndex: 1000,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    dropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
    dropdownIcon: {
        fontSize: 12,
        color: '#666',
    },
    dropdownOptions: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 1001,
    },
    dropdownOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dropdownOptionActive: {
        backgroundColor: '#4A90E2',
    },
    dropdownOptionText: {
        fontSize: 16,
        color: '#333',
    },
    dropdownOptionTextActive: {
        fontSize: 16,
        color: '#FFFFFF',
    },
    mapContainer: {
        flex: 1,
        marginHorizontal: 24,
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        minHeight: 250,
    },
    webView: {
        flex: 1,
        backgroundColor: '#E8F4FD',
    },
    mapLoadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#E8F4FD',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        borderRadius: 12,
    },
    mapLoadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },
    issuesContainer: {
        paddingTop: 16,
        paddingBottom: 20,
    },
    issuesTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        paddingHorizontal: 24,
    },
    carousel: {
        flexGrow: 0,
    },
    carouselContainer: {
        paddingHorizontal: 16,
        paddingRight: 24,
    },
    carouselCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 8,
        width: width * 0.75, // 75% of screen width
        minHeight: 200,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    carouselCardSelected: {
        borderWidth: 2,
        borderColor: '#4A90E2',
        elevation: 6,
        shadowOpacity: 0.25,
    },
    carouselCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    carouselDescription: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
        marginBottom: 12,
        minHeight: 66, // Ensure consistent height for 3 lines
    },
    carouselFooter: {
        marginBottom: 16,
    },
    carouselLocation: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
        lineHeight: 18,
    },
    carouselDistance: {
        fontSize: 14,
        color: '#4A90E2',
        fontWeight: '600',
    },
    carouselActions: {
        flexDirection: 'row',
        gap: 10,
    },
    carouselActionButton: {
        flex: 1,
        backgroundColor: '#4A90E2',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    carouselMapActionButton: {
        backgroundColor: '#FF6B6B',
    },
    carouselActionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
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