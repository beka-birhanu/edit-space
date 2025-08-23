
class Node<T> {
    data: any;
    next: Node<T> | null;
    prev: Node<T> | null;

    constructor(data: T, next: Node<T> | null = null, prev: Node<T> | null = null) {
        this.data = data;
        this.next = next;
        this.prev = prev;
    }
}

// A doubly linked list
class LinkedList<T> {
    head: Node<T>;
    tail: Node<T>;

    constructor() {
        this.head = new Node(null);
        this.tail = new Node(null);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    isEmpty(): boolean {
        return this.head.next === this.tail
    }

    private checkEmpty() {
        if (this.isEmpty()) {
            throw new Error("Empty list")
        }
    }

    peekLeft(): T {
        this.checkEmpty()
        return (this.head.next as Node<T>).data
    }

    peekRight(): T {
        this.checkEmpty()
        return (this.tail.prev as Node<T>).data
    }

    pushLeft(data: T) {
        const temp = this.head.next as Node<T>;
        const node = new Node(data, temp, this.head);
        this.head.next = node;
        temp.prev = node;
    }

    pushRight(data: T) {
        const temp = this.tail.prev as Node<T>;
        const node = new Node(data, this.tail, temp);
        this.tail.prev = node;
        temp.next = node;
    }

    popRight(): T {
        this.checkEmpty()
        const temp = this.tail.prev as Node<T>;
        const data = temp.data;
        this.tail.prev = temp.prev;
        (temp.prev as Node<T>).next = this.tail;

        return data;
    }

    popLeft(): T {
        this.checkEmpty()
        const temp = this.head.next as Node<T>;
        const data = temp.data;
        this.head.next = temp.next;
        (temp.next as Node<T>).prev = this.head;

        return data;
    }
}

class Queue<T> {
    private list: LinkedList<T>;
    size = 0;

    constructor() {
        this.list = new LinkedList<T>();
    }

    isEmpty(): boolean {
        return this.list.isEmpty()
    }

    top(): T {
        return this.list.peekRight()
    }

    enqueue(data: T) {
        this.list.pushLeft(data);
        this.size++;
    }

    dequeue(): T {
        const val = this.list.popRight();
        this.size--;
        return val;
    }
}

export { Node, LinkedList, Queue };