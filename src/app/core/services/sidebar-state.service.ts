import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarStateService {
  // Estado de colapso de sidebar
  private isCollapsed = signal(false);
  
  // Signals públicas de solo lectura
  collapsed = computed(() => this.isCollapsed());
  
  // Ancho actual de la sidebar
  sidebarWidth = computed(() => this.isCollapsed() ? 60 : 280);

  toggleCollapse() {
    this.isCollapsed.update(value => !value);
  }

  setCollapsed(value: boolean) {
    this.isCollapsed.set(value);
  }
}
