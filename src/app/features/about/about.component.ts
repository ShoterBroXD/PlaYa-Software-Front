import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PublicNavbarComponent } from '../../shared/public-navbar/public-navbar.component';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslateModule, PublicNavbarComponent],
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})
export class AboutComponent {
    constructor(private router: Router) { }

    navigateToRegister(): void {
        this.router.navigate(['/auth/register']);
    }
}
