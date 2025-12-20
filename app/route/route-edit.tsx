import { Camera, MapView } from '@/components/map-view-wrapper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface Stop {
  id: string;
  title: string;
  distance: string;
  subtitle: string;
}

export default function RouteEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cameraRef = useRef(null);

  const [selectedTransport, setSelectedTransport] = useState('Araba');

  const stops: Stop[] = [
    {
      id: '1',
      title: 'Tarihi Mekan Adı',
      distance: '1.2 km uzaklıkta',
      subtitle: 'Bu durak, 18. yüzyıl mimarisini sergilemektedir.',
    },
    {
      id: '2',
      title: 'Lezzet Durağı',
      distance: '0.5 km uzaklıkta',
      subtitle: 'Meşhur yerel yemekleri tadabileceğiniz restoran.',
    },
    {
      id: '3',
      title: 'Dönüş Noktası',
      distance: '3.0 km uzaklıkta',
      subtitle: 'Rotanın bitiş noktası.',
    },
  ];

  const handleSave = () => {
    Alert.alert(
      'Rota Kaydedildi',
      `Rota başarıyla güncellendi. Yeni Ulaşım: ${selectedTransport}`
    );
    router.back();
  };

  const handleTransportSelect = () => {
    // @ts-ignore - Dynamic route navigation
    router.push('/route/transport-select?fromScreen=RouteEdit');
  };

  return (
    <View style={styles.container}>
      {/* Map Area */}
      <View style={styles.mapArea}>
        <MapView style={{ flex: 1 }}>
          <Camera ref={cameraRef} zoomLevel={11} centerCoordinate={[28.9784, 41.0082]} />
        </MapView>
        <View style={styles.mapOverlay}>
          <Text style={styles.mapOverlayText}>
            {params.routeId
              ? `Rota ${params.routeId} Düzenleniyor`
              : 'Rota Düzenleniyor'}
          </Text>
        </View>
      </View>

      {/* Info Bar */}
      <View style={styles.infoBar}>
        <TouchableOpacity style={styles.infoButton} onPress={handleTransportSelect}>
          <Text style={styles.infoButtonText}>
            🚍 Ulaşım: {selectedTransport || 'Seçiniz'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoButton}>
          <Text style={styles.infoButtonText}>⏱️ Toplam Süre: 2 s. 05 dk.</Text>
        </TouchableOpacity>
      </View>

      {/* Stop List */}
      <FlatList
        data={stops}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: 12,
          paddingBottom: 200,
        }}
        renderItem={({ item, index }) => (
          <View style={styles.listItem}>
            <View style={styles.iconBox}>
              <Text style={styles.icon}>{index + 1}</Text>
            </View>

            <View style={styles.textArea}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDistance}>📍 {item.distance}</Text>
              <Text style={styles.itemSub}>{item.subtitle}</Text>
            </View>
          </View>
        )}
      />

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Rotayı Kaydet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>Vazgeç</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  mapArea: {
    height: 260,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#e8e8e8',
    position: 'relative' as const,
  },
  mapOverlay: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderRadius: 8,
  },
  mapOverlayText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 12,
  },
  infoButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 3,
  },
  infoButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#6a5acd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  textArea: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  itemDistance: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  itemSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    position: 'absolute',
    bottom: 30,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveBtn: {
    backgroundColor: '#6a5acd',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
  backBtn: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  backText: {
    color: '#333',
    fontWeight: '600',
  },
});
