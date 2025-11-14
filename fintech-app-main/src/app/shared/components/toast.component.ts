import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '@core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      @for (notification of notificationService.notifications$(); track notification.id) {
        <div class="toast" [class]="'toast-' + notification.type">
          <div class="toast-icon">
            @switch (notification.type) {
              @case ('success') {
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              }
              @case ('error') {
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              }
              @case ('warning') {
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              }
              @case ('info') {
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              }
            }
          </div>

          <div class="toast-content">
            <div class="toast-title">{{ notification.title }}</div>
            <div class="toast-message">{{ notification.message }}</div>
          </div>

          <button class="toast-close" (click)="close(notification.id)" aria-label="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      border-left: 4px solid;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-success {
      border-left-color: #28a745;
    }

    .toast-error {
      border-left-color: #dc3545;
    }

    .toast-warning {
      border-left-color: #ffc107;
    }

    .toast-info {
      border-left-color: #17a2b8;
    }

    .toast-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
    }

    .toast-success .toast-icon {
      color: #28a745;
    }

    .toast-error .toast-icon {
      color: #dc3545;
    }

    .toast-warning .toast-icon {
      color: #ffc107;
    }

    .toast-info .toast-icon {
      color: #17a2b8;
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-weight: 600;
      font-size: 0.95rem;
      color: #333;
      margin-bottom: 4px;
    }

    .toast-message {
      font-size: 0.875rem;
      color: #666;
      line-height: 1.4;
    }

    .toast-close {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      padding: 0;
      background: none;
      border: none;
      color: #999;
      cursor: pointer;
      transition: color 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast-close:hover {
      color: #333;
    }

    @media (max-width: 480px) {
      .toast-container {
        left: 10px;
        right: 10px;
        top: 70px;
        max-width: none;
      }
    }
  `]
})
export class ToastComponent {
  notificationService = inject(NotificationService);

  close(id: number) {
    this.notificationService.remove(id);
  }
}
