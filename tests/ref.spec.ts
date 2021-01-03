import { effect } from '../src/effect';
import { reactive } from '../src/reactive';
import { computed } from '../src/computed';
import {
  isRef,
  ref,
  toRefs
} from '../src/ref';

describe('ref', () => {
  it('case01: hold a value', () => {
    const a = ref(1);
    expect(a.value).toBe(1);

    a.value = 2;
    expect(a.value).toBe(2);
  })

  it('case02: be reactive', () => {
    // 应该是reactive()处理的
    const a = ref(1);
    let dummy;
    effect(() => {
      dummy = a.value;
    });
    expect(dummy).toBe(1);

    a.value = 2;
    expect(dummy).toBe(2);
  })

  it('case03: ref对嵌套对象 生效', () => {
    // 应该也是在reactive()处理
    const a = ref({
      count: 1
    });
    let dummy;
    effect(() => {
      dummy = a.value.count;
    })
    
    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  })

  // ？？？为什么要这么做
  // a=ref()在被b = reactive()潜逃时，
  // 在外侧，可直接使用b.a = 100;而不用b.a.value =100,不友好
  it(`case04: ref被嵌套在reactive也该有效`, () => {
    const a = ref(1);
    // 也是在reactive()处理的
    const obj = reactive({
      a,
      b: {
        c: a,
        d: [a]
      }
    });
    let dummy1, dummy2, dummy3;
    effect(() => {
      dummy1 = obj.a;
      dummy2 = obj.b.c;
      dummy3 = obj.b.d[0];
    });

    a.value++;
    expect(dummy1).toBe(2);
    expect(dummy2).toBe(2);
    expect(dummy3).toBe(2);

    obj.a++;
    expect(dummy1).toBe(3);
    expect(dummy2).toBe(3);
    expect(dummy3).toBe(3);
  })

  // 应该跟case04一个套路
  // reactive()搞的鬼，
  // 因为ref()具有reactive, 而ref(ref()) 就是case04相似了
  it(`case05: typeof 是原来的type`, () => {
    const a = {
      b: ref(0)
    };
    const c = ref(a);
    expect(typeof (c.value.b)).toBe('number')
  })

  it(`case06:isRef `, () => {
    // 这个是放在refSymbole属性
    expect(isRef(ref(1))).toBe(true);

    // computed是咋搞的呢？？？
    expect(isRef(computed(()=> 1))).toBe(true);

    expect(isRef(0)).toBe(false);
    expect(isRef(1)).toBe(false);
    // 严谨的case，哈哈
    // 但是看了源码就没必要了
    expect(isRef({value: 0})).toBe(false);
  })

  it(`case07: toRefs`,() => {
    const a = reactive({
      x: 1,
      y: 2,
    });

    // 将reactive()转换成refs们
    const { x, y } = toRefs(a);

    expect(isRef(x)).toBe(true);
    expect(isRef(y)).toBe(true);
    expect(x.value).toBe(1);
    expect(y.value).toBe(2);

    // reactive()的赋值，依然与toRefs保持响应
    // 牛啤
    a.x = 2;
    a.y = 3;
    expect(x.value).toBe(2);
    expect(y.value).toBe(3);

    // ref赋值，也能响应reactive
    // 这个可能是？？？ref的setter中的trigger
    x.value = 3;
    y.value = 4;
    expect(a.x).toBe(3);
    expect(a.y).toBe(4);

    // 能响应到effect
    // 应该也是ref中setter的trigger()
    let dummyX, dummyY;
    effect(() => {
      dummyX = x.value;
      dummyY = y.value;
    });
    expect(dummyX).toBe(x.value);
    expect(dummyY).toBe(y.value);

    a.x = 4;
    a.y = 5;
    expect(dummyY).toBe(5);
    expect(dummyX).toBe(4);
  })








})