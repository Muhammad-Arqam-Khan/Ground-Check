import React from 'react';
import {
  FlatList,
  Platform,
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

function ReportRow({ report, colors }: { report: Report; colors: ReturnType<typeof useColors> }) {
  const cat = CATEGORIES.find((c) => c.value === report.category);
  const scoreColor = scoreToColor(report.score);

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: colors.background,
          borderRadius: colors.radius,
          shadowColor: colors.nmDark,
        },
      ]}
    >
      {/* Score stripe */}
      <View style={[styles.scoreStripe, { backgroundColor: scoreColor }]} />

      <View style={[styles.catIconWrap, { backgroundColor: colors.primary + '18' }]}>
        <Ionicons
          name={(cat?.icon ?? 'alert-circle') as any}
          size={20}
          color={colors.primary}
        />
      </View>

      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={[styles.catText, { color: colors.foreground }]}>
            {cat?.label ?? report.category}
          </Text>
          <View style={[styles.scorePill, { borderColor: scoreColor, backgroundColor: scoreColor + '18' }]}>
            <Text style={[styles.scorePillText, { color: scoreColor }]}>{report.score}</Text>
          </View>
        </View>

        {report.description ? (
          <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={1}>
            {report.description}
          </Text>
        ) : null}

        <View style={styles.rowMeta}>
          <Ionicons name="location-outline" size={11} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {report.lat.toFixed(4)}, {report.lon.toFixed(4)}
          </Text>
          <Text style={[styles.metaDot, { color: colors.mutedForeground }]}>·</Text>
          <Ionicons name="radio-button-on-outline" size={11} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {report.radiusMeters}m
          </Text>
          <Text style={[styles.metaDot, { color: colors.mutedForeground }]}>·</Text>
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {formatTimestamp(report.timestamp)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function EmptyState({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
        <Ionicons name="document-text-outline" size={32} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No reports yet</Text>
      <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
        Be the first to flag an issue in your area.
      </Text>
      <TouchableOpacity
        style={[styles.emptyBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
        onPress={() => router.push('/file')}
        activeOpacity={0.82}
      >
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.emptyBtnText}>File a Report</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { reports, loading } = useReports();

  const webTopPad = Platform.OS === 'web' ? 67 : insets.top;
  const webBottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const sorted = [...reports].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: webTopPad + 12, paddingBottom: 12, backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Reports</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.countText, { color: colors.mutedForeground }]}>
            {sorted.length}
          </Text>
        </View>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: 84 + webBottomPad + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!sorted.length}
        ListEmptyComponent={!loading ? <EmptyState colors={colors} /> : null}
        renderItem={({ item }) => <ReportRow report={item} colors={colors} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  countText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  scoreStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  catIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  rowBody: { flex: 1, gap: 3 },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  scorePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  scorePillText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  desc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  metaDot: { fontSize: 11 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});
