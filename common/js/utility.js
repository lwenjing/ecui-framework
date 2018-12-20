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
    if (ecui.esr) {
        //统一对请求成功返回参数做分类
        ecui.esr.onparsedata = function (url, data) {
            if (data.data && data.data.pageNo !== undefined && data.data.total === undefined && data.data.offset === undefined) {
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
                return;
            }
            return code;
        };
    }

}());

/**
 * 字符串批量替换
 * @param from
 * @param to
 * @returns {string}
 */
String.prototype.replaceAll = function (from, to) {
    return this.replace(new RegExp(from.replace(/([.?*+^$[\]\\(){}-])/g, "\\$1"), 'g'), to);
};

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
        var fraction = ['角', '分'];
        var digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
        var unit = [['元', '万', '亿'], ['', '拾', '佰', '仟']];
        var head = n < 0 ? '负' : '';
        n = Math.abs(n);

        var s = '';
        var test1 = n.toString().split('.');
        var test2 = '';
        if(test1.length > 1){
            test2 = test1[1];
        }

        for (var i = 0; i < fraction.length; i++) {
            if(Math.floor(n)>0){
                s += (digit[test2.substr(i,1)%10] + fraction[i])
            } else{
                s += (digit[test2.substr(i,1)%10] + fraction[i]).replace(/零./, '');
            }
        }
        if(s=="零角零分"){
            s = '整'
        }
        // s = s || '整';
        n = Math.floor(n);

        for (var i = 0; i < unit[0].length && n > 0; i++) {
            var p = '';
            for (var j = 0; j < unit[1].length && n > 0; j++) {
                p = digit[n % 10] + unit[1][j] + p;
                n = Math.floor(n / 10);
            }
            s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
        }
        return head + s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '');
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
    var hintContainer = ecui.$('hintContainer') || ecui.dom.create({
        id: 'hintContainer',
        className: (ecui.ie < 9 ? 'ie8' : '')
    });
    ecui.dom.removeClass(hintContainer, 'ui-hide');
    hintContainer.innerHTML = ecui.util.stringFormat('<div class="{0}">{1}</div>', className, msg);
    ecui.dom.insertAfter(hintContainer, ecui.dom.last(document.body));
    ecui.util.timer(function () {
        ecui.dom.addClass(hintContainer, 'ui-hide');
    }, 2000);
};

/**
 * 录入表单反显数据
 * @param {object}  data        回填的的数据
 * @param {form}    form        要回填的表格元素
 * @param {Boolean} isDefault   是否要设置为默认值
 */
