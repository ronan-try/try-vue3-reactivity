/**
 * 核心还是完成 ProxyHandler的特性
 * get
 * set
 * has
 * ownKey
 * deleteProperty
 */

import { toRaw, reactive, readonly, isObject, hasOwn } from './reactive';
import { track, trigger } from './effect';
import { OperationTypes } from './OperationTypes';
import { LOCKED } from './lock'

function toReactive(value: any) {
  return isObject(value) ? reactive(value) : value;
}

function toReadonly(value: any) {
  return isObject(value) ? readonly(value) : value;
}


export const mutableCollectionHandlers: ProxyHandler<any> = {}

export const readonlyCollectionHandlers: ProxyHandler<any> = {}