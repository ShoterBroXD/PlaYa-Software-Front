import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layouts/main-layout.component';
import { LibraryLayoutComponent } from './layouts/library-layout/library-layout.component';
import { CategoriesLayoutComponent } from './layouts/categories-layout/categories-layout.component';
import { CommunitiesLayoutComponent } from './layouts/communities-layout/communities-layout.component';
import { ArtistsLayoutComponent } from './layouts/artists-layout/artists-layout.component';

export const routes: Routes = [
  // Landing Page (sin navbar autenticado)
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },

  // Auth Routes (sin navbar autenticado)
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'auth/get-token',
    loadComponent: () =>
      import('./features/auth/get-token/get-token.component').then((m) => m.GetTokenComponent),
  },
  {
    path: 'auth/reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
  },

  // Protected Routes (CON navbar autenticado via MainLayout)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'dashboard-usuario',
        loadComponent: () =>
          import('./features/dashboards/listener-dashboard/listener-dashboard.component').then(
            (m) => m.ListenerDashboardComponent
          ),
      },
      {
        path: 'dashboard-artista',
        loadComponent: () =>
          import('./features/dashboards/artist-dashboard/artist-dashboard.component').then(
            (m) => m.ArtistDashboardComponent
          ),
      },
      {
        path: 'categories',
        component: CategoriesLayoutComponent,
        children: [
          {
            path: '',
            loadComponent: () => import('./features/categories/categories-index/categories-index.component').then(m => m.CategoriesIndexComponent),
          },
          {
            path: 'tracks',
            loadComponent: () => import('./features/categories/tracks/tracks.component').then(m => m.CategoriesTracksComponent),
          },
          {
            path: 'tracks/:genreId',
            loadComponent: () => import('./features/categories/tracks/tracks.component').then(m => m.CategoriesTracksComponent),
          },
          {
            path: 'playlists',
            loadComponent: () => import('./features/categories/playlists/playlists.component').then(m => m.CategoriesPlaylistsComponent),
          },
          {
            path: 'albums',
            loadComponent: () => import('./features/categories/albums/albums.component').then(m => m.CategoriesAlbumsComponent),
          },
        ]
      },
      {
        path: 'library',
        component: LibraryLayoutComponent,
        children: [
          {
            path: '',
            loadComponent: () => import('./features/library/library-main/library-main.component').then((m) => m.LibraryMainComponent),
          },
          {
            path: 'liked',
            loadComponent: () => import('./features/library/library-liked/library-liked.component').then((m) => m.LibraryLikedComponent),
          },
          {
            path: 'following',
            loadComponent: () => import('./features/library/library-following/library-following.component').then((m) => m.LibraryFollowingComponent),
          },
          {
            path: 'history',
            loadComponent: () => import('./features/library/library-history/library-history.component').then((m) => m.LibraryHistoryComponent),
          }
        ]
      },
      {
        path: 'communities',
        component: CommunitiesLayoutComponent,
        children: [
          {
            path: '',
            loadComponent: () => import('./features/communities/communities-index/communities-index.component').then(m => m.CommunitiesIndexComponent),
          },
          {
            path: 'create',
            loadComponent: () => import('./features/communities/create-community/create-community.component').then(m => m.CreateCommunityComponent),
          },
          {
            path: 'your-communities',
            loadComponent: () => import('./features/communities/your-communities/your-communities.component').then(m => m.YourCommunitiesComponent),
          },
          {
            path: 'recommended',
            loadComponent: () => import('./features/communities/recommended/recommended.component').then(m => m.RecommendedCommunitiesComponent),
          },
          {
            path: 'explore',
            loadComponent: () => import('./features/communities/explore/explore.component').then(m => m.ExploreCommunitiesComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/communities/community-detail/community-detail.component').then(m => m.CommunityDetailComponent),
          }
        ]
      },
      {
        path: 'artists',
        component: ArtistsLayoutComponent,
        children: [
          {
            path: '',
            loadComponent: () => import('./features/artists/artists-index/artists-index.component').then(m => m.ArtistsIndexComponent),
          },
          {
            path: 'explore',
            loadComponent: () => import('./features/artists/explore/explore.component').then(m => m.ExploreComponent),
          },
          {
            path: 'popular',
            loadComponent: () => import('./features/artists/popular/popular.component').then(m => m.PopularComponent),
          },
          {
            path: 'featured',
            loadComponent: () => import('./features/artists/featured/featured.component').then(m => m.FeaturedComponent),
          },
          {
            path: 'profile/:id',
            loadComponent: () => import('./features/artists/profile/profile.component').then(m => m.ProfileComponent),
          }
        ]
      },
      {
        path: 'playlists',
        children: [
          {
            path: 'my',
            loadComponent: () => import('./features/playlists/my-playlists/my-playlists.component').then(m => m.MyPlaylistsComponent),
          },
          {
            path: 'create',
            loadComponent: () => import('./features/playlists/create-playlist/create-playlist.component').then(m => m.CreatePlaylistComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./features/playlists/view-playlist/view-playlist.component').then(m => m.ViewPlaylistComponent),
          },
        ]
      },
      {
        path: 'upload',
        loadComponent: () =>
          import('./features/upload/upload.component').then((m) => m.UploadComponent),
      },
      {
        path: 'search',
        loadComponent: () => import('./features/search/search.component').then((m) => m.SearchComponent),
      },
      {
        path: 'messages',
        loadComponent: () => import('./features/messages/messages.component').then((m) => m.MessagesComponent),
      },
      {
        path: 'configuration',
        loadComponent: () => import('./features/configuration/configuration.component').then((m) => m.ConfigurationComponent),
      },
      {
        path: 'premium',
        loadComponent: () => import('./features/premium/premium-subscription/premium-subscription').then(m => m.PremiumSubscriptionComponent),
      },
    ]
  },

  // Redirect
  {
    path: '**',
    redirectTo: '',
  },
];
