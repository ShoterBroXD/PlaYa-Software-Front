import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  // Formularios separados
  usuarioForm: FormGroup;
  artistaForm: FormGroup;

  // Control de tabs
  activeTab: 'usuario' | 'artista' = 'usuario';

  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Formulario Usuario (LISTENER)
    this.usuarioForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      type: ['LISTENER'],
    });

    // Formulario Artista (ARTIST) - incluye campo país
    this.artistaForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      country: ['', [Validators.required, Validators.minLength(2)]],
      type: ['ARTIST'],
    });
  }

  // Getters Usuario
  get usuarioName() {
    return this.usuarioForm.get('name');
  }
  get usuarioEmail() {
    return this.usuarioForm.get('email');
  }
  get usuarioPassword() {
    return this.usuarioForm.get('password');
  }

  // Getters Artista
  get artistaName() {
    return this.artistaForm.get('name');
  }
  get artistaEmail() {
    return this.artistaForm.get('email');
  }
  get artistaPassword() {
    return this.artistaForm.get('password');
  }
  get artistaCountry() {
    return this.artistaForm.get('country');
  }

  /**
   * Cambiar entre tabs
   */
  toggleTab(tab: 'usuario' | 'artista'): void {
    this.activeTab = tab;
    this.errorMessage = '';
  }

  /**
   * Enviar formulario
   */
  onSubmit(): void {
    const form = this.activeTab === 'usuario' ? this.usuarioForm : this.artistaForm;

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Preparar datos (excluir country si es usuario)
    const registerData = { ...form.value };
    if (this.activeTab === 'usuario') {
      delete registerData.country;
    }

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('Registro exitoso', response);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const destination = this.getDashboardRoute(response.type ?? registerData.type);
        this.router.navigate([returnUrl || destination]);
      },
      error: (error) => {
        console.error('Error en registro', error);
        this.errorMessage = error.message || 'Error al registrarse. Intenta nuevamente.';
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

  private getDashboardRoute(
    type: 'ARTIST' | 'LISTENER' | string | null | undefined
  ): string {
    if (type === 'ARTIST') {
      return '/dashboard-artista';
    }
    if (type === 'LISTENER') {
      return '/dashboard-usuario';
    }
    return '/home';
  }
}
