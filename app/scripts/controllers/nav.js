define(['jquery', 'underscore', 'angular', 'config'], function ($, _, angular, config) {
  'use strict';

  angular.module('cernetApp.controllers.NavCtrl', [])
    .controller('NavCtrl', ['$rootScope', '$scope', '$location', '$http', 'messageService',
      function ($rootScope, $scope, $location, $http, messageService) {
        /**
         * 定义变量
         */
        var baseRzAPIUrl = config.apiurl_rz, //renzheng的api
          token = config.token,
          alterYongHu = baseRzAPIUrl + 'xiugai_yonghu',
          apiUrlLy = baseRzAPIUrl + 'lingYu?token=' + config.token + '&jigouid=', //lingYu 学科领域的api
          apiLyKm = baseRzAPIUrl + 'lingYu?token=' + config.token + '&parentid=', //由lingYu id 的具体的学科
          apiUrlJueSe = baseRzAPIUrl + 'jueSe?token=' + config.token, //jueSe 查询科目权限的数据的api
          xgyhUrl = baseRzAPIUrl + 'xiugai_yonghu', //修改用户的url
          objAndRightList = [], //已经选择的科目和单位
          userInfo;

        $scope.userInfoLayer = false;
        $scope.navData = {
          newPsd: '',
          select_ly: '',
          jiGouId: ''
        };

        /**
         * 控制导航的代码
         */
        $scope.navClass = function (page) {
          var currentRoute = $location.path().substring(1);
          return page === currentRoute ? 'active' : '';
        };

        /**
         * dashboard的显示和隐藏
         */
        $scope.dsfoldBtn = function (page) {
          var dashboard = angular.element('.dashboard'),
            main = angular.element('.main'),
            dashboardWith = dashboard.width(),
            foldBtn = angular.element('.dsfoldBtn'),
            hideIcon = angular.element('.userInfo,.nav-icon');
          if(dashboardWith == 120){
            hideIcon.hide();
            foldBtn.css('background-position-y','-20px');
            dashboard.animate({
              width: '20px'
            }, 500, function() {

            });
            $('.fixed-top').animate({
              left: '461px'
            }, 500, function() {

            });
            main.animate({
              'padding-left': '20px'
            }, 500, function() {

            });
          }
          else{
            foldBtn.css('background-position-y','5px');
            main.animate({
              'padding-left': '120px'
            }, 500, function() {

            });
            dashboard.animate({
              width: '120px'
            }, 500, function() {
              hideIcon.show();
            });
            $('.fixed-top').animate({
              left: '561px'
            }, 500, function() {

            });
          }
        };

        /**
         * 显示个人详情
         */
        $rootScope.showUserInfo = function(){
          var user = {},
            jueseDist,
            yhxxxxApiUrl = baseRzAPIUrl + 'yonghu_xiangxi_xinxi?token=' + token + '&yonghuid=' +
              $rootScope.session.info.UID; //通过UID查询用户详细的url
          userInfo = $rootScope.session.userInfo;
          $http.get(yhxxxxApiUrl).success(function(data){
            if(data.JIGOU.length){
              $scope.navData.jiGouId = data.JIGOU[0].JIGOU_ID;
              user.LINGYU = [];
              jueseDist = _.groupBy(data.JUESE, function(js){ return js.LINGYUMINGCHENG; });
              _.each(data.LINGYU, function(ly){
                var jsName = _.map(jueseDist[ly.LINGYUMINGCHENG], function(js){ return js.JUESEMINGCHENG; }),
                  lyObj = {
                    LINGYUMINGCHENG: '',
                    LINGYU_ID: '',
                    jueseStr: ''
                  };
                lyObj.LINGYUMINGCHENG = ly.LINGYUMINGCHENG;
                lyObj.LINGYU_ID = ly.LINGYU_ID;
                lyObj.jueseStr = jsName.join();
                user.LINGYU.push(lyObj);
              });
              //基本信息
              user.YONGHUMING = data.YONGHUMING;
              user.XINGMING = data.XINGMING;
              user.YOUXIANG = data.YOUXIANG;
              user.SHOUJI = data.SHOUJI;
              user.JIGOUMINGCHENG = data.JIGOU[0].JIGOUMINGCHENG;
              user.SHOUJI = data.SHOUJI;
              $('.modifuMiMaInfo').html('');
              //查询领域，去取已有领域;查询父领域的代码
              $http.get(apiUrlLy + data.JIGOU[0].JIGOU_ID).success(function(jgData) {
                if(jgData && jgData.length){
                  $scope.lingYuList = jgData;
                }
                else{
                  $scope.lingYuList = '';
                  messageService.alertInfFun('err', '没有相关领域！');
                }
              });
              //查询角色的代码
              $http.get(apiUrlJueSe).success(function(jsData) {
                if(jsData && jsData.length > 0){
                  $scope.juese_list = jsData;
                }
              });
              $scope.usr = user;
              $scope.userInfoLayer = true;
            }
          });
        };

        /**
         /重新选择时，删除已选择的科目和角色
         */
        var deleteAllSelectedKmAndJs = function(){
          objAndRightList = [];
          $scope.objAndRight = objAndRightList;
        };

        /**
         * 有父领域查询子领域领域（即科目）
         */
        $scope.getKemuList = function(lyId){
          if(lyId){
            $http.get(apiLyKm + lyId).success(function(data) {
              if(data.length){
                _.each($scope.usr.LINGYU, function(hasLy, idx, lst){
                  data = _.reject(data, function(ly){ return ly.LINGYU_ID  == hasLy.LINGYU_ID; });
                });
                $scope.kemu_list = data;
                deleteAllSelectedKmAndJs();
              }
              else{
                $scope.kemu_list = '';
                messageService.alertInfFun('err', '没有对应的科目！');
              }
            });
          }
          else{
            $scope.kemu_list = '';
          }
        };

        /**
         * 添加科目和权限
         */
        $scope.getObjectAndRight = function(){
          var objAndRightObj = {
            lingyu:'',
            juese:{
              jueseId: '',
              jueseName: ''
            }
          };
          objAndRightObj.lingyu = $scope.kemu_list.splice(selectedLingYuIndex, 1);
          objAndRightObj.juese.jueseId = selectJueseIdArr;
          objAndRightObj.juese.jueseName = selectJueseNameArr;
          objAndRightList.push(objAndRightObj);
          $scope.objAndRight = objAndRightList;
          $('input[name=rightName]:checked').prop('checked', false);
          $scope.jueseValue = false;
          $scope.linyuValue = false;
        };

        /**
         * 获得领域lingyu（选择科目）的值
         */
        var selectedLingYuIndex;
        $scope.getLingYuVal = function(idx){
          selectedLingYuIndex = '';
          selectedLingYuIndex = idx;
          $scope.linyuValue = idx >=0 ? true : false;
        };

        /**
         * 获得角色juese（科目权限）的代码
         */
        var selectJueseIdArr = [],
          selectJueseNameArr = [];
        $scope.getJueSeArr = function(){
          selectJueseIdArr = [];
          selectJueseNameArr = [];
          var jueseItem = $('input[name=rightName]:checked');
          _.each(jueseItem,function(js, idx, lst){
            selectJueseIdArr.push(js.value);
            selectJueseNameArr.push(js.nextElementSibling.textContent);
          });
          $scope.jueseValue = selectJueseIdArr.length;
        };

        /**
         *  删除一条已选科目
         */
        $scope.delSelectedObject = function(idx){
          var deleteObjectAndRight = $scope.objAndRight.splice(idx, 1);
          $scope.kemu_list.push(deleteObjectAndRight[0].lingyu[0]);
        };

        /**
         * 保存新增加的领域
         */
        $scope.saveNewLingYu = function(){
          var select_juese = [],
            newLingYuDate = {
              token: token,
              UID: userInfo.UID,
              JUESE: ''
            };
          _.each(objAndRightList, function(oar, indx, lst){
            _.each(oar.juese.jueseId, function(jsid, idx, lst){
              var jueseObg = {
                jigou: $scope.navData.jiGouId,
                lingyu: '',
                juese: ''
              };
              jueseObg.lingyu = oar.lingyu[0].LINGYU_ID;
              jueseObg.juese = jsid;
              select_juese.push(jueseObg);
            });
          });
          newLingYuDate.JUESE = select_juese;
          $http.post(alterYongHu, newLingYuDate).success(function(data){
            if(data.result){
              messageService.alertInfFun('suc', '成功添加新领域添加！');
            }
            else{
              messageService.alertInfFun('err', '修改失败！错误信息为：' + data.error);
            }
          });
        };

        /**
         * 关闭个人详情页
         */
        $rootScope.closeUserInfoLayer = function(){
          $scope.userInfoLayer = false;
        };

        /**
         * 修改密码
         */
        $scope.modifyPassWord = function(){
          var newPsdData = {
            token: token,
            UID: '',
            MIMA: ''
          };
          newPsdData.UID = userInfo.UID;
          newPsdData.MIMA = $scope.navData.newPsd;
          $('.modifuMiMaInfo').html('');
          $http.post(alterYongHu, newPsdData).success(function(data){
            if(data.result){
              $('.modifuMiMaInfo').html('密码修改成功!').fadeOut(5000);
            }
            else{
              $('.modifuMiMaInfo').html(data.error).fadeOut(5000);
            }
          });
        };

        /**
         * 退出程序
         */
        $scope.signOut = function(){
          messageService.logout();
        };
    }]);
});
