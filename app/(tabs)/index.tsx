import { Camera, MapView, PointAnnotation } from '@/components/map-view-wrapper';
import { ROUTES, Route } from '@/constants/routes-data';
import { fetchLlmRecommendation } from '@/lib/services/llm';
import { getCoordsFromText } from '@/lib/services/map';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Transit options component
interface TransitOptionsProps {
  selected: string;
  onSelect: (method: string, profile: string) => void;
}

const TransitOptions: React.FC<TransitOptionsProps> = ({ selected, onSelect }) => {
  const options = [
    { label: 'Araba', icon: '🚗', profile: 'driving' },
    { label: 'Bisiklet', icon: '🚲', profile: 'cycling' },
    { label: 'Yürüyüş', icon: '🚶', profile: 'walking' },
  ];
  
  return (
    <View style={transitStyles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.label}
          onPress={() => onSelect(option.label, option.profile)}
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

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const cameraRef = useRef(null);

  const [searchText, setSearchText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Route[]>(ROUTES);
  const [editRouteId, setEditRouteId] = useState<string | null>(null);
  const [totalDuration, setTotalDuration] = useState(0);

  useEffect(() => {
    if (params.routeToEdit) {
      const routeId = params.routeToEdit as string;
      if (editRouteId !== routeId) {
        setIsEditing(true);
        setEditRouteId(routeId);
        setSearchText((params.routeTitle as string) || '');
      }
    }
  }, [params.routeToEdit, editRouteId]);

  const formatDuration = (totalMinutes: number) => {
    if (totalMinutes === 0) return '0 dk.';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours} sa. ${minutes} dk.` : `${minutes} dk.`;
  };

  const onSearch = async () => {
    if (searchText.trim().length === 0) return;
    
    setIsLoading(true);
    try {
      const lockedItems = isEditing ? data.filter(item => item.lockStatus === '+') : [];
      const blacklistedTitles = isEditing
        ? data.filter(item => item.lockStatus === '-').map(i => i.title.toLowerCase())
        : [];
      
      const result = await fetchLlmRecommendation(searchText, lockedItems);

      const enrichedNewData: Route[] = [];
      for (const item of result.recommendations) {
        if (blacklistedTitles.includes(item.title.toLowerCase())) continue;
        
        const coords = await getCoordsFromText(item.title);
        enrichedNewData.push({
          ...item,
          coords: coords || undefined,
          id: `n-${Math.random().toString(36).substr(2, 5)}`,
          transportToNext: 'Araba',
          transportProfile: 'driving',
        });
      }

      const updatedData = [
        ...lockedItems,
        ...enrichedNewData,
        ...data.filter(i => i.lockStatus === '-'),
      ];
      
      setData(updatedData);
      setIsEditing(true);
    } catch (error) {
      Alert.alert('Hata', 'Arama yapılamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockToggle = (itemId: string, status: string) => {
    const newData = data.map(item =>
      item.id === itemId
        ? { ...item, lockStatus: item.lockStatus === status ? null : status }
        : item
    );
    setData(newData);
  };

  const handleTransportChange = (itemId: string, method: string, profile: string) => {
    const newData = data.map(item =>
      item.id === itemId
        ? { ...item, transportToNext: method, transportProfile: profile }
        : item
    );
    setData(newData);
  };

  const visibleData = data.filter(item => item.lockStatus !== '-');

  return (
    <View style={styles.container}>
      {/* Map Area */}
      <View style={styles.mapArea}>
        <MapView style={styles.mapbox}>
          <Camera ref={cameraRef} zoomLevel={11} centerCoordinate={[28.9784, 41.0082]} />
          {isEditing && visibleData.map((item, index) => item.coords && (
            <PointAnnotation key={item.id} id={`m-${item.id}`} coordinate={item.coords}>
              <View style={styles.markerContainer}>
                <Text style={styles.markerText}>{index + 1}</Text>
              </View>
            </PointAnnotation>
          ))}
        </MapView>
      </View>

      {/* Search Box */}
      <View style={styles.searchBox}>
        <TouchableOpacity
          onPress={() => {
            setIsEditing(false);
            setSearchText('');
            setTotalDuration(0);
          }}
          style={styles.plusButton}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#6a5acd" />
          ) : (
            <Text style={styles.plusText}>＋</Text>
          )}
        </TouchableOpacity>
        <TextInput
          placeholder="Nereye gitmek istersin?"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={onSearch}
          style={styles.searchInput}
          editable={!isLoading}
        />
      </View>

      {/* Header and Duration */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>
          {isEditing ? 'Rota Düzenleme' : '💜 Favori Rotalarım'}
        </Text>
        {isEditing && totalDuration > 0 && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>⏱️ {formatDuration(totalDuration)}</Text>
          </View>
        )}
      </View>

      {/* Route List */}
      <FlatList
        data={isEditing ? visibleData : ROUTES}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 150 }}
        renderItem={({ item, index }) => {
          if (!isEditing) {
            return (
              <TouchableOpacity
                onPress={() => {
                  // @ts-ignore - Dynamic route navigation
                  router.push(`/route/route-map?routeId=${item.id}&routeTitle=${encodeURIComponent(item.title)}`);
                }}
              >
                <View style={styles.favoriteCard}>
                  <View style={styles.favoriteIconBox}>
                    <Text style={styles.favoriteIcon}>📍</Text>
                  </View>
                  <View style={styles.favoriteTextBox}>
                    <Text style={styles.favoriteTitle}>{item.title}</Text>
                    <Text style={styles.favoriteSub}>
                      {item.description || 'Favori rota.'}
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
                  <Text style={styles.cardSub}>Durak Detayı</Text>
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
              {index < visibleData.length - 1 && (
                <TransitOptions
                  selected={item.transportToNext || ''}
                  onSelect={(method, profile) =>
                    handleTransportChange(item.id, method, profile)
                  }
                />
              )}
            </View>
          );
        }}
      />

      {isEditing && (
        <View style={styles.llmActionsFixed}>
          <TouchableOpacity
            onPress={() => Alert.alert('Başarılı', 'Rota kaydedildi.')}
            style={styles.acceptButton}
          >
            <Text style={styles.acceptText}>Rotayı Kaydet</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const transitStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    marginTop: 8,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginHorizontal: 4,
    backgroundColor: '#eee',
  },
  buttonSelected: {
    backgroundColor: '#6a5acd',
  },
  text: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  textSelected: {
    color: '#fff',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  mapArea: {
    height: 250,
    backgroundColor: '#d9d9d9',
  },
  mapbox: {
    flex: 1,
  },
  markerContainer: {
    width: 24,
    height: 24,
    backgroundColor: '#6a5acd',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: -25,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    elevation: 5,
    zIndex: 10,
  },
  plusButton: {
    marginRight: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    fontSize: 20,
  },
  searchInput: {
    flex: 1,
    height: 45,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  durationBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6a5acd',
  },
  durationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6a5acd',
  },
  favoriteCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  favoriteIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  favoriteTextBox: {
    flex: 1,
  },
  favoriteTitle: {
    fontWeight: '700',
    fontSize: 15,
  },
  favoriteSub: {
    color: '#888',
    fontSize: 12,
  },
  goArrow: {
    fontSize: 20,
    color: '#6a5acd',
  },
  dynamicCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  cardSub: {
    color: '#666',
    fontSize: 11,
  },
  dragHandle: {
    marginRight: 12,
  },
  dragText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6a5acd',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    opacity: 0.4,
  },
  buttonAdd: {
    backgroundColor: '#2e8b57',
  },
  buttonRemove: {
    backgroundColor: '#ff6347',
  },
  buttonSelected: {
    opacity: 1,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  llmActionsFixed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 30,
  },
  acceptButton: {
    backgroundColor: '#6a5acd',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  acceptText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
