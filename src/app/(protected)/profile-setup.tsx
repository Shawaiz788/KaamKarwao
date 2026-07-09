import React, { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Pressable,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../provider/auth';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { createUser } from '../../../api/user';
import { useMutation } from '@tanstack/react-query';
import { City, getCities, getOrCreateLocationChain } from '../../../api/location';
import { COUNTRY_DATA, getCountryFromPhone } from '../../constants/locationData';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';

type Role = 'client' | 'provider';

const getLeafletHtml = (initialLat: number, initialLng: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #map { height: 100vh; width: 100vw; z-index: 1; }
    .search-container {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      z-index: 1000;
      background: white;
      padding: 6px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      gap: 6px;
    }
    .search-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
    }
    .search-btn {
      background: #0B5A3E;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
    }
    .confirm-btn-container {
      position: absolute;
      bottom: 20px;
      left: 20px;
      right: 20px;
      z-index: 1000;
    }
    .confirm-btn {
      background: #D97706;
      color: white;
      border: none;
      padding: 14px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: bold;
      width: 100%;
      box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4);
      cursor: pointer;
      text-align: center;
    }
    .confirm-btn:active {
      background: #B45309;
    }
  </style>
</head>
<body>
  <div class="search-container">
    <input type="text" id="search-input" class="search-input" placeholder="Search place or address..." />
    <button onclick="searchPlace()" class="search-btn">Search</button>
  </div>
  <div id="map"></div>
  <div class="confirm-btn-container">
    <button onclick="confirmLocation()" class="confirm-btn">Confirm Selected Location</button>
  </div>

  <script>
    var map = L.map('map', { zoomControl: false }).setView([${initialLat}, ${initialLng}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    var marker = L.marker([${initialLat}, ${initialLng}], { draggable: true }).addTo(map);
    var selectedCoords = { lat: ${initialLat}, lng: ${initialLng} };

    function updateCoords(lat, lng) {
      selectedCoords.lat = lat;
      selectedCoords.lng = lng;
    }

    marker.on('dragend', function (e) {
      var pos = marker.getLatLng();
      updateCoords(pos.lat, pos.lng);
    });

    map.on('click', function (e) {
      marker.setLatLng(e.latlng);
      updateCoords(e.latlng.lat, e.latlng.lng);
    });

    function searchPlace() {
      var query = document.getElementById('search-input').value;
      if (!query) return;
      
      fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query))
        .then(function(response) { return response.json(); })
        .then(function(data) {
          if (data && data.length > 0) {
            var first = data[0];
            var lat = parseFloat(first.lat);
            var lon = parseFloat(first.lon);
            var latlng = [lat, lon];
            map.setView(latlng, 16);
            marker.setLatLng(latlng);
            updateCoords(lat, lon);
          } else {
            alert('Place not found. Try another search query.');
          }
        })
        .catch(function(err) {
          console.error(err);
          alert('Error searching for place. Please try again.');
        });
    }

    function confirmLocation() {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'LOCATION_SELECTED',
          lat: selectedCoords.lat,
          lng: selectedCoords.lng
        }));
      }
    }
  </script>
