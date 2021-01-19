import { computed } from '../src/computed'
import { reactive } from '../src/reactive'
import { ref } from '../src/ref'
import { effect, stop } from '../src/effect'

describe('computed', () => {

  it(`case01 返回最新值`, () => {
    const value = reactive<{ foo?: number}>({})
    const cValue = computed(() => value.foo)

    // 说明 computed()的结构跟ref()的结构一样的
    expect(cValue.value).toBe(void 0)

    value.foo = 1
    expect(cValue.value).toBe(1)
  })

  it(`衍生case01 添加了rawObj和ref()`, () => {
    const obj = {}
    const refV = ref(obj)
    const reactiveV = reactive(refV)
    const computedV = computed(() => reactiveV.foo)

    expect(computedV.value).toBe(void 0)
    expect(refV.value.foo).toBe(void 0)

    reactiveV.foo = 1
    expect('foo' in obj).toBe(false)
    expect(refV.value.foo).toBe(1)
    expect(reactiveV.foo).toBe(1)
    expect(computedV.value).toBe(1)
  })

  it(`case02 懒惰计算`, () => {
    const v = reactive({})
    const getter = jest.fn(() => v.foo)
    const cV = computed(getter)

    // lazy
    expect(getter).not.toHaveBeenCalled()

    expect(cV.value).toBe(void 0)
    expect(getter).toHaveBeenCalledTimes(1)

    // 不应该计算
    cV.value
    expect(getter).toHaveBeenCalledTimes(1)

    // 不应该计算，只到被使用时
    v.foo = 1
    expect(getter).toHaveBeenCalledTimes(1)

    // 应该计算，因为被用到了
    expect(cV.value).toBe(1)
    expect(getter).toHaveBeenCalledTimes(2)

    cV.value
    expect(getter).toHaveBeenCalledTimes(2)
  })

  it(`case03 effect操作computedValue时，应该保持响应`, () => {
    const val = reactive({})
    const cVal = computed(() => val.foo)

    let dummy
    effect(() => {
      dummy = cVal.value
    })
    expect(dummy).toBe(void 0)

    val.foo = 1
    expect(cVal.value).toBe(1)
    expect(dummy).toBe(1)
  })

  // 越往后越是发现reactive 和 effect
  it(`case04 computed能被链式调用`, () => {
    const val = reactive({foo: 0})
    const c1 = computed(() => val.foo)
    const c2 = computed(() => c1.value + 100)

    expect(c2.value).toBe(100)
    expect(c1.value).toBe(0)

    val.foo++
    expect(c2.value).toBe(101)
    expect(c1.value).toBe(1)
  })

  it(`case05 computed链式调用，也能effect`, () => {
    const val = reactive({foo: 0})
    const getter1 = jest.fn(() => val.foo)
    const getter2 = jest.fn(() => (c1.value + 1))

    const c1 = computed(getter1)
    const c2 = computed(getter2)

    let dummy
    effect(() => dummy = c2.value)
    expect(dummy).toBe(1)
    expect(getter1).toHaveBeenCalledTimes(1)
    expect(getter2).toHaveBeenCalledTimes(1)

    val.foo++
    // 因为computed是lazy
    expect(getter1).toHaveBeenCalledTimes(1)
    expect(getter2).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(2)
    expect(getter1).toHaveBeenCalledTimes(2)
    expect(getter2).toHaveBeenCalledTimes(2)
  })

  it(`case06 在effect中使用2个computed`, () => {
    const value = reactive({ foo: 0 })
    const getter1 = jest.fn(() => value.foo)
    const getter2 = jest.fn(() => c1.value + 1)

    const c1 = computed(getter1)
    const c2 = computed(getter2)

    let dummy
    effect(() => {
      dummy = c1.value + c2.value
    })
    expect(dummy).toBe(1)

    expect(getter1).toHaveBeenCalledTimes(1)
    expect(getter2).toHaveBeenCalledTimes(1)

    value.foo++
    expect(dummy).toBe(3)
    expect(getter1).toHaveBeenCalledTimes(2)
    expect(getter2).toHaveBeenCalledTimes(2)
  })

  it(`case07 stop阻止computed的effect更新`, () => {
    const value = reactive({})
    const cValue = computed(() => value.foo)

    let dummy
    effect(() => {
      dummy = cValue.value
    })
    expect(dummy).toBe(void 0)

    value.foo = 1
    expect(dummy).toBe(1)
    
    stop(cValue.effect)
    value.foo = 2
    expect(dummy).toBe(1)
  })


  // 看到这里就意味着 computed接收的参数
  // 应该跟jQuery中的很像了 通过参数类型来判断
  // $.on('', {}, handler) $.on('', handler)
  it(`case08 computed应该支持setter`, () => {
    const n = ref(1)
    const plusOne = computed({
      get: () => n.value + 1,
      set: val => {
        n.value = val -1
      }
    }) as any

    expect(plusOne.value).toBe(2)

    n.value++
    expect(plusOne.value).toBe(3)

    plusOne.value = 0
    expect(n.value).toBe(-1)
  })

  it('case09 computed中的setter应该能trigger到effect', () => {
    const n = ref(1)
    const plusOne = computed({
      get: () =>n.value + 1,
      set: val => {
        n.value = val -1
      }
    })

    let dummy
    effect(() => {
      dummy = n.value
    })
    expect(dummy).toBe(1)
    
    plusOne.value = 0
    expect(dummy).toBe(-1)
  })








})