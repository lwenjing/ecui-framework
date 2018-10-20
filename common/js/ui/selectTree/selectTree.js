
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui;
    ui.SelectTree = ecui.inherits(
        ui.TreeView,
        function (el, options) {
            ui.TreeView.call(this, el, options);
            this._sValue = options.value;
        },
        {
            getValue: function () {
                return this._sValue;
            },
            onnodeclick: function (event) {
                if ('string' === typeof this._sValue) {
                    this.getRoot().getParent().getParent().setSelected(this);
                    this.getRoot().getParent().hide();
                }
            }
        }
    );

    function refresh(combox) {
        var text = ui.Select.prototype.getValue.call(combox),
            el = combox._uOptions.getMain();

        dom.children(el).forEach(function (item, index) {
            if (index > 1) {
                core.dispose(item);
                dom.remove(item);
            }
        });

        if (text) {
            dom.first(el).getControl().hide();
            for (var i = 0, tree = [dom.first(el).getControl()], node; node = tree[i++]; ) {
                Array.prototype.push.apply(tree, node.getChildren());
            }
            var html = [];
            tree.forEach(function (item) {
                var value = item.getValue() || '',
                    content = item.getContent();
                if ((value && value.indexOf(text) >= 0) || content.indexOf(text) >= 0) {
                    html.push('<div ui="type:ecui.ui.TreeSelectItem;value:' + value + '">' + content + '</div>');
                }
            });
            dom.insertHTML(el, 'BeforeEnd', html.join(''));
            // core.init(el); // 做好TreeSelectItem后再取消注释
        } else {
            dom.first(el).getControl().show();
        }
    }
    ui.TreeCombox = core.inherits(
        ui.InputControl,
        function (el, options) {
            var popupEl = dom.remove(dom.first(el));
            dom.addClass(popupEl, 'ui-popup ui-hide');
            ui.InputControl.call(this, el, options);
            this.setPopup(this._uOptions = core.$fastCreate(ui.Control, popupEl, this));
        },
        {
            /**
             * @override
             */
            onclick: function (event) {
                if (this._uOptions.isShow()) {
                    event.preventDefault();
                }
            },

            onblur: function () {
                this._uOptions.hide();
            },

            getValue: function () {
                return this._oSelected ? this._oSelected.getValue() : '';
            },

            /**
             * @override
             */
            oninput: function (event) {
                this._uOptions.show();

                for (var i = 0, tree = [dom.first(this._uOptions.getMain()).getControl()], node; node = tree[i++]; ) {
                    Array.prototype.push.apply(tree, node.getChildren());
                }
                var text = ui.InputControl.prototype.getValue.call(this),
                    selected;

                tree.forEach(function (item) {
                    if (item.getContent() === text) {
                        selected = item;
                    }
                });

                if (selected) {
                    this.setSelected(selected);
                } else {
                    refresh(this);
                }
                this.alterStatus(text ? '-placeholder' : '+placeholder');
            },

            setSelected: function (treenode) {
                this.$setValue(treenode.getContent());
                this._oSelected = treenode;
                refresh(this);
            }
        },
        ui.Popup
    );
    ui.TreeSelectItem = core.inherits(
        ui.Control,
        'ui-combox-item',
        function (el, options) {
            ui.Control.call(this, el, options);
            this._sValue = options.value === undefined ? dom.getText(el) : String(options.value);
        },
        {
            /**
             * @override
             */
            $click: function (event) {
                ui.Control.prototype.$click.call(this, event);
                var parent = this.getParent().getParent();
                ui.TreeCombox.prototype.oninput.call(parent, event);
                parent._uOptions.hide();
                if (this._cSelected !== this) {
                    parent.setSelected(this);
                    core.dispatchEvent(parent, 'change', event);
                }
            },

            /**
             * 获取选项的值。
             * getValue 方法返回选项控件的值，即选项选中时整个下拉框控件的值。
             * @public
             *
             * @return {string} 选项的值
             */
            getValue: function () {
                return this._sValue;
            },

            /**
             * 设置选项的值。
             * setValue 方法设置选项控件的值，即选项选中时整个下拉框控件的值。
             * @public
             *
             * @param {string} value 选项的值
             */
            setValue: function (value) {
                var parent = this.getParent().getParent();
                this._sValue = value;
                if (parent && this === parent._oSelected) {
                    // 当前被选中项的值发生变更需要同步更新控件的值
                    ui.InputControl.prototype.setValue.call(parent, value);
                }
            }
        }
    );
}());