fapiao.setEditFormValue = function (data, form, isDefault) {
    var elements = form.elements;
    var ignore = [], arr_obj_ignore = [];
    for (var i = 0, item; item = elements[i++];) {
        var name = item.name;
        // 使用ecui.util.parseValue解析数据，处理ecui.esr.CreateObject创建的对象数据的参数回填
        var value = ecui.util.parseValue(name, data);
        if (name && value !== undefined) {
            // 将value转换成字符串，value 为 Array 和 Object 时不转换成字符串
            value = typeof value === 'object' ? value : value + '';
            if (ignore.indexOf(name.split('.')[0]) === -1) {
                var _control = item.getControl && item.getControl();
                if (_control) {
                    if (_control instanceof ecui.ui.Radio) {

                        _control.setChecked(value === _control.getValue());
                    } else if (_control instanceof ecui.ui.Checkbox) {
                        if (value instanceof Array) {
                            _control.setChecked(value.indexOf(+_control.getValue()) !== -1);
                        } else {
                            // 当不是复选的时候 返回的不是数组,是string
                            _control.setChecked(value === _control.getValue());
                        }
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
                        if (_control.setValue) {
                            _control.setValue(value);
                        }
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
                value = value && value.length ? value[dom.toArray(elements[name]).indexOf(item) - 1] : '';
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

        if (isDefault && item.getControl && item.name && item.getControl().saveToDefault) {
            item.getControl().saveToDefault();
        }
    }
};

// 搜索数据回填表单数据
fapiao.setFormValue = function (context, form, searchParm) {
    var elements = form.elements;
    for (var i = 0, item; item = elements[i++];) {
        var name = item.name;
        if (name) {
            if (context[name]) {
                searchParm[name] = context[name];
            }
            var _control = item.getControl && item.getControl();
            if (_control) {
                if (_control instanceof ecui.esr.CreateArray || _control instanceof ecui.esr.CreateObject) {
                    return;
                } else if (_control instanceof ecui.ui.Radio) {
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
    for (var i = 0, item; item = elements[i++];) {
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
    var elements = form.elements;
    for (var i = 0, item; item = elements[i++];) {
        if (item.name) {
            var _control = item.getControl && item.getControl();
            if (_control) {
                if (_control instanceof ecui.esr.CreateArray || _control instanceof ecui.esr.CreateObject) {
                    // 如果是ecui.esr.CreateArray 和 ecui.esr.CreateObject元素，不做任何处理
                } else if (_control instanceof ecui.ui.Radio) {
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
                } else {
                    searchParm[item.name] = _control.getValue();
                }
            } else {
                searchParm[item.name] = item.value;
            }
        }
    }
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
    var textarea = document.createElement("textarea");
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
 * @param {object} route 路由对象
 */
fapiao.TableListRoute = function (route) {
    // if (route.method === 'GET') {
    //     this.model = function (context, callback) {
    //         var params = {},
    //             paramStr = '';
    //         route.url.split('?')[1].split('&').forEach(function (item) {
    //             if (item.indexOf('=') < 0) {
    //                 ecui.esr.parseObject(document.forms[item], params, false);
    //             }
    //         });
    //         for (var key in params) {
    //             if (params.hasOwnProperty(key)) {
    //                 paramStr += '&' + key + '=' + params[key];
    //             }
    //         }
    //         ecui.esr.request(route.NAME.slice(0, -5) + '@GET ' + route.url.split('?')[0] + paramStr.slice(1), function () {
    //             callback();
    //         }, function () {
    //             callback();
    //         });
    //         return false;
    //     };
    // } else {
    //     this.model = [route.NAME.slice(0, -5) + '@FORM ' + route.url];
    // }
    this.model = [route.NAME.slice(0, -5) + '@' + (route.method === 'GET' ? 'GET' : '') + 'FORM ' + route.url];
    this.main = route.NAME.slice(0, -9) + '_table';
    Object.assign(this, route);
};

fapiao.TableListRoute.prototype.onbeforerequest = function (context) {
    context.currentPage = context.currentPage || +this.searchParm.currentPage;
    context.pageSize = context.pageSize || +this.searchParm.pageSize;
    fapiao.setFormValue(context, document.forms[this.model[0].split('?')[1].split('&')[0]], this.searchParm);
};

fapiao.TableListRoute.prototype.onbeforerender = function (context) {
    var data = ecui.util.parseValue(this.model[0].split('@')[0], context);
    var total = data.count || 0;
    var pageSize = data.pageSize || 10;
    var pageNo = context.currentPage || 1;
    if (context.page && context.page.total && context.page.total !== total) {
        pageNo = 1;
        context.currentPage = 1;
    }
    context.page = {
        total: total,
        totalPage: Math.ceil(total / pageSize),
        pageSize: pageSize,
        pageNo: pageNo,
        start: (pageNo - 1) * pageSize + 1,
        end: pageNo * pageSize
    };
};

fapiao.TableListRoute.prototype.onafterrender = function () {
    window.calHeight();
};

window.calHeight = function() {
    if (ecui.get('bill-search-list-table')) {
        var containerHeight = ecui.$('container').offsetHeight;
        var searchHeight = ecui.$('searchConditions').offsetHeight;
        var tableMain = ecui.get('billCommonSearch_table').getMain();
        var listTableContent = ecui.$('tableContainer');
        var narrow = ecui.getScrollNarrow();
        var tableHeight = containerHeight - searchHeight - 55;
        if (tableHeight < 400)
            tableHeight = 400;
        var tableContentHeight = tableHeight - 120;
        tableMain.style.height = tableHeight + 'px';
        if (listTableContent) {
            listTableContent.style.height = tableContentHeight + 'px';
            if (listTableContent.scrollWidth === listTableContent.clientWidth) {
                narrow = 0;
            }
            var tableControl = ecui.get("bill-search-list-table");
            tableControl.setSize(undefined, tableContentHeight - narrow);
            tableControl.resize();
        }
    }
};

window.onresize = function () {
    window.calHeight();
};

/**
 * 列表路由对象。
 * @public
 *
 * @param {object} route 路由对象
 */
fapiao.TableListRoute2 = function (route) {
    this.model = [route.NAME.slice(0, -5) + '@FORM ' + route.url];
    this.main = route.NAME.slice(0, -9) + '_table';
    Object.assign(this, route);
};

fapiao.TableListRoute2.prototype.onbeforerender = function (context) {
    var data = ecui.util.parseValue(this.model[0].split('@')[0], context);
    context.offset = data.offset;
    context.total = data.total;
    context.totalPage = data.totalPage;
};

/**
 * GridButton
 * @type {*|Function|Object|void}
 */
ui.GridButton = ecui.inherits(
    ecui.ui.Button,
    function (el, options) {
        ecui.ui.Button.call(this, el, options);
        this.id = options.id;
        this.gridName = options.gridName;
    },
    {
        onclick: function () {
            var gridframe = ecui.esr.getData(this.gridName);
            if (gridframe.options.checkbox) {
                var all = ecui.get(gridframe.allChecked);
                var rowDatas = [];
                if (all) {
                    all.getDependents().forEach(function (item) {
                            if (item.isChecked()) {
                                rowDatas.push(gridframe.pageData[item.getValue()]);
                            }
                        }
                    );
                }
                gridframe.buttons[this.id].clickAction.call(gridframe, rowDatas)
            } else {
                gridframe.buttons[this.id].clickAction.call(gridframe)
            }
        }
    }
);

/**
 * GridRowButton
 * @type {*|Function|Object|void}
 */
ui.GridRowButton = ecui.inherits(
    ecui.ui.Button,
    function (el, options) {
        ecui.ui.Button.call(this, el, options);
        this.id = options.id;
        this.dataId = options.dataId;
        this.gridName = options.gridName;
    },
    {
        onclick: function () {
            var gridframe = ecui.esr.getData(this.gridName);
            gridframe.rowButtons[this.id].clickAction.call(gridframe, gridframe.pageData[this.dataId]);
        }
    }
);

/**
 * GridRowLink
 * @type {*|Function|Object|void}
 */
ui.GridRowLink = ecui.inherits(
    ecui.ui.Control,
    function (el, options) {
        ecui.ui.Control.call(this, el, options);
        this.dataId = options.dataId;
        this.gridName = options.gridName;
    },
    {
        onclick: function () {
            var gridframe = ecui.esr.getData(this.gridName);
            gridframe.options.rowClick.call(gridframe, gridframe.pageData[this.dataId]);
        }
    }
);

//  日期控件
ui.GridQueryDate = ecui.inherits(
    ecui.ui.CalendarInput,
    function (el, options) {
        ecui.ui.CalendarInput.call(this, el, options);
        this.t1name = options.t1name;
        this.t2name = options.t2name;
    },
    {
        oninput: function () {
            var t1name = ecui.get(this.t1name);
            var t2name = ecui.get(this.t2name);
            fapiao.dateCompare(t1name, t2name);
        }
    }
);

/**
 * 公司段选择，切换责任中心段
 * @type {*|Function|Object|void|h}
 */
ui.GridOrgCombox = ecui.inherits(
    ecui.ui.Select,
    function (el, options) {
        ecui.ui.Select.call(this, el, options);
        this.gridName = options.gridName;
    },
    {
        onchange: function () {
            var val = this.getMain().getControl().getValue(), self = this;
            var gridframe = ecui.esr.getData(self.gridName);
            self.targetName = gridframe.gridOrgCombox.deptName;
            self.target = gridframe.name + gridframe.gridOrgCombox.deptName;
            self.targetUrl = gridframe.gridOrgCombox.deptUrl;
            self.values = gridframe.gridOrgCombox.values;
            self.deptValues = gridframe.gridOrgCombox.deptValues;
            self.deptRequired = gridframe.gridOrgCombox.deptRequired;
            self.idColumn = gridframe.gridOrgCombox.deptIdColumn;
            self.nameColumn = gridframe.gridOrgCombox.deptNameColumn;
            self.targetInput = gridframe.gridOrgCombox.targetInput;
            if (self.targetInput) {
                var targetVal = gridframe[gridframe.gridOrgCombox.orgName][val][gridframe.gridOrgCombox.targetColumn];
                document.forms[gridframe.searchForm][self.targetInput].value = targetVal;
            }
            ecui.esr.request('data@GET ' + this.targetUrl + val, function () {
                var data = ecui.esr.getData('data');
                var options = [];
                if (data) {
                    var allDataArr = [];
                    data.forEach(function (option) {
                        options.push({
                            "value": option[self.idColumn] || option.code,
                            "code": option[self.nameColumn] || option.name
                        });
                        if (self.deptValues) {
                            allDataArr.push(option[self.idColumn] || option.code);
                        }
                    });
                    var allData = allDataArr.join(",");
                    if (self.deptValues) {
                        options.unshift({
                            "value": allData,
                            "code": "全部",
                            "selected": true
                        });
                    } else if (self.deptRequired) {
                        options.unshift({
                            "value": "",
                            "code": "全部",
                            "selected": true
                        });
                    }
                    ecui.esr.setData(self.targetName, allData);
                    ecui.get(self.target).removeAll(true);
                    ecui.get(self.target).add(options);
                    ecui.get(self.target).setValue(allData);
                }
            });
        }
    }
);

/**
 *  网格列表组件。
 * @public
 *
 * @param {Object} options 请求参数
 *
 */
var Gridframe = function (options) {
    this.options = {
        fullHeight: false, // 是否满屏
        initBlank: false, // 是否初始化为空
        checkbox: true, // 是否需要 checkbox
        idColumn: "id", // 行对象主键属性名称
        name: "",// 表单名称
        main: "container", // 渲染目标ID
        method: "FORM", // 请求数据方法
        viewPrefix: "",// target前缀
        searchs: false, // 查询条件
        buttons: null, // 表头按钮
        url: "", // 表单访问 url
        topTips: null,// 表格顶部提示函数,是一个funcation(containId, context){},函数体可以往containId对应 dom 里写入要提示的 html
        searchParm: null, // 初始化查询参数
        columns: [], // 表格熟悉对象数组
        rowClick: function (rowData) { // 行点击事件
            alert(JSON.stringify(rowData));
        },
        initData: null,
        appendRowData: null // 列表后追加数据,和单行数据的格式必须一致，可以是个 data，也可以是 function
    };

    this.pageData = {};
    this.buttons = {};
    this.rowButtons = {};
    this.searchData = {};
    this.searchParm = {};

    this.setOptions(options);
    this.initContain();
};

Gridframe.prototype = {
    setOptions: function (options) {
        var self = this;
        ecui.util.extend(self.options, options);

        if (self.options.searchs) {
            self.searchShow = false;
            self.options.searchs.forEach(function (search) {
                if ("hide" !== search.type) {
                    self.searchShow = true;
                    return;
                }
            });
            self.options.searchs.forEach(function (search) {
                if ("calendar-input" === search.type || "MonthInput" === search.type) {
                    var names = search.name.split(":");
                    if (self.options.searchParm[names[0]]) {
                        self.searchParm[names[0]] = self.options.searchParm[names[0]];
                    } else {
                        self.searchParm[names[0]] = "";
                    }
                    if (names.length > 1) {
                        if (self.options.searchParm[names[1]]) {
                            self.searchParm[names[1]] = self.options.searchParm[names[1]];
                        } else {
                            self.searchParm[names[1]] = "";
                        }
                    }
                } else {
                    if (self.options.searchParm[search.name]) {
                        self.searchParm[search.name] = self.options.searchParm[search.name];
                    } else {
                        self.searchParm[search.name] = "";
                    }
                }
            });
        }

        self.prefix = "";
        self.viewPrefix = "";
        if (self.options.viewPrefix) {
            self.viewPrefix = self.options.viewPrefix + ".";
            self.prefix = self.options.viewPrefix.replaceAll(".", "_");
        }
        self.name = self.prefix + self.options.name;
        self.prefixName = self.viewPrefix + self.options.name;

        // 总 target
        self.gridframe = self.prefixName + "Gridframe";

        // 搜索相关
        self.searchMain = self.name + "SearchContainer";
        self.searchName = self.name + "Search";
        self.searchView = self.prefixName + "SearchView";
        self.searchForm = self.name + "SearchForm";

        // 查询更多相关
        self.seeMoreBtn = self.name + "SeeMoreBtn";
        self.seeMoreContainer = self.name + "SeeMoreContainer";

        // 按钮相关
        self.buttonMain = self.name + "ButtonContainer";
        self.buttonName = self.name + "Button";
        self.buttonView = self.prefixName + "ButtonView";

        // 表格相关
        self.listTableMain = self.name + "TableListContainer";
        self.listTableName = self.name + "TableList";
        self.listTableView = self.prefixName + "TableListView";
        self.topTips = self.name + "TopTips";
        self.listTableContent = self.name + "TableListContent";
        self.listTableWrapper = self.name + "TableListWrapper";
        self.listTableData = self.name + "TableData";
        self.allChecked = self.name + "allChecked";

        self.blankTableName = self.name + "BlankTableList";

        if (self.options.buttons) {
            for (var i = 0; i < self.options.buttons.length; i++) {
                var button = self.options.buttons[i];
                if (self.prefix) {
                    self.buttons[self.prefix + "_" + button.name] = button;
                } else {
                    self.buttons["_" + button.name] = button;
                }
            }
        }

        // 表格总宽度计算
        self.tableWidth = 80;
        self.options.columns.forEach(function (column) {
            self.tableWidth += parseInt(column.width || "120px");
        });
    },
    initContain: function () {
        var self = this, html = [];
        // 路由总控
        html.push("<!-- target: " + self.gridframe + " -->");
        html.push("<div class='stay-list-page gridframe'>");
        if (self.options.searchs) {
            html.push("<div id='" + self.searchMain + "' class='grid-search'></div>");
        }
        if (self.options.buttons) {
            html.push("<div id='" + self.buttonMain + "'></div>");
        }
        if (!!self.options.topTips) {
            html.push("<div id='" + self.topTips + "' class='grid-top-tips'></div>");
        }
        html.push("<div id='" + self.listTableMain + "'></div>");
        html.push("</div>");

        var route = {
            //{if 1}// NAME: self.prefixName,
            //{else}//
            NAME: self.options.name,
            //{/if}//
            main: self.options.main,
            tpl: html.join(""),
            view: self.gridframe,
            onafterrender: function (context) {
                if (self.options.searchs) {
                    ecui.esr.callRoute(self.viewPrefix + self.searchName, true);
                }

                if (self.options.buttons) {
                    ecui.esr.callRoute(self.viewPrefix + self.buttonName, true);
                }

                if (!self.options.searchs) {
                    ecui.esr.callRoute(self.viewPrefix + self.listTableName, true);
                }

                // 将gridfram实例存入当前context
                context[self.name] = self;

                window.onresize = function () {
                    window.calHeight();
                    if (ecui.$(self.listTableMain) && self.options.fullHeight) {
                        self.calcHeight();
                    }
                };
            }
        };

        //{if 1}// ecui.esr.addRoute(self.prefixName, route);
        //{else}//
        ecui.esr.addRoute(self.options.name, route);
        //{/if}//

        if (self.options.searchs) {
            self.initSearch();
        }
        if (self.options.buttons) {
            self.initButton();
        }

        self.initTableList();
        if (!self.searchHide) {
            self.initBlankTable();
        }
    },
    initSearch: function () {
        var self = this, route = {
            NAME: self.searchName,
            main: self.searchMain,
            model: [],
            tpl: function (context) {
                return self.initSearchView.call(self, context);
            },
            view: self.searchView
        };
        self.options.searchs.forEach(function (search) {
            if ("GridOrgCombox" === search.type) {
                if (search.url) {
                    route.model.push(search.orgDataName + "@" + search.url);
                }
                self.gridOrgCombox = search;
            } else if ("Select" === search.type && search.url) {
                route.model.push(search.dataName + "@" + search.url);
            } else if ("MultiSelect" === search.type && search.url) {
                route.model.push(search.dataName + "@" + search.url);
            }
        });
        route.onbeforerender = function (context) {
            self.options.searchs.forEach(function (search) {
                if ("Select" === search.type && !search.url) {
                    context[search.dataName] = search.options;
                }
            });
        };
        route.targetRoute = self.viewPrefix + self.listTableName;

        route.onafterrender = function (context) {
            if (self.searchParm) {
                route.searchParm = self.searchParm;
                fapiao.setFormValue(context, document.forms[self.searchForm], route.searchParm);
                if (self.gridOrgCombox) {
                    ecui.triggerEvent(ecui.get(self.name + self.gridOrgCombox.orgName), 'change');
                }
                if (!self.searchShow) {
                    ecui.dom.addClass(ecui.$(self.searchMain), 'ui-hide');
                } else {
                    self.reRenderSearch.call(self);
                }
            }
            setTimeout(function () {
                if (self.options.initBlank) {
                    ecui.esr.callRoute(self.viewPrefix + self.blankTableName, true);
                } else {
                    ecui.esr.callRoute(self.viewPrefix + self.listTableName, true);
                }
            }, 100);
        };

        //{if 1}// ecui.esr.addRoute(self.viewPrefix + self.searchName, route);
        //{else}//
        ecui.esr.addRoute(self.searchName, route);
        //{/if}//
    },
    reRenderSearch: function () {
        var self = this;
        // 查询条件过多时，换行处理
        var maxWidth = document.querySelector("#" + self.searchMain + " .search-line").offsetWidth - 200;
        var moreSearch = ecui.$(self.seeMoreContainer);
        var searchItems = document.querySelectorAll("#" + self.searchMain + " .search-item");
        var nextLine = [];
        for (var i = 0; i < searchItems.length; i++) {
            var searchItem = searchItems[i];
            var left = searchItem.offsetLeft, width = searchItem.offsetWidth;
            if (left + width > maxWidth) {
                nextLine.push(searchItem);
            }
        }
        if (nextLine.length) {
            var seeMoreSearchBtn = ecui.$(self.seeMoreBtn);
            document.querySelector("#" + self.searchMain + " .search-btn").style.right = "100px";
            ecui.dom.removeClass(seeMoreSearchBtn, 'ui-hide');
            seeMoreSearchBtn.onclick = function () {
                self.seeMore.call(self);
            };
            nextLine.forEach(function (searchItem) {
                moreSearch.appendChild(searchItem);
            });
        }
    },
    initSearchView: function (context) {
        var self = this, searchDom = [];
        searchDom.push('<!-- target: ' + self.searchView + ' -->');
        searchDom.push('<div class="stay-search search-items">');
        searchDom.push('    <form name="' + self.searchForm + '">');
        searchDom.push('        <div class="search_form">');
        searchDom.push('            <div class="search-line">');
        self.options.searchs.forEach(function (search) {
            if ("hide" === search.type) {
                searchDom.push('<input name="' + search.name + '" value="" class="ui-hide"/>');
            } else if ("GridOrgCombox" === search.type) {
                self[search.orgName] = {};
                var allData = "";
                if (search.values) {
                    var allDataArr = [];
                    context[search.orgDataName].forEach(function (option) {
                        var idColumn = search.orgIdColumn || "id";
                        allDataArr.push(option[idColumn] || option.code)
                    });
                    allData = allDataArr.join(",");
                }
                searchDom.push('<div class="search-item">');
                searchDom.push('    <div class="search-label">' + search.orgLabel + '</div>');
                searchDom.push('    <div ui="type:ui.GridOrgCombox;id:' + self.name + search.orgName + ';name:' + search.orgName + ';gridName:' + self.name + '" class="search-input">');

                if (search.values || !search.required) {
                    searchDom.push('<div ui="value:' + allData + ';">全部</div>');
                }
                if (search.values) {
                    context[search.orgName] = allData;
                }
                context[search.orgDataName].forEach(function (option, i) {
                    if (!search.values && search.required && i === 0) {
                        context[search.orgName] = option[search.orgIdColumn];
                    }
                    self[search.orgName][option[search.orgIdColumn]] = option;
                    searchDom.push('<div ui="value:' + option[search.orgIdColumn] + '">' + option[search.orgNameColumn] + '</div>');
                });
                searchDom.push('    </div>');
                searchDom.push('</div>');
                searchDom.push('<div class="search-item">');
                searchDom.push('    <div class="search-label">' + search.deptLabel + '</div>');
                searchDom.push('    <div ui="type:Select;name:' + search.deptName + ';id:' + self.name + search.deptName + '" class="search-input">');
                searchDom.push('        <div ui="value:-1;">全部</div>');
                searchDom.push('    </div>');
                searchDom.push('</div>');
            } else {
                searchDom.push('<div class="search-item">');
                searchDom.push('   <div class="search-label">' + search.label + '</div>');
                var clean = search.clean !== false;
                if ("calendar-input" === search.type) {
                    var names = search.name.split(":");
                    if (names.length > 1) {
                        searchDom.push('<input ui="type:ui.GridQueryDate;clean:' + clean + ';id:' + names[0] + ';name:' + names[0] + ';t1name:' + names[0] + ';t2name:' + names[1] + '" class="search-input" name="' + names[0] + '">');
                        searchDom.push('<span class="span-style">&nbsp;- </span>');
                        searchDom.push('<input ui="type:ui.GridQueryDate;clean:' + clean + ';id:' + names[1] + ';name:' + names[1] + ';t1name:' + names[0] + ';t2name:' + names[1] + '" class="search-input" name="' + names[1] + '">');
                    } else {
                        searchDom.push('<input ui="type:calendar-input;clean:' + clean + ';name:' + names[0] + '" class="search-input" name="' + names[0] + '">');
                    }
                } else if ("MonthInput" === search.type) {
                    var names = search.name.split(":");
                    searchDom.push('<input ui="type:MonthInput;clean:' + clean + ';name:' + names[0] + '" class="search-input" name="' + names[0] + '">');
                    if (names.length > 1) {
                        searchDom.push('<span class="span-style">&nbsp;- </span>');
                        searchDom.push('<input ui="type:MonthInput;clean:' + clean + ';name:' + names[0] + '" class="search-input" name="' + names[1] + '">');
                    }
                } else {
                    searchDom.push('<div ui="type:' + search.type + ';name:' + search.name + '" class="search-input">');
                    if ("Select" === search.type || "MultiSelect" === search.type || "Combox" === search.type) {
                        var allDataArr = [];
                        if (search.values) {
                            context[search.dataName].forEach(function (option) {
                                var idColumn = search.idColumn || "id";
                                allDataArr.push(option[idColumn] || option.code)
                            });
                        }
                        if (!search.required) {
                            var blankTip = search.blankTip || "全部";
                            searchDom.push('<div ui="value:' + allDataArr.join(",") + ';">' + blankTip + '</div>');
                        }
                        if (search.options instanceof Array) {
                            context[search.dataName] = search.options;
                        }
                        context[search.dataName].forEach(function (option, i) {
                            var idColumn = search.idColumn || "id", nameColumn = search.nameColumn || "text";
                            if (search.required && i === 0) {
                                context[search.name] = option[idColumn] || option.code;
                            }
                            searchDom.push('<div ui="value:' + (option[idColumn] || option.code) + ';">' + (option[nameColumn] || option.name) + '</div>');
                        });
                    }
                    searchDom.push('</div>');
                }
                searchDom.push('</div>');
            }
        });

        searchDom.push('            <div class="search-btn" ui="type: CustomQueryButton;" style="margin: 0;">查询</div>');
        searchDom.push('                <div class="search-btn ui-hide" id="' + self.seeMoreBtn + '" style="margin-right:0">更多条件</div>');
        searchDom.push('            </div>');
        searchDom.push('            <div id="' + self.seeMoreContainer + '" class="ui-hide"></div>');
        searchDom.push('       </div>');
        searchDom.push('   </form>');
        searchDom.push('</div>');

        return searchDom.join("");
    },
    initTreeDom: function (doms, tree, column) {
        var self = this;
        if (tree.children && tree.children.length) {
            doms.push('<ul ui="value:' + tree[column.idColumn] + ';text:' + tree[column.nameColumn] + '">');
            doms.push('<div>');
            doms.push('<em class="folder"></em>');
            doms.push('<div>' + tree[column.nameColumn] + '</div>');
            doms.push('</div>');
            tree.children.forEach(function (ctree) {
                self.initTreeDom(doms, ctree, column);
            });
            doms.push('</ul>');
        } else {
            doms.push('<li ui="value:' + tree[column.idColumn] + ';text:' + tree[column.nameColumn] + '" class="ui-checktree-nochildren">');
            doms.push('<em class="folder"></em>');
            doms.push('<span>' + tree[column.nameColumn] + '</span>');
            doms.push('</li>');
        }
    },
    initButton: function () {
        var self = this, route = {
            NAME: self.buttonName,
            main: self.buttonMain,
            tpl: function (context) {
                return self.initButtonView.call(self, context);
            },
            view: self.buttonView
        };

        //{if 1}// ecui.esr.addRoute(self.viewPrefix + self.buttonName, route);
        //{else}//
        ecui.esr.addRoute(self.buttonName, route);
        //{/if}//
    },
    initButtonView: function () {
        var self = this, buttonDom = [], buttons = self.options.buttons;
        buttonDom.push('<!-- target: ' + self.buttonView + ' -->');
        buttonDom.push('<div class="list-button-container">');
        buttonDom.push('<div class="list-header" style="overflow: visible!important;">');
        if (buttons && buttons.length) {
            for (var i = 0; i < buttons.length; i++) {
                var button = buttons[i];
                buttonDom.push("<div class='white-border-btn grid-button' ui='type:ui.GridButton;id:");
                buttonDom.push(self.prefix + "_" + button.name);
                buttonDom.push(";gridName:");
                buttonDom.push(self.name);
                buttonDom.push("'>");
                if (button.image) {
                    buttonDom.push("<img src='" + button.image + "'>");
                }
                buttonDom.push(button.label);
                buttonDom.push("</div>");
            }
        }
        buttonDom.push("</div>");
        buttonDom.push("</div>");
        return buttonDom.join("");
    },
    initTableList: function () {
        var self = this, route = {
            fullHeight: self.options.fullHeight,
            NAME: self.listTableName,
            main: self.listTableMain,
            tpl: function (context) {
                if (self.options.appendRowData) {
                    var appendRowData = self.options.appendRowData;
                    if ('function' === typeof appendRowData) {
                        appendRowData = appendRowData.call(self, self.searchData);
                    }
                    if (appendRowData) {
                        context[self.listTableData].list.push(appendRowData);
                    }
                }
                if (self.options.initData) {
                    context[self.listTableData] = self.options.initData;
                }
                return self.initTableView.call(self, context);
            },
            view: self.listTableView,
            searchParm: self.options.searchParm,
            onbeforerequest: function (context) {
                context.currentPage = context.currentPage || +this.searchParm.currentPage;
                context.pageSize = context.pageSize || +this.searchParm.pageSize;
                document.forms[self.searchForm]["currentPage"].value = context.currentPage;
                document.forms[self.searchForm]["pageSize"].value = context.pageSize;
            },
            onbeforerender: function (context) {
                if (self.options.initData) {
                    context[self.listTableData] = self.options.initData;
                }
                self.searchData = {};
                ecui.esr.parseObject(document.forms[self.searchForm], self.searchData, true);

                if (context[self.listTableData] === undefined) {
                    context[self.listTableData] = {
                        code: "0000",
                        list: []
                    };
                }
                var data = ecui.util.parseValue(self.listTableData, context);
                var total = data.count || 0;
                var pageSize = context.pageSize || 10;
                var pageNo = context.currentPage || 1;
                if (context.page && context.page.total && context.page.total !== total) {
                    pageNo = 1;
                    context.currentPage = 1;
                }

                context.page = {
                    total: total,
                    totalPage: Math.ceil(total / pageSize),
                    pageSize: pageSize,
                    pageNo: pageNo,
                    start: (pageNo - 1) * pageSize + 1,
                    end: pageNo * pageSize
                };

                if (!!self.options.topTips) {
                    var topTips = self.options.topTips.call(self, self.topTips, context);
                    if (topTips) {
                        ecui.$(self.topTips).innerHTML = topTips;
                    }
                }
            },
            onafterrender: function () {
                if (self.options.fullHeight) {
                    self.calcHeight();
                }
            }
        };

        if (self.options.model) {
            route.model = self.options.model;
            if (self.options.url) {
                route.model.push(self.listTableData + '@' + self.options.method + ' ' + self.options.url + "?" + self.searchForm);
            }
        } else {
            if (self.options.url) {
                route.model = [self.listTableData + '@' + self.options.method + ' ' + self.options.url + "?" + self.searchForm];
            }
        }

        //{if 1}// ecui.esr.addRoute(self.viewPrefix + self.listTableName, route);
        //{else}//
        ecui.esr.addRoute(self.listTableName, route);
        //{/if}//
    },
    initBlankTable: function () {
        var self = this, route = {
            fullHeight: self.options.fullHeight,
            NAME: self.blankTableName,
            main: self.listTableMain,
            tpl: function (context) {
                context[self.listTableData] = {
                    code: "0000",
                    list: []
                };
                if (self.options.appendRowData) {
                    var appendRowData = self.options.appendRowData;
                    if ('function' === typeof appendRowData) {
                        appendRowData = appendRowData.call(self, self.searchData);
                    }
                    if (appendRowData) {
                        context[self.listTableData].list.push(appendRowData);
                    }
                }
                return self.initTableView.call(self, context);
            },
            view: self.listTableView,
            searchParm: self.options.searchParm,
            onbeforerequest: function (context) {
                context.currentPage = context.currentPage || +this.searchParm.currentPage;
                context.pageSize = context.pageSize || +this.searchParm.pageSize;
                document.forms[self.searchForm]["currentPage"].value = context.currentPage;
                document.forms[self.searchForm]["pageSize"].value = context.pageSize;
            },
            onbeforerender: function (context) {
                self.searchData = {};
                ecui.esr.parseObject(document.forms[self.searchForm], self.searchData, true);

                var data = ecui.util.parseValue(self.listTableData, context);
                var pageNo = context.currentPage || 1;
                var total = data.count || 0;
                var pageSize = context.pageSize || 10;
                context.page = {
                    total: total,
                    totalPage: Math.ceil(total / pageSize),
                    pageSize: pageSize,
                    pageNo: pageNo,
                    start: (pageNo - 1) * pageSize + 1,
                    end: pageNo * pageSize
                };

                if (!!self.options.topTips) {
                    var topTips = self.options.topTips.call(self, self.topTips, context);
                    if (topTips) {
                        ecui.$(self.topTips).innerHTML = topTips;
                    }
                }
            },
            onafterrender: function () {
                if (self.options.fullHeight) {
                    self.calcHeight();
                }
            }
        };

        if (self.options.model) {
            route.model = self.options.model;
        } else {
            route.model = [];
        }

        //{if 1}// ecui.esr.addRoute(self.viewPrefix + self.blankTableName, route);
        //{else}//
        ecui.esr.addRoute(self.blankTableName, route);
        //{/if}//
    },
    calcHeight: function () {
        var self = this, containerHeight = ecui.$("container").offsetHeight;
        var searchHeight = 0, buttonHeight = 0, topTipsHeight = 0;
        var searchMain = ecui.$(self.searchMain), buttonMain = ecui.$(self.buttonMain), topTips = ecui.$(self.topTips);
        var narrow = ecui.getScrollNarrow();
        var gridTop = ecui.$(self.options.main).offsetTop;
        if ("container" === self.options.main) {
            gridTop = 0;
        }
        containerHeight = containerHeight - gridTop;
        if (searchMain) {
            searchHeight = searchMain.offsetHeight;
        }
        if (buttonMain) {
            buttonHeight = buttonMain.offsetHeight;
        }
        if (topTips) {
            topTipsHeight = topTips.offsetHeight;
        }

        var listTableContent = ecui.$(self.listTableContent);
        var tableHeight = containerHeight - searchHeight - buttonHeight - topTipsHeight - 30;
        if (tableHeight < 400)
            tableHeight = 400;
        var tableContentHeight = tableHeight - 60;
        ecui.$(self.listTableMain).style.height = tableHeight + 'px';
        if (listTableContent) {
            listTableContent.style.height = tableContentHeight + 'px';
            if (listTableContent.scrollWidth === listTableContent.clientWidth) {
                narrow = 0;
            }
            var tableControl = ecui.$(self.listTableWrapper).getControl();
            tableControl.setSize(undefined, tableContentHeight - narrow);
            tableControl.resize();
        }
    },
    initTableView: function (context) {
        var self = this, tableDom = [], operateDom = [];
        self.pageData = {};
        tableDom.push('<!-- target: ' + self.listTableView + ' -->');
        tableDom.push('<div class="list-table-container">');
        tableDom.push('    <div class="table-container" id="' + self.listTableContent + '">');
        tableDom.push('        <div ui="type:table" class="list-table ui-table gridframe-table" id="' + self.listTableWrapper + '">');
        tableDom.push('            <table style="width:' + self.tableWidth + 'px">');
        tableDom.push('                <thead>');
        tableDom.push('                <tr>');
        if (self.options.checkbox) {
            tableDom.push('<th style="width: 40px;">');
            tableDom.push('<div ui="type:label;for:checkbox">');
            tableDom.push('    <div ui="type:checkbox;id:' + self.allChecked + '">');
            tableDom.push('        <input name="mxSelect" type="checkbox">');
            tableDom.push('    </div>');
            tableDom.push('</div>');
            tableDom.push('</th>');
        }
        tableDom.push('<th style="width: 40px;">序号</th>');
        self.options.columns.forEach(function (column) {
            tableDom.push("<th");
            if (column.thClazz) {
                tableDom.push(" class='" + column.thClazz + "'");
            }
            if (column.width) {
                tableDom.push(" style='width:" + column.width + "'");
            } else {
                tableDom.push(" style='width:120px'");
            }
            tableDom.push(">" + column.label + "</th>")
        });
        tableDom.push('                </tr>');
        tableDom.push('                </thead>');
        tableDom.push('                <tbody>');

        if (context[self.listTableData] && context[self.listTableData].list) {
            context[self.listTableData].list.forEach(function (item, index) {
                self.pageData[item[self.options.idColumn]] = item;
                operateDom = [];
                tableDom.push('<tr>');
                if (self.options.checkbox) {
                    tableDom.push('<td>');
                    tableDom.push('<div ui="type:label;for:checkbox">');
                    tableDom.push('    <div ui="type:checkbox;subject:' + self.allChecked + '">');
                    tableDom.push('        <input value="' + item[self.options.idColumn] + '" name="mxSelect" type="checkbox">');
                    tableDom.push('    </div>');
                    tableDom.push('</div>');
                    tableDom.push('</td>');
                }
                tableDom.push('<td>');
                tableDom.push('<span>' + (index + 1) + '</span>');
                tableDom.push('</td>');

                self.options.columns.forEach(function (column) {
                    if (column.operates) {
                        operateDom.push("<td class='operate' style='text-align:left'>");
                        column.operates.forEach(function (operate) {
                            if (self.prefix) {
                                self.rowButtons[self.prefix + "_" + operate.name] = operate;
                            } else {
                                self.rowButtons["_" + operate.name] = operate;
                            }
                            var show = operate.isShow || true;
                            if ('function' === typeof operate.isShow) {
                                show = operate.isShow.call(self, item);
                            }
                            if (show) {
                                operateDom.push("<div class='oprate-btn' ui='type:ui.GridRowButton;id:");
                                operateDom.push(self.prefix + "_" + operate.name);
                                operateDom.push(";gridName:");
                                operateDom.push(self.name);
                                operateDom.push(";dataId:");
                                operateDom.push(item[self.options.idColumn]);
                                operateDom.push("'>");
                                operateDom.push(operate.label);
                                operateDom.push("</div>");
                            }
                        });
                        operateDom.push("</td>")
                    } else {
                        tableDom.push("<td");
                        if (column.align) {
                            tableDom.push(" style='text-align:" + column.align + "'");
                        }
                        tableDom.push(">");
                        if (column.link) {
                            tableDom.push("<a class='row-link' ui='type:ui.GridRowLink;gridName:");
                            tableDom.push(self.name);
                            tableDom.push(";dataId:");
                            tableDom.push(item[self.options.idColumn]);
                            tableDom.push("'>");
                        }
                        if (column.custom) {
                            tableDom.push(column.custom(item))
                        } else {
                            tableDom.push(item[column.column])
                        }
                        if (column.link) {
                            tableDom.push("</a>")
                        }
                        tableDom.push("</td>")
                    }
                });
                if (operateDom && operateDom.length) {
                    tableDom.push(operateDom.join(""));
                }
                tableDom.push('</tr>');
            });
        }
        tableDom.push('                </tbody>');
        tableDom.push('            </table>');
        tableDom.push('        </div>');
        tableDom.push('    </div>');
        tableDom.push('    <!-- use: footer_paging(page=${page}) -->');
        tableDom.push('</div>');

        return tableDom.join("");
    },
    seeMore: function () {
        var self = this, el = ecui.$(self.seeMoreContainer);
        if (ecui.dom.hasClass(el, 'ui-hide')) {
            ecui.$(self.seeMoreBtn).innerHTML = "收起条件";
            ecui.dom.removeClass(el, 'ui-hide');
        } else {
            ecui.$(self.seeMoreBtn).innerHTML = "更多条件";
            ecui.dom.addClass(el, 'ui-hide');
        }

        if (self.options.fullHeight) {
            self.calcHeight();
        }
    },
    reload: function (data) {
        this.options.initData = data;
        ecui.esr.callRoute(this.viewPrefix + this.listTableName, true);
    }
};

fapiao.Gridframe = Gridframe;
fapiao.gridrame = function (options) {
    return new Gridframe(options);
};

var CustomTab = function (options) {
    this.options = {
        name: "",
        main: "container",
        viewPrefix: "",// target前缀
        tabs: [{
            label: "", // tab 显示名称
            id: "", // tabId
            targetRoute: "", // tab 点击目标路由，如果没有，认为innerDom 方法处理内容是往dom 中渲染html
            innerDom: function (id) { // tab内容路由渲染,可以往 id 的 dom 中渲染 route、静态 html

            }
        }, {
            label: "",
            id: "",
            targetRoute: "",
            innerDom: function (id) {

            }
        }]
    };
    this.setOptions(options);
    this.initContain();
};

CustomTab.prototype = {
    setOptions: function (options) {
        var self = this;
        ecui.util.extend(self.options, options);

        self.prefix = "";
        self.viewPrefix = "";
        if (self.options.viewPrefix) {
            self.viewPrefix = self.options.viewPrefix + ".";
            self.prefix = self.options.viewPrefix.replaceAll(".", "_");
        }
        self.name = self.prefix + self.options.name;
        self.prefixName = self.viewPrefix + self.options.name;

        // 总 target
        self.customTab = self.prefixName + "CustomTab";
    },
    initContain: function () {
        var self = this, html = [];
        // 路由总控
        html.push("<!-- target: " + self.customTab + " -->");
        html.push("<div ui='type:tab' class='custom-tab'>");
        for (var i = 0; i < self.options.tabs.length; i++) {
            var tab = self.options.tabs[i];
            html.push("<div");
            if (i === 0) {
                self.firstTab = tab.id;
                html.push(" ui='selected:true'");
            }
            html.push("><strong id='" + tab.id + "'>" + tab.label + "</strong>");
            html.push("<div id='" + self.name + tab.id + "' class='custom-tab-content'></div>");
            html.push("</div>");
        }
        html.push("</div>");

        var route = {
            //{if 1}// NAME: self.prefixName,
            //{else}//
            NAME: self.options.name,
            //{/if}//
            model: [],
            main: self.options.main,
            tpl: html.join(""),
            view: self.customTab,
            onafterrender: function () {
                self.options.tabs.forEach(function (tab) {
                    if (tab.targetRoute) {
                        ecui.$(tab.id).onclick = function () {
                            ecui.esr.callRoute(self.viewPrefix + tab.targetRoute, true);
                        }
                    }
                });

                ecui.$(self.firstTab).click();
            }
        };

        //{if 1}// ecui.esr.addRoute(self.prefixName, route);
        //{else}//
        ecui.esr.addRoute(self.options.name, route);
        //{/if}//

        self.options.tabs.forEach(function (tab) {
            tab.innerDom.call(self, self.name + tab.id, tab.id);
        });
    }
};

fapiao.customTab = function (options) {
    return new CustomTab(options);
};

/**
 * 比较日期
 * */
fapiao.dateCompare = function (oldStartDOM, oldendDOM) {
    var oldStartTime = oldStartDOM.getValue();
    var oldendTime = oldendDOM.getValue();
    if (oldStartTime && oldendTime) {
        if (Number(oldStartTime.replace(/-/g, '')) > Number(oldendTime.replace(/-/g, ''))) {
            oldendDOM.setValue(oldStartTime);
            oldStartDOM.setValue(oldendTime);
        } else {
            oldendDOM.setValue(oldendTime);
            oldStartDOM.setValue(oldStartTime);
        }
    }
};
