define(['jquery', 'underscore', 'angular', 'config'], function ($, _, angular, config) {
  'use strict';

  angular.module('cernetApp.controllers.RegisterCtrl', [])
    .controller('RegisterCtrl', ['$rootScope', '$scope', '$location', '$http', 'urlRedirect', 'messageService',
      function ($rootScope, $scope, $location, $http, urlRedirect, messageService) {

        var apiUrlLy = config.apiurl_rz + 'lingYu?token=' + config.token + '&jigouid=', //lingYu 学科领域的api
            apiLyKm = config.apiurl_rz + 'lingYu?token=' + config.token + '&parentid=', //由lingYu id 的具体的学科
            apiUrlJglb = config.apiurl_rz + 'jiGou_LeiBie?token=' + config.token + '&leibieid=1,2', //jiGouLeiBie 机构类别的api
            apiUrlJueSe = config.apiurl_rz + 'jueSe?token=' + config.token, //jueSe 查询科目权限的数据的api
            jiGou_LeiBieUrl = config.apiurl_rz + 'jiGou?token=' + config.token + '&leibieid=', //由机构类别查询机构的url
            select_juese = [], //得到已选择的角色[{jigou: id, lingyu: id, juese: id}, {jigou: id, lingyu: id, juese: id}]
            registerDate = {}, // 注册时用到的数据
            jigouId, //所选的机构ID
            registerUrl = config.apiurl_rz + 'zhuce', //提交注册信息的url
            objAndRightList = [], //已经选择的科目和单位
            checkUserUrlBase = config.apiurl_rz + 'check_user?token=' + config.token; //检测用户是否存在的url

        $rootScope.pageName = "新用户注册";//页面名称
        $rootScope.isRenZheng = true; //判读页面是不是认证
        $rootScope.dashboard_shown = false;
        $scope.phoneRegexp = /^[1][3458][0-9]{9}$/; //验证手机的正则表达式
        $scope.emailRegexp = /^[0-9a-z][a-z0-9\._-]{1,}@[a-z0-9-]{1,}[a-z0-9]\.[a-z\.]{1,}[a-z]$/; //验证邮箱的正则表达式
//        $scope.userNameRegexp = /^.{4,30}$/;//用户名的正则表达式
        $scope.userNameRegexp = /^([a-zA-Z])([a-zA-Z0-9_]){3,29}$/;//用户名的正则表达式
        $scope.realNameRegexp = /(^[A-Za-z]{2,20}$)|(^[\u4E00-\u9FA5]{2,20}$)/;//真实姓名的正则表达式
        $scope.passwordRegexp = /^.{6,20}$/;//密码的正则表达式
        $scope.objectWrap = false;
        $scope.stepTwo = false; //第二步的显示和隐藏
        $scope.stepThree = false; //第三步的显示和隐藏

        /**
         * 注册信息的第一步，个人详情信息
         */
        $scope.personalInfo = {
          yonghuming: '',
          mima: '',
          youxiang: '',
          xingming: '',
          shouji: ''
        };
        registerDate = $scope.personalInfo;
        $scope.registerParam = {
          selectJiGouId: ''
        };

        /**
         * 检查输入的邮箱或者是用户名，在数据库中是否存在
         */
        $scope.checkUsrExist = function(nme, info){
          var checkUserUrl = checkUserUrlBase + '&' + nme + '=' + info;
          $http.get(checkUserUrl).success(function(data){
            if(nme == 'yonghuming'){
              if(data.result){
                $scope.yonghumingExist = true;
              }
              else{
                $scope.yonghumingExist = false;
              }
            }
            else{
              if(data.result){
                $scope.youxiangExist = true;
              }
              else{
                $scope.youxiangExist = false;
              }
            }
          });
        };

        /**
         * 检查密码是否一致
         */
        $scope.checkPassword = function(){
          var psw = $scope.personalInfo.mima,
            pswConfirm = $scope.personalInfo.mima_verify;
          if(pswConfirm){
            if(psw == pswConfirm){
              $scope.ifPswTheSame = false;
            }
            else{
              $scope.ifPswTheSame = true;
            }
          }
          else{
            $scope.ifPswTheSame = false;
          }
        };

        /**
         * 个人详情信息完整后，去第二步
         */
        $scope.validatePersonalInfo = function(){
          $scope.stepTwo = true;
          $('.nav-tabs li').removeClass('active').eq(1).addClass('active');
          $('.tab-pane').removeClass('active').eq(1).addClass('active');
        };

        /**
         /重新选择时，删除已选择的科目和角色
         */
        var deleteAllSelectedKmAndJs = function(){
          objAndRightList = [];
          $scope.objAndRight = objAndRightList;
          $scope.ifKuMuListNull = false;
        };

        /**
         * 查询机构类别
         */
        $http.get(apiUrlJglb).success(function(data) {
          $scope.jigoulb_list = [];
          if(data && data.length > 0){
            $scope.jigoulb_list = data;
//            $scope.jigoulb_list = _.reject(data, function(jglb){
//              return jglb.LEIBIE_ID == 0;
//            });
            //锁定大学
//            _.each(data, function(jg, idx, lst){
//              if(jg.LEIBIE_ID == 1){
//                $scope.jigoulb_list.push(jg);
//              }
//            });
          }
          else{
            messageService.alertInfFun('err', '没用相关机构！');
          }
        });

        /**
         * 由机构类别查询机构 getJgId//
         */
        $scope.getJglist = function(jglbId){
          $scope.keMuListLengthExist = false;
          $scope.selected_jg = '';
          $scope.selected_ly = '';
          $http.get(jiGou_LeiBieUrl + jglbId).success(function(data) {
            if(data.length){
              $scope.jigou_list = data;
              $scope.lingyu_list = ''; //重置领域
            }
            else{
              $scope.jigou_list = '';
              $scope.lingyu_list = ''; //重置领域
              messageService.alertInfFun('err', '没有相关机构！');
            }
          });
        };
        $scope.getJglist(1);

        /**
         * 得到机构id//
         */
        $scope.getJgId = function(jgId){
          $scope.keMuListLengthExist = false;
          $scope.lingyu_list = ''; //重置领域
          $scope.selected_ly = '';
          jigouId = jgId;
          registerDate.jiGouName = $(".subOrganization  option:selected").text();
          qryParentLingYu(jgId);
        };

        /**
         * 查询父领域的代码
         */
        var qryParentLingYu = function(jgId){
          $http.get(apiUrlLy + jgId).success(function(data) {
            if(data.length){
              $scope.lingyu_list = data;
            }
            else{
              $scope.lingyu_list = '';
              messageService.alertInfFun('err', '没有相关领域！');
            }
          });
        };

        /**
         * 有父领域查询子领域领域（即科目）
         */
        $scope.getKemuList = function(lyId){
          var qryLyKmUrl;
          if($scope.selected_jg){
            if(lyId){
              qryLyKmUrl = apiLyKm + lyId + '&jigouid=' + $scope.selected_jg;
              $http.get(qryLyKmUrl).success(function(data) {
                if(data.length){
                  $scope.kemu_list = data;
                  $scope.keMuSelectBox = true;
                  $scope.keMuListLengthExist = true;
                  deleteAllSelectedKmAndJs();
                }
                else{
                  $scope.kemu_list = '';
                  $scope.keMuSelectBox = false;
                  $scope.keMuListLengthExist = false;
                  messageService.alertInfFun('err', '没有对应的科目！');
                }
              });
            }
            else{
              $scope.kemu_list = '';
              $scope.keMuSelectBox = false;
              $scope.keMuListLengthExist = false;
            }
          }
          else{
            messageService.alertInfFun('pmt', '机构ID不能为空！');
          }
        };

        /**
         *  查询角色的代码
         */
        $http.get(apiUrlJueSe).success(function(data) {
          if(data && data.length > 0){
            $scope.juese_list = data;
          }
          else{
            messageService.alertInfFun('err', '没有对应的角色！');
          }
        });

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
          if(!$scope.kemu_list.length){
            $scope.ifKuMuListNull = true; //添加按钮的显示和隐藏
          }
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
          if($scope.kemu_list.length){
            $scope.ifKuMuListNull = false;
          }
        };

        /**
         * 回到填写个人信息页面
         */
        $scope.goToPersonInfo = function(){
          $('.nav-tabs li').removeClass('active').eq(0).addClass('active');
          $('.tab-pane').removeClass('active').eq(0).addClass('active');
        };

        /**
         * 去提交个人信息页面
         */
        $scope.goToSubmit = function(){
          select_juese = [];
          _.each(objAndRightList, function(oar, indx, lst){
            _.each(oar.juese.jueseId, function(jsid, idx, lst){
              var jueseObg = {
                jigou: jigouId,
                lingyu: '',
                juese: ''
              };
              jueseObg.lingyu = oar.lingyu[0].LINGYU_ID;
              jueseObg.juese = jsid;
              select_juese.push(jueseObg);
            });
          });
          registerDate.juese = select_juese;
          $scope.registerDate = registerDate;
          $scope.stepThree = true;
          $('.nav-tabs li').removeClass('active').eq(2).addClass('active');
          $('.tab-pane').removeClass('active').eq(2).addClass('active');
        };

        /**
         * 去提交个人信息页面 getObjectAndRight
         */
        $scope.goToJueSe = function(){
          $('.nav-tabs li').removeClass('active').eq(1).addClass('active');
          $('.tab-pane').removeClass('active').eq(1).addClass('active');
        };

        /**
         * 提交个人信息
         */
        $scope.submitRegisterInfo = function(){
          registerDate.token = config.token;
//          registerDate.juese = select_juese;
          $http.post(registerUrl, registerDate).success(function(data){
            if(data.result){
              messageService.alertInfFun('suc', '提交成功！');
              $scope.stepTwo = false;
              $scope.stepThree = false;
              urlRedirect.goTo($location.$$path, '/renzheng');
            }
            else{
              messageService.alertInfFun('err', data.error);
            }
          });
        };

    }]);
});
