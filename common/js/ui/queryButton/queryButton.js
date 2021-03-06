/*
queryButton - 查询按钮控件。
定制查询按钮控件，继承自button控件

查询按钮控件HTML初始化的例子:
<div ui="type:QueryButton;></div>

*/
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;

    ui.QueryButton = core.inherits(
        ui.Button,
        'ui-query-button',
        function (el, options) {
            ui.Button.call(this, el, options);
            this.route = options.route;
        },
        {
            /**
             * 输入提交事件。
             * @event
             */
            $submit: function (event) {
                event.preventDefault();
            },
            $click: function (event) {
                ui.Button.prototype.$click.call(this, event);
                var children;
                if (this.route) {
                    children = ecui.esr.getRoute(this.route);
                } else {
                    var route = ecui.esr.findRoute(this);
                    children = ecui.esr.getRoute(route.children);
                }
                fapiao.setSearchParam(children.searchParm, this.getForm());
                // children.searchParm.pageNo = 1;
                ecui.esr.callRoute(children.NAME + '~currentPage=1', true);
            }
        }
    );

    ui.CustomQueryButton = core.inherits(
        ui.Button,
        'ui-query-button',
        {
            /**
             * 输入提交事件。
             * @event,billSearch_table
             */
            $submit: function (event) {
                event.preventDefault();
            },
            $click: function (event) {
                ui.Button.prototype.$click.call(this, event);
                var route = ecui.esr.findRoute(this);
                var targetRoute = ecui.esr.getRoute(route.targetRoute);
                fapiao.setSearchParam(targetRoute.searchParm, this.getForm());
                targetRoute.searchParm.pageSize = 20;
                ecui.esr.callRoute(route.targetRoute, true);
            }
        }
    );

}());
