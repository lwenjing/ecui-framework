(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    ui.MListView = core.inherits(
        ui.MScroll,
        'ui-mobile-listview',
        function (el, options) {
            ui.MScroll.constructor.call(this, el, options);

            var body = this.getBody();
            this._eHead = dom.insertBefore(dom.create({className: options.classes.join('-head ')}), body);
            this._eFoot = dom.insertAfter(dom.create({className: options.classes.join('-foot ')}), body);

            this.$initItems();
        },
        {
            $alterItems: function () {
                var top = this.getHeight() - (this.isReady() ? this.getBody().offsetHeight : this.$$bodyHeight);
                this.setRange(
                    {
                        left: 0,
                        right: 0,
                        top: top,
                        bottom: 0
                    },
                    [top + this.$$paddingBottom, 0, -this.$$paddingTop, 0]
                );
            },
            $cache: function (style, cacheSize) {
                ui.MScroll.prototype.$cache.call(this, style, cacheSize);
                this.$$paddingTop = this._eHead.offsetHeight;
                this.$$paddingBottom = this._eFoot.offsetHeight;
                this.$$bodyHeight = this.getBody().offsetHeight + this.$$paddingTop + this.$$paddingBottom;
            },
            $dispose: function () {
                this._eHead = this._eFoot = null;
                ui.MScroll.prototype.$dispose.call(this);
            },
            $initStructure: function (width, height) {
                ui.MScroll.prototype.$initStructure.call(this, width, height);
                var style = this.getBody().style;
                style.paddingTop = this.$$paddingTop + 'px';
                style.paddingBottom = this.$$paddingBottom + 'px';
            },
            $ready: function (event) {
                ui.MScroll.prototype.$ready.call(this, event);
                this.getBody().style.top = -this.$$paddingTop + 'px';
            },
            $resize: function () {
                ui.MScroll.prototype.$resize.call(this);
                var style = this.getBody().style;
                style.paddingTop = '';
                style.paddingBottom = '';
            },
            getFoot: function () {
                return this._eFoot;
            },
            getHead: function () {
                return this._eHead;
            }
        },
        ui.Items
    );
}());
