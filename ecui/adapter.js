//{if 0}//
var ecui;
(function () {
//{/if}//
    var //{if 1}//undefined,//{/if}//
        JAVASCRIPT = 'javascript',

        isStrict = document.compatMode === 'CSS1Compat',
        isWebkit = /webkit/i.test(navigator.userAgent),
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,
        firefoxVersion = /firefox\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined,
        operaVersion = /opera\/(\d+\.\d)/i.test(navigator.userAgent) ? +RegExp.$1 : undefined;

    ecui = {
        dom: {
            /**
             * 为 Element 对象添加新的样式。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} className 样式名，可以是多个，中间使用空白符分隔
             */
            addClass: function (el, className) {
                // 这里直接添加是为了提高效率，因此对于可能重复添加的属性，请使用标志位判断是否已经存在，
                // 或者先使用 removeClass 方法删除之前的样式
                el.className += ' ' + className;
            },

            /**
             * 挂载事件。
             * @public
             *
             * @param {Object} obj 响应事件的对象
             * @param {string} type 事件类型
             * @param {Function} func 事件处理函数
             */
            addEventListener: ieVersion < 9 ? function (obj, type, func) {
                obj.attachEvent('on' + type, func);
            } : function (obj, type, func) {
                obj.addEventListener(type, func, true);
            },

            /**
             * 将指定的 Element 对象的内容移动到目标 Element 对象中。
             * @public
             *
             * @param {HTMLElement} el 指定的 Element 对象
             * @param {HTMLElement} target 目标 Element 对象
             * @param {boolean} all 是否移动所有的 DOM 对象，默认仅移动 ElementNode 类型的对象
             */
            childMoves: function (el, target, all) {
                for (el = el.firstChild; el; el = next) {
                    var next = el.nextSibling;
                    if (all || el.nodeType === 1) {
                        target.appendChild(el);
                    }
                }
            },

            /**
             * 获取所有 parentNode 为指定 Element 的子 Element 集合。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {Array} Element 对象数组
             */
            children: function (el) {
                var result = [];
                for (el = el.firstChild; el; el = el.nextSibling) {
                    if (el.nodeType === 1) {
                        result.push(el);
                    }
                }
                return result;
            },

            /**
             * 判断一个 Element 对象是否包含另一个 Element 对象。
             * contain 方法认为两个相同的 Element 对象相互包含。
             * @public
             *
             * @param {HTMLElement} container 包含的 Element 对象
             * @param {HTMLElement} contained 被包含的 Element 对象
             * @return {boolean} contained 对象是否被包含于 container 对象的 DOM 节点上
             */
            contain: firefoxVersion ? function (container, contained) {
                return container === contained || !!(container.compareDocumentPosition(contained) & 16);
            } : function (container, contained) {
                return container.contains(contained);
            },

            /**
             * 创建 Element 对象。
             * @public
             *
             * @param {string} className 样式名称
             * @param {string} tagName 标签名称，默认创建一个空的 div 对象
             * @return {HTMLElement} 创建的 Element 对象
             */
            create: function (className, tagName) {
                tagName = document.createElement(tagName || 'DIV');
                if (className) {
                    tagName.className = className;
                }
                return tagName;
            },

            /**
             * 创建 Css 对象。
             * @public
             *
             * @param {string} cssText css文本
             */
            createStyleSheet: function (cssText) {
                if (ieVersion) {
                    var style = window.style;
                    window.style = cssText;
                    document.createStyleSheet(JAVASCRIPT + ':style');
                    window.style = style;
                } else {
                    style = document.createElement('STYLE');
                    style.type = 'text/css';
                    style.innerHTML = cssText;
                    document.head.appendChild(style);
                }
            },

            /**
             * 获取 Element 对象的第一个子 Element 对象。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 子 Element 对象
             */
            first: function (el) {
                for (el = el.firstChild; el; el = el.nextSibling) {
                    if (el.nodeType === 1) {
                        return el;
                    }
                }
            },

            /**
             * 获取 Element 对象的属性值。
             * 在 IE 下，Element 对象的属性可以通过名称直接访问，效率是 getAttribute 方式的两倍。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} name 属性名称
             * @return {string} 属性值
             */
            getAttribute: ieVersion < 8 ? function (el, name) {
                return el[name];
            } : function (el, name) {
                return el.getAttribute(name);
            },

            /**
             * 获取 Element 对象的父 Element 对象。
             * 在 IE 下，Element 对象被 removeChild 方法移除时，parentNode 仍然指向原来的父 Element 对象，与 W3C 标准兼容的属性应该是 parentElement。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 父 Element 对象，如果没有，返回 null
             */
            getParent: ieVersion ? function (el) {
                return el.parentElement;
            } : function (el) {
                return el.parentNode;
            },

            /**
             * 获取 Element 对象的页面位置。
             * getPosition 方法将返回指定 Element 对象的位置信息。属性如下：
             * left {number} X轴坐标
             * top  {number} Y轴坐标
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {Object} 位置信息
             */
            getPosition: function (el) {
                var top = 0,
                    left = 0,
                    body = document.body,
                    html = dom.getParent(body);

                if (ieVersion) {
                    if (!isStrict) {
                        // 在怪异模式下，IE 将 body 的边框也算在了偏移值中，需要先纠正
                        style = dom.getStyle(body);
                        if (isNaN(top = util.toNumber(style.borderTopWidth))) {
                            top = -2;
                        }
                        if (isNaN(left = util.toNumber(style.borderLeftWidth))) {
                            left = -2;
                        }
                    }

                    style = el.getBoundingClientRect();
                    top += html.scrollTop + body.scrollTop - html.clientTop + Math.floor(style.top);
                    left += html.scrollLeft + body.scrollLeft - html.clientLeft + Math.floor(style.left);
                } else if (el === body) {
                    top = html.scrollTop + body.scrollTop;
                    left = html.scrollLeft + body.scrollLeft;
                } else if (el !== html) {
                    for (var parent = el, childStyle = dom.getStyle(el); parent; parent = parent.offsetParent) {
                        top += parent.offsetTop;
                        left += parent.offsetLeft;
                        // safari里面，如果遍历到了一个fixed的元素，后面的offset都不准了
                        if (isWebkit && dom.getStyle(parent, 'position') === 'fixed') {
                            left += body.scrollLeft;
                            top += body.scrollTop;
                            break;
                        }
                    }

                    if (operaVersion || (isWebkit && dom.getStyle(el, 'position') === 'absolute')) {
                        top -= body.offsetTop;
                    }

                    for (parent = dom.getParent(el); parent !== body; parent = dom.getParent(parent)) {
                        left -= parent.scrollLeft;
                        if (!operaVersion) {
                            var style = dom.getStyle(parent);
                            // 以下解决firefox下特殊的布局引发的双倍border边距偏移的问题，使用 html 作为临时变量
                            html = firefoxVersion && style.overflow !== 'visible' && childStyle.position === 'absolute' ? 2 : 1;
                            top += util.toNumber(style.borderTopWidth) * html - parent.scrollTop;
                            left += util.toNumber(style.borderLeftWidth) * html;
                            childStyle = style;
                        } else if (parent.tagName !== 'TR') {
                            top -= parent.scrollTop;
                        }
                    }
                }

                return {top: top, left: left};
            },

            /**
             * 获取 Element 对象的 CssStyle 对象或者是指定的样式值。
             * getStyle 方法如果不指定样式名称，将返回 Element 对象的当前 CssStyle 对象。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} name 样式名称
             * @return {CssStyle|Object} CssStyle 对象或样式值
             */
            getStyle: function (el, name) {
                var fixer = __ECUI__StyleFixer[name],
                    style = el.currentStyle || (ieVersion ? el.style : getComputedStyle(el, null));

                return name ? fixer && fixer.get ? fixer.get(el, style) : style[fixer || name] : style;
            },

            /**
             * 获取 Element 对象的文本。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {string} Element 对象的文本
             */
            getText: ieVersion < 9 ? function (el) {
                return el.innerText;
            } : function (el) {
                return el.textContent;
            },

            /**
             * 判断指定的样式是否包含在 Element 对象中。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} className 样式名称
             * @return {boolean} true，样式包含在 Element 对象中
             */
            hasClass: function (el, className) {
                return el.className.split(/\s+/).indexOf(className) >= 0;
            },

            /**
             * 将 Element 对象插入指定的 Element 对象之后。
             * 如果指定的 Element 对象没有父 Element 对象，相当于 remove 操作。
             * @public
             *
             * @param {HTMLElement} el 被插入的 Element 对象
             * @param {HTMLElement} target 目标 Element 对象
             * @return {HTMLElement} 被插入的 Element 对象
             */
            insertAfter: function (el, target) {
                var parent = dom.getParent(target);
                return parent ? parent.insertBefore(el, target.nextSibling) : dom.remove(el);
            },

            /**
             * 将 Element 对象插入指定的 Element 对象之前。
             * 如果指定的 Element 对象没有父 Element 对象，相当于 remove 操作。
             * @public
             *
             * @param {HTMLElement} el 被插入的 Element 对象
             * @param {HTMLElement} target 目标 Element 对象
             * @return {HTMLElement} 被插入的 Element 对象
             */
            insertBefore: function (el, target) {
                var parent = dom.getParent(target);
                return parent ? parent.insertBefore(el, target) : dom.remove(el);
            },

            /**
             * 向指定的 Element 对象内插入一段 html 代码。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} position 插入 html 的位置信息，取值为 beforeBegin,afterBegin,beforeEnd,afterEnd
             * @param {string} html 要插入的 html 代码
             */
            insertHTML: firefoxVersion ? function (el, position, html) {
                var name = __ECUI__HTMLPosition[position.toUpperCase()],
                    range = document.createRange();

                range[name](el);
                range.collapse(position.length > 9);
                range.insertNode(range.createContextualFragment(html));
            } : function (el, position, html) {
                el.insertAdjacentHTML(position, html);
            },

            /**
             * 获取 Element 对象的最后一个子 Element 对象。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 子 Element 对象
             */
            last: function (el) {
                for (el = el.lastChild; el; el = el.previousSibling) {
                    if (el.nodeType === 1) {
                        return el;
                    }
                }
            },

            /**
             * 获取Element 对象的下一个兄弟节点。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 下一个兄弟 Element 对象
             */
            next: function (el) {
                for (el = el.nextSibling; el; el = el.nextSibling) {
                    if (el.nodeType === 1) {
                        return el;
                    }
                }
            },

            /**
             * 获取Element 对象的上一个兄弟节点。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 上一个兄弟 Element 对象
             */
            previous: function (el) {
                for (el = el.previousSibling; el; el = el.previousSibling) {
                    if (el.nodeType === 1) {
                        return el;
                    }
                }
            },

            /**
             * 从页面中移除 Element 对象。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @return {HTMLElement} 被移除的 Element 对象
             */
            remove: function (el) {
                var parent = dom.getParent(el);
                if (parent) {
                    parent.removeChild(el);
                }
                return el;
            },

            /**
             * 删除 Element 对象中的样式。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} className 样式名，可以是多个，中间用空白符分隔
             */
            removeClass: function (el, className) {
                var oldClasses = el.className.split(/\s+/).sort(),
                    newClasses = className.split(/\s+/).sort(),
                    i = oldClasses.length,
                    j = newClasses.length;

                for (; i && j; ) {
                    if (oldClasses[i - 1] === newClasses[j - 1]) {
                        oldClasses.splice(--i, 1);
                    } else if (oldClasses[i - 1] < newClasses[j - 1]) {
                        j--;
                    } else {
                        i--;
                    }
                }
                el.className = oldClasses.join(' ');
            },

            /**
             * 卸载事件。
             * @public
             *
             * @param {Object} obj 响应事件的对象
             * @param {string} type 事件类型
             * @param {Function} func 事件处理函数
             */
            removeEventListener: ieVersion < 9 ? function (obj, type, func) {
                obj.detachEvent('on' + type, func);
            } : function (obj, type, func) {
                obj.removeEventListener(type, func, true);
            },

            /**
             * 设置输入框的表单项属性。
             * 如果没有指定一个表单项，setInput 方法将创建一个表单项。
             * @public
             *
             * @param {HTMLElement} el InputElement 对象
             * @param {string} name 新的表单项名称，默认与 el 相同
             * @param {string} type 新的表单项类型，默认为 el 相同
             * @return {HTMLElement} 设置后的 InputElement 对象
             */
            setInput: function (el, name, type) {
                if (!el) {
                    if (type === 'textarea') {
                        el = dom.create('', 'TEXTAREA');
                    } else {
                        if (ieVersion < 9) {
                            return dom.create('', '<input type="' + (type || '') + '" name="' + (name || '') + '">');
                        }
                        el = dom.create('', 'INPUT');
                    }
                }

                name = name === undefined ? el.name : name;
                type = type === undefined ? el.type : type;

                if (el.name !== name || el.type !== type) {
                    if ((ieVersion && type !== 'textarea') || (el.type !== type && (el.type === 'textarea' || type === 'textarea'))) {
                        dom.insertHTML(el, 'AFTEREND', '<' + (type === 'textarea' ? 'textarea' : 'input type="' + type + '"') + ' name="' + name + '" class="' + el.className + '" style="' + el.style.cssText + '" ' + (el.disabled ? 'disabled' : '') + (el.readOnly ? ' readOnly' : '') + '>');
                        name = el;
                        (el = el.nextSibling).value = name.value;
                        if (type === 'radio') {
                            el.checked = name.checked;
                        }
                        dom.remove(name);
                    } else {
                        el.type = type;
                        el.name = name;
                    }
                }
                return el;
            },

            /**
             * 设置 Element 对象的样式值。
             * @public
             *
             * @param {HTMLElement} el Element 对象
             * @param {string} name 样式名称
             * @param {string} value 样式值
             */
            setStyle: function (el, name, value) {
                var fixer = __ECUI__StyleFixer[name];
                if (fixer && fixer.set) {
                    fixer.set(el, value);
                } else {
                    el.style[fixer || name] = value;
                }
            }
        },
        ext: {},
        io: {
            /**
             * 发送一个ajax请求。
             * options 对象支持的属性如下：
             * method    {string}   请求类型，默认为GET
             * async     {boolean}  是否异步请求，默认为true(异步)
             * data      {string}   需要发送的数据，主要用于POST
             * headers   {Object}   要设置的http request header
             * timeout   {number}   超时时间
             * nocache   {boolean}  是否需要缓存，默认为false(缓存)
             * onsuccess {Function} 请求成功时触发
             * onerror   {Function} 请求发生错误时触发
             * @public
             *
             * @param {string} url 发送请求的url
             * @param {Object} options 选项
             */
            ajax: function (url, options) {
                options = options || {};

                var data = options.data || '',
                    async = options.async !== false,
                    method = (options.method || 'GET').toUpperCase(),
                    headers = options.headers || {},
                    onerror = options.onerror || util.blank,
                    // 基本的逻辑来自lili同学提供的patch
                    stop,
                    key,
                    xhr;

                try {
                    if (window.ActiveXObject) {
                        try {
                            xhr = new ActiveXObject('Msxml2.XMLHTTP');
                        } catch (e) {
                            xhr = new ActiveXObject('Microsoft.XMLHTTP');
                        }
                    } else {
                        xhr = new XMLHttpRequest();
                    }

                    if (method === 'GET') {
                        if (data) {
                            url += (url.indexOf('?') >= 0 ? '&' : '?') + data;
                            data = null;
                        }
                        if (!options.cache) {
                            url += (url.indexOf('?') >= 0 ? '&' : '?') + 'b' + Date.now() + '=1';
                        }
                    }

                    xhr.open(method, url, async);

                    if (async) {
                        xhr.onreadystatechange = stateChangeHandler;
                    }

                    // 在open之后再进行http请求头设定
                    // FIXME 是否需要添加; charset=UTF-8呢
                    if (method === 'POST') {
                        xhr.setRequestHeader('Content-Type', headers['Content-Type'] || 'application/x-www-form-urlencoded');
                        delete headers['Content-Type'];
                    }

                    for (key in headers) {
                        if (headers.hasOwnProperty(key)) {
                            xhr.setRequestHeader(key, headers[key]);
                        }
                    }

                    if (options.timeout) {
                        stop = util.timer(
                            function () {
                                xhr.onreadystatechange = util.blank;
                                xhr.abort();
                                onerror();
                            },
                            options.timeout
                        );
                    }
                    xhr.send(data);

                    if (!async) {
                        stateChangeHandler();
                    }
                } catch (e) {
                    onerror();
                }

                function stateChangeHandler() {
                    if (xhr.readyState === 4) {
                        try {
                            var status = xhr.status;
                        } catch (ignore) {
                            // 在请求时，如果网络中断，Firefox会无法取得status
                        }

                        // IE error sometimes returns 1223 when it
                        // should be 204, so treat it as success
                        if ((status >= 200 && status < 300) || status === 304 || status === 1223) {
                            if (options.onsuccess) {
                                options.onsuccess(xhr.responseText, xhr);
                            }
                        } else {
                            onerror();
                        }

                        /*
                         * NOTE: Testing discovered that for some bizarre reason, on Mozilla, the
                         * JavaScript <code>XmlHttpRequest.onreadystatechange</code> handler
                         * function maybe still be called after it is deleted. The theory is that the
                         * callback is cached somewhere. Setting it to null or an empty function does
                         * seem to work properly, though.
                         *
                         * On IE, there are two problems: Setting onreadystatechange to null (as
                         * opposed to an empty function) sometimes throws an exception. With
                         * particular (rare) versions of jscript.dll, setting onreadystatechange from
                         * within onreadystatechange causes a crash. Setting it from within a timeout
                         * fixes this bug (see issue 1610).
                         *
                         * End result: *always* set onreadystatechange to an empty function (never to
                         * null). Never set onreadystatechange from within onreadystatechange (always
                         * in a setTimeout()).
                         */
                        util.timer(
                            function () {
                                xhr.onreadystatechange = util.blank;
                                if (async) {
                                    xhr = null;
                                }
                            },
                            0
                        );

                        if (stop) {
                            stop();
                        }
                    }
                }
            },

            /**
             * 通过script标签加载数据。
             * options 对象支持的属性如下：
             * charset {string}   字符集
             * timeout {number}   超时时间
             * onerror {Function} 超时或无法加载文件时触发本函数
             * @public
             *
             * @param {string} url 加载数据的url
             * @param {Function} callback 数据加载结束时调用的函数或函数名
             * @param {Object} options 选项
             */
            loadScript: function (url, callback, options) {
                function removeScriptTag() {
                    scr.onload = scr.onreadystatechange = scr.onerror = null;
                    if (scr && scr.parentNode) {
                        scr.parentNode.removeChild(scr);
                    }
                    scr = null;
                }

                options = options || {};

                if (!options.cache) {
                    url += (url.indexOf('?') >= 0 ? '&' : '?') + 'b' + Date.now() + '=1';
                }

                var scr = document.createElement('SCRIPT'),
                    scriptLoaded = 0,
                    stop;

                // IE和opera支持onreadystatechange
                // safari、chrome、opera支持onload
                scr.onload = scr.onreadystatechange = function () {
                    // 避免opera下的多次调用
                    if (scriptLoaded) {
                        return;
                    }

                    if (scr.readyState === undefined || scr.readyState === 'loaded' || scr.readyState === 'complete') {
                        scriptLoaded = 1;
                        try {
                            if (callback) {
                                callback();
                            }
                            if (stop) {
                                stop();
                            }
                        } finally {
                            removeScriptTag();
                        }
                    }
                };

                if (options.timeout) {
                    stop = util.timer(
                        function () {
                            removeScriptTag();
                            if (options.onerror) {
                                options.onerror();
                            }
                        },
                        options.timeout
                    );
                }

                if (options.charset) {
                    scr.setAttribute('charset', options.charset);
                }
                scr.setAttribute('src', url);
                scr.onerror = options.onerror;
                document.head.appendChild(scr);
            }
        },
        ui: {},
        util: {
            /*
             * 空函数。
             * blank 方法不应该被执行，也不进行任何处理，它用于提供给不需要执行操作的事件方法进行赋值，与 blank 类似的用于给事件方法进行赋值，而不直接被执行的方法还有 cancel。
             * @public
             */
            blank: new Function(),

            createKeyframes: function (source) {
                function parse(exp, first) {
                    return exp.replace(/@(\w+)/g, function ($, name) {
                        return '"+' + (first ? 'ecui.dom.getStyle(e,"' + name + '")' : 'd.' + name + '[0]') + '+"';
                    }).replace(/@\((.+)\)/g, function ($, exp) {
                        return '"+(' + exp.replace(/([A-Za-z]+)/g, function ($, name) {
                            return 'ecui.util.toNumber(' + (first ? 'ecui.dom.getStyle(e,"' + name + '")' : 'd.' + name + '[0]') + ')';
                        }) + ')+"';
                    });
                }

                var times = [],
                    keyframes = [],
                    initCodes = [],
                    forwardCodes = [],
                    reverseCodes = [],
                    name;

                source.replace(
                    /(\d+%|from|to)\{([^}]+)\}/g,
                    function (keyframe, selector, cssText) {
                        if (selector === 'from') {
                            selector = 0;
                        } else if (selector === 'to') {
                            selector = 1;
                        } else {
                            selector = +selector.slice(0, -1) / 100;
                        }

                        if (selector && !keyframes.length) {
                            keyframes[0] = {};
                            times.push(0);
                        }

                        keyframe = {};
                        keyframes.push(keyframe);
                        times.push(selector);

                        cssText = cssText.split(';');
                        for (var i = 0, item; item = cssText[i++]; ) {
                            item = item.split(':');
                            name = util.toCamelCase(item[0]);
                            keyframe[name] = '"' + item[1] + '"';
                            if (selector && !keyframes[0][name]) {
                                keyframes[0][name] = '"@' + name + '"';
                            }
                        }
                    }
                );

                initCodes.push('var d={};');
                for (name in keyframes[0]) {
                    if (keyframes[0].hasOwnProperty(name)) {
                        initCodes.push('d.' + name + '=[' + parse(keyframes[0][name], true) + '];');
                        for (var i = 1, keyframe; keyframe = keyframes[i]; i++) {
                            if (keyframe[name]) {
                                initCodes.push('d.' + name + '[' + i + ']=' + parse(keyframe[name]) + ';');
                            }
                        }
                    }
                }
                initCodes.push('return d');

                for (i = 1; keyframe = keyframes[i]; i++) {
                    forwardCodes.push('else if(p<=' + times[i] + '){p=(p-' + times[i - 1] + ')/' + (times[i] - times[i - 1]) + ';');
                    for (name in keyframe) {
                        if (keyframe.hasOwnProperty(name)) {
                            forwardCodes.push('$.style.' + name + '=f("' + name + '",' + i + ',p);');
                        }
                    }
                    forwardCodes.push('}');
                }

                for (i = keyframes.length - 1; i--; ) {
                    keyframe = keyframes[i];
                    reverseCodes.push('else if(p<=' + (1 - times[i]) + '){p=(p-' + (1 - times[i + 1]) + ')/' + (times[i + 1] - times[i]) + ';');
                    for (name in keyframe) {
                        if (keyframe.hasOwnProperty(name)) {
                            reverseCodes.push('$.style.' + name + '=f("' + name + '",' + i + ',p);');
                        }
                    }
                    reverseCodes.push('}');
                }

                return {
                    init: new Function('e', initCodes.join('')),
                    forward: new Function('$', 'p', 'f', forwardCodes.join('').slice(5)),
                    reverse: new Function('$', 'p', 'f', reverseCodes.join('').slice(5))
                };
            },

            animate: function (el, keyframes, duration, timingFn, delay, count, alternate) {
                function sampleCurveX(t) {
                    return ((ax * t + bx) * t + cx) * t;
                }

                function sampleCurveY(t) {
                    return ((ay * t + by) * t + cy) * t;
                }

                function sampleCurveDerivativeX(t) {
                    return (3 * ax * t + 2 * bx) * t + cx;
                }

                function solveCurveX(x) {
                    var epsilon = 0.00001;
                    for (var i = 0, t2 = x; i < 8; i++) {
                        var x2 = sampleCurveX(t2) - x;
                        if (Math.abs(x2) < epsilon) {
                            return t2;
                        }
                        var d2 = sampleCurveDerivativeX(t2);
                        if (Math.abs(d2) < 1e-6) {
                            break;
                        }
                        t2 -= x2 / d2;
                    }

                    var t0 = 0,
                        t1 = 1;

                    t2 = x;
                    while (t0 < t1) {
                        x2 = sampleCurveX(t2);
                        if (Math.abs(x2 - x) < epsilon) {
                            return t2;
                        }
                        if (x > x2) {
                            t0 = t2;
                        } else {
                            t1 = t2;
                        }
                        t2 = (t1 - t0) * 0.5 + t0;
                    }
                }

                function translateColor(value) {
                    value = __ECUI__Colors[value] || value;
                    if (value.charAt(0) === '#') {
                        if (value.length === 4) {
                            return [
                                parseInt(value.charAt(1) + value.charAt(1), 16),
                                parseInt(value.charAt(2) + value.charAt(2), 16),
                                parseInt(value.charAt(3) + value.charAt(3), 16),
                            ];
                        }
                        return [
                            parseInt(value.slice(1, 3), 16),
                            parseInt(value.slice(3, 5), 16),
                            parseInt(value.slice(5), 16)
                        ];
                    }
                    if (value.indexOf('rgb') === 0) {
                        value = value.split(/(\(|\s*,\s*|\))/);
                        return [+value[2], +value[4], +value[6]];
                    }
                }

                var data = keyframes.init(el);
                console.log(JSON.stringify(data));
                for (var name in data) {
                    if (data.hasOwnProperty(name)) {
                        var value = translateColor(data[name][0]) || data[name][0];

                        if ('string' === typeof value) {
                            data['$' + name] = value.replace(/[0-9.]+/, '#');
                            value = util.toNumber(value);
                        }
                        data[name][0] = value;

                        for (var i = 1; i < data[name].length; i++) {
                            value = data[name][i];
                            data[name][i] = value !== undefined ? translateColor(value) || util.toNumber(value) : data[name][i - 1];
                        }
                    }
                }
                console.log(JSON.stringify(data));

                timingFn = __ECUI__CubicBezier[timingFn || 'ease'] || timingFn;
                count = count || 1;

                var cx = 3 * timingFn[0],
                    bx = 3 * (timingFn[2] - timingFn[0]) - cx,
                    ax = 1 - cx - bx,
                    cy = 3 * timingFn[1],
                    by = 3 * (timingFn[3] - timingFn[1]) - cy,
                    ay = 1 - cy - by;

                var startTime = Date.now(),
                    reverse,
                    stop = util.timer(
                        function () {
                            var currTime = Date.now() - startTime - delay,
                                percent;

                            if (currTime >= 0) {
                                if (currTime >= duration) {
                                    percent = 1;
                                } else {
                                    percent = currTime / duration;
                                    percent = sampleCurveY(solveCurveX(percent));
                                }

                                keyframes[reverse ? 'reverse' : 'forward'](el, percent, function (name, index, percent) {
                                    var start = data[name][reverse ? index + 1 : index - 1],
                                        end = data[name][index];
                                    if ('number' === typeof start) {
                                        return data['$' + name].replace('#', start + ((end - start) * percent));
                                    }
                                    return 'rgb(' + Math.floor(start[0] + ((end[0] - start[0]) * percent)) + ',' + Math.floor(start[1] + ((end[1] - start[1]) * percent)) + ',' + Math.floor(start[2] + ((end[2] - start[2]) * percent)) + ')';
                                });

                                if (currTime >= duration) {
                                    if (--count) {
                                        count = Math.max(-1, count);
                                        if (alternate) {
                                            reverse = !reverse;
                                        }
                                        startTime += duration;
                                    } else {
                                        stop();
                                    }
                                }
                            }
                        },
                        -20
                    );
            },

            /**
             * 对目标字符串进行 html 编码。
             * encodeHTML 方法对四个字符进行编码，分别是 &<>"
             * @public
             *
             * @param {string} source 目标字符串
             * @return {string} 结果字符串
             */
            encodeHTML: function (source) {
                return source.replace(
                    /[&<>"']/g,
                    function (c) {
                        return '&#' + c.charCodeAt(0) + ';';
                    }
                );
            },

            /**
             * 对目标字符串进行 html 解码。
             * @public
             *
             * @param {string} source 目标字符串
             * @return {string} 结果字符串
             */
            decodeHTML: (function () {
                return function (source) {
                    //处理转义的中文和实体字符
                    return source.replace(/&(quot|lt|gt|amp|#([\d]+));/g, function (match, $1, $2) {
                        return __ECUI__EscapeCharacter[$1] || String.fromCharCode(+$2);
                    });
                };
            }()),

            /**
             * 对象属性复制。
             * @public
             *
             * @param {Object} target 目标对象
             * @param {Object} source 源对象
             * @return {Object} 目标对象
             */
            extend: function (target, source) {
                for (var key in source) {
                    if (source.hasOwnProperty(key)) {
                        target[key] = source[key];
                    }
                }
                return target;
            },

            /**
             * 获取浏览器可视区域的相关信息。
             * getView 方法将返回浏览器可视区域的信息。属性如下：
             * top        {number} 可视区域最小X轴坐标
             * right      {number} 可视区域最大Y轴坐标
             * bottom     {number} 可视区域最大X轴坐标
             * left       {number} 可视区域最小Y轴坐标
             * width      {number} 可视区域的宽度
             * height     {number} 可视区域的高度
             * pageWidth  {number} 页面的宽度
             * pageHeight {number} 页面的高度
             * @public
             *
             * @return {Object} 浏览器可视区域信息
             */
            getView: function () {
                var body = document.body,
                    html = dom.getParent(body),
                    client = isStrict ? html : body,
                    scrollTop = html.scrollTop + body.scrollTop,
                    scrollLeft = html.scrollLeft + body.scrollLeft,
                    clientWidth = client.clientWidth,
                    clientHeight = client.clientHeight;

                return {
                    top: scrollTop,
                    right: scrollLeft + clientWidth,
                    bottom: scrollTop + clientHeight,
                    left: scrollLeft,
                    width: clientWidth,
                    height: clientHeight,
                    pageWidth: Math.max(html.scrollWidth, body.scrollWidth, clientWidth),
                    pageHeight: Math.max(html.scrollHeight, body.scrollHeight, clientHeight)
                };
            },

            /**
             * 类继承。
             * @public
             *
             * @param {Function} subClass 子类
             * @param {Function} superClass 父类
             * @return {Object} subClass 的 prototype 属性
             */
            inherits: function (subClass, superClass) {
                var oldPrototype = subClass.prototype,
                    Clazz = new Function();

                Clazz.prototype = superClass.prototype;
                util.extend(subClass.prototype = new Clazz(), oldPrototype);
                subClass.prototype.constructor = subClass;
                subClass.superClass = superClass.prototype;

                return subClass.prototype;
            },

            /**
             * 解析命名空间并取出值。
             * @public
             *
             * @param {string} name 命名空间的名称
             * @param {Object} namespace 开始的namespace，默认从window开始
             * @return {Object} 命名空间对应的值，如果不存在返回undefined
             */
            parseNamespace: function (name, namespace) {
                namespace = namespace || window;
                for (var i = 0, list = name.split('.'); name = list[i++]; ) {
                    namespace = namespace[name];
                    if (namespace === undefined || namespace === null) {
                        return undefined;
                    }
                }
                return namespace;
            },

            /**
             * 从数组中移除对象。
             * @public
             *
             * @param {Array} array 数组对象
             * @param {Object} obj 需要移除的对象
             */
            remove: function (array, obj) {
                for (var i = array.length; i--; ) {
                    if (array[i] === obj) {
                        array.splice(i, 1);
                    }
                }
            },

            /**
             * 设置缺省的属性值。
             * 如果对象的属性已经被设置，setDefault 方法不进行任何处理，否则将默认值设置到指定的属性上。
             * @public
             *
             * @param {Object} obj 被设置的对象
             * @param {string} key 属性名
             * @param {Object} value 属性的默认值
             */
            setDefault: function (obj, key, value) {
                if (!obj.hasOwnProperty(key)) {
                    obj[key] = value;
                }
            },

            /**
             * 字符串格式化
             *
             * @inner
             * @param {string} source 目标模版字符串
             * @param {string} ... 字符串替换项集合
             * @return {string} 格式化结果
             */
            stringFormat: function (source) {
                var args = arguments;
                return source.replace(
                    /\{([0-9]+)\}/g,
                    function (match, index) {
                        return args[+index + 1];
                    }
                );
            },

            /**
             * 创建一个定时器对象。
             * @public
             *
             * @param {Function} func 定时器需要调用的函数
             * @param {number} delay 定时器延迟调用的毫秒数，如果为负数表示需要连续触发
             * @param {Object} caller 调用者，在 func 被执行时，this 指针指向的对象，可以为空
             * @param {Object} ... 向 func 传递的参数
             * @return {Function} 用于关闭定时器的方法
             */
            timer: function (func, delay, caller) {
                function build() {
                    return (delay < 0 ? setInterval : setTimeout)(
                        function () {
                            func.apply(caller, args);
                            // 使用delay<0而不是delay>=0，是防止delay没有值的时候，不进入分支
                            if (!delay || delay > 0) {
                                func = caller = args = null;
                            }
                        },
                        Math.abs(delay)
                    );
                }

                var args = Array.prototype.slice.call(arguments, 3),
                    handle = build(),
                    pausing;

                /**
                 * 中止定时调用。
                 * @public
                 *
                 * @param {boolean} pause 是否暂时停止定时器，如果参数是 true，再次调用函数并传入参数 true 恢复运行。
                 */
                return function (pause) {
                    (delay < 0 ? clearInterval : clearTimeout)(handle);
                    if (pause) {
                        if (pausing) {
                            handle = build();
                        }
                        pausing = !pausing;
                    } else {
                        func = caller = args = null;
                    }
                };
            },

            /**
             * 驼峰命名法转换。
             * toCamelCase 方法将 xxx-xxx 字符串转换成 xxxXxx。
             * @public
             *
             * @param {string} source 目标字符串
             * @return {string} 结果字符串
             */
            toCamelCase: function (source) {
                if (source.indexOf('-') < 0) {
                    return source;
                }
                return source.replace(
                    /\-./g,
                    function (match) {
                        return match.charAt(1).toUpperCase();
                    }
                );
            },

            /**
             * 将对象转换成数值。
             * toNumber 方法会省略数值的符号，例如字符串 9px 将当成数值的 9，不能识别的数值将默认为 0。
             * @public
             *
             * @param {Object} obj 需要转换的对象
             * @return {number} 对象的数值
             */
            toNumber: function (obj) {
                return parseInt(obj, 10) || 0;
            }
        }
    };

    var core = ecui,
        dom = core.dom,
        //{if 1}//ext = core.ext,//{/if}//
        //{if 1}//io = core.io,//{/if}//
        //{if 1}//ui = core.ui,//{/if}//
        util = core.util;

    //{if 1}//var eventNames = ['mousedown', 'mouseover', 'mousemove', 'mouseout', 'mouseup', 'click', 'dblclick', 'focus', 'blur', 'activate', 'deactivate', 'keydown', 'keypress', 'keyup', 'mousewheel'];//{/if}//

    // 读写特殊的 css 属性操作
    var __ECUI__StyleFixer = {
            display: ieVersion < 8 ? {
                get: function (el, style) {
                    return style.display === 'inline' && style.zoom === '1' ? 'inline-block' : style.display;
                },

                set: function (el, value) {
                    if (value === 'inline-block') {
                        value = 'inline';
                        el.style.zoom = 1;
                    }
                    el.style.display = value;
                }
            } : undefined,

            opacity: ieVersion < 9 ? {
                get: function (el, style) {
                    if (/\(opacity=(\d+)/.test(style.filter)) {
                        return String(+RegExp.$1 / 100);
                    }
                    return '1';
                },

                set: function (el, value) {
                    el.style.filter = el.style.filter.replace(/alpha\([^\)]*\)/gi, '') + (value === '' ? (ieVersion < 8 ? 'alpha' : 'progid:DXImageTransform.Microsoft.Alpha') + '(opacity=' + value * 100 + ')' : '');
                }
            } : undefined,

            'float': ieVersion ? 'styleFloat' : 'cssFloat'
        },

        __ECUI__HTMLPosition = {
            AFTERBEGIN: 'selectNodeContents',
            BEFOREEND: 'selectNodeContents',
            BEFOREBEGIN: 'setStartBefore',
            AFTEREND: 'setEndAfter'
        },

        __ECUI__EscapeCharacter = {
            quot: '"',
            lt: '<',
            gt: '>',
            amp: '&'
        },

        __ECUI__Colors = {
            aqua: '#00FFFF',
            black: '#000000',
            blue: '#0000FF',
            fuchsia: '#FF00FF',
            gray: '#808080',
            green: '#008000',
            lime: '#00FF00',
            maroon: '#800000',
            navy: '#000080',
            olive: '#808000',
            orange: '#FFA500',
            purple: '#800080',
            red: '#FF0000',
            silver: '#C0C0C0',
            teal: '#008080',
            white: '#FFFFFF',
            yellow: '#FFFF00'
        },

        __ECUI__CubicBezier = {
            linear: [0, 0, 1, 1],
            ease: [0.25, 0.1, 0.25, 1],
            'ease-in': [0.42, 0, 1, 1],
            'ease-out': [0, 0, 0.58, 1],
            'ease-in-out': [0.42, 0, 0.58, 1]
        };

    /**
     * 返回指定id的 DOM 对象。
     * @public
     *
     * @param {string} id DOM 对象标识
     * @return {HTMLElement} DOM 对象
     */
    core.$ = function (id) {
        return document.getElementById(id);
    };

    core.strict = isStrict;
    core.webkit = isWebkit;
    core.ie = ieVersion;
    core.firefox = firefoxVersion;
    core.opera = operaVersion;

    /**
     * 设置页面加载完毕后自动执行的方法。
     * @public
     *
     * @param {Function} func 需要自动执行的方法
     */
    dom.ready = (function () {
        var hasReady = false,
            list = [],
            check;

        function ready() {
            if (!hasReady) {
                // 在处理的过程中，可能又有新的dom.ready函数被添加，需要添加到最后而不是直接执行
                for (var i = 0, func; func = list[i++]; ) {
                    func();
                }
                list = [];
                hasReady = true;
            }
        }

        if (document.addEventListener && !operaVersion) {
            document.addEventListener('DOMContentLoaded', ready, false);
        } else if (ieVersion && window === top) {
            check = function () {
                try {
                    document.documentElement.doScroll('left');
                    ready();
                } catch (e) {
                    util.timer(check, 0);
                }
            };
            check();
        }

        dom.addEventListener(window, 'load', ready);

        return function (func) {
            list.push(func);
            if (hasReady) {
                // 在一次处理的过程中防止重入
                hasReady = false;
                ready();
            }
        };
    }());

    if (ieVersion < 9) {
        document.head = document.getElementsByTagName('HEAD')[0];
    }

    try {
        document.execCommand('BackgroundImageCache', false, true);
    } catch (ignore) {
    }
//{if 0}//
}());
//{/if}//
