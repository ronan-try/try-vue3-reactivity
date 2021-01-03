import { Ref, refSymbol, UnwrapNestedRefs } from './ref'
import { activeReactiveEffectStack, effect, ReactiveEffect } from './effect'

export function isFunction(v: any) {
  return typeof v === 'function'
}

// ComputedRef 是Ref的子集
// 为什么？？？多一个effect，难道是为了给stop提供入口的？？？
export interface ComputedRef<T> extends Ref<T> {
  readonly value: UnwrapNestedRefs<T>
  readonly effect: ReactiveEffect
}

export interface WritableComputeRef<T> extends Ref<T> {
  readonly effect: ReactiveEffect
}
export interface WritableComputedOptions<T> {
  get: () => T
  set: (v: T) => void
}

export function computed<T>(getter: () => T): ComputedRef<T>
export function computed<T>(options: WritableComputedOptions<T>): WritableComputeRef<T>

// 很牛逼的变量名，一眼就懂了
export function computed<T>(
  getterOrOptions: (() => T) | WritableComputedOptions<T>
): any {
  console.log('computed');

  // step1,
  // 通过入参类型来判断是getter? 还是options
  const isReadonly = isFunction(getterOrOptions);

  // step2, 
  const getter = isReadonly
    ? (getterOrOptions as (() => T))
    : (getterOrOptions as WritableComputedOptions<T>).get;
  const setter = isReadonly
    ? () => {
      // to do warn
    }
    : (getterOrOptions as WritableComputedOptions<T>).set;
  
  // step3,
  let dirty = true;
  let value: T;
  
  const runner = effect(getter, {
    lazy: true,
    computed: true,
    scheduler: () => {
      dirty = true;
    }
  });

  const res = {
    [refSymbol]: true,
    effect: runner,
    get value() {
      if (dirty) {
        value = runner();
        dirty = false;
      }

      // 为什么要在get当前时，遍历他孩子
      trackChildRun(runner);
      return value;
    },
    set value(newValue: T) {
      setter(newValue);
    }
  }

  return res;
}

// 还是得保留到reactive 和 effect中去
function trackChildRun(childRunner: ReactiveEffect) {
  const parentRunner =
    activeReactiveEffectStack[activeReactiveEffectStack.length -1];

  if (parentRunner) {
    for (let i = 0; i < childRunner.deps.length; i++) {
      const dep = childRunner.deps[i];
      if (!dep.has(parentRunner)) {
        dep.add(parentRunner);
        parentRunner.deps.push(dep);
      }
      
    }
  }
}