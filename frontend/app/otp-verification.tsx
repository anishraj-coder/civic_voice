import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Animated } from 'react-native';
import { router } from 'expo-router';

export default function OTPVerification() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [locationStatus, setLocationStatus] = useState('loading');
    const rotateValue = new Animated.Value(0);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        if (text.length === 1 && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    useEffect(() => {
        const startRotation = () => {
            Animated.loop(
                Animated.timing(rotateValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ).start();
        };

        startRotation();

        const timer = setTimeout(() => {
            setLocationStatus('success');
        }, 7000);

        return () => clearTimeout(timer);
    }, []);

    const rotate = rotateValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <StatusBar hidden={true} />

            <View style={styles.content}>
                <Text style={styles.title}>Verify Your Account</Text>

                <Text style={styles.subtitle}>
                    Please enter the 6-digit verification code{'\n'}
                    sent to your phone number.
                </Text>

                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => {
                                inputRefs.current[index] = ref;
                            }}
                            style={styles.otpInput}
                            value={digit}
                            onChangeText={(text) => handleOtpChange(text, index)}
                            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                            keyboardType="numeric"
                            maxLength={1}
                            textAlign="center"
                        />
                    ))}
                </View>

                <View style={styles.locationContainer}>
                    {locationStatus === 'loading' ? (
                        <Animated.View style={[styles.loadingIcon, { transform: [{ rotate }] }]} />
                    ) : (
                        <View style={styles.successIcon}>
                            <Text style={styles.checkmark}>✓</Text>
                        </View>
                    )}
                    <Text style={styles.locationText}>
                        {locationStatus === 'loading' ? 'Detecting accurate location...' : 'Location detected successfully'}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.verifyButton, locationStatus === 'success' && styles.verifyButtonActive]}
                    disabled={locationStatus === 'loading'}
                    onPress={() => locationStatus === 'success' && router.push('/dashboard')}
                >
                    <Text style={[styles.verifyButtonText, locationStatus === 'success' && styles.verifyButtonTextActive]}>
                        Verify
                    </Text>
                </TouchableOpacity>

                <View style={styles.resendContainer}>
                    <Text style={styles.resendText}>Didn't receive the code?</Text>
                    <TouchableOpacity>
                        <Text style={styles.resendLink}>Resend OTP</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffffff',
        paddingTop: 130,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 100,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 24,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 40,
    },
    otpInput: {
        width: 50,
        height: 50,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    loadingIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#E8A5A5',
        borderTopColor: 'transparent',
        marginRight: 8,
    },
    successIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#4CAF50',
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    locationText: {
        fontSize: 14,
        color: '#666',
    },
    verifyButton: {
        backgroundColor: '#f43a3aff',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 24,
        opacity: 0.5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    verifyButtonActive: {
        opacity: 1,
    },
    verifyButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    verifyButtonTextActive: {
        color: '#FFFFFF',
    },
    resendContainer: {
        alignItems: 'center',
    },
    resendText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    resendLink: {
        fontSize: 14,
        color: '#ef2d2dff',
        fontWeight: '600',
    },
});