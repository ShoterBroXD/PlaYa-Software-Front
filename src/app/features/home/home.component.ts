import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  userName: string = '';
  userEmail: string = '';
  userType: 'ARTIST' | 'LISTENER' | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Obtener datos del usuario actual
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.userName = user.name;
        this.userEmail = user.email;
        this.userType = user.type || null;
      }
    });
  }
}
