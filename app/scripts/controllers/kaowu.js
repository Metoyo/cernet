define(['jquery', 'underscore', 'angular', 'config'], // 000 开始
  function ($, _, angular, config) { // 001 开始
    'use strict';
    angular.module('cernetApp.controllers.KaowuCtrl', []) //controller 开始
      .controller('KaowuCtrl', ['$rootScope', '$scope', '$http', '$timeout', 'Myfileupload',
        'messageService',
        function ($rootScope, $scope, $http, $timeout, Myfileupload, messageService) { // 002 开始
          /**
           * 操作title
           */
          $rootScope.pageName = "考务"; //page title
          $rootScope.styles = ['styles/kaowu.css'];
          $rootScope.isRenZheng = false; //判读页面是不是认证

          /**
           * 定义变量
           */
          var userInfo = $rootScope.session.userInfo,
            baseKwAPIUrl = config.apiurl_kw, //考务的api
            baseMtAPIUrl = config.apiurl_mt, //mingti的api
            baseRzAPIUrl = config.apiurl_rz, //renzheng的api
            token = config.token,
            caozuoyuan = userInfo.UID,//登录的用户的UID   chaxun_kaoshi_liebiao
            jigouid = userInfo.JIGOU[0].JIGOU_ID,
            lingyuid = $rootScope.session.defaultLyId,
            qryKaoChangListUrl = baseKwAPIUrl + 'chaxun_kaodiankaochang_liebiao?token=' + token + '&caozuoyuan='
              + caozuoyuan + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid, //查询考场列表的url
            qryKaoChangDetailBaseUrl = baseKwAPIUrl + 'chaxun_kaodiankaochang?token=' + token + '&caozuoyuan='
              + caozuoyuan + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid, //查询考场详细的url
            qryKaoShiListUrl = baseKwAPIUrl + 'chaxun_kaoshi_liebiao?token=' + token + '&caozuoyuan='
              + caozuoyuan + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid, //查询考试列表的url
            qryKaoShiDetailBaseUrl = baseKwAPIUrl + 'chaxun_kaoshi?token=' + token + '&caozuoyuan='
              + caozuoyuan + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid, //查询考试详细的url
            qryCxsjlbUrl = baseMtAPIUrl + 'chaxun_shijuanliebiao?token=' + token + '&caozuoyuan=' + caozuoyuan +
              '&jigouid=' + jigouid + '&lingyuid=' + lingyuid, //查询试卷列表url
            kaoshi_data, //考试的数据格式
            kaochang_data, //考场的数据格式
            xiuGaiKaoShiUrl = baseKwAPIUrl + 'xiugai_kaoshi', //修改考试的url
            tongBuShiJuanUrl = baseKwAPIUrl + 'tongbu_shijuan', // 同步试卷信息的url
            isEditKaoShi = false, //是否为编辑考试
            isDeleteKaoShi = false, //是否为删除考试
            isEditKaoChang = false, //是否为编辑考场
            isDeleteKaoChang = false, //是否为删除考场
            xiuGaiKaoChangUrl = baseKwAPIUrl + 'xiugai_kaodiankaochang', //修改考场的url
            paperPageArr = [], //定义试卷页码数组
            sjlbIdArrRev = [], //存放所有试卷ID的数组
            totalPaperPage,//符合条件的试卷一共有多少页
            itemNumPerPage = 10, //每页显示多少条数据
            paginationLength = 11, //分页部分，页码的长度，目前设定为11
            qryShiJuanGaiYaoBase = baseMtAPIUrl + 'chaxun_shijuangaiyao?token=' + token + '&caozuoyuan=' + caozuoyuan +
              '&jigouid=' + jigouid + '&lingyuid=' + lingyuid + '&shijuanid=', //查询试卷概要的基础URL
            getUserNameBase = baseRzAPIUrl + 'get_user_name?token=' + token + '&uid=', //得到用户名的URL
            faBuKaoShiBaseUrl = baseKwAPIUrl + 'fabu_kaoshi?token=' + token + '&caozuoyuan=' + caozuoyuan +
              '&jigouid=' + jigouid + '&lingyuid=' + lingyuid + '&kaoshi_id=', //发布考试的url
            qryPaperDetailBase = baseMtAPIUrl + 'chaxun_shijuanxiangqing?token=' + token + '&caozuoyuan=' + caozuoyuan +
              '&jigouid=' + jigouid + '&lingyuid=' + lingyuid + '&shijuanid=', //查询试卷详情的url
            kaoShiPageArr = [], //定义考试页码数组
            kaoShiIdArrRev = [], //存放所有考试ID的数组
            totalKaoShiPage, //符合条件的考试一共有多少页
            kaoChangPageArr = [], //定义考场页码数组
            kaoChangIdArrRev = [], //存放所有考场ID的数组
            totalKaoChangPage, //符合条件的考场一共有多少页
            uploadKsUrl = baseMtAPIUrl + 'excel_to_json'; //上传考生信息

          $scope.tiXingNameArr = config.tiXingNameArr; //题型名称数组
          $scope.letterArr = config.letterArr; //题支的序号
          $scope.cnNumArr = config.cnNumArr; //汉语的大学数字
          $rootScope.dashboard_shown = true;
          $scope.kwParams = { //考务用到的变量
            ksListZt: '', //考试列表的状态
            showKaoShiDetail: false, //考试详细信息
            selectShiJuan: [], //存放已选择试卷的数组
            saveKaoShiBtnStat: false
          };

          /**
           * 格式化时间
           */
          var formatDate = function(dateStr){
            var mydateNew = new Date(dateStr),
              year = mydateNew.getUTCFullYear(), //根据世界时从 Date 对象返回四位数的年份
              month = mydateNew.getUTCMonth() + 1, //根据世界时从 Date 对象返回月份 (0 ~ 11)
              day = mydateNew.getUTCDate(), //根据世界时从 Date 对象返回月中的一天 (1 ~ 31)
              hour = mydateNew.getUTCHours(), //根据世界时返回 Date 对象的小时 (0 ~ 23)
              minute = mydateNew.getUTCMinutes(), //根据世界时返回 Date 对象的分钟 (0 ~ 59)
              joinDate; //返回最终时间
            if(month < 10){
              month = '0' + month;
            }
            if(day < 10){
              day = '0' + day;
            }
            if(hour < 10){
              hour = '0' + hour;
            }
            if(minute < 10){
              minute = '0' + minute;
            }
            joinDate = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
            return joinDate;
          };
          var formatDateZh = function(dateStr){ //转换为中国
            var mydateNew = new Date(dateStr),
              year = mydateNew.getFullYear(), //根据世界时从 Date 对象返回四位数的年份
              month = mydateNew.getMonth() + 1, //根据世界时从 Date 对象返回月份 (0 ~ 11)
              day = mydateNew.getDate(), //根据世界时从 Date 对象返回月中的一天 (1 ~ 31)
              hour = mydateNew.getHours(), //根据世界时返回 Date 对象的小时 (0 ~ 23)
              minute = mydateNew.getMinutes(), //根据世界时返回 Date 对象的分钟 (0 ~ 59)
              joinDate; //返回最终时间
            if(month < 10){
              month = '0' + month;
            }
            if(day < 10){
              day = '0' + day;
            }
            if(hour < 10){
              hour = '0' + hour;
            }
            if(minute < 10){
              minute = '0' + minute;
            }
            joinDate = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
            return joinDate;
          };

          /**
           * 考试的分页数据查询函数
           */
          $scope.getThisKaoShiPageData = function(pg){
            var pgNum = pg - 1,
              kaoshi_id,
              currentPage = pgNum ? pgNum : 0,
              qrySelectKaoShisUrl;
            $scope.kaoShiPages = [];
            //得到分页数组的代码
            var currentKsPageVal = $scope.currentKsPageVal = pg ? pg : 1;
            if(totalKaoShiPage <= paginationLength){
              $scope.kaoShiPages = kaoShiPageArr;
            }
            if(totalKaoShiPage > paginationLength){
              if(currentKsPageVal > 0 && currentKsPageVal <= 6 ){
                $scope.kaoShiPages = kaoShiPageArr.slice(0, paginationLength);
              }
              else if(currentKsPageVal > totalKaoShiPage - 5 && currentKsPageVal <= totalKaoShiPage){
                $scope.kaoShiPages = kaoShiPageArr.slice(totalKaoShiPage - paginationLength);
              }
              else{
                $scope.kaoShiPages = kaoShiPageArr.slice(currentKsPageVal - 5, currentKsPageVal + 5);
              }
            }
            //查询数据的代码
            kaoshi_id = kaoShiIdArrRev.slice(currentPage * itemNumPerPage, (currentPage + 1) * itemNumPerPage).toString();
            qrySelectKaoShisUrl = qryKaoShiDetailBaseUrl + '&kaoshiid=' + kaoshi_id;
            $http.get(qrySelectKaoShisUrl).success(function(ksdtl){
              if(ksdtl.length){
                $scope.loadingImgShow = false; //kaoShiList.html
                $scope.kaoshiList = ksdtl;
              }
              else{
                messageService.alertInfFun('pmt', '没有相关的考试！');
                $scope.loadingImgShow = false; //kaoShiList.html
              }
            });
          };

          /**
           * 显示考试列表,可分页的方法, zt表示状态 1，2，3，4为完成；5，6已完成
           */
          $scope.showKaoShiList = function(zt){
            var ztArr = [],
              qryKaoShiList;
            zt = zt || 'ing';
            $scope.loadingImgShow = true; //kaoShiList.html
            kaoShiPageArr = []; //定义考试页码数组
            kaoShiIdArrRev = []; //存放所有考试ID的数组
            //先查询所有考试的Id
            switch (zt) {
              case 'all':
                ztArr = [];
                break;
              case 'ing':
                ztArr = [0, 1, 2, 3, 4];
                break;
              case 'done':
                ztArr = [5, 6];
                break;
            }
            $scope.kwParams.ksListZt = zt;
            qryKaoShiList = qryKaoShiListUrl + '&zhuangtai=' + ztArr;
            $http.get(qryKaoShiList).success(function(kslst){
              if(kslst.length){
                $scope.kaoShiListIds = kslst; //得到所有的考试ids
                totalKaoShiPage = Math.ceil(kslst.length/itemNumPerPage); //得到所有考试的页码
                for(var i = 1; i <= totalKaoShiPage; i++){
                  kaoShiPageArr.push(i);
                }
                kaoShiIdArrRev = _.map(kslst, function(ksid){ return ksid.KAOSHI_ID; });
                $scope.lastKaoShiPageNum = totalKaoShiPage; //最后一页的数值
                //查询数据开始
                $scope.getThisKaoShiPageData();
                $scope.txTpl = 'views/partials/kaoShiList.html';
                $scope.isAddNewKaoSheng = false; //显示添加单个考生页面
                isEditKaoShi = false;//是否为编辑考试
                isDeleteKaoShi = false;//是否为删除考试
                $scope.kwParams.saveKaoShiBtnStat = false; //考试保存成功后，保存考试的按钮激活
              }
              else{
                $scope.kaoshiList = '';
                kaoShiPageArr = [];
                $scope.kaoShiPages = [];
                $scope.kaoShiListIds = [];
                $scope.kwParams.ksListZt = '';
                $scope.txTpl = 'views/partials/kaoShiList.html';
                $scope.isAddNewKaoSheng = false; //显示添加单个考生页面
                isEditKaoShi = false;//是否为编辑考试
                isDeleteKaoShi = false;//是否为删除考试
                messageService.alertInfFun('pmt', '没有相关的考试！');
                $scope.loadingImgShow = false; //kaoShiList.html
              }
            });
          };

          /**
           * 考务页面加载时，加载考试列表
           */
          $scope.showKaoShiList();

          /**
           * 重新加载 mathjax
           */
          $scope.$on('onRepeatLast', function(scope, element, attrs){
            $('.reloadMath').click();
          });

          /**
           * 显示试卷详情
           */
          $scope.showShiJuanInfo = function(sjId){
            var newCont,
              tgReg = new RegExp('<\%{.*?}\%>', 'g');
            var qryPaperDetail = qryPaperDetailBase + sjId;
            $http.get(qryPaperDetail).success(function(data){
              if(data){
                //给模板大题添加存放题目的数组
                _.each(data.MUBANDATI, function(mbdt, idx, lst){
                  mbdt.TIMUARR = [];
                  mbdt.datiScore = 0;
                });
                //将各个题目添加到对应的模板大题中
                _.each(data.TIMU, function(tm, idx, lst){
                  //修改填空题的题干
                  newCont = tm.DETAIL.TIGAN.tiGan.replace(tgReg, function(arg) {
                    var text = arg.slice(2, -2), //提起内容
                      textJson = JSON.parse(text),
                      _len = textJson.size,
                      i, xhStr = '';
                    for(i = 0; i < _len; i ++ ){
                      xhStr += '_';
                    }
                    return xhStr;
                  });
                  tm.DETAIL.TIGAN.tiGan = newCont;
                  _.each(data.MUBANDATI, function(mbdt, subIdx, subLst){
                    if(mbdt.MUBANDATI_ID == tm.MUBANDATI_ID){
                      mbdt.TIMUARR.push(tm);
                      mbdt.datiScore += parseFloat(tm.FENZHI);
                    }
                  });
                });
                //赋值
                $scope.paperDetail = data;
                $scope.showPaperDetail = true;
              }
              else{
                messageService.alertInfFun('err', '查询试卷失败！错误信息为：' + data.error);
              }
            });
          };

          /**
           * 关闭试卷详情
           */
          $scope.closePaperDetail = function(){
            $scope.showPaperDetail = false;
          };

          /**
           * 查询本机构下的所有考场
           */
          var qryAllKaoChang = function(){
            $scope.loadingImgShow = true; //kaoChangList.html
            $http.get(qryKaoChangDetailBaseUrl).success(function(data){
              if(data.length){
                $scope.allKaoChangList = data;
                $scope.loadingImgShow = false; //kaoChangList.html
              }
              else{
                $scope.loadingImgShow = false; //kaoChangList.html
                messageService.alertInfFun('pmt', '没有相关的考场数据!');
              }
            });
          };

          /**
           * 新增一个考试
           */
          $scope.addNewKaoShi = function(ks){
            $scope.isAddNewKaoSheng = false; //显示添加单个考生页面
            $scope.showPaperDetail = false; //控制试卷详情的显示和隐藏
            $scope.kwParams.selectShiJuan = []; //重置已选择的时间数组
            kaoshi_data = { //考试的数据格式
              token: token,
              caozuoyuan: caozuoyuan,
              jigouid: jigouid,
              lingyuid: lingyuid,
              shuju:{
                KAOSHI_ID: '',
                KAOSHI_MINGCHENG: '',
                KAISHISHIJIAN: '',
                JIESHUSHIJIAN: '',
                SHICHANG: '',
                XINGZHI: 1,
                LEIXING: 0,
                XUZHI: '',
                SHIJUAN_ID: [],
                shijuan_name: '',
                ZHUANGTAI: 0,
                KAOCHANG:[]
              }
            };
            if(isEditKaoShi){
              qryAllKaoChang();
              kaoshi_data.shuju.KAOSHI_ID = ks.KAOSHI_ID;
              kaoshi_data.shuju.KAOSHI_MINGCHENG = ks.KAOSHI_MINGCHENG;
              kaoshi_data.shuju.KAISHISHIJIAN = formatDate(ks.KAISHISHIJIAN);
              kaoshi_data.shuju.JIESHUSHIJIAN = ks.JIESHUSHIJIAN;
              kaoshi_data.shuju.SHICHANG = ks.SHICHANG;
              kaoshi_data.shuju.XINGZHI = ks.XINGZHI;
              kaoshi_data.shuju.LEIXING = ks.LEIXING;
              kaoshi_data.shuju.XUZHI = ks.XUZHI;
//              kaoshi_data.shuju.SHIJUAN_ID = ks.SHIJUAN[0].SHIJUAN_ID;
//              kaoshi_data.shuju.shijuan_name = ks.SHIJUAN[0].SHIJUAN_MINGCHENG;
              $scope.kwParams.selectShiJuan = ks.SHIJUAN;
              kaoshi_data.shuju.KAOCHANG = ks.KAODIANKAOCHANG;
              kaoshi_data.shuju.ZHUANGTAI = ks.ZHUANGTAI;
              $scope.kaoshiData = kaoshi_data;
              $scope.txTpl = 'views/partials/editKaoShi.html';
            }
            else if(isDeleteKaoShi){
              kaoshi_data.shuju.KAOSHI_ID = ks.KAOSHI_ID;
              kaoshi_data.shuju.KAOSHI_MINGCHENG = ks.KAOSHI_MINGCHENG;
              kaoshi_data.shuju.KAISHISHIJIAN = ks.KAISHISHIJIAN;
              kaoshi_data.shuju.JIESHUSHIJIAN = ks.JIESHUSHIJIAN;
              kaoshi_data.shuju.SHICHANG = ks.SHICHANG;
              kaoshi_data.shuju.XINGZHI = ks.XINGZHI;
              kaoshi_data.shuju.LEIXING = ks.LEIXING;
              kaoshi_data.shuju.XUZHI = ks.XUZHI;
              kaoshi_data.shuju.SHIJUAN_ID = _.map(ks.SHIJUAN, function(sj, key){ return sj.SHIJUAN_ID; });
              kaoshi_data.shuju.ZHUANGTAI = -1;
            }
            else{
              qryAllKaoChang();
              $scope.kaoshiData = kaoshi_data;
              $scope.txTpl = 'views/partials/editKaoShi.html';
            }
          };

          /**
           * 查询试卷概要的分页代码
           */
          $scope.getThisSjgyPageData = function(pg){
            var qryShiJuanGaiYao,
              pgNum = pg - 1,
              timu_id,
              currentPage = pgNum ? pgNum : 0,
              userIdArr = [];//存放user id的数组
            //得到分页数组的代码
            var currentPageVal = $scope.currentPageVal = pg ? pg : 1;
            if(totalPaperPage <= paginationLength){
              $scope.paperPages = paperPageArr;
            }
            if(totalPaperPage > paginationLength){
              if(currentPageVal > 0 && currentPageVal <= 6 ){
                $scope.paperPages = sjlbIdArrRev.slice(0, paginationLength);
              }
              else if(currentPageVal > totalPaperPage - 5 && currentPageVal <= totalPaperPage){
                $scope.paperPages = sjlbIdArrRev.slice(totalPaperPage - paginationLength);
              }
              else{
                $scope.paperPages = sjlbIdArrRev.slice(currentPageVal - 5, currentPageVal + 5);
              }
            }
            //查询数据的代码
            timu_id = sjlbIdArrRev.slice(currentPage * itemNumPerPage, (currentPage + 1) * itemNumPerPage).toString();
            qryShiJuanGaiYao = qryShiJuanGaiYaoBase + timu_id; //查询详情url
            $http.get(qryShiJuanGaiYao).success(function(sjlbgy){
              if(sjlbgy.length){
                _.each(sjlbgy, function(sj, idx, lst){
                  sj.NANDU = JSON.parse(sj.NANDU);
                  userIdArr.push(sj.CHUANGJIANREN_UID);
                });
                var userIdStr = _.chain(userIdArr).sortBy().uniq().value().toString();
                var getUserNameUrl = getUserNameBase + userIdStr;
                $http.get(getUserNameUrl).success(function(users){
                  if(users.length){
                    _.each(sjlbgy, function(sj, idx, lst){
                      _.each(users, function(usr, subidx, sublst){
                        if(usr.UID == sj.CHUANGJIANREN_UID){
                          sj.chuangjianren = usr.XINGMING;
                        }
                      });
                    });
                    $scope.paperListData = sjlbgy;
                    $scope.isShowPaperList = true;
                    $scope.showPopupBox = true; //试卷列表弹出层显示
                  }
                  else{
                    messageService.alertInfFun('err', '查询创建人名称失败！');
                  }
                });
              }
              else{
                messageService.alertInfFun('err', '没有相关数据！');
              }
            });
          };

          /**
           * 显示试卷列表
           */
          $scope.showPaperList = function(){
            paperPageArr = [];
            sjlbIdArrRev = []; //反转试卷列表id
            $http.get(qryCxsjlbUrl).success(function(sjlb){
              if(sjlb.length){
                $scope.papertListIds = sjlb;
                var sjlbIdArr; //试卷id列表数组
                totalPaperPage = Math.ceil(sjlb.length/itemNumPerPage); //试卷一共有多少页
                for(var i = 1; i <= totalPaperPage; i++){
                  paperPageArr.push(i);
                }
                $scope.lastPaperPageNum = totalPaperPage; //最后一页的数值
                sjlbIdArr = _.map(sjlb, function(sj){
                  return sj.SHIJUAN_ID;
                });
                sjlbIdArrRev = sjlbIdArr.reverse(); //将数组反转，按照时间倒叙排列
                //查询数据开始
                $scope.getThisSjgyPageData();
              }
              else{
                messageService.alertInfFun('err', sjlb.error);
              }
            });
          };

          /**
           * 关闭试卷列表
           */
          $scope.closePaperList = function(){
            $scope.showPopupBox = false;
          };

          /**
           * 返回到试卷添加页面
           */
          $scope.backToAddKaoShi = function(){
            $scope.txTpl = 'views/partials/editKaoShi.html';
          };

          /**
           * 将试卷添加到考试，目前只能添加到一个试卷
           */
          $scope.addToKaoShi = function(sj){
            var ifHasIn = _.find($scope.kwParams.selectShiJuan, function(sjData){
              return sjData.SHIJUAN_ID == sj.SHIJUAN_ID;
            });
            if(ifHasIn){
              messageService.alertInfFun('pmt', '此试卷已经在添加的考试，请选择其他试卷！');
            }
            else{
              $scope.kwParams.selectShiJuan.push(sj);
              $scope.showPopupBox = false;
            }
//            var qryPaperDetail = qryPaperDetailBase + sj.SHIJUAN_ID;
//            $http.get(qryPaperDetail).success(function(data){
//              if(!data.error){
//                //给模板大题添加存放题目的数组
//                _.each(data.MUBANDATI, function(mbdt, idx, lst){
//                  mbdt.TIMUARR = [];
//                  mbdt.datiScore = 0;
//                });
//                //将各个题目添加到对应的模板大题中
//                _.each(data.TIMU, function(tm, idx, lst){
//                  _.each(data.MUBANDATI, function(mbdt, subIdx, subLst){
//                    if(mbdt.MUBANDATI_ID == tm.MUBANDATI_ID){
//                      mbdt.TIMUARR.push(tm);
//                      mbdt.datiScore += parseFloat(tm.FENZHI);
//                    }
//                  });
//                });
//                //赋值
//                $scope.paperDetail = data;
//                kaoshi_data.shuju.SHIJUAN_ID = sj.SHIJUAN_ID; //试卷id
//                kaoshi_data.shuju.shijuan_name = sj.SHIJUANMINGCHENG; //试卷名称
//                $scope.showPopupBox = false;
//              }
//              else{
//                messageService.alertInfFun('err', '查询试卷失败！错误信息为：' + data.error);
//              }
//            });
          };

          /**
           * 删除已选试卷
           */
          $scope.deleteSelectShiJuan = function(sjId){
            $scope.kwParams.selectShiJuan = _.reject($scope.kwParams.selectShiJuan, function(sj){
              return sj.SHIJUAN_ID == sjId;
            });
          };

          /**
           * 将考场添加到考试
           */
          var selectKaoChangIdx, //如何考场已经存在，得到他的索引位置
            kaoChangId; //定义一个存放考场的字段
          $scope.selectKaoChang = function(kcId){
            kaoChangId = kcId;
            var isKaoChangExist = _.find(kaoshi_data.shuju.KAOCHANG, function(kch){
              return kch.KID == kcId;
            }); //查看新添加的考场是否存在

            if(isKaoChangExist){
              var kids = _.map(kaoshi_data.shuju.KAOCHANG, function(kch){
                return kch.KID;
              }); //得到本场考试的所有考场ID
              selectKaoChangIdx = _.indexOf(kids, kcId); //得到新添加的考场位置索引
            }
            else{
              var kcInfo = {};
              kcInfo.KID = kcId;
              kcInfo.USERS = [];
              kaoshi_data.shuju.KAOCHANG.push(kcInfo);
              selectKaoChangIdx = kaoshi_data.shuju.KAOCHANG.length - 1;
            }
            $scope.selectKaoChangIdx = selectKaoChangIdx;
          };

          /**
           * 添加单个考生页面显示
           */
          $scope.addNewKaoSheng = function(){
            $scope.isAddNewKaoSheng = true; //显示添加单个考生页面
            $scope.isImportKaoSheng = false; //导入考试页面隐藏
            $scope.studentNameIsNull = false; //考生姓名重置为空
            $scope.studentIDIsNull = false; //考生学号重置为空
          };

          /**
           * 文件上传
           */
          //存放上传文件的数组
          $scope.uploadFiles = [];

          //将选择的文件加入到数组
          $scope.$on("fileSelected", function (event, args) {
            $scope.$apply(function () {
              $scope.uploadFiles.push(args.file);
            });
          });

          //添加文件
          $scope.addMyFile = function(){
            $('input.addFileBtn').click();
          };

          //删除选择的文件
          $scope.deleteSelectFile = function(idx){
            $scope.uploadFiles.splice(idx, 1);
          };

          //关闭上传文件弹出层
          $scope.closeMediaPlugin = function(){
            $('#mediaPlugin').hide();
          };

          //保存上传文件
          $scope.uploadXlsFile = function() {
            var file = $scope.uploadFiles,
              fields = [{"name": "token", "data": token}],
              kaoShengOldArr = [],
              kaoShengNewArr = [],
              trimBlankReg = /\s/g,
              delBlank = '';

            Myfileupload.uploadFileAndFieldsToUrl(file, fields, uploadKsUrl).then(function(result){
              $scope.uploadFileUrl = result.data;
              $scope.uploadFiles = [];
              if(result.data.json){
                for(var item in result.data.json){
                  kaoShengOldArr = result.data.json[item];
                  break;
                }
                _.each(kaoShengOldArr, function(ks, idx, list){
                  var ksObj = {XINGMING: '', YONGHUHAO:'', BANJI: ''};
                  _.each(ks, function(value, key, list){
                    delBlank = key.replace(trimBlankReg, "");
                    switch (delBlank){
                      case '姓名' :
                        ksObj.XINGMING = value;
                        break;
                      case '学号':
                        ksObj.YONGHUHAO = value;
                        break;
                      case '班级':
                        ksObj.BANJI = value;
                    }
                  });
                  kaoShengNewArr.push(ksObj);
                });
                kaoshi_data.shuju.KAOCHANG[selectKaoChangIdx].USERS = kaoShengNewArr;
                messageService.alertInfFun('suc', '上传成功！');
              }
              else{
                messageService.alertInfFun('err', result.error);
              }
            });
          };

          /**
           * 导入考生列表页面显示
           */
          $scope.importKaoSheng = function(){
            $scope.isImportKaoSheng = true; //导入考生页面显示
            $scope.isAddNewKaoSheng = false; //添加单个考生页面隐藏
            $scope.isUploadDone = false;
            $scope.showImportStuds = false;
            $scope.showListBtn = false;
          };

          /**
           * 显示导入成功后的考生列表
           */
          $scope.showImportList = function(){
            if(kaoChangId){
              if(kaoshi_data.shuju.KAOCHANG[selectKaoChangIdx].USERS &&
                kaoshi_data.shuju.KAOCHANG[selectKaoChangIdx].USERS.length > 0){
                $scope.showImportStuds = true; //显示考生列表table
              }
              else{
                messageService.alertInfFun('err', '您还没有上传任何考生信息！');
              }
            }
            else{
              messageService.alertInfFun('pmt', '请选择考场！');
            }
          };

          /**
           * 关闭导入成功后的考生列表
           */
          $scope.hideImportList = function(){
            $scope.showImportStuds = false;
          };

          /**
           * 取消添加新考试
           */
          $scope.cancelAddStudent = function(){
            $scope.isAddNewKaoSheng = false; //显示添加单个考生页面
          };

          /**
           * 取消导入考生
           */
          $scope.cancelImportStudent = function(){
            $scope.isImportKaoSheng = false; //导入考生页面显示隐藏
            $scope.showImportStuds = false; //隐藏考生列表table
          };

          /**
           * 保存新添加的考生
           */
          $scope.saveNewStudent = function(){
            var usr = {},
              studentName = $('.studentName'),
              studentID = $('.studentID'),
              studentClass = $('.studentClass');
            if(!studentName.val()){
              $scope.studentNameIsNull = true;
            }
            if(!studentID.val()){
              $scope.studentIDIsNull = true;
            }
            if(studentName.val() && studentID.val()){
              usr.XINGMING = studentName.val();
              usr.YONGHUHAO = studentID.val();
              usr.BANJI = studentClass.val();
              kaoshi_data.shuju.KAOCHANG[selectKaoChangIdx].USERS.push(usr);
              studentName.val('');
              studentID.val('');
              studentClass.val('');
            }
          };

          /**
           * 删除考生
           */
          $scope.deleteStudent = function(idx){
            kaoshi_data.shuju.KAOCHANG[selectKaoChangIdx].USERS.splice(idx, 1);
          };

          /**
           * 检查输入的学号和姓名是否为空
           */
          $scope.checkInputVal = function(){
            var studentName = $('.studentName').val(),
              studentID = $('.studentID').val();
            if(studentName){
              $scope.studentNameIsNull = false;
            }
            if(studentID){
              $scope.studentIDIsNull = false;
            }
          };

          /**
           * 计算结束时间
           */
          $scope.calculateEndDate = function(){
            var inputStartDate = $('.start-date').val();
            if(inputStartDate && kaoshi_data.shuju.SHICHANG){
              var startDate = Date.parse(inputStartDate), //开始时间
                endDate = startDate + kaoshi_data.shuju.SHICHANG * 60 * 1000; //结束时间
              kaoshi_data.shuju.JIESHUSHIJIAN = formatDateZh(endDate);
            }
          };

          /**
           * 保存考试
           */
          $scope.saveKaoShi = function(){
            $scope.kaoShengErrorInfo = '';
            var inputStartDate = $('.start-date').val();
            //其他信息判断
            if(inputStartDate){
              if(kaoshi_data.shuju.KAOCHANG && kaoshi_data.shuju.KAOCHANG.length > 0){
                if(kaoshi_data.shuju.KAOCHANG[selectKaoChangIdx].USERS &&
                  kaoshi_data.shuju.KAOCHANG[selectKaoChangIdx].USERS.length){
                  $scope.startDateIsNull = false;
                  $scope.kwParams.saveKaoShiBtnStat = true;
                  var startDate = Date.parse(inputStartDate), //开始时间
                    endDate = startDate + kaoshi_data.shuju.SHICHANG * 60 * 1000, //结束时间
                    shijuan_info = { //需要同步的试卷数据格式
                      token: token,
                      caozuoyuan: caozuoyuan,
                      jigouid: jigouid,
                      lingyuid: lingyuid,
                      shijuanid: []
                    };
                  //将已选择的试卷进行数据处理分别添加的同步试卷和考试信息中
                  if($scope.kwParams.selectShiJuan.length > 0){
                    _.each($scope.kwParams.selectShiJuan, function(sj){
                      shijuan_info.shijuanid.push(sj.SHIJUAN_ID);
                    });
                  }
                  kaoshi_data.shuju.KAISHISHIJIAN = inputStartDate;
                  kaoshi_data.shuju.JIESHUSHIJIAN = formatDateZh(endDate);
                  kaoshi_data.shuju.SHIJUAN_ID = shijuan_info.shijuanid;
                  $http.post(tongBuShiJuanUrl, shijuan_info).success(function(rst){
                    if(rst.result){
                      $http.post(xiuGaiKaoShiUrl, kaoshi_data).success(function(data){
                        if(data.result){
                          $scope.showKaoShiList();
                          messageService.alertInfFun('suc', '考试添加成功！');
                          $scope.kwParams.selectShiJuan = []; //重置已选择的时间数组
                        }
                        else{
                          messageService.alertInfFun('err', data.error);
                          $scope.kaoShengErrorInfo = JSON.parse(data.error);
                          $scope.kwParams.saveKaoShiBtnStat = false;
                        }
                      });
                    }
                    else{
                      messageService.alertInfFun('err', rst.error);
                      $scope.kwParams.saveKaoShiBtnStat = false;
                    }
                  });
                }
                else{
                  messageService.alertInfFun('err', '请添加考生！')
                }
              }
              else{
                messageService.alertInfFun('err', '请选择考场！');
              }
            }
            else{
              $scope.startDateIsNull = true;
            }
          };

          /**
           * 修改考试
           */
          $scope.editKaoShi = function(ks){
            isEditKaoShi = true;
            isDeleteKaoShi = false;
            $scope.addNewKaoShi(ks);
          };

          /**
           * 删除考试
           */
          $scope.deleteKaoShi = function(ks){
            isEditKaoShi = false;
            isDeleteKaoShi = true;
            $scope.addNewKaoShi(ks);
            var confirmInfo = confirm("确定要删除考试吗？");
            if(confirmInfo){
              $http.post(xiuGaiKaoShiUrl, kaoshi_data).success(function(data){
                if(data.result){
                  $scope.showKaoShiList($scope.kwParams.ksListZt);
                  messageService.alertInfFun('suc', '考试删除成功！');
                }
                else{
                  messageService.alertInfFun('err', data.error);
                }
              });
            }
          };

          /**
           * 发布考试 faBuKaoShiBaseUrl
           */
          $scope.faBuKaoShi = function(ksId){
            var faBuKaoShiUrl = faBuKaoShiBaseUrl + ksId;
            var confirmInfo = confirm('确定要发布本次考试吗？');
            if(confirmInfo){
              $http.get(faBuKaoShiUrl).success(function(data){
                if(data.result){
                  $scope.showKaoShiList();
                  messageService.alertInfFun('suc', '本次考试发布成功！');
                }
                else{
                  messageService.alertInfFun('err', '考试发布失败！');
                }
              });
            }
          };

          /**
           * 查看考试详情
           */
          $scope.seeKaoShiDetail = function(ks){
            $scope.kaoShiDetailData = ks;
            $scope.kwParams.showKaoShiDetail = true;
          };

          /**
           * 查询考场数据
           */
          $scope.getThisKaoChangPageData = function(pg){
            $scope.loadingImgShow = true; //kaoChangList.html
            var pgNum = pg - 1,
              kaochang_id,
              currentPage = pgNum ? pgNum : 0,
              qrySelectKaoChangsUrl;
            //得到分页数组的代码
            var currentKcPageVal = $scope.currentKcPageVal = pg ? pg : 1;
            if(totalKaoChangPage <= paginationLength){
              $scope.kaoChangPages = kaoChangPageArr;
            }
            if(totalKaoChangPage > paginationLength){
              if(currentKcPageVal > 0 && currentKcPageVal <= 6 ){
                $scope.kaoChangPages = kaoChangPageArr.slice(0, paginationLength);
              }
              else if(currentKcPageVal > totalKaoChangPage - 5 && currentKcPageVal <= totalKaoChangPage){
                $scope.kaoChangPages = kaoChangPageArr.slice(totalKaoChangPage - paginationLength);
              }
              else{
                $scope.kaoChangPages = kaoChangPageArr.slice(currentKcPageVal - 5, currentKcPageVal + 5);
              }
            }
            //查询数据的代码
            kaochang_id = kaoChangIdArrRev.slice(currentPage * itemNumPerPage, (currentPage + 1) * itemNumPerPage).toString();
            qrySelectKaoChangsUrl = qryKaoChangDetailBaseUrl + '&kid=' + kaochang_id;
            $http.get(qrySelectKaoChangsUrl).success(function(kcdtl){
              if(kcdtl.length){
                $scope.loadingImgShow = false; //kaoChangList.html
                $scope.kaoChangList = kcdtl;
              }
              else{
                messageService.alertInfFun('err', '没有相关的考场信息！');
                $scope.loadingImgShow = false; //kaoChangList.html
              }
            });
          };

          /**
           * 显示考场列表
           */
          $scope.showKaoChangList = function(){
            $scope.loadingImgShow = true; //kaoChangList.html
            kaoChangPageArr = []; //定义考场页码数组
            kaoChangIdArrRev = []; //存放所有考场ID的数组
            $http.get(qryKaoChangListUrl).success(function(kclst){
              if(kclst.length){
                $scope.kaoChangListIds = kclst; //得到所有的考试ids
                totalKaoChangPage = Math.ceil(kclst.length/itemNumPerPage); //得到所有考试的页码
                for(var i = 1; i <= totalKaoChangPage; i++){
                  kaoChangPageArr.push(i);
                }
                kaoChangIdArrRev = _.map(kclst, function(kcid){ return kcid.KID; });
                $scope.lastKaoChangPageNum = totalKaoChangPage; //最后一页的数值
                //查询数据开始
                $scope.getThisKaoChangPageData();
                $scope.txTpl = 'views/partials/kaoChangList.html';
                isEditKaoChang = false; //是否为编辑考场
                isDeleteKaoChang = false; //是否为删除考场
              }
              else{
                $scope.txTpl = 'views/partials/kaoChangList.html';
                isEditKaoChang = false; //是否为编辑考场
                isDeleteKaoChang = false; //是否为删除考场
                messageService.alertInfFun('err', '没有相关的考场信息！');
                $scope.loadingImgShow = false; //kaoChangList.html
              }
            });
          };

          /**
           * 新增考场
           */
          $scope.addNewKaoChang = function(kc){
            kaochang_data = { //考场的数据格式
              token: token,
              caozuoyuan: caozuoyuan,
              jigouid: jigouid,
              lingyuid: lingyuid,
              shuju:{
                KID: '',
                KMINGCHENG: '',
                KAOWEISHULIANG: '',
                XIANGXIDIZHI: '',
                JIAOTONGFANGSHI: '',
                LIANXIREN: '',
                LIANXIFANGSHI: '',
                KLEIXING: 0,
                PARENT_ID: '',
                KAODIANXINGZHI: 0,
                ZHUANGTAI: 1
              }
            };
            if(isEditKaoChang){
              kaochang_data.shuju.KID = kc.KID;
              kaochang_data.shuju.KMINGCHENG = kc.KMINGCHENG;
              kaochang_data.shuju.KAOWEISHULIANG = kc.KAOWEISHULIANG;
              kaochang_data.shuju.XIANGXIDIZHI = kc.XIANGXIDIZHI;
              kaochang_data.shuju.JIAOTONGFANGSHI = kc.JIAOTONGFANGSHI;
              kaochang_data.shuju.LIANXIREN = kc.LIANXIREN;
              kaochang_data.shuju.LIANXIFANGSHI = kc.LIANXIFANGSHI;
              kaochang_data.shuju.KLEIXING = kc.KLEIXING;
              kaochang_data.shuju.PARENT_ID = kc.PARENT_ID;
              kaochang_data.shuju.KAODIANXINGZHI = kc.KAODIANXINGZHI;
              kaochang_data.shuju.ZHUANGTAI = kc.ZHUANGTAI;

              $scope.kaochangData = kaochang_data;
              $scope.txTpl = 'views/partials/editKaoChang.html';
            }
            else if(isDeleteKaoChang){
              kaochang_data.shuju = kc;
              kaochang_data.shuju.ZHUANGTAI = -1;
            }
            else{
              $scope.kaochangData = kaochang_data;
              $scope.txTpl = 'views/partials/editKaoChang.html';
            }
          };

          /**
           * 删除考场
           */
          $scope.deleteKaoChang = function(kc){
            isEditKaoChang = false; //是否为编辑考场
            isDeleteKaoChang = true; //是否为删除考场
            $scope.addNewKaoChang(kc);
            var confirmInfo = confirm("确定要删除考场吗？");
            if(confirmInfo){
              $http.post(xiuGaiKaoChangUrl, kaochang_data).success(function(data){
                if(data.result){
                  $scope.showKaoChangList();
                  qryAllKaoChang();
                  messageService.alertInfFun('suc', '考场删除成功！');
                }
                else{
                  messageService.alertInfFun('err', data.error);
                }
              });
            }
          };

          /**
           * 修改考场
           */
          $scope.editKaoChang = function(kc){
            isEditKaoChang = true; //是否为编辑考场
            isDeleteKaoChang = false; //是否为删除考场
            $scope.addNewKaoChang(kc);
          };

          /**
           * 保存考场
           */
          $scope.saveKaoChang = function(){
            $scope.loadingImgShow = true; //保存考场
            $http.post(xiuGaiKaoChangUrl, kaochang_data).success(function(data){
              if(data.result){
                $scope.loadingImgShow = false; //保存考场
                messageService.alertInfFun('suc', '考场保存成功！');
                $scope.showKaoChangList();
              }
              else{
                messageService.alertInfFun('err', data.error);
              }
            });
          };


        } // 002 结束
      ]); //controller 结束
  } // 001 结束
); // 000 结束
