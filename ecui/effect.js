//{if 0}//
(function () {
    var core = ecui,
        util = core.util;

    var __ECUI__StyleFixer = {
            opacity: true
        };
//{/if}//
    var __ECUI__Colors = {
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

    core.effect = {

        /**
         * CSS3动画模拟。
         * @public
         *
         * @param {HTMLElement} el DOM 元素
         * @param {Keyframes} keyframes keyframes对象，通过createKeyframes方法生成
         * @param {number} duration 动画持续时间，单位ms
         * @param {string|Array|Function} timingFn 时间函数，默认ease
         * @param {number} delay 启动延迟，单位ms，默认无延迟
         * @param {number} count 重复次数，默认一次
         * @param {boolean} alternate 是否往返，默认否
         * @param {Function} callback 回调函数
         * @return {Function} 用于停止动画的函数
         */
        animate: function (el, keyframes, duration, timingFn, delay, count, alternate, callback) {
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

            var data = keyframes.init(
                    el,
                    function (value) {
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
                        return +(/[0-9.]+/.exec(value))[0];
                    }
                );

            if ('function' !== typeof timingFn) {
                timingFn = __ECUI__CubicBezier[timingFn || 'ease'] || timingFn;

                var cx = 3 * timingFn[0],
                    bx = 3 * (timingFn[2] - timingFn[0]) - cx,
                    ax = 1 - cx - bx,
                    cy = 3 * timingFn[1],
                    by = 3 * (timingFn[3] - timingFn[1]) - cy,
                    ay = 1 - cy - by;

                timingFn = function (t) {
                    return sampleCurveY(solveCurveX(t));
                };
            }
            delay = delay || 0;
            count = count || 1;
            callback = callback || util.blank;

            var startTime = Date.now(),
                fn = keyframes.forward,
                stop = util.timer(
                    function () {
                        var currTime = Date.now() - startTime - delay,
                            percent;

                        if (currTime >= 0) {
                            if (currTime >= duration) {
                                percent = 1;
                            } else {
                                percent = timingFn(currTime / duration);
                            }

                            fn(el, percent, function (name, index, percent) {
                                var start = data[name][fn === keyframes.forward ? index - 1 : index + 1],
                                    end = data[name][index];
                                if ('number' === typeof start) {
                                    return data['$' + name].replace('#', start + ((end - start) * percent));
                                }
                                return 'rgb(' + Math.round(start[0] + ((end[0] - start[0]) * percent)) + ',' + Math.round(start[1] + ((end[1] - start[1]) * percent)) + ',' + Math.round(start[2] + ((end[2] - start[2]) * percent)) + ')';
                            });

                            if (currTime >= duration) {
                                if (--count) {
                                    count = Math.max(-1, count);
                                    if (alternate) {
                                        fn = fn === keyframes.forward ? keyframes.reverse : keyframes.forward;
                                    }
                                    startTime += duration;
                                } else {
                                    stop();
                                    callback();
                                    callback = null;
                                }
                            }
                        }
                    },
                    -20
                );

            return function () {
                if (callback) {
                    stop();
                    callback = null;
                }
            };
        },

        /**
         * CSS3动画关键帧对象生成。
         * @public
         *
         * @param {string} source @keyframes等价的定义，不支持样式名缩写，支持@xxx的当前值访问
         * @return {Keyframes} 关键帧对象
         */
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

            initCodes.push('var d={},v;');
            for (name in keyframes[0]) {
                if (keyframes[0].hasOwnProperty(name)) {
                    initCodes.push('v=f(' + parse(keyframes[0][name], true) + ');');
                    initCodes.push('d.$' + name + '=RegExp.leftContext+"#"+RegExp.rightContext;');
                    initCodes.push('d.' + name + '=[v];');
                    for (var i = 1, keyframe; keyframe = keyframes[i]; i++) {
                        if (keyframe[name]) {
                            initCodes.push('v=' + parse(keyframe[name]) + ';');
                            initCodes.push('d.' + name + '[' + i + ']=f(v);');
                        } else {
                            initCodes.push('d.' + name + '[' + i + ']=d.' + name + '[' + (i - 1) + ']' + ';');
                        }
                    }
                }
            }
            initCodes.push('return d');

            for (i = 1; keyframe = keyframes[i]; i++) {
                forwardCodes.push('else if(p<=' + times[i] + '){p=(p-' + times[i - 1] + ')/' + (times[i] - times[i - 1]) + ';');
                for (name in keyframe) {
                    if (keyframe.hasOwnProperty(name)) {
                        if (__ECUI__StyleFixer[name]) {
                            forwardCodes.push('ecui.dom.setStyle($,"' + name + '",f("' + name + '",' + i + ',p));');
                        } else {
                            forwardCodes.push('$.style.' + name + '=f("' + name + '",' + i + ',p);');
                        }
                    }
                }
                forwardCodes.push('}');
            }

            for (i = keyframes.length - 1; i--; ) {
                reverseCodes.push('else if(p<=' + (1 - times[i]) + '){p=(p-' + (1 - times[i + 1]) + ')/' + (times[i + 1] - times[i]) + ';');
                keyframe = keyframes[Math.max(0, i - 1)];
                for (name in keyframe) {
                    if (keyframe.hasOwnProperty(name)) {
                        if (__ECUI__StyleFixer[name]) {
                            reverseCodes.push('ecui.dom.setStyle($,"' + name + '",f("' + name + '",' + i + ',p));');
                        } else {
                            reverseCodes.push('$.style.' + name + '=f("' + name + '",' + i + ',p);');
                        }
                    }
                }
                reverseCodes.push('}');
            }

            return {
                init: new Function('e', 'f', initCodes.join('')),
                forward: new Function('$', 'p', 'f', forwardCodes.join('').slice(5)),
                reverse: new Function('$', 'p', 'f', reverseCodes.join('').slice(5))
            };
        }
    };
//{if 0}//
}());
//{/if}//
