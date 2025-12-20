import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TransportSelectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const fromScreen = params.fromScreen as string || null;

  const handleSave = () => {
    if (selectedMethod && fromScreen) {
      const path = fromScreen === 'RouteEdit' ? '/route/route-edit' : '/chat/chat-screen';
      // @ts-ignore - Dynamic route navigation
      router.push(`${path}?transport=${encodeURIComponent(selectedMethod)}`);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Ulaşım Yöntemi Seçiniz</Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            selectedMethod === 'Araba' && styles.optionButtonSelected,
          ]}
          onPress={() => setSelectedMethod('Araba')}
        >
          <Text
            style={[
              styles.optionText,
              selectedMethod === 'Araba' && styles.optionTextSelected,
            ]}
          >
            🚗 Araba
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            selectedMethod === 'Toplu Taşıma' && styles.optionButtonSelected,
          ]}
          onPress={() => setSelectedMethod('Toplu Taşıma')}
        >
          <Text
            style={[
              styles.optionText,
              selectedMethod === 'Toplu Taşıma' && styles.optionTextSelected,
            ]}
          >
            🚌 Toplu Taşıma
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            selectedMethod === 'Yürüyerek' && styles.optionButtonSelected,
          ]}
          onPress={() => setSelectedMethod('Yürüyerek')}
        >
          <Text
            style={[
              styles.optionText,
              selectedMethod === 'Yürüyerek' && styles.optionTextSelected,
            ]}
          >
            🚶 Yürüyerek
          </Text>
        </TouchableOpacity>
      </View>

      {selectedMethod && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Kaydet</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 3,
  },
  closeText: {
    fontSize: 30,
    color: '#333',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 32,
    color: '#333',
  },
  buttonGroup: {
    width: '100%',
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
  },
  optionButtonSelected: {
    backgroundColor: '#6a5acd',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#6a5acd',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    elevation: 3,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
