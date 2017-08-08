/*
calendar - 定制日历控件。
定制日历视图控件，继承自基础控件，包含头部展示操作区域、日历展示区域。头部展示操作区域中的四个按钮包含年/月的切换功能，他们继承自button控件。

日历视图控件直接HTML初始化的例子:
<div ui="type:calendar;year:2009;month:11"></div>

属性
_eTitle        - 日历头部信息提示区

子控件属性
_uMonthView    - 继承自日历控件
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//

    ui.Calendar = core.inherits(
        ui.Control,
        'ui-calendar',
        function (el, options) {
            ui.Control.constructor.call(this, el, options);
            // 用于拼接头部按钮类名，及驼峰命名化按钮的构造函数
            var btnStorage = [
                '-prev-year',
                '-prev-month',
                '-next-month',
                '-next-year'
            ];
            // 生成日历控件结构
            dom.insertHTML(
                el,
                'afterbegin',
                '<div class="calendar-header">' +
                    '<div class="calendar-title"></div>' +
                    '<div class="' + btnStorage[0].substring(1) + '">&lt;&lt;</div>' +
                    '<div class="' + btnStorage[1].substring(1) + '">&lt;</div>' +
                    '<div class="' + btnStorage[2].substring(1) + '">&gt;</div>' +
                    '<div class="' + btnStorage[3].substring(1) + '">&gt;&gt;</div>' +
                '</div>' +
                '<div class="calendar-view"></div>'
            );
            // 获取el所有直属节点
            var caleChildren = dom.children(el);
            // 获取头部展示区节点eBtnList[0],及头部所有按钮节点eBtnList.slice(1);
            var eBtnList = dom.children(caleChildren[0]);
            // 定义头部展示区
            this._eTitle = eBtnList[0];
            // 快速生成按钮控件
            for (var i = 1; i < 5; i++) {
                core.$fastCreate(this[util.toCamelCase(btnStorage[i - 1])], eBtnList[i], this);
            }
            // 获取日历节点
            var eMonthView = caleChildren[1];
            // 创建一个子日历控件
            this._uMonthView = core.$fastCreate(this.MonthView, eMonthView, this);
        },
        {
            /**
             * 控件头部展示格式。
             */
            TITLEFORMAT: '{0}年{1}月',
            /**
             * 控件主题-日历部件。
             * @public
             */
            MonthView: core.inherits(
                ui.MonthView,
                '',
                {
                    /**
                     * @override
                     */
                    $change: function (event) {
                        ui.MonthView.prototype.$change.call(this, event);
                        var parent = this.getParent();
                        parent._eTitle.innerHTML = util.stringFormat(
                            parent.TITLEFORMAT,
                            this.getYear(),
                            this.getMonth()
                        );
                    }
                }
            ),
            /**
             * 控件头部展示区域“上一年按钮”部件。
             * @public
             */
            PrevYear: core.inherits(
                ui.Button,
                '',
                {
                    $click: function () {
                        var parent = this.getParent();
                        parent._uMonthView.move(-12);
                    }
                }
            ),
            /**
             * 控件头部展示区域“下一年按钮”部件。
             * @public
             */
            NextYear: core.inherits(
                ui.Button,
                '',
                {
                    $click: function () {
                        var parent = this.getParent();
                        parent._uMonthView.move(12);
                    }
                }
            ),
            /**
             * 控件头部展示区域“上一月按钮”部件。
             * @public
             */
            PrevMonth: core.inherits(
                ui.Button,
                '',
                {
                    $click: function () {
                        var parent = this.getParent();
                        parent._uMonthView.move(-1);
                    }
                }
            ),
            /**
             * 控件头部展示区域“下一月按钮”部件。
             * @public
             */
            NextMonth: core.inherits(
                ui.Button,
                '',
                {
                    $click: function () {
                        var parent = this.getParent();
                        parent._uMonthView.move(1);
                    }
                }
            ),
            $dispose: function () {
                this._eTitle = null;
                ui.Control.prototype.$dispose.call(this);
            },
            /**
             * 初始化完成后，手动生成日历子控件区域及头部展示信息。
             * @override
             */
            $ready: function (options) {
                ui.Control.prototype.$ready.call(this, options);
                // 因通过$fastCreate生成的子组件不会自行初始化
                this._uMonthView.setView(options.year, options.month);
            },
            /**
             * 设置当前选择的日期，切换到对应的月份，并修改头部展示信息。
             * @public
             *
             * @param {Date} date 日期
             */
            setDate: function (date) {
                this._uMonthView.setDate(date);
                this.resetTitle();
            },
            /**
             * 获取当前选择的日期。
             * @public
             *
             * @return {Date} 日期对象
             */
            getDate: function () {
                return this._uMonthView.getDate();
            }
        }
    );
//{if 0}//
}());
//{/if}//
