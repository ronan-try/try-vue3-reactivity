# try-vue3-reactivity
根据vue3-202009版本手敲

## to do
1. 模拟一个[{a:1}]的targetMap
2. im  补上collectionHandlers，睡觉了该


## typescript
> func明明返回boolean，也能搞的入参类型        
```js
export function isRef(v: any): v is Ref<any> {
  return v ? v[refSymbol] === true : false
}
```