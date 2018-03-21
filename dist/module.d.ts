/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import { PanelCtrl } from 'app/plugins/sdk';
declare class AnnoListCtrl extends PanelCtrl {
    private $rootScope;
    private backendSrv;
    private dashboardSrv;
    private timeSrv;
    private $location;
    static templateUrl: string;
    static scrollable: boolean;
    found: any[];
    static panelDefaults: {
        limit: number;
        tags: any[];
        onlyFromThisDashboard: boolean;
        showTags: boolean;
        showUser: boolean;
        showTime: boolean;
        navigateBefore: string;
        navigateAfter: string;
        navigateToPanel: boolean;
    };
    /** @ngInject */
    constructor($scope: any, $injector: any, $rootScope: any, backendSrv: any, dashboardSrv: any, timeSrv: any, $location: any);
    onInitEditMode(): void;
    onRefresh(): Promise<{}>;
    getSearch(): any;
    _timeOffset(time: number, offset: string, subtract?: boolean): any;
    selectAnno(anno: any, evt?: any): void;
    selectTag(anno: any, tag: string, evt?: any): void;
}
export { AnnoListCtrl, AnnoListCtrl as PanelCtrl };
