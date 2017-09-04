/*
multilevel-select - 多级联动下拉框控件。
多级联动下拉框控件，继承自基础控件，内部包含的下拉框能够对指定的数据集合进行多级联动。

多级联动下拉框控件直接HTML初始化的例子:
<div ui="type:multilevel-select">
    <select name="province"></select>
    <select name="city"></select>
</div>

属性
_aSelect - 全部的下拉框控件列表
*/
(function () {
    var core = ecui,
        ui = core.ui;


    var code,
        key,
        citys,
        item,
        DEFAULT = '000000',
        PROVINCE = {"000000": "全部"};
        CITY = {
            "000000": {
                "000000": "全部"
            }
        };
    for (code in daikuan.cities) {
        if (code.slice(2) == '0000') {
            PROVINCE[code] = daikuan.cities[code];
        } else if (code.slice(4) == '00') {
            if (!CITY[code.slice(0, 2) + '0000']) {
                CITY[code.slice(0, 2) + '0000'] = {};
            }
            CITY[code.slice(0, 2) + '0000'][code] = daikuan.cities[code];
        }
    }
    var CITYS = [{
        value: '000000',
        code: '全部',
        children: [{
            value: '000000',
            code: '全部'
        }]
    }];
    for (code in  PROVINCE) {
        citys = {
            value: code,
            code: PROVINCE[code],
            children: [{
                value: code,
                code: '全部'
            }]
        };
        item = CITY[code];
        for (key in item) {
            citys.children.push({
                value: key,
                code: item[key]
            });
        }
        if (citys.children.length  <= 0) {
            delete citys.children;
        }
        CITYS.push(citys);
    }

    function provinceChange() {
        this.getParent().getSelect(1).setValue(this.getValue());
    }
    /**
     * 初始化多级联动下拉框控件。
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Cities = core.inherits(
        ui.MultilevelSelect,
        'ui-cities',
        {
            $ready: function (options) {
                options.value = options.value || '000000';
                ui.MultilevelSelect.prototype.$ready.call(this, options);
                var province = this.getSelect(0);
                this.setData(CITYS);
                province.setValue(options.value.slice(0, 2) + '0000');
                core.triggerEvent(province, 'change');
                core.addEventListener(province, 'change', provinceChange);
                this.getSelect(1).setValue(options.value.slice(0, 4) + '00');
            },
            setValue: function (val) {
                this.getSelect(0).setValue(val.slice(0, 2) + '0000');
                this.setOptions(this.getSelect(1), options.value.slice(0, 2) + '0000');
                this.getSelect(1).setValue(val.slice(0, 4) + '00');
            }
        }
    );
}());
