import { Comparator, bisect_left, insort_left } from "@/lib/utils";

// Sorted list implementataion heavily inspired by Grant Jenks' SortedContainers library
// https://grantjenks.com/docs/sortedcontainers/implementation.html

class SortedList<T> {
    private lists: T[][] = [[]];
    private indexes: number[] | null = null;
    private maxes: T[] = [];
    private cmp: Comparator<T>;

    private readonly loadFactor = 1000;

    length: number = 0;

    constructor(comparator: Comparator<T>) {
        this.cmp = comparator;
    }

    private parentIdx(index: number): number {
        return Math.floor((index - 1) / 2);
    }

    private leftChildIdx(index: number): number {
        return 2 * index + 1;
    }

    private rightChildIdx(index: number): number {
        return 2 * index + 2;
    }

    /**
     * Returns the next power of 2 `>=` `num`
     * @param num
     */
    private nextPow2(num: number): number {
        return 1 << Math.ceil(Math.log2(num));
    }

    private flatten2DList<I>(list: I[][], length?: number): I[] {
        if (length === undefined) {
            length = list.reduce((acc, val) => acc + val.length, 0);
        }

        let flatList: I[] = new Array(length);
        let idx = 0;

        while (idx < length) {
            for (let lst of list) {
                for (const item of lst) {
                    flatList[idx] = item;
                    idx++;
                }
            }
        }

        return flatList;
    }


    /**
     * Constructs the indexes tree
     */
    private constructIndexes() {
        let listLens = this.lists.map((list) => list.length);
        const indexes: number[][] = [listLens]

        while (listLens.length > 1) {
            const newLevelLen = Math.ceil(listLens.length / 2)
            indexes.push(new Array<number>(this.nextPow2(newLevelLen)).fill(0))
            for (let i = 0; i < newLevelLen; i++) {
                const pairSum = listLens[i*2] + (listLens[i*2+1] ?? 0)
                indexes[indexes.length-1][i] = pairSum
            }
            listLens = indexes[indexes.length-1]
        }

        this.indexes = this.flatten2DList(indexes.reverse())
    }

    /**
     * Updates indexes tree by adding `change` to all indexes in the path from `listIdx` to the root
     * @param listIdx
     * @param change
     */
    private updateIndexes(listIdx: number, change: number) {
        if (this.indexes === null) return;
        // get correct index of list in indexes array
        listIdx = this.indexes.length - (this.lists.length - listIdx);
        while (listIdx > 0) {
            this.indexes[listIdx] += change;
            listIdx = this.parentIdx(listIdx);
        }
    }

    /**
     * Updates the max value of the list at `listIdx`
     * @param listIdx
     */
    private updateMax(listIdx: number) {
        this.maxes[listIdx] = this.lists[listIdx][this.lists[listIdx].length - 1];
    }

    /**
     * Splits list at `listIdx` into two lists and updates the maxes and indexes accordingly
     * @param listIdx
     */
    private balanceLarge(listIdx: number) {
        if (this.lists[listIdx].length < this.loadFactor * 2) return;

        const secondHalf = this.lists[listIdx].splice(this.loadFactor)
        this.updateMax(listIdx);

        // insert second half into lists and update maxes accordingly
        this.lists.splice(listIdx + 1, 0, secondHalf);
        this.maxes.splice(listIdx + 1, 0, secondHalf[secondHalf.length - 1]);

        this.indexes = null; // number of lists changed, so indexes have to be recalculated
    }

    /**
     * Merges `listIdx` with the adjacent list and updates the maxes and indexes accordingly
     * @param listIdx
     */
    private balanceSmall(listIdx: number) {
        if (this.lists[listIdx].length > this.loadFactor / 2) return;
        if (this.lists.length <= 1) return;

        const temp = this.lists[listIdx];
        this.lists.splice(listIdx, 1);
        this.maxes.splice(listIdx, 1);

        if (listIdx == this.lists.length) {
            listIdx -= 1;
            this.lists[listIdx] = this.lists[listIdx].concat(temp);
        } else {
            this.lists[listIdx] = temp.concat(this.lists[listIdx]);
        }
        this.updateMax(listIdx);
        this.indexes = null; // number of lists changed, so indexes have to be recalculated
        this.balanceLarge(listIdx);
    }

