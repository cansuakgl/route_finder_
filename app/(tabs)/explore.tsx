import { ROUTES } from '@/constants/routes-data';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RouteDetailScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kaydedilen Rotalarım</Text>
        <Text style={styles.subtitle}>Toplam {ROUTES.length} rota oluşturuldu</Text>
      </View>

      <FlatList
        data={ROUTES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>New</Text>
              </View>
            </View>

            <Text style={styles.cardSub}>{item.description}</Text>

            {/* Location tags */}
            <View style={styles.locationsWrapper}>
              {(item.stops || ['Pendik', 'Maltepe']).map((stop, index) => (
                <View key={index} style={styles.locationTag}>
                  <Text style={styles.locationTagText}>📍 {stop}</Text>
                </View>
              ))}
            </View>

            <View style={styles.footer}>
              <View style={styles.divider} />
              <View style={styles.buttons}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    // @ts-ignore - Dynamic route navigation
                    router.push(`/chat/chat-screen?routeToEdit=${item.id}&routeTitle=${encodeURIComponent(item.title)}`);
                  }}
                >
                  <Text style={styles.editText}>⚙️ Düzenle</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.goButton}
                  onPress={() => {
                    // @ts-ignore - Dynamic route navigation
                    router.push(`/route/route-map?routeId=${item.id}&routeTitle=${encodeURIComponent(item.title)}`);
                  }}
                >
                  <Text style={styles.goText}>Haritada Gör</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: '#F8F9FA',
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
  },
  cardTitle: {
    fontWeight: '700',
    fontSize: 17,
    color: '#333',
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
