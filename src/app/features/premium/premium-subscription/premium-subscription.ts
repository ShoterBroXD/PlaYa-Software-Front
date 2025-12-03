import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PremiumService } from '../../../core/services/premium.service';
import { AuthService } from '../../../core/services/auth.service';
import { PremiumStatus, SubscriptionRequest } from '../../../core/models/premium.model';

@Component({
  selector: 'app-premium-subscription',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './premium-subscription.html',
  styleUrls: ['./premium-subscription.css']
})
export class PremiumSubscriptionComponent implements OnInit {
  // Estado del usuario premium
  premiumStatus = signal<PremiumStatus | null>(null);
  benefits = signal<string[]>([]);
  pricing = signal<any>({});

  // Formulario de suscripción
  subscriptionRequest: SubscriptionRequest = {
    paymentMethod: '',
    planType: 'MONTHLY'
  };

  // UI state
  isLoading = signal(false);
  isSubscribing = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // Planes disponibles
  plans = [
    {
      id: 'MONTHLY',
      name: 'Mensual',
      price: '$9.99',
      period: 'mes',
      popular: false
    },
    {
      id: 'YEARLY',
      name: 'Anual',
      price: '$99.99',
      period: 'año',
      popular: true,
      savings: 'Ahorra $19.89'
    }
  ];

  // Métodos de pago
  paymentMethods = [
    { id: 'CREDIT_CARD', name: 'Tarjeta de Crédito', icon: 'fas fa-credit-card' },
    { id: 'PAYPAL', name: 'PayPal', icon: 'fab fa-paypal' },
    { id: 'BANK_TRANSFER', name: 'Transferencia Bancaria', icon: 'fas fa-university' }
  ];

  selectedPlan = signal('MONTHLY');

  constructor(
    private premiumService: PremiumService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadPremiumData();
    this.checkCurrentStatus();
  }

  private loadPremiumData() {
    this.premiumService.getBenefits().subscribe({
      next: (data) => {
        this.benefits.set(data.benefits || [
          'Música sin anuncios',
          'Descargas ilimitadas',
          'Calidad de audio HD',
          'Acceso a contenido exclusivo',
          'Soporte prioritario',
          'Personalización avanzada'
        ]);
        this.pricing.set(data.pricing || {});
      },
      error: (error) => {
        console.error('Error loading premium benefits:', error);
        // Establecer beneficios por defecto si falla
        this.benefits.set([
          'Música sin anuncios',
          'Descargas ilimitadas',
          'Calidad de audio HD',
          'Acceso a contenido exclusivo',
          'Soporte prioritario',
          'Personalización avanzada'
        ]);
      }
    });
  }

  private checkCurrentStatus() {
    const user = this.authService.getCurrentUser();
    if (user?.idUser) {
      this.errorMessage.set(''); // Limpiar mensaje de error si hay usuario
      this.premiumService.getStatus(user.idUser).subscribe({
        next: (status) => {
          this.premiumStatus.set(status);
        },
        error: (error) => {
          console.error('Error checking premium status:', error);
          // Establecer estado por defecto si falla
          this.premiumStatus.set({
            userId: user.idUser!,
            isPremium: false,
            planType: 'FREE',
            status: 'INACTIVE'
          });
        }
      });
    } else {
      console.warn('No hay usuario autenticado');
      // No mostrar este error aquí, solo si intenta suscribirse
      this.premiumStatus.set(null);
    }
  }

  selectPlan(planId: string) {
    this.selectedPlan.set(planId);
    this.subscriptionRequest.planType = planId as 'MONTHLY' | 'YEARLY';
  }

  subscribe() {
    if (!this.subscriptionRequest.paymentMethod) {
      this.errorMessage.set('Por favor selecciona un método de pago');
      return;
    }

    this.isSubscribing.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.premiumService.subscribe(this.subscriptionRequest).subscribe({
      next: (response) => {
        this.successMessage.set('¡Suscripción premium activada exitosamente!');
        this.isSubscribing.set(false);
        // Actualizar estado local
        this.checkCurrentStatus();
        // Redirigir después de 2 segundos
        setTimeout(() => {
          const userType = this.authService.resolveUserType();
          if (userType === 'ARTIST') {
            this.router.navigate(['/dashboard-artista']);
          } else if (userType === 'LISTENER') {
            this.router.navigate(['/dashboard-usuario']);
          } else {
            this.router.navigate(['/home']);
          }
        }, 2000);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Error al procesar la suscripción');
        this.isSubscribing.set(false);
      }
    });
  }

  cancelSubscription() {
    const user = this.authService.getCurrentUser();
    if (!user?.idUser) return;

    if (confirm('¿Estás seguro de que quieres cancelar tu suscripción premium?')) {
      this.isLoading.set(true);
      this.premiumService.cancel(user.idUser).subscribe({
        next: () => {
          this.successMessage.set('Suscripción premium cancelada exitosamente');
          this.checkCurrentStatus();
          this.isLoading.set(false);
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message || 'Error al cancelar la suscripción');
          this.isLoading.set(false);
        }
      });
    }
  }

  isPremiumActive = computed(() => {
    const status = this.premiumStatus();
    return status?.isPremium && status?.status === 'ACTIVE';
  });
}
