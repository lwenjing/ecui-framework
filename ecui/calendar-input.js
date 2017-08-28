/*
calendar - 定制日历控件。
定制日历视图控件，继承自基础控件，包含头部展示操作区域、日历展示区域。头部展示操作区域中的四个按钮包含年/月的切换功能，他们继承自button控件。

日历视图控件直接HTML初始化的例子:
<div ui="type:singleCalendar;year:2009;month:11"></div>

属性
_eTitle        - 日历头部信息提示区

子控件属性
_uMonthView    - 继承自日历控件
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    ui.CalendarInput = core.inherits(
        ui.Text,
        'ui-calendar-input',
        function (el, options) {
            var popupEl = dom.create(options.classes.join('-popup ') + 'ui-hide');

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
                '',
                {
                    $dateclick: function (event, date) {
                        ui.Calendar.prototype.$dateclick.call(this, event, date);
                        this.hide();
                        this.getParent().setValue(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate());
                    }
                }
            ),

            $click: function (event) {
                ui.Text.prototype.$click.call(this, event);
                var list = this.getValue().split('-');
                this._uCalendar.setDate(list.length < 3 ? undefined : new Date(+list[0], +list[1] - 1, +list[2]));
            },

            /**
             * 初始化完成后，手动生成日历子控件区域及头部展示信息。
             * @override
             */
            $ready: function (options) {
                ui.Text.prototype.$ready.call(this, options);
                // 获取_uCalendar的部件，并执行初始化方法
                this._uCalendar.setView(options.year, options.month);
            }
        },
        ui.Popup
    );
//{if 0}//
}());
//{/if}//
