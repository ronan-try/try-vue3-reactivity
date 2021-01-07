import { track, trigger } from './effect';
import { reactive } from './reactive';
import { OperationTypes } from './OperationTypes';

export const refSymbol = Symbol('refSymbol');

const isObject = (val: any): boolean =>
  val !== null && typeof val === 'object';

// reactive仅对object生效
// 因为啥？？？值类型哪有getter setter
function convertToReactive(val: any): any {
  if (isObject(val)) return reactive(val);
  return val;
}

export function ref(raw: any) {
  // 如果是Object就reactive一下，否则就返回自身
  // case02
  raw = convertToReactive(raw);

  const v = {
    [refSymbol]: true,
    get value() {
      // 在这里追踪就可以了
      // 因为要使用ref，你必须得`.value`一下
      // 为什么不在reactive()中追踪呢？？？
      // 难道是因为reactive()搞不定值类型
      track(v, OperationTypes.GET, '');
      return raw;
    },
    set value(newValue) {
      raw = convertToReactive(newValue);
      // ？？？为什么要trigger一下
      // 结合case04，05，06，07
      // 当赋值ref.value时，对应的effect、reactive、computed都得生效
      // 因为你们是reactivity家族
      trigger(v, OperationTypes.SET, '');
    }
  };
  return v;
}


export function isRef (val: any): val is Ref<any> {
  // if (!val) return false; // 牛逼 null undefined
  // if((val as Ref)[refSymbol]) return true;
  // return false;
  // 参考一下牛逼的代码，一行顶我3行
  // 牛逼，不晓得number boolean还能使用[]语法，且不跑错
  // 牛逼，我没考虑到null undefinded不能使用[]语法
  return val ? val[refSymbol] === true : false;
}

/**
 * 以目前这个调性来看，接收到的参数是reactive
 */
export function toRefs (obj: any): any {
  // to do
  const ret: any = {};
  for (const key in obj) {
    ret[key] = toProxyRef(obj, key)
  }
  return ret;
}

// 为啥toProxyRef就没有track 和 trigger呢？
function toProxyRef(obj: any, key: any) {
  const v = {
    [refSymbol]: true,
    get value() {
      return obj[key];
    },
    set value(newVal) {
      obj[key] = newVal;
    }
  };
  return v;
}



// types
// types
export interface Ref<T> {
  [refSymbol]: true,
  value: UnwrapNestedRefs<T>
}
export type UnwrapNestedRefs<T> = T extends Ref<any> ? T : UnwrapRef<T>;
 /** 保证的类型 */
type BailTypes =
| Function
| Map<any, any>
| Set<any>
| WeakMap<any, any>
| WeakSet<any>
// Recursively unwraps nested value bindings.
export type UnwrapRef<T> = {
  ref: T extends Ref<infer V> ? UnwrapRef<V> : T
  array: T extends Array<infer V> ? Array<UnwrapRef<V>> : T
  object: { [K in keyof T]: UnwrapRef<T[K]> }
  stop: T
}[T extends Ref<any>
  ? 'ref'
  : T extends Array<any>
    ? 'array'
    : T extends BailTypes
      ? 'stop' // bail out on types that shouldn't be unwrapped
      : T extends object ? 'object' : 'stop'];
