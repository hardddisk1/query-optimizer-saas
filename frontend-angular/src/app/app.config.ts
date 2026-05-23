import { ApplicationConfig, importProvidersFrom } from '@angular/core'; // Add importProvidersFrom
import { provideRouter } from '@angular/router';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io'; // Add these
import { routes } from './app.routes';

const config: SocketIoConfig = { url: 'http://localhost:3001', options: {} };

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // This connects your app to the backend's WebSocket server
    importProvidersFrom(SocketIoModule.forRoot(config)) 
  ]
};