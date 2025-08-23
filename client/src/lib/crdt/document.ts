import SortedList from "@/lib/containers/sorted-list";
import {compareArrays} from "@/lib/utils";
import Character, {ChrPosition} from "@/lib/crdt/character";
import {Operation, OperationType} from "@/lib/crdt/operation";

class Document {
    id: string;
    private chars: SortedList<Character>;
    levelStrategies: string[] = [];
    boundary: number = 10;
    base: number = 1000;

    constructor(id: string) {
        this.id = id;
        const cmp = (a: Character, b: Character) => {
            const arrCmpRes = compareArrays(a.position, b.position);
            if (arrCmpRes === 0) {
                if (a.id == b.id) return 0;
                return a.id < b.id ? -1 : 1;
            }
            return arrCmpRes;
        }
        this.chars = new SortedList<Character>(cmp);
        this.chars.insert(new Character("0", this.id, [0], ""));
        this.chars.insert(new Character("1", this.id, [1000], ""));
    }

    private checkIndexStrict(index: number) {
        if (index < 0 || index >= this.chars.length) {
            throw Error("Index out of range")
        }
    }

    private checkIndex(index: number) {
        if (index < 0 || index > this.chars.length) {
            throw Error("Index out of range")
        }
    }

    delete(chr: Character): 0 | 1 {
        if (!this.chars.exists(chr)) {
            return 0;
        }
        this.chars.removeByCmp(chr);
        return 1;
    }

    deleteIndex(index: number): Character {
        this.checkIndexStrict(index)
        const character = this.chars.at(index+1)
        this.chars.remove(character);
        return character;
    }

    // LSEQ shenanigans
    // https://hal.science/hal-00921633/document
    // TODO: Refactor for readability cuz this is a mess and it was a pain to write

    getPositionBetween(min: ChrPosition, max: ChrPosition): ChrPosition {
        min = [...min]; // copy the arrays (let's not mutate the input, learned that the hard way)
        max = [...max];
        const maxLen = Math.max(min.length, max.length);

        while (min.length < maxLen) min.push(0);
        while (max.length < maxLen) max.push(this.base * (2 ** max.length));

        let idx = min.length - 1;

        if (max[idx] - min[idx] < 2) {
            min.push(0);
            max.push(this.base * (2 ** max.length));
            idx++
        }

        if (this.levelStrategies[idx] == undefined) {
            this.levelStrategies[idx] = Math.random() > 0.5 ? "-" : "+";
        }

        const pos = min;
        if (this.levelStrategies[idx] == '+') {
            pos[idx] += this.boundary < (max[idx] - min[idx]) ? this.boundary : 1;
            return pos;
        }

        pos[idx] = max[idx] - (this.boundary < (max[idx] - min[idx]) ? this.boundary : 1);

        return pos;
    }

    insertAfter(character: Character, id: string, value: string): Character {
        const before = this.chars.indexOf(character);
        const after = this.chars.at(before + 1);
        const position = this.getPositionBetween(character.position, after.position);

        const new_character = new Character(id, this.id, position, value);
        // Insert the new character at the correct position
        this.chars.insert(new_character);

        return new_character
    }

    insertAtIndex(index: number, id: string, value: string): Character {
        this.checkIndex(index)
        const character = this.chars.at(index);
        const after = this.chars.at(index+1);
        const position = this.getPositionBetween(character.position, after.position)

        const new_character = new Character(id, this.id, position, value);
        // Insert the new character at the correct position
        this.chars.insert(new_character);

        return new_character;
    }

    insert(character: Character): 0 | 1 {
        if (this.chars.exists(character)) {
            return 0;
        }
        this.chars.insert(character);
        return 1;
    }

    at(index: number): Character {
        this.checkIndexStrict(index);
        return this.chars.at(index+1)
    }

    indexOf(character: Character): number {
        const idx = this.chars.indexOf(character)
        if (idx == -1) return -1;
        return idx - 1;
    }

    private applyInsert(operation: Operation): Character{
        if (operation.type != OperationType.Insert) {
            throw Error("Operation must be of type 'INSERT'")
        }
        const character = new Character(operation.chrId, this.id, operation.position, operation.value);
        if (!this.chars.exists(character)){
            this.insert(character);
        }
        return character
    }

    private applyDelete(operation: Operation): Character {
        if (operation.type != OperationType.Delete) {
            throw Error("Operation must be of type 'DELETE'")
        }
        const character = new Character(operation.chrId, this.id, operation.position, "");
        this.chars.removeByCmp(character);
        return character
    }

    // Ugly code, but it works
    apply(operation: Operation): Character {
        switch (operation.type) {
            case OperationType.Insert:
                return this.applyInsert(operation);
            case OperationType.Delete:
                return this.applyDelete(operation);
            default:
                throw new Error(`Unknown operation type: ${operation.type}`);
        }
    }

    getText() {
        return this.chars.toList().map(char => char.value).join("");
    }

    getPositions() {
        return this.chars.toList().map(char => char.position);
    }
}

export default Document;
