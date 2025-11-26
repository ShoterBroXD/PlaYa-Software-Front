import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslationService } from './core/services/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  title = 'Playa-Front';
  private translationService = inject(TranslationService);

  ngOnInit(): void {
    // Inicializar el idioma al cargar la aplicación
    this.translationService.initializeLanguage();
  }
}
