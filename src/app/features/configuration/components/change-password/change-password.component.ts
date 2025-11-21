import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordService } from '../../../../core/services/password.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent {
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  showCurrent = false;
  showNew = false;
  showConfirm = false;

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  validations = {
    minLength: false,
    match: false,
    uppercase: false,
    lowercase: false,
    numbers: false,
    special: false,
  };

  constructor(private passwordService: PasswordService) {}

  validate() {
    const pass = this.newPassword;
    this.validations.minLength = pass.length >= 8;
    this.validations.match = pass === this.confirmPassword && pass.length > 0;
    this.validations.uppercase = /[A-Z]/.test(pass);
    this.validations.lowercase = /[a-z]/.test(pass);
    this.validations.numbers = /\d/.test(pass);
    this.validations.special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(pass);
  }

  isValid() {
    return Object.values(this.validations).every((v) => v) && this.currentPassword.length > 0;
  }

  cancelar() {
    this.close.emit();
  }

  cambiarContrasena() {
    if (!this.isValid()) return;

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmNewPassword: this.confirmPassword
    };

    this.passwordService.changePassword(request).subscribe({
      next: (response) => {
        this.successMessage.set('Contraseña cambiada exitosamente');
        this.loading.set(false);
        
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          this.success.emit();
          this.close.emit();
        }, 2000);
      },
      error: (error) => {
        this.errorMessage.set(error.error || 'Error al cambiar la contraseña. Verifica tu contraseña actual.');
        this.loading.set(false);
      }
    });
  }
}
