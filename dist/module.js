///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
System.register(['lodash', 'app/plugins/sdk', 'moment'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var lodash_1, sdk_1, moment_1;
    var AnnoListCtrl;
    return {
        setters:[
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (moment_1_1) {
                moment_1 = moment_1_1;
            }],
        execute: function() {
            AnnoListCtrl = (function (_super) {
                __extends(AnnoListCtrl, _super);
                /** @ngInject */
                function AnnoListCtrl($scope, $injector, backendSrv, annotationsSrv, dashboardSrv) {
                    _super.call(this, $scope, $injector);
                    this.backendSrv = backendSrv;
                    this.annotationsSrv = annotationsSrv;
                    this.dashboardSrv = dashboardSrv;
                    this.found = [];
                    lodash_1.default.defaults(this.panel, AnnoListCtrl.panelDefaults);
                    $scope.moment = moment_1.default;
                    this.events.on('refresh', this.onRefresh.bind(this));
                    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
                }
                AnnoListCtrl.prototype.onInitEditMode = function () {
                    this.editorTabIndex = 1;
                    this.addEditorTab('Options', 'public/plugins/annolist/editor.html');
                };
                AnnoListCtrl.prototype.onRefresh = function () {
                    var promises = [];
                    promises.push(this.getSearch());
                    return Promise.all(promises).then(this.renderingCompleted.bind(this));
                };
                AnnoListCtrl.prototype.getSearch = function () {
                    var _this = this;
                    // http://docs.grafana.org/http_api/annotations/
                    // https://github.com/grafana/grafana/blob/master/public/app/core/services/backend_srv.ts
                    // https://github.com/grafana/grafana/blob/master/public/app/features/annotations/annotations_srv.ts
                    var params = {
                        limit: this.panel.limit,
                        tags: this.panel.tags,
                        folderId: this.panel.folderId,
                    };
                    return this.backendSrv.get('/api/annotations', params).then(function (result) {
                        _this.found = result;
                    });
                };
                AnnoListCtrl.prototype.selectAnno = function (anno, evt) {
                    console.log('GOTO', anno);
                    if (evt) {
                        evt.stopPropagation();
                        evt.preventDefault();
                    }
                };
                AnnoListCtrl.prototype.selectTag = function (anno, tag, evt) {
                    console.log('TAG', anno, tag);
                    if (evt) {
                        evt.stopPropagation();
                        evt.preventDefault();
                    }
                };
                AnnoListCtrl.templateUrl = 'module.html';
                AnnoListCtrl.scrollable = true;
                AnnoListCtrl.panelDefaults = {
                    limit: 10,
                    tags: [],
                    showTags: true,
                    showUser: true,
                    showTime: true,
                    showTimeFormat: 'LTS',
                };
                return AnnoListCtrl;
            })(sdk_1.PanelCtrl);
            exports_1("AnnoListCtrl", AnnoListCtrl);
            exports_1("PanelCtrl", AnnoListCtrl);
        }
    }
});
//# sourceMappingURL=module.js.map