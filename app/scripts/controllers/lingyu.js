define(['jquery', 'underscore', 'angular', 'config'], function ($, _, angular, config) { // 00
  'use strict';

  angular.module('cernetApp.controllers.LingyuCtrl', [])
    .controller('LingyuCtrl', ['$rootScope', '$scope', '$location', 'urlRedirect', '$cookieStore', 'messageService', //11
      function ($rootScope, $scope, $location, urlRedirect, $cookieStore, messageService) {
        /**
         * 定义变量和初始化
         */
        var currentPath = $location.$$path,
          session = $rootScope.session,
          lingyu = $cookieStore.get('lingyuCk');
        $rootScope.pageName = "选择默认科目";//页面名称
        $rootScope.isRenZheng = true; //判读页面是不是认证
        $rootScope.dashboard_shown = false;
        $scope.linyuInfo = lingyu.lingyu;

        /**
         * 设置默认的领域
         */
        $scope.goToTargetWeb = function(ly){
          var jsUrl = '', urlShowAndHideArr = [];
          //在session中记录作为默认的领域id和领域名称
          session.defaultLyId = ly.LINGYU_ID;
          session.defaultLyName = ly.LINGYUMINGCHENG;
          session.defaultTiKuLyId = ly.PARENT_LINGYU_ID;
          if(ly.quanxian && ly.quanxian.length > 0){
            //存放权限id的cookies
            var quanXianCookie = {
              quanXianId: ly.quanxian
              },
              tiKuCookie = {
                tkLingYuId: ly.PARENT_LINGYU_ID
              };
            $cookieStore.put('quanXianCk', quanXianCookie);
            $cookieStore.put('tiKuCk', tiKuCookie);
            //根据权限判断导向
            _.each(config.quanxianObj, function(qx, idx, lst){
              var navName = _.intersection(qx.qxArr, ly.quanxian).length;
              //显示和隐藏url
              if(navName > 0){
                urlShowAndHideArr.push(qx.navName);
              }
            });
            //默认url
            if(urlShowAndHideArr && urlShowAndHideArr.length > 0){
              jsUrl = '/' + urlShowAndHideArr[0];
            }
            session.quanxianStr = urlShowAndHideArr.join();
            //cookies代码
            var userCookie = $cookieStore.get('logged');
            userCookie.defaultLyId = ly.LINGYU_ID;
            userCookie.defaultLyName = ly.LINGYUMINGCHENG;
            userCookie.quanxianStr = urlShowAndHideArr.join();
            $cookieStore.put('logged', userCookie);
            $cookieStore.put('tiKuCk', tiKuCookie);
            urlRedirect.goTo(currentPath, jsUrl);
          }
          else{
            messageService.alertInfFun('err', ly.LINGYUMINGCHENG + '科目下没有权限，或者您的权限在审批中！');
          }
        }

    }]); //11
}); //00
