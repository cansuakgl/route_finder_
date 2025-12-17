import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function RouteEditScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // 1. Ulaşım Yöntemi State'i (Orijinal RouteEdit'ten devralındı)
  const [selectedTransport, setSelectedTransport] = useState('Araba'); // Varsayılan değer

  React.useEffect(() => {
    // TransportSelectScreen'den gelen yeni ulaşım yöntemini yakala
    if (route.params?.transport) {
      setSelectedTransport(route.params.transport);
    }
    // NOT: Gerçek projede, burada routeId kullanarak mevcut rota verilerini çekmelisiniz.
  }, [route.params?.transport]);

  // 2. Duraklar (LLMResultEditScreen yapısından simüle edildi)
  const stops = [
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

  // 3. Aksiyon Fonksiyonları
  const handleSave = () => {
    Alert.alert('Rota Kaydedildi', `Rota başarıyla güncellendi. Yeni Ulaşım: ${selectedTransport}`);
    navigation.goBack(); // Kaydedip Rotalarım ekranına dön
  };

  const handleTransportSelect = () => {
    // Ulaşım Seçim ekranına yönlendirme
    navigation.navigate('TransportSelect', { fromScreen: 'RouteEdit' });
  };

  return (
    <View style={styles.container}>
      {/* 🗺️ MAP - Harita Alanı */}
      <View style={styles.mapArea}>
        {/* HARİTA YER TUTUCU */}
        <Image
          source={require('../../assets/images/map_route.jpg')}
          style={styles.mapImage}
          resizeMode="cover"
        />
        <Text style={styles.mapOverlayText}>
          {route.params?.routeId ? `Rota ${route.params.routeId} Düzenleniyor` : 'Rota Düzenleniyor'}
        </Text>
      </View>

      {/* ⏱️ INFO BUTTONS */}
      <View style={styles.infoBar}>
        {/* Ulaşım butonu, TransportSelectScreen'e yönlendirir */}
        <TouchableOpacity style={styles.infoButton} onPress={handleTransportSelect}>
          <Text style={styles.infoButtonText}>
            🚍 Ulaşım: {selectedTransport || 'Seçiniz'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoButton}>
          <Text style={styles.infoButtonText}>⏱️ Toplam Süre: 2 s. 05 dk.</Text>
        </TouchableOpacity>
      </View>

      {/* 📋 STOP LIST - Durak Listesi */}
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
              <Text style={styles.icon}>{index + 1}</Text> {/* Sıra numarası */}
            </View>

            <View style={styles.textArea}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDistance}>📍 {item.distance}</Text>
              <Text style={styles.itemSub}>{item.subtitle}</Text>

              {/* Düzenleme Ekranına özgü: Durak Silme/Taşıma Butonları eklenebilir */}
            </View>
          </View>
        )}
      />

      {/* 🔽 ACTION BUTTONS - Aksiyon Butonları */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Rotayı Kaydet</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Vazgeç</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },

  /* MAP */
  mapArea: {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
  },

  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7, // Haritanın görünürlüğünü azaltıyoruz
  },

  mapOverlayText: {
    position: 'absolute',
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },

  /* INFO BAR */
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

  /* LIST ITEM */
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center', // Dikeyde ortala
  },

  iconBox: {
    width: 30, // Daha küçük yaptık
    height: 30,
    borderRadius: 15,
    backgroundColor: '#6a5acd', // Mor renk
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  icon: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff', // Beyaz numara
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

  /* ACTIONS */
  actions: {
    position: 'absolute',
    bottom: 30, // Altta boşluk bıraktık
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