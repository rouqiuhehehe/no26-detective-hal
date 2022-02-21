import { MyPagination, MyTable, MyTableColumns } from '@/types/components';

export default class {
    public tableBind = [
        'height',
        'maxHeight',
        'stripe',
        'border',
        'fit',
        'showHeader',
        'highlightCurrentRow',
        'currentRowKey',
        'lazy',
        'indent',
        'rowClassName',
        'rowStyle',
        'cellClassName',
        'cellStyle',
        'headerRowClassName',
        'headerRowStyle',
        'headerCellClassName',
        'headerCellStyle',
        'rowKey',
        'emptyText',
        'defaultExpandAll',
        'expandRowKeys',
        'defaultSort',
        'tooltipEffect',
        'showSummary',
        'sumText',
        'summaryMethod',
        'selectOnIndeterminate',
        'load'
    ];

    public tableItemBind = [
        'type',
        'label',
        'columnKey',
        'width',
        'minWidth',
        'fixed',
        'renderHeader',
        'sortable',
        'sortMethod',
        'sortOrders',
        'resizable',
        'showOverflowTooltip',
        'align',
        'headerAlign',
        'className',
        'labelClassName',
        'selectable',
        'reserveSelection',
        'filters',
        'filterPlacement',
        'filterMultiple',
        'filterMethod',
        'filteredValue'
    ];

    public paginationBind = [
        'small',
        'background',
        'pageSize',
        'total',
        'pageCount',
        'pagerCount',
        'currentPage',
        'layout',
        'pageSizes',
        'popperClass',
        'prevText',
        'nextText',
        'hideOnSinglePage'
    ];

    public defaultTableBind: Partial<MyTable> = {
        border: true
    };

    public defaultTableItemBind: Partial<MyTableColumns> = {
        align: 'center'
    };

    public defaultPaginationBind: Partial<MyPagination> = {
        pageSizes: [10, 20, 30, 40],
        pageSize: 10,
        layout: 'total, sizes, prev, pager, next, jumper'
    };
}
