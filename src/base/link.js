/*
@example
<div ui="type:link" href="...">首页</div>
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util;
//{/if}//
    var linkElement = dom.create('A'),
        link;

    /**
     * 链接控件。
     * 用来取代A标签，解决A标签不能嵌套的问题。
     * @control
     */
    ui.Link = core.inherits(
        ui.Control,
        'ui-link',
        {
            /**
             * @override
             */
            $click: function (event) {
                ui.Control.prototype.$click.call(this, event);
                // link嵌套只处理最内层
                if (!link) {
                    var href = dom.getAttribute(this.getMain(), 'href');
                    if (href) {
                        linkElement.href = href;
                        location.href = linkElement.href;
                        link = true;
                        util.timer(function () {
                            link = false;
                        });
                    }
                }
            }
        }
    );
}());
