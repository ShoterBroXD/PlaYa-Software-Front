import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  nuevaContra: string = '';
  confirmarContra: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  validations = {
    minLength: false,
    match: false,
    uppercase: false,
    lowercase: false,
    numbers: false,
    special: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
      }
    });
  }

  validar() {
    const pass = this.nuevaContra;
    this.validations.minLength = pass.length >= 8;
    this.validations.match = pass === this.confirmarContra;
    this.validations.uppercase = /[A-Z]/.test(pass);
    this.validations.lowercase = /[a-z]/.test(pass);
    this.validations.numbers = /\d/.test(pass);
    this.validations.special = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(pass);
  }

  isValid() {
    return Object.values(this.validations).every(v => v);
  }

  cancelar() {
    this.token = '';
    this.nuevaContra = '';
    this.confirmarContra = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.router.navigate(['/auth/login']);
  }

  restablecer() {
    if (!this.isValid() || !this.token) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const body = {
      newPassword: this.nuevaContra,
      confirmNewPassword: this.confirmarContra
    };

    this.http.post(`${environment.apiUrl}/users/password/reset?token=${this.token}`, body, { responseType: 'text' })
      .subscribe({
        next: (response: string) => {
          this.successMessage = 'Contraseña actualizada correctamente';
          this.loading = false;
          // Redirigir al login después de 2 segundos
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = error.error || 'Error al restablecer la contraseña. Verifica el token.';
          this.loading = false;
        }
      });
  }

  ngDoCheck() {
    this.validar();
  }
}
