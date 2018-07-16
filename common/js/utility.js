(function () {
    //数据规则
    var urlRule = [
        {
            exp: /base\/series\/[\d]+/,
            def: {
                'value': 'id',
                'code': 'text'
            }
        },
        {
            exp: /base\/motorcycletype\/[\d]+/,
            def: {
                'value': 'id',
                'code': 'description'
            }
        }
    ];

    //统一对请求成功返回参数做分类
    ecui.esr.onparsedata = function (url, data) {
        if (data.data && data.data.pageNo !== undefined && data.data.total === undefined &&  data.data.offset === undefined) {
            data.data.total = data.data.totalRecord;
            data.data.offset = data.data.pageSize * (data.data.pageNo - 1);
        }
        var code = data.code;
        if ('0000' === code || '9012' === code) {
            data = data.data;
            //对数据进行统一化处理
            var rule = urlRule.filter(function (item) {
                    return item.exp.test(url);
                })[0];
            if (rule) {
                rule = rule.def;
                data.forEach(function (item) {
                    var tmpData = {};
                    for (var key in rule) {
                        tmpData[key] = item[key];
                        item[key] = tmpData[rule[key]] || item[rule[key]];
                    }
                });
            }
            return data;
        }
        if (code === '5999') {
            // 分支3.4：登录相关的错误
            window.location = './login.html';
        } else {
            if (code === 300000) {
                throw data.message;
            }
            fapiao.showHint('error', data.message);
        }
        return code;
    };
}());

ecui.ui.Select.prototype.TEXTNAME = 'code';

ecui.render = {};
ecui.render.select = function (data) {
    this.removeAll(true);
    this.add(data);
};

fapiao.cookie = {
    set: function (key, val, exp) {
        var cookie = key + '=' + val;
        if (exp) {
            cookie += ('; expires=' + exp.toGMTString());
        }
        document.cookie = cookie;
    },
    get: function (key) {
        var cookies = document.cookie.split('; ');
        var val = null;
        cookies.forEach(function (cookie) {
            cookie = cookie.split('=');
            if (cookie[0] === key) {
                val = cookie[1];
            }
        });
        return val;
    },
    del: function (key) {
        var d = new Date();
        d.setTime(d.getTime() - 1000000);
        var cookie = key + '="" ; expires=' + d.toGMTString();
        document.cookie = cookie;
    }
};

fapiao.util = {
    clone: function (obj) {
        var newobj = obj.constructor === Array ? [] : {};
        if (typeof obj !== 'object') {
            return;
        } else {
            for (var i in obj) {
                newobj[i] = typeof obj[i] === 'object' ? fapiao.util.clone(obj[i]) : obj[i];
            }
        }
        return newobj;
    },
    unique: function (array) {
        var ret = [];
        if (!(array instanceof Array)) {
            return array;
        }
        for (var i = 0; i < array.length; i++) {
            if (ret.indexOf(array[i]) < 0) {
                ret.push(array[i]);
            }
        }
        return ret;
    },
    DX: function (n) {
        var oldN = n;
        // 判断正负数
        if(n.substr(0,1) == '-') {
            n = n.substr(1);
        }

        if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n)) {
            return '数据非法';
        }
        var unit = '千百拾亿千百拾万千百拾元角分', str = '';
        n += '00';
        var p = n.indexOf('.');
        if (p >= 0) {
            n = n.substring(0, p) + n.substr(p + 1, 2);
        }
        unit = unit.substr(unit.length - n.length);
        for (var i = 0; i < n.length; i++) {
            str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i);
        }
        str = str.replace(/零(千|百|拾|角)/g, '零').replace(/(零)+/g, '零').replace(/零(万|亿|元)/g, '$1').replace(/(亿)万|壹(拾)/g, '$1$2').replace(/^元零?|零分/g, '').replace(/元$/g, '元整');
        // 判断正负数
        if(oldN.substr(0,1) == '-') {
            n = n.substr(1);
            str = '负' + str;
        }
        return str;
    }
};

fapiao.getCity = function (code, city_data) {
    if (code === 0) {
        return [' '];
    }
    code = code.toString();
    var pro = code.slice(0, 2) + '0000',
        city = code.slice(0, 4) + '00',
        area = code.slice(0, 6),
        arr = [];
    arr.push(city_data[pro]);
    (code.slice(2, 4) !== '00') && arr.push(city_data[city] || '');
    (code.slice(4, 6) !== '00') && arr.push(city_data[area] || '');
    return arr;
};

