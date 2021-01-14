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

function add(this: any, value: any) {
  // 拿到原料 original
  value = toRaw(value);
  const target = toRaw(this);

  // 注意：这里使用了this，没有使用target
  const proto: any = Reflect.getPrototypeOf(this);

  const hadKey = proto.has.call(target, value);
  const result = proto.add.call(target, value);

  if (!hadKey) trigger(target, OperationTypes.ADD, value);

  return result;
}

function set(this: any, key: any, value: any) {
  value = toRaw(value);
  const target = toRaw(this);
  // key 不用toRaw吗？

  // 注意这里用的是this，不是target
  const proto: any = Reflect.getPrototypeOf(this);
  // 这里为啥用target？？？？？
  const hadKey = proto.has.call(target, key);
  const oldValue = proto.get.call(target, key);

  const result = proto.set.call(target, key, value);

  if(value !== oldValue) {
    if (!hadKey) {
      trigger(target, OperationTypes.SET, key);
    } else {
      trigger(target, OperationTypes.ADD, key);
    }
  }

  return result;
}

function  deleteEntry(this: any, key: any) {
  // 拿到original
  const target = toRaw(this);

  // 这里又是this，不是target
  const proto: any = Reflect.getPrototypeOf(this);

  const hadKey = proto.has.call(target, key);
  const oldValue = proto.get ? proto.get.call(target, key) : void 0;

  const result = proto.delete.call(target, key);

  hadKey && trigger(target, OperationTypes.DELETE, key);

  return result;
}

// node: 写到这里发现，Map 和 Set 支持的方法有差异，看看一会儿怎么export出去

function clear(this: any) {
  const target = toRaw(this);

  // 想想为什么 这里用this，
  // 为什么 .call 用target
  const proto: any = Reflect.getPrototypeOf(this);

  const hadItems = target.size !== 0;

  // 这是干什么？看样子是留给dev阶段使用的
  // 咱不需要
  // const oldTarget = target instanceof Map ? new Map(target) : new Set(target);

  const result = proto.clear.call(target);

  hadItems && trigger(target, OperationTypes.CLEAR);

  return result;
}

function createForEach(isReadonly: boolean) {
  return function forEach(this: any, callback: Function, thisArs?: any) {
    const observed = this;
    const target = toRaw(this);
    // 为什么？？？ 这里又是用target？ 上面的方法都是this呢？
    // 需要自己实验一下 Proxy后的obj 的 proto
    const proto: any = Reflect.getPrototypeOf(target);

    const wrap = isReadonly ? toReadonly : toReactive;

    track(target, OperationTypes.ITERATE);

    function wrappedCallback(value: any, key: any) {
      return callback.call(observed, wrap(value), wrap(key), observed);
    }

    return proto.forEach.call(target, wrappedCallback, thisArs);
  }
}

function createIterableMethod(method: string | symbol, isReadonly: boolean) {
  return function(this: any, ...args: any[]) {
    const target = toRaw(this);

    const proto: any = Reflect.getPrototypeOf(target);

    // Map 属于键值对，Set属于数组
    const isPair =
      method === 'entries' ||
      (method === Symbol.iterator && target instanceof Map);

    const innerIterator = proto[method].apply(target, args);
    const wrap = isReadonly ? toReadonly : toReactive;

    track(target, OperationTypes.ITERATE);

    return {
      next() {
        const { value, done } = innerIterator.next();
        return done
          ? { value, done }
          : {
              value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
              done
          }
      },
      [Symbol.iterator]() {
        return this;
      }
    }
  }
}

export const mutableCollectionHandlers: ProxyHandler<any> = {}

export const readonlyCollectionHandlers: ProxyHandler<any> = {}