// ChatScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ROUTES } from '../../data/routes';

// ===========================================
// YENİ BİLEŞEN: DURAKLAR ARASI GEÇİŞ SEÇİMİ
// ===========================================
const TransitOptions = ({ selected, onSelect }) => {
  const options = [
    { label: 'Araba', icon: '' },
    { label: 'Bisiklet', icon: '' },
    { label: 'Yürüyüş', icon: '' },
  ];
  return (
    <View style={transitStyles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.label}
          onPress={() => onSelect(option.label)}
          style={[
            transitStyles.button,
            selected === option.label && transitStyles.buttonSelected,
          ]}
        >
          <Text
            style={[
              transitStyles.text,
              selected === option.label && transitStyles.textSelected,
            ]}
          >
            {option.icon} {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// ===========================================
// TEMEL EKRAN: ChatScreen
// ===========================================

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const [searchText, setSearchText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(ROUTES);
  const [editRouteId, setEditRouteId] = useState(null);

  // LLM'den gelen örnek rota verisi
  const LLM_MOCK_ROUTE = [
    { id: '1', title: 'Ayasofya', lockStatus: '+', transportToNext: 'Araba' },
    { id: '2', title: 'Sultanahmet', lockStatus: null, transportToNext: 'Yürüyüş' },
    { id: '3', title: 'Topkapı Sarayı', lockStatus: '-', transportToNext: 'Bisiklet' },
    { id: '4', title: 'Gülhane Parkı', lockStatus: null, transportToNext: null },
  ];

  const fetchRouteForEdit = (routeId) => {
    const routeData = ROUTES.find(r => r.id === routeId);
    if (routeData) {
        return LLM_MOCK_ROUTE.map((item, index) => ({
            ...item,
            id: `edit-${index}`,
            title: `${routeData.title} Durağı ${index + 1}`,
        }));
    }
    return [];
  };

  useEffect(() => {
    if (!route.params?.routeToEdit) return;
    const routeId = route.params.routeToEdit;
    if (editRouteId === routeId) return;

    const routeData = fetchRouteForEdit(routeId);
    setEditRouteId(routeId);
    setIsEditing(true);
    setData(routeData);
    setSearchText(route.params.routeTitle || '');
  }, [route.params?.routeToEdit]);

  const onSearch = () => {
    if (searchText.trim().length === 0) return;
    setIsEditing(true);
    setData(LLM_MOCK_ROUTE);
  };

  const onNewChat = () => {
    setSearchText('');
    setIsEditing(false);
    setEditRouteId(null);
    setData(ROUTES);
    navigation.setParams({
      routeToEdit: undefined,
      routeTitle: undefined,
    });
  };

  const handleLockToggle = (itemId, status) => {
    setData((currentData) =>
      currentData.map((item) =>
        item.id === itemId
          ? {
              ...item,
              lockStatus: item.lockStatus === status ? null : status,
            }
          : item
      )
    );
  };

  const handleTransportChange = (itemId, method) => {
      setData((currentData) =>
          currentData.map((item) =>
              item.id === itemId ? { ...item, transportToNext: method } : item
          )
      );
  };

  const handleSaveRoute = () => {
    Alert.alert('Rotayı Kaydet', 'Oluşturulan veya düzenlenen rota kaydedildi.');
    onNewChat();
  };

  const renderItem = ({ item, index }) => {
    if (!isEditing) {
      return (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('RouteMap', {
              routeId: item.id,
              routeTitle: item.title,
            })
          }
        >
          <View style={styles.favoriteCard}>
            <View style={styles.favoriteIconBox}>
                <Text style={styles.favoriteIcon}></Text>
            </View>
            <View style={styles.favoriteTextBox}>
                <Text style={styles.favoriteTitle}>{item.title}</Text>
                <Text style={styles.favoriteSub}>
                {item.description || 'Kısa açıklama: Bu favori rota kaydedilmiştir.'}
                </Text>
            </View>
            <Text style={styles.goArrow}>→</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View>
        <View style={styles.dynamicCard}>
          <View style={styles.dragHandle}>
            <Text style={styles.dragText}>{index + 1}.</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSub}>Rota içindeki durak</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => handleLockToggle(item.id, '+')}
              style={[
                styles.actionButton,
                styles.buttonAdd,
                item.lockStatus === '+' && styles.buttonSelected,
              ]}
            >
              <Text style={styles.actionText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleLockToggle(item.id, '-')}
              style={[
                styles.actionButton,
                styles.buttonRemove,
                item.lockStatus === '-' && styles.buttonSelected,
              ]}
            >
              <Text style={styles.actionText}>—</Text>
            </TouchableOpacity>
          </View>
        </View>

        {index < data.length - 1 && (
          <TransitOptions
            selected={item.transportToNext}
            onSelect={(method) => handleTransportChange(item.id, method)}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* 🗺️ HARİTA */}
      <View style={styles.mapArea}>
        {!isEditing ? (
          <Image
            source={require('../../assets/images/map_default.png')}
            style={styles.mapImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapText}>
              {route.params?.routeTitle || 'LLM Önerilen Rotanın'} Dinamik Haritası
            </Text>
          </View>
        )}
      </View>

      {/* 🔍 SEARCH BOX */}
      <View style={styles.searchBox}>
        <TouchableOpacity onPress={onNewChat} style={styles.plusButton}>
          <Text style={styles.plusText}>＋</Text>
        </TouchableOpacity>
        <TextInput
          placeholder="Gezmek istediğin yerleri anlat"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={onSearch}
          returnKeyType="search"
          style={styles.searchInput}
        />
      </View>

      {/* 💜 BAŞLIK VE SÜRE SATIRI */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>
          {isEditing
            ? 'Rota Düzenleme & LLM Önerileri'
            : '💜 Favori rotalarım'}
        </Text>

        {isEditing && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>⏱️ 1 sa. 20 dk.</Text>
          </View>
        )}
      </View>

      {/* 📦 LİSTE */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 150 }}
        renderItem={renderItem}
      />

      {/* ✅ AKSİYON BUTONU */}
      {isEditing && (
        <View style={styles.llmActionsFixed}>
          <TouchableOpacity
            onPress={handleSaveRoute}
            style={styles.acceptButton}
          >
            <Text style={styles.acceptText}>Rotayı Güncelle</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ===========================================
// STYLES
// ===========================================

const transitStyles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'center', marginHorizontal: 16, marginBottom: 12, marginTop: 8 },
  button: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, marginHorizontal: 5, backgroundColor: '#e0e0e0' },
  buttonSelected: { backgroundColor: '#6a5acd' },
  text: { color: '#666', fontWeight: '500', fontSize: 13 },
  textSelected: { color: '#fff' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  mapArea: { height: 220, backgroundColor: '#d9d9d9' },
  mapImage: { width: '100%', height: '100%' },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapText: { color: '#666' },

  searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: -25, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, elevation: 3, zIndex: 10 },
  plusButton: { marginRight: 8, width: 36, height: 36, borderRadius: 18, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' },
  plusText: { fontSize: 20 },
  searchInput: { flex: 1, height: 45 },

  // BAŞLIK VE SÜRE SATIRI STİLLERİ
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  durationBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  durationText: { fontSize: 12, fontWeight: '700', color: '#6a5acd' },

  favoriteCard: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16, alignItems: 'center', elevation: 3 },
  favoriteIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f0f0ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  favoriteIcon: { fontSize: 20 },
  favoriteTextBox: { flex: 1 },
  favoriteTitle: { fontWeight: '700', fontSize: 16, color: '#333' },
  favoriteSub: { color: '#888', marginTop: 3, fontSize: 13 },
  goArrow: { fontSize: 24, color: '#6a5acd', fontWeight: 'bold', marginLeft: 10 },

  dynamicCard: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 0, borderRadius: 12, padding: 16, alignItems: 'center', elevation: 1 },
  cardContent: { flex: 1 },
  cardTitle: { fontWeight: '600', fontSize: 15 },
  cardSub: { color: '#666', marginTop: 4 },
  dragHandle: { marginRight: 15, paddingRight: 5 },
  dragText: { fontSize: 18, fontWeight: '700', color: '#aaa' },

  actionButtons: { flexDirection: 'row', marginLeft: 10 },
  actionButton: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginLeft: 8, opacity: 0.6, borderWidth: 2, borderColor: 'transparent' },
  buttonAdd: { backgroundColor: '#2e8b57' },
  buttonRemove: { backgroundColor: '#ff6347' },
  buttonSelected: { opacity: 1, borderColor: '#fff' },
  actionText: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 20 },

  llmActionsFixed: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', paddingBottom: 40 },
  acceptButton: { backgroundColor: '#6a5acd', paddingVertical: 14, borderRadius: 24, alignItems: 'center' },
  acceptText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
