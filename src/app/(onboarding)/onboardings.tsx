import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInRight,
} from 'react-native-reanimated';
import * as NavigationBar from 'expo-navigation-bar';
import { styles } from '@/styles/onboarding.styles';

const { width, height } = Dimensions.get('window');

// Slide 1 Illustration (Handyman/Electrician profile & tools)
const Illustration1 = () => (
  <View style={styles.illustrationContainer}>
    {/* Background glowing shape */}
    <View style={styles.glowCircle} />

    {/* Large House Outline (geometric backdrop) */}
    <View style={styles.houseOutline}>
      <Ionicons name="home-outline" size={170} color="rgba(16, 185, 129, 0.08)" />
    </View>

    {/* Pakistan Verification Badge */}
    <View style={styles.pakBadge}>
      <Text style={styles.pakBadgeText}>🇵🇰 Pakistan's #1 Network</Text>
    </View>

    {/* Provider Profile Showcase Card */}
    <View style={styles.providerCard}>
      <View style={styles.profileRow}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={20} color="#0F5C43" />
        </View>
        <View style={styles.providerDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.providerName}>Junaid Ahmed</Text>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{ marginLeft: 3 }} />
          </View>
          <Text style={styles.providerType}>Verified Electrician</Text>
        </View>
      </View>
      <View style={styles.ratingRow}>
        <Ionicons name="star" size={12} color="#FBBF24" />
        <Text style={styles.ratingText}>4.9 (124 jobs completed)</Text>
      </View>
    </View>

    {/* Floating Tool Badge - Hammer */}
    <View style={[styles.floatingBadge, styles.badgeHammer]}>
      <Ionicons name="hammer" size={18} color="#0F5C43" />
    </View>

    {/* Floating Tool Badge - Wrench */}
    <View style={[styles.floatingBadge, styles.badgeWrench]}>
      <Ionicons name="build" size={18} color="#0F5C43" />
    </View>
  </View>
);

// Slide 2 Illustration (Location map pins & searching radar)
const Illustration2 = () => (
  <View style={styles.illustrationContainer}>
    {/* Radar Rings (Concentric Circles) */}
    <View style={[styles.radarRing, styles.radarRingLarge]} />
    <View style={[styles.radarRing, styles.radarRingMedium]} />
    <View style={[styles.radarRing, styles.radarRingSmall]} />

    {/* Glowing Center Core */}
    <View style={styles.glowingCenter} />

    {/* Central Location Pin */}
    <View style={styles.centerPinWrapper}>
      <Ionicons name="location" size={36} color="#10B981" />
      <View style={styles.pinShadow} />
    </View>

    {/* Location Label Badge */}
    <View style={styles.locationBadge}>
      <Ionicons name="navigate" size={10} color="#0F5C43" style={{ marginRight: 4 }} />
      <Text style={styles.locationBadgeText}>Sector F-7, Islamabad</Text>
    </View>

    {/* Floating nearby worker 1 */}
    <View style={[styles.nearbyWorker, styles.workerPos1]}>
      <View style={styles.avatarMini}>
        <Text style={styles.avatarText}>NK</Text>
      </View>
      <View style={styles.onlineDot} />
    </View>

    {/* Floating nearby worker 2 */}
    <View style={[styles.nearbyWorker, styles.workerPos2]}>
      <View style={styles.avatarMini}>
        <Text style={styles.avatarText}>AS</Text>
      </View>
      <View style={styles.onlineDot} />
    </View>

    {/* Floating nearby worker 3 */}
    <View style={[styles.nearbyWorker, styles.workerPos3]}>
      <View style={styles.avatarMini}>
        <Text style={styles.avatarText}>ZA</Text>
      </View>
      <View style={styles.onlineDot} />
    </View>

    {/* Booking Confirmed Popup Card */}
    <View style={styles.confirmationCard}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.checkWrapper}>
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        </View>
        <Text style={styles.confirmationTitle}>Booking Confirmed</Text>
      </View>
      <Text style={styles.confirmationDetails}>Arsalan is arriving in 20 min</Text>
      <View style={styles.starsRow}>
        <Ionicons name="star" size={11} color="#FBBF24" />
        <Ionicons name="star" size={11} color="#FBBF24" />
        <Ionicons name="star" size={11} color="#FBBF24" />
        <Ionicons name="star" size={11} color="#FBBF24" />
        <Ionicons name="star" size={11} color="#FBBF24" />
      </View>
    </View>
  </View>
);

