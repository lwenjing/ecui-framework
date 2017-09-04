(function () {
    var oldDisposeFn = ecui.ui.InputControl.prototype.$dispose,
        oldReadyFn = ecui.ui.InputControl.prototype.$ready;

    function setData(name, value) {
        if (localStorage[name] !== value) {
            localStorage[name] = value;
        }
    }

    ecui.ui.InputControl.prototype.$dispose = function () {
        if (this.getName()) {
            var name = ecui.esr.getLocation() + '_debug_' + this.getName();

            if (this._eInput) {
                if (this instanceof ecui.ui.Radio) {
                    if (this.isChecked()) {
                        setData(name, this.getValue());
                    }
                } else if (this instanceof ecui.ui.Checkbox) {
                    setData(name, this.isChecked() ? '1' : '');
                } else {
                    setData(name, this.getValue());
                }
            }
        }
        oldDisposeFn.call(this);
    };

    ecui.ui.InputControl.prototype.$ready = function (options) {
        var name = ecui.esr.getLocation() + '_debug_' + this.getName();

        if (localStorage[name]) {
            if (this instanceof ecui.ui.Radio) {
                if (localStorage[name] === this.getValue()) {
                    this.setChecked(true);
                }
            } else if (this instanceof ecui.ui.Checkbox) {
                this.setChecked(!!localStorage[name]);
            } else {
                this.$setValue(localStorage[name]);
            }
        }
        oldReadyFn.call(this, options);
    };
}());

(function () {
    /**
     * 动态加载模块，用于测试。
     * @public
     *
     * @param {string} name 模块名
     */
    var moduleName,
        loc = location.href + '#',
        waits = [],
        oldRedirectFn = ecui.esr.redirect,
        oldLocation;

    loc = loc.slice(0, loc.indexOf('#'));

    if (loc.slice(0, 5) === 'file:') {
        ecui.io.ajax = function (url, options) {
            function doLoad() {
                var path = waits[0][0],
                    callback = waits[0][1];

                location.hash = '';
                if (path.slice(-5) !== '.html') {
                    path += '.html';
                }
                el.src = path + '?url=' + encodeURIComponent(loc);
                var stop = ecui.util.timer(function () {
                    if (location.hash && location.hash !== '#') {
                        stop();
                        callback(
                            decodeURIComponent(location.hash.slice(1)),
                            {
                                getResponseHeader: function () {
                                    return new Date(1970, 0, 1).toString();
                                }
                            }
                        );
                        waits.splice(0, 1);
                        if (waits.length) {
                            doLoad();
                        } else {
                            location.hash = oldLocation;
                            ecui.esr.redirect = oldRedirectFn;
                            ecui.resume();
                        }
                    }
                }, -100);
            }

            var el = ecui.$('LESS-FILE-PROTOCOL'),
                callback = options.onsuccess;

            ecui.dom.ready(function () {
                if (!el) {
                    el = document.createElement('IFRAME');
                    el.id = 'LESS-FILE-PROTOCOL';
                    el.style.cssText = 'position:absolute;width:1px;height:1px;left:-10px;top:-10px';
                    document.body.appendChild(el);
                }
                if (url.slice(0, 5) === 'file:') {
                    url = url.slice(loc.lastIndexOf('/') + 1);
                } else if (url.charAt(0) === '/') {
                    url = url.slice(1);
                }
                waits.push([url, callback]);
                if (waits.length === 1) {
                    ecui.pause();
                    oldLocation = location.hash;
                    ecui.esr.redirect = ecui.util.blank;
                    doLoad();
                }
            });
        };
    }

    ecui.esr.loadModule = function (name) {
        document.write('<script type="text/javascript">ecui.esr.setModuleName("' + name + '")</script>');
        document.write('<script type="text/javascript" src="' + name + '/' + name + '.js"></script>');
    };

    ecui.esr.setModuleName = function (name) {
        moduleName = name;
    };
    ecui.esr.loadClass = function (filename) {
        document.write('<script type="text/javascript" src="' + moduleName + '/class.' + filename + '.js"></script>');
    };
    ecui.esr.loadRoute = function (filename) {
        document.write('<script type="text/javascript" src="' + moduleName + '/route.' + filename + '.js"></script>');
        document.write('<link rel="stylesheet/less" type="text/css" href="' + moduleName + '/route.' + filename + '.css" />');
        ecui.pause();
        ecui.io.ajax(moduleName + '/route.' + filename + '.html', {
            onsuccess: function (data) {
                etpl.compile(data);
                ecui.resume();
            }
        });
    };
}());