import { Component, signal, computed, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { UserConfiguration } from '../../core/models/configuration.model';
import { TranslationService } from '../../core/services/translation.service';
import { TranslateModule } from '@ngx-translate/core';
import { MusicPreferencesComponent } from './components/music-preferences/music-preferences.component';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, ChangePasswordComponent, MusicPreferencesComponent, TranslateModule],
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css'],
})
export class ConfigurationComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private translationService = inject(TranslationService);

  // Datos del usuario actual
  userId: number | null = null;
  usuario = 'NombreUsuario';
  correo = 'usuario@example.com';
  biografia = '';

  // Configuraciones de reproducción
  calidadAudio = 'Baja';
  descargarWiFi = true;
  ahorroDatos = true;

  // Configuraciones de notificaciones
  notifNuevasCanciones = true;
  notifMensajes = true;
  notifRecordatorios = true;
  notifRecomendaciones = true;

  // Configuraciones de cuenta
  tipoCuenta = 'Oyente';
  idiomaApp: 'Español' | 'Inglés' | 'Português' = 'Español';
  colorApp = 'Claro';

  // Configuraciones de privacidad
  perfilVisible = false;
  playlistVisible = true;
  historyVisible = true;

  // Control de estado
  showPasswordOverlay = signal(false);
  showPreferencesOverlay = signal(false);
  isSaving = signal(false);
  saveMessage = signal<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  hasUnsavedChanges = signal(false);

  // Configuración inicial (para detectar cambios)
  private initialConfig: UserConfiguration | null = null;

  ngOnInit(): void {
    this.loadUserData();
  }

  /**
   * Cargar datos del usuario actual desde el AuthService y el backend
   */
  private loadUserData(): void {
    const userId = this.authService.getUserId();

    if (!userId) {
      console.error('No se pudo obtener el ID del usuario');
      return;
    }

    this.userId = userId;

    // Cargar información completa del usuario
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        this.usuario = user.name;
        this.correo = user.email;
        this.biografia = user.biography || '';
        this.idiomaApp = user.language as 'Español' | 'Inglés' | 'Português';
        this.historyVisible = user.historyVisible;
        this.tipoCuenta = user.type === 'ARTIST' ? 'Artista' : 'Oyente';

        // Guardar configuración inicial para detectar cambios
        this.saveInitialConfig();
      },
      error: (error) => {
        console.error('Error al cargar datos del usuario:', error);
        this.showMessage('error', 'Error al cargar la configuración');
      }
    });
  }

  /**
   * Guardar la configuración inicial para comparación
   */
  private saveInitialConfig(): void {
    this.initialConfig = {
      name: this.usuario,
      email: this.correo,
      biography: this.biografia,
      calidadAudio: this.calidadAudio,
      descargarWiFi: this.descargarWiFi,
      ahorroDatos: this.ahorroDatos,
      notifNuevasCanciones: this.notifNuevasCanciones,
      notifMensajes: this.notifMensajes,
      notifRecordatorios: this.notifRecordatorios,
      notifRecomendaciones: this.notifRecomendaciones,
      tipoCuenta: this.tipoCuenta,
      idiomaApp: this.idiomaApp,
      colorApp: this.colorApp,
      perfilVisible: this.perfilVisible,
      playlistVisible: this.playlistVisible,
      historyVisible: this.historyVisible
    };
  }

  /**
   * Detectar si hay cambios sin guardar
   * US-019 Escenario 03: Falta de cambios
   */
  private detectChanges(): boolean {
    if (!this.initialConfig) return false;

    const currentConfig: UserConfiguration = {
      name: this.usuario,
      email: this.correo,
      biography: this.biografia,
      calidadAudio: this.calidadAudio,
      descargarWiFi: this.descargarWiFi,
      ahorroDatos: this.ahorroDatos,
      notifNuevasCanciones: this.notifNuevasCanciones,
      notifMensajes: this.notifMensajes,
      notifRecordatorios: this.notifRecordatorios,
      notifRecomendaciones: this.notifRecomendaciones,
      tipoCuenta: this.tipoCuenta,
      idiomaApp: this.idiomaApp,
      colorApp: this.colorApp,
      perfilVisible: this.perfilVisible,
      playlistVisible: this.playlistVisible,
      historyVisible: this.historyVisible
    };

    return JSON.stringify(currentConfig) !== JSON.stringify(this.initialConfig);
  }

  /**
   * Guardar todos los cambios de configuración
   * US-019 Escenario 02: Guardar cambios
   * US-019 Escenario 03: Falta de cambios
   */
  guardarCambios(): void {
    // Escenario 03: Verificar si hay cambios
    if (!this.detectChanges()) {
      this.showMessage('info', 'No hay cambios para guardar');
      return;
    }

    if (!this.userId) {
      this.showMessage('error', 'No se pudo identificar al usuario');
      return;
    }

    this.isSaving.set(true);
    let successCount = 0;
    let totalRequests = 0;

    // Actualizar perfil básico
    const profileChanged =
      this.usuario !== this.initialConfig?.name ||
      this.correo !== this.initialConfig?.email ||
      this.biografia !== this.initialConfig?.biography;

    if (profileChanged) {
      totalRequests++;
      this.userService.updateUserProfile(this.userId, {
        name: this.usuario,
        email: this.correo,
        biography: this.biografia
      }).subscribe({
        next: () => {
          successCount++;
          this.checkSaveCompletion(successCount, totalRequests);
        },
        error: (error) => {
          console.error('Error al actualizar perfil:', error);
          this.showMessage('error', 'Error al actualizar el perfil');
          this.isSaving.set(false);
        }
      });
    }

    // US-019 Escenario 01: Actualizar idioma
    if (this.idiomaApp !== this.initialConfig?.idiomaApp) {
      totalRequests++;
      // Usar el servicio de traducción para aplicar el cambio inmediatamente
      this.translationService.saveLanguagePreference(this.idiomaApp).subscribe({
        next: () => {
          successCount++;
          this.checkSaveCompletion(successCount, totalRequests);
        },
        error: (error) => {
          console.error('Error al actualizar idioma:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.error?.message || error.message);
          console.error('Error details:', error.error);
          this.showMessage('error', 'Error al actualizar el idioma');
          this.isSaving.set(false);
        }
      });
    }

    // US-019 Escenario 01: Actualizar privacidad (historial visible)
    if (this.historyVisible !== this.initialConfig?.historyVisible) {
      totalRequests++;
      this.userService.updateHistoryVisibility(this.userId, this.historyVisible).subscribe({
        next: () => {
          successCount++;
          this.checkSaveCompletion(successCount, totalRequests);
        },
        error: (error) => {
          console.error('Error al actualizar privacidad:', error);
          this.showMessage('error', 'Error al actualizar la privacidad');
          this.isSaving.set(false);
        }
      });
    }

    // Si no hubo cambios en campos con backend
    if (totalRequests === 0) {
      this.showMessage('info', 'No hay cambios para guardar');
      this.isSaving.set(false);
    }
  }

  /**
   * Verificar si todas las peticiones se completaron
   */
  private checkSaveCompletion(successCount: number, totalRequests: number): void {
    if (successCount === totalRequests) {
      // US-019 Escenario 02: Los cambios se aplican de inmediato
      this.showMessage('success', 'Cambios guardados exitosamente');
      this.saveInitialConfig(); // Actualizar configuración base
      this.hasUnsavedChanges.set(false);
      this.isSaving.set(false);
    }
  }

  /**
   * Mostrar mensaje temporal
   */
  private showMessage(type: 'success' | 'error' | 'info', text: string): void {
    this.saveMessage.set({ type, text });

    // Auto-ocultar después de 4 segundos
    setTimeout(() => {
      this.saveMessage.set(null);
    }, 4000);
  }

  /**
   * Detectar cambios en tiempo real para habilitar el botón guardar
   */
  onInputChange(): void {
    this.hasUnsavedChanges.set(this.detectChanges());
  }

  /**
   * Abrir overlay de cambio de contraseña
   */
  cambiarPassword(): void {
    this.showPasswordOverlay.set(true);
  }

  /**
   * Cerrar overlay de cambio de contraseña
   */
  closePasswordOverlay(): void {
    this.showPasswordOverlay.set(false);
  }

  /**
   * Callback cuando se cambia la contraseña exitosamente
   */
  onPasswordChangeSuccess(): void {
    console.log('Contraseña cambiada exitosamente');
  }

  openMusicPreferences(): void {
    this.showPreferencesOverlay.set(true);
  }

  closeMusicPreferences(): void {
    this.showPreferencesOverlay.set(false);
  }

  onPreferencesUpdated(): void {
    this.showMessage('success', 'Preferencias musicales actualizadas');
  }

}
