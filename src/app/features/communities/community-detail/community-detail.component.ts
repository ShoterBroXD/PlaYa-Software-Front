import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-community-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './community-detail.component.html',
  styleUrls: ['./community-detail.component.css']
})
export class CommunityDetailComponent implements OnInit {
  activeTab = signal<'posts' | 'members' | 'about'>('posts');
  
  community = {
    name: 'Michael Jackson',
    followers: '75B',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    image: '/assets/img/images/perfil-comunidades.png',
    postsCount: '1.2K',
    createdYear: '2019'
  };

  posts = [
    { author: 'Usuario123', time: 'Hace 2 horas', content: '¡Qué gran concierto fue el de ayer! Michael Jackson sigue siendo el rey del pop.', likes: 24, comments: 5, avatar: '/assets/img/icons/user.png' },
    { author: 'FanMJ2024', time: 'Hace 5 horas', content: 'Compartiendo mi canción favorita de MJ: "Billie Jean" 🎵', likes: 56, comments: 12, avatar: '/assets/img/icons/user.png', hasSong: true }
  ];

  members = [
    { name: 'Usuario123', role: 'Administrador', avatar: '/assets/img/icons/user.png' },
    { name: 'FanMJ2024', role: 'Miembro activo', avatar: '/assets/img/icons/user.png' },
    { name: 'MusicLover99', role: 'Miembro', avatar: '/assets/img/icons/user.png' }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Community ID:', id);
  }

  switchTab(tab: 'posts' | 'members' | 'about') {
    this.activeTab.set(tab);
  }
}
