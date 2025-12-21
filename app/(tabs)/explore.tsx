import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/services/database';
import type { RouteSummary } from '@/lib/types/database';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

//TODO: PACKAGE JSON HAS THE MOCK DATA POPULATION SCRIPT
export default function RouteDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [routes, setRoutes] = useState<RouteSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteTogglingId, setFavoriteTogglingId] = useState<string | null>(null);
 

  useEffect(() => {
    loadRoutes();
  }, []);

  async function loadRoutes() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await db.routes.getRoutesSummary();
      setRoutes(data);
    } catch (err) {
      console.error('Error loading routes:', err);
      setError('Rotalar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleFavorite(routeId: string, currentFavorite: boolean) {
    try {
      setFavoriteTogglingId(routeId);
      await db.routes.toggleRouteFavorite(routeId, !currentFavorite);
      
      // Update local state immediately for better UX
      setRoutes(prevRoutes => 
        prevRoutes.map(route => 
          route.id === routeId 
            ? { ...route, is_favorite: !currentFavorite }
            : route
        )
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
      Alert.alert('Hata', 'Favori durumu değiştirilirken bir hata oluştu');
    } finally {
      setFavoriteTogglingId(null);
    }
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6a5acd" />
        <Text style={styles.loadingText}>Rotalar yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadRoutes}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (routes.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>📍 Henüz rota oluşturmadınız</Text>
        <Text style={styles.emptySubtext}>İlk rotanızı oluşturmak için başlayın!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kaydedilen Rotalarım</Text>
        <Text style={styles.subtitle}>Toplam {routes.length} rota oluşturuldu</Text>
      </View>

      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => {
          const isNew = new Date().getTime() - new Date(item.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;
          
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  {isNew && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Yeni</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => toggleFavorite(item.id, item.is_favorite)}
                  disabled={favoriteTogglingId === item.id}
                >
                  {favoriteTogglingId === item.id ? (
                    <ActivityIndicator size="small" color="#ff69b4" />
                  ) : (
                    <Text style={[styles.heartIcon, item.is_favorite && styles.heartIconFilled]}>
                      {item.is_favorite ? '❤️' : '🤍'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {item.route_description && (
                <Text style={styles.cardSub}>{item.route_description}</Text>
              )}

              {/* Route metrics */}
              <View style={styles.locationsWrapper}>
                {item.point_count > 0 && (
                  <View style={styles.locationTag}>
                    <Text style={styles.locationTagText}>📍 {item.point_count} durak</Text>
                  </View>
                )}
                {item.total_distance_km > 0 && (
                  <View style={styles.locationTag}>
                    <Text style={styles.locationTagText}>🚗 {item.total_distance_km.toFixed(1)} km</Text>
                  </View>
                )}
                {item.total_duration_minutes > 0 && (
                  <View style={styles.locationTag}>
                    <Text style={styles.locationTagText}>⏱️ {Math.round(item.total_duration_minutes)} dk</Text>
                  </View>
                )}
              </View>

              <View style={styles.footer}>
                <View style={styles.divider} />
                <View style={styles.buttons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={async () => {
                      try {
                        // Fetch actual route data from database
                        const [points, segments] = await Promise.all([
                          db.routePoints.getPointsByRouteId(item.id),
                          db.transitSegments.getSegmentsByRouteId(item.id),
                        ]);

                        // @ts-ignore - Dynamic route navigation
                        router.push({
                          pathname: '/route/route-edit',
                          params: {
                            routeId: item.id,
                            routeName: item.name,
                            points: JSON.stringify(points),
                            segments: JSON.stringify(segments),
                          },
                        });
                      } catch (err) {
                        console.error('Error loading route data:', err);
                        alert('Rota verileri yüklenirken bir hata oluştu');
                      }
                    }}
                  >
                    <Text style={styles.editText}>⚙️ Düzenle</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.goButton}
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
                    <Text style={styles.goText}>Haritada Gör</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6a5acd',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#6a5acd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 17,
    color: '#333',
    marginRight: 8,
  },
  favoriteButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  heartIcon: {
    fontSize: 18,
  },
  heartIconFilled: {
    // The filled heart emoji already has color
  },
  badge: {
    backgroundColor: '#E0FFE0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#2E8B57',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardSub: {
    color: '#666',
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },
  locationsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 8,
  },
  locationTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  locationTagText: {
    fontSize: 11,
    color: '#555',
    fontWeight: '600',
  },
  footer: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F5F5F7',
    marginRight: 8,
    alignItems: 'center',
  },
  editText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 13,
  },
  goButton: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#6a5acd',
    alignItems: 'center',
    shadowColor: '#6a5acd',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  goText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
