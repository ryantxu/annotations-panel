/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import { PanelCtrl } from 'app/plugins/sdk';
declare class AnnoListCtrl extends PanelCtrl {
    private backendSrv;
    private annotationsSrv;
    private dashboardSrv;
    static templateUrl: string;
    static scrollable: boolean;
    found: any[];
    static panelDefaults: {
        limit: number;
        tags: any[];
        showTags: boolean;
        showUser: boolean;
        showTime: boolean;
        showTimeFormat: string;
    };
    /** @ngInject */
    constructor($scope: any, $injector: any, backendSrv: any, annotationsSrv: any, dashboardSrv: any);
    onInitEditMode(): void;
    onRefresh(): Promise<{}>;
    getSearch(): any;
    selectAnno(anno: any, evt?: any): void;
    selectTag(anno: any, tag: string, evt?: any): void;
}
export { AnnoListCtrl, AnnoListCtrl as PanelCtrl };
