import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  ToastAndroid,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

interface ReviewModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, body: string) => Promise<void>;
  targetName: string;
  role: 'customer' | 'pro';
  taskTitle?: string;
}

function showToast(msg: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    Alert.alert('', msg);
  }
}

export default function ReviewModal({
  isVisible,
  onClose,
  onSubmit,
  targetName,
  role,
  taskTitle,
}: ReviewModalProps) {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState<number>(5);
  const [body, setBody] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isVisible) return null;

  const handleSubmit = async () => {
    if (rating < 1) {
      showToast('Please select a star rating.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(rating, body.trim());
      showToast('Thank you! Review submitted successfully.');
      onClose();
    } catch (err: any) {
      console.error('[ReviewModal] Submit review failed:', err);
      Alert.alert('Submission Error', err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProView = role === 'pro';

  return (
    <Modal visible={isVisible} animationType="fade" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {/* Header Icon */}
            <View style={[styles.iconCircle, { backgroundColor: isProView ? 'rgba(34, 197, 94, 0.12)' : 'rgba(59, 130, 246, 0.12)' }]}>
              <Ionicons
                name={isProView ? 'ribbon-outline' : 'star'}
                size={34}
                color={isProView ? Colors.pro.accent : '#2563EB'}
              />
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.title}>
              {isProView ? 'Rate Customer' : 'Rate Your Service'}
            </Text>
            <Text style={styles.subtitle}>
              How was your experience with{' '}
              <Text style={styles.highlightName}>{targetName || 'the customer'}</Text>
              {taskTitle ? ` for "${taskTitle}"` : ''}?
            </Text>

            {/* Star Rating Row */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starBtn}
                  hitSlop={6}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={36}
                    color={star <= rating ? '#F59E0B' : Colors.neutral[300]}
                  />
                </Pressable>
              ))}
            </View>
            <Text style={styles.ratingLabel}>
              {rating === 5 ? 'Excellent ⭐' : rating === 4 ? 'Good 👍' : rating === 3 ? 'Average 😐' : rating === 2 ? 'Poor 👎' : 'Terrible 😞'}
            </Text>

            {/* Review Comment Box */}
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInput}
                placeholder="Write a comment about your experience (optional)..."
                placeholderTextColor={Colors.neutral[400]}
                multiline
                numberOfLines={4}
                value={body}
                onChangeText={setBody}
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <Pressable
                style={[styles.btn, styles.btnSkip]}
                onPress={onClose}
                disabled={isSubmitting}
              >
                <Text style={styles.btnSkipText}>Skip for Now</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.btn,
                  styles.btnSubmit,
                  { backgroundColor: isProView ? Colors.pro.accent : '#2563EB' },
                  isSubmitting && { opacity: 0.7 },
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.btnSubmitText}>Submit Review</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: Colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.neutral[900],
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 20,
  },
  highlightName: {
    fontWeight: '700',
    color: Colors.neutral[800],
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  starBtn: {
    padding: 2,
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral[600],
    marginBottom: 18,
  },
  inputBox: {
    width: '100%',
    backgroundColor: Colors.neutral[50],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  textInput: {
    fontSize: 14,
    color: Colors.neutral[800],
    minHeight: 80,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSkip: {
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  btnSkipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[600],
  },
  btnSubmit: {
    elevation: 2,
  },
  btnSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
});
