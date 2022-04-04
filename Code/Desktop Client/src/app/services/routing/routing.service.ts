import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class RoutingService {

    constructor(private router: Router) { }


    moveToLogin(): void {
        this.router.navigate(['/login']);
    }

    moveToCreateAccount(): void {
        this.router.navigate(['/createAccount']);
    }

    moveToMenu(): void {
        this.router.navigate(['/menu']);
    }

    moveToForgotPassword(): void {
        this.router.navigate(['/forgotPassword']);
    }

}
