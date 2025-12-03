import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-public-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
    templateUrl: './public-navbar.component.html',
    styleUrls: ['./public-navbar.component.css'],
})
export class PublicNavbarComponent {
    searchQuery: string = '';

    constructor(private router: Router) { }

    navigateToLogin(): void {
        this.router.navigate(['/auth/login']);
    }

    navigateToRegister(): void {
        this.router.navigate(['/auth/register']);
    }

    onSearch(): void {
        console.log('Buscando:', this.searchQuery);
    }
}
