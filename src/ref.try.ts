var foo = 100;

var a = {
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

a.value = 22;
console.log('-------------');
console.log('foo', foo);
console.log();
console.log('a', a);

console.log();
console.log('a.value', a.value);


