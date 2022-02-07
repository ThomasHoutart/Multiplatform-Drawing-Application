/* eslint-disable max-lines-per-function */
import { SaltService } from "./SaltService";

const mockSalt = new Uint8Array([12, 123]);
jest.useFakeTimers();

describe("SaltService", () => {
    it(".requestNewSalt should return random Uint8Array[16]", () => {
        const saltServ = new SaltService();
        const salt1 = saltServ.requestNewSalt();
        const salt2 = saltServ.requestNewSalt();
        expect(salt1.length).toEqual(16);
        expect(salt2.length).toEqual(16);
        expect(salt1).not.toEqual(salt2);
    });

    it(".requestNewSaltForUserLogin should generate salt and set the private map", () => {
        const saltServ = new SaltService();
        const newSaltSpy = spyOn(saltServ, "requestNewSalt").and.returnValue(
            mockSalt
        );
        saltServ.requestNewSaltForUserLogin("");
        expect(saltServ.getSaltToValidateLogin("")).toEqual(mockSalt);
        expect(newSaltSpy).toHaveBeenCalled();
    });

    it(".deleteIn10Seconds should delete salt associated to user after timer is out", () => {
        const saltServ = new SaltService();
        const newSaltSpy = spyOn(saltServ, "requestNewSalt").and.returnValue(
            mockSalt
        );
        saltServ.requestNewSaltForUserLogin("");
        saltServ.deleteIn10Seconds("");
        jest.advanceTimersByTime(10050);
        expect(() => {
            saltServ.getSaltToValidateLogin("");
        }).toThrow(Error);
        expect(newSaltSpy).toHaveBeenCalled();
    });

    it(".getSaltToValidateLogin should get correct salt", () => {
        const saltServ = new SaltService();
        expect(() => {
            saltServ.getSaltToValidateLogin("");
        }).toThrow(Error);
        spyOn(saltServ, "requestNewSalt").and.returnValue(
            mockSalt
        );
        saltServ.requestNewSaltForUserLogin("");
        expect(saltServ.getSaltToValidateLogin("")).toEqual(mockSalt);
    });

    it(".validateUserLogin should remove user from internal", () => {
        const saltServ = new SaltService();
        expect(() => {
            saltServ.validateUserLogin("");
        }).toThrow(Error);
        spyOn(saltServ, "requestNewSalt").and.returnValue(
            mockSalt
        );
        saltServ.requestNewSaltForUserLogin("");
        expect(saltServ.getSaltToValidateLogin("")).toEqual(mockSalt);
        expect(saltServ.validateUserLogin(""));
        expect(() => {
            saltServ.validateUserLogin("");
        }).toThrow(Error);
    });
});
