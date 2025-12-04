import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { MusicPreferencesComponent } from './components/music-preferences/music-preferences.component';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationPreferences } from '../../core/models/notification.model';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, ChangePasswordComponent, MusicPreferencesComponent],
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css'],
})
export class ConfigurationComponent implements OnInit {
  private notificationService = inject(NotificationService);

  usuario = 'NombreUsuario';
  correo = 'usuario@example.com';
  biografia = '';

  calidadAudio = 'Baja';
  descargarWiFi = true;
  ahorroDatos = true;

  notifNuevasCanciones = true;
  notifMensajes = true;
  notifRecordatorios = true;
  notifRecomendaciones = true;
  notificacionesActivas = true;

  tipoCuenta = 'Oyente';
  idiomaApp = 'Español';
  colorApp = 'Claro';

  perfilVisible = false;
  playlistVisible = true;

  // Control del overlay de cambio de contraseña
  showPasswordOverlay = signal(false);
  showPreferencesOverlay = signal(false);

  cambiarPassword() {
    this.showPasswordOverlay.set(true);
  }

  closePasswordOverlay() {
    this.showPasswordOverlay.set(false);
  }

  onPasswordChangeSuccess() {
    console.log('Contraseña cambiada exitosamente');
    // Aquí podrías mostrar una notificación global si tienes un servicio de notificaciones
  }

  openMusicPreferences() {
    this.showPreferencesOverlay.set(true);
  }

  closeMusicPreferences() {
    this.showPreferencesOverlay.set(false);
  }

  onPreferencesUpdated() {
    console.log('Preferencias musicales actualizadas');
    this.closeMusicPreferences();
  }

  ngOnInit(): void {
    this.loadNotificationPreferences();
  }

  private loadNotificationPreferences(): void {
    this.notificationService.getPreferences().subscribe({
      next: (preferences) => {
        this.notifNuevasCanciones = preferences.enableNewReleases;
        this.notifMensajes = preferences.enableFollowers;
        this.notifRecordatorios = preferences.enableSystems;
        this.notifRecomendaciones = preferences.enableComments;
        // Si todas están en false, el switch master está apagado
        this.notificacionesActivas = preferences.enableNewReleases || preferences.enableFollowers || 
                                      preferences.enableSystems || preferences.enableComments;
      },
      error: (error) => {
        console.error('Error al cargar preferencias de notificaciones:', error);
      }
    });
  }

  guardarPreferenciasNotificaciones(): void {
    const preferences: NotificationPreferences = {
      enableNewReleases: this.notifNuevasCanciones,
      enableFollowers: this.notifMensajes,
      enableSystems: this.notifRecordatorios,
      enableComments: this.notifRecomendaciones
    };

    this.notificationService.updatePreferences(preferences).subscribe({
      next: () => {
        console.log('Preferencias de notificaciones guardadas');
      },
      error: (error) => {
        console.error('Error al guardar preferencias:', error);
      }
    });
  }

  toggleAllNotifications(): void {
    this.notificationService.toggleNotifications().subscribe({
      next: () => {
        this.loadNotificationPreferences();
        console.log('Toggle de notificaciones ejecutado');
      },
      error: (error) => {
        console.error('Error al hacer toggle de notificaciones:', error);
      }
    });
  }

  guardarCambios(): void {
    // Guardar preferencias de notificaciones
    this.guardarPreferenciasNotificaciones();
    console.log('Cambios guardados');
    // Aquí puedes agregar lógica para guardar otros cambios de configuración
  }
}
