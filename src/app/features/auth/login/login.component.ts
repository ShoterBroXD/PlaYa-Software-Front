import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
  //artistaForm: FormGroup;

  // Control de tabs
  //activeTab: 'usuario' | 'artista' = 'usuario';

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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      type: ['LISTENER'],
    });

    // Formulario Artista (ARTIST)
    // this.artistaForm = this.fb.group({
    //   email: ['', [Validators.required, Validators.email]],
    //   password: ['', [Validators.required, Validators.minLength(6)]],
    //   type: ['ARTIST'],
    // });
  }

  // Getters para validaciones - Usuario
  get usuarioEmail() {
    return this.usuarioForm.get('email');
  }
  get usuarioPassword() {
    return this.usuarioForm.get('password');
  }

  // Getters para validaciones - Artista
  // get artistaEmail() {
  //   return this.artistaForm.get('email');
  // }
  // get artistaPassword() {
  //   return this.artistaForm.get('password');
  // }

  /**
   * Cambiar entre tabs
   */
  // toggleTab(tab: 'usuario' | 'artista'): void {
  //   this.activeTab = tab;
  //   this.errorMessage = ''; // Limpiar errores al cambiar tab
  // }

  /**
   * Enviar formulario según el tab activo
   */
  onSubmit(): void {
    const form = this.usuarioForm;

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(form.value).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        // const resolvedType = (response.type ?? form.value.type) as 'ARTIST' | 'LISTENER' | undefined;
        const resolvedType = response.type as 'ARTIST' | 'LISTENER' | undefined;
        if (resolvedType) {
          this.authService.setUserType(resolvedType);
        }
        const destination = this.getDashboardRoute(resolvedType);
        this.router.navigate([returnUrl || destination]);
      },
      error: (error) => {
        console.error('Error en login', error);
        if (error.status === 401) {
          this.errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
        } else if (error.status === 400) {
          this.errorMessage = 'Datos inválidos. Revisa los campos.';
        } else {
          this.errorMessage = error.message || 'Error al iniciar sesión. Intenta nuevamente.';
        }
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
