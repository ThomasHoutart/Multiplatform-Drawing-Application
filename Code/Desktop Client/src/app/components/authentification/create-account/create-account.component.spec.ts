/* eslint-disable max-lines-per-function */
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppModule } from 'src/app/app.module';
import { HashService } from 'src/app/services/hash/hash.service';
import { RoutingService } from 'src/app/services/routing/routing.service';
import { REGISTER_HTTP, TEST_CREDENTIAL } from './constant';
import { CreateAccountComponent } from './create-account.component';

describe('CreateAccountComponent', () => {
    let component: CreateAccountComponent;
    let fixture: ComponentFixture<CreateAccountComponent>;


    @NgModule({
        imports: [
            AppModule,
        ],
    })
    class DialogTestModule { }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DialogTestModule, HttpClientTestingModule]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateAccountComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('createAccount should change boolean, gather form elements in a new variable and call register account with said variable', () => {
        component.form.controls.firstName.setValue(TEST_CREDENTIAL.firstName);
        component.form.controls.lastName.setValue(TEST_CREDENTIAL.lastName);
        component.form.controls.username.setValue(TEST_CREDENTIAL.username);
        component.form.controls.email.setValue(TEST_CREDENTIAL.email);
        component.form.controls.password.setValue(TEST_CREDENTIAL.hash);
        const hashService: HashService = TestBed.inject(HashService);
        const hashSpy: jasmine.Spy = spyOn(hashService, 'hashString').and.returnValue(new Uint8Array(0));
        const registerSpy: jasmine.Spy = spyOn(component, 'registerAccount');
        component.createAccount();
        expect(component.dupUsername).toBe(false);
        expect(component.dupEmail).toBe(false);
        expect(component.badRequest).toBe(false);
        expect(component.loading).toBe(true);
        expect(hashSpy).toHaveBeenCalled();
        expect(registerSpy).toHaveBeenCalledWith(TEST_CREDENTIAL);
    });

    it('registerAccountPostRequest should make an http post request with correct credentials', (done) => {
        const MOCK_HTTP: HttpTestingController = TestBed.get(HttpTestingController);
        component.registerAccountPostRequest(TEST_CREDENTIAL).subscribe();
        const REQUEST: TestRequest = MOCK_HTTP.expectOne(REGISTER_HTTP);
        expect(REQUEST.request.method).toEqual('POST');
        REQUEST.flush({});
        MOCK_HTTP.verify();
        done();
    });

    it('registerAccount should subscribe to registerAccountPostRequest and should call routing function moveToLogin if response is correct', () => {
        const routingService: RoutingService = TestBed.inject(RoutingService);
        const requestSpy: jasmine.Spy = spyOn(component, 'registerAccountPostRequest').and.returnValue(of({}));
        const moveToLoginSpy: jasmine.Spy = spyOn(routingService, 'moveToLogin');
        component.registerAccount(TEST_CREDENTIAL);
        expect(requestSpy).toHaveBeenCalledWith(TEST_CREDENTIAL);
        expect(moveToLoginSpy).toHaveBeenCalled();
    });

    //   it('registerAccount should subscribe to registerAccountPostRequest and should call moveToLogin if response is incorrect', () => {
    //       const requestSpy: jasmine.Spy = spyOn(component, 'registerAccountRequest').and.returnValue(throwError({status: 404}));
    //       const handleErrorSpy: jasmine.Spy = spyOn(component, 'handleError');
    //       component.registerAccount(TEST_CREDENTIAL);
    //       expect(requestSpy).toHaveBeenCalledWith(TEST_CREDENTIAL);
    //       expect(handleErrorSpy).toHaveBeenCalledWith(404);
    //   });

    it('handleError should set loading to false', () => {
        component.handleError(500);
        expect(component.loading).toBe(false);
    });

    it('handleError should call routing function moveToLogin if response status correspond to 200', () => {
        const routingService: RoutingService = TestBed.inject(RoutingService);
        const moveToLoginSpy: jasmine.Spy = spyOn(routingService, 'moveToLogin');
        component.handleError(200);
        expect(moveToLoginSpy).toHaveBeenCalled();
    });

    it('handleError should set dupUsername to true if response status correspond to 409', () => {
        component.handleError(409);
        expect(component.dupUsername).toBe(true);
    });

    it('handleError should set dupEmail to true if response status correspond to 410', () => {
        component.handleError(410);
        expect(component.dupEmail).toBe(true);
    });

    it('handleError should set badRequest to true if response status does not correspond to anything', () => {
        component.handleError(3000);
        expect(component.badRequest).toBe(true);
    });

    it('onCancel should call routing function moveToLogin', () => {
        const routingService: RoutingService = TestBed.inject(RoutingService);
        const moveToLoginSpy: jasmine.Spy = spyOn(routingService, 'moveToLogin');
        component.onCancel();
        expect(moveToLoginSpy).toHaveBeenCalled();
    });
});
