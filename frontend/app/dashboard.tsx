import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Card1Image from '../assets/images/card1.png';
import Card2Image from '../assets/images/card2.png';
import Card3Image from '../assets/images/card3.png';
import Card4Image from '../assets/images/card4.png';
import Card5Image from '../assets/images/card5.png';

const cardData = [
    {
        id: 1,
        image: Card1Image,
        title: 'Pothole on Main Street near Town Hall',
        status: 'Pending',
        statusColor: '#FF6B6B',
        time: '2h ago',
        location: 'Main St, Downtown'
    },
    {
        id: 2,
        image: Card2Image,
        title: 'Broken street light at Elm Avenue, making',
        status: 'In Progress',
        statusColor: '#FF9500',
        time: '1d ago',
        location: 'Elm Ave, Residential'
    },
    {
        id: 3,
        image: Card3Image,
        title: 'Overflowing public trash bins at Central',
        status: 'Resolved',
        statusColor: '#4CAF50',
        time: '3d ago',
        location: 'Central Park, Green Area'
    },
    {
        id: 4,
        image: Card4Image,
        title: 'Graffiti on the community center wall,',
        status: 'Pending',
        statusColor: '#FF6B6B',
        time: '5h ago',
        location: 'Community Center, North Side'
    },
    {
        id: 5,
        image: Card5Image,
        title: 'Blocked storm drain on Oak Street, causing',
        status: 'In Progress',
        statusColor: '#FF9500',
        time: '2d ago',
        location: 'Oak St, Industrial Area'
    }
];

export default function Dashboard() {
    const [userIssues, setUserIssues] = useState<any[]>([]);
    const [allIssues, setAllIssues] = useState<any[]>([]);

    const loadUserIssues = async () => {
        try {
            const stored = await AsyncStorage.getItem('userIssues');
            const issues = stored ? JSON.parse(stored) : [];
            setUserIssues(issues);
            setAllIssues([...issues, ...cardData]);
        } catch (error) {
            console.log('Error loading user issues:', error);
            setAllIssues(cardData);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            loadUserIssues();
        }, [])
    );

    const renderCard = (item: any) => (
        <View key={item.id} style={styles.card}>
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
        </View>
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

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {allIssues.map(renderCard)}
            </ScrollView>

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
                <TouchableOpacity style={styles.tabItem}>
                    <Text style={styles.tabIcon}>📋</Text>
                    <Text style={styles.tabLabel}>Report</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Text style={styles.tabIcon}>🗺️</Text>
                    <Text style={styles.tabLabel}>Map</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
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
});