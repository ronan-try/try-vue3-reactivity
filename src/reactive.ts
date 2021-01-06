import { mutableHandlers, readonlyHandlers } from './baseHandlers';
import { mutableCollectionHandlers, readonlyCollectionHandlers } from './collectionHandlers';

import { UnwrapNestedRefs } from './ref';
import { ReactiveEffect } from './effect';

const isObject = (obj: any) => obj !== null && typeof obj === 'object';


export type Dep = Set<ReactiveEffect>;
export type KeyToDepMap = Map<string | symbol, Dep>;

export const targetMap = new WeakMap<any, KeyToDepMap>();

// ??? 用两组来cache的话，后续的操作是不是要同时记得修改2套
const rawToReactive = new WeakMap<any, any>();
const reactiveToRaw = new WeakMap<any, any>();
const rawToReadonly = new WeakMap<any, any>();
const readonlyToRaw = new WeakMap<any, any>();

// ??? 为啥要把这2个单独搞一下
// ??? 这么cache有啥用吗？
const readonlyValues = new WeakSet<any>();

// 1. 在canObserve()
// 2. markNonReactive()
// 此处用WeakSet的weak特性，简直绝了，不用想c一样考虑释放内存
const nonReactiveValues = new WeakSet<any>();

/** 可以被Observed的集合 */
const collectionTypes = new Set<Function>([Set, Map, WeakSet, WeakMap]);

/** 可被observable的原型链类型 */
// 应予以canObserve()
const observableValueRe = /^\[object (?:Object|Array|Map|Set|WeakMap|WeakSet)\]$/;
function canObserve (obj: any): boolean {
  return (
    !obj._isVue &&
    !obj._isVNode &&
    observableValueRe.test(Object.prototype.toString.call(obj)) &&
    !nonReactiveValues.has(obj)
  );
}

// 类似函数使用声明
export function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
export function reactive<T> (target: object) {
  console.log('reactive')
  // 我的大纲
  // x1, if !canObserve(target) return target;
  // x2, nonReactiveValues.has(target) return target
  // o3, readonlyValues.has(target) reutrn target
  // xo4. rawToReanonly.has(target) return target
  // x5. rawToreactive.has(target) return getter
  // 但是对象是嵌套的，属性也得处理，搞个递归？？

  // 忘记了isObject

  // 源码
  if (readonlyToRaw.has(target)) return target;
  if (readonlyValues.has(target)) return target;

  return createReactiveObject(
    target,
    rawToReadonly,
    readonlyToRaw,
    readonlyHandlers,
    readonlyCollectionHandlers,
  );
}

export function readonly<T extends object>(target: T): UnwrapNestedRefs<T>
export function readonly<T>(target: object) {
  
}
function createReactiveObject(
  target: any,
  toProxy: WeakMap<any, any>,
  toRaw: WeakMap<any, any>,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>,
) {
  if (!isObject(target)) return target;

}

export function isReactive(obj): boolean {
  console.log('isReactive');

  return !0;
}

export function toRaw(obj): any {
  console.log('toRaw')
}

export function markNonReactive(obj) {

}