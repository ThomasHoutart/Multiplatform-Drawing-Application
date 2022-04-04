import { TestBed } from '@angular/core/testing';
import { LoginCredential } from 'src/app/models/interface/user';
import { UserService } from './user.service';
import { INVALID_USERNAME } from './constant';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set the private attribute user correctly with his login credential', () => {
    const mockUser: LoginCredential = {username: 'michel', hash: 'asdsa'};
    service.setUser(mockUser);
    expect(service.getUsername()).toEqual('michel');

  });

  it('should reset the values of the user to EMPTY', () => {
    const mockUser: LoginCredential = {username: 'michel', hash: 'asdsa'};
    const mockEmptyUser: LoginCredential = {username: '', hash: ''};
    service.setUser(mockUser);
    service.resetUser();
    // @ts-ignore
    expect(service.user).toEqual(mockEmptyUser);
  });

  it('should return the username of the user if valid', () => {
    const mockUser: LoginCredential = {username: 'michel', hash: 'asdsa'};
    service.setUser(mockUser);
    expect(service.getUsername()).toEqual(mockUser.username);
  });

  it('should return INVALID_USERNAME if invalid', () => {
    const mockUser: LoginCredential = {username: 'michel', hash: 'asdsa'};
    service.setUser(mockUser);
    service.resetUser();
    expect(service.getUsername()).toEqual(INVALID_USERNAME);
  });
});
