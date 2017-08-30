/*
Table - 定义由行列构成的表格的基本操作。
表格控件，继承自截面控件，对基本的 TableElement 功能进行了扩展，表头固定，不会随表格的垂直滚动条滚动而滚动，在行列滚动时，支持整行整列移动，允许直接对表格的数据进行增加/删除/修改操作。

表格控件直接HTML初始化的例子:
<!-- 如果需要滚动条，请设置div的width样式到合适的值，并且在div外部再包一个div显示滚动条 -->
<div ui="type:table">
  <table>
    <!-- 表头区域 -->
    <thead>
      <tr>
        <th style="width:200px;">公司名</th>
        <th style="width:200px;">url</th>
        <th style="width:250px;">地址</th>
        <th style="width:100px;">创办时间</th>
      </tr>
    </thead>
    <!-- 内容行区域 -->
    <tbody>
      <tr>
        <td>百度</td>
        <td>www.baidu.com</td>
        <td>中国北京中关村</td>
        <td>1999</td>
      </tr>
    </tbody>
  </table>
</div>

属性
_bHeadFloat  - 表头飘浮
_aHCells     - 表格头单元格控件对象
_aRows       - 表格数据行对象
_uHead       - 表头区域

行属性
_aElements   - 行的列Element对象，如果当前列需要向左合并为null，需要向上合并为false
*/
(function () {
//{if 0}//
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,

        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined,

        eventNames = ['mousedown', 'mouseover', 'mousemove', 'mouseout', 'mouseup', 'click', 'dblclick', 'focus', 'blur', 'activate', 'deactivate', 'keydown', 'keypress', 'keyup', 'mousewheel'];
//{/if}//
    /**
     * 初始化单元格。
     * @private
     *
     * @return {ecui.ui.Table.Cell} 单元格控件
     */
    function initCell() {
        this.getControl = null;
        return createCell(this);
    }

    /**
     * 建立单元格控件。
     * @private
     *
     * @param {HTMLElement} main 单元格控件主元素
     * @return {ecui.ui.Table.Cell} 单元格控件
     */
    function createCell(main) {
        // 获取单元格所属的行控件
        var row = dom.getParent(main).getControl(),
            table = row.getParent();

        return core.$fastCreate(table.Cell, main, row, util.extend({}, table._aHCells[row._aElements.indexOf(main)]._oOptions));
    }

    /**
     * 表格控件初始化一行。
     * @private
     *
     * @param {ecui.ui.Table.Row} row 行控件
     */
    function initRow(row) {
        for (var i = 0, list = row.getParent()._aHCells, el, item; item = list[i]; ) {
            if ((el = row._aElements[i++]) && el !== item.getMain()) {
                var width = item.getWidth() - item.getMinimumWidth();
                while (row._aElements[i] === null) {
                    width += list[i++].getWidth();
                }
                el.style.width = width + 'px';
            }
        }
    }

    /**
     * 在需要时初始化单元格控件。
     * 表格控件的单元格控件不是在初始阶段生成，而是在单元格控件第一次被调用时生成，参见核心的 getControl 方法。
     * @private
     *
     * @return {Function} 初始化单元格函数
     */
    var getControlBuilder = ieVersion === 8 ? function () {
            // 为了防止写入getControl属性而导致的reflow如此处理
            var control;
            return function () {
                return (control = control || createCell(this));
            };
        } : function () {
            return initCell;
        };

    /**
     * 初始化表格控件。
     * options 对象支持的属性如下：
     * head-float     表头允许飘浮，默认不允许
     * @public
     *
     * @param {Object} options 初始化选项
     */
    ui.Table = core.inherits(
        ui.Control,
        'ui-table',
        function (el, options) {
            if (el.tagName === 'TABLE') {
                var table = el;
                dom.insertBefore(el = dom.create(table.className), table);
                if (options.width) {
                    el.style.width = options.width;
                }
                if (options.height) {
                    el.style.height = options.height;
                }
                table.className = '';
            } else {
                table = el.getElementsByTagName('TABLE')[0];
            }

            this._bHeadFloat = !!options.headFloat;

            el.appendChild(body = dom.create(options.classes.join('-body ')));
            body.appendChild(table);

            var i = 0,
                list = dom.children(table),
                head = list[0],
                body = list[1],
                headRowCount = 1,
                o = head,
                rowClass = this._sRowClass = ' ' + options.classes.join('-row '),
                hcellClass = this._sHCellClass = ' ' + options.classes.join('-hcell '),
                cellClass = this._sCellClass = ' ' + options.classes.join('-cell '),
                rows = this._aRows = [],
                cols = this._aHCells = [],
                colspans = [];

            table.setAttribute('cellSpacing', '0');

            if (head.tagName !== 'THEAD') {
                body = head;
                dom.insertBefore(head = dom.create('', 'THEAD'), o).appendChild((list = dom.children(o))[0]);
            } else {
                o = dom.children(head);
                headRowCount = o.length;
                list = o.concat(dom.children(list[1]));
            }

            // 以下初始化所有的行控件
            for (; o = list[i++]; ) {
                o.className += rowClass;
                for (var j = 0, colList = dom.children(o); o = colList[j++]; ) {
                    o.className += i <= headRowCount ? hcellClass : cellClass;
                }
            }

            // 初始化表格区域
            o = dom.create(options.classes.join('-head '));
            o.innerHTML = '<table cellspacing="0" class="' + table.className + '" style="' + table.style.cssText + '"><tbody></tbody></table>';
            el.appendChild(o);

            ui.Control.prototype.constructor.call(this, el, options);

            // 初始化表格区域
            this.$setBody(body);
            (this._uHead = core.$fastCreate(ui.Control, o, this)).$setBody(head);

            // 以下初始化所有的行控件
            for (i = 0; o = list[i]; i++) {
                // list[i] 保存每一行的当前需要处理的列元素
                list[i] = dom.first(o);
                colspans[i] = 0;
                (rows[i] = core.$fastCreate(this.Row, o, this))._aElements = [];
            }

            for (j = 0;; j++) {
                for (i = 0; o = rows[i]; i++) {
                    if (colspans[i] > 0) {
                        colspans[i]--;
                    } else if (el = list[i]) {
                        if (o._aElements[j] === undefined) {
                            o._aElements[j] = el;
                            // 当前元素处理完成，将list[i]指向下一个列元素
                            list[i] = dom.next(el);

                            var rowspan = +dom.getAttribute(el, 'rowSpan') || 1,
                                colspan = +dom.getAttribute(el, 'colSpan') || 1;

                            colspans[i] = colspan - 1;

                            while (rowspan--) {
                                if (rowspan) {
                                    colspans[i + rowspan] += colspan;
                                } else {
                                    colspan--;
                                }
                                for (o = colspan; o--; ) {
                                    rows[i + rowspan]._aElements.push(rowspan ? false : null);
                                }
                            }
                        }
                    } else {
                        // 当前行处理完毕，list[i]不再保存行内需要处理的下一个元素
                        for (j = 0;; j++) {
                            options = {};
                            for (i = 0; o = rows[i]; i++) {
                                el = o._aElements[j];
                                if (el === undefined) {
                                    this._aHeadRows = this._aRows.splice(0, headRowCount);
                                    return;
                                }
                                if (el) {
                                    if (i < headRowCount) {
                                        util.extend(options, core.getOptions(el));
                                        cols[j] = core.$fastCreate(this.HCell, el, this);
                                    } else {
                                        el.getControl = getControlBuilder();
                                    }
                                }
                            }
                            cols[j]._oOptions = options;
                        }
                    }
                }
            }
        },
        {
            /**
             * 初始化表格控件的单元格部件。
             * @public
             *
             * @param {Object} options 初始化选项
             */
            Cell: core.inherits(
                ui.Control,
                'ui-table-cell',
                {
                    /**
                     * @override
                     */
                    getHeight: function () {
                        return this.getOuter().offsetHeight;
                    },

                    /**
                     * @override
                     */
                    getWidth: function () {
                        return this.getOuter().offsetWidth;
                    }
                }
            ),

            /**
             * 初始化表格控件的列部件。
             * @public
             *
             * @param {Object} options 初始化选项
             */
            HCell: core.inherits(
                ui.Control,
                'ui-table-hcell',
                {
                    /**
                     * @override
                     */
                    $hide: function () {
                        this.$setStyles('display', 'none');
                    },

                    /**
                     * 设置整列的样式。
                     * $setStyles 方法批量设置一列所有单元格的样式。
                     * @protected
                     *
                     * @param {string} name 样式的名称
                     * @param {string} value 样式的值
                     * @param {number} widthRevise 改变样式后表格宽度的变化，如果省略表示没有变化
                     */
                    $setStyles: function (name, value) {
                        var table = this.getParent(),
                            rows = table._aHeadRows.concat(table._aRows),
                            body = this.getMain(),
                            cols = table._aHCells,
                            index = cols.indexOf(this);

                        body.style[name] = value;

                        for (var i = 0, o; o = rows[i++]; ) {
                            // 以下使用 body 表示列元素列表
                            body = o._aElements;
                            o = body[index];
                            if (o) {
                                o.style[name] = value;
                            }
                            if (o !== false) {
                                for (var j = index; !(o = body[j]); j--) {}

                                var width = -cols[j].getMinimumWidth(),
                                    colspan = 0;

                                do {
                                    if (!cols[j].getOuter().style.display) {
                                        width += cols[j].getWidth();
                                        colspan++;
                                    }
                                } while (body[++j] === null);

                                if (width > 0) {
                                    o.style.display = '';
                                    o.style.width = width + 'px';
                                    o.setAttribute('colSpan', colspan);
                                } else {
                                    o.style.display = 'none';
                                }
                            }
                        }
                    },

                    /**
                     * @override
                     */
                    $show: function () {
                        this.$setStyles('display', '');
                    },

                    /**
                     * 获取单元格控件。
                     * @public
                     *
                     * @param {number} rowIndex 行序号，从0开始
                     * @return {ecui.ui.Table.Cell} 单元格控件
                     */
                    getCell: function (rowIndex) {
                        return this.getParent().getCell(rowIndex, this._aHCells.indexOf(this));
                    },

                    /**
                     * 获取全部单元格控件。
                     * @public
                     *
                     * @return {Array} 单元格控件数组
                     */
                    getCells: function () {
                        for (var i = 0, index = this._aHCells.indexOf(this), o, result = []; o = this._aRows[i]; ) {
                            result[i++] = o.getCell(index);
                        }
                        return result;
                    },

                    /**
                     * @override
                     */
                    setSize: function (width) {
                        // 首先对列表头控件设置宽度，否则在计算合并单元格时宽度可能错误
                        this.$setSize(width);
                        this.$setStyles('width', (width - this.$getBasicWidth()) + 'px');
                    }
                }
            ),

            /**
             * 初始化表格控件的行部件。
             * @public
             *
             * @param {Object} options 初始化选项
             */
            Row: core.inherits(
                ui.Control,
                'ui-table-row',
                {
                    /**
                     * @override
                     */
                    $dispose: function () {
                        this._aElements = null;
                        ui.Control.prototype.$dispose.call(this);
                    },

                    /**
                     * 获取一行内所有单元格的主元素。
                     * $getElement 方法返回的主元素数组可能包含 false/null 值，分别表示当前单元格被向上或者向左合并。
                     * @protected
                     *
                     * @return {Array} 主元素数组
                     */
                    $getElements: function () {
                        return this._aElements.slice();
                    },

                    /**
                     * @override
                     */
                    $hide: function () {
                        var table = this.getParent(),
                            index = table._aRows.indexOf(this),
                            nextRow = table._aRows[index + 1],
                            cell;

                        for (var i = 0, o; table._aHCells[i]; i++) {
                            o = this._aElements[i];
                            if (o === false) {
                                o = table.$getElement(index - 1, i);
                                // 如果单元格向左被合并，cell == o
                                if (cell !== o) {
                                    o.setAttribute('rowSpan', +dom.getAttribute(o, 'rowSpan') - 1);
                                    cell = o;
                                }
                            } else if (o && (j = +dom.getAttribute(o, 'rowSpan')) > 1) {
                                // 如果单元格包含rowSpan属性，需要将属性添加到其它行去
                                o.setAttribute('rowSpan', j - 1);
                                for (var j = i + 1;; ) {
                                    cell = nextRow._aElements[j++];
                                    if (cell || cell === undefined) {
                                        break;
                                    }
                                }

                                o.getControl().$setParent(nextRow);
                                nextRow.getBody().insertBefore(o, cell || null);
                            }
                        }

                        ui.Control.prototype.$hide.call(this);
                        table.resize();
                    },

                    /**
                     * @override
                     */
                    $show: function () {
                        var table = this.getParent(),
                            index = table._aRows.indexOf(this),
                            nextRow = table._aRows[index + 1],
                            cell;

                        for (var i = 0, o; table._aHCells[i]; i++) {
                            o = this._aElements[i];
                            if (o === false) {
                                o = table.$getElement(index - 1, i);
                                // 如果单元格向左被合并，cell == o
                                if (cell !== o) {
                                    o.setAttribute('rowSpan', +dom.getAttribute(o, 'rowSpan') + 1);
                                    cell = o;
                                }
                            } else if (o && nextRow && nextRow._aElements[i] === false) {
                                // 如果单元格包含rowSpan属性，需要从其它行恢复
                                o.setAttribute('rowSpan', +dom.getAttribute(o, 'rowSpan') + 1);
                                for (var j = i + 1;; ) {
                                    cell = this._aElements[j++];
                                    if (cell || cell === undefined) {
                                        break;
                                    }
                                }

                                o.getControl().$setParent(this);
                                this.getBody().insertBefore(o, cell || null);
                            }
                        }

                        ui.Control.prototype.$show.call(this);
                        table.resize();
                    },

                    /**
                     * 获取单元格控件。
                     * @public
                     *
                     * @param {number} colIndex 列序号，从0开始
                     * @return {ecui.ui.Table.Cell} 单元格控件
                     */
                    getCell: function (colIndex) {
                        return this._aElements[colIndex] ? this._aElements[colIndex].getControl() : null;
                    },

                    /**
                     * 获取全部单元格控件。
                     * @public
                     *
                     * @return {Array} 单元格控件数组
                     */
                    getCells: function () {
                        for (var i = this._aElements.length, result = []; i--; ) {
                            result[i] = this.getCell(i);
                        }
                        return result;
                    },

                    /**
                     * @override
                     */
                    setSize: function (width, height) {
                        for (var i = this._aElements.length; i--; ) {
                            if (this._aElements[i]) {
                                this._aElements[i].getControl().$setSize(null, height);
                            }
                        }
                    }
                }
            ),

            /**
             * @override
             */
            $cache: function (style, cacheSize) {
                ui.Control.prototype.$cache.call(this, style, cacheSize);
                this._uHead.cache(false, true);

                this.$$paddingTop = this._uHead.getBody().offsetHeight;

                for (var i = 0; style = this._aRows[i++]; ) {
                    style.cache(true, true);
                }

                for (i = 0; style = this._aHCells[i++]; ) {
                    style.cache(true, true);
                }
            },

            /**
             * 获取单元格主元素。
             * $getElement 方法在合法的行列序号内一定会返回一个 Element 对象，如果当前单元格被合并，将返回合并后的 Element 对象。
             * @protected
             *
             * @param {number} rowIndex 单元格的行数，从0开始
             * @param {number} colIndex 单元格的列数，从0开始
             * @return {HTMLElement} 单元格主元素对象
             */
            $getElement: function (rowIndex, colIndex) {
                var rows = this._aRows,
                    cols = rows[rowIndex] && rows[rowIndex]._aElements,
                    col = cols && cols[colIndex];

                if (col === undefined) {
                    col = null;
                } else if (!col) {
                    for (; col === false; col = (cols = rows[--rowIndex]._aElements)[colIndex]) {}
                    for (; !col; col = cols[--colIndex]) {}
                }
                return col;
            },

            /**
             * @override
             */
            $initStructure: function (width, height) {
                ui.Control.prototype.$initStructure.call(this, width, height);

                var body = dom.getParent(dom.getParent(this.getBody()));
                dom.insertBefore(this._uHead.getBody(), this._uHead.getMain().lastChild.firstChild);
                body.style.paddingTop = this.$$paddingTop + 'px';
                body.style.height = (height - this.$$paddingTop) + 'px';

                this._uHead.$setSize(width - (body.offsetHeight === body.scrollHeight ? 0 : core.getScrollNarrow()), this.$$paddingTop);
            },

            /**
             * @override
             */
            $resize: function () {
                ui.Control.prototype.$resize.call(this);

                var body = dom.getParent(dom.getParent(this.getBody()));
                dom.insertBefore(this._uHead.getBody(), this.getBody());
                body.style.paddingTop = '';
                body.style.height = '';

                this._uHead.$resize();
            },

            /**
             * @override
             */
            $scroll: function () {
                ui.Control.prototype.$scroll.call(this);
                if (this._bHeadFloat) {
                    dom.getParent(dom.getParent(dom.getParent(this._uHead.getBody()))).style.top = Math.max(0, util.getView().top - dom.getPosition(this.getMain()).top) + 'px';
                }
            },

            /**
             * 增加一列。
             * options 对象对象支持的属性如下：
             * width   {number} 列的宽度
             * primary {string} 列的基本样式
             * title   {string} 列的标题
             * @public
             *
             * @param {Object} options 列的初始化选项
             * @param {number} index 被添加的列的位置序号，如果不合法将添加在末尾
             * @return {ecui.ui.Table.HCell} 表头单元格控件
             */
            addColumn: function (options, index) {
                var headRowCount = this._aHeadRows.length,
                    rows = this._aHeadRows.concat(this._aRows),
                    primary = options.primary || '',
                    el = dom.create(primary + this._sHCellClass, 'TH'),
                    col = core.$fastCreate(this.HCell, el, this),
                    row;

                el.innerHTML = options.title || '';

                primary += this._sCellClass;
                for (var i = 0, o; row = rows[i]; i++) {
                    o = row._aElements[index];
                    if (o !== null) {
                        // 没有出现跨列的插入列操作
                        for (j = index; !o; ) {
                            o = row._aElements[++j];
                            if (o === undefined) {
                                break;
                            }
                        }
                        if (i < headRowCount) {
                            row._aElements.splice(index, 0, row.getBody().insertBefore(el, o));
                            el.setAttribute('rowSpan', headRowCount - i);
                            this._aHCells.splice(index, 0, col);
                            i = headRowCount - 1;
                        } else {
                            row._aElements.splice(index, 0, o = row.getBody().insertBefore(dom.create(primary, 'TD'), o));
                            o.getControl = getControlBuilder();
                        }
                    } else {
                        // 出现跨列的插入列操作，需要修正colspan的属性值
                        var cell = this.$getElement(i - headRowCount, index),
                            j = +dom.getAttribute(cell, 'rowSpan') || 1;

                        cell.setAttribute('colSpan', +dom.getAttribute(cell, 'colSpan') + 1);
                        row._aElements.splice(index, 0, o);
                        for (; --j; ) {
                            rows[++i]._aElements.splice(index, 0, false);
                        }
                    }
                }

                col.cache();
                col.setSize(options.width);
                col._oOptions = util.extend({}, options);

                return col;
            },

            /**
             * 增加一行。
             * @public
             *
             * @param {Array} data 数据源(一维数组)
             * @param {number} index 被添加的行的位置序号，如果不合法将添加在最后
             * @return {ecui.ui.Table.Row} 行控件
             */
            addRow: function (data, index) {
                var j = 1,
                    body = this.getBody(),
                    el = dom.create(),
                    html = ['<table><tbody><tr class="' + this._sRowClass + '">'],
                    rowCols = [],
                    row = this._aRows[index],
                    col;

                if (!row) {
                    index = this._aRows.length;
                }

                for (var i = 0; col = this._aHCells[i]; ) {
                    if ((row && row._aElements[i] === false) || data[i] === false) {
                        rowCols[i++] = false;
                    } else {
                        // 如果部分列被隐藏，colspan/width 需要动态计算
                        rowCols[i] = true;
                        html[j++] = '<td class="' + this._sCellClass + '" style="';
                        for (var o = i, colspan = col.isShow() ? 1 : 0, width = col.getWidth() - col.getMinimumWidth(); (col = this._aHCells[++i]) && data[i] === null; ) {
                            rowCols[i] = null;
                            if (col.isShow()) {
                                colspan++;
                                width += col.getWidth();
                            }
                        }
                        rowCols[o] = true;
                        html[j++] = (colspan ? 'width:' + width + 'px" colSpan="' + colspan : 'display:none') + '">' + (data[o] || '') + '</td>';
                    }
                }

                html[j] = '</tr></tbody></table>';
                el.innerHTML = html.join('');
                el = el.lastChild.lastChild.lastChild;

                body.insertBefore(el, row ? row.getOuter() : null);
                row = core.$fastCreate(this.Row, el, this);
                this._aRows.splice(index--, 0, row);

                // 以下使用 col 表示上一次执行了rowspan++操作的单元格，同一个单元格只需要增加一次
                for (i = 0, el = el.firstChild, col = null; this._aHCells[i]; i++) {
                    if (o = rowCols[i]) {
                        rowCols[i] = el;
                        el.getControl = getControlBuilder();
                        el = el.nextSibling;
                    } else if (o === false) {
                        o = this.$getElement(index, i);
                        if (o !== col) {
                            o.setAttribute('rowSpan', (+dom.getAttribute(o, 'rowSpan') || 1) + 1);
                            col = o;
                        }
                    }
                }

                row._aElements = rowCols;
                this.resize();
                return row;
            },

            /**
             * 获取单元格控件。
             * @public
             *
             * @param {number} rowIndex 行序号，从0开始
             * @param {number} colIndex 列序号，从0开始
             * @return {ecui.ui.Table.Cell} 单元格控件
             */
            getCell: function (rowIndex, colIndex) {
                rowIndex = this._aRows[rowIndex];
                return (rowIndex && rowIndex.getCell(colIndex)) || null;
            },

            /**
             * 获取表格列的数量。
             * @public
             *
             * @return {number} 表格列的数量
             */
            getColumnCount: function () {
                return this._aHCells.length;
            },

            /**
             * 获取表头单元格控件。
             * 表头单元格控件提供了一些针对整列进行操作的方法，包括 hide、setSize(仅能设置宽度) 与 show 方法等。
             * @public
             *
             * @param {number} index 列序号，从0开始
             * @return {ecui.ui.Table.HCell} 表头单元格控件
             */
            getHCell: function (index) {
                return this._aHCells[index] || null;
            },

            /**
             * 获取全部的表头单元格控件。
             * @public
             *
             * @return {Array} 表头单元格控件数组
             */
            getHCells: function () {
                return this._aHCells.slice();
            },

            /**
             * 获取行控件。
             * @public
             *
             * @param {number} index 行数，从0开始
             * @return {ecui.ui.Table.Row} 行控件
             */
            getRow: function (index) {
                return this._aRows[index] || null;
            },

            /**
             * 获取表格行的数量。
             * @public
             *
             * @return {number} 表格行的数量
             */
            getRowCount: function () {
                return this._aRows.length;
            },

            /**
             * 获取全部的行控件。
             * @public
             *
             * @return {Array} 行控件列表
             */
            getRows: function () {
                return this._aRows.slice();
            },

            /**
             * @override
             */
            init: function (options) {
                for (var i = 0, o; o = this._aHCells[i++]; ) {
                    o.$setSize(o.getWidth());
                }
                for (i = 0; o = this._aHeadRows[i++]; ) {
                    initRow(o);
                }
                for (i = 0; o = this._aRows[i++]; ) {
                    initRow(o);
                }

                ui.Control.prototype.init.call(this, options);
            },

            /**
             * 移除一列并释放占用的空间。
             * @public
             *
             * @param {number} index 列序号，从0开始计数
             */
            removeColumn: function (index) {
                var i = 0,
                    cols = this._aHCells,
                    o = cols[index];

                if (o) {
                    o.hide();

                    dom.remove(o.getOuter());
                    core.dispose(o);
                    cols.splice(index, 1);

                    for (; o = this._aRows[i++]; ) {
                        cols = o._aElements;
                        if (o = cols[index]) {
                            if (cols[index + 1] === null) {
                                // 如果是被合并的列，需要保留
                                cols.splice(index + 1, 1);
                            } else {
                                dom.remove(o);
                                if (o.getControl !== getControlBuilder()) {
                                    core.dispose(o.getControl());
                                }
                                cols.splice(index, 1);
                            }
                        } else {
                            cols.splice(index, 1);
                        }
                    }
                }
            },

            /**
             * 移除一行并释放占用的空间。
             * @public
             *
             * @param {number} index 行序号，从0开始计数
             */
            removeRow: function (index) {
                var i = 0,
                    row = this._aRows[index],
                    rowNext = this._aRows[index + 1],
                    body = row.getBody(),
                    o;

                if (row) {
                    row.hide();
                    for (; this._aHCells[i]; i++) {
                        if (o = row._aElements[i]) {
                            if (dom.getParent(o) !== body) {
                                rowNext._aElements[i] = o;
                                for (; row._aElements[++i] === null; ) {
                                    rowNext._aElements[i] = null;
                                }
                                i--;
                            }
                        }
                    }

                    dom.remove(row.getOuter());
                    core.dispose(row);
                    this._aRows.splice(index, 1);

                    this.resize();
                }
            }
        }
    );

    // 初始化事件转发信息
    (function () {
        function build(name) {
            var type = name.replace('mouse', '');

            name = '$' + name;

            ui.Table.prototype.Row.prototype[name] = function (event) {
                ui.Control.prototype[name].call(this, event);
                core.triggerEvent(this.getParent(), 'row' + type, event);
            };

            ui.Table.prototype.Cell.prototype[name] = function (event) {
                ui.Control.prototype[name].call(this, event);
                core.triggerEvent(this.getParent().getParent(), 'cell' + type, event);
            };
        }

        for (var i = 0; i < 7; ) {
            build(eventNames[i++]);
        }
    }());
}());