(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ext = core.ext,
        io = core.io,
        ui = core.ui,
        util = core.util,

        JAVASCRIPT = 'javascript',

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;
//{/if}//
    var routes = {},
        autoRender = {},
        renderList = [],
        context = {},
        currLocation = '',
        checkLeave = true,
        pauseStatus,
        timer = util.blank,
        cssload = {};

    /**
     * 增加IE的history信息。
     * @private
     *
     * @param {string} loc 当前地址
     * @return 如果增加了history信息返回true，否则不返回
     */
    function addIEHistory(loc) {
        if (ieVersion < 8) {
            var iframeDoc = document.getElementById('ECUI_LOCATOR').contentWindow.document;
            iframeDoc.open('text/html');
            iframeDoc.write(
                '<html><body><script type="text/javascript">' +
                    'var loc="' + loc.replace(/\\/g, '\\\\').replace(/\"/g, '\\\"') + '";' +
                    'parent.ecui.esr.setLocation(loc);' +
                    'parent.ecui.esr.callRoute(loc);' +
                    '</script></body></html>'
            );
            iframeDoc.close();
            return true;
        }
    }

    /**
     * 自动加载子路由。
     * @private
     *
     * @param {Object} route 路由对象
     */
    function autoChildRoute(route) {
        if (route.children) {
            var children = 'string' === typeof route.children ? [route.children] : route.children;
            children.forEach(function (item) {
                esr.callRoute(replace(item), true);
            });
        }
    }

    /**
     * 数据刷新定时器。
     * @private
     */
    function renderTimer() {
        renderList.forEach(function (name) {
            autoRender[name].forEach(function (item) {
                item[1].call(item[0], context[name]);
            });
        });
        renderList = [];
    }

    /**
     * 调用指定的路由。
     * @private
     *
     * @param {string} name 路由名称
     * @param {Object} options 参数
     */
    function callRoute(name, options) {

        function checkURLChange() {
            var loc = esr.getLocation();
            if (currLocation !== loc) {
                currLocation = loc;
                pauseStatus = false;
                item();
            }
        }

        // 供onready时使用，此时name为route
        var route = options ? routes[name] : name;

        if (route) {
            if (!route.onrender || route.onrender() !== false) {
                if (checkLeave) {
                    // 检查是否允许切换到新路由
                    for (var i = 0, items = getRouteMains(route), item; item = items[i++]; ) {
                        if (item.route.onleave && item.route.onleave() === false) {
                            if (options !== true) {
                                // 如果不是子路由，需要回退一步，回滚currLocation的设置防止再次跳转
                                history.go(-1);
                                pauseStatus = true;
                                item = util.timer(checkURLChange, -100);
                                return;
                            }
                        }
                    }
                } else {
                    checkLeave = true;
                }

                if (options !== true) {
                    context = {};
                }

                for (var key in options) {
                    if (options.hasOwnProperty(key)) {
                        context[key] = options[key];
                    }
                }

                if (!route.model) {
                    esr.render(name, route);
                } else if ('function' === typeof route.model) {
                    if (route.model(context, function () {
                            esr.render(name, route);
                        }) !== false) {
                        esr.render(name, route);
                    }
                } else {
                    esr.request.call(route, route.model, function () {
                        esr.render(name, route);
                    }, route.onrequesterror);
                }
            }
        } else {
            pauseStatus = true;
            var moduleName = name.split('.')[0];
            io.loadScript(
                moduleName + '/' + moduleName + '.js',
                function () {
                    pauseStatus = false;
                    callRoute(name, options);
                },
                {
                    onerror: function () {
                        // 其他浏览器失败
                        pauseStatus = false;
                    }
                }
            );
        }
    }

    /**
     * 获取所有被路由绑定的 DOM 元素。
     * @private
     *
     * @param {Object} route 路由对象
     */
    function getRouteMains(route) {
        var el = document.getElementById(route.main || esr.DEFAULT_MAIN);

        if (el) {
            var items = el.route ? [el] : [];

            Array.prototype.forEach.call(el.all || el.getElementsByTagName('*'), function (item) {
                if (item.route) {
                    items.push(item);
                }
            });

            return items;
        }

        return [];
    }

    /**
     * 事件监听处理函数。
     * @private
     */
    function listener() {
        esr.redirect(esr.getLocation());
    }

    /**
     * 初始化。
     * @private
     */
    function init() {
        if (ieVersion < 8) {
            var iframe = document.createElement('iframe');

            iframe.id = 'ECUI_LOCATOR';
            iframe.src = 'about:blank';

            document.body.appendChild(iframe);
            setInterval(listener, 100);
        } else if (window.onhashchange === null) {
            window.onhashchange = listener;
            listener();
        } else {
            setInterval(listener, 100);
        }
    }

    /**
     * 解析地址。
     * @private
     *
     * @param {string} loc 地址
     * @return {Object} 地址信息，其中''的值表示路由名称
     */
    function parseLocation(loc) {
        var list = loc.split('~'),
            options = {'': list[0]};

        list.forEach(function (item, index) {
            if (index && item) {
                var data = item.split('=');
                if (data.length === 1) {
                    options[data[0]] = true;
                } else {
                    options[data[0]] = data[1] ? decodeURIComponent(data[1]) : '';
                }
            }
        });

        return options;
    }

    /**
     * 渲染。
     * @private
     *
     * @param {string} name 路由名称
     * @param {Object} route 路由对象
     */
    function render(name, route) {
        if (route.onbeforerender) {
            route.onbeforerender(context);
        }

        var el = document.getElementById(route.main || esr.DEFAULT_MAIN);
        el.style.visibility = 'hidden';

        for (var i = 0, items = getRouteMains(route), item; item = items[i++]; ) {
            if (item.route.ondispose) {
                item.route.ondispose();
            }
        }

        core.dispose(el);
        el.innerHTML = etpl.render(route.view || name, context);
        core.init(el);

        el.style.visibility = '';
        el.route = route;

        if (route.onafterrender) {
            route.onafterrender(context);
        }

        if (name === route) {
            init();
        } else {
            autoChildRoute(route);
        }
    }

    /**
     * 替换数据。
     * @private
     *
     * @param {string} rule 替换规则
     */
    function replace(rule) {
        if (rule) {
            var data;

            rule = rule.replace(/\$\{([^}]+)\}/g, function (match, name) {
                name = name.split('|');
                var value = util.parseValue(name[0], context);
                value = value === undefined ? (name[1] || '') : value;
                if (match === rule) {
                    data = value;
                    return '';
                }
                return value;
            });

            return data || rule;
        }
        return '';
    }

    var esr = core.esr = {
        DEFAULT_PAGE: 'index',
        DEFAULT_MAIN: 'main',

        // 用于创建空对象，参见request方法
        CreateObject: core.inherits(
            ui.Control,
            function (el, options) {
                ui.Control.call(this, el, options);
                dom.addClass(el, 'ui-hide');
            },
            {
                getValue: function () {
                    return {};
                }
            }
        ),

        /**
         * 添加路由信息。
         * @public
         *
         * @param {string} name 路由名称
         * @param {Object} route 路由对象
         */
        addRoute: function (name, route) {
            routes[name] = route;
        },

        /**
         * 调用路由处理。
         * @public
         *
         * @param {string} loc 地址
         * @param {boolean} childRoute 是否为子路由，默认不是
         */
        callRoute: function (loc, childRoute) {
            loc = parseLocation(loc);
            callRoute(loc[''], childRoute ? true : loc);
        },

        /**
         * 改变地址，常用于局部刷新。
         * @public
         *
         * @param {string} name 路由名
         * @param {Object} options 需要改变的参数
         * @param {boolean} rewrite 是否回写原来的参数
         */
        change: function (name, options, rewrite) {
            options = options || {};

            var oldOptions = parseLocation(currLocation);
            if (rewrite) {
                rewrite = options[''] || oldOptions[''];
                for (var key in options) {
                    if (options.hasOwnProperty(key)) {
                        if (options[key] === null) {
                            delete oldOptions[key];
                        } else {
                            oldOptions[key] = options[key];
                        }
                    }
                }
            } else {
                rewrite = options[''] || oldOptions[''];
                oldOptions = options;
            }
            var list = [];
            delete oldOptions[''];
            for (key in oldOptions) {
                if (oldOptions.hasOwnProperty(key)) {
                    list.push(key + '=' + encodeURIComponent(oldOptions[key]));
                }
            }
            list.sort().splice(0, 0, rewrite);
            esr.setLocation(list.join('~'));

            if (name) {
                if (!addIEHistory(currLocation)) {
                    callRoute(name, oldOptions);
                }
            }
        },

        /**
         * 获取数据。
         * @public
         *
         * @param {string} name 数据名
         * @return {Object} 数据值
         */
        getData: function (name) {
            return context[name];
        },

        /**
         * 获取当前地址。
         * @public
         *
         * @return {string} 当前地址
         */
        getLocation: function () {
            var hash;

            // firefox下location.hash会自动decode
            // 体现在：
            //   视觉上相当于decodeURI，
            //   但是读取location.hash的值相当于decodeURIComponent
            // 所以需要从location.href里取出hash值
            if (firefoxVersion) {
                if (hash = location.href.match(/#(.*)$/)) {
                    return hash[1];
                }
            } else if (hash = location.hash) {
                return hash.replace(/^#/, '');
            }
            return '';
        },

        /**
         * 获取路由信息。
         * @public
         *
         * @param {string} name 路由名
         * @return {Object} 路由信息
         */
        getRoute: function (name) {
            return routes[name];
        },

        /**
         * 用于 onleave 中需要前往的地址设置。
         * @public
         *
         * @param {string} loc 前往的地址，如果省略前往之前被阻止的地址
         */
        go: function (loc) {
            checkLeave = false;
            if (loc) {
                esr.redirect(loc);
            } else {
                history.go(1);
            }
        },

        /**
         * 控制定位器转向。
         * @public
         *
         * @param {string} loc location位置
         */
        redirect: function (loc) {
            if (pauseStatus) {
                if (!window.onhashchange) {
                    setTimeout(listener, 100);
                }
            } else {
                // 增加location带起始#号的容错性
                // 可能有人直接读取location.hash，经过string处理后直接传入
                if (loc) {
                    loc = loc.replace(/^#/, '');
                }

                if (!loc) {
                    loc = esr.DEFAULT_PAGE;
                }

                // 与当前location相同时不进行route
                if (currLocation !== loc) {
                    esr.setLocation(loc);
                    // ie下使用中间iframe作为中转控制
                    // 其他浏览器直接调用控制器方法
                    if (!addIEHistory(loc)) {
                        esr.callRoute(loc);
                    }

                    if (esr.onhashchange) {
                        esr.onhashchange();
                    }
                }
            }
        },

        /**
         * 渲染。
         * @public
         *
         * @param {string} name 路由名
         * @param {Object} route 路由对象
         */
        render: function (name, route) {
            function loadTPL() {
                io.ajax(moduleName + '/' + moduleName + '.html', {
                    onsuccess: function (data) {
                        pauseStatus = false;
                        etpl.compile(data);
                        render(name, route);
                    },
                    onerror: function () {
                        pauseStatus = false;
                    }
                });
            }

            if ('function' === typeof route.view) {
                if (route.onbeforerender) {
                    route.onbeforerender(context);
                }
                route.view(context);
                if (route.onafterrender) {
                    route.onafterrender(context);
                }
                autoChildRoute(route);
            } else if (etpl.getRenderer(route.view || name)) {
                render(name, route);
            } else {
                pauseStatus = true;
                var moduleName = name.split('.')[0];
                if (cssload[moduleName]) {
                    loadTPL();
                } else {
                    io.ajax(moduleName + '/' + moduleName + '.css', {
                        onsuccess: function (data) {
                            dom.createStyleSheet(data);
                            cssload[moduleName] = true;
                            loadTPL();
                        },
                        onerror: function () {
                            pauseStatus = false;
                        }
                    });
                }
            }
        },

        /**
         * 设置数据。
         * @public
         *
         * @param {string} name 数据名
         * @param {Object} value 数据值
         */
        setData: function (name, value) {
            context[name] = value;
            if (autoRender[name]) {
                timer();
                timer = util.timer(renderTimer, 0);
                renderList.push(name);
            }
        },

        /**
         * 设置hash，不会进行真正的跳转。
         * @public
         *
         * @param {string} loc hash名
         */
        setLocation: function (loc) {
            if (loc) {
                loc = loc.replace(/^#/, '');
            }

            // 存储当前信息
            // opera下，相同的hash重复写入会在历史堆栈中重复记录
            // 所以需要ESR_GET_LOCATION来判断
            if (esr.getLocation() !== loc) {
                location.hash = loc;
            }
            currLocation = loc;
        },

        /**
         * 加载ESR框架。
         * @public
         */
        load: function () {
            for (var i = 0, links = document.getElementsByTagName('A'), el; el = links[i++]; i++) {
                if (el.href.slice(-1) === '#') {
                    el.href = JAVASCRIPT + ':void(0)';
                }
            }

            dom.ready(function () {
                if (esr.onready) {
                    callRoute(esr.onready());
                } else {
                    init();
                }
            });
        },

        /**
         * 请求数据。
         * @public
         *
         * @param {Array} urls url列表，支持name@url的写法，表示结果数据写入name的变量中
         * @param {Function} onsuccess 全部请求成功时调用的函数
         * @param {Function} onerror 至少一个请求失败时调用的函数，会传入一个参数Array说明是哪些url失败
         */
        request: function (urls, onsuccess, onerror) {
            if ('string' === typeof urls) {
                urls = [urls];
            }

            var err = [],
                count = urls.length;

            onsuccess = onsuccess || util.blank;
            onerror = onerror || esr.onrequesterror || util.blank;

            function request(varUrl, varName) {
                // 对于FORM表单的对象列表提交，可以通过产生一个特殊的ECUI控件来完成，例如：
                // <form>
                //   <input ui="ecui.esr.CreateObject" name="a">
                //   <input name="a.b">
                //   <input ui="ecui.esr.CreateObject" name="a">
                //   <input name="a.b">
                // </form>
                function setData(name, value) {
                    for (var i = 0, scope = data, list = name.split('.'); i < list.length - 1; i++) {
                        scope = scope[list[i]] = scope[list[i]] || {};
                        if (scope instanceof Array) {
                            scope = scope[scope.length - 1];
                        }
                    }
                    if (scope.hasOwnProperty(list[i])) {
                        if (!(scope[list[i]] instanceof Array)) {
                            scope[list[i]] = [scope[list[i]]];
                        }
                        scope[list[i]].push(value);
                    } else {
                        scope[list[i]] = value;
                    }
                }

                var method = varUrl.split(' ');

                if (method[0] === 'JSON' || method[0] === 'FORM') {
                    var headers = {
                            'Content-Type': 'application/json;charset=UTF-8'
                        },
                        url = method[1].split('?'),
                        data = {},
                        valid = true;
                    url[1].split('&').forEach(function (item) {
                        item = item.split('=');
                        if (item.length > 1) {
                            setData(item[0], replace(item[1]));
                        } else if (method[0] === 'FORM') {
                            Array.prototype.slice.call(document.forms[item[0]].elements).forEach(function (item) {
                                if (item.name && ((item.type !== 'radio' && item.type !== 'checkbox') || item.checked)) {
                                    if (item.getControl) {
                                        if (!core.triggerEvent(item.getControl(), 'submit', core.createEvent('submit'))) {
                                            valid = false;
                                        }
                                    }
                                    setData(item.name, item.getControl ? item.getControl().getValue() : item.value);
                                }
                            });

                            if (!valid) {
                                if (count === 1) {
                                    onerror();
                                } else {
                                    count--;
                                    err.push({url: varUrl, name: varName});
                                }
                                return;
                            }
                        } else {
                            item = replace(item[1]);
                            if ('object' === typeof item) {
                                util.extend(data, item);
                            }
                        }
                    });
                    method = 'POST';
                    url = url[0];
                    data = JSON.stringify(data);
                } else if (method[0] === 'POST') {
                    url = method[1].split('?');
                    method = 'POST';
                    data = replace(url[1]);
                    url = url[0];
                } else {
                    url = replace(method[method.length === 1 ? 0 : 1]);
                    method = 'GET';
                }

                io.ajax(replace(url), {
                    method: method,
                    headers: headers,
                    data: data,
                    onsuccess: function (data) {
                        count--;
                        try {
                            data = JSON.parse(data);

                            if (esr.onparsedata) {
                                data = esr.onparsedata(url, data);
                            }

                            if ('number' === typeof data) {
                                err.push({code: data, url: varUrl, name: varName});
                            } else {
                                if (varName) {
                                    esr.setData(varName, data);
                                } else {
                                    for (var key in data) {
                                        if (data.hasOwnProperty(key)) {
                                            esr.setData(key, data[key]);
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            err.push({url: varUrl, name: varName});
                        }

                        if (!count) {
                            pauseStatus = false;
                            if (err.length > 0) {
                                if (onerror(err, onsuccess, onerror) === false) {
                                    return;
                                }
                            }
                            onsuccess();
                        }
                    },
                    onerror: function () {
                        count--;
                        err.push({url: varUrl, name: varName});
                        if (!count) {
                            pauseStatus = false;
                            if (onerror(err, onsuccess, onerror) === false) {
                                return;
                            }
                            onsuccess();
                        }
                    }
                });
            }

            pauseStatus = true;
            if (this.onbeforerequest) {
                this.onbeforerequest(context);
            }
            urls.forEach(function (item) {
                var url = item.split('@');
                if (url[1]) {
                    request(url[1], url[0]);
                } else {
                    request(url[0]);
                }
            });
            if (this.onafterrequest) {
                this.onafterrequest(context);
            }
        }
    };

    /**
     * esr数据名跟踪插件加载。
     * @public
     *
     * @param {ecui.ui.Control} control 需要应用插件的控件
     * @param {string} value 插件的参数
     */
    ext.esr = function (control, value) {
        if (value = /^(\w+)(\*?@)(#\w*|[\w\.]*\(\))$/.exec(value)) {
            if (value[3].charAt(0) !== '#') {
                if (value[3].length === 2) {
                    var setData = control.getContent().trim(),
                        renderer = new Function('$', setData.charAt(0) === '=' ? 'this.setContent(' + setData.slice(1) + ')' : setData);
                } else {
                    renderer = util.parseValue(value[3].slice(0, -2));
                }
                setData = function (data) {
                    renderer.call(this, value[2].length > 1 ? context : data);
                };
            } else {
                renderer = value[3].length < 2 ? etpl.compile(control.getContent().replace(/\$([\w.]+)/g, '${$1}')) : etpl.getRenderer(value[3].slice(1));
                setData = function (data) {
                    core.dispose(this.getBody(), true);
                    this.setContent(renderer(value[2].length > 1 ? context : data));
                    core.init(this.getBody());
                };
            }

            if (autoRender[value[1]]) {
                autoRender[value[1]].push([control, setData]);
            } else {
                autoRender[value[1]] = [[control, setData]];
            }

            core.addEventListener(control, 'dispose', function () {
                for (var i = 0, item; item = autoRender[value[1]][i]; i++) {
                    if (item[0] === this) {
                        autoRender[value[1]].splice(i, 1);
                        break;
                    }
                }
            });

            if (context[value[1]] !== undefined) {
                setData.call(control, context[value[1]]);
            } else {
                control.setContent('');
            }
        }
    };
}());
