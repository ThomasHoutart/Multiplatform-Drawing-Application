export class Sleeper {
    public static sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    public static setTimeout(f:any, ms: number): NodeJS.Timeout {
        return setTimeout(f, ms);
    }
    
    public static setInterval(f:any, ms: number): NodeJS.Timeout {
        return setInterval(f, ms);
    }
}
