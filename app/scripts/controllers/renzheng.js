define(['jquery', 'underscore', 'angular', 'config'], function ($, _, angular, config) {
  'use strict';

  angular.module('cernetApp.controllers.RenzhengCtrl', [])
    .controller('RenzhengCtrl', ['$rootScope', '$scope', '$location', '$http', 'urlRedirect', '$cookieStore',
      'messageService',
      function ($rootScope, $scope, $location, $http, urlRedirect, $cookieStore, messageService) {

        var loginApiUrl = config.apiurl_rz + 'denglu',
          login = {
            userName: '',
            password: ''
          },
          loginPostParams,
          session = {},
          currentPath = $location.$$path;
        $rootScope.session = session;
        $rootScope.pageName = "赛尔互联";//页面名称
        $rootScope.isRenZheng = true; //判读页面是不是认证
        $rootScope.dashboard_shown = false;
        $scope.login = login;
        $rootScope.isPromiseAlterOthersTimu = false;
        $rootScope.globalParams = { //全局参数
          lingyu: '',
          quanxian: ''
        };
        $scope.zhuCeUrl = $location.$$protocol + '://' +$location.$$host + ':' + $location.$$port + '/#/register';

        /**
         * 登录程序
         */
        $scope.signIn = function() {
          if(login.userName && login.password) {
            /**
             * 构建登陆回传参数，token, 用户名， 密码
             * @type {{token: (config.token|*), yonghuming: string, mima: string}}
             */
            loginPostParams = {
              token : config.token,
              yonghuming : login.userName,
              mima : login.password
            };

            //登录信息的验证
            $http.post(loginApiUrl, loginPostParams).success(function(result) {
              var jsArr, quanxianDist;
              session.info = result[0];
              session.userInfo = '';
              session.quanxian2032 = false;
              if(result.error){
                $scope.dengluInfo = result;
              }
              else{
                var profileUrl = '/user/' + login.userName,
                  yhxxxxApiUrl = config.apiurl_rz + 'yonghu_xiangxi_xinxi?token=' + config.token + '&yonghuid=' +
                    session.info.UID; //通过UID查询用户详细的url

                /**
                 *查询过用户的详细信息，得到jigouid,lingyuid等等 JUESE
                 */
                $http.get(yhxxxxApiUrl).success(function(data){
                  if(data.JIGOU.length){
                    if(data.JUESE){
                      session.userInfo = data;
                      jsArr = _.chain(data.JUESE)
                          .sortBy(function(js){ return js.JUESE_ID; })
                          .map(function(js){ return js.JUESE_ID; })
                          .uniq()
                          .without("9", "10")
                          .value(); //得到角色的数组
                      //把权限加入到对应的领域中
                      quanxianDist = _.groupBy(data.QUANXIAN, function(qx){ return qx.LINGYU_ID; });
                      _.each(data.LINGYU, function(ly){
                        var qxIds = _.map(quanxianDist[parseInt(ly.LINGYU_ID)], function(qx){ return qx.QUANXIAN_ID; });
                        ly.quanxian = qxIds;
                      });

                      if(_.contains(jsArr, "1")){

                        urlRedirect.goTo(currentPath, profileUrl);
                      }
                      else{
                        /**
                         * 查询用户权限的代码，用来导航，如果权限中包含QUANXIAN_ID包含4就导向审核页面，否则去相对应的页面
                         */
                        var permissions = data.QUANXIAN,
                          find_QUANXIAN_ID_4, find_QUANXIAN_ID_5,
                          quanxianArr = [],
                          urlShowAndHideArr = [],
                          jsUrl = '';

                        find_QUANXIAN_ID_4 = _.find(permissions, function(permission) {
                          return permission.QUANXIAN_ID == 2004;
                        });

                        find_QUANXIAN_ID_5 = _.find(permissions, function(permission) {
                          return permission.QUANXIAN_ID == 2005;
                        });
                        if(find_QUANXIAN_ID_4 || find_QUANXIAN_ID_5) {
                          urlRedirect.goTo(currentPath, profileUrl);
                        }
                        else {
                          if(data.LINGYU.length == 1){
                            session.defaultLyId = data.LINGYU[0].LINGYU_ID;
                            session.defaultLyName = data.LINGYU[0].LINGYUMINGCHENG;
                            session.defaultTiKuLyId = data.LINGYU[0].PARENT_LINGYU_ID;
                            quanxianArr = _.map(quanxianDist[parseInt(data.LINGYU[0].LINGYU_ID)], function(qx){
                              return qx.QUANXIAN_ID;
                            });
                            quanxianArr = _.uniq(quanxianArr);
                            //存放权限id的cookies
                            var quanXianCookie = {
                              quanXianId: quanxianArr
                              },
                              tiKuCookie = {
                                tkLingYuId: data.LINGYU[0].PARENT_LINGYU_ID
                              };
                            $cookieStore.put('quanXianCk', quanXianCookie);
                            $cookieStore.put('tiKuCk', tiKuCookie);
                            //根据权限判断导向
                            _.each(config.quanxianObj, function(qx, idx, lst){
                              var navName = _.intersection(qx.qxArr, quanxianArr).length;
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
                            urlRedirect.goTo(currentPath, jsUrl);
                          }
                          else{
                            urlRedirect.goTo(currentPath, '/lingyu');
                          }
                        }
                      }
                      //cookies代码
                      var userCookie = {
                          UID: $rootScope.session.info.UID,
                          YONGHUMING: $rootScope.session.info.YONGHUMING,
                          defaultLyId: session.defaultLyId,
                          defaultLyName: session.defaultLyName,
                          quanxianStr: session.quanxianStr,
                          JIGOU: session.userInfo.JIGOU,
                          JUESE: jsArr
                        },
                        lingyuCookie = {
                          lingyu: data.LINGYU
                        };
                      $cookieStore.put('logged', userCookie);
                      $cookieStore.put('lingyuCk', lingyuCookie);
                    }
                    else{
                      messageService.alertInfFun('pmt', '您注册的信息正在审核中，新耐心等待……');
                    }
                  }
                  else{
                    messageService.alertInfFun('pmt', '您注册的信息正在审核中，新耐心等待……');
                  }
                });
              }
            });
          }
        };

    }]);
});
