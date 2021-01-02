import {
  ref
} from '../src/ref';

describe('ref', () => {
  it('case01: hold a value', () => {
    const a = ref(1);
    expect(a.value).toBe(1);

    a.value = 2;
    expect(a.value).toBe(2);
  })
})