// Slide 3 Illustration (Provider earnings dashboard & job requests)
const Illustration3 = () => (
  <View style={styles.illustrationContainer}>
    {/* Background glowing shape */}
    <View style={styles.glowCircle} />

    {/* Accept Request Card Component */}
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.alertPulse} />
        <Text style={styles.requestLabel}>New Job Request</Text>
      </View>
      <Text style={styles.requestTitle}>AC Maintenance & Repair</Text>
      <Text style={styles.requestLocation}>Sector G-11 • Zainab A.</Text>

      <View style={styles.acceptMockBtn}>
        <Text style={styles.acceptMockBtnText}>Accept Request</Text>
      </View>
    </View>

    {/* Floating Wallet Earnings Card */}
    <View style={styles.walletCard}>
      <View style={styles.walletHeader}>
        <Ionicons name="wallet-outline" size={12} color="#0F5C43" />
        <Text style={styles.walletLabel}>My Wallet</Text>
      </View>
      <Text style={styles.walletAmount}>Rs. 24,500</Text>

      {/* Micro-sparkline columns */}
      <View style={styles.sparklineRow}>
        <View style={[styles.sparklineBar, { height: 8 }]} />
        <View style={[styles.sparklineBar, { height: 14 }]} />
        <View style={[styles.sparklineBar, { height: 11 }]} />
        <View style={[styles.sparklineBar, { height: 18 }]} />
        <View style={[styles.sparklineBar, { height: 26, backgroundColor: '#10B981' }]} />
      </View>
    </View>

    {/* Customer Review Bubble */}
    <View style={styles.reviewBubble}>
      <Text style={styles.reviewText}>Bohot acchi service! ⭐⭐⭐⭐⭐</Text>
      <View style={styles.bubbleTail} />
    </View>

    {/* Success Badge */}
    <View style={styles.badgeSuccess}>
      <Ionicons name="trophy" size={11} color="#FBBF24" style={{ marginRight: 4 }} />
      <Text style={styles.badgeSuccessText}>Top Partner</Text>
    </View>
  </View>
);

