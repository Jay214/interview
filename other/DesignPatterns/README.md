# 策略模式
指定义一系列的算法，把它们一个个封装起来。并且使它们可以相互替换。将不变的部分和变化的部分分隔开，策略模式的目的就是将算法的使用与算法的实现分离开来。
策略模式包含两部分：策略类，封装了具体的算法，负责具体的计算过程，环境类，接受客户请求，随后把请求委托给一个策略类。
应用场景：表单验证。绩效等级计算等有关多种选择的情况。
优点： 
策略模式可以避免代码中的多重判断条件。 
将一个个算法（解决方案）封装在一个个策略类中。便于切换，理解，扩展。 
算法可以重复利用在系统的各个地方，避免复制粘贴。 
逻辑清晰明了。 
如计算员工当月的绩效工资，由当月的绩效评级和基本工资组成：
```js
let caculatePerformance = function(performanceLevel, basicSalary) {
    if (performanceLevel === 'A') {
        return basicSalary;
    }
    if (performanceLevel === 'B') {
        return basicSalary * 0.75;
    }
    if (performanceLevel === 'C') {
        return basicSalary * 0.5;
    }
    if (performanceLevel === 'D') {
        return basicSalary * 0.25;
    }
}
```
函数内部庞大，包含了过多的if/else语句，并且不易扩展，如果增加了绩效等级或者是修改计算比例，都要在函数内部去修改。算法不具有复用性，下面应用策略模式修改：
```js
let caculateStrategies = {
    'A': basicSalary => basicSalary,
    'B': basicSalary => basicSalary * 0.75,
    'C': basicSalary => basicSalary * 0.5,
    'D': basicSalary => basicSalary * 0.25
};

let caculatePerformance = function (performanceLevel, basicSalary) {
    return caculateStrategies[performanceLevel](basicSalary);
};

console.log( caculatePerformance( 'A', 8000 ) ); // 输出：8000
console.log( caculatePerformance( 'C', 8000 ) ); // 输出：4000
```
caculateStrategies对象作为策略类封装了具体的算法，负责具体的计算过程；caculatePerformance则作为环境类，接受客户请求，随后把请求委托给策略类，代码结构简洁，易于扩展和复用。

# 单例模式
保证一个类仅有一个实例，并提供一个访问它的全局访问点。
先判断实例存在与否，如果存在则直接返回，如果不存在就创建了再返回，这就确保了一个类只有一个实例对象。
适用场景：一个单一对象。比如：弹窗，无论点击多少次，弹窗只应该被创建一次。
```js
let single = (function() {
    let unique;
    function getInstance() {
        if (unique === undefined) {
            unique = new Construct();
        }
        return unique;
    }

    function Construct() {
        // 生成单例的构造函数代码
    }
    return {
        getInstance: getInstance
    }
})();
```

# 装饰者模式
在不改变对象自身的基础上，在程序运行期间给对象动态地添加方法。
场景：原有方法维持不变，在原有方法上再挂载其他方法来满足现有需求；函数的解耦，将函数拆分成多个可复用的函数，再将拆分出来的函数挂载到某个函数上，实现相同的效果但增强了复用性。
缺点：装饰链叠加了函数作用域，如果过长也会产生性能问题
如果原函数上保存了属性，返回新函数后属性会丢失
```js
Function.prototype.before = function(beforeFunc) {
    let that = this;
    return function() {
        beforeFunc.apply(this, arguments);
        return that.apply(this, arguments);
    }
};

Function.prototype.after = function(afterFunc) {
    let that = this;
    return function() {
        that.apply(this, arguments);
        afterFunc.apply(this, arguments);
    }
};

let foobar = function(x, y, z) {
    console.log(x, y, z);
};
let foo = function(x, y, z) {
    console.log(x/10, y/10, z/10);
};
let bar = function(x, y, z) {
    console.log(x*10, y*10, z*10);
};
foobar = foobar.before(foo).after(bar);
```

# 发布/订阅模式
又叫观察者模式,它定义对象间的一种一对多的依赖关系,当一个对象的状态发生改变时,所有依赖于它的对象都将得到通知。
场景：订阅感兴趣的专栏和公众号。Vue双向数据绑定。

# 代理模式
为一个对象提供一个代用品或占位符，以便控制对它的访问。
场景：图片懒加载，先通过一张loading图占位，然后通过异步的方式加载图片，等图片加载好了再把完成的图片加载到img标签里面。

# 中介者模式
通过一个中介者对象，其他所有的相关对象都通过该中介者对象来通信，而不是相互引用，当其中的一个对象发生改变时，只需要通知中介者对象即可。通过中介者模式可以解除对象与对象之间的紧耦合关系。
场景：购物车需求，存在商品选择表单、颜色选择表单、购买数量表单等等，都会触发change事件，那么可以通过中介者来转发处理这些事件，实现各个事件间的解耦，仅仅维护中介者对象即可。

# 工厂模式
这种模式抽象了创建具体对象的过程。