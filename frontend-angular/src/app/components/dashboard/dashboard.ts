import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Telemetry } from '../../services/telemetry';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class Dashboard {
  private telemetry = inject(Telemetry);
  
  // Expose the signal
  metrics = this.telemetry.metrics;

  // Computed signal - Angular tracks this safely
  totalPrs = computed(() => 
    this.metrics().filter(m => m.status.includes('PR')).length
  );
}