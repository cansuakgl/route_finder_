import { db } from '@/lib/services/database';
import { getLocationSuggestions } from '@/lib/services/llm';
import { getCoordsFromText, getRouteDirections } from '@/lib/services/map';
import type { RoutePoint, RoutePointInput, TransitSegment, TransitSegmentInput, TransitType } from '@/lib/types/database';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Camera,
  LineLayer,
  MapView,
  ShapeSource,
  SymbolLayer
} from "@rnmapbox/maps";
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Transit type options component
interface TransitSelectorProps {
  selected: TransitType;
  onSelect: (type: TransitType) => void;
}

const TransitSelector: React.FC<TransitSelectorProps> = ({ selected, onSelect }) => {
const options: {
  label: string;
  type: TransitType;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { label: 'Araba', type: 'driving', icon: 'car' },
  { label: 'Bisiklet', type: 'cycling', icon: 'bike' },
  { label: 'Yürüyüş', type: 'walking', icon: 'walk' },
];

  return (
    <View style={transitStyles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.type}
          onPress={() => onSelect(option.type)}
          style={[
            transitStyles.button,
            selected === option.type && transitStyles.buttonSelected,
          ]}
        >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons
            name={option.icon}
            size={18}
            color={selected === option.type ? '#fff' : '#374151'}
          />
          <Text
            style={[
              transitStyles.text,
              selected === option.type && transitStyles.textSelected,
            ]}
          >
            {option.label}
          </Text>
        </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Route point card component
interface RoutePointCardProps {
  point: RoutePoint;
  index: number;
  onRemove?: () => void;
  drag: () => void;
  isActive: boolean;
}

const RoutePointCard: React.FC<RoutePointCardProps> = ({
  point,
  index,
  onRemove,
  drag,
  isActive,
}) => {
  return (
    <ScaleDecorator>
      <TouchableOpacity
        activeOpacity={1}
        onLongPress={drag}
        disabled={isActive}
        style={[styles.listItem, isActive && styles.listItemActive]}
      >
        <View style={styles.dragHandle}>
          <Text style={styles.dragHandleText}>☰</Text>
        </View>

        <View style={styles.iconBox}>
          <Text style={styles.icon}>{index + 1}</Text>
        </View>

        <View style={styles.textArea}>
          <Text style={styles.itemTitle}>{point.name}</Text>
          {point.address && <Text style={styles.itemDistance}>📍 {point.address}</Text>}
        </View>

        <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
          <Text style={styles.removeButtonText}>—</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </ScaleDecorator>
  );
};

export default function RouteEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cameraRef = useRef(null);

  // Parse incoming route data
  const routeId = params.routeId as string | undefined;
  const initialRouteName = params.routeName as string | undefined;
  const isNewRoute = params.isNewRoute === 'true';
  const incomingPoints = params.points ? JSON.parse(params.points as string) as RoutePoint[] : [];
  const incomingSegments = params.segments ? JSON.parse(params.segments as string) as TransitSegment[] : [];

  // State management
  const [routeNameState, setRouteNameState] = useState(initialRouteName || 'Yeni Rota');
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>(incomingPoints);
  const [transitSegments, setTransitSegments] = useState<TransitSegment[]>(incomingSegments);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [routeLineGeoJSON, setRouteLineGeoJSON] = useState<any>(null);

  // Filter route points to only those with valid coordinates
  const validRoutePoints = useMemo(() => {
    return routePoints.filter(
      (point) => point.latitude !== null && point.longitude !== null
    );
  }, [routePoints]);

  // Fetch route lines between consecutive points
  useEffect(() => {
    const fetchRouteLines = async () => {
      console.log('fetchRouteLines called, validRoutePoints:', validRoutePoints.length);
      
      if (validRoutePoints.length < 2) {
        setRouteLineGeoJSON(null);
        return;
      }

      const allCoordinates: [number, number][] = [];
      const segmentUpdates: { index: number; duration_minutes: number; distance_km: number }[] = [];

      for (let i = 0; i < validRoutePoints.length - 1; i++) {
        const fromPoint = validRoutePoints[i];
        const toPoint = validRoutePoints[i + 1];

        // Get the transit type for this segment
        const segment = transitSegments[i];
        const transitType = segment?.transit_type || 'driving';
        const profile = transitType === 'public_transport' ? 'driving' : transitType;

        console.log(`Fetching route from ${fromPoint.name} to ${toPoint.name}, profile: ${profile}`);

        try {
          const route = await getRouteDirections(
            [fromPoint.longitude!, fromPoint.latitude!],
            [toPoint.longitude!, toPoint.latitude!],
            profile as 'driving' | 'walking' | 'cycling'
          );

          console.log('Route result:', route ? 'found' : 'null', route?.geometry?.coordinates?.length || 0, 'coords', 'duration:', route?.duration_minutes, 'min');

          if (route?.geometry?.coordinates) {
            allCoordinates.push(...route.geometry.coordinates);
            // Store duration and distance from Mapbox
            segmentUpdates.push({
              index: i,
              duration_minutes: route.duration_minutes,
              distance_km: route.distance_km,
            });
          } else {
            // Fallback: draw straight line if no route found
            console.log('Using fallback straight line');
            allCoordinates.push(
              [fromPoint.longitude!, fromPoint.latitude!],
              [toPoint.longitude!, toPoint.latitude!]
            );
          }
        } catch (error) {
          console.error('Error fetching route directions:', error);
          // Fallback: draw straight line
          allCoordinates.push(
            [fromPoint.longitude!, fromPoint.latitude!],
            [toPoint.longitude!, toPoint.latitude!]
          );
        }
      }

      // Update segment durations from Mapbox data
      if (segmentUpdates.length > 0) {
        setTransitSegments(prevSegments => {
          const newSegments = [...prevSegments];
          for (const update of segmentUpdates) {
            if (newSegments[update.index]) {
              newSegments[update.index] = {
                ...newSegments[update.index],
                duration_minutes: update.duration_minutes,
                distance_km: update.distance_km,
              };
            }
          }
          return newSegments;
        });
      }

      console.log('Total coordinates for route line:', allCoordinates.length);

      // Ensure we have at least a simple line when there are 2+ points
      if (allCoordinates.length === 0 && validRoutePoints.length >= 2) {
        const fp = validRoutePoints[0];
        const tp = validRoutePoints[1];
        console.warn('No route geometry returned; using fallback straight line between first two points');
        allCoordinates.push([fp.longitude!, fp.latitude!], [tp.longitude!, tp.latitude!]);
      }

      if (allCoordinates.length > 0) {
        const feature = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: allCoordinates,
          },
        };
        const featureCollection = {
          type: 'FeatureCollection',
          features: [feature],
        };
        console.log('Setting routeLineGeoJSON:', JSON.stringify(featureCollection).substring(0, 200));
        setRouteLineGeoJSON(featureCollection);
      } else {
        console.warn('routeLineGeoJSON NOT set: insufficient coordinates');
      }
    };

    fetchRouteLines();
  }, [validRoutePoints, transitSegments]);

  // Fit camera to the route line bounds to ensure visibility
  useEffect(() => {
    try {
      const fc = routeLineGeoJSON;
      const coords: [number, number][] = fc?.features?.[0]?.geometry?.coordinates || [];
      if (!cameraRef.current || !coords || coords.length < 2) return;
      const lons = coords.map((c) => c[0]);
      const lats = coords.map((c) => c[1]);
      const sw: [number, number] = [Math.min(...lons), Math.min(...lats)];
      const ne: [number, number] = [Math.max(...lons), Math.max(...lats)];
      // padding: left/right/top/bottom in pixels; duration ms
      // @ts-ignore: Camera ref typing
      cameraRef.current.fitBounds(sw, ne, 40, 600);
      console.log('Camera fitBounds to route:', sw, ne);
    } catch (e) {
      console.warn('Camera fitBounds failed:', e);
    }
  }, [routeLineGeoJSON]);

  // Calculate total duration from segments
  const totalDuration = transitSegments.reduce(
    (sum, seg) => sum + (seg.duration_minutes || 0),
    0
  );

  const formatDuration = (totalMinutes: number) => {
    if (totalMinutes === 0) return '0 dk.';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours} sa. ${minutes} dk.` : `${minutes} dk.`;
  };

  // AI search for new points
  const onSearch = async () => {
    if (searchText.trim().length === 0) return;
    
    setIsSearching(true);
    try {
      const places = await getLocationSuggestions(searchText);

      const newPoints: RoutePoint[] = [];
      const startPosition = routePoints.length;
      
      for (let idx = 0; idx < places.length; idx++) {
        const item = places[idx];
        const coords = await getCoordsFromText(item.name);
        newPoints.push({
          id: `llm-${Math.random().toString(36).substr(2, 9)}`,
          route_id: routeId || '',
          position: startPosition + idx,
          name: item.name,
          address: item.address || null,
          latitude: coords?.[1] || null,
          longitude: coords?.[0] || null,
          tags: null,
          created_at: new Date().toISOString(),
        });
      }

      // Append new points to existing
      const allPoints = [...routePoints, ...newPoints];
      setRoutePoints(allPoints);

      // Create transit segments for new connections
      const newSegments: TransitSegment[] = [...transitSegments];
      for (let i = routePoints.length > 0 ? routePoints.length - 1 : 0; i < allPoints.length - 1; i++) {
        // Skip if this segment already exists
        if (i < routePoints.length - 1) continue;
        
        newSegments.push({
          id: `seg-${Date.now()}-${i}`,
          route_id: routeId || '',
          from_point_id: allPoints[i].id,
          to_point_id: allPoints[i + 1].id,
          transit_type: 'driving',
          distance_km: null,
          duration_minutes: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      setTransitSegments(newSegments);
      
      setSearchText('');
      setHasChanges(true);
    } catch (error) {
      Alert.alert('Hata', 'Arama yapılamadı.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle drag end - reorder points
  const handleDragEnd = useCallback(({ data }: { data: RoutePoint[] }) => {
    // Update positions
    const updatedPoints = data.map((point, idx) => ({
      ...point,
      position: idx,
    }));
    setRoutePoints(updatedPoints);
    updateTransitSegmentsAfterReorder(updatedPoints);
    setHasChanges(true);
  }, [transitSegments]);

  // Remove a route point
  const removePoint = (index: number) => {
    const newPoints = routePoints.filter((_, idx) => idx !== index);
    
    // Update positions
    newPoints.forEach((point, idx) => {
      point.position = idx;
    });

    setRoutePoints(newPoints);
    updateTransitSegmentsAfterReorder(newPoints);
    setHasChanges(true);
  };

  // Update transit segments after reordering points
  const updateTransitSegmentsAfterReorder = (newPoints: RoutePoint[]) => {
    const newSegments: TransitSegment[] = [];
    
    for (let i = 0; i < newPoints.length - 1; i++) {
      const fromPoint = newPoints[i];
      const toPoint = newPoints[i + 1];
      
      // Find existing segment between these points
      const existingSegment = transitSegments.find(
        seg => 
          (seg.from_point_id === fromPoint.id && seg.to_point_id === toPoint.id) ||
          (seg.from_point_id === toPoint.id && seg.to_point_id === fromPoint.id)
      );

      newSegments.push({
        id: existingSegment?.id || `temp-${i}`,
        route_id: routeId || '',
        from_point_id: fromPoint.id,
        to_point_id: toPoint.id,
        transit_type: existingSegment?.transit_type || 'driving',
        distance_km: existingSegment?.distance_km || null,
        duration_minutes: existingSegment?.duration_minutes || null,
        notes: existingSegment?.notes || null,
        created_at: existingSegment?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    setTransitSegments(newSegments);
  };

  // Update transit type for a segment
  const updateTransitType = (segmentIndex: number, transitType: TransitType) => {
    const newSegments = [...transitSegments];
    newSegments[segmentIndex] = {
      ...newSegments[segmentIndex],
      transit_type: transitType,
      updated_at: new Date().toISOString(),
    };
    setTransitSegments(newSegments);
    setHasChanges(true);
  };

  // Get transit type label
  const getTransitLabel = (type: TransitType): string => {
    const labels: Record<TransitType, string> = {
      driving: 'Araba',
      cycling: 'Bisiklet',
      walking: 'Yürüyüş',
      public_transport: 'Toplu Taşıma',
    };
    return labels[type];
  };

  // Save route and navigate to explore
  const handleSave = async () => {
    if (routePoints.length === 0) {
      Alert.alert('Uyarı', 'En az bir durak eklemelisiniz.');
      return;
    }

    if (!routeNameState.trim()) {
      Alert.alert('Uyarı', 'Rota adı girmelisiniz.');
      return;
    }

    setIsLoading(true);
    try {
      // Convert RoutePoints to RoutePointInput format
      const routePointInputs: RoutePointInput[] = routePoints.map(point => ({
        name: point.name,
        address: point.address,
        latitude: point.latitude,
        longitude: point.longitude,
        tags: point.tags,
      }));

      // Convert TransitSegments to TransitSegmentInput format
      const transitSegmentInputs: TransitSegmentInput[] = transitSegments.map((seg, idx) => ({
        from_position: idx,
        to_position: idx + 1,
        transit_type: seg.transit_type,
        distance_km: seg.distance_km,
        duration_minutes: seg.duration_minutes,
        notes: seg.notes,
      }));

      if (isNewRoute || !routeId) {
        // Create new route
        await db.routes.createRoute({
          name: routeNameState,
          routeDescription: null,
          sessionDescription: null,
          constraints: null,
          routePoints: routePointInputs,
          transitSegments: transitSegmentInputs,
        });
      } else {
        // Update existing route
        await db.routes.updateRoute({
          routeId: routeId,
          name: routeNameState,
          routeDescription: null,
          sessionDescription: null,
          constraints: null,
          routePoints: routePointInputs,
          transitSegments: transitSegmentInputs,
        });
      }
      
      Alert.alert('Başarılı', 'Rota kaydedildi!', [
        {
          text: 'Tamam',
          onPress: () => router.push('/(tabs)/explore'),
        },
      ]);
    } catch (error: any) {
      console.error('Error saving route:', error);
      Alert.alert('Hata', error.message || 'Rota kaydedilemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
 <GestureHandlerRootView style={styles.container}>
  <View style={styles.mapContainer}>
    <MapView style={{ flex: 1 }}>
      <Camera
        ref={cameraRef}
        zoomLevel={validRoutePoints.length > 0 ? 15 : 11}
        centerCoordinate={
          validRoutePoints[0]?.latitude && validRoutePoints[0]?.longitude
            ? [validRoutePoints[0].longitude, validRoutePoints[0].latitude]
            : [28.9784, 41.0082]
        }
      />

      {/* POI points (MUST be a style layer, not PointAnnotation) */}
      {validRoutePoints.length > 0 && (
        <ShapeSource
          id="pointsSource"
          shape={{
            type: "FeatureCollection",
            features: validRoutePoints.map((p, index) => ({
              type: "Feature",
              properties: {
                label: String(index + 1),
              },
              geometry: {
                type: "Point",
                coordinates: [p.longitude!, p.latitude!],
              },
            })),
          }}
        >
          <SymbolLayer
            id="pointLayerId"
            style={{
              iconImage: "marker-15",
              iconSize: 1.2,
              textField: ["get", "label"],
              textSize: 12,
              textOffset: [0, -1.2],
              textColor: "#ffffff",
              textHaloColor: "#000000",
              textHaloWidth: 1,
            }}
          />
        </ShapeSource>
      )}

      {/* Route line (explicitly BELOW points) */}
      {routeLineGeoJSON && (
        <ShapeSource id="routeSource" shape={routeLineGeoJSON}>
          <LineLayer
            id="routeLine"
            belowLayerID="pointLayerId"
            style={{
              lineColor: "#ff2d55",
              lineWidth: 7,
              lineOpacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        </ShapeSource>
      )}
    </MapView>

    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
      <Text style={styles.backIcon}>←</Text>
    </TouchableOpacity>
  </View>

      {/* Info Bar - Route Name & Duration */}
      <View style={styles.infoBar}>
        <View style={styles.routeTitleContainer}>
          <TextInput
            style={styles.routeTitleInput}
            value={routeNameState}
            onChangeText={(text) => {
              setRouteNameState(text);
              setHasChanges(true);
            }}
            placeholder="Rota adı..."
            placeholderTextColor="#999"
          />
          <Text style={styles.pointCount}>{validRoutePoints.length} / {routePoints.length} Durak</Text>
        </View>
        
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>⏱️ {formatDuration(totalDuration)}</Text>
        </View>
      </View>

      {/* AI Search Box */}
      <View style={styles.searchBox}>
        {isSearching ? (
          <View style={styles.searchIconButton}>
            <ActivityIndicator size="small" color="#6a5acd" />
          </View>
        ) : (
          <TouchableOpacity style={styles.searchIconButton} onPress={onSearch}>
            <Text style={styles.searchIconText}>🔍</Text>
          </TouchableOpacity>
        )}
        <TextInput
          placeholder="Durak eklemek için arama yapın..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={onSearch}
          style={styles.searchInput}
          editable={!isSearching}
          placeholderTextColor="#999"
        />
      </View>

      {/* Route Points List with Draggable Reorder */}
      {routePoints.length === 0 ? (
        <View style={[styles.scrollContainer, styles.emptyContainer]}>
          <Text style={styles.emptyText}>📍 Henüz durak eklenmedi</Text>
          <Text style={styles.emptySubtext}>Arama yaparak durak ekleyebilirsiniz</Text>
        </View>
      ) : (
        <DraggableFlatList
          data={routePoints}
          keyExtractor={(item) => item.id}
          onDragEnd={handleDragEnd}
          containerStyle={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, getIndex, drag, isActive }: RenderItemParams<RoutePoint>) => {
            const index = getIndex() ?? 0;
            return (
              <View>
                <RoutePointCard
                  point={item}
                  index={index}
                  onRemove={() => removePoint(index)}
                  drag={drag}
                  isActive={isActive}
                />

                {/* Transit selector between points */}
                {index < routePoints.length - 1 && transitSegments[index] && (
                  <TransitSelector
                    selected={transitSegments[index].transit_type}
                    onSelect={(type) => updateTransitType(index, type)}
                  />
                )}
              </View>
            );
          }}
        />
      )}

      {/* Bottom Action Button */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveText}>Rotayı Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}


const transitStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    marginTop: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonSelected: {
    backgroundColor: '#6a5acd',
    borderColor: '#6a5acd',
  },
  text: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600',
  },
  textSelected: {
    color: '#fff',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  mapContainer: {
    height: SCREEN_HEIGHT * 0.35,
    backgroundColor: '#e8e8e8',
    position: 'relative',
  },
  markerContainer: {
    width: 28,
    height: 28,
    backgroundColor: '#6a5acd',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  routeTitleContainer: {
    flex: 1,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  routeTitleInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    padding: 0,
    marginBottom: 2,
  },
  pointCount: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  durationBadge: {
    backgroundColor: '#F0EFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6a5acd',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIconButton: {
    marginRight: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0EFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIconText: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6a5acd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  textArea: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: '600',
    fontSize: 15,
    color: '#1A1A1A',
  },
  itemDistance: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  dragHandle: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  dragHandleText: {
    fontSize: 18,
    color: '#999',
  },
  listItemActive: {
    backgroundColor: '#F0EFFF',
    elevation: 8,
    shadowOpacity: 0.15,
  },
  removeButton: {
    width: 32,
    height: 32,
    backgroundColor: '#ff6347',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 10,
  },
  saveButton: {
    backgroundColor: '#6a5acd',
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 3,
  },
  saveButtonDisabled: {
    backgroundColor: '#9E9E9E',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
