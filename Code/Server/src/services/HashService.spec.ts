/* eslint-disable max-lines-per-function */
import { HashService } from "./HashService";

const hashService = new HashService();
const array: Uint8Array = new Uint8Array([115, 104, 105, 116]);

describe("HashService", () => {
    it("hash should return constant 32 Bytes array", () => {
        const hash1 = hashService.hash(array);
        const hash2 = hashService.hash(array);
        expect(hash1).toEqual(hash2);
        expect(hash1.byteLength).toEqual(32);
    });

    it("hash should not allow non-ASCII chars", () => {
        expect(() => {
            hashService.strToUint8Array("ͳ");
        }).toThrow();
    });

    it("strToUint8Array should return corresponding ASCII uint8 array", () => {
        expect(hashService.strToUint8Array("shit")).toEqual(array);
    });

    it("hashString should call hash with result from strToUint8Array", () => {
        const hashSpy = spyOn(hashService, "hash")
        const conversionSpy = spyOn(hashService, "strToUint8Array").and.returnValue(array)
        hashService.hashString("ͳ")
        expect(hashSpy).toHaveBeenCalledWith(array)
        expect(conversionSpy).toHaveBeenCalledWith("ͳ")
    });
});
