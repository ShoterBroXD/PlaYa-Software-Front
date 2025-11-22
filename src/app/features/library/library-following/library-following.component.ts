import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-library-following',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './library-following.component.html',
  styleUrls: ['./library-following.component.css']
})
export class LibraryFollowingComponent {
  hasFollowing = false;
}
