# Implementación de Internacionalización (i18n) - PlaYa

## ✅ Funcionalidades Implementadas

### 1. **Sistema de Traducción Completo**
- ✅ Instalación de `@ngx-translate/core` y `@ngx-translate/http-loader`
- ✅ Configuración de TranslateModule en `app.config.ts`
- ✅ Archivos de traducción en 3 idiomas:
  - 🇪🇸 Español (`src/assets/i18n/es.json`)
  - 🇬🇧 Inglés (`src/assets/i18n/en.json`)
  - 🇧🇷 Portugués (`src/assets/i18n/pt.json`)

### 2. **Servicio de Traducción Personalizado**
Archivo: `src/app/core/services/translation.service.ts`

**Características:**
- ✅ Mapeo entre formato del backend ('Español', 'Inglés', 'Português') y códigos de idioma ('es', 'en', 'pt')
- ✅ Inicialización automática del idioma al cargar la app
- ✅ Sincronización con el backend (guarda la preferencia del usuario)
- ✅ Persistencia en localStorage
- ✅ Carga del idioma guardado del usuario autenticado
- ✅ Cambio dinámico de idioma sin recargar la página

### 3. **Integración con Backend**
- ✅ Usa el endpoint existente: `PUT /users/{id}/settings/language`
- ✅ Compatible con el modelo de usuario actual
- ✅ Guarda la preferencia de idioma en la base de datos

### 4. **Componentes Actualizados con i18n**

#### ✅ Configuration Component (Configuración)
- Completamente traducido
- Cambio de idioma integrado con el selector existente
- Al cambiar el idioma en el dropdown y guardar:
  1. Se guarda en el backend
  2. Se aplica inmediatamente en toda la UI
  3. Se persiste en localStorage

#### ✅ Navbar Component
- Todos los enlaces de navegación traducidos
- Búsqueda con placeholder traducido
- Aria-labels traducidos para accesibilidad

#### ✅ Landing Page Component
- Hero section traducido
- Features section traducido
- CTA traducido
- Footer traducido

#### ✅ Home Component
- Mensajes de bienvenida traducidos
- Información de sesión traducida
- Demo del reproductor traducido
- Acciones rápidas traducidas

### 5. **Inicialización Automática**
Archivo: `src/app/app.ts`
- ✅ El idioma se inicializa automáticamente al abrir la aplicación
- ✅ Orden de prioridad:
  1. Idioma guardado en localStorage
  2. Idioma del navegador
  3. Español por defecto

---

## 🚀 Cómo Probar el Cambio de Idioma

### Opción 1: Desde Configuración (Recomendado)

1. **Iniciar sesión** en la aplicación
2. Ir a **Configuración** (icono de engranaje en la navbar)
3. En la sección **"Extra"**, localizar **"Idioma de la App"**
4. Seleccionar el idioma deseado:
   - Español
   - Inglés
   - Português
5. Hacer clic en **"Guardar Cambios"**
6. ✅ **Toda la interfaz cambia inmediatamente** al nuevo idioma

### Opción 2: Programática (Para Testing)

```typescript
// En cualquier componente, inyectar TranslationService
private translationService = inject(TranslationService);

// Cambiar a inglés
this.translationService.changeLanguage('en');

// Cambiar a portugués
this.translationService.changeLanguage('pt');

// Cambiar a español
this.translationService.changeLanguage('es');
```

---

## 📋 Estructura de Archivos Creados/Modificados

### Archivos Nuevos:
```
src/
  assets/
    i18n/
      ├── es.json          (Traducciones en español)
      ├── en.json          (Traducciones en inglés)
      └── pt.json          (Traducciones en portugués)
  app/
    core/
      services/
        └── translation.service.ts   (Servicio de traducción personalizado)
```

### Archivos Modificados:
```
src/app/
  ├── app.config.ts                           (Configuración de TranslateModule)
  ├── app.ts                                   (Inicialización de idioma)
  ├── features/
  │   ├── configuration/
  │   │   ├── configuration.component.ts      (Integración de traducción)
  │   │   └── configuration.component.html    (Template con pipes translate)
  │   ├── landing/
  │   │   ├── landing.component.ts            (Import TranslateModule)
  │   │   └── landing.component.html          (Template con pipes translate)
  │   └── home/
  │       └── home.component.html             (Template con pipes translate)
  └── shared/
      └── navbar/
          ├── navbar.component.ts             (Import TranslateModule)
          └── navbar.component.html           (Template con pipes translate)
```

---

## 🔧 API de TranslationService

