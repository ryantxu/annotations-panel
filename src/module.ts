///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from 'lodash';
import {PanelCtrl} from 'app/plugins/sdk';
import moment from 'moment';

import './css/annolist.css';

class AnnoListCtrl extends PanelCtrl {
  static templateUrl = 'partials/module.html';
  static scrollable = true;

  found: any[] = [];
  timeInfo?: string; // TODO shoudl be defined in Types

  queryUserId?: number;
  queryUser?: string;
  queryTagValue?: string;

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
    this.addEditorTab(
      'Options',
      'public/plugins/ryantxu-annolist-panel/partials/editor.html'
    );
  }

  onRefresh() {
    var promises: Promise<any>[] = [];

    promises.push(this.getAnnotationSearch());

    return Promise.all(promises).then(this.renderingCompleted.bind(this));
  }

  getAnnotationSearch(): Promise<any> {
    // http://docs.grafana.org/http_api/annotations/
    // https://github.com/grafana/grafana/blob/master/public/app/core/services/backend_srv.ts
    // https://github.com/grafana/grafana/blob/master/public/app/features/annotations/annotations_srv.ts

    const params: any = {
      tags: this.panel.tags,
      limit: this.panel.limit,
      type: 'annotation', // Skip the Annotations that are really alerts.  (Use the alerts panel!)
    };

    if (this.panel.onlyFromThisDashboard) {
      params.dashboardId = this.dashboard.id;
    }

    let timeInfo = '';
    if (this.panel.onlyInTimeRange) {
      let range = this.timeSrv.timeRange();
      params.from = range.from.valueOf();
      params.to = range.to.valueOf();
    } else {
      timeInfo = 'All Time';
    }
    this.timeInfo = timeInfo;

    if (this.queryUserId !== undefined) {
      params.userId = this.queryUserId;
      this.timeInfo += ' ' + this.queryUser;
    }

    if (this.queryTagValue) {
      if (params.tags) {
        params.tags.push(this.queryTagValue);
      } else {
        params.tags = [this.queryTagValue];
      }
      this.timeInfo += ' ' + this.queryTagValue;
    }

    return this.backendSrv.get('/api/annotations', params).then(result => {
      this.found = result;
    });
  }

  _timeOffset(time: number, offset: string, subtract: boolean = false) {
    let incr = 5;
    let unit = 'm';
    let parts = /^(\d+)(\w)/.exec(offset);
    if (parts && parts.length === 3) {
      incr = parseInt(parts[1]);
      unit = parts[2];
    }

    let t = moment.utc(time);
    if (subtract) {
      incr *= -1;
    }
    t.add(incr, unit);
    return t;
  }

  selectAnno(anno: any, evt?: any) {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    let range = {
      from: this._timeOffset(anno.time, this.panel.navigateBefore, true),
      to: this._timeOffset(anno.time, this.panel.navigateAfter, false),
    };

    // Link to the panel on the same dashboard
    if (this.dashboard.id === anno.dasboardId) {
      this.timeSrv.setTime(range);
      if (this.panel.navigateToPanel) {
        this.$location.search('panelId', anno.panelId);
        this.$location.search('fullscreen', true);
      }
      return;
    }

    if (anno.dashboardId === 0) {
      this.$rootScope.appEvent('alert-warning', [
        'Invalid Annotation Dashboard',
        'Annotation on dashboard: 0 (new?)',
      ]);
      return;
    }

    this.backendSrv.get('/api/search', {dashboardIds: anno.dashboardId}).then(res => {
      if (res && res.length === 1 && res[0].id === anno.dashboardId) {
        const dash = res[0];
        let path = dash.url;
        if (!path) {
          // before v5.
          path = '/dashboard/' + dash.uri;
        }

        let params: any = {
          from: range.from.valueOf().toString(),
          to: range.to.valueOf().toString(),
        };
        if (this.panel.navigateToPanel) {
          params.panelId = anno.panelId;
          params.fullscreen = true;
        }
        const orgId = this.$location.search().orgId;
        if (orgId) {
          params.orgId = orgId;
        }
        console.log('SEARCH', path, params);
        this.$location.path(path).search(params);
      } else {
        console.log('Unable to find dashboard...', anno);
        this.$rootScope.appEvent('alert-warning', [
          'Unknown Dashboard: ' + anno.dashboardId,
        ]);
      }
    });
  }

  queryAnnotationUser(anno: any, evt?: any) {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    this.queryUserId = anno.userId;
    this.queryUser = anno.login;
    console.log('Query User', anno, this);
    this.refresh();
  }

  queryAnnotationTag(anno: any, tag: string, evt?: any) {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    this.queryTagValue = tag;
    console.log('Query Tag', tag, anno, this);
    this.refresh();
  }
}

export {AnnoListCtrl, AnnoListCtrl as PanelCtrl};
