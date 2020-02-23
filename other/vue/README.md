# vue检测数组变化
在 Vue 的数据绑定中会对一个对象属性的变化进行监听，并且通过依赖收集做出相应的视图更新等等,即用 Object.defineProperty通过对象的 getter/setter实现对象属性变化的监听。对于一般的对象监听没有问题，但当对象为数组时确存在问题：
由于 JavaScript 的限制，Vue 无法检测到以下数组变动：

1.当你使用索引直接设置一项时，例如 vm.items[indexOfItem] = newValue
2.当你修改数组长度时，例如 vm.items.length = newLength

原因是Array.prototype上挂载的方法并不能触发该属性的 setter，因为这个属性并没有做赋值操作。Vue 中解决这个问题的方法，是将数组的常用方法进行重写，通过包装之后的数组方法就能够去在调用的时候被监听到。
一个简单的例子如下：
```js
const reactiveArr = Object.create(Array.prototype);
const arrMethods = [
    'push',
    'pop',
    'splice',
    'shift',
    'unshift',
    'sort',
    'reverse'
];

arrMethods.forEach(method => {
    const oldMethod = Array.prototype[method];
    reactiveArr[method] = function(...args) {
        oldMethod.apply(this, args);
        // 通知订阅器触发更新
    }
});
```
在vue将数据处理为响应式时判断属性是否为数组，若为数组将其原型改为 reactiveArr 即可：
```js
if (Array.isArray(value)) {
    value.__proto__ = reactiveArr
 }
 ```
 上面代码即为Vue中思路的简化版,将 reactiveArr 这个对象作为拦截器。首先让这个对象继承 Array 本身的所有属性，这样就不会影响到数组本身其他属性的使用，后面对相应的函数进行改写，也就是在原方法调用后去通知其它相关依赖这个属性发生了变化，这点和 Object.defineProperty 中 setter所做的事情几乎完全一样，唯一的区别是可以细化到用户到底做的是哪一种操作，以及数组的长度是否变化等等。
