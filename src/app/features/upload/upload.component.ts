import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface UploadFormState {
  title: string;
  artist: string;
  album: string;
  description: string;
  tag: string;
  genre: string;
  visibility: 'Publico' | 'Privado';
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
export class UploadComponent {
  private authService = inject(AuthService);
  userType = computed(() => this.authService.resolveUserType());

  showModal = false;
  activeStep: 'upload' | 'details' | 'privacy' | 'summary' | 'progress' = 'upload';
  uploadedFiles: File[] = [];
  coverPreview: string | null = null;

  formState: UploadFormState = {
    title: '',
    artist: '',
    album: '',
    description: '',
    tag: '',
    genre: 'Rock',
    visibility: 'Publico',
    comments: 'Todos',
    schedule: false,
    scheduleDate: '',
    allowDownload: false,
    includeInLists: false,
  };

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
      this.activeStep = 'details';
    } else if (this.activeStep === 'details') {
      this.activeStep = 'privacy';
    } else if (this.activeStep === 'privacy') {
      this.activeStep = 'summary';
    } else if (this.activeStep === 'summary') {
      this.activeStep = 'progress';
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
  }

  handleCover(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) {
      return;
    }
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.coverPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  get summaryData() {
    return {
      fileName: this.uploadedFiles[0]?.name ?? 'archivo.mp3',
      duration: '3:45',
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
      genre: 'Rock',
      visibility: 'Publico',
      comments: 'Todos',
      schedule: false,
      scheduleDate: '',
      allowDownload: false,
      includeInLists: false,
    };
    this.activeStep = 'upload';
  }
}
