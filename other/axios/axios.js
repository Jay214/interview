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