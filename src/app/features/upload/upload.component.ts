import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CloudinaryService } from '../../core/services/cloudinary.service';
import { Genre, SongService } from '../../core/services/song.service';

interface UploadFormState {
  title: string;
  artist: string;
  album: string;
  description: string;
  tag: string;
  visibility: 'Publico' | 'Privado' | 'Solo seguidores';
  comments: 'Todos' | 'Solo seguidores' | 'Nadie';
  schedule: boolean;
  scheduleDate: string;
  allowDownload: boolean;
  includeInLists: boolean;
}

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnInit {
  private authService = inject(AuthService);
  private cloudinaryService = inject(CloudinaryService);
  private songService = inject(SongService);
  private cdr = inject(ChangeDetectorRef);
  userType = computed(() => this.authService.resolveUserType());

  showModal = false;
  activeStep: 'upload' | 'details' | 'privacy' | 'summary' | 'progress' = 'upload';
  uploadedFiles: File[] = [];
  coverPreview: string | null = null;
  audioUrl: string | null = null;
  audioDuration: number | undefined;
  coverUrl: string | null = null;
  isAudioUploading = false;
  isCoverUploading = false;
  uploadError: string | null = null;
  coverError: string | null = null;
  submitError: string | null = null;
  isSubmitting = false;

  genres: Genre[] = [];
  selectedGenreId: number | null = null;
  isGenresLoading = false;
  genreError: string | null = null;

  formState: UploadFormState = {
    title: '',
    artist: '',
    album: '',
    description: '',
    tag: '',
    visibility: 'Publico',
    comments: 'Todos',
    schedule: false,
    scheduleDate: '',
    allowDownload: false,
    includeInLists: false,
  };

  ngOnInit(): void {
    this.loadGenres();
  }

  openModal() {
    this.showModal = true;
    this.activeStep = 'upload';
  }

  closeModal() {
    this.showModal = false;
  }

  goTo(step: typeof this.activeStep) {
    this.activeStep = step;
  }

  nextStep() {
    if (this.activeStep === 'upload') {
      if (!this.audioUrl || this.isAudioUploading) {
        this.uploadError = 'Necesitas subir al menos un archivo de audio.';
        return;
      }
      this.activeStep = 'details';
    } else if (this.activeStep === 'details') {
      this.activeStep = 'privacy';
    } else if (this.activeStep === 'privacy') {
      this.activeStep = 'summary';
    } else if (this.activeStep === 'summary') {
      this.submitSong();
    }
  }

  prevStep() {
    if (this.activeStep === 'details') {
      this.activeStep = 'upload';
    } else if (this.activeStep === 'privacy') {
      this.activeStep = 'details';
    } else if (this.activeStep === 'summary') {
      this.activeStep = 'privacy';
    }
  }

  handleFiles(files: FileList | null | undefined) {
    if (!files) {
      return;
    }
    this.uploadedFiles = Array.from(files);
    const [file] = this.uploadedFiles;
    if (file) {
      this.uploadAudioFile(file);
    }
  }

  handleCover(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) {
      return;
    }
    const file = input.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.coverPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
    this.uploadCoverFile(file);
  }

  get summaryData() {
    return {
      fileName: this.uploadedFiles[0]?.name ?? 'archivo.mp3',
      duration: this.formatDuration(this.audioDuration),
      genre: this.selectedGenreName,
      ...this.formState,
    };
  }

  resetWizard() {
    this.uploadedFiles = [];
    this.coverPreview = null;
    this.formState = {
      title: '',
      artist: '',
      album: '',
      description: '',
      tag: '',
      visibility: 'Publico',
      comments: 'Todos',
      schedule: false,
      scheduleDate: '',
      allowDownload: false,
      includeInLists: false,
    };
    this.activeStep = 'upload';
    this.audioUrl = null;
    this.coverUrl = null;
    this.audioDuration = undefined;
    this.uploadError = null;
    this.coverError = null;
    this.submitError = null;
    this.isSubmitting = false;
    this.selectedGenreId = this.genres.length ? this.genres[0].id : null;
  }

  private loadGenres() {
    this.isGenresLoading = true;
    this.genreError = null;
    this.songService.getGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
        if (!this.selectedGenreId && genres.length) {
          this.onGenreChange(genres[0].id);
        }
        this.isGenresLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.genres = [];
        this.genreError = 'No se pudieron cargar los géneros. Intenta nuevamente.';
        this.isGenresLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onGenreChange(id: number | null) {
    this.selectedGenreId = typeof id === 'string' ? Number(id) : id;
    this.submitError = null;
  }

  private uploadAudioFile(file: File) {
    this.isAudioUploading = true;
    this.uploadError = null;
    this.cloudinaryService.uploadFile(file, 'auto').subscribe({
      next: (response) => {
        console.log('Cloudinary success', response);
        this.audioUrl = response.secure_url;
        this.audioDuration = response.duration;
        this.isAudioUploading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.uploadError = 'No se pudo subir el archivo. Inténtalo de nuevo.';
        this.isAudioUploading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private uploadCoverFile(file: File) {
    this.isCoverUploading = true;
    this.coverError = null;
    this.cloudinaryService.uploadFile(file, 'image').subscribe({
      next: (response) => {
        this.coverUrl = response.secure_url;
        this.isCoverUploading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.coverError = 'No se pudo subir la portada. Inténtalo de nuevo.';
        this.isCoverUploading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private submitSong() {
    const missing: string[] = [];
    if (!this.audioUrl) missing.push('archivo de audio');
    if (!this.coverUrl) missing.push('portada');
    if (this.selectedGenreId === null) missing.push('género');

    if (missing.length) {
      this.submitError = `Falta ${missing.join(', ')}.`;
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    const payload = {
      title: this.formState.title || this.summaryData.fileName,
      description: this.formState.description,
      coverURL: this.coverUrl ?? '',
      fileURL: this.audioUrl ?? '',
      visibility: this.mapVisibility(this.formState.visibility),
      idgenre: this.selectedGenreId ?? 0,
      duration: this.audioDuration,
    };

    this.songService.createSong(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.activeStep = 'progress';
      },
      error: (error) => {
        console.error('Song upload error', error);
        this.submitError =
          error?.error?.message || 'Ocurrió un error al registrar tu canción. Intenta nuevamente.';
        this.isSubmitting = false;
      },
    });
  }

  private mapVisibility(value: UploadFormState['visibility']): 'public' | 'private' | 'unlisted' {
    switch (value) {
      case 'Privado':
        return 'private';
      case 'Solo seguidores':
        return 'unlisted';
      default:
        return 'public';
    }
  }

  get selectedGenreName(): string {
    return this.genres.find((genre) => genre.id === this.selectedGenreId)?.name ?? 'Sin genero';
  }

  private formatDuration(seconds?: number): string {
    if (!seconds || Number.isNaN(seconds)) {
      return '--:--';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${mins}:${secs}`;
  }
}

