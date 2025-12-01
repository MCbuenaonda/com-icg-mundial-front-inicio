import { Country } from './country.model';

export interface Match {
  id: number;
  date: string;
  time: string;
  stadium: string;
  home: Country;
  away: Country;
  score?: { home: number; away: number };
  status: 'finished' | 'live' | 'upcoming';
  minute?: number;
}
