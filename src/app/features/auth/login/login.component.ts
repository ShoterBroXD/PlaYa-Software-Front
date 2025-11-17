import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  // Formularios separados para Usuario y Artista
  usuarioForm: FormGroup;
  artistaForm: FormGroup;

  // Control de tabs
  activeTab: 'usuario' | 'artista' = 'usuario';

  loading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    // Formulario Usuario (LISTENER)
    this.usuarioForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      type: ['LISTENER'],
    });

    // Formulario Artista (ARTIST)
    this.artistaForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      type: ['ARTIST'],
    });
  }

  // Getters para validaciones - Usuario
  get usuarioEmail() {
    return this.usuarioForm.get('email');
  }
  get usuarioPassword() {
    return this.usuarioForm.get('password');
  }

  // Getters para validaciones - Artista
  get artistaEmail() {
    return this.artistaForm.get('email');
  }
  get artistaPassword() {
    return this.artistaForm.get('password');
  }

  /**
   * Cambiar entre tabs
   */
  toggleTab(tab: 'usuario' | 'artista'): void {
    this.activeTab = tab;
    this.errorMessage = ''; // Limpiar errores al cambiar tab
  }

  /**
   * Enviar formulario según el tab activo
   */
  onSubmit(): void {
    const form = this.activeTab === 'usuario' ? this.usuarioForm : this.artistaForm;

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(form.value).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error en login', error);
        this.errorMessage = error.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  /**
   * Cancelar y volver al landing
   */
  onCancel(): void {
    this.router.navigate(['/landing']);
  }
}
