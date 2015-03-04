/*jshint unused: vars */
define([
    'controllers/renzheng',
    'controllers/nav',
    'angular',
    'config',
    'services/urlredirect',
    'controllers/mingti',
    'controllers/dagang',
    'controllers/user',
    'controllers/register',
    'controllers/zujuan',
    'controllers/kaowu',
    'controllers/lingyu',
    'controllers/tongji',
    'filters/mylocaldate',
    'filters/mylocaldatewithweek',
    'filters/examstatus',
    'filters/outputdaan',
    'filters/outtigan',
    'services/myfileupload',
    'directives/nandustar',
    'directives/passwordverify',
    'directives/bnslideshow',
    'directives/hoverslide',
    'directives/fileupload',
    'directives/repeatdone',
    'services/messageservice',
    'services/dataservice'
  ],
  function (RenzhengCtrl, NavCtrl, angular, config, UrlredirectService, MingtiCtrl, DagangCtrl, UserCtrl,
                     RegisterCtrl, ZujuanCtrl, KaowuCtrl, LingyuCtrl, TongjiCtrl, MylocaldateFilter, MylocaldatewithweekFilter,
                     ExamstatusFilter, OutputdaanFilter, OuttiganFilter, MyfileuploadService, NandustarDirective,
                     PasswordverifyDirective, BnslideshowDirective, HoverslideDirective, FileuploadDirective,
                     RepeatdoneDirective, MessageserviceService, DataServiceService)/*invoke*/ {
  'use strict';

  /**
   * @ngdoc overview
   * @name cernetApp
   * @description
   * # cernetApp
   *
   * Main module of the application.
   */
  return angular.module('cernetApp', [
    'cernetApp.services.Urlredirect',
    'cernetApp.services.Myfileupload',
    'cernetApp.controllers.RenzhengCtrl',
    'cernetApp.controllers.NavCtrl',
    'cernetApp.controllers.MingtiCtrl',
    'cernetApp.controllers.DagangCtrl',
    'cernetApp.controllers.UserCtrl',
    'cernetApp.controllers.RegisterCtrl',
    'cernetApp.controllers.ZujuanCtrl',
    'cernetApp.controllers.KaowuCtrl',
    'cernetApp.controllers.LingyuCtrl',
    'cernetApp.controllers.TongjiCtrl',
    'cernetApp.filters.Mylocaldate',
    'cernetApp.filters.Mylocaldatewithweek',
    'cernetApp.filters.Examstatus',
    'cernetApp.filters.Outputdaan',
    'cernetApp.filters.Outtigan',
    'cernetApp.directives.Hoverslide',
    'cernetApp.directives.Repeatdone',
    'cernetApp.directives.Fileupload',
    'cernetApp.directives.Bnslideshow',
    'cernetApp.directives.Nandustar',
    'cernetApp.directives.Passwordverify',
    'cernetApp.services.Messageservice',
    'cernetApp.services.DataService',
/*angJSDeps*/
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
  ])
    .config(['$routeProvider',
      function ($routeProvider) {
        var routes = config.routes;
        /**
         * 根据config文件中的路由配置信息加载本应用中要使用到的路由规则
         */
        for(var path in routes) {
          $routeProvider.when(path, routes[path]);
        }
        $routeProvider.otherwise({redirectTo: '/renzheng'});
      }])
    .run(['$rootScope', '$location', '$route', 'urlRedirect', '$cookieStore',
      function($rootScope, $location, $route, urlRedirect, $cookieStore) {
        /**
         * 确保所有需要登陆才可以访问的链接进行用户登陆信息验证，如果没有登陆的话，则导向登陆界面
         */
        $rootScope.$on("$locationChangeStart", function(event, next, current) {
          var routes = config.routes,
            nextUrlPattern,
            nextRoute,
            currentUrlParser = document.createElement('a'), // 使用浏览器内置的a标签进行url的解析判断
            nextUrlParser = document.createElement('a'),
            nextPath,
            currentPath,
            session = {
              defaultLyId: '',
              defaultLyName: '',
              quanxianStr: '',
              info: {},
              userInfo: {}
            };

          //cookies 代码
          $cookieStore.put('lastUrl', current);
          var loggedInfo = $cookieStore.get('logged'),
            lastUrl = $cookieStore.get('lastUrl'),
            quanXianIds = $cookieStore.get('quanXianCk'),
            tiKuInfo = $cookieStore.get('tiKuCk'),
            isKeMuManage;
          if(quanXianIds){
            if(quanXianIds.quanXianId && quanXianIds.quanXianId.length > 0){
              isKeMuManage = _.contains(quanXianIds.quanXianId, '2032');
            }
          }
          if(loggedInfo && loggedInfo.UID){
            $rootScope.session = session;
            $rootScope.session.defaultLyId = loggedInfo.defaultLyId;
            $rootScope.session.defaultLyName = loggedInfo.defaultLyName;
            $rootScope.session.quanxianStr = loggedInfo.quanxianStr;
            $rootScope.session.info.UID = loggedInfo.UID;
            $rootScope.session.info.YONGHUMING = loggedInfo.YONGHUMING;
            $rootScope.session.userInfo.UID = loggedInfo.UID;
            $rootScope.session.userInfo.YONGHUMING = loggedInfo.YONGHUMING;
            $rootScope.session.userInfo.JIGOU = loggedInfo.JIGOU;
            $rootScope.session.userInfo.JUESE = loggedInfo.JUESE;
          }
          if(tiKuInfo){
            $rootScope.session.defaultTiKuLyId = tiKuInfo.tkLingYuId;
          }
          if(isKeMuManage){ //判断科目负责人
            $rootScope.isPromiseAlterOthersTimu = true;
          }
          else{
            $rootScope.isPromiseAlterOthersTimu = false;
          }
          currentUrlParser.href = current; // current为当前的url地址
          nextUrlParser.href = next; // next为即将要访问的url地址
          if(currentUrlParser.protocol === nextUrlParser.protocol
            && currentUrlParser.host === nextUrlParser.host) { // 确保current与next的url地址都是属于同一个网站的链接地址
            nextPath = nextUrlParser.hash.substr(1); // 因为我们使用的是hash即#开头的浏览器端路由， 在这儿解析的时候要去掉#
            /**
             * 测试即将要访问的路由是否已经在我们的angular.js程序中定义
             * @type {*|Mixed}
             */
            var findRoute = _.find($route.routes, function(route, urlPattern) {
              if(route && route !== 'null' && route.regexp) { // 测试即将要访问的url是否否何定义的路由规则
                if(route.regexp.test(nextPath)) {
                  nextUrlPattern = urlPattern; // 记录即将要访问的路由模式，i.e: /user/:name
                  return true;
                }
              }
              return false;
            });

            if(findRoute) { // 如果在我们的路由表中已找到即将要访问的路由， 那么执行以下代码
              nextRoute = routes[nextUrlPattern]; // 找到即将要访问的路由的配置信息
              /**
               * 判断即将要访问的路由是否需要登陆验证， 并且确保如果当前用户没有登陆的话，将用户重定向至登陆界面
               */
              if(nextRoute && nextRoute.requireLogin && !($rootScope.session && $rootScope.session.info)) {
                event.preventDefault(); // 取消访问下一个路由地址
                currentPath = $location.$$path;
                urlRedirect.goTo(currentPath, '/renzheng');
              }
            }
          }
        });
      }]);
});
