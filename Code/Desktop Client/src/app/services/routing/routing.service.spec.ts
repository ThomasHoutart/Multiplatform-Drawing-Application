import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { routes } from 'src/app/app-routing.module';
import { RouterTestingModule } from '@angular/router/testing';
import { CreateAccountComponent } from 'src/app/components/authentification/create-account/create-account.component';
import { LoginComponent } from 'src/app/components/authentification/login/login.component';
import { ChatComponent } from 'src/app/components/chat/chat.component';
import { MenuComponent } from 'src/app/components/menu/menu.component';
import  {Location} from  '@angular/common';
import { RoutingService } from './routing.service';

describe('RoutingService', () => {
  let service: RoutingService;
  let router: Router;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
      declarations: [
        LoginComponent,
        MenuComponent,
        CreateAccountComponent,
        ChatComponent
      ]
    });
    service = TestBed.inject(RoutingService);
    location = TestBed.inject(Location);
    router = TestBed.inject(Router);
    router.initialNavigation();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should navigate to the login page', fakeAsync(() => {
    service.moveToLogin();
    tick();
    expect(location.path()).toBe('/login');
  }));

  it('should navigate to the menu page', fakeAsync(() => {
    service.moveToMenu();
    tick();
    expect(location.path()).toBe('/menu');
  }));

  it('should navigate to the menu page', fakeAsync(() => {
    service.moveToCreateAccount();
    tick();
    expect(location.path()).toBe('/createAccount');
  }));
});
