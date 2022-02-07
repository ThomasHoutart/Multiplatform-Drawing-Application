export class List<T> {
	private array: T[] = [];

	constructor(list?: List<T> | T[]) {
		if (!list) return;
		if (list instanceof List)
			for (let i = 0; i < list.length(); ++i)
				this.array.push(list.get(i));
		else if (list instanceof Array)
			for (let i = 0; i < list.length; ++i) this.array.push(list[i]);
	}

	public push(x: T): void {
		this.array.push(x);
	}

	public remove(x: T): void {
		const str = JSON.stringify(x);
		const e = this.array.find((e: T) => JSON.stringify(e) == str);
		if (!e) return;
		const index = this.array.indexOf(e);
		if (index != -1) this.array.splice(index, 1);
	}

	public pushIfAbsent(x: T): void {
		if (!this.array.includes(x)) this.push(x);
	}

	public has(x: T): boolean {
		const str = JSON.stringify(x);
		return !!this.array.find((e: T) => JSON.stringify(e) == str);
	}

	public set(i: number, t: T): void {
		this.array[i] = t;
	}

	public get(i: number): T {
		return this.array[i];
	}

	public length(): number {
		return this.array.length;
	}

	public async foreach(
		lambda: (value: T) => Promise<void>,
		warn = true
	): Promise<void> {
		const length = this.length();
		for (let i = 0; i < length; ++i) await lambda(this.array[i]);
		if (warn && this.length() != length)
			(console).warn("warning: You just modified a list with foreach!");
	}

	public async map<U>(lambda: (value: T) => U): Promise<List<U>> {
		const list: List<U> = new List();
		await this.foreach(async (e: T) => {
			await list.push(lambda(e));
		});
		return list;
	}

	public getArray(): T[] {
		return this.array;
	}

	public async reduce(predicate: (value: T) => boolean): Promise<List<T>> {
		const list = new List<T>();
		await this.foreach(async (e: T) => {
			if (predicate(e))
				await list.push(e);
		});
		return list;
	}

	public reverse(): void {
		const list = new List<T>();
		for (let i = this.array.length - 1; i >= 0; --i)
			list.push(this.array[i]);
		this.array = list.getArray();
	}

	public find(predicate: (value: T) => boolean): T | undefined {
		return this.array.find(predicate);
	}

	public async concat(list: List<T>): Promise<void> {
		await list.foreach(async (t: T) => {
			await this.push(t);
		});
	}

	public shuffle(): void {
		let currentIndex = this.array.length,
			temporaryValue,
			randomIndex;
		while (0 !== currentIndex) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;
			temporaryValue = this.array[currentIndex];
			this.array[currentIndex] = this.array[randomIndex];
			this.array[randomIndex] = temporaryValue;
		}
	}

	public sort(predictate?: any): void {
		this.array.sort(predictate);
	}

	public pop(): T | undefined {
		return this.array.pop();
	}

	public count(value: T): number {
		let count = 0
		this.array.forEach((element: T) => {if (value === element) count+=1})
		return count
	}
}
