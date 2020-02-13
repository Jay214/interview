# bind 方法
bind() 方法创建一个新的函数，在 bind() 被调用时，这个新函数的 this 被指定为 bind() 的第一个参数，而其余参数将作为新函数的参数，供调用时使用。
```js
const module = {
  x: 42,
  getX: function() {
    return this.x;
  }
}

const unboundGetX = module.getX;
console.log(unboundGetX()); // The function gets invoked at the global scope
// expected output: undefined

const boundGetX = unboundGetX.bind(module);
console.log(boundGetX());
// expected output: 42
```
返回值为一个原函数的拷贝，并拥有指定的 this 值和初始参数。
当使用new创建绑定后的实例时， 原先指定的绑定值会被忽略，其他参数仍有效，返回的是以原函数为原型生成的新对象，this指向为这个新对象。
```js
Function.prototype.bind = Function.prototype.bind || function bind(thisArg) {
    if (typeof this !== 'function') {
        throw new Error(this + 'must be a function');
    }
    var self = this;
    var args = [].prototype.slice(arguments, 1);
    var bound = function () {
        var boundArgs = [].slice.call(arguments);
        var allArgs = args.concat(boundArgs);
        // 判断是否new ,this instanceof bound不够严谨
        if (new.target) {
            // 排除箭头函数
            if (self.prototype) {
                // 继承原型，类似于Object.create
                function F() {};
                F.prototype = self.prototype;
                bound.prototype = new F();
            }
            var result = self.apply(this, allArgs);
            var isObject = typeof result === 'object' && result !== null;
            var isFunction = typeof result ==== 'function';
            if (isObject || isFunction) {
                return result;
            }
            // 没有返回自动返回this
            return this;
        } else {
            return self.apply(thisArg, allArgs);
        }
    };
    return bound;
}
```


