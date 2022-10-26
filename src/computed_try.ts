
function computed(fn, ...args) {
  const v = fn();
  return {
    get value() {
      return v;
    }
  }
}

const v = {foo: 0}
const cv = computed(() => v.foo);

console.log('v.foo', v.foo)
console.log('cv.value', cv.value)

v.foo = 1
console.log('v.foo', v.foo)
console.log('cv.value', cv.value)