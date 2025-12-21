export async function getLocationSuggestions(userQuery: string) {
  try {
    const response = await fetch(
      "https://twjeirfizttdnfanijpe.functions.supabase.co/location-suggestions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: userQuery }),
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase function error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Return exactly the same type as before: array of { name, address }
    return data.places as Array<{ name: string; address: string }>;
  } catch (err) {
    console.error("Failed to fetch location suggestions:", err);
    return []; // keep return type consistent on error
  }
}




