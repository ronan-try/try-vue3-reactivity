/**
 * 核心就是Proxy的几个特性
 * get
 * set
 * has
 * deleteProperty
 * ownKeys
 */

import { reactive, readonly, toRaw, isObject, hasOwn  } from './reactive';
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

    if(isRef(res)) return res.value;

    // 追踪一下
    track(target, OperationTypes.GET, key);

    return isObject(res)
      ? isReadonly ? readonly(res) : reactive(res)
      : res;
  }
}

export const mutableHandlers: ProxyHandler<any> = {}

export const readonlyHandlers: ProxyHandler<any> = {}