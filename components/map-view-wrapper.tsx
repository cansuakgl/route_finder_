// Map wrapper component that handles Mapbox availability
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

interface MapViewProps {
  style?: any;
  children?: React.ReactNode;
}

let Mapbox: any = null;
let isMapboxAvailable = false;

// Try to import Mapbox - will work in dev builds, fail in Expo Go
try {
  Mapbox = require('@rnmapbox/maps').default;
  const ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';
  if (Mapbox && ACCESS_TOKEN) {
    Mapbox.setAccessToken(ACCESS_TOKEN);
    isMapboxAvailable = true;
  }
} catch (e) {
  console.log('Mapbox not available - using placeholder');
}

export const MapView: React.FC<MapViewProps> = ({ style, children }) => {
  if (isMapboxAvailable && Mapbox) {
    return (
      <Mapbox.MapView style={style} logoEnabled={false} attributionEnabled={false}>
        {children}
      </Mapbox.MapView>
    );
  }
  return (
    <View style={[styles.placeholder, style]}>
      <Text style={styles.placeholderText}>🗺️</Text>
      <Text style={styles.placeholderSubtext}>
        {Platform.OS === 'android' ? 'Map (Expo Go)' : 'Map Preview'}
      </Text>
    </View>
  );
};

interface CameraProps {
  ref?: any;
  zoomLevel?: number;
  centerCoordinate?: [number, number];
  children?: React.ReactNode;
}

export const Camera: React.FC<CameraProps> = ({ ref, zoomLevel, centerCoordinate, children }) => {
  if (isMapboxAvailable && Mapbox) {
    return (
      <Mapbox.Camera ref={ref} zoomLevel={zoomLevel} centerCoordinate={centerCoordinate}>
        {children}
      </Mapbox.Camera>
    );
  }
  return null;
};

interface ShapeSourceProps {
  id: string;
  shape: any;
  children?: React.ReactNode;
}

export const ShapeSource: React.FC<ShapeSourceProps> = ({ id, shape, children }) => {
  if (isMapboxAvailable && Mapbox) {
    return (
      <Mapbox.ShapeSource id={id} shape={shape}>
        {children}
      </Mapbox.ShapeSource>
    );
  }
  return null;
};

interface LineLayerProps {
  id: string;
  style?: any;
}

export const LineLayer: React.FC<LineLayerProps> = ({ id, style }) => {
  if (isMapboxAvailable && Mapbox) {
    return <Mapbox.LineLayer id={id} style={style} />;
  }
  return null;
};

interface PointAnnotationProps {
  id: string;
  coordinate: [number, number];
  children?: React.ReactNode;
}

export const PointAnnotation: React.FC<PointAnnotationProps> = ({ id, coordinate, children }) => {
  if (isMapboxAvailable && Mapbox) {
    return (
      <Mapbox.PointAnnotation id={id} coordinate={coordinate}>
        {children}
      </Mapbox.PointAnnotation>
    );
  }
  return null;
};

export { isMapboxAvailable };

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#666',
  },
});
