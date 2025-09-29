import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity, Image, Alert, Share } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function IssueDetails() {
  const { id } = useLocalSearchParams();
  const [issue, setIssue] = useState<IssueReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      loadIssue();
    }
  }, [id]);

  const loadIssue = async () => {
    try {
      const issueData = await apiService.getIssue(Number(id));
      setIssue(issueData);
    } catch (error) {
      console.error('Failed to load issue:', error);
      Alert.alert(
        'Error',
        'Failed to load issue details. This might be demo data or the issue may not exist.',
        [
          { text: 'Go Back', onPress: () => router.back() }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!issue) return;

    setUpdatingStatus(true);
    try {
      const updatedIssue = await apiService.updateIssueStatus(issue.id!, newStatus);
      setIssue(updatedIssue);
      Alert.alert('Success', 'Issue status updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update issue status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleShare = async () => {
    if (!issue) return;

    try {
      await Share.share({
        message: `Check out this issue: ${issue.description?.substring(0, 50)}${issue.description && issue.description.length > 50 ? '...' : ''}\n\nDescription: ${issue.description}\nCategory: ${issue.category}\nStatus: ${issue.status}`,
        title: 'Civic Voice Issue',
      });
    } catch (error) {
      console.error('Error sharing issue:', error);
    }
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading issue details...</Text>
        </View>
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Issue not found</Text>
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
        <Text style={styles.headerTitle}>Issue Details</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareIcon}>↗</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Image
          source={issue.photoUrl ? { uri: issue.photoUrl } : getCategoryImage(issue.category || 'ROADS')}
          style={styles.issueImage}
        />

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{issue.description}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(issue.status) }]}>
            <Text style={styles.statusText}>{issue.status?.replace('_', ' ')}</Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category:</Text>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(issue.category) }]}>
              <Text style={styles.categoryText}>{issue.category}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{issue.city && issue.locality ? `${issue.locality.name}, ${issue.city.name}` : 'Unknown location'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Coordinates:</Text>
            <Text style={styles.infoValue}>{issue.latitude}, {issue.longitude}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Reported:</Text>
            <Text style={styles.infoValue}>
              {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'Unknown'}
            </Text>
          </View>

          {issue.updatedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Updated:</Text>
              <Text style={styles.infoValue}>
                {new Date(issue.updatedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{issue.description}</Text>
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Actions</Text>

          {issue.status === 'SUBMITTED' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.inProgressButton]}
              onPress={() => handleStatusUpdate('IN_PROGRESS')}
              disabled={updatingStatus}
            >
              <Text style={styles.actionButtonText}>
                {updatingStatus ? 'Updating...' : 'Mark as In Progress'}
              </Text>
            </TouchableOpacity>
          )}

          {issue.status === 'IN_PROGRESS' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.resolvedButton]}
              onPress={() => handleStatusUpdate('RESOLVED')}
              disabled={updatingStatus}
            >
              <Text style={styles.actionButtonText}>
                {updatingStatus ? 'Updating...' : 'Mark as Resolved'}
              </Text>
            </TouchableOpacity>
          )}

          {(issue.status === 'SUBMITTED' || issue.status === 'IN_PROGRESS') && (
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectedButton]}
              onPress={() => handleStatusUpdate('REJECTED')}
              disabled={updatingStatus}
            >
              <Text style={styles.actionButtonText}>
                {updatingStatus ? 'Updating...' : 'Reject Issue'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF5252',
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
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 20,
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  issueImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
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
  descriptionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  actionsContainer: {
    marginBottom: 32,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inProgressButton: {
    backgroundColor: '#42A5F5',
  },
  resolvedButton: {
    backgroundColor: '#66BB6A',
  },
  rejectedButton: {
    backgroundColor: '#EF5350',
  },
});
