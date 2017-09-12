/*
inputselect - 可输入下拉框,点击下拉箭头出现popup，点击框题其他区域可输入。

*/
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;

    ui.Inputselect = core.inherits(
        ui.Combox,
        'inputselect',
        function (el, options) {
            ui.Combox.call(this, el, options);
            this._eArrow = dom.create(options.classes.join('-arrow '));
            this._eMain.appendChild(this._eArrow);

        },
        {
            $click: function (event) {
                // if (event.target === this._eArrow) {
                    ui.Combox.prototype.$click.call(this, event);
                // }
            }
        }
    );
}());