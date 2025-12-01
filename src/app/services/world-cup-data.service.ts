import { Injectable } from '@angular/core';
import { Country } from '../models/country.model';
import { Match } from '../models/match.model';
import { PlayerStats } from '../models/player-stats.model';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WorldCupDataService {
  getCountries(): Observable<Country[]> {
    // Mock data
    return of([
      { name: 'Argentina', flagUrl: 'assets/flags/arg.png', confederation: 'CONMEBOL' },
      { name: 'Brasil', flagUrl: 'assets/flags/bra.png', confederation: 'CONMEBOL' },
      // ...más países
    ]);
  }

  getMatches(): Observable<Match[]> {
    // Mock data
    return of([
      {
        id: 1,
        date: '2026-06-12',
        time: '18:00',
        stadium: 'Estadio A',
        home: { name: 'Argentina', flagUrl: 'assets/flags/arg.png', confederation: 'CONMEBOL' },
        away: { name: 'Brasil', flagUrl: 'assets/flags/bra.png', confederation: 'CONMEBOL' },
        score: { home: 2, away: 1 },
        status: 'finished',
      },
      // ...más partidos
    ]);
  }

  getPlayerStats(): Observable<PlayerStats[]> {
    // Mock data
    return of([
      { player: 'Messi', country: { name: 'Argentina', flagUrl: 'assets/flags/arg.png', confederation: 'CONMEBOL' }, goals: 5, assists: 2 },
      // ...más jugadores
    ]);
  }
}
