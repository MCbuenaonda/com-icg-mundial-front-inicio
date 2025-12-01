import { Country } from './country.model';

export interface PlayerStats {
  player: string;
  country: Country;
  goals: number;
  assists: number;
}
