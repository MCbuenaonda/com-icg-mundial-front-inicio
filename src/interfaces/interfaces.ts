// Interfaces para la API de partidos
export interface Equipo {
  _id: string;
  id: number;
  nombre: string;
  siglas: string;
  iso: string;
  federacion: string;
  confederacion_id: number;
  valor: number;
  p_ofensiva?: number;
  p_defensiva?: number;
  p_posesion?: number;
  tactica_id?: number;
  poder?: number;
  efectividad_gol?: number;
  promedio_gol?: number;
  user_id?: number;
  rankin?: number;
  puntos?: number;
  jj?: number;
  jg?: number;
  je?: number;
  jp?: number;
  gf?: number;
  gc?: number;
  lat?: number;
  lng?: number;
}

export interface Ubicacion{
  id: number;
  nombre: string;
  tipo: string;
  fecha: string;
  estadio: string;
  pais_id: number;
}

export interface Partido {
  _id: string;
  confederacion_id: number;
  equipo_local: Equipo;
  equipo_visitante: Equipo;
  estado: string;
  fase_id: number;
  fecha: string;
  fecha_completa: string;
  fecha_hora_str: string;
  grupo: string;
  hora: string;
  jornada: string;
  mundial_id: number;
  tipo: string;
  tag: string;
  resultado: any;
  ubicacion: Ubicacion;
}

// export Interface para la información del mundial
export interface Mundial {
  _id: string;
  activo: boolean;
  anio: number;
  botin: any | null;
  campeon: any | null;
  dc: any | null;
  dfd: any | null;
  dfi: any | null;
  ed: any | null;
  ei: any | null;
  ld: any | null;
  li: any | null;
  mc: any | null;
  md: any | null;
  mi: any | null;
  pais: {
    _id: string;
    confederacion_id: number;
    efectividad_gol: number;
    federacion: string;
    gc: number;
    gf: number;
    id: number;
    iso: string;
    je: number;
    jg: number;
    jj: number;
    jp: number;
    lat: number;
    lng: number;
    nombre: string;
    p_defensiva: number;
    p_ofensiva: number;
    p_posesion: number;
    poder: number;
    promedio_gol: number;
    puntos: number;
    rankin: number;
    siglas: string;
    tactica_id: number;
    user_id: number;
    valor: number;
  };
  pais_id: number;
  por: any | null;
}

export interface MundialResponse {
  juegos: Partido[];
  mundial?: Mundial;
}
// Interfaces para Usuario
export interface Usuario {
  _id:  string;
  username: string;
  monto: number;
  activo: boolean;
  nombre: string;
  manager?: Manager;
}

// Interfaces para Medallas
export interface Medalla {
  _id: string;
  id: string;
  nombre: string;
  descripcion: string;
  medalla: 'Bronce' | 'Plata' | 'Oro' | 'Platino';
  pc_recompensa: number;
}

export interface MedallaUsuario {
  medalla: Medalla;
  visto: boolean;
}

export interface MedallasUsuarioResponse {
  _id: {
    $oid: string;
  };
  username: string;
  medallas: MedallaUsuario[];
  cartas: ColeccionablesUsuario;
  apuestas: any[];
}

// Interfaces para Coleccionables
export interface Confederacion {
  _id?: string;
  id: number;
  nombre: string;
  siglas: string;
  desbloqueado: boolean;
}

export interface Pais {
  _id?: string;
  id: number;
  nombre: string;
  iso: string;
  confederacion_id: number;
  desbloqueado: boolean;
}

export interface Ciudad {
  _id?: string;
  id: number;
  nombre: string;
  pais_id: number;
  estadio: string;
  desbloqueado: boolean;
}

export interface Jugador {
  _id?: string;
  id: number;
  nombre: string;
  posicion: string;
  pais_id: number;
  numero: number;
  desbloqueado: boolean;
}

export interface ColeccionablesUsuario {
  confederacion: Confederacion[];
  pais: Pais[];
  ciudades: Ciudad[];
  jugadores: Jugador[];
}

// Interfaces para Manager
export interface PaisManager {
  pais_id: number;
  nombre: string;
  iso: string;
  confederacion_id: number;
  precio_compra: number;
  valor_actual: number;
  fecha_compra: string;
  ganancia_acumulada: number;
  partidos_jugados: number;
  estado: string;
}

export interface TransaccionManager {
  tipo: 'compra' | 'venta' | 'apuesta' | 'ganancia_apuesta';
  // Campos para compra/venta de países
  pais_id?: number;
  pais_nombre?: string;
  ganancia?: number;
  // Campos para apuestas
  apuesta_id?: string;
  partido_id?: string;
  tipo_apuesta?: 'local' | 'visitante' | 'empate';
  // Común a todos
  monto: number;
  fecha: string;
}

export interface EstadisticasManager {
  total_ganado: number;
  total_perdido: number;
  partidos_jugados: number;
  victorias: number;
  empates: number;
  derrotas: number;
}

export interface Apuesta {
  _id: string;
  apuesta_id: string;
  username: string;
  partido_id: string;
  partido_nombre: string;
  tipo_apuesta: 'local' | 'visitante' | 'empate';
  monto: number;
  cuota: number;
  ganancia_potencial: number;
  estado: 'activa' | 'ganada' | 'perdida';
  fecha_apuesta: string;
  fecha_resultado?: string | null;
  ganancia_real: number;
  resultado_partido?: 'local' | 'visitante' | 'empate';
}

export interface Manager {
  _id: string;
  username: string;
  saldo: number;
  paises: PaisManager[];
  historial_transacciones: TransaccionManager[];
  estadisticas: EstadisticasManager;
  fecha_creacion: string;
}
