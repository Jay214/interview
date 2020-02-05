# 事件循环

### Libuv

c语言实现的异步事件库，提供了跨平台（如windows, linux）的API。

### node单线程

指node中只有一个js引擎在主线程上运行，其他异步IO和事件驱动线程通过libuv来实现内部的线程池和线程调度。
libuv中存在了一个Event Loop(事件循环)，通过Event Loop来切换实现类似于多线程的效果。简单的来讲Event Loop就是维持一个执行栈和一个事件队列，当前执行栈中的如果发现异步IO以及定时器等函数，就会把这些异步回调函数放入到事件队列中。当前执行栈执行完成后，从事件队列中，按照一定的顺序执行事件队列中的异步回调函数。

此外回调函数执行时，同样会生成一个执行栈，在回调函数里面还有可能嵌套异步的函数，也就是说执行栈存在着嵌套。

通过libv的Event Loop实现了类似于多线程的上下文切换以及线程池调度。线程是最小的进程，因此node也是单进程的。
node的单线程减小了线程间切换的开销，以及在写node代码的时候不用考虑锁以及线程池的问题。同时，node单进程也存在无法充分利用cpu等资源，因此，node提供了child_process模块来实现子进程，过child_process模块，可以实现1个主进程，多个子进程的模式，主进程称为master进程，子进程又称工作进程。在子进程中不仅可以调用其他node程序，也可以执行非node程序以及shell命令等等，执行完子进程后，以流或者回调的形式返回。

### child_process

child_process提供了4个方法，用于新建子进程，这4个方法分别为spawn、execFile、exec和fork。所有的方法都是异步的，可以用一张图来描述这4个方法的区别。

![](./child_process.png)

### cluster

cluster 的功能是生成与当前进程相同的子进程,并且允许父进程和子进程之间共享端口，cluster意为集成，集成了两个方面，第一个方面就是集成了child_process.fork方法创建node子进程的方式，第二个方面就是集成了根据多核CPU创建子进程后，自动控制负载均衡的方式。
官网例子：
```js
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`主进程 ${process.pid} 正在运行`);

  // 衍生工作进程。
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
  });
} else {
  // 工作进程可以共享任何 TCP 连接。
  // 在本例子中，共享的是一个 HTTP 服务器。
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end('你好世界\n');
  }).listen(8000);

  console.log(`工作进程 ${process.pid} 已启动`);
}
```
输出结果：
```js
主进程 3596 正在运行
工作进程 4324 已启动
工作进程 4520 已启动
工作进程 6056 已启动
工作进程 5644 已启动
```

相关文章：
https://mp.weixin.qq.com/s/nyD3gC0JWqOR6bAfHeiRww


