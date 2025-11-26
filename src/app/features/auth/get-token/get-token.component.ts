import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-get-token',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './get-token.component.html',
  styleUrls: ['./get-token.component.css']
})
export class GetTokenComponent {
  email: string = '';
  tokenGenerado: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  generarToken() {
    if (!this.email) return;

    this.loading = true;
    this.errorMessage = '';
    this.tokenGenerado = '';

    this.http.post(`${environment.apiUrl}/users/password/request?email=${this.email}`, {}, { responseType: 'text' })
      .subscribe({
        next: (response: string) => {
          // La respuesta es "Token generado: ABC123XYZ"
          const match = response.match(/Token generado:\s*(.+)/);
          if (match && match[1]) {
            this.tokenGenerado = match[1].trim();
          } else {
            this.tokenGenerado = response;
          }
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error al generar el token. Verifica el correo.';
          this.loading = false;
        }
      });
  }

  cancelar() {
    this.email = '';
    this.tokenGenerado = '';
    this.errorMessage = '';
    this.router.navigate(['/auth/login']);
  }

  irARestablecer() {
    this.router.navigate(['/auth/reset-password'], { queryParams: { token: this.tokenGenerado } });
  }
}
