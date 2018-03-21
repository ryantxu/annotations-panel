///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from 'lodash';
import {PanelCtrl} from 'app/plugins/sdk';
import moment from 'moment';

class AnnoListCtrl extends PanelCtrl {
  static templateUrl = 'module.html';
  static scrollable = true;

  found: any[] = [];

  static panelDefaults = {
    limit: 10,
    tags: [],
    onlyFromThisDashboard: false,

    showTags: true,
    showUser: true,
    showTime: true,
    
    navigateBefore: '10m',
    navigateAfter: '10m',
    navigateToPanel: true,
  };

  /** @ngInject */
  constructor(
    $scope,
    $injector,
    private $rootScope,
    private backendSrv,
    private dashboardSrv,
    private timeSrv,
    private $location
  ) {
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
    const params:any = {
      limit: this.panel.limit,
      tags: this.panel.tags
    };

    if(this.panel.onlyFromThisDashboard) {
      params.dashboardId = this.dashboard.id;
    }

    return this.backendSrv.get('/api/annotations', params).then(result => {
      this.found = result;
    });
  }

  _timeOffset(time:number, offset:string, subtract:boolean=false) {
     let incr = 5;
     let unit = 'm';
     let parts = /^(\d+)(\w)/.exec(offset);
     if(parts && parts.length===3) {
       incr = parseInt(parts[1]);
       unit = parts[2];
     }

     let t = moment.utc(time);
     if(subtract) {
       incr *= -1;
     }
     t.add(incr,unit);
     return t;
  }


  selectAnno(anno: any, evt?: any) {
    let range = {
      from: this._timeOffset(anno.time, this.panel.navigateBefore, true), 
      to:  this._timeOffset(anno.time, this.panel.navigateAfter, false), 
    };
    this.timeSrv.setTime(range);

    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }

    if(this.dashboard.id === anno.dasboardId) {
      console.log('Same Dashboard!!');
      return;
    }

    this.backendSrv
      .get('/api/search', {dashboardIds:anno.dashboardId})
      .then(res => {
        if(res && res.length===1 && res[0].id===anno.dashboardId) {
          // TODO... is there a better way?
          console.log('GOTO Dashboard:', res[0]);
          this.$location.path(res[0].url);
          this.$location.search('edit', null);
          if(this.panel.navigateToPanel) {
            this.$location.search('panelId', anno.panelId);
            this.$location.search('fullscreen', true);
          }
          else {
            this.$location.search('panelId', null);
            this.$location.search('fullscreen', null);
          }
        }
        else {
          console.log( 'Unable to find dashboard...', anno);
          this.$rootScope.appEvent('alert-warning', [
            'Error Loading Dashboard: '+anno.dashbardId
          ]);
        }
      });
  }

  selectTag(anno: any, tag: string, evt?: any) {
    console.log('TAG', anno, tag);

    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
  }
}

export {AnnoListCtrl, AnnoListCtrl as PanelCtrl};
