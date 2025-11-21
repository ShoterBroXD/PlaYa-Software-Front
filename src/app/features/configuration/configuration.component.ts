import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationPreferences } from '../../core/models/notification.model';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, ChangePasswordComponent],
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css'],
})
export class ConfigurationComponent implements OnInit {
  usuario = 'NombreUsuario';
  correo = 'usuario@example.com';
  biografia = '';

  calidadAudio = 'Baja';
  descargarWiFi = true;
  ahorroDatos = true;

  enableNewReleases = false;
  enableComments = false;
  enableSystems = false;
  enableFollowers = false;

  tipoCuenta = 'Oyente';
  idiomaApp = 'Español';
  colorApp = 'Claro';

  perfilVisible = false;
  playlistVisible = true;

  showPasswordOverlay = signal(false);
  loadingPreferences = false;

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadPreferences();
  }

  loadPreferences() {
    this.loadingPreferences = true;
    this.notificationService.getPreferences().subscribe({
      next: (prefs) => {
        this.enableComments = prefs.enableComments;
        this.enableSystems = prefs.enableSystems;
        this.enableNewReleases = prefs.enableNewReleases;
        this.enableFollowers = prefs.enableFollowers;
        this.loadingPreferences = false;
      },
      error: (error: unknown) => {
        console.error('Error cargando preferencias', error);
        this.loadingPreferences = false;
      }
    });
  }

  cambiarPassword() {
    this.showPasswordOverlay.set(true);
  }

  closePasswordOverlay() {
    this.showPasswordOverlay.set(false);
  }

  onPasswordChangeSuccess() {
    console.log('Contraseña cambiada exitosamente');
  }

  private getPreferencesPayload(): NotificationPreferences {
    return {
      enableComments: this.enableComments,
      enableSystems: this.enableSystems,
      enableNewReleases: this.enableNewReleases,
      enableFollowers: this.enableFollowers
    };
  }

  savePreferences() {
    const payload = this.getPreferencesPayload();
    this.notificationService.updatePreferences(payload).subscribe({
      next: () => {
        console.log('Preferencias guardadas exitosamente');
        alert('Preferencias guardadas correctamente');
      },
      error: (error: unknown) => {
        console.error('Error guardando preferencias', error);
        alert('Error al guardar preferencias');
      }
    });
  }

  togglePreferences() {
    this.notificationService.toggleNotifications().subscribe({
      next: () => {
        // Recargar preferencias desde el servidor para reflejar el estado real
        this.loadPreferences();
      },
      error: (error: unknown) => console.error('Error al alternar preferencias', error)
    });
  }

  get allNotificationsDisabled(): boolean {
    return !this.enableComments && !this.enableSystems && 
           !this.enableNewReleases && !this.enableFollowers;
  }
}
