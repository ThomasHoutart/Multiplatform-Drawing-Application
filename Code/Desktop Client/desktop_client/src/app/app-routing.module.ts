import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateAccountComponent } from './components/authentification/create-account/create-account.component';
import { LoginComponent } from './components/authentification/login/login.component';
import { MenuComponent } from './components/menu/menu.component';
import { ForgotPasswordComponent } from './components/authentification/forgot-password/forgot-password.component';


export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'menu', component: MenuComponent },
    { path: 'createAccount', component: CreateAccountComponent },
    { path: 'forgotPassword', component: ForgotPasswordComponent },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
