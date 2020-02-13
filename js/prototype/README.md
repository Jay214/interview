# 作用域
变量的作用域无非就是两种：全局变量和局部变量。
全局作用域：
最外层函数定义的变量拥有全局作用域，即对任何内部函数来说，都是可以访问的：
```js
<script>
      var outerVar = "outer";
      function fn(){
         console.log(outerVar);
      }
      fn();//result:outer
   </script>
   ```
局部作用域：
和全局作用域相反，局部作用域一般只在固定的代码片段内可访问到，而对于函数外部是无法访问的，最常见的例如函数内部:
```js
<script>
      function fn(){
         var innerVar = "inner";
      }
      fn();
      console.log(innerVar);// ReferenceError: innerVar is not defined
</script>
```
js的局部作用域也可称为函数作用域，一般相对于函数而言。
在es6之前，js是没有块级作用域的，块级作用域可简单理解为每一段花括号里面的代码(代码段)都具有各自的作用域，变量在声明他们的代码段外都是不可见的。
# 作用域链
个人理解：根据在内部函数可以访问外部函数变量的这种机制，用链式查找决定哪些数据能被内部函数访问。即查找量的过程。
函数内的变量值不是在编译的时候就确定的，而是等在运行时期再去寻找的。
# 执行环境
每个函数运行时都会产生一个执行环境，而这个执行环境怎么表示呢？js为每一个执行环境关联了一个变量对象。环境中定义的所有变量和函数都保存在这个对象中。
全局执行环境是最外围的执行环境，全局执行环境通常被认为是window对象，因此所有的全局变量和函数都作为window对象的属性和方法创建的。
js的执行顺序是根据函数的调用来决定的，当一个函数被调用时，该函数环境的变量对象就被压入一个环境栈中。而在函数执行之后，栈将该函数的变量对象弹出，把控制权交给之前的执行环境变量对象。
当某个函数第一次被调用时，就会创建一个执行环境(execution context)以及相应的作用域链，并把作用域链赋值给一个特殊的内部属性([scope])。然后使用this，arguments(arguments在全局环境中不存在)和其他命名参数的值来初始化函数的活动对象(activation object)。当前执行环境的变量对象始终在作用域链的第0位。
若函数调用时变量没有在当前作用域找到，便会沿着作用域链向外查找，直到全局环境。
# 闭包
父函数执行完后，内部函数的作用域链仍然保持对父函数活动对象的引用。
闭包的两个重要特点：
1.可以读取自身函数外部的变量
2.可以让这些外部变量始终保存在内存中
```js
  function outer(){
         var result = new Array();
         for(var i = 0; i < 2; i++){//注：i是outer()的局部变量
            result[i] = function(){
               return i;
            }
         }
         return result;//返回一个函数对象数组
         //这个时候会初始化result.length个关于内部函数的作用域链
      }
      var fn = outer();
      console.log(fn[0]());//result：2
      console.log(fn[1]());//result：2
```
在调用fn(i)时，result[i]函数的活动对象里并没有定义i这个变量，于是沿着作用域链去找i变量，结果在父函数outer的活动对象里找到变量i(值为2)，而这个变量i是父函数执行结束后将最终值保存在内存里的结果。
由此也可以得出，js函数内的变量值不是在编译的时候就确定的，而是等在运行时期再去寻找的。

那怎么才能让result数组函数返回我们所期望的值呢？result的活动对象里有一个arguments，arguments对象是一个参数的集合，是用来保存对象的。
那么我们就可以把i当成参数传进去，这样一调用函数生成的活动对象内的arguments就有当前i的副本。
改进之后：
```js
   function outer(){
         var result = new Array();
         for(var i = 0; i < 2; i++){
            //定义一个带参函数
            function arg(num){
               return num;
            }
            //把i当成参数传进去
            result[i] = arg(i);
         }
         return result;
      }
      var fn = outer();
      console.log(fn[0]);//result:0
      console.log(fn[1]);//result:1
```
虽然达到了期望的结果， 但是这并不算闭包，调用内部函数的时候，父函数的环境变量还没被销毁，而且result返回的也不是函数数组。
既然这样，可以再嵌套一个内部函数：
```js
function outer(){
         var result = new Array();
         for(var i = 0; i < 2; i++){
            //定义一个带参函数
            result[i] = function(num){
               function innerarg(){
                  return num;
               }
               return innerarg;
            }(i);//预先执行函数写法
            //把i当成参数传进去
         }
         return result;
      }
```
