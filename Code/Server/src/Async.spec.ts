/* eslint-disable max-lines-per-function */

import { Sleeper } from "./services/Sleeper";

describe('Async, Await, Promises', () => {
    it('should not wait', () => {
        let x = 0
        const setX1 = async () => {
            await Sleeper.sleep(100);
            x = 1;
        }
        setX1();
        expect(x).toEqual(0);
    });
    
    it('should wait', async () => {
        let x = 0
        const setX1 = async () => {
            await Sleeper.sleep(100);
            x = 1;
        }
        await setX1();
        expect(x).toEqual(1);
    });
    
    it('should wait', async () => {
        let x = 0
        const setX1 = () => {
            return new Promise((resolve) => setTimeout(() => {
                x = 1;
                resolve();
            }, 100));
        }
        await setX1();
        expect(x).toEqual(1);
    });
    
    it('should wait', async () => {
        let x = 0
        const setX1 = () => {
            return new Promise((resolve) => setTimeout(async () => {
                await new Promise((res) => setTimeout(() => {
                    x = 1;
                    res();
                }, 100));
                resolve();
            }, 100));
        }
        await setX1();
        expect(x).toEqual(1);
    });
    
    it('should not wait', async () => {
        let x = 0
        const setX1 = async () => {
            await new Promise((resolve) => setTimeout(async () => {
                new Promise((res) => setTimeout(() => {
                    x = 1;
                    res();
                }, 100));
                resolve();
            }, 100));
        }
        await setX1();
        expect(x).toEqual(0);
    });
    
    it('should wait', async () => {
        let x = 0
        const setX1 = () => {
            return new Promise((resolve) => setTimeout(() => {
                return new Promise(() => setTimeout(() => {
                    x = 1;
                    resolve();
                }, 100));
            }, 100));
        }
        await setX1();
        expect(x).toEqual(1);
    });
});
