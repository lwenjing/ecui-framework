/*
pagination - 分页控件。
定制分页控件，继承自基础控件

分页视图控件直接HTML初始化的例子:
<div ui="type:pagination;pageNo:1;totalPage:304";id:test></div>

外部调用获取当前点击页数的方法（通过在外部定义go方法，进行业务代码实现）:
ecui.get('test').go = function(pageNo){
    console.log(pageNo);
}

属性
_eChildren        - 分页区域所有子节点
_nCurrentPage     - 当前页数
_nTotalPage       - 总页数

*/
(function () {
    var core = ecui,
        dom = core.dom,
        ui = core.ui,
        util = core.util,
        ieVersion = /(msie (\d+\.\d)|IEMobile\/(\d+\.\d))/i.test(navigator.userAgent) ? document.documentMode || +(RegExp.$2 || RegExp.$3) : undefined;
    /*
     * 设置左右分页按钮失效样式
     * @private
     *
     * @param {Array}  indexArr 控件子节点序号
     */
    function setDisabled(indexArr) {
        for (var i = 0; i < 5; i++) {
            if (i !== 2) {
                ecui.dom.removeClass(this._eChildren[i], 'disabled');
            }
        }
        if (indexArr) {
            for (var i = 0; i < indexArr.length; i++) {
                ecui.dom.addClass(this._eChildren[indexArr[i]], 'disabled');
            }
        }
    }

    ui.Pagination = core.inherits(
        ui.Control,
        'pagination',
        function (el, options) {
            ui.Control.call(this, el, options);
            // 生成分页区域
            ecui.dom.insertHTML(
                el,
                'afterbegin',
                [
                    '<div class="pagination-button">&lt;&lt;</div>',
                    '<div class="pagination-button">&lt;</div>',
                    '<div class="dynamic-page clearfix"></div>',
                    '<div class="pagination-button">&gt;</div>',
                    '<div class="pagination-button">&gt;&gt;</div>',
                ].join('')
            );
            // 获取所有子节点
            this._eChildren = dom.children(el);
            // 定义当前页数
            this._nCurrentPage = Number(options.pageNo);
            // 定义总页数
            this._nTotalPage = Number(options.totalPage);

        },
        {
            /**
             * 分页展示格式,表示
             *
             * @param {number} maxPage    分页数字按钮区域最多展示按钮个数
             * @param {number} middlePage 分页数字按钮区中心按钮
             */
            PAGEFORMAT: { maxPage: 10, middlePage: 5},
            /**
             * 分页区域整体点击时，根据点击的节点来进行不同的处理
             * @override
             */
            $click: function (event) {
                ui.Control.prototype.$click.call(this, event);
                var target = event.target;
                // 获取target的内容
                var sText = ecui.dom.getText(target);
                // 对处于disalbed的按钮、空白区域、按钮的margin区域以外的分页按钮进行点击事件处理
                if (!ecui.dom.hasClass(target, 'disabled') && !ecui.dom.hasClass(target, 'pagination') && !ecui.dom.hasClass(target, 'dynamic-page')) {
                    switch (sText) {
                    case '<<':
                        this._nCurrentPage = 1;
                        break;
                    case '<':
                        this._nCurrentPage = this._nCurrentPage - 1;
                        break;
                    case '>':
                        this._nCurrentPage = this._nCurrentPage + 1;
                        break;
                    case '>>':
                        this._nCurrentPage = this._nTotalPage;
                        break;
                    default:
                        this._nCurrentPage = Number(sText);
                        break;
                    }
                    this.setPagination();

                    if (this.hasOwnProperty('go')) {
                        this.go(this._nCurrentPage);
                    }
                }
            },
            /**
             * 初始化完成后，填充数字按钮区域。
             * @override
             */
            $ready: function (options) {
                ui.Control.prototype.$ready.call(this, options);
                // 填充数字按钮区域
                this.setPagination();

            },
            /**
             * 生成并填充分页数字按钮区域。
             * @public
             *
             * @param {number} current 当前页码
             * @param {number} total   总页数(如果不传，则沿用原来的总页数)
             */
            setPagination: function (current, total) {
                var currentPage = current ? this._nCurrentPage = current : this._nCurrentPage,
                    totalPage = total ? this._nTotalPage = total : this._nTotalPage,
                    insertStr = '',
                    maxPage = this.PAGEFORMAT.maxPage,
                    middlePage = this.PAGEFORMAT.middlePage;
                // 当总页数小于等于10页时
                if (totalPage <= maxPage) {
                    for (var i = 1; i <= totalPage; i++) {
                        if (i === currentPage) {
                            insertStr += '<div class="pagination-button pagination-button-active">' + i + '</div>';
                        } else {
                            insertStr += '<div class="pagination-button">' + i + '</div>';
                        }
                    }
                // 当总页数大于10页时
                } else {
                    // 当前页数大于等于5 && 小于等于总页数-5
                    if (currentPage >= middlePage && currentPage <= totalPage - middlePage) {
                        for (var i = 1; i <= maxPage; i++) {
                            if ((currentPage - middlePage + i) <= totalPage) {
                                if ((currentPage - middlePage + i) === currentPage) {
                                    insertStr += '<div class="pagination-button pagination-button-active">' + (currentPage - middlePage + i) + ' </div>';
                                } else {
                                    insertStr += '<div class="pagination-button">' + (currentPage - middlePage + i) + '</div>';
                                }
                            }
                        }

                    // 当前页数小于5时
                    } else if (currentPage < middlePage) {
                        for (var i = 1; i <= maxPage; i++) {
                            if (i === currentPage) {
                                insertStr += '<div class="pagination-button pagination-button-active">' + i + ' </div>';
                            } else {
                                insertStr += '<div class="pagination-button">' + i + '</div>';
                            }
                        }
                    // 当前页数大于总页数-5
                    } else {
                        for (var i = totalPage - (maxPage - 1); i <= totalPage; i++) {
                            if (i === currentPage) {
                                insertStr += '<div class="pagination-button pagination-button-active">' + i + ' </div>';
                            } else {
                                insertStr += '<div class="pagination-button">' + i + ' </div>';
                            }
                        }
                    }
                }
                // 根据当前页数给左右分页按钮添加样式
                if (currentPage === 1) {
                    setDisabled.call(this, [0, 1]);
                } else if (currentPage === totalPage) {
                    setDisabled.call(this, [3, 4]);
                } else {
                    setDisabled.call(this);
                }
                // 如果只有一页则分页按钮不能点击
                if (totalPage === 1) {
                    setDisabled.call(this, [0, 1, 3, 4]);
                }
                // 填充数字按钮区
                this._eChildren[2].innerHTML = insertStr;
            }
        }
    );
}());