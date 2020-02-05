let Vue = {};
Vue.prototype.$on = function(event, fn) {
    let vm = this;
    if (typeof fn !== 'function') {
        console.warn('Please add a callback in "$on", or makes no meanning.');
        return;
    }
    if (event instanceof Array) {
        for (let i = 0, len = event.length; i < len; i++) {
            vm.$on(event[i], fn);
        }
        return vm;
    }
    
    (vm.events[event] || (vm.events[event] = [])).push(fn);
    return vm;
}

Vue.prototype.$once = function(event, fn) {
    let vm = this;
    function once() {
        vm.$off(event, once);
        fn.apply(vm, arguments);
    }
    vm.$on(event, once);
    return vm;
}

Vue.prototype.$emit = function(event) {
    let vm = this;
    if (!this.events[event]) {
        return;
    }
    const cbs = this.events[event];
    let args = Array.prototype.slice.apply(arguments, 1);
    for (let i = 0, len = cbs; i < len; i++) {
        args ? cbs[i].apply(vm, args) : cbs[i].call(vm);
        cbs[i](args);
    }
    return this;

}

Vue.prototype.$off = function(event, fn) {
    if (!event) {
        this.events = null;
        return this;
    }
    if (event instanceof Array) {
        for (let i = 0, len = event.length; i < len; i++) {
            this.$off(event[i], fn);
        }
        return this;
    }
    if (this.events[event]) {
        let _event = this.events[event];
        if (!fn) {
            _event.length = 0;
        } else {
            const index = _event.findIndex(f => f === fn);
            index > -1 ? _event.splice(index, 1) : 
            console.warn(`Could not find the callback to remove in event "${event}",please check you have write correctly.`);
        }
    } else {
        console.warn('Could not find the event to remove, please check if you have $on any events.');
    }

    return this;

}