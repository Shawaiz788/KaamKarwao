import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { getCustomerReviews } from '@/services/user';

interface UserReviewsModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId: number | undefined | null;
  userName: string;
  role: 'customer' | 'pro';
}

export default function UserReviewsModal({
  isVisible,
  onClose,
  userId,
  userName,
  role,
}: UserReviewsModalProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isVisible || !userId) return;

    setLoading(true);
    getCustomerReviews(userId, true)
      .then((data) => {
        setReviews(data);
      })
      .catch((err) => {
        console.error('[UserReviewsModal] Error fetching reviews:', err);
        setReviews([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isVisible, userId]);

  if (!isVisible) return null;

  const isProView = role === 'pro'; // viewing pro reviews

  return (
    <Modal visible={isVisible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, !isProView && { backgroundColor: Colors.pro.card, borderColor: Colors.pro.cardBorder, borderWidth: 1 }]}>
          {/* Header */}
          <View style={[styles.header, !isProView && { borderBottomColor: 'rgba(255, 255, 255, 0.1)' }]}>
            <View>
              <Text style={[styles.title, !isProView && { color: Colors.white }]}>
                {isProView ? 'Reviews of Pro' : 'Reviews of Client'}
              </Text>
              <Text style={[styles.subtitle, !isProView && { color: Colors.neutral[400] }]} numberOfLines={1}>
                {userName || 'User'}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <Ionicons name="close" size={24} color={isProView ? Colors.neutral[600] : Colors.neutral[400]} />
            </Pressable>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={isProView ? Colors.brand.dark : Colors.pro.accent} />
              <Text style={[styles.loadingText, !isProView && { color: Colors.neutral[400] }]}>
                Loading reviews...
              </Text>
            </View>
          ) : reviews.length === 0 ? (
            <View style={styles.center}>
              <Ionicons
                name="star-outline"
                size={48}
                color={isProView ? Colors.neutral[300] : Colors.neutral[600]}
                style={{ marginBottom: 12 }}
              />
              <Text style={[styles.emptyText, !isProView && { color: Colors.white }]}>
                No reviews yet
              </Text>
              <Text style={[styles.emptySubText, !isProView && { color: Colors.neutral[500] }]}>
                This user has not received any reviews yet.
              </Text>
            </View>
          ) : (
            <FlatList
              data={reviews}
              keyExtractor={(item) => String(item.id)}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={[styles.reviewItem, !isProView && { backgroundColor: '#1C2E23', borderColor: Colors.pro.cardBorder }]}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      <Ionicons
                        name="person-circle-outline"
                        size={24}
                        color={isProView ? Colors.neutral[500] : Colors.neutral[400]}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={[styles.reviewerName, !isProView && { color: Colors.white }]}>
                        {item.given_by_name || `User #${item.given_by}`}
                      </Text>
                    </View>
                    <View style={[styles.ratingRow, !isProView && { backgroundColor: '#1A3324' }]}>
                      <Ionicons name="star" size={14} color="#F59E0B" style={{ marginRight: 2 }} />
                      <Text style={[styles.ratingText, !isProView && { color: '#4ADE80' }]}>
                        {Number(item.rating).toFixed(1)}
                      </Text>
                    </View>
                  </View>
                  {item.body ? (
                    <Text style={[styles.reviewBody, !isProView && { color: Colors.neutral[300] }]}>
                      "{item.body}"
                    </Text>
                  ) : null}
                  {item.created_at ? (
                    <Text style={styles.reviewDate}>
                      {new Date(item.created_at).toLocaleDateString() || item.created_at}
                    </Text>
                  ) : null}
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.65,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.neutral[900],
  },
  subtitle: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginTop: 2,
    maxWidth: 250,
  },
  closeBtn: {
    padding: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.neutral[500],
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.neutral[700],
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 13,
    color: Colors.neutral[400],
    textAlign: 'center',
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  reviewItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.neutral[800],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  reviewBody: {
    fontSize: 13,
    color: Colors.neutral[600],
    lineHeight: 18,
    fontStyle: 'italic',
  },
  reviewDate: {
    fontSize: 11,
    color: Colors.neutral[400],
    marginTop: 8,
    textAlign: 'right',
  },
});
