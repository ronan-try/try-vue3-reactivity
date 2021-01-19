import {
  isReactive,
  markNonReactive,
  reactive,
  toRaw
} from '../src/reactive';


describe('reactive', () => {

  // 对Object实施reactive
  // reactived 仅具有original的keys，
  // reactived 的getter值不变
  // reactived 可以in追溯原型链
  test('case01, Object', () => {
    const original = { foo: 1 }
    const observed = reactive(original)

    // 这两个的指针应该是不同的
    expect(observed).not.toBe(original)

    expect(isReactive(observed)).toBe(true)
    expect(isReactive(original)).toBe(false)

    // get
    expect(observed.foo).toBe(1);
    // has
    expect('foo' in observed).toBe(true);
    // ownKeys
    expect(Object.keys(observed)).toEqual(['foo']);
  })

  // 对Array试试reactive
  // reactived 内部items符合isReactive()
  // reactived 的getter值不变
  // reactived 仅具有original的keys
  test('case02, Array', () => {
    const original = [{ foo: 1 }];
    const observed = reactive(original);

    expect(observed).not.toBe(original);

    expect(isReactive(original)).toBe(false);
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(observed[0])).toBe(true);

    // getter
    expect(observed[0].foo).toBe(1);
    // has
    expect(0 in observed).toBe(true);
    // ownKeys
    // Object.keys 仅自身可枚举属性
    // Object.getOwnPropertyNames 仅自身可枚举属性 + 不可枚举属性，不含Symbole属性
    expect(Object.keys(observed)).toEqual(['0'])
  })

  // 这个case感觉没啥意思
  test('case03, 浅拷贝reacticed Array，拷贝的是observed values', () => {
    const original = [{ foo: 1 }];
    const observed = reactive(original);
    const clone = observed.slice();

    expect(isReactive(clone[0])).toBe(true);

    expect(clone[0]).not.toBe(origin[0]);
    expect(clone[0]).toBe(observed[0]);
  })

  // 这个case 在ref里面已经有类似的了
  test('嵌套的reacitives', () => {
    const original = {
      nested: {
        foo: 1
      },
      array: [{ bar: 2 }]
    };

    const observed = reactive(original);

    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
  })

  // delete 操作，显然proxy是支持的
  test('case04, <Object>通过代理赋值，对original同等有效', () => {
    const original: any = { foo: 1 };
    const observed = reactive(original);

    observed.bar = 1;
    expect(original.bar).toBe(1);
    expect(observed.bar).toBe(1);

    delete observed.foo;
    expect('foo' in original).toBe(false);
    expect('foo' in observed).toBe(false);
  })

  // 关于Array 就要看看Proxy如何处理push add 这类操作了
  test('case05, <Array>通过代理赋值，对original同等有效', () => {
    const original: any[] = [{ foo: 1 }, { bar: 2 }];
    const observed = reactive(original);

    const val = { baz: 3 };
    const reactivedVal = reactive(val);
    observed[0] = val;

    expect(observed[0]).toBe(reactivedVal);
    expect(original[0]).toBe(val);

    delete observed[0]
    expect(observed[0]).toBe(void 0);
    expect(original[0]).toBe(void 0);

    // proxy 怎么处理Array.push /pop
    // 在try.reactive.ts中看看
    observed.push(val);
    expect(observed[2]).toBe(reactivedVal);
    expect(original[2]).toBe(val);
  })

  test('原始-对象Obj可以通过observe来操作', () => {
    const original: any = { foo: 1 };
    const observed = reactive(original);

    // set
    observed.bar = 1;
    expect(original.bar).toBe(1);
    expect(observed.bar).toBe(1);

    // delete
    delete observed.foo;
    expect('foo' in original).toBe(false);
    expect('foo' in observed).toBe(false);
  })

  test('原始-数组Array可以通过observe来操作', () => {
    const original: any[] = [{ foo: 1 }, { bar: 2 }];
    const observed = reactive(original);

    // set
    const value = { baz: 3 };
    const reactivedValue = reactive(value);

    observed[0] = value;
    expect(original[0]).toBe(value);
    expect(observed[0]).toBe(reactivedValue);

    // delete
    delete observed[0];
    expect(original[0]).toBeUndefined();
    expect(observed[0]).toBeUndefined();

    // mutating
    observed.push(value);
    expect(original[original.length - 1]).toBe(value);
    expect(observed[observed.length - 1]).toBe(reactivedValue);
  })

  // 这个case 上面好像出现过了
  test('给observed设置1个未obseved值，应该包裹reactive挂在observed上，原始值挂在original上', () => {
    const orginal: any = {};
    const observed = reactive<{ foo?: Object }>(orginal);

    const raw = {};
    observed.foo = raw;

    expect(observed.foo).not.toBe(raw);
    expect(isReactive(observed.foo)).toBe(true);

    expect(orginal.foo).toBe(raw);
  })

  test('observe一个observed值，应该返回同一个proxy', () => {
    const observed0 = reactive({ foo: 1 })
    const observed1 = reactive(observed0);

    expect(observed0).toBe(observed1);
  })

  test('多次代理同一个raw，那么应该返回同一个代理', () => {
    const raw = { foo: 1 };

    const observed0 = reactive(raw);
    const observed1 = reactive(raw);

    expect(observed1).toBe(observed0);
  })

  test('代理间的赋值操作，ob层面是ob赋值，raw层面是raw赋值', () => {
    const raw: any = { foo: 1 };
    const raw2 = { bar: 2 };

    const ob1 = reactive(raw);
    const ob2 = reactive(raw2);

    ob1.bar = ob2;

    expect(ob1.bar).toBe(ob2);
    expect(raw.bar).toBe(raw2);
  })

  test('roRaw', () => {
    const original = { foo: 1 };
    const observed = reactive(original);

    expect(toRaw(observed)).toBe(original);
    expect(toRaw(original)).toBe(original);
  })

  // 不能被reactive的类型
  // number string boolean null undefined symbol
  // test('non-observable values', () => {
  // const assertValue = (value: any) => {
  //   reactive(value)
  //   expect(
  //     `value cannot be made reactive: ${String(value)}`
  //   ).toHaveBeenWarnedLast()
  // }

  // // number
  // assertValue(1)
  // // string
  // assertValue('foo')
  // // boolean
  // assertValue(false)
  // // null
  // assertValue(null)
  // // undefined
  // assertValue(undefined)
  // // symbol
  // const s = Symbol()
  // assertValue(s)

  // // built-ins should work and return same value
  // // 内置对象们
  // const p = Promise.resolve()
  // expect(reactive(p)).toBe(p)
  // const r = new RegExp('')
  // expect(reactive(r)).toBe(r)
  // const d = new Date()
  // expect(reactive(d)).toBe(d)
  // })

  test('markNonReactive', () => {
    const obj = reactive({
      foo: { a: 1},
      bar: markNonReactive({b:2})
    });

    expect(isReactive(obj.bar)).toBe(false);
    expect(isReactive(obj.foo)).toBe(true);
  })


})