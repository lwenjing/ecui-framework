/*
@example
<ul ui="type:m-list-view">
  <li>单条数据内容</li>
  ...
</ul>

@fields
_eHeader   - 顶部 DOM 元素
_eFooter   - 底部 DOM 元素
_sStatus   - 控件当前状态
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
                if (this.isReady()) {
                    this.$$bodyHeight = this.getBody().offsetHeight;
                }
                var top = this.getHeight() - this.$$bodyHeight;
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
             * 拖拽到最底部事件。
             * @event
             */
            $footercomplete: util.blank,

            /**
             * 拖拽到达底部区域事件。
             * @event
             */
            $footerenter: util.blank,

            /**
             * 拖拽离开底部区域事件。
             * @event
             */
            $footerleave: util.blank,

            /**
             * 拖拽到最顶部事件。
             * @event
             */
            $headercomplete: util.blank,

            /**
             * 拖拽到达顶部区域事件。
             * @event
             */
            $headerenter: util.blank,

            /**
             * 拖拽离开顶部区域事件。
             * @event
             */
            $headerleave: util.blank,

            /**
             * @override
             */
            $dragmove: function (event) {
                ui.MScroll.prototype.$dragmove.call(this, event);
                var top = this.getHeight() - this.$$bodyHeight;
                if (event.y < top + this.$$footerHeight) {
                    var status = event.y > top ? 'footerenter' : 'footercomplete';
                } else if (event.y > -this.$$headerHeight) {
                    status = event.y < 0 ? 'headerenter' : 'headercomplete';
                } else {
                    status = '';
                }
                if (this._sStatus && this._sStatus.slice(0, 1) !== status.slice(0, 1)) {
                    core.triggerEvent(this, this._sStatus.slice(0, 6) + 'leave');
                }
                if (this._sStatus !== status) {
                    if (status) {
                        core.triggerEvent(this, status);
                    }
                    this._sStatus = status;
                }
            },

            /**
             * @override
             */
            $dragstart: function (event) {
                ui.MScroll.prototype.$dragstart.call(this, event);
                this._sStatus = '';
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
            },

            /**
             * 获取当前状态。
             * @public
             *
             * @return {string} 当前状态
             */
            getStatus: function () {
                return this._sStatus;
            }
        },
        ui.Items
    );
//{if 0}//
}());
//{/if}//
