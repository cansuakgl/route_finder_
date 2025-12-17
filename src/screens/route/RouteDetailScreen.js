// RouteDetailScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../data/routes'; // MOCK rotalarınız

export default function RouteDetailScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* ScrollView ekleyerek FlatList'in scroll sorununu engelledik ve Title'ı yukarıya taşıdık */}
      <Text style={styles.title}>Kaydedilen Rotalarım</Text>

      <FlatList
        data={ROUTES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>{item.description}</Text>

            <View style={styles.buttons}>
              {/* DÜZENLE BUTONU: ChatScreen'e yönlendiriyoruz */}
<TouchableOpacity
  style={styles.editButton}
  onPress={() =>
    navigation.navigate('MainTabs', {
      screen: 'Home',
      params: {
        routeToEdit: item.id,
        routeTitle: item.title,
      },
    })
  }
>
  <Text style={styles.editText}>Düzenle</Text>
</TouchableOpacity>


              {/* ROTAYA GİT BUTONU */}
              <TouchableOpacity
                style={styles.goButton}
                onPress={() =>
                  navigation.navigate('RouteMap', {
                    routeId: item.id,
                    routeTitle: item.title,
                  })
                }
              >
                <Text style={styles.goText}>Rotaya Git</Text>
              </TouchableOpacity>
            </View>
          </View>
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

  title: {
    fontSize: 18,
    fontWeight: '700',
    margin: 16,
    color: '#333',
  },

  // Rota Kartı Stili
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },

  cardTitle: {
    fontWeight: '700',
    fontSize: 16,
    color: '#333',
  },

  cardSub: {
    color: '#888',
    marginTop: 4,
    marginBottom: 12, // Butonlardan ayırmak için boşluk
    fontSize: 13,
  },

  // Buton Alanı
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Butonları soldan başlat
    marginTop: 8,
  },

  // Düzenle Butonu Stili
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0ff', // Açık mor arka plan
    marginRight: 10,
  },
  editText: {
    color: '#6a5acd', // Mor metin
    fontWeight: '600',
    fontSize: 13,
  },

  // Rotaya Git Butonu Stili
  goButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#6a5acd', // Koyu mor arka plan
  },
  goText: {
    color: '#fff', // Beyaz metin
    fontWeight: '600',
    fontSize: 13,
  },
});