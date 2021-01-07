# try-vue3-reactivity
根据vue3-202009版本手敲


## typescript
> func明明返回boolean，也能搞的入参类型        
```js
export function isRef(v: any): v is Ref<any> {
  return v ? v[refSymbol] === true : false
}
```