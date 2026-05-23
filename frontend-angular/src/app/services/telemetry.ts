import { Injectable, signal } from '@angular/core';
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

@Injectable({ providedIn: 'root' })
export class Telemetry {
  private socket: Socket;
  private metricsState = signal<QueryMetric[]>([]);

  constructor() {
    this.socket = io('http://localhost:3001');

    this.socket.on('new-query', (metric: QueryMetric) => {
      this.metricsState.update(list => [metric, ...list]);
    });

    this.socket.on('update-query', (updated: QueryMetric) => {
      this.metricsState.update(list => 
        list.map(m => m.id === updated.id ? updated : m)
      );
    });
  }

  get metrics() {
    return this.metricsState.asReadonly();
  }
}