/**
 * Fibonacci Function Implementations in JavaScript
 */

// 1. Recursive implementation (simple but inefficient for large n)
function fibonacciRecursive(n) {
    if (n <= 1) return n;
    return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
}

// 2. Iterative implementation (efficient, O(n) time, O(1) space)
function fibonacciIterative(n) {
    if (n <= 1) return n;
    
    let prev = 0;
    let curr = 1;
    
    for (let i = 2; i <= n; i++) {
        let next = prev + curr;
        prev = curr;
        curr = next;
    }
    
    return curr;
}

// 3. Memoized implementation (efficient for repeated calls, O(n) time, O(n) space)
function fibonacciMemoized() {
    const cache = {};
    
    return function fib(n) {
        if (n in cache) return cache[n];
        if (n <= 1) return n;
        
        cache[n] = fib(n - 1) + fib(n - 2);
        return cache[n];
    };
}

// Create a memoized version
const fibonacci = fibonacciMemoized();

// 4. Using ES6 generator (lazy evaluation)
function* fibonacciGenerator() {
    let [prev, curr] = [0, 1];
    
    while (true) {
        yield prev;
        [prev, curr] = [curr, prev + curr];
    }
}

// Example usage:
console.log("Recursive:", fibonacciRecursive(10));  // 55
console.log("Iterative:", fibonacciIterative(10));  // 55
console.log("Memoized:", fibonacci(10));           // 55

// Using the generator to get first 10 Fibonacci numbers
const gen = fibonacciGenerator();
const first10 = [];
for (let i = 0; i < 10; i++) {
    first10.push(gen.next().value);
}
console.log("Generator (first 10):", first10);  // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// Export for use in other modules (if using ES6 modules)
// export { fibonacci, fibonacciIterative, fibonacciRecursive, fibonacciGenerator };
