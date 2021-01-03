var foo = 100;
const fooSymbol = Symbol(foo);

var a = {
  [fooSymbol]: true,
  get value() {
    return foo;
  },
  set value(newValue) {
    foo = newValue;
  }
};

console.log();
console.log('foo', foo);

console.log();
console.log('a', a);

console.log();
console.log('a.value', a.value);
console.log();
console.log('a.fooSymbole', a[fooSymbol]);

a.value = 22;
console.log('-------------');
console.log('foo', foo);
console.log();
console.log('a', a);

console.log();
console.log('a.value', a.value);


