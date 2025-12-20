import { Camera, MapView } from '@/components/map-view-wrapper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
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

  const routeId = params.routeId as string || '0';
  const routeTitle = params.routeTitle as string || 'Bilinmeyen Rota';

  const stops: Stop[] = [
    { id: '1', title: 'Pendik YHT', time: '10:30' },
    { id: '2', title: 'Maltepe Meydan', time: '12:00' },
    { id: '3', title: 'Kadıköy Sahil', time: '14:30' },
    { id: '4', title: 'Üsküdar İskele', time: '16:00' },
  ];

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <View style={styles.mapContainer}>
        <MapView style={{ flex: 1 }}>
          <Camera ref={cameraRef} zoomLevel={11} centerCoordinate={[28.9784, 41.0082]} />
        </MapView>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Stop List Panel */}
      <View style={styles.listPanel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.panelTitle}>{routeTitle}</Text>
            <Text style={styles.stopCount}>{stops.length} Duraklı Güzergah</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Aktif</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {stops.map((stop, index) => (
            <View key={stop.id} style={styles.stopItem}>
              {/* Timeline (Dot and Line) */}
              <View style={styles.timelineContainer}>
                <View style={[styles.dot, index === 0 && styles.activeDot]} />
                {index !== stops.length - 1 && <View style={styles.line} />}
              </View>

              {/* Stop Information */}
              <View style={styles.stopTextContainer}>
                <Text style={styles.stopName}>{stop.title}</Text>
                <Text style={styles.stopTime}>Tahmini Varış: {stop.time}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    height: SCREEN_HEIGHT * 0.4,
    backgroundColor: '#e8e8e8',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 32,
    color: '#666',
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
  listPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -30,
    paddingTop: 24,
    paddingHorizontal: 24,
    elevation: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 15,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  stopCount: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: '#F0EFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#6a5acd',
    fontWeight: '700',
    fontSize: 12,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  stopItem: {
    flexDirection: 'row',
    height: 70,
  },
  timelineContainer: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E0E0E0',
    zIndex: 2,
  },
  activeDot: {
    backgroundColor: '#6a5acd',
    borderWidth: 3,
    borderColor: '#F0EFFF',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#F0F0F0',
    marginVertical: 4,
  },
  stopTextContainer: {
    flex: 1,
    paddingLeft: 16,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  stopTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