export default function OnboardingScreen1() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  // Use light button icons on Android to remove the contrast background scrim and make the navigation bar transparent over our green background
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setButtonStyleAsync('light').catch(() => {});
    }
    return () => {
      if (Platform.OS === 'android') {
        NavigationBar.setButtonStyleAsync('dark').catch(() => {});
      }
    };
  }, []);

  // Shared Animation Values (Progress Indicators)
  const progress1 = useSharedValue(1);
  const progress2 = useSharedValue(0);
  const progress3 = useSharedValue(0);

  // Trigger animations when the page switches
  useEffect(() => {
    progress1.value = withTiming(page >= 1 ? 1 : 0, { duration: 350 });
    progress2.value = withTiming(page >= 2 ? 1 : 0, { duration: 350 });
    progress3.value = withTiming(page >= 3 ? 1 : 0, { duration: 350 });
  }, [page]);

  // Animated Styles
  const animatedProgressStyle1 = useAnimatedStyle(() => ({
    width: `${progress1.value * 100}%`,
  }));
  const animatedProgressStyle2 = useAnimatedStyle(() => ({
    width: `${progress2.value * 100}%`,
  }));
  const animatedProgressStyle3 = useAnimatedStyle(() => ({
    width: `${progress3.value * 100}%`,
  }));

  const handleNext = () => {
    if (page < 3) {
      setPage(page + 1);
    } else {
      router.replace('/(auth)/sign-in');
    }
  };

  const handleBack = () => {
    if (page > 1) {
      setPage(page - 1);
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/sign-in');
  };

  const getCardBgColor = () => {
    if (page === 1) return '#FDFBF7';
    if (page === 2) return '#F4F7F5';
    return '#FCFCFC';
  };

  const getPageTitle = () => {
    if (page === 1) return "Pakistan Ka Apna\nService Platform";
    if (page === 2) return "Hire Any Service\nIn Minutes";
    return "Professionals -\nGrow Your Business";
  };

  const getPageSubtitle = () => {
    if (page === 1) {
      return "Ghar baithe hire karein background-verified local professionals. Fast, reliable, and premium quality.";
    }
    if (page === 2) {
      return "Plumber, electrician, painter - compare verified ratings and book nearby help instantly.";
    }
    return "List your skills, accept local jobs, and build a trusted reputation. Hundreds of daily requests.";
  };

  const getButtonText = () => {
    if (page === 3) return "Get Started";
    return "Continue";
  };

  const getButtonIcon = () => {
    if (page === 3) return "rocket-outline";
    return "arrow-forward";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F5C43" />

      {/* Elegant Header with Back Button and Segmented Progress on Right */}
      <View style={styles.header}>
        <Pressable style={styles.headerBackBtn} onPress={handleBack} accessibilityLabel="Go back" hitSlop={12}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </Pressable>

        <View style={styles.headerProgressContainer}>
          <View style={styles.progressSegmentTrack}>
            <Animated.View style={[styles.progressSegmentFill, animatedProgressStyle1]} />
          </View>
          <View style={styles.progressSegmentTrack}>
            <Animated.View style={[styles.progressSegmentFill, animatedProgressStyle2]} />
          </View>
          <View style={styles.progressSegmentTrack}>
            <Animated.View style={[styles.progressSegmentFill, animatedProgressStyle3]} />
          </View>
        </View>
      </View>

      {/* Main Container / Hero Card */}
      <View style={styles.cardWrapper}>
        <View style={[styles.heroCard, { backgroundColor: getCardBgColor() }]}>

          {/* Animated Card Content (Smooth slide and fade transition) */}
          {page === 1 && (
            <Animated.View
              key="page1"
              entering={FadeInRight.duration(300)}
              style={styles.innerCard}
            >
              <Illustration1 />
              <View style={styles.textContainer}>
                <Text style={styles.slideTitle}>{getPageTitle()}</Text>
                <Text style={styles.slideSubtitle}>{getPageSubtitle()}</Text>
              </View>
            </Animated.View>
          )}

          {page === 2 && (
            <Animated.View
              key="page2"
              entering={FadeInRight.duration(300)}
              style={styles.innerCard}
            >
              <Illustration2 />
              <View style={styles.textContainer}>
                <Text style={styles.slideTitle}>{getPageTitle()}</Text>
                <Text style={styles.slideSubtitle}>{getPageSubtitle()}</Text>
              </View>
            </Animated.View>
          )}

          {page === 3 && (
            <Animated.View
              key="page3"
              entering={FadeInRight.duration(300)}
              style={styles.innerCard}
            >
              <Illustration3 />
              <View style={styles.textContainer}>
                <Text style={styles.slideTitle}>{getPageTitle()}</Text>
                <Text style={styles.slideSubtitle}>{getPageSubtitle()}</Text>
              </View>
            </Animated.View>
          )}

        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {page < 3 ? (
          <Pressable style={styles.bottomSkipBtn} onPress={handleSkip} hitSlop={12}>
            <Text style={styles.bottomSkipText}>Skip</Text>
          </Pressable>
        ) : null}

        <Pressable 
          style={[
            styles.nextBtnWrapper,
            page === 3 && { marginLeft: 0 }
          ]} 
          onPress={handleNext}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextBtnGradient}
          >
            <Text style={styles.nextBtnText}>{getButtonText()}</Text>
            <Ionicons name={getButtonIcon() as any} size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
