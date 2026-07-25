import React, { useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useReports } from '@/context/ReportsContext';
import { scoreToColor, scoreToLabel, formatTimestamp } from '@/lib/scoring';
import { CATEGORIES, Report } from '@/lib/types';
import NativeMap from '@/components/NativeMap';

function ScoreBadge({ score }: { score: number }) {
  const color = scoreToColor(score);
  const label = scoreToLabel(score);
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: color + '1a' }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

function ReportCard({
  report,
  colors,
  onClose,
  onVote,
}: {
  report: Report;
  colors: ReturnType<typeof useColors>;
  onClose: () => void;
  onVote: (vote: 'up' | 'down') => void;
}) {
  const cat = CATEGORIES.find((c) => c.value === report.category);
  return (
    <View
      style={[
        styles.reportCard,
        {
          backgroundColor: colors.background,
          shadowColor: colors.nmDark,
        },
      ]}
    >
      <View style={styles.cardRow}>
        <View style={styles.cardLeft}>
          <View style={[styles.catIcon, { backgroundColor: colors.primary + '22' }]}>
            <Ionicons
              name={(cat?.icon as any) || 'alert-circle'}
              size={18}
              color={colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.catLabel, { color: colors.foreground }]}>
              {cat?.label ?? report.category}
            </Text>
            <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
              {formatTimestamp(report.timestamp)} · {report.radiusMeters}m radius
            </Text>
          </View>
        </View>
        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={20} color={colors.mutedForeground} />
        </Pressable>
      </View>

      {report.description ? (
        <Text style={[styles.cardDesc, { color: colors.foreground }]} numberOfLines={2}>
          {report.description}
        </Text>
      ) : null}

      <View style={styles.cardFooter}>
        <ScoreBadge score={report.score} />
        <View style={styles.voteRow}>
          <TouchableOpacity
            style={[styles.voteBtn, { backgroundColor: colors.secondary }]}
            onPress={() => onVote('up')}
          >
            <Ionicons name="thumbs-up" size={14} color={colors.primary} />
            <Text style={[styles.voteCount, { color: colors.mutedForeground }]}>
              {report.up}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.voteBtn, { backgroundColor: colors.secondary }]}
            onPress={() => onVote('down')}
          >
            <Ionicons name="thumbs-down" size={14} color={colors.destructive} />
            <Text style={[styles.voteCount, { color: colors.mutedForeground }]}>
              {report.down}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function MapScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { reports, voteReport } = useReports();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const selectedReport = reports.find((r) => r.id === selectedId) ?? null;

  const selectReport = (id: string | null) => {
    if (id) {
      setSelectedId(id);
      Animated.spring(fadeAnim, { toValue: 1, useNativeDriver: true, tension: 80 }).start();
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() =>
        setSelectedId(null),
      );
    }
  };

  const webTopPad = Platform.OS === 'web' ? 67 : insets.top;
  const webBottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <View style={styles.container}>
      <NativeMap
        reports={reports}
        onMarkerPress={(id) => selectReport(id)}
        onMapPress={() => selectReport(null)}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: webTopPad + 12 }]}>
        <View
          style={[
            styles.headerPill,
            { backgroundColor: colors.background, shadowColor: colors.nmDark },
          ]}
        >
          <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
            <Ionicons name="shield-checkmark" size={14} color="#fff" />
          </View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>GroundCheck</Text>
          <View style={styles.headerCount}>
            <Text style={[styles.headerCountText, { color: colors.mutedForeground }]}>
              {reports.filter((r) => !r.flagged).length} reports
            </Text>
          </View>
        </View>
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            bottom: 84 + 20 + webBottomPad,
            shadowColor: colors.primary,
          },
        ]}
        onPress={() => router.push('/file')}
        activeOpacity={0.82}
        testID="fab-file-report"
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Report detail card */}
      {selectedReport && (
        <Animated.View
          style={[
            styles.cardContainer,
            {
              bottom: 84 + 12 + webBottomPad,
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ReportCard
            report={selectedReport}
            colors={colors}
            onClose={() => selectReport(null)}
            onVote={(vote) => voteReport(selectedReport.id, vote)}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 6,
  },
  logoMark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  headerCount: { marginLeft: 4 },
  headerCountText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 4, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  cardContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  reportCard: {
    borderRadius: 20,
    padding: 16,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
    elevation: 8,
    gap: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  cardMeta: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  cardDesc: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, fontFamily: 'Inter_700Bold' },
  voteRow: { flexDirection: 'row', gap: 6 },
  voteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  voteCount: { fontSize: 12, fontFamily: 'Inter_500Medium' },
});
