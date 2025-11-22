import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportModalComponent } from '../../../shared/components/report-modal/report-modal.component';

@Component({
  selector: 'app-categories-tracks',
  standalone: true,
  imports: [CommonModule, ReportModalComponent],
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.css']
})
export class CategoriesTracksComponent {
  tracks = [
    { id: 1, artist: 'Messi', title: 'Mundial (track)', duration: '1:23', image: '/assets/img/icons/pop.png' },
    { id: 2, artist: 'Otro-artista', title: 'Otra-pista', duration: '2:34', image: '/assets/img/icons/rap.jpg' },
    { id: 3, artist: 'Tercer-artista', title: 'Tercera-pista', duration: '3:45', image: '/assets/img/icons/rock.jpeg' }
  ];

  showReportModal = signal(false);
  selectedTrackId = signal<number | null>(null);
  openDropdowns = signal<Set<number>>(new Set());

  toggleDropdown(trackId: number) {
    const open = this.openDropdowns();
    if (open.has(trackId)) {
      open.delete(trackId);
    } else {
      open.add(trackId);
    }
    this.openDropdowns.set(new Set(open));
  }

  isDropdownOpen(trackId: number): boolean {
    return this.openDropdowns().has(trackId);
  }

  openReportModal(trackId: number) {
    this.selectedTrackId.set(trackId);
    this.showReportModal.set(true);
  }

  closeReportModal() {
    this.showReportModal.set(false);
    this.selectedTrackId.set(null);
  }

  onReportSubmitted() {
    this.closeReportModal();
    // TODO: Mostrar mensaje de éxito
  }
}
