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
function canObserve(obj: any): boolean {
  return (
    !obj._isVue &&
    !obj._isVNode &&
    observableValueRe.test(Object.prototype.toString.call(obj)) &&
    !nonReactiveValues.has(obj)
  );
}

// 类似函数使用声明
export function reactive<T extends object>(target: T): UnwrapNestedRefs<T>
export function reactive<T>(target: object) {
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
  // 在{observed: raw}中已经发现了target，那就说明：
  // target本身是一个observed，直接返回就行
  if (readonlyToRaw.has(target)) return target;
  // readonlyValue只存了target，所以返回需要readonley()一下
  if (readonlyValues.has(target)) return readonly(target);

  return createReactiveObject(
    target,
    rawToReactive,
    reactiveToRaw,
    mutableHandlers,
    mutableCollectionHandlers,
  );
}

export function readonly<T extends object>(target: T): UnwrapNestedRefs<T>
export function readonly<T>(target: object) {
  // 我的思路
  // x1. !canObserve(target) return target;
  // x2. nonReactiveValues.has(target) return target;
  // x3. readonlyValues.has(target) return getter
  // x4. rawToreadonly.has(target) return getter
  // x5. rawToreactive.has(target) return 啥？

  // 源码
  if (reactiveToRaw.has(target)) {
    target = reactiveToRaw.get(target);
  }

  return createReactiveObject(
    target,
    rawToReadonly,
    readonlyToRaw,
    readonlyHandlers,
    readonlyCollectionHandlers,
  );
}
function createReactiveObject(
  target: any,
  toProxy: WeakMap<any, any>,
  toRaw: WeakMap<any, any>,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>,
) {
  // isObject > canObserv(include nonReactiveValues) >
  // readonlyValues > 傻了吧，它把reactive和readonly都搞到这个函数中了
  // readonleyToRaw > reactiveToRaw > 递归一下？
  // 傻了吧，递归个毛，想想Proxy Array.push,还用我点破吗
  // 真的吗？try里面nested obj中写getter console时，只能是子集，子孙级别不好使
  // 为什么？？？ nested test case 怎么解释呢？看看baseHandler咋搞的
  if (!isObject(target)) return target;

  let observed = toProxy.get(target);
  if (observed !== void 0) return observed;

  if (toRaw.has(target)) return target;

  if (!canObserve(target)) return target;

  const handlers = collectionTypes.has(target.constructor)
    ? collectionHandlers
    : baseHandlers;

  observed = new Proxy(target, handlers);

  toProxy.set(target, observed);
  toRaw.set(observed, target);

  if (!targetMap.has(target)) targetMap.set(target, new Map());
  return observed;
}

export function isReactive(obj): boolean {
  console.log('isReactive');

  return reactiveToRaw.has(obj) || readonlyToRaw.has(obj);
}

export function isReadonly(target): boolean {
  return readonlyToRaw.has(target);
}

export function toRaw(observed): any {
  console.log('toRaw');
  return (
    reactiveToRaw.get(observed) ||
    readonlyToRaw.get(observed) ||
    observed
  );
}

export function markReadonly(value) {
  readonlyValues.add(value);
  return value;
}

export function markNonReactive(obj) {
  nonReactiveValues.add(obj);
  return obj;
}