Date.prototype.pattern = function (fmt) {
    var o = {
        'M+': this.getMonth() + 1, //月份
        'd+': this.getDate(), //日
        'h+': this.getHours() % 12 === 0 ? 12 : this.getHours() % 12, //小时
        'H+': this.getHours(), //小时
        'm+': this.getMinutes(), //分
        's+': this.getSeconds(), //秒
        'q+': Math.floor((this.getMonth() + 3) / 3), //季度
        'S': this.getMilliseconds() //毫秒
    };
    var week = ['日', '一', '二', '三', '四', '五', '六'];
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? '星期' : '周') : '') + week[this.getDay()]);
    }
    for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
};

// 弹出提示框
fapiao.showHint = function (type, msg) {
    var className = {
        success: 'successHint',
        error: 'errorHint',
        warn: 'warnHint'
    }[type];
    var hintContainer = ecui.$('hintContainer') || ecui.dom.create({id: 'hintContainer'});
    ecui.dom.removeClass(hintContainer, 'ui-hide');
    hintContainer.innerHTML = ecui.util.stringFormat('<div class="{0}">{1}</div>', className, msg);
    ecui.dom.insertAfter(hintContainer, ecui.dom.last(ecui.getBody()));
    ecui.util.timer(function () {
        ecui.dom.addClass(hintContainer, 'ui-hide');
    }, 2000);
};

// 录入表单反显数据
fapiao.setEditFormValue = function (data, form) {
    var elements = form.elements;
    var ignore = [], arr_obj_ignore = [];
    for (var i = 0, item; item = elements[i++]; ) {
        var name = item.name;
        // 使用ecui.util.parseValue解析数据，处理ecui.esr.CreateObject创建的对象数据的参数回填
        var value = ecui.util.parseValue(name, data);
        if (name && value !== undefined) {
            // 将value转换成字符串
            value = value + '';
            if (ignore.indexOf(name.split('.')[0]) === -1) {
                var _control = item.getControl && item.getControl();
                if (_control) {
                    if (_control instanceof ecui.ui.Radio) {
                        _control.setChecked(value === _control.getValue());
                    } else if (_control instanceof ecui.ui.Checkbox) {
                        _control.setChecked(value.indexOf(_control.getValue()) !== -1);
                    } else if (_control instanceof ecui.esr.CreateArray) {
                        if (elements[name][1]) {
                            //  获取与ecui.esr.CreateArray控件的name相同第一个input元素
                            var control = elements[name][1] && elements[name][1].getControl && elements[name][1].getControl();
                            // 如果CreateArray对应的表单元素是Checkbox时不将那么添加到ignore忽略数组中，否则添加到ignore忽略数组中忽略Array复杂数据结构处理
                            if (!(control instanceof ecui.ui.Checkbox)) {
                                ignore.push(name);
                            }
                        }
                    } else if (_control instanceof ecui.esr.CreateObject) {
                        ignore.indexOf(name) !== -1 && arr_obj_ignore.push(name);
                    } else {
                        _control.setValue(value);
                    }

                } else {
                    item.value = value;
                }
            // 对象数组 数据 不做任何处理 ecui.esr.CreateArray 和 ecui.esr.CreateObject 同时使用
            } else if (arr_obj_ignore.indexOf(name.split('.')[0]) === -1) {
                // return;
            } else {
                // ecui.esr.CreateArray数组回填时index减去ecui.esr.CreateArray本身input表单元素
                value = ecui.util.parseValue(name, data);
                value = value && value.length ? value[Array.prototype.slice.call(elements[name]).indexOf(item) - 1] : '';
                if (item.getControl) {
                    var control = item.getControl();
                    if (!(control instanceof ecui.esr.CreateObject)) {
                        item.getControl().setValue(value);
                    }
                } else {
                    item.value = value;
                }
            }
        }
    }
};

// 搜索数据回填表单数据
fapiao.setFormValue = function (context, form, searchParm) {
    var elements = form.elements;
    for (var i = 0, item; item = elements[i++]; ) {
        var name = item.name;
        if (name) {
            if (context[name]) {
                searchParm[name] = context[name];
            }
            var _control = item.getControl && item.getControl();
            if (_control) {
                if (_control instanceof ecui.ui.Radio) {
                    _control.setChecked(searchParm[name] === _control.getValue());
                } else if (_control instanceof ecui.ui.Checkbox) {
                    _control.setChecked(searchParm[name].indexOf(_control.getValue()) !== -1);
                } else {
                    _control.setValue(searchParm[name] || '');
                }

            } else {
                item.value = searchParm[name] || '';
            }
        }
    }
};

