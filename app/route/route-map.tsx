import { Camera, MapView } from '@/components/map-view-wrapper';
import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { useTheme } from '@/context/theme-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
  Dimensions,
  ScrollView,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Stop {
  id: string;
  title: string;
  time: string;
}

export default function RouteMapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cameraRef = useRef(null);
  const theme = useTheme();

  const routeId = params.routeId as string || '0';
  const routeTitle = params.routeTitle as string || 'Bilinmeyen Rota';

  const stops: Stop[] = [
    { id: '1', title: 'Pendik YHT', time: '10:30' },
    { id: '2', title: 'Maltepe Meydan', time: '12:00' },
    { id: '3', title: 'Kadıköy Sahil', time: '14:30' },
    { id: '4', title: 'Üsküdar İskele', time: '16:00' },
  ];

  const styles = {
    container: { flex: 1 } as const,
    mapContainer: { height: SCREEN_HEIGHT * 0.4 } as const,
    backButton: {
      position: 'absolute' as const,
      top: 50,
      left: 20,
      width: 44,
      height: 44,
      borderRadius: 22,
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
    backIcon: { fontSize: 24 } as const,
    listPanel: {
      flex: 1,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      marginTop: -30,
      paddingTop: 24,
      paddingHorizontal: 24,
      elevation: 20,
    } as const,
    panelHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: 24,
      borderBottomWidth: 1,
      paddingBottom: 15,
    },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 } as const,
    scrollContent: { paddingBottom: 40 } as const,
    stopItem: { flexDirection: 'row' as const, height: 70 },
    timelineContainer: { width: 24, alignItems: 'center' as const },
    dot: { width: 14, height: 14, borderRadius: 7, zIndex: 2 } as const,
    line: { flex: 1, width: 2, marginVertical: 4 } as const,
    stopTextContainer: { flex: 1, paddingLeft: 16 } as const,
  };

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapView style={{ flex: 1 }}>
          <Camera ref={cameraRef} zoomLevel={11} centerCoordinate={[28.9784, 41.0082]} />
        </MapView>

        {/* # NON-DRY component — use <AppButton> from components/ui/app-button */}
        <AppButton
          title="←"
          onPress={() => router.back()}
          style={[styles.backButton, { minHeight: 44 }]}
          textStyle={styles.backIcon}
        />
      </View>

      {/* Stop List Panel */}
      <View style={[styles.listPanel, { backgroundColor: theme.colors.surfaceElevated }]}>
        <View style={[styles.panelHeader, { borderBottomColor: theme.colors.border }]}>
          <View>
            <ThemedText variant="heading3">{routeTitle}</ThemedText>
            <ThemedText variant="caption">{stops.length} Duraklı Güzergah</ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: theme.colors.surface }]}>
            <ThemedText variant="label" style={{ color: theme.colors.primary }}>Aktif</ThemedText>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {stops.map((stop, index) => (
            <View key={stop.id} style={styles.stopItem}>
              {/* Timeline */}
              <View style={styles.timelineContainer}>
                <View style={[styles.dot, { backgroundColor: theme.colors.border }, index === 0 && { backgroundColor: theme.colors.link }]} />
                {index !== stops.length - 1 && <View style={[styles.line, { backgroundColor: theme.colors.border }]} />}
              </View>

              {/* Stop Information */}
              <View style={styles.stopTextContainer}>
                <ThemedText variant="label">{stop.title}</ThemedText>
                <ThemedText variant="caption">Tahmini Varış: {stop.time}</ThemedText>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}


