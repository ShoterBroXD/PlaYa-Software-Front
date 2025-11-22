# Guía de Integración - Calificación de Canciones

## 📋 Resumen

Se ha integrado el sistema de calificación de canciones del backend con el frontend, cumpliendo con los requisitos de la US-012.

## 🎯 Funcionalidades Implementadas

### ✅ US-012: Calificar Canciones

#### Escenario 01: Calificar canción
- **Given**: El usuario está en una canción
- **When**: Selecciona una calificación (1-5 estrellas)
- **Then**: Se guarda la calificación y actualiza el puntaje promedio

#### Escenario 02: Calificación errónea
- **Given**: El oyente intenta dar una calificación baja (menor a 3)
- **When**: Presiona enviar
- **Then**: Se muestra confirmación antes de guardar la calificación baja

## 📦 Archivos Creados

### 1. Modelos (`src/app/core/models/song.model.ts`)
```typescript
- Song: Modelo de canción completo
- SongRequestDto: DTO para crear/actualizar canciones
- SongResponseDto: DTO de respuesta con calificaciones
- RateSongRequestDto: DTO para calificar canciones
- ArtistResponseDto: Información del artista
- CommentResponseDto: Comentarios de canciones
```

### 2. Servicio (`src/app/core/services/song.service.ts`)
```typescript
Métodos disponibles:
- createSong(): Crear canción (solo artistas)
- getSongById(): Obtener canción por ID
- updateSong(): Actualizar canción
- deleteSong(): Eliminar canción
- getSongComments(): Obtener comentarios
- getSongsByUser(): Canciones de un usuario
- getPublicSongs(): Todas las canciones públicas
- rateSong(): ⭐ Calificar canción (1-5 estrellas)
- reportSong(): Reportar canción (admin)
- unreportSong(): Quitar reporte (admin)
```

### 3. Componente de Calificación (`src/app/shared/components/song-rating/`)
Componente reutilizable para mostrar y permitir calificar canciones.

**Inputs:**
- `songId`: ID de la canción
- `currentRating`: Calificación promedio actual
- `ratingCount`: Número de calificaciones
- `readonly`: Si es solo lectura

**Outputs:**
- `ratingChanged`: Evento emitido cuando cambia la calificación

## 🚀 Cómo Usar

### 1. Importar en tu Componente

```typescript
import { SongRatingComponent } from '../../../shared/components/song-rating/song-rating.component';

@Component({
  selector: 'app-tu-componente',
  standalone: true,
  imports: [CommonModule, SongRatingComponent],
  // ...
})
```

### 2. Usar en el Template HTML

```html
<!-- Calificación interactiva -->
<app-song-rating
  [songId]="song.idSong"
  [currentRating]="song.averageRating || 0"
  [ratingCount]="song.ratingCount || 0"
  (ratingChanged)="onRatingChanged($event)">
</app-song-rating>

<!-- Calificación solo lectura -->
<app-song-rating
  [songId]="song.idSong"
  [currentRating]="song.averageRating || 0"
  [ratingCount]="song.ratingCount || 0"
  [readonly]="true">
</app-song-rating>
```

### 3. Manejar el Evento de Cambio

```typescript
onRatingChanged(event: { rating: number; averageRating: number }) {
  console.log('Nueva calificación:', event.rating);
  console.log('Promedio actualizado:', event.averageRating);
  // Actualizar tu modelo local si es necesario
  this.song.averageRating = event.averageRating;
}
```

## 🎨 Características del Componente