</body>
</html>
`;

export default function ProfileSetupScreen() {
  const insets = useSafeAreaInsets();
  const { user, login } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();

  const countryName = getCountryFromPhone(user?.phoneNumber);
  const countryCities = COUNTRY_DATA[countryName]?.cities || COUNTRY_DATA['Pakistan'].cities;

  // Component States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>(countryCities[0] || 'Lahore');
  const [role, setRole] = useState<Role>('client');
  const [gender, setGender] = useState<string>('male');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [area, setArea] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [pinLocation, setPinLocation] = useState('');
  const [landmark, setLandmark] = useState('');
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);

  const cityAreas = selectedCity
    ? (COUNTRY_DATA[countryName]?.areas[selectedCity] || [])
    : [];

  const fetchGpsLocation = async (silent = false) => {
    setLoadingGps(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!silent) {
          Alert.alert('Permission Denied', 'Permission to access location was denied. Please input pin location manually.');
        }
        return;
      }
      let loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setPinLocation(`${loc.coords.latitude}, ${loc.coords.longitude}`);
    } catch (err: any) {
      if (!silent) {
        Alert.alert('GPS Error', 'Failed to retrieve your current location.');
      }
      console.error(err);
    } finally {
      setLoadingGps(false);
    }
  };

  useEffect(() => {
    if (!pinLocation) {
      fetchGpsLocation(true);
    }
  }, []);

  // Reset area when city changes
  useEffect(() => {
    setArea('');
  }, [selectedCity]);

  const getInitialCoords = () => {
    if (pinLocation) {
      const parts = pinLocation.split(',');
      if (parts.length === 2) {
        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }
    return { lat: 31.5204, lng: 74.3587 }; // Default fallback
  };

  const handleMapMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'LOCATION_SELECTED') {
        setPinLocation(`${data.lat.toFixed(6)}, ${data.lng.toFixed(6)}`);
        setShowMapPicker(false);
      }
    } catch (err) {
      console.error('Failed to parse WebView message:', err);
    }
  };



  const isNameValid = fullName.trim().length >= 3;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const addMutation = useMutation({
    mutationFn: createUser,
  })





  const CreateUser = async () => {
    if (!user)
      return null;

    // Split fullName into first_name and last_name
    const nameParts = fullName.trim().split(/\s+/);
    const first_name = nameParts[0] || '';
    const last_name = nameParts.slice(1).join(' ') || '';

    // Map role to (Viewer and Worker in the database)
    const usertype_id = role === 'provider' ? 1 : 2;

    if (!selectedCity) {
      throw new Error('Please select a city.');
    }
    if (!area) {
      throw new Error('Please select your Area / Sector.');
    }
    if (!houseNumber.trim()) {
      throw new Error('House number is required.');
    }
    if (!/^\d+$/.test(houseNumber.trim())) {
      throw new Error('House number must contain only numbers.');
    }
    if (!streetNumber.trim()) {
      throw new Error('Street number is required.');
    }
    if (!zipCode.trim()) {
      throw new Error('Zip code is required.');
    }
    if (!/^\d+$/.test(zipCode.trim())) {
      throw new Error('Zip code must contain only numbers.');
    }
    if (!pinLocation.trim()) {
      throw new Error('Pin location / GPS coordinates are required.');
    }

    console.log('[profile-setup] Resolving location chain...');
    const resolvedLoc = await getOrCreateLocationChain({
      countryName: countryName || 'Pakistan',
      cityName: selectedCity,
      areaName: area,
      houseNumber: houseNumber.trim(),
      streetNumber: streetNumber.trim(),
      pinLocation: pinLocation.trim(),
      zipCode: zipCode.trim(),
      landmark: landmark.trim(),
    });

    const locationId = resolvedLoc.id;
    if (!locationId) {
      throw new Error('Failed to resolve or create your location profile.');
    }
    console.log('[profile-setup] Resolved Location ID:', locationId);

    const savedPassword = await SecureStore.getItemAsync('pending_signup_password');
    console.log('[SecureStore] Loaded pending signup password string length:', savedPassword ? savedPassword.length : 0);
    const passwordToUse = savedPassword || (params.password as string);

    const newUser = {
      first_name,
      last_name,
      phone_number: user.phoneNumber || '',
      email: email.trim(),
      gender,
      usertype_id: usertype_id,
      location_id: locationId,
      password: passwordToUse,
      overall_rating: 5,
    };

    return await addMutation.mutateAsync(newUser);
  };

  const handleGoToHome = async () => {
    if (!user) return;

    // Form Validation
    if (!fullName.trim()) {
      setErrorMsg('Full name is required');
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Email address is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address (e.g., you@example.com)');
      return;
    }

    // Location validation
    if (!selectedCity) {
      setErrorMsg('Please select a city.');
      return;
    }
    if (!area) {
      setErrorMsg('Please select your Area / Sector.');
      return;
    }
    if (!houseNumber.trim()) {
      setErrorMsg('House number is required.');
      return;
    }
    if (!/^\d+$/.test(houseNumber.trim())) {
      setErrorMsg('House number must contain only numbers.');
      return;
    }
    if (!streetNumber.trim()) {
      setErrorMsg('Street number is required.');
      return;
    }
    if (!zipCode.trim()) {
      setErrorMsg('Zip code is required.');
      return;
    }
    if (!/^\d+$/.test(zipCode.trim())) {
      setErrorMsg('Zip code must contain only numbers.');
      return;
    }
    if (!pinLocation.trim()) {
      setErrorMsg('Pin location / GPS coordinates are required.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      // 1. Call the backend API FIRST to register the user in Postgres
      console.log('[profile-setup] Starting CreateUser chain...');
      const createdUser = await CreateUser();

      // Clean up the temporary password storage
      await SecureStore.deleteItemAsync('pending_signup_password');
      console.log('[SecureStore] Deleted pending signup password');

      // Update local session
      if (createdUser && user) {
        const appUser = {
          uid: createdUser.id?.toString() || user.uid,
          displayName: `${createdUser.first_name} ${createdUser.last_name}`.trim(),
          email: createdUser.email,
          phoneNumber: createdUser.phone_number,
          id: createdUser.id,
          first_name: createdUser.first_name,
          last_name: createdUser.last_name,
          gender: createdUser.gender,
          usertype_id: createdUser.usertype_id,
          location_id: createdUser.location_id,
        };
        await login(appUser);
      }

      console.log('Saved locally / logged profile parameters:', {
        uid: user?.uid,
        email: email.trim(),
        fullName: fullName.trim(),
        phone: user?.phoneNumber,
        city: selectedCity,
        role,
        gender,
        password: params.password,
      });

      console.log('Profile setup saved successfully!');
      router.replace('/home');
    } catch (err: any) {
      console.error('[profile-setup] Profile setup failed:', err);
      setErrorMsg(err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0B5A3E" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={[styles.headerContainer, { paddingTop: insets.top + 36 }]}>
            <Text style={styles.headerTitle}>Complete Profile</Text>
            <Text style={styles.headerSubtitle}>Tell us a bit about yourself to get started</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {errorMsg && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* Full Name Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Full Name</Text>
              <View
                style={[
                  styles.inputFieldContainer,
                  isNameValid && { borderColor: '#16A34A' }
                ]}
              >
                <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="John Doe"
                  placeholderTextColor="#9CA3AF"
                  value={fullName}
                  onChangeText={(val) => {
                    const clean = val.replace(/[0-9]/g, '');
                    setFullName(clean);
                    if (errorMsg) setErrorMsg(null);
                  }}
                />
                <View style={styles.indicatorContainer}>
                  {isNameValid ? (
                    <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                  ) : (
                    <View style={styles.dotIndicator} />
                  )}
                </View>
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Address</Text>
              <View
                style={[
                  styles.inputFieldContainer,
                  isEmailValid && { borderColor: '#16A34A' }
                ]}
              >
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="you@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMsg) setErrorMsg(null);
                  }}
                />
                <View style={styles.indicatorContainer}>
                  {isEmailValid ? (
                    <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
                  ) : (
                    <View style={styles.dotIndicator} />
                  )}
                </View>
              </View>
            </View>

            {/* City Selector */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Select your City</Text>
              <View style={{ zIndex: 2000 }}>
                <Pressable
                  style={styles.dropdownTrigger}
                  onPress={() => {
                    setShowCityDropdown(!showCityDropdown);
                    setShowAreaDropdown(false);
                  }}
                >
                  <Text style={selectedCity ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>
                    {selectedCity || 'Select City...'}
                  </Text>
                  <Ionicons name={showCityDropdown ? 'chevron-up' : 'chevron-down'} size={20} color="#4B5563" />
                </Pressable>

                {showCityDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
                      {countryCities.map((c) => (
                        <Pressable
                          key={c}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedCity(c);
                            setShowCityDropdown(false);
                            if (errorMsg) setErrorMsg(null);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{c}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            {/* Area Selector */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Area / Sector</Text>
              <View style={{ zIndex: 1000 }}>
                <Pressable
                  style={styles.dropdownTrigger}
                  onPress={() => setShowAreaDropdown(!showAreaDropdown)}
                >
                  <Text style={area ? styles.dropdownTextSelected : styles.dropdownTextPlaceholder}>
                    {area || 'Select Area / Sector...'}
                  </Text>
                  <Ionicons name={showAreaDropdown ? 'chevron-up' : 'chevron-down'} size={20} color="#4B5563" />
                </Pressable>

                {showAreaDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }}>
                      {cityAreas.map((a, idx) => (
                        <Pressable
                          key={idx}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setArea(a);
                            setShowAreaDropdown(false);
                            if (errorMsg) setErrorMsg(null);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{a}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            {/* House Number */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>House Number</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="E.g. 42"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={houseNumber}
                  onChangeText={(val) => {
                    setHouseNumber(val.replace(/[^0-9]/g, ''));
                    if (errorMsg) setErrorMsg(null);
                  }}
                />
              </View>
            </View>

            {/* Street Number */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Street Number</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="E.g. Street 5"
                  placeholderTextColor="#9CA3AF"
                  value={streetNumber}
                  onChangeText={(val) => {
                    setStreetNumber(val);
                    if (errorMsg) setErrorMsg(null);
                  }}
                />
              </View>
            </View>

            {/* Zip Code */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Zip Code</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="E.g. 54000"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={zipCode}
                  onChangeText={(val) => {
                    setZipCode(val.replace(/[^0-9]/g, ''));
                    if (errorMsg) setErrorMsg(null);
                  }}
                />
              </View>
            </View>

            {/* Pin Location */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Pin Location / GPS Coordinates</Text>
              <View style={styles.gpsRow}>
                <TextInput
                  style={[styles.textInput, styles.inputFieldContainer, { flex: 1 }]}
                  placeholder="E.g. 31.5204, 74.3587"
                  placeholderTextColor="#9CA3AF"
                  value={pinLocation}
                  onChangeText={(val) => {
                    setPinLocation(val);
                    if (errorMsg) setErrorMsg(null);
                  }}
                />
                <Pressable
                  style={styles.mapTriggerBtn}
                  onPress={() => setShowMapPicker(true)}
                >
                  <Ionicons name="map-outline" size={20} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  style={[styles.gpsBtnSquare, loadingGps && styles.gpsBtnLoading]}
                  onPress={() => fetchGpsLocation(false)}
                  disabled={loadingGps}
                >
                  {loadingGps ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="locate-outline" size={20} color="#FFFFFF" />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Nearest Landmark */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Nearest Landmark (Optional)</Text>
              <View style={styles.inputFieldContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="E.g. Near Al-Fatah supermarket"
                  placeholderTextColor="#9CA3AF"
                  value={landmark}
                  onChangeText={(val) => {
                    setLandmark(val);
                    if (errorMsg) setErrorMsg(null);
                  }}
                />
              </View>
            </View>

            {/* Gender Selector */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Select your Gender</Text>
              <View style={styles.gridContainer}>
                {(['Male', 'Female', 'Other'] as string[]).map((genderName) => {
                  const isSelected = gender.toLowerCase() === genderName.toLowerCase();
                  return (
                    <Pressable
                      key={genderName}
                      style={[
                        styles.gridCard,
                        isSelected ? styles.gridCardActive : styles.gridCardInactive,
                        { width: '30.5%' }
                      ]}
                      onPress={() => setGender(genderName.toLowerCase())}
                    >
                      <Ionicons
                        name={
                          genderName === 'Male'
                            ? 'male'
                            : genderName === 'Female'
                              ? 'female'
                              : 'people'
                        }
                        size={18}
                        color={isSelected ? '#FFFFFF' : '#4B5563'}
                      />
                      <Text
                        style={[
                          styles.gridCardText,
                          isSelected ? styles.gridCardTextActive : styles.gridCardTextInactive,
                          { fontSize: 13 }
                        ]}
                      >
                        {genderName}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Role Selection */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Register as</Text>
              <View style={styles.roleContainer}>
                <Pressable
                  style={[
                    styles.roleCard,
                    role === 'client' ? styles.roleCardActive : styles.roleCardInactive,
                  ]}
                  onPress={() => setRole('client')}
                >
                  <View style={styles.roleTextContainer}>
                    <Text
                      style={[
                        styles.roleTitle,
                        role === 'client' ? styles.roleTitleActive : styles.roleTitleInactive,
                      ]}
                    >
                      Client
                    </Text>
                    <Text
                      style={[
                        styles.roleDesc,
                        role === 'client' ? styles.roleDescActive : styles.roleDescInactive,
                      ]}
                    >
                      I want to find trusted local services for my work.
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      role === 'client' ? styles.radioCircleActive : styles.radioCircleInactive,
                    ]}
                  >
                    {role === 'client' && <View style={styles.radioDot} />}
                  </View>
                </Pressable>

                <Pressable
                  style={[
                    styles.roleCard,
                    role === 'provider' ? styles.roleCardActive : styles.roleCardInactive,
                  ]}
                  onPress={() => setRole('provider')}
                >
                  <View style={styles.roleTextContainer}>
                    <Text
                      style={[
                        styles.roleTitle,
                        role === 'provider' ? styles.roleTitleActive : styles.roleTitleInactive,
                      ]}
                    >
                      Service Provider
                    </Text>
                    <Text
                      style={[
                        styles.roleDesc,
                        role === 'provider' ? styles.roleDescActive : styles.roleDescInactive,
                      ]}
                    >
                      I want to provide my services and get hired by clients.
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      role === 'provider' ? styles.radioCircleActive : styles.radioCircleInactive,
                    ]}
                  >
                    {role === 'provider' && <View style={styles.radioDot} />}
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Save Button */}

          </View>
        </ScrollView>

        {/* Fixed Footer with Save Button */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
              isLoading && styles.saveButtonDisabled,
            ]}
            onPress={handleGoToHome}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Finish & Continue</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* WebView Map Picker Modal */}
      <Modal visible={showMapPicker} animationType="slide" onRequestClose={() => setShowMapPicker(false)}>
        <View style={styles.mapModalContainer}>
          {/* Header */}
          <View style={[styles.mapHeader, { paddingTop: Math.max(insets.top, 16) }]}>
            <Pressable onPress={() => setShowMapPicker(false)} style={styles.mapBackBtn}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.mapHeaderTitle}>Select Location on Map</Text>
            <View style={{ width: 24 }} />
          </View>

          <WebView
            style={{ flex: 1 }}
            originWhitelist={['*']}
            source={{ html: getLeafletHtml(getInitialCoords().lat, getInitialCoords().lng) }}
            javaScriptEnabled={true}
            onMessage={handleMapMessage}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    backgroundColor: '#0B5A3E',
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 6,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    gap: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  inputWrapper: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: '#111827',
    fontSize: 15,
    fontWeight: '500',
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginRight: 10,
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
    paddingRight: 10,
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    color: '#111827',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  gridCardActive: {
    backgroundColor: '#0B5A3E',
    borderColor: '#0B5A3E',
  },
  gridCardInactive: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  gridCardText: {
    fontSize: 14,
    fontWeight: '600',
  },
  gridCardTextActive: {
    color: '#FFFFFF',
  },
  gridCardTextInactive: {
    color: '#4B5563',
  },
  roleContainer: {
    gap: 16,
  },
  roleCard: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  roleCardActive: {
    borderColor: '#0B5A3E',
    backgroundColor: 'rgba(11, 90, 62, 0.04)',
  },
  roleCardInactive: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  roleTextContainer: {
    flex: 1,
    gap: 4,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  roleTitleActive: {
    color: '#0B5A3E',
  },
  roleTitleInactive: {
    color: '#374151',
  },
  roleDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  roleDescActive: {
    color: '#0B5A3E',
    opacity: 0.8,
  },
  roleDescInactive: {
    color: '#6B7280',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: '#0B5A3E',
  },
  radioCircleInactive: {
    borderColor: '#9CA3AF',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0B5A3E',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#D97706',
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  saveButtonDisabled: {
    backgroundColor: '#F3F4F6',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  indicatorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  dropdownTextPlaceholder: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '500',
  },
  dropdownTextSelected: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '500',
  },
  dropdownList: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    maxHeight: 200,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapHeader: {
    backgroundColor: '#0B5A3E',
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mapBackBtn: {
    padding: 4,
  },
  mapHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mapTriggerBtn: {
    backgroundColor: '#10B981',
    height: 52,
    width: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  gpsBtnSquare: {
    backgroundColor: '#0B5A3E',
    height: 52,
    width: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  gpsBtnLoading: {
    opacity: 0.7,
  },
});
