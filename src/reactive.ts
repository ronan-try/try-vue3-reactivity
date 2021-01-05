export function reactive<T> (target: T): T {
  console.log('reactive')
  return target
}

export function isReactive(obj): boolean {
  console.log('isReactive');

  return !0;
}