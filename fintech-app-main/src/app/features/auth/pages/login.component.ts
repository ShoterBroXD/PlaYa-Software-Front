import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AuthService } from '@core/services/auth.service';
import { LoginRequest, ProfileRole } from '@core/models/user.model';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, RouterLink],
	template: `
		<div class="auth-shell">
			<div class="auth-card">
				<h1>Inicia sesion en PlaYa!</h1>

				<div class="role-toggle" role="tablist" aria-label="Selecciona tu rol">
					<button
						type="button"
						[class.active]="isRoleActive('listener')"
						(click)="selectRole('listener')"
						role="tab"
						aria-selected="{{ isRoleActive('listener') }}"
					>
						Usuario
					</button>
					<button
						type="button"
						[class.active]="isRoleActive('artist')"
						(click)="selectRole('artist')"
						role="tab"
						aria-selected="{{ isRoleActive('artist') }}"
					>
						Artista
					</button>
				</div>

				<form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
					<label for="email" class="field-label">Correo</label>
					<input
						id="email"
						type="email"
						formControlName="email"
						class="field-input"
						placeholder="Coloque su correo..."
						[class.has-error]="inputInvalid('email')"
						autocomplete="email"
						required
					/>
					@if (inputInvalid('email')) {
						<p class="field-error">Ingresa un correo valido.</p>
					}

					<label for="password" class="field-label">Contrasena</label>
					<input
						id="password"
						type="password"
						formControlName="password"
						class="field-input"
						placeholder="Coloque su contrasena..."
						[class.has-error]="inputInvalid('password')"
						autocomplete="current-password"
						required
					/>
					@if (inputInvalid('password')) {
						<p class="field-error">La contrasena debe tener al menos 6 caracteres.</p>
					}

					@if (errorMessage()) {
						<div class="alert">{{ errorMessage() }}</div>
					}

					<div class="form-actions">
						<button type="button" class="btn btn-secondary" (click)="onCancel()">Cancelar</button>
						<button type="submit" class="btn btn-primary" [disabled]="loginForm.invalid || loading()">
							@if (loading()) {
								<span class="spinner" aria-hidden="true"></span>
								Iniciando...
							} @else {
								Inicia sesion
							}
						</button>
					</div>
				</form>

				<div class="links">
					<p>
						Aun no tienes una cuenta?
						<a routerLink="/register">Registrate en PlaYa!</a>
					</p>
					<a routerLink="/" class="recover" aria-label="Recuperar contrasena">
						Olvidaste tu contrasena?
					</a>
				</div>
			</div>
		</div>
	`,
	styles: [`
		:host {
			display: block;
			background: linear-gradient(180deg, #ffffff 0%, #f4f9ff 100%);
			min-height: calc(100vh - 80px);
			padding: 4rem 1.5rem;
			font-family: 'Segoe UI', Arial, sans-serif;
		}

		.auth-shell {
			max-width: 520px;
			margin: 0 auto;
		}

		.auth-card {
			background: #ffffff;
			border: 4px solid #07779c;
			border-radius: 28px;
			padding: 3rem 2.5rem;
			box-shadow: 0 24px 48px rgba(7, 119, 156, 0.12);
		}

		h1 {
			text-align: center;
			font-size: clamp(1.9rem, 4vw, 2.3rem);
			color: #0b2f4b;
			margin-bottom: 2.5rem;
			font-weight: 700;
		}

		.role-toggle {
			display: grid;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			background: #f0f5f9;
			border-radius: 999px;
			padding: 0.35rem;
			margin-bottom: 2.5rem;
			gap: 0.35rem;
		}

		.role-toggle button {
			border: none;
			border-radius: 999px;
			padding: 0.65rem 1.25rem;
			font-weight: 600;
			font-size: 0.95rem;
			color: #19607e;
			background: transparent;
			cursor: pointer;
			transition: all 0.2s ease;
		}

		.role-toggle button.active {
			background: #0d83a6;
			color: #ffffff;
			box-shadow: 0 10px 20px rgba(13, 131, 166, 0.25);
		}

		form {
			display: flex;
			flex-direction: column;
			gap: 1.2rem;
		}

		.field-label {
			font-weight: 600;
			font-size: 0.95rem;
			color: #104266;
		}

		.field-input {
			width: 100%;
			border: 2px solid rgba(16, 66, 102, 0.18);
			border-radius: 14px;
			padding: 0.85rem 1rem;
			font-size: 1rem;
			color: #0b2f4b;
			transition: border-color 0.2s ease, box-shadow 0.2s ease;
			background: #ffffff;
		}

		.field-input:focus {
			outline: none;
			border-color: #0d83a6;
			box-shadow: 0 0 0 3px rgba(13, 131, 166, 0.2);
		}

		.field-input.has-error {
			border-color: #d45454;
		}

		.field-error {
			margin: -0.7rem 0 0;
			font-size: 0.85rem;
			color: #d45454;
		}

		.alert {
			margin-top: 0.5rem;
			background: rgba(212, 84, 84, 0.12);
			color: #a13636;
			border-radius: 14px;
			padding: 0.9rem 1rem;
			font-size: 0.95rem;
		}

		.form-actions {
			display: flex;
			justify-content: space-between;
			gap: 1rem;
			margin-top: 0.5rem;
		}

		.btn {
			border-radius: 14px;
			padding: 0.9rem 1.4rem;
			font-weight: 600;
			font-size: 0.95rem;
			border: none;
			cursor: pointer;
			transition: transform 0.2s ease, box-shadow 0.2s ease;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			min-width: 140px;
		}

		.btn:disabled {
			opacity: 0.65;
			cursor: not-allowed;
			transform: none;
			box-shadow: none;
		}

		.btn.btn-secondary {
			background: #eef4f8;
			color: #104266;
			border: 1px solid rgba(16, 66, 102, 0.2);
		}

		.btn.btn-secondary:hover:not(:disabled) {
			transform: translateY(-1px);
			box-shadow: 0 10px 18px rgba(16, 66, 102, 0.12);
		}

		.btn.btn-primary {
			background: #0d83a6;
			color: #ffffff;
			box-shadow: 0 14px 28px rgba(13, 131, 166, 0.25);
		}

		.btn.btn-primary:hover:not(:disabled) {
			transform: translateY(-1px);
			box-shadow: 0 18px 32px rgba(13, 131, 166, 0.3);
		}

		.spinner {
			width: 1rem;
			height: 1rem;
			border: 2px solid rgba(255, 255, 255, 0.4);
			border-top-color: #ffffff;
			border-radius: 50%;
			margin-right: 0.5rem;
			animation: spin 0.9s linear infinite;
		}

		.links {
			margin-top: 2rem;
			text-align: center;
			color: #104266;
			font-size: 0.95rem;
		}

		.links a {
			color: #0d83a6;
			font-weight: 600;
			text-decoration: none;
		}

		.links a:hover {
			text-decoration: underline;
		}

		.links .recover {
			display: inline-block;
			margin-top: 0.5rem;
		}

		@keyframes spin {
			to {
				transform: rotate(360deg);
			}
		}

		@media (max-width: 560px) {
			:host {
				padding: 3rem 1rem;
			}

			.auth-card {
				padding: 2.5rem 1.75rem;
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
export class LoginComponent {
	private readonly fb = inject(FormBuilder);
	private readonly authService = inject(AuthService);
	private readonly router = inject(Router);

	protected readonly loading = signal(false);
	protected readonly errorMessage = signal<string | null>(null);
	private readonly roleSignal = signal<ProfileRole>('listener');

	readonly loginForm = this.fb.nonNullable.group({
		email: ['', [Validators.required, Validators.email]],
		password: ['', [Validators.required, Validators.minLength(6)]]
	});

	selectRole(role: ProfileRole): void {
		this.roleSignal.set(role);
	}

	isRoleActive(role: ProfileRole): boolean {
		return this.roleSignal() === role;
	}

	inputInvalid(controlName: 'email' | 'password'): boolean {
		const control = this.loginForm.get(controlName);
		return !!control && control.invalid && (control.dirty || control.touched);
	}

	onSubmit(): void {
		if (this.loginForm.invalid) {
			this.loginForm.markAllAsTouched();
			return;
		}

		const credentials: LoginRequest = {
			...this.loginForm.getRawValue(),
			role: this.roleSignal()
		};

		this.loading.set(true);
		this.errorMessage.set(null);

		this.authService.login(credentials)
			.pipe(finalize(() => this.loading.set(false)))
			.subscribe({
				next: () => this.router.navigate(['/dashboard']),
				error: (error) => {
					const message = error?.error?.message || 'No se pudo iniciar sesion.';
					this.errorMessage.set(message);
				}
			});
	}

	onCancel(): void {
		this.router.navigate(['/']);
	}
}
