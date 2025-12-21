/**
 * Script to populate the database with mock routes for testing
 * Run with: npx ts-node scripts/populate-mock-routes.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase credentials in environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock routes data
const mockRoutes = [
  {
    name: "İstanbul Tarihi Yerler Turu",
    routeDescription: "Sultanahmet, Ayasofya ve Topkapı Sarayı'nı kapsayan tarihi tur",
    sessionDescription: "Tarihi mekanları gezmek istiyorum",
    constraints: ["walking", "historical"],
    routePoints: [
      {
        position: 0,
        name: "Sultanahmet Meydanı",
        address: "Binbirdirek, Sultanahmet Meydanı, Fatih/İstanbul",
        latitude: 41.0086,
        longitude: 28.9802,
        tags: ["historical", "square"]
      },
      {
        position: 1,
        name: "Ayasofya Camii",
        address: "Sultanahmet Mahallesi, Ayasofya Meydanı No:1, Fatih/İstanbul",
        latitude: 41.0086,
        longitude: 28.9802,
        tags: ["historical", "mosque", "museum"]
      },
      {
        position: 2,
        name: "Topkapı Sarayı",
        address: "Cankurtaran Mahallesi, Fatih/İstanbul",
        latitude: 41.0115,
        longitude: 28.9833,
        tags: ["historical", "palace", "museum"]
      },
      {
        position: 3,
        name: "Gülhane Parkı",
        address: "Cankurtaran, Kennedy Cd., Fatih/İstanbul",
        latitude: 41.0133,
        longitude: 28.9819,
        tags: ["park", "nature"]
      }
    ],
    transitSegments: [
      {
        from_position: 0,
        to_position: 1,
        transit_type: "walking",
        distance_km: 0.3,
        duration_minutes: 5,
        notes: "Kısa yürüyüş mesafesi"
      },
      {
        from_position: 1,
        to_position: 2,
        transit_type: "walking",
        distance_km: 0.5,
        duration_minutes: 8,
        notes: "Sahil boyunca yürüyüş"
      },
      {
        from_position: 2,
        to_position: 3,
        transit_type: "walking",
        distance_km: 0.2,
        duration_minutes: 3,
        notes: "Park girişine kadar"
      }
    ]
  },
  {
    name: "Boğaz Turu",
    routeDescription: "Boğazın en güzel noktalarını kapsayan araç turu",
    sessionDescription: "Boğaz manzarası izlemek istiyorum",
    constraints: ["driving", "scenic"],
    routePoints: [
      {
        position: 0,
        name: "Ortaköy",
        address: "Ortaköy Meydanı, Beşiktaş/İstanbul",
        latitude: 41.0554,
        longitude: 29.0269,
        tags: ["coastal", "square"]
      },
      {
        position: 1,
        name: "Bebek",
        address: "Bebek Sahili, Beşiktaş/İstanbul",
        latitude: 41.0773,
        longitude: 29.0431,
        tags: ["coastal", "cafe"]
      },
      {
        position: 2,
        name: "Rumeli Hisarı",
        address: "Yahya Kemal Caddesi, Sarıyer/İstanbul",
        latitude: 41.0843,
        longitude: 29.0562,
        tags: ["historical", "fortress", "scenic"]
      },
      {
        position: 3,
        name: "Emirgan Korusu",
        address: "Emirgan Mahallesi, Sarıyer/İstanbul",
        latitude: 41.1089,
        longitude: 29.0539,
        tags: ["park", "nature", "tulips"]
      }
    ],
    transitSegments: [
      {
        from_position: 0,
        to_position: 1,
        transit_type: "driving",
        distance_km: 3.2,
        duration_minutes: 8,
        notes: "Sahil yolu takip edilecek"
      },
      {
        from_position: 1,
        to_position: 2,
        transit_type: "driving",
        distance_km: 1.8,
        duration_minutes: 5,
        notes: "Boğaz kenarından"
      },
      {
        from_position: 2,
        to_position: 3,
        transit_type: "driving",
        distance_km: 4.5,
        duration_minutes: 12,
        notes: "Ana yoldan Emirgan'a"
      }
    ]
  },
  {
    name: "Kadıköy Çarşı Turu",
    routeDescription: "Kadıköy'ün en popüler meyhaneleri ve kafeleri",
    sessionDescription: "Kadıköy'de eğlenceli mekanları gezmek istiyorum",
    constraints: ["walking", "food"],
    routePoints: [
      {
        position: 0,
        name: "Kadıköy İskelesi",
        address: "Rıhtım Caddesi, Kadıköy/İstanbul",
        latitude: 40.9899,
        longitude: 29.0264,
        tags: ["ferry", "transport"]
      },
      {
        position: 1,
        name: "Çarşı Mahallesi",
        address: "Güneşlibahçe Sokak, Kadıköy/İstanbul",
        latitude: 40.9886,
        longitude: 29.0265,
        tags: ["food", "bars"]
      },
      {
        position: 2,
        name: "Moda Sahili",
        address: "Moda Caddesi, Kadıköy/İstanbul",
        latitude: 40.9834,
        longitude: 29.0293,
        tags: ["coastal", "park", "cafe"]
      }
    ],
    transitSegments: [
      {
        from_position: 0,
        to_position: 1,
        transit_type: "walking",
        distance_km: 0.4,
        duration_minutes: 6,
        notes: "İskeleden çarşıya"
      },
      {
        from_position: 1,
        to_position: 2,
        transit_type: "walking",
        distance_km: 1.2,
        duration_minutes: 15,
        notes: "Çarşıdan Moda'ya"
      }
    ]
  },
  {
    name: "Pendik - Maltepe Bisiklet Rotası",
    routeDescription: "Sahil boyunca bisiklet turu",
    sessionDescription: "Bisikletle sahil kenarında gezinti yapmak istiyorum",
    constraints: ["cycling", "coastal"],
    routePoints: [
      {
        position: 0,
        name: "Pendik Marina",
        address: "Güzelyalı Mahallesi, Pendik/İstanbul",
        latitude: 40.8753,
        longitude: 29.2482,
        tags: ["marina", "coastal"]
      },
      {
        position: 1,
        name: "Pendik Sahili",
        address: "Pendik Sahil Yolu, Pendik/İstanbul",
        latitude: 40.8689,
        longitude: 29.2378,
        tags: ["coastal", "park"]
      },
      {
        position: 2,
        name: "Maltepe Sahili",
        address: "Maltepe Sahil Parkı, Maltepe/İstanbul",
        latitude: 40.9276,
        longitude: 29.1452,
        tags: ["coastal", "park", "sports"]
      }
    ],
    transitSegments: [
      {
        from_position: 0,
        to_position: 1,
        transit_type: "cycling",
        distance_km: 2.5,
        duration_minutes: 12,
        notes: "Bisiklet yolu mevcut"
      },
      {
        from_position: 1,
        to_position: 2,
        transit_type: "cycling",
        distance_km: 8.7,
        duration_minutes: 35,
        notes: "Sahil bisiklet yolu"
      }
    ]
  },
  {
    name: "Taksim - Galata Yaya Turu",
    routeDescription: "İstiklal Caddesi ve Galata Kulesi gezisi",
    sessionDescription: "Taksim ve çevresini gezmek istiyorum",
    constraints: ["walking", "shopping"],
    routePoints: [
      {
        position: 0,
        name: "Taksim Meydanı",
        address: "Gümüşsuyu Mahallesi, Beyoğlu/İstanbul",
        latitude: 41.0369,
        longitude: 28.9857,
        tags: ["square", "transport"]
      },
      {
        position: 1,
        name: "İstiklal Caddesi",
        address: "İstiklal Caddesi, Beyoğlu/İstanbul",
        latitude: 41.0339,
        longitude: 28.9774,
        tags: ["shopping", "food", "entertainment"]
      },
      {
        position: 2,
        name: "Galata Kulesi",
        address: "Bereketzade Mahallesi, Galata Kulesi Sk., Beyoğlu/İstanbul",
        latitude: 41.0256,
        longitude: 28.9744,
        tags: ["historical", "tower", "scenic"]
      },
      {
        position: 3,
        name: "Karaköy",
        address: "Kemankeş Karamustafa Paşa Mahallesi, Beyoğlu/İstanbul",
        latitude: 41.0242,
        longitude: 28.9744,
        tags: ["coastal", "food", "hipster"]
      }
    ],
    transitSegments: [
      {
        from_position: 0,
        to_position: 1,
        transit_type: "walking",
        distance_km: 0.5,
        duration_minutes: 8,
        notes: "İstiklal Caddesi başlangıcı"
      },
      {
        from_position: 1,
        to_position: 2,
        transit_type: "walking",
        distance_km: 0.8,
        duration_minutes: 12,
        notes: "Galata'ya iniş"
      },
      {
        from_position: 2,
        to_position: 3,
        transit_type: "walking",
        distance_km: 0.4,
        duration_minutes: 6,
        notes: "Karaköy'e iniş"
      }
    ]
  }
];

async function populateRoutes(userId?: string) {
  try {
    console.log("🚀 Starting mock route population...\n");

    if (!userId) {
      console.log("⚠️  No user ID provided, checking for profiles in database...\n");
      
      // Get all users
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from("profiles")
        .select("id, username");

      if (allProfilesError) {
        console.error("❌ Error fetching profiles:", allProfilesError);
        throw allProfilesError;
      }

      if (allProfiles && allProfiles.length > 0) {
        console.log(`✅ Found ${allProfiles.length} user(s) in the database:`);
        allProfiles.forEach((profile, idx) => {
          console.log(`   ${idx + 1}. Username: ${profile.username}, ID: ${profile.id}`);
        });
        console.log("\n💡 To create routes for a specific user, edit the script and set:");
        console.log(`   const targetUserId = "${allProfiles[0].id}"; // ${allProfiles[0].username}\n`);
        
        // Use the first user
        userId = allProfiles[0].id;
        console.log(`📝 Using user: ${allProfiles[0].username} (${userId})\n`);
      } else {
        console.error("❌ No users found in profiles table");
        console.log("💡 Please make sure there are users registered in the app");
        process.exit(1);
      }
    } else {
      console.log(`📝 Using provided user ID: ${userId}\n`);
    }

    console.log("\n📝 Creating mock routes...\n");

    let successCount = 0;
    let errorCount = 0;

    for (const route of mockRoutes) {
      try {
        const { data, error } = await supabase.rpc("create_route", {
          p_user_id: userId,
          p_name: route.name,
          p_route_description: route.routeDescription,
          p_session_description: route.sessionDescription,
          p_constraints: route.constraints,
          p_route_points: route.routePoints,
          p_transit_segments: route.transitSegments,
        });

        if (error) {
          console.error(`  ❌ Failed to create "${route.name}":`, error.message);
          errorCount++;
        } else {
          console.log(`  ✅ Created "${route.name}" (ID: ${data})`);
          successCount++;
        }
      } catch (err: any) {
        console.error(`  ❌ Error creating "${route.name}":`, err.message);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✨ Done! Created ${successCount} routes`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} routes failed to create`);
    }
    console.log("=".repeat(60) + "\n");

  } catch (error: any) {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
  }
}

// Run the script
// OPTION 1: Set this to a specific user ID (you can get it from Supabase dashboard or after signing in)
// Example: const targetUserId = "123e4567-e89b-12d3-a456-426614174000";
const targetUserId: string | undefined = "5c58d2fe-db52-45bf-9121-aba155870a62"; 

// OPTION 2: Leave undefined to auto-detect the first user from the database

console.log("📚 Mock Route Population Script");
console.log("================================\n");
console.log("This script will create 5 sample routes in the database.\n");
console.log("To use this script:");
console.log("1. Sign in to the app first to create a user profile");
console.log("2. Or set targetUserId above to your user's UUID\n");
console.log("Starting...\n"); 

populateRoutes(targetUserId).then(() => {
  console.log("✅ Script completed successfully!");
  process.exit(0);
}).catch((error) => {
  console.error("❌ Script failed:", error);
  process.exit(1);
});
