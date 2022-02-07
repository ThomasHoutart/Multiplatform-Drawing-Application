/* eslint-disable max-lines-per-function */
import { List } from './List';
import { Sleeper } from './services/Sleeper';

describe('List', () => {
    it('should construct from arrays or by shallow copy', () => {
        const list = new List([1,2,3]);
        expect(list.has(2)).toBeTruthy();
        expect(!list.has(4)).toBeTruthy();
        const list2 = new List(list);
        list.remove(1);
        expect(list.has(1)).toBeFalsy();
        expect(list2.has(2)).toBeTruthy();
        expect(!list2.has(4)).toBeTruthy();
        const list3 = new List([{user: 3, room: 'abc'}, {user: 4, room: 'def'}]);
        expect(list3.has({user: 3, room: 'abc'})).toBeTruthy();
        expect(!list3.has({user: 5, room: 'def'})).toBeTruthy();
        expect(!list3.has({user: 3, room: 'def'})).toBeTruthy();
        expect(!list3.has({user: 4, room: 'abc'})).toBeTruthy();
    });

    it('should map according to the function', async() => {
        const f1 = (n: number) => 7 * n;
        const f2 = (n: number) => 5 * n;
        const f3 = (n: number) => n.toString();
        const f4 = (s: string) => s.substr(1);
        const list = new List([1,-2,3,-4,5]);
        const list2 = await list.map(f1);
        const list3 = await list2.map(f2);
        const list4 = await list3.map(f3);
        const list5 = await list4.map(f4);
        
        expect(list.has(1) && list.has(-4)).toBeTruthy();
        expect(!list2.has(1) && !list2.has(-4)).toBeTruthy();
        expect(list2.has(-14) && list2.has(21)).toBeTruthy();
        expect(!list3.has(-14) && !list3.has(21)).toBeTruthy();
        expect(list3.has(35) && list3.has(105)).toBeTruthy();
        expect(list4.has('35') && list4.has('105')).toBeTruthy();
        expect(list5.has('5') && list5.has('05')).toBeTruthy();
    });

    it('should reduce according to the function', async () => {
        interface Ty {
            n: number,
            s: string,
        }
        const f1 = (j: Ty) => {return j.n != 3};
        const f2 = (j: Ty) => {return j.s.length > 0};
        const ts = new List<Ty>([
            {n: 1, s: 'orange!\n'},
            {n: 2, s: 'false'},
            {n: 3, s: 'null'},
            {n: 4, s: ''},
            {n: 5, s: 'str'},
            {n: 6, s: 'abc'},
        ]);
        const ts2 = await ts.reduce(f1);
        const ts3 = await ts2.reduce(f2);

        expect(ts2.has({n: 6, s:'abc'}));
        expect(ts.has({n: 3, s:'null'}));
        expect(!ts2.has({n: 3, s:'null'}));

        expect(ts.length()).toEqual(6);
        expect(ts2.length()).toEqual(5);
        expect(ts3.length()).toEqual(4);
    });

    it('should apply the foreach function, notably push and remove methods of List', async () => {
        interface T {
            n: number,
            s: string,
        }
        const ts = new List<T>([
            {n: 1, s: 'orange!\n'},
            {n: 2, s: 'false'},
            {n: 3, s: 'null'},
            {n: 4, s: ''},
            {n: 5, s: 'str'},
            {n: 6, s: 'abc'},
        ]);
        const ts2 = new List<T>();
        const f1 = async (j: T) => await ts2.pushIfAbsent(j);
        const f2 = async (j: T) => {
            const copy: T = {n: j.n, s: j.s};
            ts2.remove(copy);
        };
        const f3 = async (j: T) => await ts2.pushIfAbsent(j);
        await ts.foreach(f1);
        await ts.foreach(async (e: T) => await expect(ts2.has(e)).toBeTruthy());
        await ts.foreach(f3);
        expect(ts2.length()).toEqual(ts.length());
        await ts.foreach(f2);
        expect(ts2.length()).toEqual(0);
    });

    it('should reverse', () => {
        const l1 = new List([1,4,5,76,98]);
        l1.reverse();
        expect(l1.getArray()).toEqual([98, 76, 5, 4, 1])
    });

    it('should find or not find', () => {
        const l1 = new List([1,4,5,76,98]);
        expect(l1.find((e: number) => {
            return e > 2;
        })).toEqual(4);
        expect(l1.find((e: number) => {
            return e * e > 8000;
        })).toEqual(98);
        expect(l1.find((e: number) => {
            return !l1.has(e);
        })).toBeUndefined();
    });

    it('should not wait for it to become 24 because of missing foreach await', async () => {
        const list = new List([-1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        list.set(0, 0);
        expect(list.get(0)).toEqual(0);
        list.foreach(async elem => {
            await list.set(elem, (elem + 1) * (elem - 1));
        });
        await expect(list.get(5)).not.toEqual(24);
    });

    it('should not wait for it to become 24 because of missing foreach lambda await', async () => {
        const list = new List([-1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        list.set(0, 0);
        expect(list.get(0)).toEqual(0);
        const lambda = async (elem: number) => {
            await Sleeper.sleep(100);
            list.set(elem, (elem + 1) * (elem - 1));
        }
        await list.foreach(async elem => {
            lambda(elem);
        });
        await expect(list.get(5)).not.toEqual(24);
    });

    it('should wait for it to become 24 because of foreach await', async () => {
        const list = new List([-1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        list.set(0, 0);
        expect(list.get(0)).toEqual(0);
        await list.foreach(async elem => {
            await list.set(elem, (elem + 1) * (elem - 1));
        });
        await expect(list.get(5)).toEqual(24);
    });

    it('should wait for it to become 24 because of foreach lambda await', async () => {
        const list = new List([-1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        list.set(0, 0);
        expect(list.get(0)).toEqual(0);
        const lambda = async (elem: number) => {
            await Sleeper.sleep(100);
            list.set(elem, (elem + 1) * (elem - 1));
        }
        await list.foreach(async elem => {
            if (elem && elem < 7)
                await lambda(elem);
        });
        await expect(list.get(5)).toEqual(24);
    });

    it('should wait for it to become 24 because of foreach lambda not being really async without needing await', async () => {
        const list = new List([-1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        list.set(0, 0);
        expect(list.get(0)).toEqual(0);
        const lambda = async (elem: number) => {
            list.set(elem, (elem + 1) * (elem - 1));
        }
        await list.foreach(async elem => {
            lambda(elem);
        });
        await expect(list.get(5)).toEqual(24);
    });

    it('should concatenate 2 lists', async () => {
        const l1 = new List([1,2,3,4,5,6,7]);
        const l2 = new List([1,2,3,4,5,6,7]);
        await l1.concat(l2);
        expect(l1.get(9)).toEqual(3);
    });

    it('should shuffle', async () => {
        const l1 = new List([1,2,3,4,5,6,7,8,9,10,11,12,13,14]);
        const l2 = new List(l1);
        l2.shuffle();
        expect(l1.length()).toEqual(l2.length());
        expect(l1.getArray()).not.toEqual(l2.getArray());
        // eslint-disable-next-line require-await
        await l1.foreach(async e => expect(l2.has(e)).toBeTruthy());
    });
});
