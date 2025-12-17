import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function RouteEditScreen() {
  const navigation = useNavigation();

  const stops = [
    {
      id: '1',
      title: 'List item',
      distance: '1.2 miles away',
      subtitle: 'Supporting line text lorem ipsum dolor sit.',
      transport: 'Otobüs',
      time: '20 dk.',
    },
    {
      id: '2',
      title: 'List item',
      distance: '1.2 miles away',
      subtitle: 'Supporting line text lorem ipsum dolor sit.',
      transport: 'Araba',
      time: '20 dk.',
    },
    {
      id: '3',
      title: 'List item',
      distance: '1.2 miles away',
      subtitle: 'Supporting line text lorem ipsum dolor sit.',
    },
  ];

  return (
    <View style={styles.container}>
      {/* 🗺️ MAP */}
      <View style={styles.mapArea}>
        <Image
          source={require('../../assets/images/map_route.jpg')}
          style={styles.mapImage}
          resizeMode="cover"
        />
      </View>

      {/* ⏱️ INFO BUTTONS */}
      <View style={styles.infoBar}>
        <TouchableOpacity style={styles.infoButton}>
          <Text style={styles.infoButtonText}>🚍 Ulaşım</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoButton}>
          <Text style={styles.infoButtonText}>⏱️ 1 s. 20 dk.</Text>
        </TouchableOpacity>
      </View>

      {/* 📋 STOP LIST */}
      <FlatList
        data={stops}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: 12,       // ✅ liste aşağıdan başlar
          paddingBottom: 200,   // ✅ alt butonlar için boşluk
        }}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.iconBox}>
              <Text style={styles.icon}>☁️</Text>
            </View>

            <View style={styles.textArea}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDistance}>$$ · {item.distance}</Text>
              <Text style={styles.itemSub}>{item.subtitle}</Text>

              {item.transport && (
                <View style={styles.transportRow}>
                  <Text style={styles.transport}>
                    🚍 {item.transport}
                  </Text>
                  <Text style={styles.transportTime}>
                    {item.time}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      />

      {/* 🔽 ACTION BUTTONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.saveText}>Kaydet</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Geri Dön</Text>
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
  },

  mapImage: {
    width: '100%',
    height: '100%',
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
  },

  /* LIST ITEM */
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
  },

  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  icon: {
    fontSize: 20,
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

  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  transport: {
    fontSize: 12,
    color: '#444',
    marginRight: 12,
  },

  transportTime: {
    fontSize: 12,
    color: '#444',
  },

  /* ACTIONS */
  actions: {
    position: 'absolute',
    bottom: 90,
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
  },

  backText: {
    color: '#333',
    fontWeight: '600',
  },
});
