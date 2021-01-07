// targetMap<any, any>
// depsMap<any, any>
// depSet<any>
var targetMap = {
  // 非嵌套，1个属性
  "{ foo: 1 }": {
    // 当触发foo的getter时
    "foo": ['effect']
  },
  // 非嵌套，2个属性
  "{ bar: 1, baz: 2 }": {
    // 当触发bar的getter时
    "bar": ['effect'],
    // 当触发baz的getter时
    "baz": ['effect']
  },
};

var targetMap = {
  /// 嵌套，1 + 1
  "{ foo: { bar: 1 } }": {
    // 当触发foo的getter时
    "foo": ['{ bar: 1}']
    // 当触发proxy.foo.bar时，这是的target是{ foo: { bar: 1 } }? 还是{ bar: 1 }？
    // 还是{ foo: { bar: 1 } }，key只能拿到foo，拿不到bar
    // 所以单纯的依赖proxy已经是不可能的了，到这里看看testCase 中的嵌套用例
    // 通过分析getter 以及testCase 存储结构已经结束了。
    // /// /// /// 看看setter 有没有新启发
  }
};
