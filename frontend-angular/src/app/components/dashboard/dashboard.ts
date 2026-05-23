import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelemetryService, QueryMetric } from '../../services/telemetry';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  metrics: QueryMetric[] = [];

  constructor(private telemetryService: TelemetryService) {}

  ngOnInit(): void {
    this.telemetryService.getMetrics().subscribe((data) => {
      this.metrics = data;
    });
  }

  // Simple aggregation calculations for our KPI indicators
  get totalQueriesProcessed(): number {
    return this.metrics.length;
  }

  get totalPrsDeployed(): number {
    return this.metrics.filter(m => m.status.includes('PR')).length;
  }
}