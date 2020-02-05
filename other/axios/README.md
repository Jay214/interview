# axois相关

### 为什么 axios 既可以当函数调用，也可以当对象使用，比如axios({})、axios.get

axios应用工厂模式提供axios.create可以创建实例，提供了一个类Axios并将request、get、post等方法挂载到prototype上，将Axios.prototype上的方法也赋给axios实例，最后将Axios挂载到实例上返回实例，所以axios暴露出来的是一个实例对象，同时这个实例对象上也挂载了原生的Axios类和create方法。
见部分源码：
```js
'use strict';

var utils = require('./utils');
var bind = require('./helpers/bind');
var Axios = require('./core/Axios');
var mergeConfig = require('./core/mergeConfig');
var defaults = require('./defaults');
/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */

 function createInstance(defaultConfig) {
     var context = new Axios(defaultConfig);
     // 类似bind
     var instance = bind(Axios.prototype.request, context);

     // 类似Object.assign()  Copy axios.prototype to instance
     utils.extend(instance, Axios.prototype, context);

     // Copy context to instance
    utils.extend(instance, context);

    return instance;
 }

 // Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
    return createInstance(mergeConfig(axios.defaults, instanceConfig));
 };

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;
```
### axios的调用流程

用 axios 函数实际上是调用 Axios.prototype.request 函数, 然后有请求拦截器的情况下执行请求拦截器，中间会执行 创建请求对象XMLHttpRequest发起请求，对请求参数做处理，设置onreadystatechange，onabort，ontimeout，onerror等回调，再是包装返回结果，然后有响应拦截器的情况下执行响应拦截器，整个过程都是以promise运行，组成promise链式调用。
主要源码：
```js
/**
 * Axios.js
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};
```
```js
/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * dispatchRequest.js
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
  ```
dispatchRequest调用了一个适配器adapter，用来根据不用环境（浏览器和node）分别创建XMLHttpRequest或http发起请求。在dispatchRequest里还设置关于取消请求的处理，axios的CancelToken是基于promise的撤销的，在请求发送前，发送中，发送后返回结果未处理时都会调用throwIfCancellationRequested来阻止和中断请求，抛出错误或者返回promise.reject，如果请求已发送未完成则会调用request.abort(),即调用请求对象XMLHttpRequest或http自身中断方法。
```js
function getDefaultAdapter() {
  var adapter;

  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');

  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  }
  return adapter;
}
var defaults = {
  adapter: getDefaultAdapter(),
  // ...
};
```
adapter适配器里判断当前环境调用不同请求对象，判断方法如上源码。