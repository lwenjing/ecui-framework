/*
calendar - 日历输入框控件。
日历输入框控件，继承自文本输入框控件，提供日期的选择输入功能。

日历视图控件直接HTML初始化的例子:
<div ui="type:calendar-input"></div>

属性
_eTitle        - 日历头部信息提示区

子控件属性
_uCalendar     - 日历控件
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    /**
     * 初始化日历输入框控件。
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.CalendarInput = core.inherits(
        ui.Text,
        'ui-calendar-input',
        function (el, options) {
            var popupEl = dom.create(this.Calendar.CLASS + 'ui-hide');

            ui.InputControl.call(this, el, options);

            this.getInput().readOnly = true;

            this._uCalendar = core.$fastCreate(this.Calendar, popupEl, this);
            this.setPopup(this._uCalendar);
        },
        {
            /**
             * 控件主题-日历部件。
             * @public
             */
            Calendar: core.inherits(
                ui.Calendar,
                {
                    /**
                     * @override
                     */
                    $dateclick: function (event, date) {
                        ui.Calendar.prototype.$dateclick.call(this, event, date);
                        this.hide();
                        this.getParent().setValue(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate());
                    },

                    /**
                     * @override
                     */
                    $show: function (event) {
                        ui.Calendar.prototype.$show.call(this, event);
                        var list = this.getParent().getValue().split('-');
                        this.setDate(list.length < 3 ? undefined : new Date(+list[0], +list[1] - 1, +list[2]));
                    }
                }
            )
        },
        ui.Popup
    );
//{if 0}//
}());
//{/if}//
