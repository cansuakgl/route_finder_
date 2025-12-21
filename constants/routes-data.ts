// Sample routes data for favorites display
// Note: This is a simplified interface for the UI layer
// Full route data should come from database using RouteDetails type

export interface Route {
  id: string;
  title: string;
  description: string;
  stops?: string[];  // Legacy: will be replaced with actual route_points from database
}

export const ROUTES: Route[] = [
  {
    id: 'a',
    title: 'Favori Rota 1',
    description: 'Kısa açıklama 1',
    stops: ['Pendik', 'Maltepe'],
  },
  {
    id: 'b',
    title: 'Favori Rota 2',
    description: 'Kısa açıklama 2',
    stops: ['Kadıköy', 'Üsküdar'],
  },
];
