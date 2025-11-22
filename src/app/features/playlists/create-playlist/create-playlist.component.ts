import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PlaylistService } from '../../../core/services/playlist.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-create-playlist',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './create-playlist.component.html',
  styleUrls: ['./create-playlist.component.css'],
})
export class CreatePlaylistComponent {
  playlistForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private playlistService: PlaylistService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.playlistForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
    });
  }

  get name() {
    return this.playlistForm.get('name');
  }

  get description() {
    return this.playlistForm.get('description');
  }

  onSubmit(): void {
    if (this.playlistForm.invalid) {
      this.playlistForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const user = this.authService.getCurrentUser();
    if (!user || !user.idUser) {
      this.errorMessage = 'Usuario no autenticado.';
      this.loading = false;
      return;
    }

    const request = {
      idUser: user.idUser,
      ...this.playlistForm.value,
    };

    this.playlistService.createPlaylist(request).subscribe({
      next: (response) => {
        console.log('Playlist creada', response);
        this.router.navigate(['/playlists/my']);
      },
      error: (error) => {
        console.error('Error creando playlist', error);
        if (error.status === 400) {
          this.errorMessage = 'Datos inválidos. Revisa los campos.';
        } else {
          this.errorMessage = error.message || 'Error al crear la playlist.';
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/playlists/my']);
  }
}