### ⭐ Sistema de Estrellas
- **5 estrellas clickeables** para calificar
- **Hover effect**: Vista previa al pasar el mouse
- **Visual feedback**: Diferentes colores para:
  - Estrellas vacías: Gris (#ddd)
  - Promedio general: Amarillo (#ffc107)
  - Calificación del usuario: Naranja (#ff9800)

### ✅ Validaciones
1. **Autenticación requerida**: Solo usuarios autenticados pueden calificar
2. **Confirmación para calificaciones bajas**: Si rating < 3, se pide confirmación
3. **Prevención de doble envío**: Deshabilita botones durante el envío
4. **Mensajes informativos**: 
   - Mensaje de éxito al calificar
   - Indicación para iniciar sesión si no está autenticado

### 📊 Información Mostrada
- Calificación promedio actual
- Número total de calificaciones
- Estado de carga durante el envío

## 🔌 Integración con Backend

### Endpoints Utilizados

**POST** `/api/v1/songs/{id}/rate`
```json
Request Body:
{
  "rating": 4
}

Response:
{
  "idSong": 1,
  "title": "Nombre de la canción",
  "averageRating": 4.2,
  "ratingCount": 15,
  // ... otros campos
}
```

### Autenticación
El servicio utiliza el token JWT del usuario autenticado automáticamente a través del `authInterceptor`.

## 📱 Ejemplo de Uso Completo

```typescript
// tu-componente.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SongService } from '../../core/services/song.service';
import { SongRatingComponent } from '../../shared/components/song-rating/song-rating.component';
import { SongResponseDto } from '../../core/models/song.model';

@Component({
  selector: 'app-song-detail',
  standalone: true,
  imports: [CommonModule, SongRatingComponent],
  template: `
    <div class="song-container" *ngIf="song">
      <img [src]="song.coverURL" [alt]="song.title">
      <h2>{{ song.title }}</h2>
      <p>{{ song.artist?.name }}</p>
      
      <!-- Componente de Calificación -->
      <app-song-rating
        [songId]="song.idSong"
        [currentRating]="song.averageRating || 0"
        [ratingCount]="song.ratingCount || 0"
        (ratingChanged)="onRatingChanged($event)">
      </app-song-rating>
    </div>
  `
})
export class SongDetailComponent implements OnInit {
  song?: SongResponseDto;

  constructor(private songService: SongService) {}

  ngOnInit() {
    this.loadSong(1); // ID de ejemplo
  }

  loadSong(id: number) {
    this.songService.getSongById(id).subscribe({
      next: (song) => {
        this.song = song;
        console.log('Canción cargada:', song);
      },
      error: (error) => {
        console.error('Error cargando canción:', error);
      }
    });
  }

  onRatingChanged(event: { rating: number; averageRating: number }) {
    console.log('Calificación actualizada:', event);
    if (this.song) {
      this.song.averageRating = event.averageRating;
    }
  }
}
```

## 🎯 Validaciones Implementadas

### 1. Rango de Calificación
- Mínimo: 1 estrella
- Máximo: 5 estrellas
- Validado en backend y frontend

### 2. Confirmación de Calificación Baja
```typescript
if (rating < 3) {
  const confirm = window.confirm(
    `¿Estás seguro de calificar con ${rating} estrella${rating > 1 ? 's' : ''}?`
  );
  if (!confirm) return;
}
```

### 3. Actualización Automática
- El backend recalcula automáticamente el promedio
- Actualiza el contador de calificaciones
- Permite actualizar calificación existente

## 🔐 Seguridad

1. **Autenticación JWT**: Token requerido para calificar
2. **Validación Backend**: El servidor valida el rating (1-5)
3. **Usuario único**: Cada usuario puede calificar una vez (puede actualizar)
4. **Interceptor de errores**: Manejo centralizado de errores HTTP

## 📝 Notas Adicionales

### Actualización de Calificaciones
- Si un usuario ya calificó, puede cambiar su calificación
- El backend actualiza automáticamente el promedio
- La nueva calificación reemplaza la anterior

### Estados del Componente
- **isSubmitting**: Previene múltiples envíos
- **isAuthenticated**: Controla si el usuario puede calificar
- **readonly**: Modo solo lectura (sin interacción)
- **hoverRating**: Vista previa al pasar el mouse

### Manejo de Errores
Errores comunes manejados:
- 401: No autenticado
- 403: Sin permisos
- 404: Canción no encontrada
- 400: Rating inválido
- 500: Error del servidor

## 🎨 Personalización CSS

Puedes personalizar los colores y estilos editando:
`src/app/shared/components/song-rating/song-rating.component.css`

Variables principales:
- `.star-empty`: Color estrellas vacías (#ddd)
- `.star-filled`: Color promedio (#ffc107)
- `.star-user-rated`: Color rating usuario (#ff9800)

## ✅ Checklist de Implementación

- [x] Modelo de datos (song.model.ts)
- [x] Servicio HTTP (song.service.ts)
- [x] Componente de calificación reutilizable
- [x] Confirmación para calificaciones bajas
- [x] Validación de autenticación
- [x] Manejo de errores
- [x] Feedback visual (hover, estados)
- [x] Integración con backend
- [x] Responsive design
- [x] Accesibilidad (aria-labels)

## 🚀 Próximos Pasos

Para usar en tu aplicación:

1. Importa `SongRatingComponent` en tu componente
2. Pasa los datos de la canción como inputs
3. Maneja el evento `ratingChanged` si necesitas actualizar la UI
4. ¡Listo! El componente maneja toda la lógica internamente

---

**Creado por:** GitHub Copilot
**Fecha:** 2025-11-21
**Versión:** 1.0.0
