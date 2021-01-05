
const arr = [];
[].push.call(arr, {foo: 1}, {bar: 2});
const observed = new Proxy(arr, {
  get (target, prop) {
    console.log();
    console.log('get-prop: ', prop);

    return JSON.stringify(target[prop]);
  },
  set (target, prop, val) {
    console.log();
    console.log('set-key', prop);
    console.log('set-value', val);
    return true;
  }
})

// console.log(arr[0]);
// console.log(observed[0]);
// console.log('-------------------');

let baz = { baz: 1};
observed.push(baz);

const len = arr.length;
console.log(arr[len-1]);
console.log(observed[len-1]);