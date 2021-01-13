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

function get(target: any, key: any, wrap:(t:any) => any):any {
  // 1. 拿到原始材料original
  target = toRaw(target);
  key = toRaw(key);

  // 2. 得到collection的原型
  const proto: any = Reflect.getPrototypeOf(target);

  // 跟踪一下，为effect准备
  // 为什么get时，跟踪？？？
  /**
   * 难道尽在track时跟踪吗？trigger是不是也得跟踪呢？比如：
   * observed[0] = 100; 赋值行为：先触发get，还是set？看实验结果：
   * 直接触发set操作，不会触发get
   * 所以一会儿看一下set函数，有没有跟踪/或者是在trigger跟踪了？？？
   * */
  track(target, OperationTypes.GET, key);

  // 3. 调用原型的get方法
  const result = proto.get.call(target, key);
  return wrap(result);
}

function has(this: any, key: any): boolean {
  // 拿到原始材料
  const target = toRaw(this);
  key = toRaw(key);

  // 拿到原型
  const proto: any = Reflect.getPrototypeOf(target);

  // 擦，很智慧呢
  // track都是original的，这样能减少target有多个代理 或者 被称为属性
  track(target, OperationTypes.HAS, key);

  // 调用原型方法
  return proto.has.call(target, key);
}


function size(target: any) {
  target = toRaw(target);
  const proto = Reflect.getPrototypeOf(target);

  track(target, OperationTypes.ITERATE);

  // 又是一个智慧的使用
  return Reflect.get(proto, 'size', target);

  // 我还以为要proto.size.call()呢，仔细想想size是属性
}

export const mutableCollectionHandlers: ProxyHandler<any> = {}

export const readonlyCollectionHandlers: ProxyHandler<any> = {}