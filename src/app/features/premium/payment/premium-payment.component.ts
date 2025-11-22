import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PremiumService } from '../../../core/services/premium.service';
import { PremiumPlan, SubscriptionRequest } from '../../../core/models/premium.model';

@Component({
  selector: 'app-premium-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './premium-payment.component.html',
  styleUrls: ['./premium-payment.component.css'],
})
export class PremiumPaymentComponent implements OnInit {
  selectedPlan: PremiumPlan | null = null;
  paymentForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private premiumService: PremiumService,
    private router: Router
  ) {
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
      name: ['', [Validators.required]],
    });

    // Obtener plan seleccionado del state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.selectedPlan = navigation.extras.state['selectedPlan'];
    }
  }

  ngOnInit(): void {
    if (!this.selectedPlan) {
      this.router.navigate(['/premium']);
    }
  }

  get cardNumber() {
    return this.paymentForm.get('cardNumber');
  }

  get expiryDate() {
    return this.paymentForm.get('expiryDate');
  }

  get cvv() {
    return this.paymentForm.get('cvv');
  }

  get name() {
    return this.paymentForm.get('name');
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const request: SubscriptionRequest = {
      paymentMethod: 'CARD', // Simulado
      planType: 'MONTHLY',
    };

    this.premiumService.subscribe(request).subscribe({
      next: (response) => {
        console.log('Suscripción exitosa', response);
        alert('¡Suscripción premium activada exitosamente!');
        this.router.navigate(['/home']); // O dashboard
      },
      error: (error) => {
        console.error('Error en suscripción', error);
        if (error.status === 400) {
          this.errorMessage = 'Datos de pago inválidos. Verifica la información.';
        } else {
          this.errorMessage = error.message || 'Error al procesar el pago.';
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/premium']);
  }
}