// Sample routes data

export interface Route {
  id: string;
  title: string;
  description: string;
  stops?: string[];
  coords?: [number, number];
  lockStatus?: string | null;
  transportToNext?: string;
  transportProfile?: string;
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
