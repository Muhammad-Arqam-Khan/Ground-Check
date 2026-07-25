import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useReports } from '@/context/ReportsContext';
import { CATEGORIES, ReportCategory } from '@/lib/types';

const RADIUS_OPTIONS = [50, 100, 200, 500];

async function fetchLocation(): Promise<{ lat: number; lon: number }> {
  if (Platform.OS === 'web') {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => reject(err),
        { timeout: 10000 },
      );
    });
  }
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return { lat: pos.coords.latitude, lon: pos.coords.longitude };
}

export default function FileReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addReport } = useReports();
  const params = useLocalSearchParams<{ lat?: string; lon?: string }>();

  const prefillLat = params.lat ? parseFloat(params.lat) : null;
  const prefillLon = params.lon ? parseFloat(params.lon) : null;
  const hasPrefill = prefillLat !== null && !isNaN(prefillLat) && prefillLon !== null && !isNaN(prefillLon);

  const [lat, setLat] = useState<number | null>(hasPrefill ? prefillLat : null);
  const [lon, setLon] = useState<number | null>(hasPrefill ? prefillLon : null);
  const [category, setCategory] = useState<ReportCategory>('road_hazard');
  const [description, setDescription] = useState('');
  const [radius, setRadius] = useState(100);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sync pre-filled coordinates when params change (e.g. navigated from map pin)
  useEffect(() => {
    if (hasPrefill) {
      setLat(prefillLat);
      setLon(prefillLon);
    }
  }, [params.lat, params.lon]);

  const webTopPad = Platform.OS === 'web' ? 67 : insets.top;
  const webBottomPad = Platform.OS === 'web' ? 34 + 50 : insets.bottom + 0;

  const handleLocate = async () => {
    setLocating(true);
    try {
      const { lat: la, lon: lo } = await fetchLocation();
      setLat(la);
      setLon(lo);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e: any) {
      Alert.alert('Location Error', e.message ?? 'Could not get location');
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = () => {
    if (lat === null || lon === null) {
      Alert.alert(
        'Location Required',
        'Tap "Locate Me" to use GPS, or tap the map to place a pin.',
      );
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      addReport({ lat, lon, radiusMeters: radius, category, description: description.trim() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitting(false);
      setSubmitted(true);
      setLat(null);
      setLon(null);
      setDescription('');
      setCategory('road_hazard');
      setRadius(100);
      setTimeout(() => {
        setSubmitted(false);
        router.push('/');
      }, 1400);
    }, 400);
  };

  const hasLocation = lat !== null && lon !== null;

  // ── Shared style helpers ──────────────────────────────────────────
  const raised = {
    backgroundColor: colors.background,
    shadowColor: colors.nmDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.7 as number,
    shadowRadius: 10 as number,
    elevation: 5,
  } as const;

  const insetBox = {
    backgroundColor: colors.background,
    shadowColor: colors.nmDark,
    shadowOffset: { width: -3, height: -3 },
    shadowOpacity: 0.4 as number,
    shadowRadius: 6 as number,
    elevation: 0,
  } as const;

  return (
    <View style={[styles.outer, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: webTopPad + 12, paddingBottom: webBottomPad + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={[styles.title, { color: colors.foreground }]}>File a Report</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Flag infrastructure, hazards, or safety issues near you.
        </Text>

        {/* Location card */}
        <View style={[styles.card, raised, { borderRadius: colors.radius + 4 }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>LOCATION</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.locateBtn,
              raised,
              { borderRadius: colors.radius, backgroundColor: hasLocation ? colors.primary + '1a' : colors.background },
            ]}
            onPress={handleLocate}
            activeOpacity={0.8}
            disabled={locating}
            testID="locate-btn"
          >
            {locating ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons
                name={hasLocation ? 'checkmark-circle' : 'locate'}
                size={20}
                color={hasLocation ? '#22c55e' : colors.primary}
              />
            )}
            <Text
              style={[
                styles.locateBtnText,
                { color: hasLocation ? '#22c55e' : colors.foreground },
              ]}
            >
              {locating ? 'Locating…' : hasLocation ? 'Location acquired' : 'Locate Me (GPS)'}
            </Text>
          </TouchableOpacity>

          {hasLocation && (
            <View style={styles.coordRow}>
              <View style={[styles.coordChip, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.coordText, { color: colors.mutedForeground }]}>
                  {lat!.toFixed(5)}° N
                </Text>
              </View>
              <View style={[styles.coordChip, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.coordText, { color: colors.mutedForeground }]}>
                  {lon!.toFixed(5)}° E
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Category card */}
        <View style={[styles.card, raised, { borderRadius: colors.radius + 4 }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="grid" size={16} color={colors.primary} />
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>CATEGORY</Text>
          </View>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const active = category === cat.value;
              return (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.catChip,
                    {
                      borderRadius: colors.radius,
                      backgroundColor: active ? colors.primary : colors.background,
                      shadowColor: colors.nmDark,
                      shadowOffset: { width: active ? -2 : 3, height: active ? -2 : 3 },
                      shadowOpacity: 0.6,
                      shadowRadius: active ? 4 : 8,
                      elevation: active ? 2 : 4,
                    },
                  ]}
                  onPress={() => {
                    setCategory(cat.value);
                    Haptics.selectionAsync();
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={18}
                    color={active ? '#fff' : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.catChipText,
                      { color: active ? '#fff' : colors.foreground },
                    ]}
                    numberOfLines={1}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Radius card */}
        <View style={[styles.card, raised, { borderRadius: colors.radius + 4 }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="radio-button-on" size={16} color={colors.primary} />
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              COVERAGE RADIUS
            </Text>
          </View>
          <View style={styles.radiusRow}>
            {RADIUS_OPTIONS.map((r) => {
              const active = radius === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.radiusBtn,
                    {
                      borderRadius: colors.radius,
                      backgroundColor: active ? colors.primary : colors.background,
                      shadowColor: colors.nmDark,
                      shadowOffset: { width: active ? -2 : 3, height: active ? -2 : 3 },
                      shadowOpacity: 0.6,
                      shadowRadius: active ? 4 : 8,
                      elevation: active ? 2 : 4,
                      flex: 1,
                    },
                  ]}
                  onPress={() => {
                    setRadius(r);
                    Haptics.selectionAsync();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.radiusBtnText, { color: active ? '#fff' : colors.foreground }]}>
                    {r}m
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Description card */}
        <View style={[styles.card, raised, { borderRadius: colors.radius + 4 }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="create" size={16} color={colors.primary} />
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              DESCRIPTION{' '}
              <Text style={{ fontWeight: '400', textTransform: 'none' }}>(optional)</Text>
            </Text>
          </View>
          <View
            style={[
              styles.inputWrap,
              insetBox,
              { borderRadius: colors.radius, borderWidth: 0 },
            ]}
          >
            <TextInput
              style={[styles.textInput, { color: colors.foreground }]}
              placeholder="Describe the issue…"
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
              maxLength={500}
              testID="description-input"
            />
          </View>
          <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
            {description.length}/500
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            {
              borderRadius: colors.radius,
              backgroundColor: submitted ? '#22c55e' : colors.primary,
              shadowColor: submitted ? '#22c55e' : colors.primary,
              shadowOffset: { width: 4, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
              opacity: submitting ? 0.8 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={submitting || submitted}
          activeOpacity={0.82}
          testID="submit-btn"
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : submitted ? (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitText}>Report Filed!</Text>
            </>
          ) : (
            <>
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.submitText}>Submit Report</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 16 },
  title: {
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    marginBottom: 4,
  },
  card: {
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: 'Inter_700Bold',
  },
  locateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  locateBtnText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  coordRow: {
    flexDirection: 'row',
    gap: 8,
  },
  coordChip: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  coordText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    width: '47%',
  },
  catChipText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  radiusRow: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  radiusBtnText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  inputWrap: {
    padding: 12,
  },
  textInput: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    textAlign: 'right',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});
