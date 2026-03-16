// Map wrapper component that handles Mapbox availability
import React from 'react';
import { Platform, Text, View } from 'react-native';

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
  if (isMapboxAvailable && Mapbox && Mapbox.MapView) {
    const MapboxMapView = Mapbox.MapView;
    return (
      <MapboxMapView
        style={style}
        logoEnabled={false}
        attributionEnabled={false}
        styleURL={'mapbox://styles/mapbox/streets-v12'}
      >
        {children}
      </MapboxMapView>
    );
  }
  return (
    <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8e8e8' }, style]}>
      <Text style={{ fontSize: 48, marginBottom: 8 }}>🗺️</Text>
      <Text style={{ fontSize: 14, color: '#666' }}>
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
  if (isMapboxAvailable && Mapbox && Mapbox.Camera) {
    const MapboxCamera = Mapbox.Camera;
    return (
      <MapboxCamera ref={ref} zoomLevel={zoomLevel} centerCoordinate={centerCoordinate}>
        {children}
      </MapboxCamera>
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
  if (isMapboxAvailable && Mapbox && Mapbox.ShapeSource) {
    const MapboxShapeSource = Mapbox.ShapeSource;
    const normalizedShape = shape?.type === 'FeatureCollection'
      ? shape
      : shape?.type === 'Feature'
        ? { type: 'FeatureCollection', features: [shape] }
        : shape;
    const fc = normalizedShape;
    const featureCount = fc?.type === 'FeatureCollection' ? fc.features?.length || 0 : 0;
    const firstFeatureType = featureCount > 0 ? fc.features[0]?.geometry?.type : undefined;
    const firstCoordsLen = featureCount > 0 && fc.features[0]?.geometry?.coordinates
      ? fc.features[0].geometry.coordinates.length
      : undefined;
    console.log('ShapeSource rendering:', id, 'type:', fc?.type, 'features:', featureCount, 'geom:', firstFeatureType, 'coordsLen:', firstCoordsLen);
    return (
      <MapboxShapeSource id={id} shape={normalizedShape}>
        {children}
      </MapboxShapeSource>
    );
  }
  console.log('ShapeSource NOT available');
  return null;
};

interface LineLayerProps {
  id: string;
  style?: any;
  belowLayerID?: string;
}

export const LineLayer: React.FC<LineLayerProps> = ({ id, style, belowLayerID }) => {
  if (isMapboxAvailable && Mapbox && Mapbox.LineLayer) {
    const MapboxLineLayer = Mapbox.LineLayer;
    console.log('LineLayer rendering:', id, 'with style:', JSON.stringify(style));
    return <MapboxLineLayer id={id} style={style} belowLayerID={belowLayerID} />;
  }
  console.log('LineLayer NOT available');
  return null;
};

interface CircleLayerProps {
  id: string;
  style?: any;
}

export const CircleLayer: React.FC<CircleLayerProps> = ({ id, style }) => {
  if (isMapboxAvailable && Mapbox && Mapbox.CircleLayer) {
    const MapboxCircleLayer = Mapbox.CircleLayer;
    return <MapboxCircleLayer id={id} style={style} />;
  }
  return null;
};

interface SymbolLayerProps {
  id: string;
  style?: any;
}

export const SymbolLayer: React.FC<SymbolLayerProps> = ({ id, style }) => {
  if (isMapboxAvailable && Mapbox && Mapbox.SymbolLayer) {
    const MapboxSymbolLayer = Mapbox.SymbolLayer;
    return <MapboxSymbolLayer id={id} style={style} />;
  }
  return null;
};

interface PointAnnotationProps {
  id: string;
  coordinate: [number, number];
  children?: React.ReactNode;
}

export const PointAnnotation: React.FC<PointAnnotationProps> = ({ id, coordinate, children }) => {
  if (isMapboxAvailable && Mapbox && Mapbox.MarkerView) {
    // Use MarkerView instead of PointAnnotation for better Android support
    const MapboxMarkerView = Mapbox.MarkerView;
    return (
      <MapboxMarkerView id={id} coordinate={coordinate}>
        {children}
      </MapboxMarkerView>
    );
  }
  if (isMapboxAvailable && Mapbox && Mapbox.PointAnnotation) {
    const MapboxPointAnnotation = Mapbox.PointAnnotation;
    return (
      <MapboxPointAnnotation id={id} coordinate={coordinate}>
        {children}
      </MapboxPointAnnotation>
    );
  }
  return null;
};

export { isMapboxAvailable };

