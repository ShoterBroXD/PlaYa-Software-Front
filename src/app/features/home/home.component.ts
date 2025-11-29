import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';
  userType: 'ARTIST' | 'LISTENER' | null = null;



  constructor(
    private authService: AuthService,
    private router: Router,
    public playerService: PlayerService
  ) { }

  ngOnInit(): void {
    // Obtener datos del usuario actual
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.userName = user.name;
        this.userEmail = user.email;
        this.userType = (user.type as 'ARTIST' | 'LISTENER' | null) || this.authService.resolveUserType();
        this.redirectIfNeeded();
      } else {
        // Si no hay usuario, revisar tipo guardado en storage (bypass local)
        this.userType = this.authService.resolveUserType();
        this.redirectIfNeeded();
      }
    });
  }



  private redirectIfNeeded() {
    const type = this.userType || this.authService.resolveUserType();

    if (type === 'ARTIST') {
      this.router.navigate(['/dashboard-artista']);
    } else if (type === 'LISTENER') {
      this.router.navigate(['/dashboard-usuario']);
    }
  }

  get displayUserType(): string {
    if (this.userType === 'ARTIST') {
      return 'Artista';
    }
    if (this.userType === 'LISTENER') {
      return 'Oyente';
    }
    return 'No definido';
  }
}
