import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, StatusBar } from 'react-native';
import SelectionImage from '../assets/images/Selection.png';

export default function Index() {
  const [phoneNumber, setPhoneNumber] = useState('');

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <View style={styles.logoContainer}>
        <Image
          source={SelectionImage}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Enter your phone number</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.phoneIcon}>📞</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., +1 (555) 123-4567"
            placeholderTextColor="#999"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.disclaimer}>
          We'll send an OTP to verify your number.{'\n'}
          Standard message and data rates apply.
        </Text>

        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Login</Text>
          <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
    paddingHorizontal: 24,
    paddingTop: 130,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  phoneIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#666',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  disclaimer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: '#ffffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  arrow: {
    fontSize: 16,
    color: '#333',
  },
});