// 清空表单数据
fapiao.resetFormValue = function (form) {
    var elements = form.elements;
    for (var i = 0, item; item = elements[i++]; ) {
        var name = item.name;
        if (name) {
            var _control = item.getControl && item.getControl();
            if (_control) {
                if (_control instanceof ecui.ui.Radio) {
                    _control.setChecked(false);
                } else if (_control instanceof ecui.ui.Checkbox) {
                    _control.setChecked(false);
                } else if (_control instanceof ecui.esr.CreateArray || _control instanceof ecui.esr.CreateObject) {
                    // 如果是ecui.esr.CreateArray 和 ecui.esr.CreateObject元素，不做任何处理
                } else {
                    _control.setValue('');
                }
            } else {
                if (!ecui.dom.hasClass(item, 'ui-hide')) {
                    item.value = '';
                }
            }
        }
    }
};

// 获取表单数据设置searchParam数据
fapiao.setSearchParam = function (searchParm, form) {
    Array.prototype.slice.call(form.elements).forEach(function (item) {
        if (item.name) {
            var _control = ecui.findControl(item);
            if (_control) {
                if (_control instanceof ecui.ui.Radio) {
                    if (Array.prototype.indexOf.call(form.elements[item.name], _control.getInput()) === 0) {
                        searchParm[item.name] = '';
                    }
                    if (_control.isChecked()) {
                        searchParm[item.name] = _control.getValue();
                    }
                } else if (_control instanceof ecui.ui.Checkbox) {
                    if (Array.prototype.indexOf.call(form.elements[item.name], _control.getInput()) === 0) {
                        searchParm[item.name] = [];
                    }
                    if (_control.isChecked()) {
                        searchParm[item.name].push(_control.getValue());
                    }
                }  else {
                    searchParm[item.name] = _control.getValue();
                }
            } else {
                searchParm[item.name] = item.value;
            }
        }
    });
};

// 初始化dialog控件
fapiao.initDialog = function (container, targetName, options) {
    ecui.dispose(container);
    container.innerHTML = ecui.esr.getEngine().render(targetName, options);
    ecui.init(container);
    return container.children[0].getControl();
};

// 复制text到剪切板中
// 在异步ajax请求中使用document.execCommand('copy')无效，同步的ajax请求中正常使用
fapiao.copy = function (text) {
    var textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.top = -100;
    textarea.style.left = 0;
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.background = 'transparent';
    textarea.style.color = 'transparent';

    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    var flag = document.execCommand('copy');
    document.body.removeChild(textarea);
    return flag;
};

// 设置分页数据
fapiao.setPageData = function (context, listNmae) {
    var data = ecui.util.parseValue(listNmae, context);

    context.offset = data.offset;
    context.total = data.total;
    context.totalPage = data.totalPage;
};

/**
 * 列表路由对象。
 * @public
 *
 * @param {Object} route 路由对象
 */
fapiao.TableListRoute = function (route) {
    this.model = [route.NAME.slice(0, -5) + '@FORM ' + route.url];
    this.main = route.NAME.slice(0, -9) + '_table';
    ecui.util.extend(this, route);
};
fapiao.TableListRoute.prototype.onbeforerequest = function (context) {
    context.pageNo = context.pageNo || +this.searchParm.currentPage;
    context.pageSize = context.pageSize || +this.searchParm.pageSize;
    fapiao.setFormValue(context, document.forms[this.model[0].split('?')[1]], this.searchParm);
};
fapiao.TableListRoute.prototype.onbeforerender = function (context) {
    var data = ecui.util.parseValue(this.model[0].split('@')[0], context);
    var pageNo = data.currentPage || 1;
    var total = data.count || 10;
    var pageSize = data.pageSize || 10;
    context.page = {
        total: total,
        totalPage: Math.ceil(total / pageSize),
        pageSize: pageSize,
        pageNo: pageNo,
        start: (pageNo - 1) * pageSize + 1,
        end: pageNo * pageSize
    };
};
