import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class StorageService {
  getToken(): string | null {
    return sessionStorage.getItem('token'); 
  }

  getApiKey(): string | null {
    return sessionStorage.getItem('apiKey'); 
  }

  getEmpresaId(): string  {
    const empresa_id = sessionStorage.getItem('empresa_id');
    return empresa_id || '';
  }

  getFiltros(): any {
    const filtros = sessionStorage.getItem('filtros');
    return filtros ? JSON.parse(filtros) : false;
  }

  setFiltros(filtros: any): void {
    sessionStorage.setItem('filtros', JSON.stringify(filtros));
  }

  deleteFiltros(): void {
    sessionStorage.removeItem('filtros');
  }

  getEmail(): string {
    return sessionStorage.getItem('email') || ''; 
  }


}