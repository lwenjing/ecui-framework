/*
LockedTable - 定义允许左右锁定若干列显示的高级表格的基本操作。
允许锁定左右两列的高级表格控件，继承自表格控件，内部包含两个部件——锁定的表头区(基础控件)与锁定的行内容区(基础控件)。

锁定列高级表格控件直接HTML初始化的例子:
<div ui="type:locked-table;left-lock:2;right-lock:1">
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
     * @param {ecui.ui.Table.Row} row 表格基本行控件
     * @param {HTMLElement} left 左侧锁定行的 Element 元素
     * @param {HTMLElement} right 右侧锁定行的 Element 元素
     */
    function initLockedRow(row, left, right) {
        core.$bind(left, row);
        core.$bind(right, row);
        row._eLeft = left;
        row._eRight = right;
    }

    /**
     * 拆分行内的单元格到锁定列或基本列中。
     * @private
     *
     * @param {ecui.ui.LockedTable.LockedHead|ecui.ui.LockedTable.LockedRow} locked 锁定表头控件或者锁定行控件
     */
    function UI_LOCKED_TABLE_ROW_SPLIT(locked) {
        var i = 0,
            table = locked.getParent(),
            cols = table.getHCells(),
            list = locked.$getElements(),
            o;

        for (; cols[i]; ) {
            if (o = list[i++]) {
                if (i <= table._nLeft) {
                    locked._eLeft.appendChild(o);
                } else if (i > table._nRight) {
                    locked._eRight.appendChild(o);
                }
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
            ui.Table.prototype.constructor.call(this, el, options);

            var i = 0,
                headRows = this._aHeadRows,
                rows = headRows.concat(this._aRows),
                layout = this.getLayout(),
                list = [],
                o;

            this._nLeft = options.leftLock || 0;
            this._nRight = this.getColumnCount() - (options.rightLock || 0);

            for (; el = rows[i]; ) {
                el = el.getMain();
                list[i++] = '<tr class="' + el.className + '" style="' + el.style.cssText + '"></tr>';
            }

            o = '<table cellspacing="0" class="ui-locked-table-body ' + dom.getParent(this.getBody()).className + '"><tbody>' + list.splice(headRows.length, rows.length - headRows.length).join('') + '</tbody></table><table cellspacing="0" class="' + this._uHead.getMain().className + '"><thead>' + list.join('') + '</thead></table>';
            dom.insertHTML(layout, 'beforeEnd', '<div class="ui-locked-table-fill"></div>' + o + o);

            el = layout.lastChild;
            for (i = 0; i < 4; i++) {
                list[i] = el;
                el = el.previousSibling;
            }
            this._eFill = el;

            var left = this._uLeftHead = core.$fastCreate(ui.Control, list[0], this),
                right = this._uRightHead = core.$fastCreate(ui.Control, list[2], this);
            left.$setBody(left = left.getMain().lastChild);
            right.$setBody(right = right.getMain().lastChild);

            for (i = 0, left = dom.children(left), right = dom.children(right); el = left[i]; ) {
                initLockedRow(headRows[i], el, right[i++]);
            }

            left = this._uLeftMain = core.$fastCreate(ui.Control, list[1], this);
            right = this._uRightMain = core.$fastCreate(ui.Control, list[3], this);
            left.$setBody(left = left.getMain().lastChild);
            right.$setBody(right = right.getMain().lastChild);

            for (i = 0, left = dom.children(left), right = dom.children(right); el = left[i]; ) {
                initLockedRow(this._aRows[i], el, right[i++]);
            }
        },
        {
            Row: core.inherits(
                ui.Table.prototype.Row,
                {
                    $dispose: function () {
                        this._eLeft = this._eRight = null;
                        ui.Table.prototype.Row.prototype.$dispose.call(this);
                    }
                }
            ),

            $cache: function (style, cacheSize) {
                ui.Table.prototype.$cache.call(this, style, cacheSize);

                this.$$paddingLeft = 0;
                for (var i = 0, list = this.getHCells(); i < this._nLeft; ) {
                    this.$$paddingLeft += list[i++].getWidth();
                }

                this.$$paddingRight = 0;
                for (i = this._nRight; i < list.length; ) {
                    this.$$paddingRight += list[i++].getWidth();
                }

                this._uLeftHead.cache(false, true);
                this._uRightHead.cache(false, true);
                this._uLeftMain.cache(false, true);
                this._uRightMain.cache(false, true);
            },

            $dispose: function () {
                this._eFill = null;
                ui.Table.prototype.$dispose.call(this);
            },

            $initStructure: function (width, height) {
                ui.Table.prototype.$initStructure.call(this, width, height);

                for (var i = 0, row; row = this._aHeadRows[i++]; ) {
                    UI_LOCKED_TABLE_ROW_SPLIT(row);
                }
                for (i = 0; row = this._aRows[i++]; ) {
                    UI_LOCKED_TABLE_ROW_SPLIT(row);
                }

                var leftHead = this._uLeftHead.getOuter(),
                    rightHead = this._uRightHead.getOuter(),
                    leftMain = this._uLeftMain.getOuter(),
                    rightMain = this._uRightMain.getOuter(),
                    tableWidth = util.toNumber(this._uHead.getMain().style.width);

                this._eFill.style.width = tableWidth + 'px';
                this._uHead.getMain().style.marginLeft = dom.getParent(this.getBody()).style.marginLeft = leftHead.style.width = leftMain.style.width = this.$$paddingLeft + 'px';
                rightHead.style.width = rightMain.style.width = this.$$paddingRight + 'px';

                leftHead.style.left = leftMain.style.left = '0px';
                rightHead.style.right = rightMain.style.right = '0px';

                leftMain.style.top = rightMain.style.top = dom.getParent(this.getBody()).style.marginTop;

                dom.getParent(this.getBody()).style.width = (tableWidth - this.$$paddingLeft - this.$$paddingRight) + 'px';
                this._uHead.getMain().style.width = (tableWidth - this.$$paddingLeft - this.$$paddingRight) + 'px';
            },

            $scroll: function () {
                ui.Table.prototype.$scroll.call(this);

                this._uLeftHead.getOuter().style.left = this._uLeftMain.getOuter().style.left = this.getLayout().scrollLeft + 'px';
                this._uRightHead.getOuter().style.right = this._uRightMain.getOuter().style.right = -this.getLayout().scrollLeft + 'px';

                this._uLeftMain.getOuter().style.top = this._uRightMain.getOuter().style.top = (this.$$paddingTop + this.getLayout().scrollTop - dom.getParent(this._uHead.getOuter()).scrollTop) + 'px';
                if (this._bHeadFloat) {
                    this._uLeftHead.getOuter().style.top = this._uRightHead.getOuter().style.top = Math.max(0, util.getView().top + this.getLayout().scrollTop - dom.getPosition(this.getOuter()).top) + 'px';
                }
            }
/*
            $resize: function () {
                var o = this.getMain().style;
                o.paddingLeft = o.paddingRight = '';
                this.$$paddingLeft = this.$$paddingRight = 0;
                ui.Table.prototype.$resize.call(this);
            },

            $setSize: function (width, height) {
                var o = this.getMain().style,
                    i = 0,
                    layout = dom.getParent(this.getBody()),
                    lockedHead = this._uLockedHead,
                    style = dom.getParent(dom.getParent(lockedHead.getBody())).style;

                o.paddingLeft = this.$$paddingLeft + 'px';
                o.paddingRight = this.$$paddingRight + 'px';

                ui.Table.prototype.$setSize.call(this, width, height);

                o = this._uHead.getWidth() + this.$$paddingLeft + this.$$paddingRight;
                lockedHead.$setSize(0, this.$$paddingTop);
                style.height = this.$$paddingTop + 'px';
                this._uLockedMain.$setSize(o, this.getBodyHeight());
                style.width = this._uLockedMain.getBody().lastChild.style.width = o + 'px';

                width = layout.style.width;

                style = layout.previousSibling.style;
                style.width = util.toNumber(width) + this.$$paddingLeft + this.$$paddingRight + 'px';
                style.height = util.toNumber(layout.style.height) + this.$$paddingTop + 'px';

                var rows = this._aHeadRows.concat(this._aRows);
                for (; o = rows[i++]; ) {
                    o._eFill.style.width = width;

                    style = Math.max(o.getHeight(), o._eFill.offsetHeight);
                    o._eFill.style.height = style + 'px';
                    o.getCell(this._nLeft).$setSize(0, style);
                }
            },

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

            addRow: function (data, index) {
                this.repaint = util.blank;

                var row = ui.Table.prototype.addRow.call(this, data, index);
                index = this.getRows().indexOf(row);
                var lockedRow = this._aRows[index],
                    el = row.getMain(),
                    o = dom.create();

                o.innerHTML = '<table cellspacing="0"><tbody><tr class="' + el.className + '" style="' + el.style.cssText + '"><td style="padding:0px;border:0px"></td></tr></tbody></table>';

                UI_LOCKED_TABLE_CREATE_LOCKEDROW(el = o.lastChild.lastChild.lastChild, row);
                this._uLockedMain.getBody().lastChild.lastChild.insertBefore(el, lockedRow && lockedRow.getOuter());
                UI_LOCKED_TABLE_ROW_SPLIT(row);

                delete this.repaint;
                this.repaint();

                return row;
            },

            init: function () {
                ui.Table.prototype.init.call(this);
                UI_LOCKED_TABLE_ALL_SPLIT(this);
            },

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
            }*/
        }
    );

    /**
     * 初始化需要执行关联控制的行控件鼠标事件的默认处理。
     * 行控件鼠标事件发生时，需要通知关联的行控件也同步产生默认的处理。
     * @protected
     */
/*    (function () {
        function build(name) {
            ui.LockedTable.prototype.Row.prototype[name] = function (event) {
                ui.Table.prototype.Row.prototype[name].call(this, event);
                dom.getParent(this._eFill).className = this.getMain().className;
            };
        }

        for (var i = 0; i < 11; ) {
            build('$' + eventNames[i++]);
        }
    }());*/
}());
