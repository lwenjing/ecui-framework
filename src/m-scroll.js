/*
滚动操作集合。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    var namedMap = {};

    /**
     * 移动端滚动控件。
     * 移动端 scroll 存在惯性，对 onscroll 直接监听的方式无法很好的实现动画效果，本控件提供对移动端滚动事件的封装。
     * @control
     */
    ui.MScroll = {
        NAME: '$MScroll',

        constructor: function (el, options) {
            var bodyEl = dom.create(
                    {
                        className: options.classes.join('-body ') + 'ui-mobile-scroll-body'
                    }
                );

            for (; el.firstChild; ) {
                bodyEl.appendChild(el.firstChild);
            }

            dom.addClass(el, 'ui-mobile-scroll');
            el.appendChild(bodyEl);
            this.$setBody(bodyEl);

            namedMap[this.getUID()] = {};
        },

        Methods: {
            /**
             * @override
             */
            $activate: function (event) {
                this.$MScroll.$activate.call(this, event);

                var body = this.getBody(),
                    data = namedMap[this.getUID()];

                core.drag(
                    this,
                    event,
                    {
                        el: body,
                        inertia: 0.5,
                        absolute: true,
                        left: data.left !== undefined ? data.left : this.getWidth() - body.offsetWidth,
                        right: data.right !== undefined ? data.right : 0,
                        top: data.top !== undefined ? data.top : this.getHeight() - body.offsetHeight,
                        bottom: data.bottom !== undefined ? data.bottom : 0,
                        limit: data.range
                    }
                );
            },

            /**
             * @override
             */
            $dragend: function (event) {
                this.$MScroll.$dragend.call(this, event);
                namedMap[this.getUID()].scrolling = false;
            },

            /**
             * @override
             */
            $dragmove: function (event) {
                this.$MScroll.$dragmove.call(this, event);
                var style = this.getBody().style;
                style.left = event.x + 'px';
                style.top = event.y + 'px';
                event.preventDefault();
            },

            /**
             * @override
             */
            $dragstart: function (event) {
                this.$MScroll.$dragstart.call(this, event);
                namedMap[this.getUID()].scrolling = true;
                event.preventDefault();
            },

            /**
             * 获取正常显示范围，用于拖拽结束后归位设置。
             * @public
             *
             * @return {Array} 正常显示范围
             */
            getRange: function () {
                return namedMap[this.getUID()].range;
            },

            /**
             * @override
             */
            getX: function () {
                return this.getBody().offsetLeft;
            },

            /**
             * @override
             */
            getY: function () {
                return this.getBody().offsetTop;
            },

            /**
             * 是否正在滚动。
             * @public
             *
             * @return {boolean} 是否正在滚动
             */
            isScrolling: function () {
                return !!namedMap[this.getUID()].scrolling;
            },

            /**
             * 设置滚动范围。
             * @public
             *
             * @param {Object} range 允许滚动的范围
             */
            setScrollRange: function (range) {
                var data = namedMap[this.getUID()];
                data.left = range.left;
                data.top = range.top;
                data.right = range.right;
                data.bottom = range.bottom;
            },

            /**
             * 设置正常显示范围，用于拖拽结束后归位。
             * @public
             *
             * @param {Object} range 正常显示范围
             */
            setRange: function (range) {
                namedMap[this.getUID()].range = range;
            }
        }
    };
}());
