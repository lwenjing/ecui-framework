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
        var oldN = n;
        // 判断正负数
        if (n.substr(0, 1) == '-') {
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
        if (oldN.substr(0, 1) == '-') {
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

        if (isDefault && item.getControl && item.name) {
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
    this.model = [route.NAME.slice(0, -5) + '@FORM ' + route.url];
    this.main = route.NAME.slice(0, -9) + '_table';
    Object.assign(this, route);
};

fapiao.TableListRoute.prototype.onbeforerequest = function (context) {
    context.pageNo = context.pageNo || +this.searchParm.pageNo;
    context.pageSize = +this.searchParm.pageSize;
    fapiao.setFormValue(context, document.forms[this.model[0].split('?')[1].split('&')[0]], this.searchParm);
};

fapiao.TableListRoute.prototype.onbeforerender = function (context) {
    var data = ecui.util.parseValue(this.model[0].split('@')[0], context);
    var pageNo = data.currentPage || 1;
    var total = data.count || 0;
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

fapiao.TableListRoute.prototype.onafterrender = function (context) {
    calHeight();
};

function calHeight() {
    var route = ecui.esr.getLocation().split('~')[0];
    if (route === 'query.bill') {
        var containerH = ecui.$('container').offsetHeight;
        var searchConditionsH = ecui.$('searchConditions').offsetHeight;
        var search_table = ecui.$('billSearch_table');
        var tableContainer = ecui.$('tableContainer');
        var billSearch_tableH = containerH - searchConditionsH - 10;
        var tableContainerH = billSearch_tableH - 110;
        search_table.style.height = billSearch_tableH + 'px';
        if (tableContainer) {
            tableContainer.style.height = tableContainerH + 'px';
        }
    }
}

window.onresize = function () {
    calHeight();
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
 *  网格列表组件。
 * @public
 *
 * @param {Object} options 请求参数
 */
fapiao.Gridframe = function (options) {
    this.options = {
        fullHeight: false,
        initBlank: false,
        checkbox: true,
        idColumn: "id",
        name: "",// 表单名称
        searchs: false,
        buttons: null,
        url: "",
        searchParm: null,
        columns: [],
        rowClick: function (rowData) {
            alert(JSON.stringify(rowData));
        }
    };

    this.pageData = {};

    this.setOptions(options);
    this.initContain();
};

fapiao.Gridframe.prototype = {
    setOptions: function (options) {
        var self = this;
        ecui.util.extend(self.options, options);
        this._name = self.options.name.replaceAll(".", "_");

        // 搜索相关
        self.searchMain = self._name + "SearchContainer";
        self.searchName = self.options.name + "Search";
        self.searchView = self._name + "SearchView";
        self.searchForm = self._name + "SearchForm";

        self.buttonMain = self._name + "ButtonContainer";
        self.buttonName = self.options.name + "Button";
        self.buttonView = self._name + "ButtonView";

        self.listTableMain = self._name + "TableListContainer";
        self.listTableName = self.options.name + "TableList";
        self.listTableView = self._name + "TableListView";
        self.listTableContent = self._name + "TableListContent";
        self.listTableData = self._name + "TableData";
    },
    initContain: function () {
        var self = this, html = [];
        // 路由总控
        html.push("<!-- target: gridframe -->");
        html.push("<div class='stay-list-page gridframe'>");
        if (self.options.searchs) {
            html.push("<div id='" + self.searchMain + "'></div>");
        }
        if (self.options.buttons) {
            html.push("<div id='" + self.buttonMain + "'></div>");
        }
        html.push("<div id='" + self.listTableMain + "'></div>");
        html.push("</div>");

        ecui.esr.addRoute(self.options.name, {
            NAME: self.options.name,
            main: "container",
            tpl: html.join(""),
            view: "gridframe",
            onafterrender: function () {
                if (self.options.searchs) {
                    ecui.esr.callRoute(self.searchName, true);
                }
                else {
                    ecui.esr.callRoute(self.listTableName, true);
                }
                if (self.options.buttons) {
                    ecui.esr.callRoute(self.buttonName, true);
                }
            }
        });

        if (self.options.searchs) {
            self.initSearch();
        }
        if (self.options.buttons) {
            self.initButton();
        }

        self.initTableList();

        window.onresize = function () {
            if (self.options.fullHeight) {
                self.calcHeight.call(self);
            }
            self.reRenderSearch.call(self);
        };
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
            if ("Select" === search.type && search.url) {
                route.model.push(search.dataName + "@" + search.url);
            }
        });
        if (self.options.initBlank) {
            route.targetRoute = self.listTableName;
        } else {
            route.children = self.listTableName;
        }
        if (self.options.searchParm) {
            route.searchParm = self.options.searchParm;
            route.onafterrender = function (context) {
                fapiao.setFormValue(context, document.forms[self.searchForm], self.options.searchParm);
                self.reRenderSearch.call(self);
            }
        }
        ecui.esr.addRoute(route.NAME, route);
    },
    reRenderSearch: function () {
        var self = this;
        // 查询条件过多时，换行处理
        var maxWidth = document.getElementsByClassName("search-line")[0].offsetWidth - 200;
        var moreSearch = ecui.$("seeMoreSearchContain");
        var searchItems = document.getElementsByClassName("search-item");
        var nextLine = [];
        for (var i = 0; i < searchItems.length; i++) {
            var searchItem = searchItems[i];
            var left = searchItem.offsetLeft, width = searchItem.offsetWidth;
            if (left + width > maxWidth) {
                nextLine.push(searchItem);
            }
        }
        if (nextLine.length) {
            var seeMoreSearchBtn = ecui.$("seeMoreSearchBtn");
            document.getElementsByClassName("search-btn")[0].style.right = "100px";
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
        searchDom.push('<div class="stay-search search-items" id="' + self.searchView + '">');
        searchDom.push('    <form name="' + self.searchForm + '">');
        searchDom.push('        <div class="search_form">');
        searchDom.push('            <div class="search-line">');
        self.options.searchs.forEach(function (search) {
            if ("hide" === search.type) {
                searchDom.push('<input name="' + search.name + '" value="" class="ui-hide"/>');
            }
            else {
                searchDom.push('<div class="search-item">');
                searchDom.push('   <div class="search-label">' + search.label + '</div>');
                if ("calendar-input" === search.type) {
                    var names = search.name.split(":");
                    searchDom.push('<input ui="type:' + search.type + ';name:' + names[0] + '" class="search-input" name="' + names[0] + '">');
                    if (names.length > 1) {
                        searchDom.push('<span class="span-style">&nbsp;- </span>');
                        searchDom.push('<input ui="type:' + search.type + ';name:' + names[0] + '" class="search-input" name="' + names[1] + '">');
                    }
                } else {
                    searchDom.push('<div ui="type:' + search.type + ';name:' + search.name + '" class="search-input">');
                    if ("Select" === search.type) {
                        searchDom.push('<div ui="value:;">全部</div>');
                        if (search.options instanceof Array) {
                            context[search.dataName] = search.options;
                        }
                        context[search.dataName].forEach(function (option) {
                            searchDom.push('<div ui="value:' + (option.id || option.CODE) + ';">' + (option.text || option.NAME) + '</div>');
                        });
                    }
                    searchDom.push('</div>');
                }
                searchDom.push('</div>');
            }
        });

        if (self.options.initBlank) {
            searchDom.push('            <div class="search-btn" ui="type: CustomQueryButton;" style="margin: 0;">查询</div>');
        } else {
            searchDom.push('            <div class="search-btn" ui="type: QueryButton;" style="margin: 0;">查询</div>');
        }
        searchDom.push('                <div class="search-btn ui-hide" id="seeMoreSearchBtn" style="margin-right:0">更多条件</div>');
        searchDom.push('            </div>');
        searchDom.push('            <div id="seeMoreSearchContain" class="ui-hide"></div>');
        searchDom.push('       </div>');
        searchDom.push('   </form>');
        searchDom.push('</div>');

        return searchDom.join("");
    },
    initButton: function () {
        var self = this, route = {
            NAME: self.buttonName,
            main: self.buttonMain,
            tpl: function (context) {
                return self.initButtonView.call(self, context);
            },
            view: self.buttonView,
            onafterrender: function () {
                if (self.options.buttons) {
                    self.options.buttons.forEach(function (button) {
                        var buttonDoms = document.getElementsByClassName(button.name);
                        for (var i = 0; i < buttonDoms.length; i++) {
                            buttonDoms[i].onclick = function () {
                                if (self.options.checkbox) {
                                    var all = ecui.get('all-checked');
                                    var rowDatas = [];
                                    if (all) {
                                        all.getDependents().forEach(function (item) {
                                                if (item.isChecked()) {
                                                    rowDatas.push(self.pageData[item.getValue()]);
                                                }
                                            }
                                        );
                                    }
                                    button.clickAction.call(this, rowDatas)
                                } else {
                                    button.clickAction.call(this, self)
                                }
                            }
                        }
                    });
                }
            }
        };
        ecui.esr.addRoute(route.NAME, route);
    },
    initButtonView: function () {
        var self = this, buttonDom = [];
        buttonDom.push('<!-- target: ' + self.buttonView + ' -->');
        buttonDom.push('<div class="list-button-container">');
        self.options.buttons.forEach(function (button) {
            buttonDom.push("<div class='blue-btn grid-button ");
            buttonDom.push(button.name);
            buttonDom.push("'>");
            buttonDom.push(button.label);
            buttonDom.push("</div>");
        });
        buttonDom.push("</div>");
        return buttonDom.join("");
    },
    initTableList: function () {
        var self = this, route = {
            fullHeight: self.options.fullHeight,
            NAME: self.listTableName,
            main: self.listTableMain,
            model: [self.listTableData + '@FORM ' + self.options.url + "?" + self.searchForm],
            tpl: function (context) {
                return self.initTableView.call(self, context);
            },
            view: self.listTableView,
            searchParm: self.options.searchParm,
            onbeforerequest: function (context) {
                if (self.options.searchs) {
                    context.pageNo = context.pageNo || +this.searchParm.currentPage;
                    context.pageSize = context.pageSize || +this.searchParm.pageSize;
                    fapiao.setFormValue(context, document.forms[self.searchForm], this.searchParm);
                }
            },
            onbeforerender: function (context) {
                var data = ecui.util.parseValue(self.listTableData, context);
                var pageNo = data.currentPage || 1;
                var total = data.count || 0;
                var pageSize = data.pageSize || 10;
                context.page = {
                    total: total,
                    totalPage: Math.ceil(total / pageSize),
                    pageSize: pageSize,
                    pageNo: pageNo,
                    start: (pageNo - 1) * pageSize + 1,
                    end: pageNo * pageSize
                };
            },
            onafterrender: function (context) {
                if (context.tableWidth > 50) {
                    var gridTable = document.getElementsByClassName("gridframe-table")[0];
                    gridTable.style.minWidth = context.tableWidth + "px";
                    gridTable.style.width = context.tableWidth + "px";
                }
                if (self.options.fullHeight) {
                    self.calcHeight();
                }
                if (self.operates) {
                    self.operates.forEach(function (operate) {
                        var operateDoms = document.getElementsByClassName(operate.name);
                        for (var i = 0; i < operateDoms.length; i++) {
                            var operateDom = operateDoms[i];
                            operateDom.onclick = function () {
                                var id = this.getAttribute("data-id");
                                operate.clickAction.call(self, self.pageData[id], this);
                            }
                        }
                    });
                }
                var linkDoms = document.getElementsByClassName("row-link");
                if (linkDoms.length) {
                    for (var i = 0; i < linkDoms.length; i++) {
                        var linkDom = linkDoms[i];
                        linkDom.onclick = function () {
                            var id = this.getAttribute("data-id");
                            self.options.rowClick.call(self, self.pageData[id], this);
                        }
                    }
                }
            }
        };

        ecui.esr.addRoute(this.listTableName, route);
    },
    calcHeight: function () {
        var self = this, containerHeight = ecui.$('container').offsetHeight;
        var searchHeight = ecui.$(self.searchMain).offsetHeight;
        var buttonHeight = ecui.$(self.buttonMain).offsetHeight;

        var listTableContent = ecui.$(self.listTableView);
        var tableHeight = containerHeight - searchHeight - buttonHeight - 10;
        var tableContentHeight = tableHeight - 60;
        ecui.$(self.listTableMain).style.height = tableHeight + 'px';
        if (listTableContent) {
            listTableContent.style.height = tableContentHeight + 'px';
        }
    },
    initTableView: function (context) {
        var self = this, tableDom = [], operateDom = [], tableWidth = 0;
        self.pageData = {};
        tableDom.push('<!-- target: ' + self.listTableView + ' -->');
        tableDom.push('<div class="list-table-container">');
        tableDom.push('    <div class="table-container" id="' + self.listTableView + '">');
        tableDom.push('        <div class="list-table ui-table gridframe-table">');
        tableDom.push('            <table>');
        tableDom.push('                <thead>');
        tableDom.push('                <tr>');
        tableDom.push('<th style="width: 50px;">');
        if (self.options.checkbox) {
            tableDom.push('<div ui="type:label;for:checkbox">');
            tableDom.push('    <div ui="type:checkbox;id:all-checked;">');
            tableDom.push('        <input name="mxSelect" type="checkbox">');
            tableDom.push('    </div>');
            tableDom.push('    <span>&nbsp;</span>');
            tableDom.push('</div>');
        }
        else {
            tableDom.push('<span>&nbsp;</span>');
        }
        tableDom.push('</th>');
        tableWidth += parseInt("50px");

        self.options.columns.forEach(function (column) {
            tableDom.push("<th");
            if (column.thClazz) {
                tableDom.push(" class='" + column.thClazz + "'");
            }
            if (column.width) {
                tableDom.push(" style='width:" + column.width + "'");
                tableWidth += parseInt(column.width);
            }
            tableDom.push(">" + column.label + "</th>")
        });
        context.tableWidth = tableWidth;
        tableDom.push('                </tr>');
        tableDom.push('                </thead>');
        tableDom.push('                <tbody>');

        if (context[self.listTableData] && context[self.listTableData].list) {
            context[self.listTableData].list.forEach(function (item, index) {
                self.pageData[item[self.options.idColumn]] = item;
                operateDom = [];
                tableDom.push('<tr>');
                tableDom.push('<td>');
                if (self.options.checkbox) {
                    tableDom.push('<div ui="type:label;for:checkbox">');
                    tableDom.push('    <div ui="type:checkbox;subject:all-checked">');
                    tableDom.push('        <input value="' + item[self.options.idColumn] + '" name="mxSelect" type="checkbox">');
                    tableDom.push('    </div>');
                    tableDom.push('    <span>' + (index + 1) + '</span>');
                    tableDom.push('</div>');
                }
                else {
                    tableDom.push('<span>' + (index + 1) + '</span>');
                }
                tableDom.push('</td>');


                self.options.columns.forEach(function (column) {
                    if (column.operates) {
                        if (!self.operates) {
                            self.operates = column.operates;
                        }
                        operateDom.push("<td class='operate' style='text-align:left'>");
                        column.operates.forEach(function (operate) {
                            var show = operate.isShow || true;
                            if ('function' === typeof operate.isShow) {
                                show = operate.isShow.call(self, item);
                            }
                            if (show) {
                                operateDom.push("<div class='oprate-btn " + operate.name);
                                operateDom.push("' data-id='" + item[self.options.idColumn]);
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
                            tableDom.push("<a class='row-link' href='javascript:void(0);' data-id='" + item[self.options.idColumn] + "'>")
                        }
                        if (column.custom) {
                            tableDom.push(column.custom(item))
                        }
                        else {
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
        var self = this, el = ecui.$("seeMoreSearchContain");
        ecui.dom[ecui.dom.hasClass(el, 'ui-hide') ? 'removeClass' : 'addClass'](el, 'ui-hide');
        if (self.options.fullHeight) {
            self.calcHeight();
        }
    },
    reload: function () {
        ecui.esr.callRoute(this.listTableName, true);
    }
};