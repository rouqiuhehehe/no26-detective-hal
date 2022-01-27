import { MyTable } from '@/types/components';

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

    public defaultTableBind: Partial<MyTable> = {
        border: true
    };
}
