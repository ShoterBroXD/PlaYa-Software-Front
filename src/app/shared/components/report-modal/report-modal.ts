import { Component, EventEmitter, Input, Output, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService, ReportRequest, ReportResponse } from '../../../core/services/report.service';

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-modal.html',
  styleUrls: ['./report-modal.css']
})
export class ReportModalComponent implements OnChanges {
  @Input() contentType: 'SONG' | 'COMMENT' | 'PLAYLIST' = 'SONG';
  @Input() contentId: number = 0;
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  // Form data
  reportData: ReportRequest = {
    contentType: 'SONG',
    contentId: 0,
    reason: '',
    description: ''
  };

  // UI state
  isSubmitting = signal(false);
  errorMessage = signal('');

  // Predefined reasons
  reasons = [
    'Contenido ofensivo',
    'Spam',
    'Violencia',
    'Contenido inapropiado',
    'Derechos de autor',
    'Otro'
  ];

  constructor(private reportService: ReportService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['contentType'] || changes['contentId']) {
      this.reportData.contentType = this.contentType;
      this.reportData.contentId = this.contentId;
    }
  }

  closeModal() {
    this.close.emit();
    this.resetForm();
  }

  onSubmit() {
    if (!this.reportData.reason.trim()) {
      this.errorMessage.set('Por favor selecciona un motivo para el reporte');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.reportService.reportContent(this.reportData).subscribe({
      next: (response) => {
        this.submitted.emit();
        this.closeModal();
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Error al enviar el reporte');
        this.isSubmitting.set(false);
      }
    });
  }

  private resetForm() {
    this.reportData = {
      contentType: this.contentType,
      contentId: this.contentId,
      reason: '',
      description: ''
    };
    this.errorMessage.set('');
    this.isSubmitting.set(false);
  }
}
