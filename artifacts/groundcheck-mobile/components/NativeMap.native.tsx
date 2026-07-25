/**
 * Native implementation — uses react-native-maps.
 * Metro picks this file on iOS/Android.
 */
import React from 'react';
import MapView, { Circle, Marker, MapPressEvent, MarkerDragStartEndEvent } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import { Report } from '@/lib/types';
import { scoreToColor } from '@/lib/scoring';

export interface NativeMapProps {
  reports: Report[];
  onMarkerPress: (id: string) => void;
  /** Called when user taps empty map space; receives tapped coordinates */
  onMapTap: (lat: number, lon: number) => void;
  pinnedLocation?: { lat: number; lon: number } | null;
  onPinDrag?: (lat: number, lon: number) => void;
  onPinPress?: () => void;
}

const DEFAULT_REGION = {
  latitude: 30.3753,
  longitude: 69.3451,
  latitudeDelta: 12,
  longitudeDelta: 12,
};

export default function NativeMap({
  reports,
  onMarkerPress,
  onMapTap,
  pinnedLocation,
  onPinDrag,
  onPinPress,
}: NativeMapProps) {
  const activeReports = reports.filter((r) => !r.flagged);
  const initialRegion =
    activeReports.length > 0
      ? {
          latitude: activeReports[0].lat,
          longitude: activeReports[0].lon,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }
      : DEFAULT_REGION;

  const handleMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    onMapTap(latitude, longitude);
  };

  const handlePinDragEnd = (e: MarkerDragStartEndEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    onPinDrag?.(latitude, longitude);
  };

  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={initialRegion}
      onPress={handleMapPress}
    >
      {activeReports.map((report) => (
        <React.Fragment key={report.id}>
          <Circle
            center={{ latitude: report.lat, longitude: report.lon }}
            radius={report.radiusMeters}
            fillColor={scoreToColor(report.score) + '28'}
            strokeColor={scoreToColor(report.score) + 'aa'}
            strokeWidth={1.5}
          />
          <Marker
            coordinate={{ latitude: report.lat, longitude: report.lon }}
            pinColor={scoreToColor(report.score)}
            onPress={(e) => {
              e.stopPropagation?.();
              onMarkerPress(report.id);
            }}
          />
        </React.Fragment>
      ))}

      {pinnedLocation && (
        <Marker
          coordinate={{ latitude: pinnedLocation.lat, longitude: pinnedLocation.lon }}
          pinColor="#6366f1"
          draggable
          onDragEnd={handlePinDragEnd}
          onPress={(e) => {
            e.stopPropagation?.();
            onPinPress?.();
          }}
        />
      )}
    </MapView>
  );
}
