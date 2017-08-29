/*
Item/Items - 定义选项操作相关的基本操作。
选项控件，继承自基础控件，用于弹出菜单、下拉框、交换框等控件的单个选项，通常不直接初始化。选项控件必须用在使用选项组接口(Items)的控件中。
选项组不是控件，是一组对选项进行操作的方法的集合，提供了基本的增/删操作，通过将 ecui.ui.Items 对象下的方法复制到类的 prototype 属性下继承接口，最终对象要正常使用还需要在类构造器中调用 $initItems 方法。
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        eventNames = ['mousedown', 'mouseover', 'mousemove', 'mouseout', 'mouseup', 'click', 'dblclick', 'focus', 'blur', 'activate', 'deactivate', 'keydown', 'keypress', 'keyup', 'mousewheel'];
//{/if}//
    /**
     * 选项控件交互处理。
     * @private
     *
     * @param {Event} 事件对象
     */
    function onitem(event) {
        var parent = this.getParent();

        ui.Control.prototype['$' + event.type].call(this, event);

        if (parent) {
            core.triggerEvent(parent, 'item' + event.type.replace('mouse', ''), event, this);
        }
    }

    var namedMap = {};

    /**
     * 初始化选项控件。
     * @public
     *
     * @param {string|Object} options 对象
     */
    ui.Item = core.inherits(
        ui.Control,
        'ui-item'
    );

    ui.Items = {
        '': '$Items',

        /**
         * 选项组只允许添加选项控件，添加成功后会自动调用 alterItems 方法。
         * @override
         */
        $append: function (child) {
            // 检查待新增的控件是否为选项控件
            if (!(child instanceof (this.Item || ui.Item)) || this.$Items.$append.call(this, child) === false) {
                return false;
            }
            namedMap[this.getUID()].push(child);
            this.alterItems();
        },

        /**
         * @override
         */
        $cache: function (style, cacheSize) {
            this.$Items.$cache.call(this, style, cacheSize);

            namedMap[this.getUID()].forEach(function (item) {
                item.cache(true, true);
            });
        },

        /**
         * @override
         */
        $dispose: function () {
            delete namedMap[this.getUID()];
            this.$Items.$dispose.call(this);
        },

        /**
         * 初始化选项组对应的内部元素对象。
         * 选项组假设选项的主元素在内部元素中，因此实现了 Items 接口的类在初始化时需要调用 $initItems 方法自动生成选项控件，$initItems 方法内部保证一个控件对象只允许被调用一次，多次的调用无效。
         * @protected
         */
        $initItems: function () {
            (namedMap[this.getUID()] = []).preventCount = 0;

            // 防止因为选项变化引起重复刷新，以及防止控件进行多次初始化操作
            this.$initItems = util.blank;
            this.preventAlterItems();

            // 初始化选项控件
            dom.children(this.getBody()).forEach(function (item) {
                this.add(item);
            }, this);

            this.premitAlterItems();
        },

        /**
         * 选项组移除子选项后会自动调用 alterItems 方法。
         * @override
         */
        $remove: function (child) {
            core.$clearState(child);
            this.$Items.$remove.call(this, child);
            util.remove(namedMap[this.getUID()], child);
            this.alterItems();
        },

        /**
         * 添加子选项控件。
         * add 方法中如果位置序号不合法，子选项控件将添加在末尾的位置。
         * @public
         *
         * @param {string|HTMLElement|ecui.ui.Item} item 控件的 html 内容/控件对应的主元素对象/选项控件
         * @param {number} index 子选项控件需要添加的位置序号
         * @param {Object} options 子控件初始化选项
         * @return {ecui.ui.Item} 子选项控件
         */
        add: function (item, index, options) {
            var list = namedMap[this.getUID()],
                el;

            this.preventAlterItems();

            if (!(item instanceof ui.Item)) {
                // 根据是字符串还是Element对象选择不同的初始化方式
                if ('string' === typeof item) {
                    this.getBody().appendChild(el = dom.create());
                    el.innerHTML = item;
                    item = el;
                }

                var UIClass = this.Item || ui.Item;
                item.className += UIClass.CLASS;

                options = options || core.getOptions(item) || {};
                options.parent = this;
                item = core.$fastCreate(UIClass, item, this, options);
            }

            // 选项控件，直接添加
            item.setParent(this);

            // 改变选项控件的位置
            if (item.getParent()) {
                el = item.getOuter();
                util.remove(list, item);
                if (list[index]) {
                    dom.insertBefore(el, list[index].getOuter());
                    list.splice(index, 0, item);
                } else {
                    dom.getParent(el).appendChild(el);
                    list.push(item);
                }
            }

            this.premitAlterItems();
            this.alterItems();

            return item;
        },

        /**
         * 选项控件发生变化的处理。
         * @public
         */
        alterItems: function () {
            if (!namedMap[this.getUID()].preventCount) {
                this.$alterItems();
            }
        },

        /**
         * 向选项组最后添加子选项控件。
         * append 方法是 add 方法去掉第二个 index 参数的版本。
         * @public
         *
         * @param {string|Element|ecui.ui.Item|Array} item 控件的 html 内容/控件对应的主元素对象/选项控件/选项控件组
         * @param {Object|Array} 子控件初始化选项，如果 item 是数组，options 也必须是数组一一对应
         * @return {ecui.ui.Item} 子选项控件
         */
        append: function (item, options) {
            if (item instanceof Array) {
                this.preventAlterItems();
                item.forEach(function (item, index) {
                    this.add(item, null, options[index]);
                }, this);
                this.premitAlterItems();
                this.alterItems();
            } else {
                this.add(item, null, options);
            }
        },

        /**
         * 获取全部的子选项控件。
         * @public
         *
         * @return {Array} 子选项控件数组
         */
        getItems: function () {
            return namedMap[this.getUID()].slice();
        },

        /**
         * @override
         */
        init: function (options) {
            this.$Items.init.call(this, options);
            this.alterItems();
        },

        /**
         * 允许执行 alterItems 方法，针对多次阻止，需要全部 premitAlterItems 后才执行 alterItems 方法。
         * @public
         */
        premitAlterItems: function () {
            namedMap[this.getUID()].preventCount--;
        },

        /**
         * 阻止执行 alterItems 方法，针对多次阻止，需要全部 premitAlterItems 后才执行 alterItems 方法。
         * @public
         */
        preventAlterItems: function () {
            namedMap[this.getUID()].preventCount++;
        },

        /**
         * 移除子选项控件。
         * @public
         *
         * @param {number|ecui.ui.Item} item 选项控件的位置序号/选项控件
         * @return {ecui.ui.Item} 被移除的子选项控件
         */
        remove: function (item) {
            if ('number' === typeof item) {
                item = namedMap[this.getUID()][item];
            }
            if (item) {
                item.setParent();
            }
            return item || null;
        },

        /**
         * 移除所有子选项控件。
         * @public
         *
         * @param {boolean} dispose 选项控件是否在移除过程中自动释放
         */
        removeAll: function (dispose) {
            this.preventAlterItems();
            this.getItems().forEach(function (item) {
                this.remove(item);
                if (dispose) {
                    item.dispose();
                }
            }, this);
            this.premitAlterItems();
            this.alterItems();
        },

        /**
         * 设置控件内所有子选项控件的大小。
         * @public
         *
         * @param {number} itemWidth 子选项控件的宽度
         * @param {number} itemHeight 子选项控件的高度
         */
        setItemSize: function (itemWidth, itemHeight) {
            namedMap[this.getUID()].forEach(function (item) {
                item.cache();
            });
            namedMap[this.getUID()].forEach(function (item) {
                item.$setSize(itemWidth, itemHeight);
            });
        }
    };

    eventNames.every(function (item, index) {
        ui.Item.prototype['$' + item] = onitem;
        return index < 6;
    });
}());
