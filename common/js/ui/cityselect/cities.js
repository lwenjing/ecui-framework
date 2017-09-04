/*
cities - 地区联动下拉框控件。
地区联动下拉框控件，继承自multilevel-select控件。

多级联动下拉框控件直接HTML初始化的例子:
<div ui="type:cities">
    <select name="province"></select>
    <select name="city"></select>
</div>

*/
(function () {
    var core = ecui,
        ui = core.ui;


    var code,
        key,
        citys,
        item,
        PROVINCE = {},
        CITY = {};
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
    var CITYS = [];
    for (code in  PROVINCE) {
        citys = {
            value: code,
            code: PROVINCE[code],
            children: []
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
                ui.MultilevelSelect.prototype.$ready.call(this, options);
                var province = this.getSelect(0);
                this.setData(CITYS);
                if (options.value && options.value != '') {
                    province.setValue(options.value.slice(0, 2) + '0000');
                    core.triggerEvent(province, 'change');
                    core.addEventListener(province, 'change', provinceChange);
                    this.getSelect(1).setValue(options.value.slice(0, 4) + '00');
                }
            },
            setValue: function (val) {
                this.getSelect(0).setValue(val.slice(0, 2) + '0000');
                this.setOptions(this.getSelect(1), val.slice(0, 2) + '0000');
                this.getSelect(1).setValue(val.slice(0, 4) + '00');
            }
        }
    );
}());
