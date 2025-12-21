// Mapbox service for geocoding and routing

const ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';

/**
 * Get coordinates from a place name using Mapbox Geocoding API
 */
export const getCoordsFromText = async (
  placeName: string
): Promise<[number, number] | null> => {
  if (!ACCESS_TOKEN) {
    console.error('Error: Mapbox Token not found. Please check your .env file.');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        placeName
      )}.json?access_token=${ACCESS_TOKEN}&limit=1&proximity=28.9784,41.0082&country=tr`
    );
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return data.features[0].center as [number, number]; // [longitude, latitude]
    }
  } catch (error) {
    console.error('Geocoding error:', placeName, error);
  }
  
  return null;
};

/**
 * Get route directions between two coordinates
 */
export const getRouteDirections = async (
  start: [number, number],
  end: [number, number],
  profile: 'driving' | 'walking' | 'cycling' = 'driving'
): Promise<any> => {
  if (!ACCESS_TOKEN) {
    console.error('Error: Mapbox Token not found.');
    return null;
  }

  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start.join(
      ','
    )};${end.join(',')}?geometries=geojson&access_token=${ACCESS_TOKEN}`;
    
    console.log('Fetching directions from URL:', url.replace(ACCESS_TOKEN, 'TOKEN_HIDDEN'));
    
    const response = await fetch(url);
    const json = await response.json();
    
    console.log('Directions API response:', json.code, json.routes?.length || 0, 'routes');
    
    if (json.code !== 'Ok') {
      console.error('Directions API error:', json.message || json.code);
    }
    
    return json.routes?.[0] || null;
  } catch (error) {
    console.error('Directions error:', error);
    return null;
  }
};
