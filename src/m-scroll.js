(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
//{/if}//
    ui.MScroll = core.inherits(
        ui.Control,
        'ui-mobile-scroll',
        function (el, options) {
            var bodyEl = el;

            el = dom.insertBefore(
                dom.create(
                    {
                        className: el.className,
                        style: {
                            cssText: el.style.cssText
                        }
                    }
                ),
                el
            );
            bodyEl.className = options.classes.join('-body ');
            bodyEl.style.cssText = '';
            el.appendChild(bodyEl);

            ui.Control.constructor.call(this, el, options);

            this.$setBody(bodyEl);
        },
        {
            $activate: function (event) {
                ui.Control.prototype.$activate.call(this, event);

                var body = this.getBody();

                core.drag(
                    this,
                    event,
                    {
                        el: body,
                        x: body.offsetLeft,
                        y: body.offsetTop,
                        absolute: true,
                        left: this._nLeft !== undefined ? this._nLeft : body.offsetLeft,
                        right: this._nRight !== undefined ? this._nRight : body.offsetLeft,
                        top: this._nTop !== undefined ? this._nTop : body.offsetTop,
                        bottom: this._nBottom !== undefined ? this._nBottom : body.offsetTop,
                        limit: this._oNormal
                    }
                );
            },
            $dragmove: function (event) {
                ui.Control.prototype.$dragmove.call(this, event);
                var style = this.getBody().style;
                style.left = event.x + 'px';
                style.top = event.y + 'px';
                event.preventDefault();
            },
            $dragstart: function (event) {
                ui.Control.prototype.$dragstart.call(this, event);
                event.preventDefault();
            },
            setRange: function (scroll, normal) {
                this._nLeft = scroll.left;
                this._nTop = scroll.top;
                this._nRight = scroll.right;
                this._nBottom = scroll.bottom;
                this._oNormal = normal;
            }
        }
    );
}());
