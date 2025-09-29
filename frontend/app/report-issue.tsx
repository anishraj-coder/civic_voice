import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, StatusBar, Alert, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, CreateIssueRequest } from '../services/api';

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

const locationDataset = [
    { address: '123 Main Street, Downtown, Springfield', lat: '34.0522', lon: '118.2437' },
    { address: '456 Oak Avenue, Residential Area, Springfield', lat: '34.0525', lon: '118.2440' },
    { address: '789 Elm Street, Springfield, USA', lat: '34.0520', lon: '118.2435' },
    { address: '321 Pine Road, Green Valley, Springfield', lat: '34.0528', lon: '118.2442' },
    { address: '654 Maple Drive, Central Park Area, Springfield', lat: '34.0518', lon: '118.2430' },
    { address: '987 Cedar Lane, Industrial District, Springfield', lat: '34.0530', lon: '118.2445' },
    { address: '147 Birch Street, North Side, Springfield', lat: '34.0515', lon: '118.2425' },
    { address: '258 Willow Court, South Springfield', lat: '34.0535', lon: '118.2450' }
];

const issueTypes = [
    { value: 'ROADS', label: 'Roads & Infrastructure' },
    { value: 'SANITATION', label: 'Sanitation & Cleanliness' },
    { value: 'LIGHTING', label: 'Street Lighting' },
    { value: 'WATER', label: 'Water Supply' },
    { value: 'WASTE', label: 'Waste Management' }
];

