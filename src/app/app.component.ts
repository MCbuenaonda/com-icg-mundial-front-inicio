import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PipesModule } from './pipes/pipes.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from './services/session.storage.service';
import { ApiService } from './services/api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { WorldCupDataService } from './services/world-cup-data.service';
import { Country } from './models/country.model';
import { Match } from './models/match.model';
import { Partido } from '../interfaces/interfaces';
import { PlayerStats } from './models/player-stats.model';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    PipesModule,
    RouterModule
  ],
  providers: [StorageService, ApiService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Mundial Simulado 2026';

  countries: Country[] = [];
  matches: Match[] = [];
  playerStats: PlayerStats[] = [];

  currentPhase: string = '';
  qualifiedCount: string = '';
  nextEvent: string = '';
  dataliveMatch?: any;
  liveMatch?: any;
  recentResults: Partido[] = [];
  upcomingMatches: Partido[] = [];
  estado_torneo: any = null;

  minuto_en_vivo: number = 0;
  mensajeTiempo: string = '';
  tiempo_restante: number = 30;
  detalle_en_curso: any = null; // Información del partido en curso
  acciones_faltantes: any[] = []; // Acciones pendientes por mostrar
  acciones_en_vivo: any[] = []; //listado de acciones a mostrar en vivo
  accionActual: any = null; // Acción actual mostrada en el campo
  mostrarAnimacionTarjetaRoja: boolean = false;
  mostrarAnimacionVAR: boolean = false;
  mostrarAnimacionCambio: boolean = false;
  mostrarAnimacionLesion: boolean = false;
  jugadorSale: string = ''; // Para cambios
  jugadorEntra: string = ''; // Para cambios

  intervaloAcciones: any = null; // Referencia al intervalo para poder limpiarlo
  equipoRecibioGol: string = ''; // Para mostrar el balón en la portería
  mostrarAnimacionTarjetaAmarilla: boolean = false;
  equipoAccion: string = '';
  jugadorAccion: string = '';

  mostrarAnimacionGol: boolean = false; // Control de animación de gol
  equipoQueAnoto: string = '';
  jugadorQueAnoto: string = '';

  showScrollButton: boolean = false; // Control del botón scroll to top

  constructor(
    private apiService: ApiService,
    private storageService: StorageService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dataService: WorldCupDataService
  ) {
    // Escuchar evento de scroll
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.showScrollButton = window.pageYOffset > 300;
        this.cdr.detectChanges();
      });
    }
  }

  ngOnInit(): void {
    this.obtener_juegos();
    this.obtenerInformacionTorneo();
    this.obtenerGruposTorneo();
    this.setDashboardData();
  }

  // Datos de grupos recibidos desde el endpoint
  groupsInfo: any[] = [];

  obtenerGruposTorneo(): void {
    this.apiService.obtenerGruposTorneo().subscribe({
      next: (data: any[]) => {
        this.groupsInfo = [];        // data es un array de confederaciones con objeto 'grupos'
        const grupos = data;
        grupos.forEach(element => {
          // buscamos dentro de 'gruposInfo' si ya existe la confederación_id
          const existingGroup = this.groupsInfo.find(g => g.confederacion_id === element.confederacion_id);
          if (!existingGroup) {            
            this.groupsInfo.push(element);
          } else {
            //obtenemos el objeto con el confederacion_id encontrado
            const gruposExistentes = existingGroup.grupos;
            // si 'element.fase_id' > 'existingGroup.fase_id', borramos el objeto del array 'this.groupsInfo' y agregamos el nuevo 'element' al array
            if (element.fase_id > existingGroup.fase_id) {
              const index = this.groupsInfo.indexOf(existingGroup);
              if (index > -1) {
                this.groupsInfo.splice(index, 1);
              }
              this.groupsInfo.push(element);
            }
          }
        });
        
        console.log('Grupos del torneo:', this.groupsInfo);
      },
      error: (err: any) => {
        console.error('Error al obtener grupos:', err);
      }
    });
  }

  getSortedTeams(gruposObj: any, groupName: any) {
    if (!gruposObj || !gruposObj[groupName]) return [];
    // Clonar y ordenar por puntos descendente, luego por diferencia de goles
    return [...gruposObj[groupName]].sort((a: any, b: any) => {
      const diff = (b.puntos || 0) - (a.puntos || 0);
      if (diff !== 0) return diff;
      const dgA = (a.gf || 0) - (a.gc || 0);
      const dgB = (b.gf || 0) - (b.gc || 0);
      return dgB - dgA;
    });
  }

  obtener_juegos(): void {
    this.apiService.obtenerJuegos().subscribe({
      next: (data: any) => {
        console.log('data_obtener_juegos', data);

        this.recentResults = data.ultimos_partidos;
        this.upcomingMatches = data.proximos_partidos;
        this.dataliveMatch = data.partido_en_vivo;
        this.estado_torneo = data.estado_del_torneo;
        this.cargarDetallesPartido(this.dataliveMatch._id);
        this.setDashboardData(this.estado_torneo);
        console.log('Juegos finalizados obtenidos:', this.recentResults);
      },
      error: (error: any) => {
        console.error('Error al obtener juegos finalizados:', error);
        Swal.fire('Error', 'No se pudieron obtener los juegos finalizados.', 'error');
      }
    });
  }

  obtenerInformacionTorneo(): void {
    this.apiService.obtenerGruposTorneo().subscribe({
      next: (data: Partido[]) => {
        console.log('Información del torneo obtenida:', data);
      },
      error: (error: any) => {
        console.error('Error al obtener información del torneo:', error);
        Swal.fire('Error', 'No se pudo obtener la información del torneo.', 'error');
      }
    });
  }

  setDashboardData(estado_torneo: any = null): void {
    console.log('estado torneo', estado_torneo);
    this.currentPhase = estado_torneo ? estado_torneo.fase_actual : 'Fase de Grupos';
    const num_paises = estado_torneo ? estado_torneo.paises_clasificados : '0';
    this.qualifiedCount = `0/${num_paises} Países Clasificados`;
    this.nextEvent = 'Sorteo de Grupos';
    //this.liveMatch = this.matches.find(m => m.status === 'live');
    // this.recentResults = this.matches.filter(m => m.status === 'finished').slice(-7).reverse();
    // this.upcomingMatches = this.matches.filter(m => m.status === 'upcoming').slice(0, 7);
  }

  getBanderaUrl(iso: string): string {
    // Usando la API de banderas de CountryFlags
    return `https://flagcdn.com/w40/${iso.toLowerCase()}.png`;
  }

  cargarDetallesPartido(_id: string): void {
    this.apiService.verPartido(_id).subscribe({
      next: (data: Partido) => {
        this.liveMatch = data;
        console.log('liveMatch', this.liveMatch);

        this.minuto_en_vivo = data.resultado?.minuto || 0;
        console.log('Detalles del partido en vivo:', this.liveMatch);
        const array_tiempo_mensaje = this.liveMatch.tiempo_restante != null ? this.liveMatch.tiempo_restante.split('\n') : null;
        this.mensajeTiempo = array_tiempo_mensaje != null ? array_tiempo_mensaje[1] : '';
        const textoModificado = this.mensajeTiempo.replace('Tiempo restante', 'Inicio de partido en');
        console.log('Mensaje tiempo:', textoModificado);

        this.liveMatch.ubicacion.pais = this.liveMatch.equipo_local.nombre || 'Desconocido';

        const regexMinutos = /,\s*(\d+)\s*minutos/;
        const matchMinutos = textoModificado.match(regexMinutos);

        // 4. Extraer el valor de los segundos
        const regexSegundos = /y\s*(\d+)\s*segundos./;
        const matchSegundos = textoModificado.match(regexSegundos);

        let minutosRestantes = 0;
        let segundosRestantes = 0;

        if (matchMinutos && matchMinutos[1]) {
          this.tiempo_restante = parseInt(matchMinutos[1], 10);
        }

        if (matchSegundos && matchSegundos[1]) {
          // Extraer los segundos del texto
          segundosRestantes = parseInt(matchSegundos[1], 10);
          console.log('Segundos restantes:', segundosRestantes);
        }

        // Procesar detalle en curso si existe
        // En la nueva estructura, los datos están en la raíz del objeto
        if (data && this.liveMatch.estado === 'jugando') {
          // Construir el objeto detalleEnCurso con los datos de la raíz
          this.detalle_en_curso = {
            equipo_local: this.liveMatch.detalle_en_curso.equipo_local,
            equipo_visitante: this.liveMatch.detalle_en_curso.equipo_visitante,
            goles_local: this.liveMatch.detalle_en_curso.goles_local || 0,
            goles_visitante: this.liveMatch.detalle_en_curso.goles_visitante || 0,
            descripcion_asistencia: this.liveMatch.detalle_en_curso.descripcion_asistencia || null,
            acciones: this.liveMatch.detalle_en_curso.acciones || []
          };
          const accionesCompletas = this.liveMatch.detalle_en_curso.acciones || [];
          const num_acciones = accionesCompletas.length;
          const total_segundos = 1800; // 30 minutos * 60 segundos
          const milisegundos_por_accion = (total_segundos / num_acciones) * 1000;
          console.log('segundos_por_accion', Math.round(milisegundos_por_accion));

          const segundos_restantes = total_segundos - ((this.tiempo_restante * 60) + segundosRestantes);
          const indice_max_acciones = Math.floor((segundos_restantes * num_acciones) / total_segundos);

          // Obtener acciones a mostrar y faltantes SIN invertir
          const acciones_a_mostrar = accionesCompletas.slice(0, indice_max_acciones);
          this.acciones_faltantes = accionesCompletas.slice(indice_max_acciones, num_acciones);

          console.log('Acciones faltantes:', this.acciones_faltantes);
          console.log('Acciones a mostrar inicialmente:', acciones_a_mostrar);

          // Invertir solo las acciones a mostrar para que se vean de más reciente a más antigua
          this.acciones_en_vivo = [...acciones_a_mostrar].reverse();

          console.log('tiempo restante:', this.tiempo_restante);
          this.minuto_en_vivo = this.acciones_en_vivo.length > 0 ? this.acciones_en_vivo[0].minuto : 0;

          // Establecer la acción actual para el campo
          this.accionActual = this.acciones_en_vivo.length > 0 ? this.acciones_en_vivo[0] : null;

          // Calcular los goles reales basados en las acciones en vivo mostradas
          this.actualizarMarcadorEnVivo();

          console.log('Detalle en curso:', this.detalle_en_curso);
          console.log(`Acciones en vivo cargadas: ${this.acciones_en_vivo.length}`);
          console.log(`Minuto en vivo: ${this.minuto_en_vivo}`);
          console.log(`Marcador en vivo - Local: ${this.detalle_en_curso.goles_local}, Visitante: ${this.detalle_en_curso.goles_visitante}`);

          // Iniciar animación de acciones
          this.iniciarAnimacionAcciones(Math.round(milisegundos_por_accion));
        }
      },
      error: (error: any) => {
        console.error('Error al obtener detalles del partido:', error);
        Swal.fire('Error', 'No se pudieron obtener los detalles del partido en vivo.', 'error');
      }
    });
  }

  actualizarMarcadorEnVivo(): void {
    if (!this.detalle_en_curso || !this.acciones_en_vivo) return;

    // Contar goles por equipo basándose en las acciones mostradas en vivo
    let golesLocal = 0;
    let golesVisitante = 0;

    // Obtener nombres de equipos
    const nombreLocal = this.detalle_en_curso.equipo_local;
    const nombreVisitante = this.detalle_en_curso.equipo_visitante;

    // Iterar sobre las acciones en vivo y contar los goles
    this.acciones_en_vivo.forEach((accion: any) => {
      if (accion.tipo.toLowerCase() === 'gol') {
        // Comparar el equipo de la acción con los equipos del partido
        if (accion.equipo === nombreLocal) {
          golesLocal++;
        } else if (accion.equipo === nombreVisitante) {
          golesVisitante++;
        }
      }
    });

    // Actualizar el marcador del detalle en curso
    this.detalle_en_curso.goles_local = golesLocal;
    this.detalle_en_curso.goles_visitante = golesVisitante;
  }

  iniciarAnimacionAcciones(milisegundos_por_accion: number): void {
    // Limpiar intervalo anterior si existe
    if (this.intervaloAcciones) {
      clearInterval(this.intervaloAcciones);
    }

    console.log(`Iniciando animación con intervalo de ${milisegundos_por_accion} milisegundos por acción`);
    console.log(`Acciones faltantes: ${this.acciones_faltantes.length}`);

    // Crear intervalo para agregar acciones progresivamente
    this.intervaloAcciones = setInterval(() => {
      if (this.acciones_faltantes.length > 0) {
        // Tomar la primera acción de las faltantes (que está en orden cronológico)
        const nuevaAccion = this.acciones_faltantes.shift();

        if (nuevaAccion) {
          // Insertar al inicio del array de acciones en vivo (para mostrar las más recientes primero)
          this.acciones_en_vivo.unshift(nuevaAccion);

          // Actualizar la acción actual para la animación del campo
          this.accionActual = nuevaAccion;

          // Actualizar el minuto en vivo con la acción más reciente (primera en el array)
          this.minuto_en_vivo = this.acciones_en_vivo[0].minuto;

          // Mostrar animaciones especiales según el tipo de acción
          const tipoAccion = nuevaAccion.tipo.toLowerCase();

          if (tipoAccion === 'gol') {
            this.actualizarMarcadorEnVivo();
            this.mostrarCelebracionGol(nuevaAccion);
            // } else if (tipoAccion === 'atajada') {
            //   this.mostrarAnimacionAtajada(nuevaAccion);
          } else if (tipoAccion === 'tarjeta amarilla') {
            this.mostrarAnimacionTarjetaAmarillaFn(nuevaAccion);
          } else if (tipoAccion === 'tarjeta roja' || tipoAccion === 'tarjeta doble amarilla') {
            this.mostrarAnimacionTarjetaRojaFn(nuevaAccion);
          } else if (tipoAccion === 'revisión var') {
            this.mostrarAnimacionVARFn(nuevaAccion);
          } else if (tipoAccion === 'cambio') {
            this.mostrarAnimacionCambioFn(nuevaAccion);
          } else if (tipoAccion === 'lesión') {
            this.mostrarAnimacionLesionFn(nuevaAccion);
          }

          console.log(`Nueva acción agregada - Minuto: ${nuevaAccion.minuto}, Tipo: ${nuevaAccion.tipo}, Sector: ${nuevaAccion.sector}`);
          console.log(`Acciones restantes: ${this.acciones_faltantes.length}`);

          // Forzar detección de cambios para actualizar la vista
          this.cdr.detectChanges();
        }
      } else {
        // No hay más acciones, detener el intervalo
        console.log('Todas las acciones han sido mostradas');
        clearInterval(this.intervaloAcciones);
        this.intervaloAcciones = null;
      }
    }, milisegundos_por_accion); // milisegundos
  }

  getUltimasAcciones(cantidad: number): any[] {
    return this.acciones_en_vivo.slice(0, cantidad);
  }

  // Métodos auxiliares para detalle en curso
  getTipoClass(tipo: string): string {
    const tipoLower = tipo.toLowerCase().replace(/\s+/g, '-');
    return tipoLower;
  }

  getTipoIcon(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'gol': '⚽',
      'tiro': '🦵',
      'atajada': '🧤',
      'poste': '🥅',
      'desviado': '↗️',
      'bloqueado': '🛡️',
      'córner': '🚩',
      'corner': '🚩',
      'tarjeta amarilla': '🟨',
      'tarjeta roja': '🟥',
      'tarjeta doble amarilla': '🟨🟨',
      'asistencia': '👟',
      'falta': '⚠️',
      'tiro a puerta': '🎯',
      'tiro desviado': '↗️',
      'penal': '⚽🎯',
      'cambio': '🔄',
      'saque de banda': '↔️',
      'lesión': '🚑',
      'pase': '👣',
      'intercepción': '✋',
      'regate': '💨',
      'centro': '↪️',
      'entrada': '🦶',
      'despeje': '👊',
      'presión': '💪',
      'fuera de juego': '🚩',
      'revisión var': '📺',
      'señalización árbitro': '👨‍⚖️',
      'inicio': '⏱️',
      'descanso': '⏸️',
      'final': '🏁'
    };
    return iconos[tipo.toLowerCase()] || '⚪';
  }

  mostrarCelebracionGol(accion: any): void {
    this.equipoQueAnoto = accion.equipo;
    this.jugadorQueAnoto = accion.jugador;
    this.mostrarAnimacionGol = true;

    // Determinar qué equipo recibió el gol (el contrario al que anotó)
    if (this.equipoQueAnoto === this.detalle_en_curso.equipo_local) {
      this.equipoRecibioGol = 'visitante';
    } else {
      this.equipoRecibioGol = 'local';
    }

    // Mostrar balón en portería
    //this.mostrarBalonPorteria = true;

    // Ocultar la animación después de 2.5 segundos (reducido de 4)
    setTimeout(() => {
      this.mostrarAnimacionGol = false;
      this.cdr.detectChanges();
    }, 2500);

    // Ocultar el balón en la portería después de 3.5 segundos
    setTimeout(() => {
      //this.mostrarBalonPorteria = false;
      this.equipoRecibioGol = '';
      this.cdr.detectChanges();
    }, 3500);
  }

  mostrarAnimacionTarjetaAmarillaFn(accion: any): void {
    this.equipoAccion = accion.equipo;
    this.jugadorAccion = accion.jugador;
    this.mostrarAnimacionTarjetaAmarilla = true;

    setTimeout(() => {
      this.mostrarAnimacionTarjetaAmarilla = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  mostrarAnimacionTarjetaRojaFn(accion: any): void {
    this.equipoAccion = accion.equipo;
    this.jugadorAccion = accion.jugador;
    this.mostrarAnimacionTarjetaRoja = true;

    setTimeout(() => {
      this.mostrarAnimacionTarjetaRoja = false;
      this.cdr.detectChanges();
    }, 2500);
  }

  mostrarAnimacionVARFn(accion: any): void {
    this.equipoAccion = accion.equipo || '';
    this.jugadorAccion = accion.jugador || 'Árbitro';
    this.mostrarAnimacionVAR = true;

    setTimeout(() => {
      this.mostrarAnimacionVAR = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  mostrarAnimacionCambioFn(accion: any): void {
    this.equipoAccion = accion.equipo;
    // Extraer jugadores del formato "Cambio en [Equipo]: Sale [Jugador], entra [Jugador] (...)"
    const descripcion = accion.descripcion || '';
    const salePart = descripcion.match(/Sale\s+([^,]+),/i);
    const entraPart = descripcion.match(/entra\s+([^(]+)\(/i);

    this.jugadorSale = salePart ? salePart[1].trim() : accion.jugador;
    this.jugadorEntra = entraPart ? entraPart[1].trim() : '';
    this.mostrarAnimacionCambio = true;

    setTimeout(() => {
      this.mostrarAnimacionCambio = false;
      this.cdr.detectChanges();
    }, 2500);
  }

  mostrarAnimacionLesionFn(accion: any): void {
    this.equipoAccion = accion.equipo;
    this.jugadorAccion = accion.jugador;
    this.mostrarAnimacionLesion = true;

    setTimeout(() => {
      this.mostrarAnimacionLesion = false;
      this.cdr.detectChanges();
    }, 2500);
  }

  isTeamPlaying(teamName: string): boolean {
    if (!this.liveMatch) return false;
    return this.liveMatch.equipo_local?.nombre === teamName ||
      this.liveMatch.equipo_visitante?.nombre === teamName;
  }

  scrollToGroups(confederacion_id: number, grupo: string): void {
    const element = document.getElementById('confederacion-' + confederacion_id + '-' + grupo);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToLive(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}