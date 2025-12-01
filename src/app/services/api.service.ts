import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { StorageService } from './session.storage.service';
import { environment } from '../../environments/environment';
import { Partido } from '../../interfaces/interfaces';

console.log('Modo Producción:', environment.production);
console.log('URL de API Partido:', environment.apiPartidoBaseUrl);

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private partidoApiUrl = environment.apiPartidoBaseUrl;
  private coreApiUrl = environment.apiCoreBaseUrl;
  private apiKey = 'b480eab3-5544-4a6b-ae34-b5e7e93ead60';

  constructor(private http: HttpClient, private storageService: StorageService) { }

  /**
   * Headers comunes para las peticiones a la API
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'api-key': this.apiKey,
      'Content-Type': 'application/json'
    });
  }

  obtenerJuegos(): Observable<any> {
    const url = `${this.partidoApiUrl}/api/v1/obtener-partidos-inicio`;
    return this.http.get<any>(url, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  obtenerGruposTorneo(): Observable<any[]> {
    const url = `${this.coreApiUrl}/api/v1/obtener-informacion-torneo`;
    return this.http.get<any[]>(url, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  verPartido(partidoId: string): Observable<any> {
    const url = `${this.partidoApiUrl}/api/v1/ver-partido/${partidoId}`;
    return this.http.get<any>(url, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }
  
  /**
   * Manejo de errores para las peticiones HTTP
   * @param error Error de la petición HTTP
   * @returns Observable con el error
   */
  private handleError(error: any): Observable<never> {
    console.error('Error en la petición API:', error);
    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }

}


