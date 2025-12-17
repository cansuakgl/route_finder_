import React, { useState } from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';

export default function TransportSelectScreen({ navigation, route }) {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const fromScreen = route.params?.fromScreen || null; // hangi ekran çağırdı

  const handleSave = () => {
    if (selectedMethod && fromScreen) {
      navigation.navigate(fromScreen, { transport: selectedMethod });
    }
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {/* Çarpı butonu */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 40, right: 20 }}
        onPress={() => navigation.goBack()}
      >
        <Text style={{ fontSize: 24 }}>×</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 20, marginBottom: 20 }}>Ulaşım Yöntemi Seçiniz</Text>

      <Button title="Araba" onPress={() => setSelectedMethod('Araba')} />
      <Button title="Toplu Taşıma" onPress={() => setSelectedMethod('Toplu Taşıma')} />
      <Button title="Yürüyerek" onPress={() => setSelectedMethod('Yürüyerek')} />

      {selectedMethod && (
        <Button title="Kaydet" onPress={handleSave} />
      )}
    </View>
  );
}
