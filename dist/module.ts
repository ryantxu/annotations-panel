///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from 'lodash';
import { PanelCtrl } from 'app/plugins/sdk';
import moment from 'moment';

class AnnoListCtrl extends PanelCtrl {
  static templateUrl = 'module.html';
  static scrollable = true;

  found: any[] = [];

  static panelDefaults = {
    limit: 10,
    tags: [],

    showTags: true,
    showUser: true,
    showTime: true,
    showTimeFormat: 'LTS',
  };

  /** @ngInject */
  constructor($scope, $injector, private backendSrv, private annotationsSrv, private dashboardSrv) {
    super($scope, $injector);
    _.defaults(this.panel, AnnoListCtrl.panelDefaults);

    $scope.moment = moment;

    this.events.on('refresh', this.onRefresh.bind(this));
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
  }

  onInitEditMode() {
    this.editorTabIndex = 1;
    this.addEditorTab('Options', 'public/plugins/annolist/editor.html');
  }

  onRefresh() {
    var promises = [];

    promises.push(this.getSearch());

    return Promise.all(promises).then(this.renderingCompleted.bind(this));
  }

  getSearch() {
    // http://docs.grafana.org/http_api/annotations/
    // https://github.com/grafana/grafana/blob/master/public/app/core/services/backend_srv.ts
    // https://github.com/grafana/grafana/blob/master/public/app/features/annotations/annotations_srv.ts
    const params = {
      limit: this.panel.limit,
      tags: this.panel.tags,
      folderId: this.panel.folderId,
    };

    return this.backendSrv.get('/api/annotations', params).then(result => {
      this.found = result;
    });
  }

  selectAnno(anno:any, evt?:any) {
    console.log( 'GOTO', anno );

    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
  }

  selectTag(anno:any, tag:string, evt?:any) {
    console.log( 'TAG', anno, tag );

    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
  }
}

export { AnnoListCtrl, AnnoListCtrl as PanelCtrl };
