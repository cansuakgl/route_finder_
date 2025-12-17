import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function RouteMapScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { routeTitle } = route.params || {};

  return (
    <View style={styles.container}>
      {/* ÜST BAR */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {routeTitle || 'Rota Detayı'}
        </Text>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* HARİTA ALANI */}
      <View style={styles.mapArea}>
        <Text style={styles.mapText}>
          {routeTitle} için harita
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },

  header: {
    height: 56,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 3,
  },

  title: {
    fontSize: 16,
    fontWeight: '600',
  },

  close: {
    fontSize: 22,
    fontWeight: '600',
  },

  mapArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  mapText: {
    color: '#666',
    fontSize: 14,
  },
});
