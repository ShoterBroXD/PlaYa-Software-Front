import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommunityService } from '../../../core/services/community.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommunityRequestDto } from '../../../core/models/community.model';

@Component({
  selector: 'app-create-community',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-community.component.html',
  styleUrls: ['./create-community.component.css']
})
export class CreateCommunityComponent {
  community: CommunityRequestDto = {
    name: '',
    description: ''
  };

  isCreating = false;
  error: string | null = null;

  constructor(
    private communityService: CommunityService,
    private authService: AuthService,
    private router: Router
  ) {}

  createCommunity() {
    // Validar campos
    if (!this.community.name || !this.community.description) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    if (this.community.name.trim().length < 3) {
      this.error = 'El nombre debe tener al menos 3 caracteres';
      return;
    }

    if (this.community.description.trim().length < 10) {
      this.error = 'La descripción debe tener al menos 10 caracteres';
      return;
    }

    this.isCreating = true;
    this.error = null;

    const communityData: CommunityRequestDto = {
      name: this.community.name.trim(),
      description: this.community.description.trim()
    };

    this.communityService.createCommunity(communityData).subscribe({
      next: (response) => {
        console.log('Comunidad creada:', response);

        // Unirse automáticamente a la comunidad creada
        const userId = this.authService.getUserId();
        if (userId && response.idCommunity) {
          this.communityService.joinCommunity(response.idCommunity, userId).subscribe({
            next: () => {
              console.log('Te has unido automáticamente a tu comunidad');
              // Redirigir al detalle de la comunidad creada
              this.router.navigate(['/communities', response.idCommunity]);
            },
            error: (err) => {
              console.error('Error al unirse:', err);
              // Aunque falle al unirse, redirigir igual
              this.router.navigate(['/communities', response.idCommunity]);
            }
          });
        } else {
          // Si no hay userId, solo redirigir
          this.router.navigate(['/communities', response.idCommunity]);
        }
      },
      error: (error) => {
        console.error('Error creando comunidad:', error);
        this.error = error.message || 'Error al crear la comunidad. Por favor, intenta de nuevo.';
        this.isCreating = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/communities']);
  }
}
