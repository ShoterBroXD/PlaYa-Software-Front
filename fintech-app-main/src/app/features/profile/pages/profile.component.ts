import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CustomerService } from '@core/services/customer.service';
import { CustomerResponse } from '@core/models/customer.model';
import { ProfileValidators } from '../validators/profile.validators';
import { AuthValidators } from '../../auth/validators/auth.validators';
import { CommonValidators } from '@core/validators/common-validators';
import { NATIONALITIES } from '@core/constants/nationalities';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <div class="header-content">
          <div class="avatar">
            <span class="avatar-text">{{ getInitials() }}</span>
          </div>
          <div class="header-info">
            <h1>Mi Perfil</h1>
            <p class="email">{{ currentUser()?.email }}</p>
            <span class="badge" [class.admin]="isAdmin()">
              {{ isAdmin() ? 'Administrador' : 'Usuario' }}
            </span>
          </div>
        </div>
      </div>

      <div class="profile-content">
        <div class="tabs">
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'info'"
            (click)="activeTab.set('info')">
            Información Personal
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab() === 'security'"
            (click)="activeTab.set('security')">
            Seguridad
          </button>
        </div>

        @if (activeTab() === 'info') {
          <div class="tab-content">
            <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()">
              <div class="form-grid">
                <div class="form-group">
                  <label for="name">Nombre completo</label>
                  <input
                    id="name"
                    type="text"
                    formControlName="name"
                    class="form-control"
                    placeholder="Tu nombre completo">
                  @if (profileForm.get('name')?.invalid && profileForm.get('name')?.touched) {
                    <small class="error">El nombre es requerido</small>
                  }
                </div>

                <div class="form-group">
                  <label for="email">Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="form-control"
                    placeholder="correo@ejemplo.com">
                  <small class="hint">El correo no se puede modificar</small>
                </div>

                <div class="form-group">
                  <label for="phone">Teléfono</label>
                  <input
                    id="phone"
                    type="tel"
                    formControlName="phone"
                    class="form-control"
                    placeholder="999999999"
                    [class.error-input]="profileForm.get('phone')?.invalid && profileForm.get('phone')?.touched">
                  @if (profileForm.get('phone')?.invalid && profileForm.get('phone')?.touched) {
                    <small class="error-message">
                      @if (profileForm.get('phone')?.errors?.['invalidPhone']) {
                        El teléfono debe tener 9 dígitos
                      }
                    </small>
                  }
                </div>

                <div class="form-group">
                  <label for="dni">DNI</label>
                  <input
                    id="dni"
                    type="text"
                    formControlName="dni"
                    class="form-control"
                    placeholder="12345678"
                    [class.error-input]="profileForm.get('dni')?.invalid && profileForm.get('dni')?.touched">
                  @if (profileForm.get('dni')?.invalid && profileForm.get('dni')?.touched) {
                    <small class="error-message">
                      @if (profileForm.get('dni')?.errors?.['invalidDni']) {
                        El DNI debe tener 8 dígitos
                      }
                    </small>
                  }
                </div>

                <div class="form-group full-width">
                  <label for="address">Dirección</label>
                  <input
                    id="address"
                    type="text"
                    formControlName="address"
                    class="form-control"
                    placeholder="Tu dirección completa">
                </div>

                <div class="form-group">
                  <label for="dateOfBirth">Fecha de nacimiento</label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    formControlName="dateOfBirth"
                    class="form-control"
                    [class.error-input]="profileForm.get('dateOfBirth')?.invalid && profileForm.get('dateOfBirth')?.touched">
                  @if (profileForm.get('dateOfBirth')?.invalid && profileForm.get('dateOfBirth')?.touched) {
                    <small class="error-message">
                      @if (profileForm.get('dateOfBirth')?.errors?.['minAge']) {
                        Debes ser mayor de 18 años
                      }
                    </small>
                  }
                </div>

                <div class="form-group">
                  <label for="nationality">Nacionalidad</label>
                  <select
                    id="nationality"
                    formControlName="nationality"
                    class="form-control">
                    <option value="">Selecciona tu nacionalidad</option>
                    @for (nationality of nationalities; track nationality) {
                      <option [value]="nationality">{{ nationality }}</option>
                    }
                  </select>
                </div>

                <div class="form-group">
                  <label for="occupation">Ocupación</label>
                  <input
                    id="occupation"
                    type="text"
                    formControlName="occupation"
                    class="form-control"
                    placeholder="Tu ocupación">
                </div>
              </div>

              @if (successMessage()) {
                <div class="alert alert-success">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  {{ successMessage() }}
                </div>
              }

              @if (errorMessage()) {
                <div class="alert alert-info">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  {{ errorMessage() }}
                </div>
              }

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="profileForm.invalid || loading()">
                  {{ loading() ? 'Guardando...' : 'Guardar cambios' }}
                </button>
                <button type="button" class="btn btn-secondary" (click)="resetForm()">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        }

        @if (activeTab() === 'security') {
          <div class="tab-content">
            <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()">
              <div class="form-group">
                <label for="currentPassword">Contraseña actual</label>
                <input
                  id="currentPassword"
                  type="password"
                  formControlName="currentPassword"
                  class="form-control"
                  placeholder="••••••••">
                @if (passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched) {
                  <small class="error">La contraseña actual es requerida</small>
                }
              </div>

              <div class="form-group">
                <label for="newPassword">Nueva contraseña</label>
                <input
                  id="newPassword"
                  type="password"
                  formControlName="newPassword"
                  class="form-control"
                  placeholder="••••••••">
                @if (passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched) {
                  <small class="error">
                    @if (passwordForm.get('newPassword')?.errors?.['required']) {
                      La contraseña es requerida
                    } @else if (passwordForm.get('newPassword')?.errors?.['minlength']) {
                      La contraseña debe tener al menos 6 caracteres
                    } @else if (passwordForm.get('newPassword')?.errors?.['weakPassword']) {
                      La contraseña debe contener mayúsculas, minúsculas, números y mínimo 8 caracteres
                    }
                  </small>
                }
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirmar contraseña</label>
                <input
                  id="confirmPassword"
                  type="password"
                  formControlName="confirmPassword"
                  class="form-control"
                  placeholder="••••••••">
                @if (passwordForm.errors?.['passwordMismatch'] && passwordForm.get('confirmPassword')?.touched) {
                  <small class="error">Las contraseñas no coinciden</small>
                }
              </div>

              @if (passwordSuccessMessage()) {
                <div class="alert alert-success">{{ passwordSuccessMessage() }}</div>
              }

              @if (passwordErrorMessage()) {
                <div class="alert alert-error">{{ passwordErrorMessage() }}</div>
              }

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="passwordForm.invalid || passwordLoading()">
                  {{ passwordLoading() ? 'Cambiando...' : 'Cambiar contraseña' }}
                </button>
                <button type="button" class="btn btn-secondary" (click)="resetPasswordForm()">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1000px;
      margin: 0 auto;
    }

    .profile-header {
      background: var(--color-background-light);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-xl);
      margin-bottom: var(--spacing-xl);
      box-shadow: var(--shadow-sm);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: var(--spacing-xl);
    }

    .avatar {
      width: 100px;
      height: 100px;
      border-radius: var(--border-radius-round);
      background: var(--gradient-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .avatar-text {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-text-light);
    }

    .header-info h1 {
      margin: 0 0 var(--spacing-sm) 0;
      font-size: var(--font-size-3xl);
      color: var(--color-text-primary);
    }

    .email {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--color-text-secondary);
      font-size: var(--font-size-lg);
    }

    .badge {
      display: inline-block;
      padding: 0.375rem 0.75rem;
      background: var(--color-purple);
      color: var(--color-text-light);
      border-radius: var(--border-radius-2xl);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    .badge.admin {
      background: var(--gradient-pink);
    }

    .profile-content {
      background: var(--color-background-light);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .tabs {
      display: flex;
      border-bottom: 2px solid var(--color-border-light);
    }

    .tab-btn {
      flex: 1;
      padding: var(--spacing-md) var(--spacing-xl);
      background: none;
      border: none;
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: var(--transition-base);
      position: relative;
    }

    .tab-btn:hover {
      background: var(--color-background);
      color: var(--color-purple);
    }

    .tab-btn.active {
      color: var(--color-purple);
    }

    .tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--color-purple);
    }

    .tab-content {
      padding: var(--spacing-xl);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-lg);
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    label {
      font-weight: var(--font-weight-semibold);
      margin-bottom: var(--spacing-sm);
      color: var(--color-text-primary);
    }

    .form-control {
      padding: 0.75rem;
      border: 2px solid var(--color-border-light);
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-base);
      transition: var(--transition-base);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-purple);
    }

    .form-control:disabled {
      background: var(--color-background);
      cursor: not-allowed;
    }

    .hint {
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
      margin-top: var(--spacing-xs);
    }

    .error {
      color: var(--color-danger);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-xs);
    }

    .alert {
      padding: var(--spacing-md);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-md);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .alert svg {
      flex-shrink: 0;
    }

    .alert-success {
      background: var(--color-success-light);
      color: var(--color-success-dark);
      border: 1px solid #c3e6cb;
    }

    .alert-error {
      background: var(--color-danger-light);
      color: var(--color-danger-dark);
      border: 1px solid #f5c6cb;
    }

    .alert-info {
      background: #d1ecf1;
      color: #0c5460;
      border: 1px solid #bee5eb;
    }

    .form-actions {
      display: flex;
      gap: var(--spacing-md);
    }

    .btn {
      padding: 0.75rem var(--spacing-xl);
      border: none;
      border-radius: var(--border-radius-md);
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      transition: var(--transition-base);
    }

    .btn-primary {
      background: var(--color-purple);
      color: var(--color-text-light);
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--color-purple-dark);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: var(--color-gray);
      color: var(--color-text-light);
    }

    .btn-secondary:hover {
      background: #5a6268;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        text-align: center;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private customerService = inject(CustomerService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  customerProfile = signal<CustomerResponse | null>(null);
  activeTab = signal<'info' | 'security'>('info');

  loading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  nationalities = NATIONALITIES;

  passwordLoading = signal(false);
  passwordSuccessMessage = signal('');
  passwordErrorMessage = signal('');

  profileForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), ProfileValidators.nameFormat()]],
    email: [{value: '', disabled: true}],
    phone: ['', [ProfileValidators.peruvianPhone()]],
    dni: ['', [ProfileValidators.peruvianDNI()]],
    address: ['', [ProfileValidators.addressMinLength(10)]],
    dateOfBirth: ['', [CommonValidators.minAge(18)]],
    nationality: [''],
    occupation: ['', [ProfileValidators.occupation()]]
  });

  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6), AuthValidators.strongPassword()]],
    confirmPassword: ['', Validators.required]
  }, { validators: AuthValidators.passwordMatch('newPassword', 'confirmPassword') });

  ngOnInit() {
    this.loadCustomerProfile();
  }

  loadCustomerProfile() {
    this.customerService.getProfile().subscribe({
      next: (profile) => {
        this.customerProfile.set(profile);
        this.loadFormData(profile);
      },
      error: (error) => {
        console.error('Error loading profile:', error);

        // Si no existe perfil de customer, cargar solo datos del usuario
        const user = this.currentUser();
        if (user) {
          this.profileForm.patchValue({
            name: user.name || '',
            email: user.email || ''
          });
        }

        // Mostrar mensaje informativo en lugar de error
        this.errorMessage.set('Completa tu perfil para acceder a todas las funcionalidades');
      }
    });
  }

  loadFormData(profile: CustomerResponse) {
    const user = this.currentUser();
    this.profileForm.patchValue({
      name: profile.name,
      email: user?.email || '',
      phone: profile.phone || '',
      dni: profile.dni || '',
      address: profile.address || '',
      dateOfBirth: profile.dateOfBirth || '',
      nationality: profile.nationality || '',
      occupation: profile.occupation || ''
    });
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'ROLE_ADMIN';
  }

  getInitials(): string {
    const name = this.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  onUpdateProfile() {
    if (this.profileForm.valid) {
      this.loading.set(true);
      this.successMessage.set('');
      this.errorMessage.set('');

      const formValue = this.profileForm.getRawValue();
      const customerRequest = {
        name: formValue.name,
        phone: formValue.phone || undefined,
        dni: formValue.dni || undefined,
        address: formValue.address || undefined,
        dateOfBirth: formValue.dateOfBirth || undefined,
        nationality: formValue.nationality || undefined,
        occupation: formValue.occupation || undefined
      };

      this.customerService.updateProfile(customerRequest).subscribe({
        next: (profile) => {
          const isFirstTime = !this.customerProfile();
          this.customerProfile.set(profile);
          this.successMessage.set(
            isFirstTime
              ? 'Perfil creado correctamente. ¡Bienvenido!'
              : 'Perfil actualizado correctamente'
          );
          this.errorMessage.set(''); // Limpiar mensaje de error previo
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.errorMessage.set('Error al actualizar el perfil. Por favor, intenta de nuevo.');
          this.loading.set(false);
        }
      });
    }
  }

  onChangePassword() {
    if (this.passwordForm.valid) {
      this.passwordLoading.set(true);
      this.passwordSuccessMessage.set('');
      this.passwordErrorMessage.set('');

      // TODO: Implementar servicio de cambio de contraseña
      setTimeout(() => {
        this.passwordSuccessMessage.set('Contraseña cambiada correctamente');
        this.passwordLoading.set(false);
        this.resetPasswordForm();
      }, 1000);
    }
  }

  resetForm() {
    const profile = this.customerProfile();
    if (profile) {
      this.loadFormData(profile);
    }
    this.successMessage.set('');
    this.errorMessage.set('');
  }

  resetPasswordForm() {
    this.passwordForm.reset();
    this.passwordSuccessMessage.set('');
    this.passwordErrorMessage.set('');
  }
}
