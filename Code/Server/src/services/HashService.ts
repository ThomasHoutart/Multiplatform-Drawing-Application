import * as sha256 from "fast-sha256";

export class HashService {
    public hash(input: Uint8Array): Uint8Array {
        const hasher = new sha256.Hash();
        hasher.update(input);
        return hasher.digest();
    }

    public init(): void {
        return;
    }

    public strToUint8Array(s: string): Uint8Array {
        const charArray: number[] = [];
        for (let i = 0; i < s.length; ++i) {
            const ascii = s.charCodeAt(i);
            if (ascii < 0 || 255 < ascii) {
                throw new RangeError("password does not have ASCII chars");
            }
            charArray.push(ascii);
        }
        return Uint8Array.from(charArray);
    }

    public hashString(s: string): Uint8Array {
        return this.hash(this.strToUint8Array(s));
    }
}