    /**
     * Inserts `item` into the list in sorted order
     * @param item
     */
    insert(item: T) {
        let listIdx = bisect_left(this.maxes, item, this.cmp);
        if (listIdx >= this.lists.length) {
            listIdx -= 1
        }

        insort_left(this.lists[listIdx], item, this.cmp);
        this.updateMax(listIdx);
        this.updateIndexes(listIdx, 1);
        this.balanceLarge(listIdx);
        this.length++;
    }

    /**
     * Removes an occurrence of `item` from the list if it exists
     * @param item
     */
    remove(item: T) {
        const listIdx = bisect_left(this.maxes, item, this.cmp);
        const idx = bisect_left(this.lists[listIdx], item, this.cmp);
        if (this.cmp(item, this.lists[listIdx][idx]) != 0) return;
        this.lists[listIdx].splice(idx, 1);
        this.updateMax(listIdx);
        this.updateIndexes(listIdx, -1);
        this.balanceSmall(listIdx);
        this.length--;
    }

    // TODO: refactor to more readable code
    /**
     * Removes all occurrences of `item` from the list if it exists
     ** It deems an element equal to `item`  if `cmp(item, list_item) == 0`
     ** If `cmp` is not provided, it uses the default comparator
     * @param item
     * @param cmp
     */
    removeByCmp(item: T, cmp?: Comparator<T>) {
        if (cmp === undefined) {
            cmp = this.cmp;
        }

        const listIdx = bisect_left(this.maxes, item, cmp);
        const idx = bisect_left(this.lists[listIdx], item, cmp);
        if (cmp(item, this.lists[listIdx][idx]) != 0) return;
        this.lists[listIdx].splice(idx, 1);
        this.updateMax(listIdx);
        this.updateIndexes(listIdx, -1);
        this.balanceSmall(listIdx);
        this.length--;
    }

    /**
     * Returns `true` if `item` is in the list, `false` otherwise
     * @param item
     */
    exists(item: T): boolean {
        const listIdx = bisect_left(this.maxes, item, this.cmp);
        if (listIdx >= this.lists.length) {
            return false;
        }
        const idx = bisect_left(this.lists[listIdx], item, this.cmp);
        return this.cmp(item, this.lists[listIdx][idx]) == 0;
    }

    // TODO: refactor to more readable code
    /**
     * Returns the item at `index`
     * @param index
     */
    at(index: number): T {
        if (index < 0 || index >= this.length) {
            throw new Error("Index out of bounds");
        }
        if (this.indexes === null) {
            this.constructIndexes();
        }

        const indexes = this.indexes!;
        let cur = 0;
        let add = 0;

        while (this.leftChildIdx(cur) < indexes.length) {
            if (indexes[this.leftChildIdx(cur)] + add > index) {
                cur = this.leftChildIdx(cur);
            } else {
                add += indexes[this.leftChildIdx(cur)]
                cur = this.rightChildIdx(cur);
            }
        }

        const listIdx = cur - indexes.length + this.lists.length;

        return this.lists[listIdx][index - add]
    }

    /**
     * Returns the index of `item` in the list or `-1` if it doesn't exist
     * @param item
     */
    indexOf(item: T): number {
        const listIdx = bisect_left(this.maxes, item, this.cmp);
        if (listIdx >= this.lists.length) {
            return -1;
        }
        const idx = bisect_left(this.lists[listIdx], item, this.cmp);
        if (this.cmp(item, this.lists[listIdx][idx]) != 0) {
            return -1;
        }

        if (this.indexes === null) {
            this.constructIndexes();
        }

        let listOff = 0;
        let indexesIdx = listIdx + this.indexes!.length - this.lists.length;

        while (indexesIdx > 0) {
            const parentIdx = this.parentIdx(indexesIdx);
            // right children always have an even index
            if (indexesIdx % 2 == 0) {
                listOff += this.indexes![this.leftChildIdx(parentIdx)];
            }

            indexesIdx = parentIdx;
        }

        return listOff + idx;
    }

    toList(): T[] {
        return this.flatten2DList(this.lists, this.length);
    }

    toString(): string {
        return this.toList().toString()
    }
}

export default SortedList;