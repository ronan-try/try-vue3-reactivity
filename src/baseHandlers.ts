/**
 * 核心就是Proxy的几个特性
 * get
 * set
 * has
 * deleteProperty
 * ownKeys
 */

import { reactive, readonly, toRaw, isObject, hasOwn } from './reactive';
import { OperationTypes } from './OperationTypes';
import { track, trigger } from './effect';
import { LOCKED } from './lock'
import { isRef } from './ref';

const builtInSymbols = new Set(
  Object.getOwnPropertyNames(Symbol)
    .map(k => Symbol[k])
    .filter(v => typeof v === 'symbol')
);

function createGetter(isReadonly: boolean) {
  return function get(target: any, key: string | symbol, receiver: any) {
    const res = Reflect.get(target, key, receiver);

    // 为什么symbole
    // 当前key是symbol 且是symbol内置属性名，无疑就是target就是Symbole？
    if (typeof key === 'symbol' && builtInSymbols.has(key)) return res;

    if (isRef(res)) return res.value;

    // 追踪一下
    track(target, OperationTypes.GET, key);

    return isObject(res)
      ? isReadonly ? readonly(res) : reactive(res)
      : res;
  }
}

function set(target: any, key: string | symbol, value: any, recevier: any) {
  // 得到original value
  value = toRaw(value);

  const oldValue = target[key];
  if (isRef(oldValue) && !isRef(value)) {
    oldValue.value = value;
    return true;
  }

  const res = Reflect.set(target, key, value, recevier);

  const hadKey = hasOwn(target, key);
  if (target === toRaw(recevier)) {
    if (!hadKey) {
      trigger(target, OperationTypes.GET, key);
    } else if (oldValue !== value) {
      trigger(target, OperationTypes.SET, key);
    }
  }

  return res;
}

function deleteProperty(target: any, key: string | symbol): boolean {
  const result = Reflect.deleteProperty(target, key);

  const hadKey = hasOwn(target, key);

  if (hadKey) {
    trigger(target, OperationTypes.DELETE, key);
  }
  return result;
}

function has(target: any, key: string | symbol): boolean {
  const result = Reflect.has(target, key);
  track(target, OperationTypes.HAS, key);
  return result;
}

function ownKeys(target: any): (string | number | symbol)[] {
  track(target, OperationTypes.ITERATE);
  return Reflect.ownKeys(target);
}

export const mutableHandlers: ProxyHandler<any> = {
  get: createGetter(false),
  set,
  deleteProperty,
  has,
  ownKeys
}

export const readonlyHandlers: ProxyHandler<any> = {
  get: createGetter(true),
  set(target: any, key: string | symbol, value: any, recevier: any) {
    if (LOCKED) {
      return true;
    } else {
      return set(target, key, value, recevier);
    }
  },
  deleteProperty(target: any, key: string | symbol) {
    if (LOCKED) {
      return true;
    } else {
      return deleteProperty(target, key);
    }
  },
  has,
  ownKeys
}