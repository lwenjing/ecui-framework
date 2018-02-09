/*
@example
<ul ui="type:m-list-view">
  <li>单条数据内容</li>
  ...
</ul>

@fields
_eHeader   - 顶部 DOM 元素
_eFooter   - 底部 DOM 元素
*/
//{if 0}//
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
//{/if}//
    /**
     * 移动端列表展示控件。
     * @control
     */
    ui.MListView = core.inherits(
        ui.MScroll,
        'ui-mobile-listview',
        function (el, options) {
            ui.MScroll.call(this, el, options);

            var body = this.getBody();
            this._eHeader = dom.insertBefore(dom.create({className: options.classes.join('-header ')}), body);
            this._eFooter = dom.insertAfter(dom.create({className: options.classes.join('-footer ')}), body);
        },
        {
            /**
             * @override
             */
            $alterItems: function () {
                // 第一次进来使用缓存的数据，第二次进来取实际数据
                var top = this.getHeight() - (this.isReady() ? this.getBody().offsetHeight : this.$$bodyHeight);
                this.setRange(
                    {
                        left: 0,
                        right: 0,
                        top: top,
                        bottom: 0
                    },
                    [top + this.$$footerHeight, 0, -this.$$headerHeight, 0]
                );
            },

            /**
             * @override
             */
            $cache: function (style, cacheSize) {
                ui.MScroll.prototype.$cache.call(this, style, cacheSize);
                var body = this.getBody();
                style = dom.getStyle(body);
                if (ieVersion < 8) {
                    var list = style.padding.split(' ');
                    this.$$bodyPadding = [util.toNumber(list[0])];
                    this.$$bodyPadding[1] = list[1] ? util.toNumber(list[1]) : this.$$bodyPadding[0];
                    this.$$bodyPadding[2] = list[2] ? util.toNumber(list[2]) : this.$$bodyPadding[0];
                    this.$$bodyPadding[3] = list[3] ? util.toNumber(list[3]) : this.$$bodyPadding[1];
                } else {
                    this.$$bodyPadding = [util.toNumber(style.paddingTop), util.toNumber(style.paddingRight), util.toNumber(style.paddingBottom), util.toNumber(style.paddingLeft)];
                }
                this.$$headerHeight = this._eHeader.offsetHeight;
                this.$$footerHeight = this._eFooter.offsetHeight;
                this.$$bodyHeight = body.offsetHeight + this.$$headerHeight + this.$$footerHeight;
            },

            /**
             * @override
             */
            $dispose: function () {
                this._eHeader = this._eFooter = null;
                ui.MScroll.prototype.$dispose.call(this);
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.MScroll.prototype.$initStructure.call(this, width, height);
                var style = this.getBody().style;
                style.paddingTop = (this.$$bodyPadding[0] + this.$$headerHeight) + 'px';
                style.paddingBottom = (this.$$bodyPadding[2] + this.$$footerHeight) + 'px';
            },

            /**
             * @override
             */
            $ready: function (event) {
                ui.MScroll.prototype.$ready.call(this, event);
                this.getBody().style.top = -this.$$headerHeight + 'px';
            },

            /**
             * @override
             */
            $resize: function () {
                ui.MScroll.prototype.$resize.call(this);
                var style = this.getBody().style;
                style.paddingTop = '';
                style.paddingBottom = '';
            },

            /**
             * 获取底部元素。
             * @public
             *
             * @return {Element} 底部 DOM 元素
             */
            getFooter: function () {
                return this._eFooter;
            },

            /**
             * 获取顶部元素。
             * @public
             *
             * @return {Element} 顶部 DOM 元素
             */
            getHeader: function () {
                return this._eHeader;
            }
        },
        ui.Items
    );
//{if 0}//
}());
//{/if}//
