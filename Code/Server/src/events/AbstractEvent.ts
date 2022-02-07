export abstract class AbstractEvent {
    public abstract emit(): Promise<void>;
}
