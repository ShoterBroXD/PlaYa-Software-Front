import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translate = inject(TranslateService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  // Mapeo de idiomas del backend al código de idioma
  private languageMap: { [key: string]: string } = {
    'Español': 'es',
    'Inglés': 'en',
    'Português': 'pt'
  };

  // Mapeo inverso: código de idioma al formato del backend
  private reverseLanguageMap: { [key: string]: string } = {
    'es': 'Español',
    'en': 'Inglés',
    'pt': 'Português'
  };

  constructor() {
    // Configurar idiomas disponibles
    this.translate.addLangs(['es', 'en', 'pt']);
    this.translate.setDefaultLang('es');
  }

  /**
   * Inicializa el idioma desde el localStorage o del usuario autenticado
   */
  initializeLanguage(): void {
    // Intentar obtener idioma guardado en localStorage
    const savedLang = localStorage.getItem('app_language');

    if (savedLang && this.translate.getLangs().includes(savedLang)) {
      this.translate.use(savedLang);
    } else {
      // Si no hay idioma guardado, usar el del navegador o español por defecto
      const browserLang = this.translate.getBrowserLang();
      const langToUse = browserLang && this.translate.getLangs().includes(browserLang)
        ? browserLang
        : 'es';
      this.translate.use(langToUse);
      localStorage.setItem('app_language', langToUse);
    }
  }

  /**
   * Carga el idioma del usuario desde el backend
   */
  loadUserLanguage(): void {
    const userId = this.authService.getUserId();

    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (user: any) => {
          if (user.language && this.languageMap[user.language]) {
            const langCode = this.languageMap[user.language];
            this.changeLanguage(langCode);
          }
        },
        error: (error: any) => {
          console.error('Error loading user language:', error);
        }
      });
    }
  }

  /**
   * Cambia el idioma de la aplicación
   * @param langCode Código del idioma ('es', 'en', 'pt')
   */
  changeLanguage(langCode: string): void {
    if (this.translate.getLangs().includes(langCode)) {
      this.translate.use(langCode);
      localStorage.setItem('app_language', langCode);
    }
  }

  /**
   * Guarda el idioma en el backend y cambia el idioma de la UI
   * @param backendLanguage Idioma en formato del backend ('Español', 'Inglés', 'Português')
   * @returns Observable del resultado de la operación
   */
  saveLanguagePreference(backendLanguage: 'Español' | 'Inglés' | 'Português') {
    const userId = this.authService.getUserId();

    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Convertir el idioma del backend al código de idioma
    const langCode = this.languageMap[backendLanguage];

    console.log('saveLanguagePreference - backendLanguage:', backendLanguage);
    console.log('saveLanguagePreference - langCode:', langCode);
    console.log('saveLanguagePreference - userId:', userId);

    if (!langCode) {
      console.error('Invalid language:', backendLanguage);
      throw new Error('Invalid language');
    }

    // Primero cambiar el idioma en la UI
    this.changeLanguage(langCode);

    // Luego guardar en el backend
    return this.userService.updateUserLanguage(userId, backendLanguage);
  }  /**
   * Obtiene el idioma actual en formato de código ('es', 'en', 'pt')
   */
  getCurrentLanguage(): string {
    return this.translate.currentLang || this.translate.defaultLang || 'es';
  }

  /**
   * Obtiene el idioma actual en formato del backend ('Español', 'Inglés', 'Português')
   */
  getCurrentLanguageForBackend(): string {
    const currentLang = this.getCurrentLanguage();
    return this.reverseLanguageMap[currentLang] || 'Español';
  }

  /**
   * Convierte el código de idioma al formato del backend
   */
  getBackendLanguageFromCode(langCode: string): string {
    return this.reverseLanguageMap[langCode] || 'Español';
  }

  /**
   * Convierte el idioma del backend a código de idioma
   */
  getLanguageCodeFromBackend(backendLang: string): string {
    return this.languageMap[backendLang] || 'es';
  }

  /**
   * Obtiene una traducción de forma síncrona
   */
  instant(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  /**
   * Obtiene una traducción de forma asíncrona
   */
  get(key: string, params?: any) {
    return this.translate.get(key, params);
  }
}