export default function ReportIssue() {
    const [issueType, setIssueType] = useState('ROADS');

    const getIssueTypeLabel = (value: string) => {
        const type = issueTypes.find(t => t.value === value);
        return type ? type.label : value;
    };
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [location, setLocation] = useState('789 Elm Street, Springfield, USA');
    const [coordinates, setCoordinates] = useState('Lat: 34.0522 N, Lon: 118.2437 W');
    const [latInput, setLatInput] = useState('34.0522');
    const [lonInput, setLonInput] = useState('118.2437');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getCategoryImage = (category: string) => {
        return categoryImages[category as keyof typeof categoryImages] || Card1Image;
    };

    const pickImageFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to access your photos!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            const imageUri = result.assets[0].uri;
            setSelectedImage(imageUri);

            const imageKey = `civic_image_${Date.now()}`;
            try {
                await AsyncStorage.setItem(imageKey, imageUri);
                await AsyncStorage.setItem('lastImageKey', imageKey);
            } catch (error) {
                console.log('Failed to store image:', error);
            }
        }
    };

    const takePhotoWithCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera permissions to take photos!');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            const imageUri = result.assets[0].uri;
            setSelectedImage(imageUri);

            const imageKey = `civic_image_${Date.now()}`;
            try {
                await AsyncStorage.setItem(imageKey, imageUri);
                await AsyncStorage.setItem('lastImageKey', imageKey);
            } catch (error) {
                console.log('Failed to store image:', error);
            }
        }
    };

    const showImageOptions = () => {
        Alert.alert(
            'Add Photo',
            'Choose how you want to add a photo:',
            [
                {
                    text: 'Camera',
                    onPress: takePhotoWithCamera
                },
                {
                    text: 'Gallery',
                    onPress: pickImageFromGallery
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    const detectLocation = () => {
        if (latInput.trim() && lonInput.trim()) {
            const randomLocation = locationDataset[Math.floor(Math.random() * locationDataset.length)];
            setLocation(randomLocation.address);
            setCoordinates(`Lat: ${latInput} N, Lon: ${lonInput} W`);
            Alert.alert('Location Detected!', `Found: ${randomLocation.address}`);
        } else {
            Alert.alert('Invalid Coordinates', 'Please enter valid latitude and longitude values.');
        }
    };

    const submitIssue = async () => {
        if (!selectedImage || !notes.trim()) {
            Alert.alert('Missing Information', 'Please add a photo and describe the issue.');
            return;
        }

        setIsSubmitting(true);

        try {
            const issueData: CreateIssueRequest = {
                description: notes,
                category: issueType,
                latitude: parseFloat(latInput),
                longitude: parseFloat(lonInput),
                photoUrl: selectedImage
            };

            const createdIssue = await apiService.createIssue(issueData, 1, 1);

            // Also store in local storage for offline access
            const newIssue = {
                id: createdIssue.id || Date.now(),
                image: selectedImage,
                title: notes.substring(0, 50) + (notes.length > 50 ? '...' : ''),
                status: createdIssue.status || 'Pending',
                statusColor: '#FF6B6B',
                time: 'Just now',
                location: location,
                notes: notes,
                coordinates: coordinates,
                timestamp: new Date().toISOString()
            };

            const existingIssuesString = await AsyncStorage.getItem('userIssues');
            const issues = existingIssuesString ? JSON.parse(existingIssuesString) : [];
            issues.unshift(newIssue);

            await AsyncStorage.setItem('userIssues', JSON.stringify(issues));

            Alert.alert(
                'Success!',
                'Your civic issue has been reported successfully.',
                [{ text: 'OK', onPress: () => router.push('/dashboard') }]
            );
        } catch (error) {
            console.log('Submit error:', error);
            Alert.alert('Error', 'Failed to submit the issue. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden={true} />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Report Civic Issue</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    <View style={styles.issueTypeSection}>
                        <Text style={styles.sectionTitle}>Issue Type</Text>
                        <TouchableOpacity
                            style={styles.dropdown}
                            onPress={() => setShowDropdown(!showDropdown)}
                        >
                            <Text style={styles.dropdownText}>{getIssueTypeLabel(issueType)}</Text>
                            <Text style={styles.dropdownIcon}>{showDropdown ? '▲' : '▼'}</Text>
                        </TouchableOpacity>

                        {showDropdown && (
                            <View style={styles.dropdownOptions}>
                                {issueTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={styles.dropdownOption}
                                        onPress={() => {
                                            setIssueType(type.value);
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <Text style={styles.dropdownOptionText}>{type.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={styles.photoSection}>
                        <Text style={styles.sectionTitle}>Photo Upload</Text>
                        <TouchableOpacity style={styles.imageContainer} onPress={showImageOptions}>
                            {selectedImage ? (
                                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <Image
                                        source={getCategoryImage(issueType)}
                                        style={styles.placeholderImage}
                                    />
                                    <View style={styles.overlayContainer}>
                                        <Text style={styles.cameraIcon}>📷</Text>
                                        <Text style={styles.imageText}>Tap to add photo</Text>
                                        <Text style={styles.categoryHint}>Showing {getIssueTypeLabel(issueType)} example</Text>
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.addPhotoButton} onPress={showImageOptions}>
                            <Text style={styles.addPhotoText}>+ Add Photo</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.locationSection}>
                        <Text style={styles.sectionTitle}>Location Detection</Text>

                        <View style={styles.coordinateInputs}>
                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>Latitude:</Text>
                                <TextInput
                                    style={styles.coordinateInput}
                                    placeholder="34.0522"
                                    value={latInput}
                                    onChangeText={setLatInput}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>Longitude:</Text>
                                <TextInput
                                    style={styles.coordinateInput}
                                    placeholder="118.2437"
                                    value={lonInput}
                                    onChangeText={setLonInput}
                                    keyboardType="numeric"
                                />
                            </View>
                            <TouchableOpacity style={styles.detectButton} onPress={detectLocation}>
                                <Text style={styles.detectButtonText}>Detect Location</Text>
                            </TouchableOpacity>
                        </View>

                        {location !== '789 Elm Street, Springfield, USA' && (
                            <View style={styles.detectedLocationContainer}>
                                <Text style={styles.detectedLocationTitle}>Detected Location:</Text>
                                <View style={styles.locationContainer}>
                                    <Text style={styles.locationIcon}>📍</Text>
                                    <Text style={styles.locationText}>{location}</Text>
                                </View>
                                <View style={styles.coordinatesContainer}>
                                    <Text style={styles.coordinatesText}>{coordinates}</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    <View style={styles.notesSection}>
                        <Text style={styles.sectionTitle}>Notes</Text>
                        <TextInput
                            style={styles.notesInput}
                            placeholder="Describe the issue in detail..."
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={6}
                            value={notes}
                            onChangeText={setNotes}
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={submitIssue}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text style={styles.submitButtonText}>Submit Issue</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
    backButton: {
        padding: 8,
    },
    backIcon: {
        fontSize: 24,
        color: '#333',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
    },
    placeholder: {
        width: 40,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    imageContainer: {
        height: 200,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        flex: 1,
        position: 'relative',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        opacity: 0.7,
    },
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    cameraIcon: {
        fontSize: 48,
        color: '#FFFFFF',
        marginBottom: 8,
    },
    imageText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        marginBottom: 4,
    },
    categoryHint: {
        fontSize: 12,
        color: '#FFFFFF',
        opacity: 0.8,
    },
    addPhotoButton: {
        borderWidth: 1,
        borderColor: '#FF6B6B',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    addPhotoText: {
        fontSize: 16,
        color: '#FF6B6B',
        fontWeight: '500',
    },
    locationSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    locationIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    locationText: {
        fontSize: 14,
        color: '#333',
    },
    coordinatesContainer: {
        backgroundColor: '#F8F8F8',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 6,
    },
    coordinatesText: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'monospace',
    },
    notesSection: {
        marginBottom: 24,
    },
    notesInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#333',
        height: 120,
    },
    coordinateInputs: {
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        width: 80,
    },
    coordinateInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#FFFFFF',
    },
    detectButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 8,
    },
    detectButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    detectedLocationContainer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#F8F8F8',
        borderRadius: 8,
    },
    detectedLocationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    issueTypeSection: {
        marginBottom: 24,
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
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    dropdownOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dropdownOptionText: {
        fontSize: 16,
        color: '#333',
    },
    photoSection: {
        marginBottom: 24,
    },
    submitButton: {
        backgroundColor: '#D64545',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 24,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});