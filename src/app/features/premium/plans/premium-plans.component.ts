import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PremiumPlan } from '../../../core/models/premium.model';

@Component({
  selector: 'app-premium-plans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './premium-plans.component.html',
  styleUrls: ['./premium-plans.component.css'],
})
export class PremiumPlansComponent {
  plans: PremiumPlan[] = [
    {
      type: 'FREE',
      name: 'Plan Gratuito',
      price: 'Gratis',
      benefits: [
        'Escucha con anuncios',
        'Calidad de audio estándar',
        'Playlists limitadas',
        'Soporte básico',
      ],
    },
    {
      type: 'PREMIUM',
      name: 'Plan Premium',
      price: '$9.99/mes',
      benefits: [
        'Escucha sin anuncios',
        'Descarga para offline',
        'Calidad de audio superior',
        'Playlists ilimitadas',
        'Soporte prioritario',
        'Apoya a artistas independientes',
      ],
    },
  ];

  constructor(private router: Router) {}

  selectPlan(plan: PremiumPlan): void {
    if (plan.type === 'PREMIUM') {
      this.router.navigate(['/premium/payment'], { state: { selectedPlan: plan } });
    } else {
      // Para plan gratuito, quizás redirigir o mostrar mensaje
      alert('Ya tienes el plan gratuito activo.');
    }
  }
}