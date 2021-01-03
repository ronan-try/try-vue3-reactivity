
export interface ReactiveEffect {
  deps: any[]
}


export const activeReactiveEffectStack: ReactiveEffect[] = []

export function effect(fn: Function, ...args): any {
  console.log('effect');
  fn();
}

export function track(...args) {
  console.log('track');
  // to do
}
export function trigger(...args) {
  console.log('trigger');
  // to do
}

export function stop(...args) {
  console.log('stop')
  // to do
}