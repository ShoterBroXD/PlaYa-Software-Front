import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommunityService } from '../../../core/services/community.service';
import { CommunityResponseDto } from '../../../core/models/community.model';

@Component({
  selector: 'app-recommended-communities',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recommended.component.html',
  styleUrls: ['./recommended.component.css']
})
export class RecommendedCommunitiesComponent implements OnInit {
  recommended: any[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private communityService: CommunityService) {}

  ngOnInit() {
    this.loadRecommendedCommunities();
  }

  loadRecommendedCommunities() {
    this.isLoading = true;
    this.communityService.getRecommendedCommunities().subscribe({
      next: (communities: CommunityResponseDto[]) => {
        this.recommended = communities.map(c => ({
          id: c.idCommunity,
          name: c.name,
          followers: c.members?.length ? `${c.members.length}` : '0',
          description: c.description,
          image: '/assets/img/images/perfil-comunidades.png'
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando comunidades recomendadas:', error);
        this.error = 'Error al cargar las comunidades recomendadas.';
        this.isLoading = false;
      }
    });
  }
}
