import { Camera, MapView } from '@/components/map-view-wrapper';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AppTextInput } from '@/components/ui/app-text-input';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { db } from '@/lib/services/database';
import { getLocationSuggestions } from '@/lib/services/llm';
import { getCoordsFromText } from '@/lib/services/map';
import type { Route, RoutePoint, TransitSegment } from '@/lib/types/database';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  View,
  type ViewStyle
} from 'react-native';

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const cameraRef = useRef(null);
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

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
        <AppButton
          title="＋"
          loading={isLoading}
          onPress={() => {
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
          style={styles.plusButton}
        />
        <AppTextInput
          placeholder="Nereye gitmek istersin?"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={onSearch}
          containerStyle={{ flex: 1 }}
          style={{ borderWidth: 0, height: 48, fontSize: 14 }}
          editable={!isLoading}
        />
      </View>

      {/* Header */}
      <View style={styles.headerRow}>
        <ThemedText variant="label">💜 Favori Rotalarım</ThemedText>
      </View>

      {/* Route List */}
      <FlatList
        data={favoriteRoutes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 150 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText variant="muted">❤️ Henüz favori rota yok</ThemedText>
            <ThemedText variant="caption">Rotalar sayfasından favori ekleyebilirsiniz</ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
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
                <View style={[styles.favoriteIconBox, { backgroundColor: theme.colors.surface }]}>
                  <ThemedText variant="body">📍</ThemedText>
                </View>
                <View style={styles.favoriteTextBox}>
                  <ThemedText variant="label">{item.name}</ThemedText>
                  <ThemedText variant="caption">
                    {item.route_description || 'Favori rota.'}
                  </ThemedText>
                </View>
                <Pressable
                  style={[styles.heartButton, { backgroundColor: theme.colors.surface }]}
                  onPress={(e) => {
                    toggleFavorite(item.id, item.is_favorite);
                  }}
                  disabled={favoriteTogglingId === item.id}
                >
                  {favoriteTogglingId === item.id ? (
                    <ActivityIndicator size="small" color={theme.colors.error} />
                  ) : (
                    <ThemedText variant="body">❤️</ThemedText>
                  )}
                </Pressable>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

function makeStyles(theme: ReturnType<typeof useTheme>): Record<string, ViewStyle> {
  return ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    mapArea: {
      height: 250,
    },
    mapbox: {
      flex: 1,
    },
    markerContainer: {
      width: 24,
      height: 24,
      backgroundColor: theme.colors.link,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.surfaceElevated,
    },
    searchBox: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: theme.spacing.md,
      marginTop: -25,
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: 20,
      paddingHorizontal: theme.spacing.sm,
      elevation: 5,
      zIndex: 10,
    },
    plusButton: {
      marginRight: theme.spacing.sm,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    favoriteCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceElevated,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
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
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    favoriteTextBox: {
      flex: 1,
    },
    heartButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.radius.md,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: theme.spacing.md,
    },
  });
}
