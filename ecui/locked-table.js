/*
LockedTable - 定义允许左右锁定若干列显示的高级表格的基本操作。
允许锁定左右两列的高级表格控件，继承自表格控件，内部包含两个部件——锁定的表头区(基础控件)与锁定的行内容区(基础控件)。

锁定列高级表格控件直接HTML初始化的例子:
<div ecui="type:locked-table;left-lock:2;right-lock:1">
    <table>
        <!-- 当前节点的列定义，如果有特殊格式，需要使用width样式 -->
        <thead>
            <tr>
                <th>标题</th>
                ...
            </tr>
        </thead>
        <tbody>
            <!-- 这里放单元格序列 -->
            <tr>
                <td>单元格一</td>
                ...
            </tr>
            ...
        </tbody>
    </table>
</div>

属性
_nLeft       - 最左部未锁定列的序号
_nRight      - 最右部未锁定列的后续序号，即未锁定的列序号+1
_uLockedHead - 锁定的表头区
_uLockedMain - 锁定的行内容区

表格行与锁定行属性
_eFill       - 用于控制中部宽度的单元格
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
     * 建立锁定行控件。
     * @private
     *
     * @param {HTMLElement} el 锁定行的 Element 元素
     * @param {ecui.ui.Table.Row} row 表格基本行控件
     */
    function createLockedRow(el, row) {
        core.$bind(el, row);
        row._eFill = el.lastChild;
    }

    /**
     * 拆分行内的单元格到锁定列或基本列中。
     * @private
     *
     * @param {ecui.ui.LockedTable.LockedHead|ecui.ui.LockedTable.LockedRow} locked 锁定表头控件或者锁定行控件
     */
    function splitRow(locked) {
        var i = 0,
            table = locked.getParent(),
            cols = table.getHCells(),
            list = locked.$getElements(),
            baseBody = locked.getBody(),
            lockedBody = dom.getParent(locked._eFill),
            el = lockedBody.firstChild,
            o;

        for (; cols[i]; ) {
            if (i === table._nLeft) {
                el = baseBody.firstChild;
            }
            if (o = list[i++]) {
                if (el !== o) {
                    (i <= table._nLeft || i > table._nRight ? lockedBody : baseBody).insertBefore(o, el);
                } else {
                    el = el.nextSibling;
                }
            }
            if (i === table._nRight) {
                el = locked._eFill.nextSibling;
            }
        }
    }

    /**
     * 初始化高级表格控件。
     * options 对象支持的属性如下：
     * left-lock  左边需要锁定的列数
     * right-lock 右边需要锁定的列数
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.LockedTable = core.inherits(
        ui.Table,
        'ui-locked-table',
        function (el, options) {
            ui.Table.constructor.call(this, el, options);

            var i = 0,
                type = this.getType(),
                headRows = this._aHeadRows,
                rows = headRows.concat(this._aRows),
                lockedEl = dom.create(),
                list = [],
                o;

            lockedEl.style.cssText = 'position:absolute;top:0px;left:0px;overflow:hidden';

            this._nLeft = options.leftLock || 0;
            this._nRight = this.getColumnCount() - (options.rightLock || 0);

            for (; el = rows[i]; ) {
                el = el.getMain();
                list[i++] = '<tr class="' + el.className + '" style="' + el.style.cssText + '"><td style="padding:0px;border:0px"></td></tr>';
            }

            lockedEl.innerHTML = '<div class="' + type + '-head"><div style="white-space:nowrap;position:absolute"><table cellspacing="0"><thead>' + list.splice(0, headRows.length).join('') + '</thead></table></div></div><div class="' + type + '-layout" style="position:relative;overflow:hidden"><div style="white-space:nowrap;position:absolute;top:0px;left:0px"><table cellspacing="0"><tbody>' + list.join('') + '</tbody></table></div></div>';

            // 初始化锁定的表头区域，以下使用 list 表示临时变量
            o = this._uLockedHead = core.$fastCreate(ui.Control, lockedEl.firstChild, this);
            o.$setBody(el = o.getMain().lastChild.lastChild.firstChild);

            for (i = 0, list = dom.children(el); o = list[i]; ) {
                createLockedRow(o, headRows[i++]);
            }

            o = this._uLockedMain = core.$fastCreate(ui.Control, el = lockedEl.lastChild, this);
            o.$setBody(el = el.lastChild.lastChild.lastChild);

            for (i = 0, list = dom.children(el); o = list[i]; ) {
                createLockedRow(o, this._aRows[i++]);
            }
            dom.insertBefore(lockedEl, dom.getParent(dom.getParent(this.getBody())));
        },
        {
            /**
             * 初始化高级表格控件的行部件。
             * @public
             *
             * @param {Object} options 初始化选项
             */
            Row: core.inherits(
                ui.Table.prototype.Row,
                '*ui-locked-table-row',
                {
                    /**
                     * @override
                     */
                    $dispose: function () {
                        this._eFill = null;
                        ui.Table.prototype.Row.prototype.$dispose.call(this);
                    }
                }
            ),

            /**
             * @override
             */
            $cache: function (style, cacheSize) {
                ui.Table.prototype.$cache.call(this, style, cacheSize);

                var i = 0,
                    rows = this.getRows(),
                    cols = this.getHCells(),
                    pos;

                this.$$paddingTop = Math.max(this.$$paddingTop, this._uLockedHead.getBody().offsetHeight);

                this.$$paddingLeft = 0;
                for (; i < this._nLeft; i++) {
                    this.$$paddingLeft += cols[i].getWidth();
                }

                this.$$paddingRight = 0;
                for (i = this._nRight; cols[i]; i++) {
                    this.$$paddingRight += cols[i].getWidth();
                }

                for (i = 0, pos = 0; style = rows[i++]; ) {
                    style.getCell(this._nLeft).cache(false, true);
                    style.$$pos = pos;
                    pos += Math.max(style.getHeight(), style._eFill.offsetHeight);
                }

                this._uLockedHead.cache(false, true);
                this._uLockedMain.cache(false, true);
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                var o = dom.getParent(dom.getParent(this.getBody())).style,
                    i = 0,
                    lockedHead = this._uLockedHead,
                    style = dom.getParent(dom.getParent(lockedHead.getBody())).style;

                o.paddingLeft = this.$$paddingLeft + 'px';
                o.paddingRight = this.$$paddingRight + 'px';
                dom.getParent(this.getBody()).style.width = (util.toNumber(dom.getParent(this.getBody()).style.width) - this.$$paddingLeft - this.$$paddingRight) + 'px';
                dom.getParent(this._uHead.getBody()).style.width = (util.toNumber(dom.getParent(this._uHead.getBody()).style.width) - this.$$paddingLeft - this.$$paddingRight) + 'px';

                ui.Table.prototype.$initStructure.call(this, width, height);

                o = this._uHead.getWidth() + this.$$paddingLeft + this.$$paddingRight;
                lockedHead.$setSize(0, this.$$paddingTop);
                style.height = this.$$paddingTop + 'px';
                this._uLockedMain.$setSize(o, this.getBodyHeight());
                style.width = this._uLockedMain.getBody().lastChild.style.width = o + 'px';

                width = (this.getWidth() - this.$$paddingLeft - this.$$paddingRight) + 'px';

//                style = layout.previousSibling.style;
//                style.width = util.toNumber(width) + this.$$paddingLeft + this.$$paddingRight + 'px';
//                style.height = util.toNumber(layout.style.height) + this.$$paddingTop + 'px';

                var rows = this._aHeadRows.concat(this._aRows);
                for (; o = rows[i++]; ) {
                    o._eFill.style.width = width;

                    style = Math.max(o.getHeight(), o._eFill.offsetHeight);
                    o._eFill.style.height = style + 'px';
                    o.getCell(this._nLeft).$setSize(0, style);
                }
            },

            /**
             * @override
             */
            $mousemove: function (event) {
                var pos = dom.getPosition(this.getMain()),
                    x = event.pageX - pos.left;
                dom.getParent(this._uLockedHead.getMain()).style.zIndex = x <= this.$$paddingLeft || x >= this.getWidth() - this.$$paddingRight ? 1 : -1;
            },

            /**
             * @override
             */
            $resize: function () {
                var o = this.getMain().style;
                o.paddingLeft = o.paddingRight = '';
                this.$$paddingLeft = this.$$paddingRight = 0;
                ui.Table.prototype.$resize.call(this);
            },

            /**
             * @override
             */
            $scroll: function () {
                ui.Table.prototype.$scroll.call(this);
                dom.getParent(dom.getParent(this._uHead.getBody())).style.left = (this.$$paddingLeft - dom.getParent(dom.getParent(this.getBody())).scrollLeft) + 'px';
            },

            /**
             * @override
             */
            addColumn: function (options, index) {
                if (index >= 0) {
                    if (index < this._nLeft) {
                        this._nLeft++;
                    }
                    if (index < this._nRight) {
                        this._nRight++;
                    }
                }
                return ui.Table.prototype.addColumn.call(this, options, index);
            },

            /**
             * @override
             */
            addRow: function (data, index) {
                this.repaint = util.blank;

                var row = ui.Table.prototype.addRow.call(this, data, index),
                    index = this.getRows().indexOf(row),
                    lockedRow = this._aRows[index],
                    el = row.getMain(),
                    o = dom.create();

                o.innerHTML = '<table cellspacing="0"><tbody><tr class="' + el.className + '" style="' + el.style.cssText + '"><td style="padding:0px;border:0px"></td></tr></tbody></table>';

                createLockedRow(el = o.lastChild.lastChild.lastChild, row);
                this._uLockedMain.getBody().insertBefore(el, lockedRow && lockedRow.getOuter());
                splitRow(row);

                delete this.repaint;
                this.repaint();

                return row;
            },

            /**
             * @override
             */
            init: function (options) {
                ui.Table.prototype.init.call(this, options);
                for (var i = 0, o; o = this._aHeadRows[i++]; ) {
                    splitRow(o);
                }
                for (i = 0; o = this._aRows[i++]; ) {
                    splitRow(o);
                }
            },

            /**
             * @override
             */
            removeColumn: function (index) {
                ui.Table.prototype.removeColumn.call(this, index);
                if (index >= 0) {
                    if (index < this._nLeft) {
                        this._nLeft--;
                    }
                    if (index < this._nRight) {
                        this._nRight--;
                    }
                }
            }
        }
    );

    /**
     * 初始化需要执行关联控制的行控件鼠标事件的默认处理。
     * 行控件鼠标事件发生时，需要通知关联的行控件也同步产生默认的处理。
     * @protected
     */
    (function () {
        function build(name) {
            ui.LockedTable.prototype.Row.prototype[name] = function (event) {
                ui.Table.prototype.Row.prototype[name].call(this, event);
                dom.getParent(this._eFill).className = this.getMain().className;
            };
        }

        for (var i = 0; i < 11; ) {
            build('$' + eventNames[i++]);
        }
    }());
}());
