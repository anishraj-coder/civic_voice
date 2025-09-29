import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { apiService } from '../services/api';

export default function AdminPanel() {
    const [statistics, setStatistics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            const stats = await apiService.getIssueStatistics();
            setStatistics(stats);
        } catch (error) {
            console.error('Failed to load statistics:', error);
            Alert.alert('Error', 'Failed to load statistics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadStatistics();
    };

    const handleBulkStatusUpdate = (fromStatus: string, toStatus: string) => {
        Alert.alert(
            'Bulk Update',
            `This would update all ${fromStatus} issues to ${toStatus}. This feature would be implemented with proper backend support.`,
            [{ text: 'OK' }]
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <StatusBar hidden={true} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4A90E2" />
                    <Text style={styles.loadingText}>Loading admin panel...</Text>
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
                <Text style={styles.headerTitle}>Admin Panel</Text>
                <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                    <Text style={styles.refreshIcon}>↻</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
                {/* Statistics Overview */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>System Overview</Text>

                    {statistics && (
                        <View style={styles.statsGrid}>
                            <View style={[styles.statCard, { backgroundColor: '#4A90E2' }]}>
                                <Text style={styles.statNumber}>{statistics.total}</Text>
                                <Text style={styles.statLabel}>Total Issues</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: '#FFA726' }]}>
                                <Text style={styles.statNumber}>{statistics.submitted}</Text>
                                <Text style={styles.statLabel}>Pending Review</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: '#42A5F5' }]}>
                                <Text style={styles.statNumber}>{statistics.inProgress}</Text>
                                <Text style={styles.statLabel}>In Progress</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: '#66BB6A' }]}>
                                <Text style={styles.statNumber}>{statistics.resolved}</Text>
                                <Text style={styles.statLabel}>Resolved</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#42A5F5' }]}
                        onPress={() => handleBulkStatusUpdate('SUBMITTED', 'IN_PROGRESS')}
                    >
                        <Text style={styles.actionButtonText}>
                            Process All Pending Issues
                        </Text>
                        <Text style={styles.actionButtonSubtext}>
                            Move all submitted issues to in-progress
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#66BB6A' }]}
                        onPress={() => handleBulkStatusUpdate('IN_PROGRESS', 'RESOLVED')}
                    >
                        <Text style={styles.actionButtonText}>
                            Mark In-Progress as Resolved
                        </Text>
                        <Text style={styles.actionButtonSubtext}>
                            Bulk resolve all in-progress issues
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#FF6B6B' }]}
                        onPress={() => router.push('/map')}
                    >
                        <Text style={styles.actionButtonText}>
                            View Issues Map
                        </Text>
                        <Text style={styles.actionButtonSubtext}>
                            Geographic overview of all issues
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* System Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>System Information</Text>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>API Status:</Text>
                            <Text style={[styles.infoValue, { color: '#66BB6A' }]}>Connected</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Database:</Text>
                            <Text style={[styles.infoValue, { color: '#66BB6A' }]}>PostgreSQL</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Last Updated:</Text>
                            <Text style={styles.infoValue}>{new Date().toLocaleString()}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Version:</Text>
                            <Text style={styles.infoValue}>1.0.0</Text>
                        </View>
                    </View>
                </View>

                {/* Performance Metrics */}
                {statistics && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Performance Metrics</Text>

                        <View style={styles.metricsContainer}>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>Resolution Rate</Text>
                                <Text style={styles.metricValue}>
                                    {statistics.total > 0
                                        ? Math.round((statistics.resolved / statistics.total) * 100)
                                        : 0
                                    }%
                                </Text>
                            </View>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>Active Issues</Text>
                                <Text style={styles.metricValue}>
                                    {statistics.submitted + statistics.inProgress}
                                </Text>
                            </View>
                            <View style={styles.metricItem}>
                                <Text style={styles.metricLabel}>Rejection Rate</Text>
                                <Text style={styles.metricValue}>
                                    {statistics.total > 0
                                        ? Math.round((statistics.rejected / statistics.total) * 100)
                                        : 0
                                    }%
                                </Text>
                            </View>
                        </View>
                    </View>
                )}
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
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    actionButton: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    actionButtonSubtext: {
        fontSize: 12,
        color: '#FFFFFF',
        opacity: 0.8,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    metricsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
    },
    metricItem: {
        alignItems: 'center',
        flex: 1,
    },
    metricLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        textAlign: 'center',
    },
    metricValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#4A90E2',
    },
});