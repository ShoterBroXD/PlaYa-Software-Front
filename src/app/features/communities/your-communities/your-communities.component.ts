import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommunityService } from '../../../core/services/community.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommunityResponseDto } from '../../../core/models/community.model';

@Component({
  selector: 'app-your-communities',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './your-communities.component.html',
  styleUrls: ['./your-communities.component.css']
})
export class YourCommunitiesComponent implements OnInit {
  yourCommunities: any[] = [];
  mostActive: any[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private communityService: CommunityService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserCommunities();
  }

  loadUserCommunities() {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.error = 'Usuario no autenticado';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.communityService.getUserCommunities(userId).subscribe({
      next: (communities: CommunityResponseDto[]) => {
        const mapped = communities.map(c => ({
          id: c.idCommunity,
          name: c.name,
          followers: c.members?.length ? `${c.members.length}` : '0',
          description: c.description,
          image: '/assets/img/images/perfil-comunidades.png'
        }));

        this.yourCommunities = mapped.slice(0, 8);
        this.mostActive = mapped.slice(8, 16);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando tus comunidades:', error);
        this.error = 'Error al cargar tus comunidades.';
        this.isLoading = false;
      }
    });
  }
}
