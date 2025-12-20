// LLM service for route recommendations

interface LockedLocation {
  id: string;
  title: string;
  coords?: [number, number];
  lockStatus?: string | null;
}

interface RouteRecommendation {
  id: string;
  title: string;
  description: string;
  transportToNext?: string;
  transportProfile?: string;
}

interface LLMResponse {
  routeName: string;
  recommendations: RouteRecommendation[];
}

export const fetchLlmRecommendation = async (
  userPrompt: string,
  lockedLocations: LockedLocation[] = []
): Promise<LLMResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Split the prompt by comma and clean up the names
  // Example: "Pendik YHT, Maltepe Meydan" -> ["Pendik YHT", "Maltepe Meydan"]
  const names = userPrompt
    .split(',')
    .map(name => name.trim())
    .filter(name => name.length > 0);

  const recommendations: RouteRecommendation[] = names.map((name) => ({
    id: Math.random().toString(36).substr(2, 9),
    title: name,
    description: `${name} için oluşturulan durak.`,
    transportToNext: 'Araba',
    transportProfile: 'driving'
  }));

  return {
    routeName: `${userPrompt} Rotası`,
    recommendations
  };
};
