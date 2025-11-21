import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangePasswordComponent } from './components/change-password/change-password.component';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule, ChangePasswordComponent],
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css'],
})
export class ConfigurationComponent {
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

  tipoCuenta = 'Oyente';
  idiomaApp = 'Español';
  colorApp = 'Claro';

  perfilVisible = false;
  playlistVisible = true;

  // Control del overlay de cambio de contraseña
  showPasswordOverlay = signal(false);

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
}
