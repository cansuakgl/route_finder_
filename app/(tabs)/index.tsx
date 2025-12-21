import { Camera, MapView } from '@/components/map-view-wrapper';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/services/database';
import { getLocationSuggestions } from '@/lib/services/llm';
import { getCoordsFromText } from '@/lib/services/map';
import type { Route, RoutePoint, TransitSegment } from '@/lib/types/database';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const cameraRef = useRef(null);

  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteRoutes, setFavoriteRoutes] = useState<Route[]>([]);
  const [favoriteTogglingId, setFavoriteTogglingId] = useState<string | null>(null);

  useEffect(() => {
    loadFavoriteRoutes();
  }, [user]);

  // Refetch favorites when tab is focused
  useFocusEffect(
    useCallback(() => {
      loadFavoriteRoutes();
    }, [])
  );

  async function loadFavoriteRoutes() {
    try {
      const favorites = await db.routes.getFavoriteRoutes();
      setFavoriteRoutes(favorites);
    } catch (err) {
      console.error('Error loading favorite routes:', err);
    }
  }

  async function toggleFavorite(routeId: string, currentFavorite: boolean) {
    try {
      setFavoriteTogglingId(routeId);
      await db.routes.toggleRouteFavorite(routeId, !currentFavorite);
      
      // Reload favorites
      await loadFavoriteRoutes();
    } catch (err) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Hata', 'Favori durumu değiştirilirken bir hata oluştu');
    } finally {
      setFavoriteTogglingId(null);
    }
  }

  const onSearch = async () => {
    if (searchText.trim().length === 0) return;
    
    setIsLoading(true);
    try {
      const places = await getLocationSuggestions(searchText);

      const routePoints: RoutePoint[] = [];
      for (let idx = 0; idx < places.length; idx++) {
        const item = places[idx];
        const coords = await getCoordsFromText(item.name);
        routePoints.push({
          id: `llm-${Math.random().toString(36).substr(2, 9)}`,
          route_id: '',
          position: idx,
          name: item.name,
          address: item.address || null,
          latitude: coords?.[1] || null,
          longitude: coords?.[0] || null,
          tags: null,
          created_at: new Date().toISOString(),
        });
      }

      // Create transit segments
      const segments: TransitSegment[] = [];
      for (let i = 0; i < routePoints.length - 1; i++) {
        segments.push({
          id: `seg-${i}`,
          route_id: '',
          from_point_id: routePoints[i].id,
          to_point_id: routePoints[i + 1].id,
          transit_type: 'driving',
          distance_km: null,
          duration_minutes: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      // Navigate to route-edit with the new data
      // @ts-ignore
      router.push({
        pathname: '/route/route-edit',
        params: {
          routeName: searchText,
          points: JSON.stringify(routePoints),
          segments: JSON.stringify(segments),
          isNewRoute: 'true',
        },
      });
    } catch (error) {
      Alert.alert('Hata', 'Arama yapılamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map Area */}
      <View style={styles.mapArea}>
        <MapView style={styles.mapbox}>
          <Camera ref={cameraRef} zoomLevel={11} centerCoordinate={[28.9784, 41.0082]} />
        </MapView>
      </View>

      {/* Search Box */}
      <View style={styles.searchBox}>
        <TouchableOpacity 
          style={styles.plusButton}
          onPress={() => {
            // Navigate to route-edit with empty data for a fresh start
            // @ts-ignore
            router.push({
              pathname: '/route/route-edit',
              params: {
                routeName: 'Yeni Rota',
                points: JSON.stringify([]),
                segments: JSON.stringify([]),
                isNewRoute: 'true',
              },
            });
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#6a5acd" />
          ) : (
            <Text style={styles.plusText}>＋</Text>
          )}
        </TouchableOpacity>
        <TextInput
          placeholder="Nereye gitmek istersin?"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={onSearch}
          style={styles.searchInput}
          editable={!isLoading}
        />
      </View>

      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>💜 Favori Rotalarım</Text>
      </View>

      {/* Route List */}
      <FlatList
        data={favoriteRoutes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 150 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>❤️ Henüz favori rota yok</Text>
            <Text style={styles.emptySubtext}>Rotalar sayfasından favori ekleyebilirsiniz</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: '/route/route-map',
                params: {
                  routeId: item.id,
                  routeTitle: item.name,
                },
              });
            }}
          >
            <View style={styles.favoriteCard}>
              <View style={styles.favoriteCardHeader}>
                <View style={styles.favoriteIconBox}>
                  <Text style={styles.favoriteIcon}>📍</Text>
                </View>
                <View style={styles.favoriteTextBox}>
                  <Text style={styles.favoriteTitle}>{item.name}</Text>
                  <Text style={styles.favoriteSub}>
                    {item.route_description || 'Favori rota.'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.heartButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id, item.is_favorite);
                  }}
                  disabled={favoriteTogglingId === item.id}
                >
                  {favoriteTogglingId === item.id ? (
                    <ActivityIndicator size="small" color="#ff69b4" />
                  ) : (
                    <Text style={styles.heartIconSmall}>❤️</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  mapArea: {
    height: 250,
    backgroundColor: '#d9d9d9',
  },
  mapbox: {
    flex: 1,
  },
  markerContainer: {
    width: 24,
    height: 24,
    backgroundColor: '#6a5acd',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: -25,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    elevation: 5,
    zIndex: 10,
  },
  plusButton: {
    marginRight: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    fontSize: 20,
  },
  searchInput: {
    flex: 1,
    height: 45,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  favoriteCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  favoriteCardHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  favoriteTextBox: {
    flex: 1,
  },
  favoriteTitle: {
    fontWeight: '700',
    fontSize: 15,
  },
  favoriteSub: {
    color: '#888',
    fontSize: 12,
  },
  heartButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
  },
  heartIconSmall: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  goArrow: {
    fontSize: 20,
    color: '#6a5acd',
  },
});
