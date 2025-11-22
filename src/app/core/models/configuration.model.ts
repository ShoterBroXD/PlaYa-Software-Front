export interface UserConfiguration {
  // Perfil
  name: string;
  email: string;
  biography: string;
  
  // Reproducción
  calidadAudio: string;
  descargarWiFi: boolean;
  ahorroDatos: boolean;
  
  // Notificaciones
  notifNuevasCanciones: boolean;
  notifMensajes: boolean;
  notifRecordatorios: boolean;
  notifRecomendaciones: boolean;
  
  // Cuenta
  tipoCuenta: string;
  idiomaApp: 'Español' | 'Inglés' | 'Português';
  colorApp: string;
  
  // Privacidad
  perfilVisible: boolean;
  playlistVisible: boolean;
  historyVisible: boolean;
}

export interface ConfigurationChangeDetection {
  hasChanges: boolean;
  changedFields: string[];
}
