import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommunityService } from '../../../core/services/community.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommunityResponseDto } from '../../../core/models/community.model';

@Component({
  selector: 'app-explore-communities',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreCommunitiesComponent implements OnInit {
  exploreCommunities: any[] = [];
  similarCommunities: any[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private communityService: CommunityService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadExploreCommunities();
  }

  loadExploreCommunities() {
    const userId = this.authService.getUserId();

    if (!userId) {
      // Si no hay usuario, mostrar todas
      this.loadAllCommunities();
      return;
    }

    this.isLoading = true;
    this.communityService.getExploreCommunities(userId).subscribe({
      next: (communities: CommunityResponseDto[]) => {
        const mapped = communities.map(c => ({
          id: c.idCommunity,
          name: c.name,
          followers: c.members?.length ? `${c.members.length}` : '0',
          description: c.description,
          image: '/assets/img/images/perfil-comunidades.png'
        }));

        this.exploreCommunities = mapped.slice(0, 8);
        this.similarCommunities = mapped.slice(8, 16);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando comunidades:', error);
        this.error = 'Error al cargar las comunidades.';
        this.isLoading = false;
      }
    });
  }

  private loadAllCommunities() {
    this.communityService.getAllCommunities().subscribe({
      next: (communities: CommunityResponseDto[]) => {
        const mapped = communities.map(c => ({
          id: c.idCommunity,
          name: c.name,
          followers: c.members?.length ? `${c.members.length}` : '0',
          description: c.description,
          image: '/assets/img/images/perfil-comunidades.png'
        }));

        this.exploreCommunities = mapped.slice(0, 8);
        this.similarCommunities = mapped.slice(8, 16);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando comunidades:', error);
        this.error = 'Error al cargar las comunidades.';
        this.isLoading = false;
      }
    });
  }
}
