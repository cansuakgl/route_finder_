import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { ErrorMessage } from '@/components/ui/error-message';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { db } from '@/lib/services/database';
import type { RouteSummary } from '@/lib/types/database';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, View, type ViewStyle } from 'react-native';

//TODO: PACKAGE JSON HAS THE MOCK DATA POPULATION SCRIPT
export default function RouteDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
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
        <ActivityIndicator size="large" color={theme.colors.link} />
        <ThemedText variant="muted" style={{ marginTop: theme.spacing.sm }}>Rotalar yükleniyor...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ErrorMessage message={`❌ ${error}`} />
        <AppButton title="Tekrar Dene" onPress={loadRoutes} />
      </View>
    );
  }

  if (routes.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ThemedText variant="heading3">📍 Henüz rota oluşturmadınız</ThemedText>
        <ThemedText variant="muted">İlk rotanızı oluşturmak için başlayın!</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText variant="heading2">Kaydedilen Rotalarım</ThemedText>
        <ThemedText variant="caption">Toplam {routes.length} rota oluşturuldu</ThemedText>
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
                  <ThemedText variant="label" style={{ fontSize: 17 }}>{item.name}</ThemedText>
                  {isNew && (
                    <View style={[styles.badge, { backgroundColor: theme.colors.surface }]}>
                      <ThemedText variant="caption" style={{ color: theme.colors.success, fontWeight: '700' }}>Yeni</ThemedText>
                    </View>
                  )}
                </View>
                <Pressable
                  style={[styles.favoriteButton, { backgroundColor: theme.colors.surface }]}
                  onPress={() => toggleFavorite(item.id, item.is_favorite)}
                  disabled={favoriteTogglingId === item.id}
                >
                  {favoriteTogglingId === item.id ? (
                    <ActivityIndicator size="small" color={theme.colors.error} />
                  ) : (
                    <ThemedText variant="body">
                      {item.is_favorite ? '❤️' : '🤍'}
                    </ThemedText>
                  )}
                </Pressable>
              </View>

              {item.route_description && (
                <ThemedText variant="bodySmall" style={{ marginTop: theme.spacing.xs }}>{item.route_description}</ThemedText>
              )}

              {/* Route metrics */}
              <View style={styles.locationsWrapper}>
                {item.point_count > 0 && (
                  <View style={[styles.locationTag, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <ThemedText variant="caption" style={{ fontWeight: '600' }}>📍 {item.point_count} durak</ThemedText>
                  </View>
                )}
                {item.total_distance_km > 0 && (
                  <View style={[styles.locationTag, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <ThemedText variant="caption" style={{ fontWeight: '600' }}>🚗 {item.total_distance_km.toFixed(1)} km</ThemedText>
                  </View>
                )}
                {item.total_duration_minutes > 0 && (
                  <View style={[styles.locationTag, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
                    <ThemedText variant="caption" style={{ fontWeight: '600' }}>⏱️ {Math.round(item.total_duration_minutes)} dk</ThemedText>
                  </View>
                )}
              </View>

              <View style={styles.footer}>
                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                <View style={styles.buttons}>
                  <AppButton
                    variant="ghost"
                    title="⚙️ Düzle"
                    style={styles.editButton}
                    onPress={async () => {
                      try {
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
                  />
                  <AppButton
                    variant="primary"
                    title="Haritada Gör"
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
                  />
                </View>
              </View>
            </View>
          );
        }}
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
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    header: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surfaceElevated,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      marginBottom: theme.spacing.sm,
    },
    card: {
      backgroundColor: theme.colors.surfaceElevated,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.md,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    cardTitleRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    badge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.sm,
      marginLeft: theme.spacing.sm,
    },
    favoriteButton: {
      padding: theme.spacing.sm,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 40,
      minHeight: 40,
    },
    locationsWrapper: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    locationTag: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.sm,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
      borderWidth: 1,
    },
    footer: {
      marginTop: theme.spacing.sm,
    },
    divider: {
      height: 1,
      marginBottom: theme.spacing.sm,
    },
    buttons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    editButton: {
      flex: 1,
    },
    goButton: {
      flex: 2,
    },
  });
}
