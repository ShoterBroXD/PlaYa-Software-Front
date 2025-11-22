export interface SidebarItem {
  label: string;
  icon: string; // Nombre del icono SVG o clase Font Awesome
  route: string;
  active?: boolean;
}

export interface SidebarConfig {
  context: 'library' | 'categories' | 'communities';
  topItems: SidebarItem[];
  bottomItems: SidebarItem[];
}

export const LIBRARY_SIDEBAR_CONFIG: SidebarConfig = {
  context: 'library',
  topItems: [
    { label: 'Página principal', icon: 'collection', route: '/library' },
    { label: 'Me gusta', icon: 'liked', route: '/library/liked' },
    { label: 'Siguiendo', icon: 'following', route: '/library/following' },
    { label: 'Historial', icon: 'history', route: '/library/history' }
  ],
  bottomItems: [
    { label: 'Configuración', icon: 'cog', route: '/configuration' },
    { label: 'Cerrar sesión', icon: 'logout', route: '/logout' }
  ]
};

export const CATEGORIES_SIDEBAR_CONFIG: SidebarConfig = {
  context: 'categories',
  topItems: [
    { label: 'Categorías', icon: 'grid', route: '/categories' },
    { label: 'Pistas', icon: 'music', route: '/categories/tracks' },
    { label: 'Listas', icon: 'list', route: '/categories/playlists' },
    { label: 'Álbumes', icon: 'album', route: '/categories/albums' }
  ],
  bottomItems: [
    { label: 'Configuración', icon: 'cog', route: '/configuration' },
    { label: 'Cerrar sesión', icon: 'logout', route: '/logout' }
  ]
};

export const COMMUNITIES_SIDEBAR_CONFIG: SidebarConfig = {
  context: 'communities',
  topItems: [
    { label: 'Página principal', icon: 'collection', route: '/communities' },
    { label: 'Tus Comunidades', icon: 'liked', route: '/communities/your-communities' },
    { label: 'Recomendados', icon: 'following', route: '/communities/recommended' },
    { label: 'Explorar', icon: 'history', route: '/communities/explore' }
  ],
  bottomItems: [
    { label: 'Configuración', icon: 'cog', route: '/configuration' },
    { label: 'Cerrar sesión', icon: 'logout', route: '/logout' }
  ]
};
