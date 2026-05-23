import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface QueryMetric {
  id: string;
  query: string;
  executionTime: number;
  appName: string;
  status: string;
  timestamp: string;
  proposedFix: string;
  prUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class TelemetryService {
  private socket: Socket;
  private metricsList: QueryMetric[] = [];
  private metricsSubject = new BehaviorSubject<QueryMetric[]>([]);

  constructor() {
    // Connect live to our Node.js WebSocket engine
    this.socket = io('http://localhost:3000');

    // Handle initial connection mapping
    this.socket.on('connect', () => {
      console.log('Connected directly to backend socket pipeline.');
    });

    // Capture incoming streaming payloads
    this.socket.on('new-query', (metric: QueryMetric) => {
      this.metricsList = [metric, ...this.metricsList];
      this.metricsSubject.next(this.metricsList);
    });

    // Capture post-AI optimization state shifts
    this.socket.on('update-query', (updatedMetric: QueryMetric) => {
      this.metricsList = this.metricsList.map(m => m.id === updatedMetric.id ? updatedMetric : m);
      this.metricsSubject.next(this.metricsList);
    });
  }

  // Expose the data stream to the component controllers cleanly
  getMetrics(): Observable<QueryMetric[]> {
    return this.metricsSubject.asObservable();
  }
}