### Métodos Principales:

#### `initializeLanguage()`
Inicializa el idioma desde localStorage o navegador.
```typescript
this.translationService.initializeLanguage();
```

#### `loadUserLanguage()`
Carga el idioma guardado del usuario desde el backend.
```typescript
this.translationService.loadUserLanguage();
```

#### `changeLanguage(langCode: string)`
Cambia el idioma de la UI (sin guardar en backend).
```typescript
this.translationService.changeLanguage('en'); // 'es', 'en', 'pt'
```

#### `saveLanguagePreference(backendLanguage)`
Guarda el idioma en el backend Y cambia la UI.
```typescript
this.translationService.saveLanguagePreference('Inglés').subscribe({
  next: () => console.log('Idioma guardado'),
  error: (err) => console.error('Error:', err)
});
```

#### `getCurrentLanguage()`
Obtiene el código del idioma actual.
```typescript
const lang = this.translationService.getCurrentLanguage(); // 'es', 'en', 'pt'
```

#### `instant(key: string, params?: any)`
Traduce una clave de forma síncrona.
```typescript
const text = this.translationService.instant('nav.home');
```

---

## 📝 Cómo Agregar Nuevas Traducciones

### 1. Agregar claves a los archivos JSON:

**es.json:**
```json
{
  "mySection": {
    "title": "Mi Título",
    "description": "Mi descripción"
  }
}
```

**en.json:**
```json
{
  "mySection": {
    "title": "My Title",
    "description": "My description"
  }
}
```

**pt.json:**
```json
{
  "mySection": {
    "title": "Meu Título",
    "description": "Minha descrição"
  }
}
```

### 2. Usar en el template HTML:

```html
<h1>{{ 'mySection.title' | translate }}</h1>
<p>{{ 'mySection.description' | translate }}</p>
```

### 3. Importar TranslateModule en el componente:

```typescript
import { TranslateModule } from '@ngx-translate/core';

@Component({
  imports: [CommonModule, TranslateModule], // Agregar TranslateModule
  // ...
})
```

---

## 🎯 Comportamiento Esperado

### Al Iniciar la Aplicación:
1. Se carga el idioma guardado en localStorage (si existe)
2. Si no existe, se usa el idioma del navegador
3. Si el usuario está autenticado, se carga su preferencia del backend

### Al Cambiar el Idioma en Configuración:
1. El usuario selecciona un idioma del dropdown
2. Hace clic en "Guardar Cambios"
3. Se envía la petición al backend: `PUT /users/{id}/settings/language`
4. Si la petición es exitosa:
   - ✅ El idioma se cambia inmediatamente en toda la UI
   - ✅ Se guarda en localStorage
   - ✅ Se muestra mensaje de éxito
5. La próxima vez que el usuario inicie sesión, se cargará su idioma guardado

### Persistencia:
- ✅ El idioma se mantiene entre sesiones (localStorage)
- ✅ El idioma se sincroniza con el backend
- ✅ Si el usuario cambia de dispositivo, el backend le devuelve su idioma preferido

---

## 🐛 Solución de Problemas

### El idioma no cambia al seleccionarlo:
- Verificar que se haya hecho clic en "Guardar Cambios"
- Verificar que el backend responda correctamente al endpoint de idioma
- Revisar la consola del navegador para errores

### Las traducciones no aparecen:
- Verificar que los archivos JSON estén en `src/assets/i18n/`
- Verificar que el componente tenga `TranslateModule` en sus imports
- Verificar que la clave de traducción exista en los archivos JSON

### El idioma no persiste al recargar:
- Verificar que el localStorage esté habilitado en el navegador
- Verificar que el backend guarde correctamente la preferencia

---

## 📚 Recursos

- **ngx-translate Documentation**: https://github.com/ngx-translate/core
- **Angular i18n Guide**: https://angular.io/guide/i18n
- **Translation Service**: `src/app/core/services/translation.service.ts`

---

## ✨ Mejoras Futuras

1. **Agregar más idiomas**: Francés, Alemán, etc.
2. **Traducción automática con API**: Google Translate, DeepL
3. **Detección automática de región**: es-MX, es-ES, pt-BR, pt-PT
4. **Interpolación de variables**: `{{ 'welcome' | translate: {name: userName} }}`
5. **Pluralización**: Manejar singular/plural en traducciones
6. **Lazy loading de traducciones**: Cargar solo el idioma necesario

---

**Estado**: ✅ Implementación completa y funcional  
**Fecha**: 21 de Noviembre, 2025  
**Versión**: 1.0.0
