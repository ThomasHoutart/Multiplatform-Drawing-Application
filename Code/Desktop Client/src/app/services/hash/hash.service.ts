import { Injectable } from '@angular/core';
import * as sha256 from 'fast-sha256';
import { Salt } from 'src/app/models/interface/salt';

@Injectable({
    providedIn: 'root'
})
export class HashService {

    public hash(input: Uint8Array): Uint8Array {
        const hasher = new sha256.Hash();
        hasher.update(input);
        return hasher.digest();
    }

    public strToUint8Array(s: string): Uint8Array {
        const charArray: number[] = [];
        for (let i = 0; i < s.length; ++i) {
            charArray.push(s.charCodeAt(i));
        }
        return Uint8Array.from(charArray);
    }

    public hashString(s: string): Uint8Array {
        return this.hash(this.strToUint8Array(s));
    }

    public encryptedPassword(password: string, salt: Salt): string {
        const hashedPassword: Uint8Array = this.hashString(password);
        const encryptedStep: Uint8Array = this.hashString(salt.permSalt + hashedPassword.toString());
        const encryptedPassword = this.hashString(salt.tempSalt + encryptedStep.toString());
        return encryptedPassword.toString();
    }
}
