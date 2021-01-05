import {
  isReactive,
  reactive
} from '../src/reactive';


describe('reactive', () => {

  // 对Object实施reactive
  // reactived 仅具有original的keys，
  // reactived 的getter值不变
  // reactived 可以in追溯原型链
  test('Object', () => {
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
  test('Array', () => {
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
  test('浅拷贝reacticed Array，拷贝的是observed values', () => {
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
  test('<Object>通过代理赋值，对original同等有效', () => {
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
  test('<Array>通过代理赋值，对original同等有效', () => {
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
})