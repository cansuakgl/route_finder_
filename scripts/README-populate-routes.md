# Mock Route Population Script

This script populates your database with sample route data for testing the explore screen.

## 🎯 What It Does

Creates 5 sample routes with realistic Istanbul locations:
1. **İstanbul Tarihi Yerler Turu** - Historical places (Sultanahmet, Ayasofya, Topkapı)
2. **Boğaz Turu** - Bosphorus scenic drive (Ortaköy, Bebek, Rumeli Hisarı)
3. **Kadıköy Çarşı Turu** - Kadıköy food and entertainment district
4. **Pendik - Maltepe Bisiklet Rotası** - Coastal cycling route
5. **Taksim - Galata Yaya Turu** - Walking tour (Taksim, İstiklal, Galata Tower)

Each route includes:
- Multiple route points with coordinates
- Transit segments connecting the points
- Distance and duration data
- Descriptive tags and notes

## 📋 Prerequisites

Before running this script, you need to:

1. **Have a user in the database**
   - Sign in to the app at least once
   - This creates a profile in the `profiles` table

2. **Get your User ID** (Optional - script auto-detects if not provided)
   - From Supabase Dashboard → Authentication → Users
   - Or check the `profiles` table in Database

## 🚀 How to Run

### Option 1: Auto-detect User (Easiest)

```bash
npm run populate-routes
```

The script will automatically find users in your database and use the first one.

### Option 2: Specify User ID

Edit `scripts/populate-mock-routes.ts` and set your user ID:

```typescript
const targetUserId = "your-user-uuid-here";
```

Then run:

```bash
npm run populate-routes
```

## 📊 Expected Output

```
🚀 Starting mock route population...

✅ Found 1 user(s) in the database:
   1. Username: cansuakgul327, ID: abc-123-def-456

📝 Using user: cansuakgul327 (abc-123-def-456)

📝 Creating mock routes...

  ✅ Created "İstanbul Tarihi Yerler Turu" (ID: route-uuid-1)
  ✅ Created "Boğaz Turu" (ID: route-uuid-2)
  ✅ Created "Kadıköy Çarşı Turu" (ID: route-uuid-3)
  ✅ Created "Pendik - Maltepe Bisiklet Rotası" (ID: route-uuid-4)
  ✅ Created "Taksim - Galata Yaya Turu" (ID: route-uuid-5)

============================================================
✨ Done! Created 5 routes
============================================================

✅ Script completed successfully!
```

## 🛠️ Troubleshooting

### "No users found in profiles table"

**Solution:** Sign in to the app first. The app creates a profile when you sign in.

### "column profiles.email does not exist"

This was fixed - the script now uses `username` field instead of `email`.

### Module warnings

The warnings about module type are harmless and can be ignored. To remove them, add `"type": "module"` to `package.json` (not recommended for React Native projects).

## 🗑️ Cleaning Up

To delete the test routes:

1. Go to Supabase Dashboard
2. Navigate to Table Editor → `routes`
3. Filter by your user_id
4. Delete the test routes

Or write a cleanup script if needed!

## 📝 Customization

You can edit the `mockRoutes` array in the script to:
- Add more routes
- Change locations
- Modify route descriptions
- Adjust transit types (walking, driving, cycling, public_transport)
- Update distance/duration values

## 🎨 After Running

After successfully running the script:
1. Open the app
2. Navigate to the "Explore" tab (Kaydedilen Rotalarım)
3. You should see all 5 routes with metrics
4. Click "Düzenle" to edit a route
5. Click "Haritada Gör" to view it on the map

Enjoy testing! 🎉
