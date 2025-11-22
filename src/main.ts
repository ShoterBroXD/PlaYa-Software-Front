import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { provideZonelessChangeDetection } from '@angular/core';

bootstrapApplication(App, {
  ...appConfig,
  providers: [provideZonelessChangeDetection(), ...(appConfig.providers ?? [])],
}).catch((err) => console.error(err));
