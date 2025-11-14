import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ReportService } from '@core/services/report.service';
import { TransactionByTypeDTO } from '@core/models/report.model';
import { TransactionValidators } from '../../transactions/validators/transaction.validators';

// Registrar todos los componentes de Chart.js
Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-transaction-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseChartDirective],
  template: `
    <div class="reports-container">
      <div class="reports-header">
        <h2>Reportes de Transacciones</h2>
        <p class="subtitle">Análisis de transacciones por tipo</p>
      </div>

      <!-- Filtros de fecha -->
      <div class="filters-panel">
        <form [formGroup]="filterForm" (ngSubmit)="loadReport()">
          <div class="form-group">
            <label for="startDate">Fecha Inicio</label>
            <input
              id="startDate"
              type="date"
              formControlName="startDate"
              class="form-control">
          </div>

          <div class="form-group">
            <label for="endDate">Fecha Fin</label>
            <input
              id="endDate"
              type="date"
              formControlName="endDate"
              class="form-control">
          </div>

          <div class="filter-actions">
            <button type="submit" class="btn btn-primary" [disabled]="filterForm.invalid || loading()">
              @if (loading()) {
                <span class="spinner"></span>
                <span>Cargando...</span>
              } @else {
                <span>Generar Reporte</span>
              }
            </button>
          </div>

          @if (filterForm.hasError('dateRangeInvalid') && (filterForm.get('startDate')?.touched || filterForm.get('endDate')?.touched)) {
            <div class="form-error-full">
              <small class="error">La fecha de inicio no puede ser mayor a la fecha fin</small>
            </div>
          }
        </form>
      </div>

      @if (errorMessage()) {
        <div class="alert alert-error">
          <span class="alert-icon">⚠️</span>
          <span>{{ errorMessage() }}</span>
        </div>
      }

      @if (reportData().length > 0) {
        <!-- Tarjetas de resumen -->
        <div class="summary-cards">
          @for (item of reportData(); track item.type) {
            <div class="summary-card" [class.deposit]="item.type === 'DEPOSIT'" [class.withdraw]="item.type === 'WITHDRAW'">
              <div class="card-icon">{{ item.type === 'DEPOSIT' ? '💰' : '💸' }}</div>
              <div class="card-content">
                <h3>{{ item.type === 'DEPOSIT' ? 'Depósitos' : 'Retiros' }}</h3>
                <p class="amount">{{ '$' + item.totalAmount.toFixed(2) }}</p>
                <p class="count">{{ item.count }} transacciones</p>
                <p class="percentage">{{ item.percentage.toFixed(1) }}% del total</p>
              </div>
            </div>
          }
        </div>

        <!-- Gráficos -->
        <div class="charts-container">
          <!-- Gráfico de Barras -->
          <div class="chart-card">
            <h3>Comparación por Tipo</h3>
            <div class="chart-wrapper">
              <canvas baseChart
                [data]="barChartData()"
                [options]="barChartOptions"
                [type]="barChartType">
              </canvas>
            </div>
          </div>

          <!-- Gráfico de Torta -->
          <div class="chart-card">
            <h3>Distribución por Cantidad</h3>
            <div class="chart-wrapper">
              <canvas baseChart
                [data]="pieChartData()"
                [options]="pieChartOptions"
                [type]="pieChartType">
              </canvas>
            </div>
          </div>
        </div>
      } @else if (!loading()) {
        <div class="empty-state">
          <p>📊 Selecciona un rango de fechas para generar el reporte</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .reports-container {
      padding: var(--spacing-xl);
      max-width: 1400px;
      margin: 0 auto;
    }
    .reports-header {
      margin-bottom: var(--spacing-xl);
    }
    .reports-header h2 {
      margin: 0;
      color: var(--color-primary);
      font-size: var(--font-size-3xl);
    }
    .subtitle {
      color: var(--color-text-secondary);
      margin-top: var(--spacing-sm);
    }
    .filters-panel {
      background: var(--color-background-light);
      padding: var(--spacing-lg);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-xl);
      box-shadow: var(--shadow-sm);
    }
    .filters-panel form {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: var(--spacing-md);
      align-items: end;
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    .form-group label {
      margin-bottom: var(--spacing-sm);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
    }
    .form-control {
      padding: var(--spacing-sm);
      border: 1px solid var(--color-border-light);
      border-radius: var(--border-radius-sm);
      font-size: var(--font-size-base);
    }
    .form-error {
      display: flex;
      align-items: center;
    }
    .form-error .error {
      color: var(--color-danger);
      font-size: var(--font-size-sm);
      margin-top: var(--spacing-xs);
    }
    .form-error-full {
      grid-column: 1 / -1;
      background: var(--color-danger-light);
      padding: var(--spacing-sm);
      border-radius: var(--border-radius-sm);
      border-left: 3px solid var(--color-danger);
    }
    .form-error-full .error {
      color: var(--color-danger);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }
    .filter-actions {
      display: flex;
      gap: var(--spacing-sm);
    }
    .btn {
      padding: 0.75rem var(--spacing-lg);
      border-radius: var(--border-radius-sm);
      font-weight: var(--font-weight-medium);
      border: none;
      cursor: pointer;
      transition: var(--transition-base);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
    .btn-primary {
      background: var(--color-secondary);
      color: var(--color-text-light);
    }
    .btn-primary:hover:not(:disabled) {
      background: var(--color-secondary-light);
      transform: translateY(-2px);
    }
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid var(--color-text-light);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .alert {
      padding: var(--spacing-md);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-xl);
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
    .alert-error {
      background: var(--color-danger-light);
      color: var(--color-danger);
      border: 1px solid var(--color-danger);
    }
    .alert-icon {
      font-size: 1.2rem;
    }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-xl);
    }
    .summary-card {
      background: var(--color-background-light);
      padding: var(--spacing-xl);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-md);
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      transition: var(--transition-base);
    }
    .summary-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }
    .summary-card.deposit {
      border-left: 4px solid var(--color-success);
    }
    .summary-card.withdraw {
      border-left: 4px solid var(--color-warning);
    }
    .card-icon {
      font-size: 3rem;
    }
    .card-content h3 {
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--color-text-primary);
      font-size: var(--font-size-lg);
    }
    .amount {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--color-primary);
      margin: var(--spacing-xs) 0;
    }
    .count {
      color: var(--color-text-secondary);
      font-size: var(--font-size-sm);
      margin: var(--spacing-xs) 0;
    }
    .percentage {
      color: var(--color-secondary);
      font-weight: var(--font-weight-semibold);
      margin: var(--spacing-xs) 0;
    }
    .charts-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: var(--spacing-xl);
    }
    .chart-card {
      background: var(--color-background-light);
      padding: var(--spacing-xl);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-md);
    }
    .chart-card h3 {
      margin: 0 0 var(--spacing-lg) 0;
      color: var(--color-text-primary);
      font-size: var(--font-size-xl);
      text-align: center;
    }
    .chart-wrapper {
      height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .empty-state {
      text-align: center;
      padding: var(--spacing-3xl);
      color: var(--color-text-secondary);
      font-size: var(--font-size-lg);
    }
    @media (max-width: 768px) {
      .filters-panel form {
        grid-template-columns: 1fr;
      }
      .charts-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TransactionReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private fb = inject(FormBuilder);

  reportData = signal<TransactionByTypeDTO[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  filterForm: FormGroup = this.fb.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required]
  }, { validators: TransactionValidators.dateRange('startDate', 'endDate') });

  // Configuración gráfico de barras
  barChartType: ChartType = 'bar';
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y ?? 0;
            return `${label}: $${value.toFixed(2)}`;
          }
        }
      },
      datalabels: {
        anchor: 'center' as const,
        align: 'center' as const,
        formatter: (value: number) => '$' + value.toFixed(2),
        color: '#000',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 4,
        padding: 6,
        font: {
          weight: 'bold' as const,
          size: 14
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + value
        }
      }
    }
  };

  barChartData = signal<ChartData<'bar'>>({
    labels: [],
    datasets: []
  });

  // Configuración gráfico de torta
  pieChartType: ChartType = 'pie';
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value} transacciones`;
          }
        }
      },
      datalabels: {
        formatter: (value: number, context: any) => {
          const data = context.chart.data.datasets[0].data as number[];
          const total = data.reduce((acc: number, val: number) => acc + val, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${value}\n(${percentage}%)`;
        },
        color: '#000',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 4,
        padding: 6,
        font: {
          weight: 'bold' as const,
          size: 16
        }
      }
    }
  };

  pieChartData = signal<ChartData<'pie'>>({
    labels: [],
    datasets: []
  });

  ngOnInit() {
    // Establecer fechas por defecto (último mes)
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    this.filterForm.patchValue({
      startDate: lastMonth.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });

    // Cargar reporte automáticamente al iniciar el componente
    this.loadReport();
  }

  loadReport() {
    if (this.filterForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { startDate, endDate } = this.filterForm.value;

    this.reportService.getTransactionsByType(startDate, endDate).subscribe({
      next: (data) => {
        this.reportData.set(data);
        this.updateCharts(data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Error al cargar el reporte. Por favor, intenta nuevamente.');
        this.loading.set(false);
      }
    });
  }

  updateCharts(data: TransactionByTypeDTO[]) {
    const labels = data.map(item => item.type === 'DEPOSIT' ? 'Depósitos' : 'Retiros');
    const amounts = data.map(item => item.totalAmount);
    const counts = data.map(item => item.count);

    // Actualizar gráfico de barras
    this.barChartData.set({
      labels: labels,
      datasets: [
        {
          label: 'Monto Total',
          data: amounts,
          backgroundColor: ['rgba(40, 167, 69, 0.7)', 'rgba(255, 193, 7, 0.7)'],
          borderColor: ['rgba(40, 167, 69, 1)', 'rgba(255, 193, 7, 1)'],
          borderWidth: 2
        }
      ]
    });

    // Actualizar gráfico de torta
    this.pieChartData.set({
      labels: labels,
      datasets: [
        {
          data: counts,
          backgroundColor: ['rgba(40, 167, 69, 0.7)', 'rgba(255, 193, 7, 0.7)'],
          borderColor: ['rgba(40, 167, 69, 1)', 'rgba(255, 193, 7, 1)'],
          borderWidth: 2
        }
      ]
    });
  }
}
