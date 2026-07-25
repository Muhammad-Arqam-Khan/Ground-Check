/**
 * Web fallback — react-native-maps cannot run in a browser.
 * Shows a styled placeholder with report count and a prompt to use the mobile app.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Report } from '@/lib/types';
import { scoreToColor } from '@/lib/scoring';

export interface NativeMapProps {
  reports: Report[];
  onMarkerPress: (id: string) => void;
  onMapPress: () => void;
}

export default function NativeMap({ reports, onMarkerPress }: NativeMapProps) {
  const activeReports = reports.filter((r) => !r.flagged);

  return (
    <View style={styles.container}>
      {/* Grid background */}
      <View style={styles.grid} />

      {/* Fake marker dots for visual interest */}
      {activeReports.slice(0, 6).map((r, i) => {
        const color = scoreToColor(r.score);
        const positions = [
          { top: '25%', left: '30%' },
          { top: '55%', left: '60%' },
          { top: '40%', left: '70%' },
          { top: '65%', left: '25%' },
          { top: '30%', left: '55%' },
          { top: '50%', left: '42%' },
        ] as const;
        const pos = positions[i % positions.length];
        return (
          <View
            key={r.id}
            style={[styles.dot, { backgroundColor: color, top: pos.top, left: pos.left }]}
            onTouchEnd={() => onMarkerPress(r.id)}
          />
        );
      })}

      {/* Center card */}
      <View style={styles.card}>
        <Ionicons name="map-outline" size={36} color="#7b9ccc" style={{ marginBottom: 8 }} />
        <Text style={styles.title}>Interactive Map</Text>
        <Text style={styles.body}>
          Scan the QR code with{'\n'}Expo Go to see the live map.
        </Text>
        <View style={styles.countRow}>
          <Ionicons name="location" size={14} color="#7b9ccc" />
          <Text style={styles.countText}>
            {activeReports.length} active report{activeReports.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#d4dae6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  } as any,
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
  } as any,
  dot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  } as any,
  card: {
    backgroundColor: '#e0e5ec',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#b8c0cc',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 8,
    maxWidth: 260,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#3c4a5c',
    marginBottom: 6,
    fontFamily: 'Inter_600SemiBold',
  },
  body: {
    fontSize: 13,
    color: '#7a8ca0',
    textAlign: 'center',
    lineHeight: 19,
    fontFamily: 'Inter_400Regular',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 14,
    backgroundColor: 'rgba(123,156,204,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  countText: {
    fontSize: 12,
    color: '#7b9ccc',
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
});
