// // LLM service for route recommendations

// interface LockedLocation {
//   id: string;
//   title: string;
//   coords?: [number, number];
//   lockStatus?: string | null;
// }

// interface RouteRecommendation {
//   id: string;
//   title: string;
//   description: string;
//   transportToNext?: string;
//   transportProfile?: string;
// }

// interface LLMResponse {
//   routeName: string;
//   recommendations: RouteRecommendation[];
// }

// export const fetchLlmRecommendation = async (
//   userPrompt: string,
//   lockedLocations: LockedLocation[] = []
// ): Promise<LLMResponse> => {
//   // Simulate API delay
//   await new Promise(resolve => setTimeout(resolve, 500));

//   // Split the prompt by comma and clean up the names
//   // Example: "Pendik YHT, Maltepe Meydan" -> ["Pendik YHT", "Maltepe Meydan"]
//   const names = userPrompt
//     .split(',')
//     .map(name => name.trim())
//     .filter(name => name.length > 0);

//   const recommendations: RouteRecommendation[] = names.map((name) => ({
//     id: Math.random().toString(36).substr(2, 9),
//     title: name,
//     description: `${name} için oluşturulan durak.`,
//     transportToNext: 'Araba',
//     transportProfile: 'driving'
//   }));

//   return {
//     routeName: `${userPrompt} Rotası`,
//     recommendations
//   };
// };



//-------------------------------------------------------------------------------------------------
// services/llm.ts





// import { supabase } from '../supabase';
// import { getCoordsFromText } from './map';

// interface RouteRecommendation {
//   id: string;
//   title: string;
//   description: string;
//   coords: [number, number] | null;
//   transportToNext?: string;
//   transportProfile?: string;
// }

// interface LLMResponse {
//   routeName: string;
//   recommendations: RouteRecommendation[];
// }

// export const fetchLlmRecommendation = async (
//   userPrompt: string
// ): Promise<LLMResponse> => {
//   try {
//     // 1. Supabase Edge Function'ı çağır (Gemini API burada çalışır)
//     const { data, error } = await supabase.functions.invoke('location-suggestions', {
//       body: { query: userPrompt },
//     });

//     if (error) {
//       // Burası Supabase'in dönderdiği gerçek hatayı konsola basar
//       console.error("Supabase Invoke Hatası Detay:", await error.context.json()); 
//       throw new Error(error.message);
//     }

//     // 2. Gemini'dan gelen her yer için koordinatları al (Batch Geocoding)
//     const geoCodedRecommendations = await Promise.all(
//       data.places.map(async (place: any, index: number) => {
//         // Mekan adı ve adresi birleştirerek daha isabetli arama yapıyoruz
//         const searchQuery = `${place.name}, ${place.address}`;
//         const coords = await getCoordsFromText(searchQuery);

//         return {
//           id: Math.random().toString(36).substr(2, 9),
//           title: place.name,
//           description: place.address,
//           coords: coords, // [longitude, latitude]
//           transportToNext: index < data.places.length - 1 ? 'Yürüyüş' : undefined,
//           transportProfile: 'walking'
//         };
//       })
//     );

//     return {
//       routeName: `${userPrompt.split(' ').slice(0, 3).join(' ')}... Rotası`,
//       recommendations: geoCodedRecommendations
//     };

//   } catch (error) {
//     console.error("LLM Servis Süreci Hatası:", error);
//     throw error;
//   }
// };

import { supabase } from '../supabase';

// 1. Tip Tanımlamaları
export interface RouteRecommendation {
  id: string;
  title: string;
  description: string;
  coords: [number, number]; // [longitude, latitude] - Mapbox standartı
  transportToNext?: string;
  transportProfile?: string;
}

export interface LLMResponse {
  routeName: string;
  recommendations: RouteRecommendation[];
}

/**
 * Supabase Edge Function'ı çağırarak kullanıcı sorgusuna göre 
 * koordinatları hazır rota önerileri getirir.
 */
export const fetchLlmRecommendation = async (
  userPrompt: string
): Promise<LLMResponse> => {
  try {
    // 2. Supabase Invoke (Backend'deki Gemini + Mapbox Geocoding gücü)
    const { data, error } = await supabase.functions.invoke('location-suggestions', {
      body: { query: userPrompt },
    });

    if (error) {
      console.error("Supabase Invoke Hatası:", error);
      throw new Error(`Servis hatası: ${error.message}`);
    }

    // Gelen verinin varlığını kontrol edelim (Crash önleyici)
    if (!data?.places || !Array.isArray(data.places)) {
      throw new Error("API'den geçersiz veri formatı geldi.");
    }

    // 3. Veriyi Uygulama Formatına Dönüştürme
    const recommendations: RouteRecommendation[] = data.places.map((place: any, index: number) => {
      return {
        // Benzersiz ID (Gerçek projede UUID veya DB ID tercih edilebilir)
        id: `loc-${Date.now()}-${index}`, 
        title: place.name || "Bilinmeyen Mekan",
        description: place.address || "Adres bilgisi mevcut değil",
        
        // ÖNEMLİ: Mapbox her zaman [Boylam, Enlem] bekler!
        coords: [Number(place.longitude), Number(place.latitude)] as [number, number], 
        
        // Rota mantığı: Son durak hariç hepsine ulaşım tipi ekle
        transportToNext: index < data.places.length - 1 ? 'Sürüş' : undefined,
        transportProfile: 'driving'
      };
    });

    return {
      routeName: `${userPrompt.length > 20 ? userPrompt.substring(0, 20) + "..." : userPrompt} Rotası`,
      recommendations: recommendations
    };

  } catch (error: any) {
    console.error("fetchLlmRecommendation Hatası:", error.message);
    throw error;
  }
};