
const arr = [];
[].push.call(arr, {foo: 1}, {bar: 2});
const observed = new Proxy(arr, {
  get (target, prop) {
    console.log('get: ', prop);

    return target[prop];
  },
  set (target, prop, val) {
    console.log('set: ', prop, val);
    return Reflect.set(target, prop, val);
  }
})

// console.log(arr[0]);
// console.log(observed[0]);
// console.log('-------------------');

let baz = { baz: 1};
observed.push(...[baz, baz]);

console.table(arr);

// {
//   let arr = [1, 2, 3]
//   let proxy = new Proxy(arr, {
//     get (target, prop, receiver) {
//       console.log('get', prop);
//       return target[prop];
//     },
//     set (target, prop, val, receiver) {
//       console.log('set', prop, val);
//       return true;
//     }
//   });

//   proxy.push(2323);
//   console.log('---')
//   typeof proxy.push
// }

{
  console.log('我是分割线');
  const nested = {
    foo: {
      bar: 1,
      baz: 2
    }
  };
  const proxy = new Proxy(nested, {
    get (target, prop, receiver) {
      console.log('get receiver: ', receiver == proxy);
      console.log('get: ', prop);
      console.log('get val:', target[prop]);
      return target[prop];
    },
    set (target, prop, val) {
      console.log('set: ', prop, val);
      return Reflect.set(target, prop, val);
    }
  });

  console.log(proxy.foo.bar);
  // console.log(proxy.foo.baz);
  // console.log('我是分割线-------------');
  // proxy.foo.bar = 100;
  // console.log('------------', nested.foo.bar);
  // console.log(proxy.foo.bar);

  // console.log('nested == proxy', nested == proxy);
  // console.log('nested.foo == proxy.foo', nested.foo == proxy.foo);
  // console.log('nested.foo.bar == proxy.foo.bar', nested.foo.bar == proxy.foo.bar);
}