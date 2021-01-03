
export function effect(fn: Function, ...args) {
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