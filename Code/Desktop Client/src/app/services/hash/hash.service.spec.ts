/* eslint-disable max-lines-per-function */
import { TestBed } from '@angular/core/testing';
import { Salt } from 'src/app/models/interface/salt';
import { HashService } from './hash.service';

describe('HashService', () => {
    let service: HashService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(HashService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should convert a string to the format strToUint8Array', () => {
        const test = 'test';
        const mockUint8Array: Uint8Array = new Uint8Array([116, 101, 115, 116]);
        expect(service.strToUint8Array(test)).toEqual(mockUint8Array);
    });

    it('should hash the Uint8array in input', () => {
        const mockUint8Array: Uint8Array = new Uint8Array([116, 101, 115, 116]);
        const mockHash: Uint8Array = new Uint8Array([159, 134, 208, 129, 136, 76, 125, 101, 154, 47, 234, 160, 197, 90, 208, 21, 163, 191, 79, 27, 43, 11, 130, 44, 209, 93, 108, 21, 176, 240, 10, 8]);
        expect(service.hash(mockUint8Array)).toEqual(mockHash);
    });

    it('should transform a hash to a string value', () => {
        const test = 'test';
        const mockHash: Uint8Array = new Uint8Array([159, 134, 208, 129, 136, 76, 125, 101, 154, 47, 234, 160, 197, 90, 208, 21, 163, 191, 79, 27, 43, 11, 130, 44, 209, 93, 108, 21, 176, 240, 10, 8]);
        expect(service.hashString(test)).toEqual(mockHash);
    });
    it('should encrypt a password (string) passed in input and return the encrypted password string', () => {
        const mockSalt: Salt = { tempSalt: 'temp', permSalt: 'perm' };
        const test = 'test';
        expect(service.encryptedPassword(test, mockSalt)).toEqual('121,201,130,69,137,246,108,48,248,254,228,3,238,103,74,195,156,166,49,124,78,243,146,46,49,125,5,45,215,121,13,163');
    });
});
