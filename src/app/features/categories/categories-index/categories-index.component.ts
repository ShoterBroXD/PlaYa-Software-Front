import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-categories-index',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categories-index.component.html',
  styleUrls: ['./categories-index.component.css']
})
export class CategoriesIndexComponent {
  categories = [
    { title: 'Rock', count: 423, image: '/assets/img/icons/rock.jpeg' },
    { title: 'Hip Hop', count: 312, image: '/assets/img/icons/rap.jpg' },
    { title: 'Clásica', count: 423, image: '/assets/img/icons/pop.png' },
    { title: 'Pop', count: 312, image: '/assets/img/icons/rock.jpeg' },
    { title: 'Jazz', count: 312, image: '/assets/img/icons/rap.jpg' },
    { title: 'Cumbia', count: 312, image: '/assets/img/icons/rock.jpeg' },
    { title: 'Trap', count: 312, image: '/assets/img/icons/rap.jpg' }
  ];
}
