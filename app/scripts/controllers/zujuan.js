define(['jquery', 'underscore', 'angular', 'config'], function ($, _, angular, config) { // 001
    'use strict';
    angular.module('cernetApp.controllers.ZujuanCtrl', [])
      .controller('ZujuanCtrl', ['$rootScope', '$scope', '$location', '$http', 'urlRedirect', '$q', '$timeout',
        'messageService',
        function ($rootScope, $scope, $location, $http, urlRedirect, $q, $timeout, messageService) { // 002
          /**
           * 操作title
           */
          $rootScope.pageName = "组卷";
          $rootScope.dashboard_shown = true;
          $rootScope.session.lsmb_id = []; //存放临时模板id的数组
          $rootScope.isRenZheng = false; //判读页面是不是认证

          /**
           * 声明变量
           */
          var userInfo = $rootScope.session.userInfo,
            baseMtAPIUrl = config.apiurl_mt, //mingti的api
            baseRzAPIUrl = config.apiurl_rz, //renzheng的api
            token = config.token,
            caozuoyuan = userInfo.UID,//登录的用户的UID
            jigouid = userInfo.JIGOU[0].JIGOU_ID,
            lingyuid = $rootScope.session.defaultLyId,
            tiKuLingYuId = $rootScope.session.defaultTiKuLyId,
            chaxunzilingyu = true,
            qryDgUrl = baseMtAPIUrl + 'chaxun_zhishidagang?token=' + token + '&caozuoyuan=' + caozuoyuan
              + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid + '&chaxunzilingyu=' + chaxunzilingyu,//查询大纲的url
            qryKnowledgeBaseUrl = baseMtAPIUrl + 'chaxun_zhishidagang_zhishidian?token=' + token + '&caozuoyuan=' +
              caozuoyuan + '&jigouid=' + jigouid + '&lingyuid=' + lingyuid + '&zhishidagangid=', //查询知识点基础url
            qryKnowledge = '', //定义一个空的查询知识点的url
            selectZsd = [],//定义一个选中知识点的变量（数组)
            selectZsdName = [],//定义一个选中知识点的变量的名称（数组)
            tixing_id = '', //用于根据题型id查询题目的字符串
            nandu_id = '', //用于根据难度查询题目的字符串
            zhishidian_id = '', //用于根据知识点查询题目的字符串
            qryKmTx = baseMtAPIUrl + 'chaxun_kemu_tixing?token=' + token + '&caozuoyuan=' + caozuoyuan + '&jigouid=' +
              jigouid + '&lingyuid=', //查询科目包含什么题型的url
            qrytimuliebiaoBase = baseMtAPIUrl + 'chaxun_timuliebiao?token=' + token + '&caozuoyuan=' + caozuoyuan +
              '&jigouid=' + jigouid + '&lingyuid=' + lingyuid, //查询题目列表的url
            qrytimuxiangqingBase = baseMtAPIUrl + 'chaxun_timuxiangqing?token=' + token + '&caozuoyuan=' + caozuoyuan +
              '&jigouid=' + jigouid + '&lingyuid=' + lingyuid, //查询题目详情基础url
            timudetails,//获得的题目数组
            tiMuIdArr = [], //获得查询题目ID的数组
            sjlbIdArrRev = [], //存放所有试卷ID的数组
            pageArr = [], //根据得到的试题数据定义一个分页数组
            paperPageArr = [], //定义试卷页码数组
            totalPage, //符合条件的试题数据一共有多少页
            totalPaperPage,//符合条件的试卷一共有多少页
            itemNumPerPage = 10, //每页显示多少条数据
            paginationLength = 11, //分页部分，页码的长度，目前设定为11
            shijuanData = { //试卷的数据模型
              token: token,
              caozuoyuan: caozuoyuan,
              jigouid: jigouid,
              lingyuid: lingyuid,
              shuju:{
                SHIJUAN_ID: '',
                SHIJUANMINGCHENG: '',
                FUBIAOTI: '',
                SHIJUANMULU_ID: '',
                SHIJUANMUBAN_ID: '',
                SHIJUAN_TIMU: [],
                ZHUANGTAI: 1
              }
            },
            xgsjUrl = baseMtAPIUrl + 'xiugai_shijuan', //提交试卷数据的URL
            mubanData = { //模板的数据模型
              token: token,
              caozuoyuan: caozuoyuan,
              jigouid: jigouid,
              lingyuid: lingyuid,
              shuju: {
                SHIJUANMUBAN_ID: '',
                MUBANMINGCHENG: '',
                SHIJUANZONGFEN: '',
                ISYUNXUHUITUI: 1,
                SUIJIPAITIFANGSHI: 1,
                DATIBIANHAOGESHI: '',
                XIAOTIBIANHAOGESHI: '',
                ZONGDAOYU: '',
                HASFUBIAOTI: 1,
                LEIXING: 2,
                MUBANDATI: [],
                TIMU_SUIJI: false,
                XUANXIANG_SUIJI: false
              }
            },
            xgmbUrl = baseMtAPIUrl + 'xiugai_muban', //提交模板数据的URL
            mbdt_data = [], // 得到模板大题的数组
            nanduTempData = [ //存放题型难度的数组
              {
                nanduId: '1',
                nanduName:'容易',
                nanduCount: []
              },
              {
                nanduId: '2',
                nanduName:'较易',
                nanduCount: []
              },
              {
                nanduId: '3',
                nanduName:'一般',
                nanduCount: []
              },
              {
                nanduId: '4',
                nanduName:'较难',
                nanduCount: []
              },
              {
                nanduId: '5',
                nanduName:'困难',
                nanduCount: []
              }
            ],
            nanduLength = nanduTempData.length, //难度数组的长度
            deletelsmbData = { //删除临时模板的数据模型
              token: token,
              caozuoyuan: caozuoyuan,
              jigouid: jigouid,
              lingyuid: lingyuid,
              muban_id: []
            },
            deletelsmbUrl = baseMtAPIUrl + 'shanchu_muban', //删除临时模板的url
            kmtxListLength, //获得科目题型的长度
            qryCxsjlbUrl = baseMtAPIUrl + 'chaxun_shijuanliebiao?token=' + token + '&caozuoyuan=' + caozuoyuan +
              '&jigouid=' + jigouid + '&lingyuid=' + lingyuid, //查询试卷列表url
            qryPaperDetailUrlBase = baseMtAPIUrl + 'chaxun_shijuanxiangqing?token=' + token + '&caozuoyuan=' + caozuoyuan +
              '&jigouid=' + jigouid + '&lingyuid=' + lingyuid + '&shijuanid=',//查询试卷列表url
            paperDetailData, //定义一个存放试卷详情的字段，用于保存试卷详情用于生成答题卡
            paperDetailId, //用来存放所选试卷的id
            paperDetailName, //用来存放所选试卷的名称
            zidongzujuan = baseMtAPIUrl + 'zidongzujuan', //自动组卷的url
            autoMakePaperData = {
              token: token,
              caozuoyuan: caozuoyuan,
              jigouid: jigouid,
              lingyuid: lingyuid,
              shuju: {
                NANDU: '',
                ZHISHIDIAN: [],
                TIXING: []
              }
            }, //自动组卷的数据格式
            qryShiJuanGaiYaoBase = baseMtAPIUrl + 'chaxun_shijuangaiyao?token=' + token + '&caozuoyuan=' + caozuoyuan +
              '&jigouid=' + jigouid + '&lingyuid=' + lingyuid + '&shijuanid=', //查询试卷概要的基础URL
            getUserNameBase = baseRzAPIUrl + 'get_user_name?token=' + token + '&uid=', //规则组卷
            guiZeZuJuanUrl = baseMtAPIUrl + 'guizezujuan', //规则组卷的url
            updateXuanTiRule = baseMtAPIUrl + 'xiugai_xuantiguize', //修改选题规则
            updateRuleUseTimes = baseMtAPIUrl + 'touch_xuantiguize', //更新选题规则使用次数
            qryXuanTiRuleBase = baseMtAPIUrl + 'chaxun_xuantiguize?token=' + token + '&caozuoyuan=' + caozuoyuan, //更新选题规则使用次数
            zuJuanRuleStr = '', //存放组卷规则的字符串，有json数据格式转化而来
            isComeFromRuleList = false, //是否由规则列表点进去的
            comeFromRuleListData = '', //存放已选组卷规则的变量
            zsdgZsdArr = [], //存放所有知识大纲知识点的数组
            qryTiKuUrl =  baseMtAPIUrl + 'chaxun_tiku?token=' + token + '&caozuoyuan=' + caozuoyuan +
              '&jigouid=' + jigouid + '&lingyuid=' + tiKuLingYuId, //查询题库
            qryMoRenDgUrl = baseMtAPIUrl + 'chaxun_zhishidagang?token=' + token + '&caozuoyuan=' + caozuoyuan + '&jigouid='
              + jigouid + '&lingyuid=' + lingyuid + '&chaxunzilingyu=' + chaxunzilingyu + '&moren=1'; //查询默认知识大纲的url

          /**
           * 初始化是DOM元素的隐藏和显示//
           */
          $scope.keMuList = true; //科目选择列表内容隐藏
          $scope.dgListBox = true; //大纲选择列表隐藏
          $scope.letterArr = config.letterArr; //题支的序号
          $scope.cnNumArr = config.cnNumArr; //汉语的大学数字
          $scope.shijuanData = shijuanData; // 试卷的数据
          $scope.mubanData = mubanData; // 模板的数据
          $scope.sjPreview = false; //试卷预览里面的试题试题列表
          $scope.nanduTempData = nanduTempData; //难度的数组
          $scope.shijuanyulanBtn = false; //试卷预览的按钮
          $scope.fangqibencizujuanBtn = false; //放弃本次组卷的按钮
          $scope.baocunshijuanBtn = false; //保存试卷的按钮
          $scope.shijuan_edit = false; //试卷编辑
          $scope.tiXingNameArr = config.tiXingNameArr; //题型名称数组
          $scope.txSelectenIdx = 0; //选择题型的索引
          $scope.ndSelectenIdx = 0; //选择难度的索引
          $scope.isSavePaperConfirm = false; //保存试卷前的确认
          $scope.showBackToPaperListBtn = false; //加载组卷页面是，返回试卷列表页面隐藏
          $scope.addMoreTiMuBtn = false; //添加更多试题的按钮
          $scope.isTestPaperSummaryShow = true; //div.testPaperSummary显示
          $scope.zj_tabActive = 'shiJuan'; //初始化组卷页面的tab的显示和隐藏
          $scope.zuJuanParam = { //组卷参数
            quChong: [
              {qcTime: 1, qcName: '1 年'},
              {qcTime: 2, qcName: '2 年'},
              {qcTime: 3, qcName: '3 年'},
              {qcTime: 4, qcName: '4 年'},
              {qcTime: 5, qcName: '5 年'}
            ],
            quChongNum: '',
            selectQuChongNum: '',
            inputQuChongNum: '',
            zjLastNd: '',
            xuanTiError: [],
            tiMuSuiJi: false,
            xuanXiangSuiJi: false,
            goToPageNum: '',
            tiMuId: '', //题目ID
            tiMuAuthorId: '', //出题人ID
            isFirstEnterZuJuan: true
          };

          /**
           * 获得大纲数据
           */
          $http.get(qryDgUrl).success(function(data){
            var newDgList = [];
            zsdgZsdArr = [];
            //得到知识大纲知识点的递归函数
            function _do(item) {
              zsdgZsdArr.push(item.ZHISHIDIAN_ID);
              if(item.ZIJIEDIAN && item.ZIJIEDIAN.length > 0){
                _.each(item.ZIJIEDIAN, _do);
              }
            }
            if(data.length){
//              _.each(data, function(dg, idx, lst){
//                if(dg.ZHUANGTAI2 == 2){
//                  newDgList.push(dg);
//                }
//              });
              $http.get(qryMoRenDgUrl).success(function(mrDg){
                if(mrDg && mrDg.length > 0){
                  newDgList = mrDg;
                  $scope.dgList = newDgList;
                  //获取大纲知识点
                  qryKnowledge = qryKnowledgeBaseUrl + newDgList[0].ZHISHIDAGANG_ID;
                  $http.get(qryKnowledge).success(function(zsddata){
                    if(zsddata.length){
                      $scope.kowledgeList = zsddata;
                      //得到知识大纲知识点id的函数
                      _.each(zsddata, _do);
                    }
                    else{
                      messageService.alertInfFun('err', zsddata.error);
                    }
                  });
                }
                else{
                  messageService.alertInfFun('err', mrDg.err);
                }
              });
            }
            else{
              messageService.alertInfFun('err', '没用相对应的知识大纲!');
            }
          });

          /**
           * 查询科目题型(chaxun_kemu_tixing)
           */
          $http.get(qryKmTx + lingyuid).success(function(kmtx){ //页面加载的时候调用科目题型
            if(kmtx){
              $scope.ampKmtxWeb = [];
              $scope.kmtxList = _.each(kmtx, function(txdata, idx, lst){
                txdata.itemsNum = 0;
                var txBoj = {
                  TIXING_ID: '',
                  TIXINGMINGCHENG: '',
                  txTotalNum: 0,
                  zsdXuanTiArr: []
                };
                txBoj.TIXING_ID = txdata.TIXING_ID;
                txBoj.TIXINGMINGCHENG = txdata.TIXINGMINGCHENG;
                $scope.ampKmtxWeb.push(txBoj);
              });
              kmtxListLength = kmtx.length; //科目题型的长度
            }
            else{
              messageService.alertInfFun('err', '获取查询科目题型失败！');
            }
          });

          /**
           * kmtx.datiScore的值清零
           */
          var restoreKmtxDtscore = function(){
            _.each($scope.kmtxList, function(kmtx, idx, lst){
              kmtx.datiScore = 0;
            });
          };

          /**
           * 点击,显示大纲列表
           */
          $scope.showDgList = function(dgl){ //dgl是判断da gang有没有数据
            if(dgl.length){
              $scope.dgListBox = $scope.dgListBox === false ? true: false; //点击是大纲列表展现
            }
          };

          /**
           * 加载大纲知识点
           */
          $scope.loadDgZsd = function(dg){
            angular.element(".selectDgName").html(dg.ZHISHIDAGANGMINGCHENG); //切换大纲名称
            qryKnowledge = qryKnowledgeBaseUrl + dg.ZHISHIDAGANG_ID;
            $http.get(qryKnowledge).success(function(data){
              if(data.error){
                $scope.kowledgeList = data;
                $scope.dgListBox = true;
              }
              else{
                messageService.alertInfFun('err', data.error);
              }
            });
          };

          /**
           * 点击展开和收起的按钮子一级显示和隐藏
           */
          $scope.toggleChildNode = function(idx) {
            var onClass = '.node' + idx,//得到那个button被点击了
              gitThisBtn = angular.element(onClass),//得到那个展开和隐藏按钮被点击了
              getTargetChild = gitThisBtn.closest('li').find('>ul');//得到要隐藏的ul
            gitThisBtn.toggleClass('unfoldBtn');
            getTargetChild.toggle();//实现子元素的显示和隐藏
          };

          /**
           点击checkbox得到checkbox的值(既是大纲知识点的值)
           */
          $scope.toggleSelection = function(zsdId) {
            var onSelect = '.select' + zsdId,
              gitThisChbx = angular.element(onSelect),//得到那个展开和隐藏按钮被点击了
              getTarChbxChild = gitThisChbx.closest('li').find('>ul');//得到要隐藏的ul;
            gitThisChbx.closest('li').find('div.foldBtn').addClass('unfoldBtn'); //得到相邻的foldBtn元素,添加unfoldBtn样式
            gitThisChbx.closest('li').find('ul').show();//下面的子元素全部展开

            getTarChbxChild.find('input[name=point]').each(function() {
              if(gitThisChbx.prop("checked")) {
                this.checked = true;
              } else {
                this.checked = false;
              }
            });

            selectZsd = [];
            selectZsdName = [];
            var cbArray = $('input[name=point]'),
              cbl = cbArray.length;
            for( var i = 0; i < cbl; i++) {
              if(cbArray.eq(i).prop("checked")) {
                selectZsd.push(cbArray.eq(i).val());
                selectZsdName.push(cbArray.eq(i).data('zsdname'));
              }
            }
            zhishidian_id = selectZsd.toString();
            if($scope.txTpl == 'views/partials/zj_testList.html'){
              $scope.qryTestFun();
            }
          };

          /**
           * 组卷规则的难度选择
           */
          $scope.zjNanDuSelect = function(nd){
            $scope.zjNaDuStar = '';
            if(nd){
              $scope.zjNaDuStar = 'zj-style-star-' + nd;
              $scope.zuJuanParam.zjLastNd = nd;
            }
          };

          /**
           * 难度选择时的拖拽
           */
          $scope.resize = function(idx){
            //初始化参数
            var dragBtn = 'sliderBtn' + idx,
              dragItem = 'sliderItem' + idx,
              showBox = 'coefft' + idx,
              greenBox = 'sliderItemInner' + idx,
              el = document.getElementById(dragBtn),
              els = document.getElementById(dragItem).style,
              x = 0, //鼠标的 X 和 Y 轴坐标
              dragItemClass = '#' + dragItem, //得到需要元素的id
              showBoxClass = '.' + showBox, //时时显示难度的容器
              greenBoxClass = '.' + greenBox, //绿色条的长度
              minWidth = 0,
              maxWidth = 220,
              distNum = 100;

            $(el).mousedown(function(e) {
              //按下元素后，计算当前鼠标与对象计算后的坐标
              x = e.clientX - el.offsetWidth - $(dragItemClass).width();
              //在支持 setCapture 做些东东
              el.setCapture ? (
                //捕捉焦点
                el.setCapture(),
                  //设置事件
                  el.onmousemove = function(ev) {
                    mouseMove(ev || event);
                  },
                  el.onmouseup = mouseUp
                ) : (
                //绑定事件
                $(document).bind("mousemove", mouseMove).bind("mouseup", mouseUp)
                );
              //防止默认事件发生
              e.preventDefault();
            });

            //移动事件
            function mouseMove(e) {
              var subDbWidth = $(dragItemClass).width();
              if(subDbWidth < minWidth - 1){
                $(document).unbind('mousemove', mouseMove);
                els.width = minWidth + 'px';
              }
              if(subDbWidth >= minWidth - 1 && subDbWidth <= maxWidth + 4){
                els.width = e.clientX - x + 'px';
              }
              if(subDbWidth > maxWidth + 4){
                els.width = maxWidth + 'px';
                $(document).unbind('mousemove', mouseMove);
              }
              distNum = $(greenBoxClass).width()/maxWidth; //得到难度系数
              $(showBoxClass).html(distNum.toFixed(2));
              if($scope.isAutoMakePaperDetailSetShow){
                $scope.ampKmtx[idx].tmNanDu = distNum.toFixed(2) ? distNum.toFixed(2) : 0.5; //每种题型设置个难度
                $scope.ampKmtx[idx].dagangArr = selectZsd;
              }
              else{
                autoMakePaperData.shuju.NANDU = distNum.toFixed(2) ? distNum.toFixed(2) : 0.5; //为自动组卷难度赋值
              }
            }

            //停止事件
            function mouseUp() {
              //在支持 releaseCapture
              el.releaseCapture ? (
                //释放焦点
                el.releaseCapture(),
                  //移除事件
                  el.onmousemove = el.onmouseup = null
                ) : (
                //卸载事件
                $(document).unbind('mousemove', mouseMove).unbind('mouseup', mouseUp)
                );
            }
          };

          /**
           *查询科目（LingYu，url：/api/ling yu）
           */
          $scope.lyList = userInfo.LINGYU; //从用户详细信息中得到用户的lingyu
          $scope.loadLingYu = function(){
            if($scope.keMuList){
              $scope.keMuList = false;
            }
            else{
              $scope.keMuList = true;
            }
          };

          /**
           * 重新加载 mathjax
           */
          $scope.$on('onRepeatLast', function(scope, element, attrs){
            $('.reloadMath').click();
          });

          /**
           * 查询试题的函数
           */
          $scope.qryTestFun = function(pg){
            $scope.loadingImgShow = true; //zj_testList.html
            var qrytimuliebiao, //查询题目列表的url
              chuangJianRenUidArr = []; //创建人UID数组
            tiMuIdArr = [];
            pageArr = [];
            if(zhishidian_id){
              qrytimuliebiao = qrytimuliebiaoBase + '&tixing_id=' + tixing_id + '&nandu_id=' + nandu_id +
                '&zhishidian_id=' + zhishidian_id + '&chuangjianren_uid=' + $scope.zuJuanParam.tiMuAuthorId; //查询题目列表的url
            }
            else{
              qrytimuliebiao = qrytimuliebiaoBase + '&tixing_id=' + tixing_id + '&nandu_id=' + nandu_id +
                '&zhishidian_id=' + zsdgZsdArr.join() + '&chuangjianren_uid=' + $scope.zuJuanParam.tiMuAuthorId; //查询题目列表的url
            }
            //查询题库
            $http.get(qryTiKuUrl).success(function(tiku){
              if(tiku.length){
                $http.get(qrytimuliebiao).success(function(data){
                  if(data.length){
                    $scope.testListId = data;
                    _.each(data, function(tm, idx, lst){
                      tiMuIdArr.push(tm.TIMU_ID);
                      chuangJianRenUidArr.push(tm.CHUANGJIANREN_UID);
                    });
                    //获得一共多少页的代码开始
                    totalPage = Math.ceil(data.length/itemNumPerPage);
                    for(var i = 1; i <= totalPage; i++){
                      pageArr.push(i);
                    }
                    $scope.lastPageNum = totalPage; //最后一页的数值
                    //得到创建人uid和姓名的数组
                    chuangJianRenUidArr = _.chain(chuangJianRenUidArr).uniq().sortBy().value().toString();
                    var getUserNameUrl = getUserNameBase + chuangJianRenUidArr;
                    if($scope.zuJuanParam.isFirstEnterZuJuan){
                      $http.get(getUserNameUrl).success(function(users){
                        if(users && users.length > 0){
                          $scope.chuTiRens = users;//创建人数组，临时性的 {uid: 1122, name: '邓继'}, {UID: 1122, XINGMING: '邓继'}
                          $scope.chuTiRens.unshift({UID: 'allUsr', XINGMING: '全部出题人'});
                          $scope.zuJuanParam.isFirstEnterZuJuan = false;
                          //查询数据开始
                          $scope.getThisPageData(pg);
                        }
                        else{
                          $scope.chuTiRens = [];
                          $scope.timudetails = null;
                          messageService.alertInfFun('err', '查询创建人名称失败！'); //
                          $scope.loadingImgShow = false; //testList.html loading
                        }
                      });
                    }
                    else{
                      //查询数据开始
                      $scope.getThisPageData(pg);
                    }
                  }
                  else{
                    tiMuIdArr = [];
                    pageArr = [];
                    totalPage = 0;
                    $scope.lastPageNum = 0;
                    $scope.pages = [];
                    $scope.timudetails = '';
                    $scope.testListId = [];
                    messageService.alertInfFun('err', '没有相应的题目！'); //
                    $scope.loadingImgShow = false; //testList.html loading
                  }
                });
              }
              else{
                messageService.alertInfFun('err', '没有题库！'); //
                $scope.loadingImgShow = false; //testList.html loading
              }
            });

          };

          /**
           * 查询题目详情的分页代码//
           */
          $scope.getThisPageData = function(pg){
            $scope.loadingImgShow = true; //zj_testList.html
            var qrytimuxiangqing,
              pgNum = pg - 1,
              timu_id,
              currentPage = pgNum ? pgNum : 0 ; //存放user id的数组

            //得到分页数组的代码
            var currentPageNum = $scope.currentPageNum = pg ? pg : 1;
            if(totalPage <= paginationLength){
              $scope.pages = pageArr;
            }
            if(totalPage > paginationLength){
              if(currentPageNum > 0 && currentPageNum <= 6 ){
                $scope.pages = pageArr.slice(0, paginationLength);
              }
              else if(currentPageNum > totalPage - 5 && currentPageNum <= totalPage){
                $scope.pages = pageArr.slice(totalPage - paginationLength);
              }
              else{
                $scope.pages = pageArr.slice(currentPageNum - 5, currentPageNum + 5);
              }
            }
            //查询数据的代码
            if($scope.zuJuanParam.tiMuId){
              timu_id = $scope.zuJuanParam.tiMuId;
              $scope.pages = [1];
            }
            else{
              timu_id = tiMuIdArr.slice(currentPage * itemNumPerPage, (currentPage + 1) * itemNumPerPage).toString();
            }
            qrytimuxiangqing = qrytimuxiangqingBase + '&timu_id=' + timu_id; //查询详情url
            $http.get(qrytimuxiangqing).success(function(data){
              if(data.length){
                _.each(data, function(tm, idx, lst){
                  //件创建人的姓名加入到题目里面
                  _.each($scope.chuTiRens, function(usr, subidx, sublst){
                    if(usr.UID == tm.CHUANGJIANREN_UID){
                      tm.chuangjianren = usr.XINGMING;
                    }
                  });
                });
                $scope.loadingImgShow = false; //zj_testList.html
                $scope.timudetails = data;
                $scope.caozuoyuan = caozuoyuan;
                timudetails = data;
              }
              else{
                messageService.alertInfFun('err', '没有相关的题目！');
                $scope.loadingImgShow = false; //zj_testList.html
              }
            })
          };

          /**
           * 得到特定页面的数据
           */
          $scope.getFixedPageData = function(){
            var goToPage = parseInt($scope.zuJuanParam.goToPageNum);
            if(goToPage && goToPage > 0 && goToPage <= $scope.lastPageNum){
              $scope.getThisPageData(goToPage);
            }
            else{
              messageService.alertInfFun('pmt', '请输入正确的跳转的页码！');
            }
          };

          /**
           * 通过题目ID查询试题
           */
          $scope.qryTestByTiMuId = function(){
            tiMuIdArr = [];
            pageArr = [];
            if($scope.zuJuanParam.tiMuId){
              $scope.testListId = [];
              $scope.testListId.push($scope.zuJuanParam.tiMuId);
              tiMuIdArr.push($scope.zuJuanParam.tiMuId);
              totalPage = 1;
              pageArr = [1];
              $scope.lastPageNum = totalPage; //最后一页的数值
              $scope.zuJuanParam.tiMuAuthorId = ''; //互斥
              //题型和难度选题重置
              tixing_id = '';
              $scope.txSelectenIdx = 0;
              nandu_id = '';
              $scope.ndSelectenIdx = 0;
              $scope.getThisPageData();
            }
            else{
              messageService.alertInfFun('pmt', '请输入要查询的题目ID！');
            }
          };

          /**
           * 通过出题人的UID查询试题//
           */
          $scope.qryTiMuByChuTiRenId = function(){
            if($scope.zuJuanParam.tiMuAuthorId){
              if($scope.zuJuanParam.tiMuAuthorId == 'allUsr'){
                $scope.zuJuanParam.tiMuAuthorId = '';
              }
              $scope.zuJuanParam.tiMuId = ''; //互斥
              $scope.qryTestFun();
            }
          };

          /**
           * 获得题型查询条件
           */
          $scope.getTiXingId = function(qrytxId){
            if(qrytxId >= 1){
              tixing_id = qrytxId;
              $scope.txSelectenIdx = qrytxId;
            }
            else{
              tixing_id = '';
              $scope.txSelectenIdx = 0;
            }
            $scope.zuJuanParam.tiMuId = '';
            $scope.qryTestFun();
          };

          /**
           * 获得难度查询条件
           */
          $scope.getNanDuId = function(qryndId){
            if(qryndId >= 1){
              nandu_id = qryndId;
              $scope.ndSelectenIdx = qryndId;
            }
            else{
              nandu_id = '';
              $scope.ndSelectenIdx = 0;
            }
            $scope.zuJuanParam.tiMuId = '';
            $scope.qryTestFun();
          };

          /**
           * 提交临时模板的数据
           */
          var getShiJuanMuBanData = function(){
            var deferred = $q.defer();
            mbdt_data = []; // 得到模板大题的数组
            _.each($scope.kmtxList, function(kmtx, idx, lst){
              var mubandatiItem = {
                MUBANDATI_ID: '',
                DATIMINGCHENG: '',
                SHUOMINGDAOYU:'',
                TIMUSHULIANG: '',
                MEITIFENZHI: '',
                XUHAO: '',
                ZHUANGTAI: 1,
                TIMUARR:[],//自己添加的数组
                datiScore: ''//自己定义此大题的分数
              };
              mubandatiItem.MUBANDATI_ID = kmtx.TIXING_ID;
              mubandatiItem.DATIMINGCHENG = kmtx.TIXINGMINGCHENG;
              mubandatiItem.XUHAO = kmtx.TIXING_ID;
              mubanData.shuju.MUBANDATI.push(mubandatiItem);
              mbdt_data.push(mubandatiItem);
            });

            $http.post(xgmbUrl, mubanData).success(function(data){
              if(data.result){
                $rootScope.session.lsmb_id.push(data.id); //新创建的临时模板id
                shijuanData.shuju.SHIJUANMUBAN_ID = data.id; //将创建的临时试卷模板id赋值给试卷的试卷模板id
                deferred.resolve();
              }
              else{
                messageService.alertInfFun('err', data.error);
                deferred.reject();
              }
            });

            return deferred.promise;
          };

          /**
           * 显示试题列表//
           */
          $scope.showTestList = function(txid){
            var dashboardWith = $('.dashboard').width();
            if(dashboardWith == 120){
            }
            else{
              $('.popupWrap').animate({
                left: '241px'
              }, 500, function() {
              });
            }
            //加载手动组卷的模板
            $scope.paper_hand_form = true;
            $scope.shijuanyulanBtn = true;
            //查询试题的函数
            $scope.getTiXingId(txid);
            $scope.txSelectenIdx = txid ? txid : 0;
            $scope.txTpl = 'views/partials/zj_testList.html';
            $scope.sjPreview = false;
          };

          /**
           * 点击添加新试卷，显示组卷列表
           */
          $scope.showZuJuanPage = function(){
            $scope.showBackToPaperListBtn = true;
            $scope.txTpl = 'views/partials/paper_preview.html';
          };

          /**
           *  手动组卷
           */
          $scope.handMakePaper = function(txid){
            var promise = getShiJuanMuBanData(); //保存试卷模板成功以后r
            promise.then(function(){
              $scope.showTestList(txid);
              $scope.shijuanyulanBtn = true; //试卷预览的按钮
              $scope.fangqibencizujuanBtn = true; //放弃本次组卷的按钮
              $scope.baocunshijuanBtn = true; //保存试卷的按钮
            });
          };

          /**
           * 自动组卷 autoMakePaperData
           */
          $scope.autoMakePaper = function(){
            var autoMakePaperKmtx,
              promise = getShiJuanMuBanData(); //保存试卷模板成功以后
            promise.then(function(){
              $scope.isAutoMakePaperDetailSetShow = false; //自动组卷加载的时候，详细设置隐藏
              autoMakePaperKmtx = $scope.kmtxList;
              _.each(autoMakePaperKmtx, function(aKmtx, idx, lst){
                aKmtx.tmNum = '';
                aKmtx.tmNanDu = '';
                aKmtx.dagangArr = [];
              });
              $scope.autoMakePaperClass = true; //加载自动组卷的样式
              $scope.ampKmtx = autoMakePaperKmtx;
            });
          };

          /**
           * 规则组卷
           */
          $scope.ruleMakePaper = function(zjr){
            var promise = getShiJuanMuBanData(); //保存试卷模板成功以后
            isComeFromRuleList = false;
            $scope.zuJuanParam.zjLastNd = '';
            promise.then(function(){
              $scope.isTestPaperSummaryShow = false; //div.testPaperSummary隐藏
              if(zjr){
                $scope.ampKmtxWeb = zjr.txTongJi;
                isComeFromRuleList = true;
                comeFromRuleListData = zjr;
              }
              else{
                _.each($scope.ampKmtxWeb, function(ampw, idx, lst){
                  ampw.txTotalNum = 0;
                  ampw.zsdXuanTiArr = [];
                });
                isComeFromRuleList = false;
                comeFromRuleListData = '';
              }
              $scope.ruleMakePaperTx = { selectTx: null };
              $scope.ruleMakePaperClass = true; //控制加载规则组卷的css
              $scope.txTpl = 'views/partials/zj_ruleMakePaper.html'; //加载规则组卷模板
            });
          };

          /**
           * 如果选出的题目没有达到规则规定的数量，运行的函数
           */
          var findWhichRuleHasNoItem = function(ruleData, tiMuTjData, itemData){
            var txArrs = [], groupObj;
            $scope.zuJuanParam.xuanTiError = [];
            _.each(ruleData, function(rl, idx, lst){
              if(rl.txTotalNum > 0 && (rl.txTotalNum != tiMuTjData[idx].itemsNum)){
                txArrs = _.filter(itemData, function(item){ return item.TIXING_ID == rl.TIXING_ID; });
                groupObj = _.groupBy(txArrs, function(tm){ return tm.NANDU_ID; });
                _.each(rl.zsdXuanTiArr, function(xt, subIdx, subLst){
                  var errorTx = {
                    errTxName: '',
                    errNanDu: '',
                    lessenVal: ''
                  };
                  if(groupObj[xt.NANDU * 5] && groupObj[xt.NANDU * 5].length > 0){
                    if(xt.TIXING[0].COUNT != groupObj[xt.NANDU * 5].length){
                      errorTx.errTxName = rl.TIXINGMINGCHENG;
                      errorTx.errNanDu = xt.NANDU * 5;
                      errorTx.lessenVal = parseInt(xt.TIXING[0].COUNT) - parseInt(groupObj[xt.NANDU * 5].length);
                      $scope.zuJuanParam.xuanTiError.push(errorTx);
                    }
                  }
                  else{
                    errorTx.errTxName = rl.TIXINGMINGCHENG;
                    errorTx.errNanDu = xt.NANDU * 5;
                    errorTx.lessenVal = parseInt(xt.TIXING[0].COUNT);
                    $scope.zuJuanParam.xuanTiError.push(errorTx);
                  }
                });
              }
            });
          };

          /**
           * 关闭规则组卷题目数量不匹配的信息窗口
           */
          $scope.closeRuleZuJuanTiMuNumErr = function(){
            $scope.zuJuanParam.xuanTiError = [];
          };

          /**
           * 由规则列表页直接组卷
           */
          $scope.directRuleMakePaper = function(dzjr){
            $scope.loadingImgShow = true;
            var promise = getShiJuanMuBanData(); //保存试卷模板成功以后
            promise.then(function(){
              //去选题
              var directRuleMakePaperData = JSON.parse(dzjr.GUIZEBIANMA),
                totalTiMuNums;
              _.each(dzjr.txTongJi, function(txArr, idx, lst){
                if(txArr.zsdXuanTiArr.length){
                  totalTiMuNums += txArr.txTotalNum;
                }
              });
              $http.post(guiZeZuJuanUrl, directRuleMakePaperData).success(function(tmIdsData){
                if(tmIdsData.length){
                  var qrytimuxiangqing = qrytimuxiangqingBase + '&timu_id=' + tmIdsData.toString(); //查询详情url
                  $http.get(qrytimuxiangqing).success(function(stdata){
                    if(stdata.length){
                      _.each(stdata, function(tm, idx, lst){
                        //将试题详情添加到mabandData
                        _.each(mubanData.shuju.MUBANDATI, function(mbdt, subIdx, lst){
                          if(mbdt.MUBANDATI_ID == tm.TIXING_ID){
                            mbdt.TIMUARR.push(tm);
                          }
                        });
                        //难度统计  nanduTempData NANDU_ID
                        for(var j = 0; j < nanduLength; j++){
                          if(nanduTempData[j].nanduId == tm.NANDU_ID){
                            nanduTempData[j].nanduCount.push(tm.TIMU_ID);
                          }
                        }
                      });
                      //统计每种题型的数量和百分比
                      _.each(mubanData.shuju.MUBANDATI, function(mbdt, idx, lst){
                        tixingStatistics(idx, kmtxListLength);
                      });
                      nanduPercent(); //难度统计
                      //判读是否执行完成
                      $scope.fangqibencizujuanBtn = true; //放弃本次组卷的按钮
                      $scope.baocunshijuanBtn = true; //保存试卷的按钮
                      $scope.isTestPaperSummaryShow = true;
                      $scope.loadingImgShow = false;
                      $scope.ruleMakePaperClass = false; //控制加载规则组卷的css
                      //新增加
                      zuJuanRuleStr = JSON.stringify(directRuleMakePaperData);
                      $scope.showBackToPaperListBtn = true;
                      isComeFromRuleList = true;
                      comeFromRuleListData = dzjr;
                      //试卷预览
                      $scope.shijuanPreview();
                      //规则题目数量与已选出的题目的对比
                      if(stdata.length != totalTiMuNums){
                        findWhichRuleHasNoItem(dzjr.txTongJi, $scope.kmtxList, stdata);
                      }
                    }
                    else{
                      $scope.timudetails = null;
                      $scope.loadingImgShow = false;
                      messageService.alertInfFun('err', stdata.error);
                    }
                  });
                }
                else{
                  $scope.loadingImgShow = false;
                  messageService.alertInfFun('err', tmIdsData.error);
                }
              });
            });
          };

          /**
           * 返回到组卷的3中情形页面
           */
          $scope.ruleBackToZuJuanHome = function(){
            _.each($scope.ampKmtxWeb, function(ampw, idx, lst){
              ampw.txTotalNum = 0;
              ampw.zsdXuanTiArr = [];
            });
            $scope.totalSelectedItmes = 0; //已选试题的总数量
            $scope.addMoreTiMuBtn = false; //添加试卷按钮隐藏
            $scope.autoMakePaperClass = false; //加载自动组卷的样式
            //clearData()代码
            mubanData.shuju.MUBANDATI = []; //清除模板中试题的临时数据
            shijuanData.shuju.SHIJUAN_TIMU = []; //清除试卷中的数据
            shijuanData.shuju.SHIJUANMINGCHENG = ''; //试卷名称重置
            shijuanData.shuju.FUBIAOTI = ''; //试卷副标题重置
            shijuanData.shuju.SHIJUANMUBAN_ID = ''; //删除试卷中的试卷模板id
            shijuanData.shuju.SHIJUAN_ID = ''; //清楚试卷id
            mubanData.shuju.ZONGDAOYU = ''; //试卷模板总导语重置
            _.each($scope.nanduTempData, function(ndkmtx, idx, lst){ //清除难度的数据
              ndkmtx.nanduCount = [];
              ndkmtx.ndPercentNum = '0%';
              return ndkmtx;
            });
            _.each($scope.kmtxList, function(tjkmtx, idx, lst){ //清除科目题型的统计数据
              tjkmtx.itemsNum = 0;
              tjkmtx.txPercentNum = '0%';
              return tjkmtx;
            });
            $scope.selectTestStr = ''; //清除试题加入和移除按钮
            $scope.shijuanyulanBtn = false; //试卷预览的按钮
            $scope.fangqibencizujuanBtn = false; //放弃本次组卷的按钮
            $scope.baocunshijuanBtn = false; //保存试卷的按钮
            deleteTempTemp();
            restoreKmtxDtscore();
            $scope.ruleMakePaperClass = false; //控制加载规则组卷的css
            //返回组卷页面还是组卷规则列表页
            $scope.paper_hand_form = false; //手动组卷时添加的样式
            $scope.sjPreview = false;
            if(isComeFromRuleList){
              $scope.txTpl = 'views/partials/zj_home.html'; //返回组卷首页
              $scope.zj_tabActive = 'zjRule';
              isComeFromRuleList = false;
              comeFromRuleListData = '';
            }
            else{
              $scope.txTpl = 'views/partials/paper_preview.html'; //加载试卷预览模板
            }
          };

          /**
           * 规则组卷得到题型题型信息
           */
          var ruleMakePaperSelectTxid; //规则组卷，题型ID

          $scope.rmpGetTxId = function(txId){
            ruleMakePaperSelectTxid = txId;
          };

          /**
           * 规则组卷将条件添加到相应的数组
           */
          $scope.addRuleCondition = function(){
            var targetTx = {
                NANDU: '', // 难度系数
                ZHISHIDIAN: [], //知识点ID, 数组
                zsdNameArr: [], //知识点名称, 数组
                PIPEIDU: 1, //匹配度
                TIXING: [{
                  TIXING_ID: '',
                  COUNT: ''
                }] //{TIXING_ID: 1, COUNT: 10}
              },
              txNumClass = $('.ruleMakePaper-header input.txNum'),
              txNum = parseInt(txNumClass.val()),
              coefftRule = (parseInt($scope.zuJuanParam.zjLastNd) - 1) * 0.25;
            if(selectZsd.length){
              if(ruleMakePaperSelectTxid){
                if(txNum){
                  if(coefftRule){
                    targetTx.TIXING[0].TIXING_ID = ruleMakePaperSelectTxid;
                    targetTx.TIXING[0].COUNT = txNum;
                    targetTx.NANDU = coefftRule;
                    targetTx.ZHISHIDIAN = selectZsd;
                    targetTx.zsdNameArr = selectZsdName;
                    _.each($scope.ampKmtxWeb, function(txw, idx, lst){
                      if(txw.TIXING_ID == targetTx.TIXING[0].TIXING_ID){
                        txw.zsdXuanTiArr.push(targetTx);
                        txw.txTotalNum += targetTx.TIXING[0].COUNT;//统计题目数量
                      }
                    });
                    txNumClass.val(''); //重置题目数量
                    $('input[name=point]:checked').prop('checked', false);//重置知识点
                    selectZsd = [];
                    selectZsdName = [];
                    $('.zj-style-star li').removeClass('active');
                    $scope.zuJuanParam.zjLastNd = '';
                    $scope.zjNaDuStar = '';
                  }
                  else{
                    messageService.alertInfFun('pmt', '请选择难度！');
                  }
                }
                else{
                  messageService.alertInfFun('pmt', '请填写数量！');
                }
              }
              else{
                messageService.alertInfFun('pmt', '请选择题型！');
              }
            }
            else{
              messageService.alertInfFun('pmt', '请选择知识点！');
            }
          };

          /**
           * 删除组卷的条件
           */
          $scope.deleteRuleCondition = function(txw, idx){
            txw.txTotalNum -= parseInt(txw.zsdXuanTiArr[idx].TIXING[0].COUNT);
            txw.zsdXuanTiArr.splice(idx, 1);
          };

          /**
           * 组卷规则的增删改
           */
          $scope.saveZjRule = function(rule, opt, isSavePaper){
            //rule是具体的数据，opt是要实现的功能sav(保存), upd(修改), del(删除)
            var ruleData = {
                token: token,
                caozuoyuan: caozuoyuan,
                lingyuid: lingyuid,
                shuju:{
                  XUANTIGUIZE_ID: '',//选题规则ID (留空表示新建)
                  GUIZEMINGCHENG: '',// 规则名称
                  GUIZEBIANMA: '',//规则编码
                  GUIZESHUOMING: '', //规则说明
                  ZHUANGTAI: 1 //状态(-1表示删除, 否则表示添加或修改)
                }
              },
              date = new Date(),
              monthStr = (date.getMonth() + 1) > 9 ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1)),
              dayStr = date.getDate() > 9 ? date.getDate() : ('0' + date.getDate()),
              currentDate = monthStr.toString() + dayStr.toString(), //当前的日期
              saveZjRuleFun = function(){
                $http.post(updateXuanTiRule, ruleData).success(function(data){
                  if(data.id){
                    if(isSavePaper){ //判断是否为保存试卷，如果是话，更新使用次数
                      var guizeTouch = {
                        token: token,
                        caozuoyuan: caozuoyuan,
                        xuantiguize_id: data.id
                      };
                      $http.post(updateRuleUseTimes, guizeTouch).success(function(subData){
                        if(subData.result){
                          isComeFromRuleList = false;
                          comeFromRuleListData = '';
                        }
                        else{
                          messageService.alertInfFun('err', subData.error);
                        }
                      });
                    }
                    else{
                      qryZjRule();
                    }
                  }
                  else{
                    messageService.alertInfFun('pmt', data.error);
                  }
                });
              };
            if(opt == 'sav'){
              ruleData.shuju.GUIZEMINGCHENG = '组卷规则' + currentDate;
              ruleData.shuju.GUIZEBIANMA = rule;
            }
            if(opt == 'upd'){
              ruleData.shuju.XUANTIGUIZE_ID = rule.XUANTIGUIZE_ID;
              ruleData.shuju.GUIZEMINGCHENG = rule.GUIZEMINGCHENG;
              ruleData.shuju.GUIZEBIANMA = rule.GUIZEBIANMA;
              ruleData.shuju.GUIZESHUOMING = rule.GUIZESHUOMING;
            }
            if(opt == 'del'){
              ruleData.shuju.XUANTIGUIZE_ID = rule;
              ruleData.shuju.ZHUANGTAI = -1;
            }
            if(ruleData.shuju.GUIZEBIANMA.length || ruleData.shuju.XUANTIGUIZE_ID){
              if(opt == 'del'){
                if(confirm('确定要删除此规则吗？')){
                  saveZjRuleFun();
                }
              }
              else{
                saveZjRuleFun();
              }
            }
          };

          /**
           * 查询组卷规则
           */
          var qryZjRule = function(rId){
            $scope.loadingImgShow = true; //zj_ruleList.html
            var qryXuanTiRule;
            if(rId){
              qryXuanTiRule = qryXuanTiRuleBase + '&xuantiguize_id=' + rId;
            }
            else{
              qryXuanTiRule = qryXuanTiRuleBase;
            }
            $http.get(qryXuanTiRule).success(function(data){
              if(data){
                $scope.loadingImgShow = false; //zj_ruleList.html
                _.each(data, function(rule, idx, lst){
                  //给查询出来的数组重新赋值
                  rule.txTongJi = [];
                  _.each($scope.ampKmtxWeb, function(wcont, idx1, lst1){
                    var txTotalObj = {
                      TIXING_ID: '',
                      TIXINGMINGCHENG: '',
                      txTotalNum: 0,
                      zsdXuanTiArr:[]
                    };
                    txTotalObj.TIXING_ID = wcont.TIXING_ID;
                    txTotalObj.TIXINGMINGCHENG = wcont.TIXINGMINGCHENG;
                    rule.txTongJi.push(txTotalObj);
                  });
                  //统计具体的数字
                  var ruleObj = JSON.parse(rule.GUIZEBIANMA);
                  _.each(ruleObj.shuju.items, function(it, subIdx, subLst){
                    _.each(rule.txTongJi, function(ampw, idx3, lst3){
                      if(ampw.TIXING_ID == it.TIXING[0].TIXING_ID){
                        ampw.txTotalNum += it.TIXING[0].COUNT;
                        ampw.zsdXuanTiArr.push(it);
                      }
                    });
                  });
                });
                $scope.zjRuleData = data;
              }
              else{
                $scope.loadingImgShow = false; //zj_ruleList.html
                messageService.alertInfFun('err', data.error);
              }
            });
          };

          /**
           * 检查下拉框的去重数据
           */
          $scope.checkSelectQuChongNum = function(){
            if($scope.zuJuanParam.selectQuChongNum) {
              $scope.zuJuanParam.inputQuChongNum = '';
              $scope.zuJuanParam.quChongNum = $scope.zuJuanParam.selectQuChongNum;
            }
          };

          /**
           * 检查下拉框的去重数据
           */
          $scope.checkInPutQuChongNum = function(){
            if(isNaN($scope.zuJuanParam.inputQuChongNum)){
              $scope.zuJuanParam.inputQuChongNum = '';
            }
            if($scope.zuJuanParam.inputQuChongNum) {
              $scope.zuJuanParam.selectQuChongNum = '';
              $scope.zuJuanParam.quChongNum = parseInt($scope.zuJuanParam.inputQuChongNum);
            }
          };

          /**
           * 保存规则组卷数据
           */
          $scope.addRuleMakePaperShiJuan = function(){
            var distAutoMakePaperData = {
                token: token,
                caozuoyuan: caozuoyuan,
                jigouid: jigouid,
                lingyuid: lingyuid,
                shuju:{
                  items: []
                }
              },
              totalTiMuNums = 0; //规则组卷出题的总数量
            $scope.ruleMakePaperSaveBtnDisabled = true;
            //得到题型数量和难度的数组
            _.each($scope.ampKmtxWeb, function(txArr, idx, lst){
              if(txArr.zsdXuanTiArr.length){
                totalTiMuNums += txArr.txTotalNum;
                _.each(txArr.zsdXuanTiArr, function(ntx, subIdx, subLst){
                  distAutoMakePaperData.shuju.items.push(ntx);
                });
              }
            });
            if($scope.zuJuanParam.inputQuChongNum || $scope.zuJuanParam.selectQuChongNum){
              if($scope.zuJuanParam.quChongNum){
                distAutoMakePaperData.shuju.exclude = { type: "year", value: $scope.zuJuanParam.quChongNum };
              }
            }
            else{
              $scope.zuJuanParam.quChongNum = '';
            }
            if(distAutoMakePaperData.shuju.items.length){
              $scope.loadingImgShow = true;
              $http.post(guiZeZuJuanUrl, distAutoMakePaperData).success(function(tmIdsData){
                if(tmIdsData.length){
                  var qrytimuxiangqing = qrytimuxiangqingBase + '&timu_id=' + tmIdsData.toString(); //查询详情url
                  $http.get(qrytimuxiangqing).success(function(stdata){
                    if(stdata.length){
                      _.each(stdata, function(tm, idx, lst){
                        //将试题详情添加到mabandData
                        _.each(mubanData.shuju.MUBANDATI, function(mbdt, subIdx, lst){
                          if(mbdt.MUBANDATI_ID == tm.TIXING_ID){
                            mbdt.TIMUARR.push(tm);
                          }
                        });
                        //难度统计  nanduTempData NANDU_ID
                        for(var j = 0; j < nanduLength; j++){
                          if(nanduTempData[j].nanduId == tm.NANDU_ID){
                            nanduTempData[j].nanduCount.push(tm.TIMU_ID);
                          }
                        }
                      });
                      //统计每种题型的数量和百分比
                      _.each(mubanData.shuju.MUBANDATI, function(mbdt, idx, lst){
                        tixingStatistics(idx, kmtxListLength);
                      });
                      nanduPercent(); //难度统计
                      //判读是否执行完成
                      $scope.fangqibencizujuanBtn = true; //放弃本次组卷的按钮
                      $scope.baocunshijuanBtn = true; //保存试卷的按钮
                      $scope.shijuanPreview();
                      $scope.isTestPaperSummaryShow = true;
                      $scope.loadingImgShow = false;
                      $scope.ruleMakePaperClass = false; //控制加载规则组卷的css
                      //规则题目数量与已选出的题目的对比
                      if(stdata.length != totalTiMuNums){
                        findWhichRuleHasNoItem($scope.ampKmtxWeb, $scope.kmtxList, stdata);
                      }
                      //保存规则用到的转化
                      zuJuanRuleStr = JSON.stringify(distAutoMakePaperData);
                      $scope.ruleMakePaperSaveBtnDisabled = false;
                    }
                    else{
                      $scope.timudetails = null;
                      $scope.loadingImgShow = false;
                      $scope.ruleMakePaperSaveBtnDisabled = false;
                      messageService.alertInfFun('err', stdata.error);
                    }
                  });
                }
                else{
                  $scope.loadingImgShow = false;
                  $scope.ruleMakePaperSaveBtnDisabled = false;
                  messageService.alertInfFun('pmt', tmIdsData.error);
                }
              });
            }
            else{
              $scope.loadingImgShow = false;
              $scope.ruleMakePaperSaveBtnDisabled = false;
              messageService.alertInfFun('err', '请选择题型！');
            }
          };
//          $scope.addRuleMakePaperShiJuan = function(){
//            var distAutoMakePaperData = {
//                token: token,
//                caozuoyuan: caozuoyuan,
//                jigouid: jigouid,
//                lingyuid: lingyuid,
//                shuju:{
//                  items: []
//                }
//              },
//              totalTiMuNums = 0; //规则组卷出题的总数量
//            $scope.ruleMakePaperSaveBtnDisabled = true;
//            //得到题型数量和难度的数组
//            _.each($scope.ampKmtxWeb, function(txArr, idx, lst){
//              if(txArr.zsdXuanTiArr.length){
//                totalTiMuNums += txArr.txTotalNum;
//                _.each(txArr.zsdXuanTiArr, function(ntx, subIdx, subLst){
//                  var tiMuNum = ntx.TIXING[0].COUNT, //题目数量
//                    zsdLength = ntx.ZHISHIDIAN.length, //知识点数量
//                    divideResult = parseInt(tiMuNum)/parseInt(zsdLength), //题目数量除以知识点数量所得得到的值
//                    floorVal = Math.floor(divideResult); //得到向下的整数值，用做题目数量
//                  if(divideResult >= 1){
//                    _.each(ntx.ZHISHIDIAN, function(zsd, thdIdx, thdLst){
//                      var gzObj = { //组卷规则所需要的数据格式
//                        NANDU: ntx.NANDU,
//                        PIPEIDU: ntx.PIPEIDU,
//                        TIXING: [{
//                          COUNT: '',
//                          TIXING_ID: ntx.TIXING[0].TIXING_ID
//                        }],
//                        ZHISHIDIAN: [],
//                        zsdNameArr: []
//                      };
//                      if(thdIdx < zsdLength - 1){ //当索引值小于知识点的长度减1时，题目数量就是floorVal的值
//                        gzObj.TIXING[0].COUNT = floorVal;
//                      }
//                      else{ //当索引值等于知识点的长度减1时，题目数量就是剩余的题目数量
//                        gzObj.TIXING[0].COUNT = parseInt(tiMuNum) - parseInt(thdIdx) * floorVal;
//                      }
//                      gzObj.ZHISHIDIAN.push(zsd);
//                      gzObj.zsdNameArr.push(ntx.zsdNameArr[thdIdx]);
//                      distAutoMakePaperData.shuju.items.push(gzObj);
//                    })
//                  }
//                  else{
//                    distAutoMakePaperData.shuju.items.push(ntx);
//                  }
//                });
//              }
//            });
//            if($scope.zuJuanParam.inputQuChongNum || $scope.zuJuanParam.selectQuChongNum){
//              if($scope.zuJuanParam.quChongNum){
//                distAutoMakePaperData.shuju.exclude = { type: "year", value: $scope.zuJuanParam.quChongNum };
//              }
//            }
//            else{
//              $scope.zuJuanParam.quChongNum = '';
//            }
//            if(distAutoMakePaperData.shuju.items.length){
//              $scope.loadingImgShow = true;
//              $http.post(guiZeZuJuanUrl, distAutoMakePaperData).success(function(tmIdsData){
//                if(tmIdsData && tmIdsData.length > 0){
//                  var qrytimuxiangqing = qrytimuxiangqingBase + '&timu_id=' + tmIdsData.toString(); //查询详情url
//                  $http.get(qrytimuxiangqing).success(function(stdata){
//                    if(stdata.length){
//                      _.each(stdata, function(tm, idx, lst){
//                        //将试题详情添加到mabandData
//                        _.each(mubanData.shuju.MUBANDATI, function(mbdt, subIdx, lst){
//                          if(mbdt.MUBANDATI_ID == tm.TIXING_ID){
//                            mbdt.TIMUARR.push(tm);
//                          }
//                        });
//                        //难度统计  nanduTempData NANDU_ID
//                        for(var j = 0; j < nanduLength; j++){
//                          if(nanduTempData[j].nanduId == tm.NANDU_ID){
//                            nanduTempData[j].nanduCount.push(tm.TIMU_ID);
//                          }
//                        }
//                      });
//                      //统计每种题型的数量和百分比
//                      _.each(mubanData.shuju.MUBANDATI, function(mbdt, idx, lst){
//                        tixingStatistics(idx, kmtxListLength);
//                      });
//                      nanduPercent(); //难度统计
//                      //判读是否执行完成
//                      $scope.fangqibencizujuanBtn = true; //放弃本次组卷的按钮
//                      $scope.baocunshijuanBtn = true; //保存试卷的按钮
//                      $scope.shijuanPreview();
//                      $scope.isTestPaperSummaryShow = true;
//                      $scope.loadingImgShow = false;
//                      $scope.ruleMakePaperClass = false; //控制加载规则组卷的css
//                      //规则题目数量与已选出的题目的对比
//                      if(stdata.length != totalTiMuNums){
//                        findWhichRuleHasNoItem($scope.ampKmtxWeb, $scope.kmtxList, stdata);
//                      }
//                      //保存规则用到的转化
//                      zuJuanRuleStr = JSON.stringify(distAutoMakePaperData);
//                      $scope.ruleMakePaperSaveBtnDisabled = false;
//                    }
//                    else{
//                      $scope.timudetails = null;
//                      $scope.loadingImgShow = false;
//                      $scope.ruleMakePaperSaveBtnDisabled = false;
//                      messageService.alertInfFun('err', stdata.error);
//                    }
//                  });
//                }
//                else{
//                  $scope.loadingImgShow = false;
//                  $scope.ruleMakePaperSaveBtnDisabled = false;
//                  messageService.alertInfFun('pmt', '没有查出相应的题目！');
//                }
//              });
//            }
//            else{
//              $scope.loadingImgShow = false;
//              $scope.ruleMakePaperSaveBtnDisabled = false;
//              messageService.alertInfFun('err', '请选择题型！');
//            }
//          };

          /**
           * 提交自动数据的参数,难度为整张试卷难度
           */
          var countnum, txtmLength;
          $scope.submitAutoPaperData = function(){
            $scope.loadingImgShow = true;  //paper_preview.html loading
            countnum = 0;
            autoMakePaperData.shuju.TIXING = [];
            autoMakePaperData.shuju.ZHISHIDIAN = [];
            _.each($scope.ampKmtx, function(tpTx, idx, lst){
              var tixing = {TIXING_ID: '', COUNT: ''};
              if(tpTx.tmNum >= 1){
                tixing.TIXING_ID = tpTx.TIXING_ID;
                tixing.COUNT = tpTx.tmNum;
                autoMakePaperData.shuju.TIXING.push(tixing);
              }
            });
            txtmLength = autoMakePaperData.shuju.TIXING.length;
            autoMakePaperData.shuju.ZHISHIDIAN = selectZsd;
            autoMakePaperData.shuju.NANDU = autoMakePaperData.shuju.NANDU ? autoMakePaperData.shuju.NANDU : 0.5;
            if(autoMakePaperData.shuju.NANDU){
              if(autoMakePaperData.shuju.ZHISHIDIAN){
                if(autoMakePaperData.shuju.TIXING.length){
                  $http.post(zidongzujuan, autoMakePaperData).success(function(sjData){
                    if(sjData.error){
                      messageService.alertInfFun('err', sjData.error);
                    }
                    else{
                      var mbdtdLength = mubanData.shuju.MUBANDATI.length;//模板大题的长度
                      //将自动组卷生成的数据，添加到试卷模板中 TIXING_TIMU  MUBANDATI_ID
                      //组卷成功后显示试题的代码
                      _.each(sjData.TIXING_TIMU, function(value, key, list){
                        for(var i = 0; i < mbdtdLength; i++){
                          if(mubanData.shuju.MUBANDATI[i].MUBANDATI_ID == key){
                            //将本题加入试卷
                            _.each(value, function(tmId, idx, list){
                              var sjtm = {
                                TIMU_ID: '',
                                MUBANDATI_ID: key,
                                WEIZHIXUHAO: idx,
                                FENZHI: ''
                              };
                              sjtm.TIMU_ID = tmId;
                              shijuanData.shuju.SHIJUAN_TIMU.push(sjtm);
                            });

                            //操作模板
                            (function(index, tiMuIds){
                              var qrytimuxiangqing = qrytimuxiangqingBase + '&timu_id=' + tiMuIds.toString(); //查询详情url
                              $http.get(qrytimuxiangqing).success(function(data){
                                if(data.length){
                                  countnum ++ ;
                                  mubanData.shuju.MUBANDATI[index].TIMUARR = data;
                                  _.each(data, function(tm, idx, lst){
                                    //难度统计  nanduTempData NANDU_ID
                                    for(var j = 0; j < nanduLength; j++){
                                      if(nanduTempData[j].nanduId == tm.NANDU_ID){
                                        nanduTempData[j].nanduCount.push(tm.TIMU_ID);
                                      }
                                    }
                                  });
                                  //统计每种题型的数量和百分比
                                  tixingStatistics(index, kmtxListLength);
                                  nanduPercent(); //难度统计

                                  //判读是否执行完成
                                  if(countnum == txtmLength){
                                    $scope.fangqibencizujuanBtn = true; //放弃本次组卷的按钮
                                    $scope.baocunshijuanBtn = true; //保存试卷的按钮
                                    $scope.loadingImgShow = false;  //paper_preview.html loading
                                    $scope.autoMakePaperClass = false; //自动组卷删除样式
                                    $scope.shijuanPreview();
                                  }
                                }
                                else{
                                  $scope.timudetails = null;
                                }
                              }).error(function(err){
                                console.log(err);
                              });
                            })(i, value);

                            addOrRemoveItemToPaper(shijuanData.shuju.SHIJUAN_TIMU); //添加和删除按钮

                            //二级控制面板上的分数统计
                            restoreKmtxDtscore();
                            _.each(mubanData.shuju.MUBANDATI, function(mbdt, indx, lst){ //再给kmtx.datiScore赋值
                              _.each($scope.kmtxList, function(kmtx, idx, lst){
                                if(kmtx.TIXING_ID == mbdt.MUBANDATI_ID){
                                  kmtx.datiScore = mbdt.datiScore;
                                }
                              });
                            });
                          }
                        }
                      });
                    }
                  });
                }
                else{
                  $scope.loadingImgShow = false;
                  messageService.alertInfFun('pmt', '请您选择一个题型！');
                }
              }
              else{
                $scope.loadingImgShow = false;
                messageService.alertInfFun('pmt', '请高抬贵手选择一个知识点！');
              }
            }
            else{
              $scope.loadingImgShow = false;
              messageService.alertInfFun('pmt', '请给难度一个数值！');
            }
          };

          /**
           * 提交自动数据的参数,单个题型难度设置
           */
          $scope.submitDistAutoPaperData = function(){
            var tiXingLen = $scope.ampKmtx.length,
              countnum = 0,
              tiXingLenCount = 0, //定义一个变量用了判断当所有题型长度为空是给出提示
              distAutoMakePaperDataArr = [],
              times = 0,
              tmIdsChoLen = 0, //得到符合条件自动组卷的数据长度
              tiXingTiMuObj = {}, //定义一个空对象，用来临时存放返回的题型题目
              tiXingTiMuArr = [],
              mbdtdLength = mubanData.shuju.MUBANDATI.length;//模板大题的长度
            //得到题型数量和难度的数组
            for(var i = 0; i < tiXingLen; i++){
              var distAutoMakePaperData = {
                token: token,
                caozuoyuan: caozuoyuan,
                jigouid: jigouid,
                lingyuid: lingyuid,
                shuju:{}
              },
              subShuJu = {
                NANDU: $scope.ampKmtx[i].tmNanDu ? $scope.ampKmtx[i].tmNanDu : 0.5,
                ZHISHIDIAN: [],
                TIXING: [{TIXING_ID: '', COUNT: ''}]
              };
              if($scope.ampKmtx[i].tmNum){
                tiXingLenCount ++;
                subShuJu.ZHISHIDIAN = $scope.ampKmtx[i].dagangArr > 0 ? $scope.ampKmtx[i].dagangArr : selectZsd;
                if(subShuJu.ZHISHIDIAN){
                  subShuJu.TIXING[0].TIXING_ID = $scope.ampKmtx[i].TIXING_ID;
                  subShuJu.TIXING[0].COUNT = $scope.ampKmtx[i].tmNum;
                  distAutoMakePaperData.shuju = subShuJu;
                  distAutoMakePaperDataArr.push(distAutoMakePaperData);
                }
                else{
                  messageService.alertInfFun('pmt', '请选择知识点！');
                  break;
                }
              }
            }
            //得到正确的题目id和题目详情
            if(tiXingLenCount){
              tmIdsChoLen = distAutoMakePaperDataArr.length; //得到符合条件自动组卷的数据长度
              //得到正确的题目id
              var getIdsFun = function(){
                if(times < tmIdsChoLen){
                  $http.post(zidongzujuan, distAutoMakePaperDataArr[times]).success(function(data){
                    if(data.error){
                      messageService.alertInfFun('err', data.error);
                    }
                    else{
                      tiXingTiMuArr.push(data);
                      if(times == tmIdsChoLen -1){
                        //得到调用数据（object格式）
                        _.each(tiXingTiMuArr, function(txtma, idx, lst){
                          _.each(txtma.TIXING_TIMU, function(value, key, list){
                            tiXingTiMuObj[key] = value;
                          });
                        });
                        _.each(tiXingTiMuObj, function(value, key, list){
                          for(var k = 0; k < mbdtdLength; k++){
                            if(mubanData.shuju.MUBANDATI[k].MUBANDATI_ID == key){
                              //将本题加入试卷
                              _.each(value, function(tmId, idx, list){
                                var sjtm = {
                                  TIMU_ID: '',
                                  MUBANDATI_ID: key,
                                  WEIZHIXUHAO: idx,
                                  FENZHI: ''
                                };
                                sjtm.TIMU_ID = tmId;
                                shijuanData.shuju.SHIJUAN_TIMU.push(sjtm);
                              });

                              //得到具体的数据
                              (function(index, tiMuIds){
                                var qrytimuxiangqing = qrytimuxiangqingBase + '&timu_id=' + tiMuIds.toString(); //查询详情url
                                $http.get(qrytimuxiangqing).success(function(stdata){
                                  if(stdata.length){
                                    mubanData.shuju.MUBANDATI[index].TIMUARR = stdata;
                                    _.each(stdata, function(tm, idx, lst){
                                      //难度统计  nanduTempData NANDU_ID
                                      for(var j = 0; j < nanduLength; j++){
                                        if(nanduTempData[j].nanduId == tm.NANDU_ID){
                                          nanduTempData[j].nanduCount.push(tm.TIMU_ID);
                                        }
                                      }
                                    });
                                    //统计每种题型的数量和百分比
                                    tixingStatistics(index, kmtxListLength);
                                    nanduPercent(); //难度统计

                                    //判读是否执行完成
                                    if(countnum == tmIdsChoLen - 1){
                                      $scope.fangqibencizujuanBtn = true; //放弃本次组卷的按钮
                                      $scope.baocunshijuanBtn = true; //保存试卷的按钮
                                      $scope.shijuanPreview();
                                    }
                                    countnum ++ ;
                                  }
                                  else{
                                    $scope.timudetails = null;
                                  }
                                }).error(function(err){
                                  console.log(err);
                                });
                              })(k, value);
                              addOrRemoveItemToPaper(shijuanData.shuju.SHIJUAN_TIMU); //添加和删除按钮
                              //二级控制面板上的分数统计
                              restoreKmtxDtscore();
                              _.each(mubanData.shuju.MUBANDATI, function(mbdt, indx, lst){ //再给kmtx.datiScore赋值
                                _.each($scope.kmtxList, function(kmtx, idx, lst){
                                  if(kmtx.TIXING_ID == mbdt.MUBANDATI_ID){
                                    kmtx.datiScore = mbdt.datiScore;
                                  }
                                });
                              });
                            }
                          }
                        });
                      }
                      times ++;
                      getIdsFun();
                    }
                  });
                }
              };
              getIdsFun();
            }
            else{
              messageService.alertInfFun('pmt', '至少选择一种题型！');
            }
          };

          /**
           * 自动组卷详细设置
           */
          $scope.autoMakePaperDetailSet = function(){
            $scope.isAutoMakePaperDetailSetShow = true;
          };

          /**
           * 自动组卷详细设置
           */
          $scope.cancelAutoMakePaperDetailSet = function(){
            $scope.isAutoMakePaperDetailSetShow = false;
          };

          /**
           * 由收到组卷返回的组卷的首页
           */
          var backToZjHomeFun = function(){
            $scope.paper_hand_form = false; //手动组卷时添加的样式
            $scope.txTpl = 'views/partials/paper_preview.html'; //加载试卷预览模板
          };
          $scope.backToZjHome = function(){
            backToZjHomeFun();
            $scope.sjPreview = false;
          };

          /**
           * 题型统计的函数
           */
          var tixingStatistics = function(lv1, lv2){
            for(var lp = 0; lp < lv2; lp++){
              if(mubanData.shuju.MUBANDATI[lv1].MUBANDATI_ID == $scope.kmtxList[lp].TIXING_ID){
                $scope.kmtxList[lp].itemsNum =  mubanData.shuju.MUBANDATI[lv1].TIMUARR.length;
                //得到总题量
                var tixingSum = _.reduce($scope.kmtxList, function(memo, itm){
                  var itemNumVal = itm.itemsNum ? itm.itemsNum : 0;
                  return memo + itemNumVal;
                },0);

                //得到已选试题的总量
                $scope.totalSelectedItmes = tixingSum;

                //计算每种题型的百分比
                _.each($scope.kmtxList, function(tjkmtx, idx, lst){
                  var itemNumVal = tjkmtx.itemsNum ? tjkmtx.itemsNum : 0,
                    percentVal = ((itemNumVal/tixingSum)*100).toFixed(0) + '%';
                  return tjkmtx.txPercentNum = percentVal;
                });
              }
            }
          };

          /**
           * 将题加入试卷
           */
          $scope.addToPaper = function(tm){
            var sjtmItem = {
                TIMU_ID: '',
                MUBANDATI_ID: '',
                WEIZHIXUHAO: '',
                FENZHI: ''
              },
              mbdtdLength,
              ifMbdtIdIsExist, //新加的是试题的模板大题是否存在
              mubandatiItem = {
                MUBANDATI_ID: '',
                DATIMINGCHENG: '',
                SHUOMINGDAOYU:'',
                TIMUSHULIANG: '',
                MEITIFENZHI: '',
                XUHAO: '',
                ZHUANGTAI: 1,
                TIMUARR:[],//自己添加的数组
                datiScore: ''//自己定义此大题的分数
              };
            if(!isChangeItem){ //添加试题时的代码
              //判断这道试题的大题存不存在
              ifMbdtIdIsExist = _.find(mubanData.shuju.MUBANDATI, function(mbdtItem){
                return mbdtItem.MUBANDATI_ID == tm.TIXING_ID;
              });

              if(ifMbdtIdIsExist){
                mbdtdLength = mubanData.shuju.MUBANDATI.length; //现有题目类型的长度
              }
              else{
                _.each($scope.kmtxList, function(kmtx, idx, lst){
                  if(kmtx.TIXING_ID == tm.TIXING_ID){
                    mubandatiItem.MUBANDATI_ID = tm.TIXING_ID;
                    mubandatiItem.DATIMINGCHENG = kmtx.TIXINGMINGCHENG;
                    mubandatiItem.XUHAO = tm.TIXING_ID;
                    mubanData.shuju.MUBANDATI.push(mubandatiItem);
                    mbdtdLength = mubanData.shuju.MUBANDATI.length; //现有题目类型的长度
                  }
                });
              }
              //将试题加入到对应的题目大题的数据中
              for(var i = 0; i < mbdtdLength; i++){
                //将题加入到mubanData数据中
                if(mubanData.shuju.MUBANDATI[i].MUBANDATI_ID == tm.TIXING_ID){ //将TIMULEIXING_ID换成TIXING_ID
                  tm.xiaotiScore = '';
                  mubanData.shuju.MUBANDATI[i].TIMUARR.push(tm);
                  //统计每种题型的数量和百分比
                  tixingStatistics(i, kmtxListLength);
                  //均分大题分数
                  $scope.divideDatiScore(mubanData.shuju.MUBANDATI[i]);
                }
              }
            }
            else{ //替换试题时的代码 cg_mbdt_idx, cg_timuId, cg_thisItem_idx
              mubanData.shuju.MUBANDATI[cg_mbdt_idx].TIMUARR.splice(cg_thisItem_idx, 1, tm);
              //从试卷中删除被替换的题目
              shijuanData.shuju.SHIJUAN_TIMU = _.reject(shijuanData.shuju.SHIJUAN_TIMU, function(sjtm){
                return sjtm.TIMU_ID == cg_timuId;
              });
              //从难度中删除要替换的题目
              _.each(nanduTempData, function(ndtd, idx, lst){
                ndtd.nanduCount = _.reject(ndtd.nanduCount, function(ndct){
                  return ndct == cg_timuId;
                });
              });
              //均分大题分数
              $scope.divideDatiScore(mubanData.shuju.MUBANDATI[cg_mbdt_idx]);
            }

            //统计难度的数量
            for(var j = 0; j < nanduLength; j++){
              if(nanduTempData[j].nanduId == tm.NANDU_ID){
                nanduTempData[j].nanduCount.push(tm.TIMU_ID);
                //每种难度的数量和百分比
                nanduPercent();
              }
            }

            //将试题加入试卷
            sjtmItem.TIMU_ID = tm.TIMU_ID;
            sjtmItem.MUBANDATI_ID = tm.TIXING_ID; //将TIMULEIXING_ID换成TIXING_ID
            shijuanData.shuju.SHIJUAN_TIMU.push(sjtmItem);
            //加入试卷按钮和移除试卷按钮的显示和隐藏
            addOrRemoveItemToPaper(shijuanData.shuju.SHIJUAN_TIMU);

            //如果是替换试题，替换完成后，展示试卷列表
            if(isChangeItem){
              $scope.shijuanPreview(); //试卷预览
              isChangeItem = false; // 是否是题目替换重置
              cg_mbdt_idx = ''; // 需要更换的模板大题Id重置
              cg_timuId = ''; // 需要被更换的题目的Id重置
              cg_thisItem_idx = ''; // 需要被更换的题目的索引重置
              $scope.hideOrShowTixing = false; //如何是换一题，隐藏不必要的题型
            }

          };

          /**
           * 将题移除试卷
           */
          $scope.removeOutPaper = function(tm){
            var mbdtdLength = mubanData.shuju.MUBANDATI.length;
            shijuanData.shuju.SHIJUAN_TIMU = _.reject(shijuanData.shuju.SHIJUAN_TIMU, function(shtm){
              return shtm.TIMU_ID  == tm.TIMU_ID;
            });
            //加入试卷按钮和移除试卷按钮的显示和隐藏
            addOrRemoveItemToPaper(shijuanData.shuju.SHIJUAN_TIMU);

            //难度统计
            for(var k = 0; k < nanduLength; k++){
              if(nanduTempData[k].nanduId == tm.NANDU_ID){
                var ndCountLenght = nanduTempData[k].nanduCount.length;
                for(var l = 0; l < ndCountLenght; l++){
                  if(nanduTempData[k].nanduCount[l] == tm.TIMU_ID){
                    nanduTempData[k].nanduCount.splice(l, 1);

                    //每种难度的数量和百分比
                    nanduPercent();
                  }
                }
              }
            }
            //查找要删除的元素的位置
            for(var i = 0; i < mbdtdLength; i++){
              //从mubanData中删除数据
              if(mubanData.shuju.MUBANDATI[i].MUBANDATI_ID == tm.TIXING_ID){ // 判断那个题目类型id; 将TIMULEIXING_ID换成TIXING_ID
                var tmarrLength = mubanData.shuju.MUBANDATI[i].TIMUARR.length; // 得到这个题目类型下面的题目数组
                for(var j = 0; j < tmarrLength; j ++){
                  if(mubanData.shuju.MUBANDATI[i].TIMUARR[j].TIMU_ID == tm.TIMU_ID){ //找到要删除的对应数据
                    mubanData.shuju.MUBANDATI[i].TIMUARR.splice(j, 1);
                    //统计每种题型的数量
                    tixingStatistics(i, kmtxListLength);
                    //均分大题分数
                    $scope.divideDatiScore(mubanData.shuju.MUBANDATI[i]);
                    break;
                  }
                }
              }
            }
          };

          /**
           * 加入试卷按钮和移除试卷按钮的显示和隐藏//
           */
          var addOrRemoveItemToPaper = function(arr){
            var selectTestStr = '';
            _.each(arr, function(shtm, idx, lst){
              selectTestStr += 'selectTest' + shtm.TIMU_ID + ',';
            });
            $scope.selectTestStr = selectTestStr;
          };

          /**
           *  计算难度的百分比
           */
          var nanduPercent = function(){
            var nanduSum = _.reduce($scope.nanduTempData, function(memo, ndItm){
              var ndItemNumVal = ndItm.nanduCount.length;
              return memo + ndItemNumVal;
            },0);

            _.each($scope.nanduTempData, function(ndkmtx, idx, lst){
              var ndItemNumVal = ndkmtx.nanduCount.length,
                percentVal = ((ndItemNumVal/nanduSum)*100).toFixed(0) + '%';
              return ndkmtx.ndPercentNum = percentVal;
            });
          };

          /**
           * 试卷预览代码//
           */
          $scope.shijuanPreview = function(){
            var mbdtArr = [], //定义一个空的数组用来存放模板大题
              newCont,
              tgReg = new RegExp('<\%{.*?}\%>', 'g');
            //删除数据为空的模板大题
            _.each(mubanData.shuju.MUBANDATI, function(mbdt, idx, lst){
              if(mbdt.TIMUARR.length){
                if(mbdt.MUBANDATI_ID == 6){
                  _.each(mbdt.TIMUARR, function(tm, subIdx, subLst){
                    //修改填空题的题干
                    newCont = tm.TIGAN.tiGan.replace(tgReg, function(arg) {
                      var text = arg.slice(2, -2), //提起内容
                        textJson = JSON.parse(text),
                        _len = textJson.size,
                        i, xhStr = '';
                      for(i = 0; i < _len; i ++ ){
                        xhStr += '_';
                      }
                      return xhStr;
                    });
                    tm.TIGAN.tiGan = newCont;
                  });
                  mbdtArr.push(mbdt);
                }
                else{
                  mbdtArr.push(mbdt);
                }
              }
            });
            mubanData.shuju.MUBANDATI = mbdtArr;
            $scope.mubanData = mubanData;
            backToZjHomeFun();
            $scope.sjPreview = true;
            $scope.shijuanyulanBtn = false;
            $scope.addMoreTiMuBtn = true; //添加试卷按钮显示
          };

          /**
           * 均分大题的分值
           */
          $scope.divideDatiScore = function(mbdt){
            var datiTotalScore = mbdt.datiScore, //本大题总分
              datiItemNum = mbdt.TIMUARR.length, //得到本大题下的题目数量
              biLvVal = datiTotalScore/datiItemNum, //本大题总分/大题下的题目数量
              xiaotiAverageScore, //每小题的平均分数
              zeroLen = 0; //记录题目分值为0的个数
            if(biLvVal < 1){
              if(biLvVal == 0.5){
                xiaotiAverageScore = 0.5; //每小题的分数
                _.each(mbdt.TIMUARR, function(xiaoti, idx, lst){
                  xiaoti.xiaotiScore = xiaotiAverageScore;
                });
              }
              else{
                xiaotiAverageScore = 1; //每小题的分数
                _.each(mbdt.TIMUARR, function(xiaoti, idx, lst){
                  if( idx < datiTotalScore){
                    xiaoti.xiaotiScore = xiaotiAverageScore;
                  }
                  else{
                    xiaoti.xiaotiScore = 0;
                    zeroLen ++;
                  }
                });
              }
            }
            else{
              xiaotiAverageScore = biLvVal.toFixed(0); //每小题的分数
              _.each(mbdt.TIMUARR, function(xiaoti, idx, lst){
                if(idx + 1 < mbdt.TIMUARR.length){
                  xiaoti.xiaotiScore = xiaotiAverageScore;
                  datiTotalScore -= xiaotiAverageScore;
                }
                if(idx +1 == mbdt.TIMUARR.length){ //给最后一小题赋值
                  xiaoti.xiaotiScore = datiTotalScore;
                }
              });
            }

          };

          /**
           * 有小题的到大题的分值
           */
          $scope.addXiaotiScore = function(mbdt){
            var datiScore = 0;
            _.each(mbdt.TIMUARR, function(xiaoti, idx, lst){
              datiScore += parseFloat(xiaoti.xiaotiScore);
            });
            mbdt.datiScore = datiScore;
          };

          /**
           * 删除大题
           */
          $scope.deleteDaTi = function(idx){
            var targetMbdtId = mubanData.shuju.MUBANDATI[idx].MUBANDATI_ID,
              mubandatiLength, //定义一个模板大题的长度
              i, j, k;

            //删除试卷里面对应的数据
            shijuanData.shuju.SHIJUAN_TIMU = _.reject(shijuanData.shuju.SHIJUAN_TIMU, function(sjtm){
              return sjtm.MUBANDATI_ID == targetMbdtId;
            });

            //删除$scope.kmtxList中对应的元素,此处不删除的话，试题统计就会有问题
            for(j = 0; j < kmtxListLength; j++){
              if(targetMbdtId == $scope.kmtxList[j].TIXING_ID){
                $scope.kmtxList[j].itemsNum = 0;
                $scope.kmtxList[j].txPercentNum = '0%';
                $scope.kmtxList[j].datiScore = 0;//删除此大题在二级控制面版上的大题分数
                break;
              }
            }

            //删除难度中对应的数据 nanduTempData nanduLength
            _.each(mubanData.shuju.MUBANDATI[idx].TIMUARR, function(dtm, idx, lst){
              _.each(nanduTempData, function(ndtd, ndidx, ndlst){
                if(ndtd.nanduId == dtm.NANDU_ID){
                  var thisNaduLength = ndtd.nanduCount.length;
                  for(k = 0; k < thisNaduLength; k++){
                    if(ndtd.nanduCount[k] == dtm.TIMU_ID){
                      ndtd.nanduCount.splice(k, 1);
                    }
                  }
                }
              });
            });

            //加入试卷按钮和移除试卷按钮的显示和隐藏
            addOrRemoveItemToPaper(shijuanData.shuju.SHIJUAN_TIMU);

            mubanData.shuju.MUBANDATI.splice(idx, 1); //删除大图数据,放在最后
            mubandatiLength = mubanData.shuju.MUBANDATI.length; //给删除所选项后的模板大题的长度
            //统计每种题型的数量和百分比
            for(i = 0; i < mubandatiLength; i++){
              tixingStatistics(i, kmtxListLength);
            }
            //难度统计
            nanduPercent();
          };

          /**
           * 从试题统计中删除大题
           */
          $scope.deleteDaTiArr = function(mbdtid){
            var mbdtIds = _.map(mubanData.shuju.MUBANDATI, function(mbdt){ return mbdt.MUBANDATI_ID;}),
                idx = _.indexOf(mbdtIds, mbdtid);
            $scope.deleteDaTi(idx);
          };
          /**
           * 编辑试卷信息
           */
          $scope.editMuBanDaTiNameAndScore = function(styl){
            var focusTarget = '.' + styl;
            $scope.shijuan_edit = true;
            if($scope.shijuan_edit){
              var setScoreFun = function(){
                $(focusTarget).focus();
              };
              $timeout(setScoreFun, 500);
            }
          };

          /**
           * 取消编辑试卷信息
           */
          $scope.cancelEditPaper = function(){
            $scope.shijuan_edit = false;
          };

          /**
           * 保存编辑试卷信息
           */
          $scope.saveEditPaper = function(){
            _.each(mubanData.shuju.MUBANDATI, function(mbdt, indx, lst){
              //均分大题分数
              $scope.divideDatiScore(mbdt);
              //二级控制面板上的分数统计
              _.each($scope.kmtxList, function(kmtx, idx, lst){
                if(kmtx.TIXING_ID == mbdt.MUBANDATI_ID){
                 kmtx.datiScore = mbdt.datiScore;
                }
              });
            });
            //试卷编辑层隐藏
            $scope.shijuan_edit = false;
          };

          /**
           * 更换小题
           */
          var isChangeItem, cg_mbdt_idx, cg_timuId, cg_thisItem_idx;
          $scope.changeItem = function(mbdtId, timuId){
            $scope.showTestList(mbdtId); //显示试题列表
            isChangeItem = true; // 是否是题目替换
            cg_mbdt_idx = this.$parent.$index; // 需要更换的模板大题Id
            cg_timuId = timuId; // 需要被更换的题目的Id
            cg_thisItem_idx = this.$index; // 需要被更换的题目的索引
            $scope.hideOrShowTixing = true; //如何是换一题，隐藏不必要的题型
          };

          /**
           * 保存试卷前的确认
           */
          $scope.savePaperConfirm = function(){
            var nanDuArr = {
                paperNanDu: '',
                daTiNanDuArr:[]
              },
              fenZhiIsNull = 0,
              muBanDaTiLen = mubanData.shuju.MUBANDATI.length,
              ppNanDuAdd = 0; //定义一个试卷难度相加字段
            shijuanData.shuju.SHIJUAN_TIMU = [];
            $scope.paperScore = 0;

            _.each(mubanData.shuju.MUBANDATI, function(dati, idx, lst){
              $scope.paperScore += parseInt(dati.datiScore); //将试卷分数转换为整形
              var nanDuObj = { //定义一个存放难度object对象
                  mubandati_id: dati.MUBANDATI_ID,
                  nanDu: ''
                },
                thisDaTiTiMuArrLen = dati.TIMUARR.length, //本大题的题目长度
                dtNanDuAdd = 0; //定义一个难度求和的字段
              _.each(dati.TIMUARR, function(tm, subidx, lst){
                //统计小题难度
                dtNanDuAdd += parseInt(tm.NANDU_ID)/5;
                if(subidx == thisDaTiTiMuArrLen - 1 ){
                  nanDuObj.nanDu = (dtNanDuAdd/thisDaTiTiMuArrLen).toFixed(2);
                  ppNanDuAdd += dtNanDuAdd/thisDaTiTiMuArrLen;
                  nanDuArr.daTiNanDuArr.push(nanDuObj);
                }
                //重组试卷数据
                var  shijuanTimu = {
                  TIMU_ID: '',
                  MUBANDATI_ID: '',
                  WEIZHIXUHAO: '',
                  FENZHI: ''
                };
                shijuanTimu.MUBANDATI_ID = dati.MUBANDATI_ID; //模板大题的id
                shijuanTimu.TIMU_ID = tm.TIMU_ID; //试题的id
                shijuanTimu.WEIZHIXUHAO = subidx; //位置序号
                //给题目类型是9的题添加分页符
                if(tm.TIMULEIXING_ID == 9){
                  shijuanTimu.HUANYE = 1;
                }
                //得到小题的分数
                if(tm.xiaotiScore && tm.xiaotiScore > 0){
                  shijuanTimu.FENZHI = tm.xiaotiScore; //得到小题的分数
                }
                else{
                  shijuanTimu.FENZHI = '';
                  fenZhiIsNull ++;
                }
                shijuanData.shuju.SHIJUAN_TIMU.push(shijuanTimu);
              });
              if(idx == muBanDaTiLen - 1){
                nanDuArr.paperNanDu = (ppNanDuAdd/muBanDaTiLen).toFixed(2);
                shijuanData.shuju.NANDU = nanDuArr;
              }
            });
            if(shijuanData.shuju.SHIJUANMINGCHENG){ //11 检查试卷名称

              if(!fenZhiIsNull){// 22 检查每小题是否有分值 开始
                //提交数据
                if(shijuanData.shuju.SHIJUANMUBAN_ID && shijuanData.shuju.SHIJUAN_TIMU.length){ // 33
                  $scope.isSavePaperConfirm = true;
                }
                else{ //33
                  messageService.alertInfFun('pmt', '请检查试卷的完整性！');
                }
              }
              else{ // 22 检查每小题是否有分值 结束
                messageService.alertInfFun('pmt', '每小题的分数不能为空！请给每个小题一个分数！');
              }
            }
            else{ //11 检查试卷名称
              messageService.alertInfFun('pmt', '给我起个名字吧 ^ _ ^');
            }
          };

          /**
           * 保存试卷
           */
          $scope.savePaper = function(){
            //保存试卷
            $http.post(xgsjUrl, shijuanData).success(function(data){
              if(data.result){
                //更新数据模板
                var lsmbIdLenght = $rootScope.session.lsmb_id.length;
                mubanData.shuju.SHIJUANMUBAN_ID = shijuanData.shuju.SHIJUANMUBAN_ID;
                if($scope.zuJuanParam.tiMuSuiJi){
                  mubanData.shuju.TIMU_SUIJI = true;
                }
                else{
                  mubanData.shuju.TIMU_SUIJI = false;
                }
                if($scope.zuJuanParam.xuanXiangSuiJi){
                  mubanData.shuju.XUANXIANG_SUIJI = true;
                }
                else{
                  mubanData.shuju.XUANXIANG_SUIJI = false;
                }
                $http.post(xgmbUrl, mubanData).success(function(mbdata){
                  if(mbdata.result){
//                    isComeFromRuleList = false;//试卷保存成功，显示试卷列表
                    for(var i = 0; i < lsmbIdLenght; i++){
                      if($rootScope.session.lsmb_id[i] == shijuanData.shuju.SHIJUANMUBAN_ID){
                        $rootScope.session.lsmb_id.splice(i, 1);
//                        deleteTempTemp(); //删除没用的其他目标
                      }
                    }
                    $scope.showZuJuan();
                    $scope.shijuanyulanBtn = false; //试卷预览的按钮
                    $scope.fangqibencizujuanBtn = false; //放弃本次组卷的按钮
                    $scope.baocunshijuanBtn = false; //保存试卷的按钮
                    $scope.isSavePaperConfirm = false;
                    $scope.addMoreTiMuBtn = false; //添加试卷按钮隐藏
                    $scope.zuJuanParam.xuanTiError = []; //
                    //保存组卷规则
                    if(isComeFromRuleList){
                      comeFromRuleListData.GUIZEBIANMA = zuJuanRuleStr;
                      $scope.saveZjRule(comeFromRuleListData, 'upd', true);
                    }
                    else{
                      $scope.saveZjRule(zuJuanRuleStr, 'sav', true);
                    }
                    messageService.alertInfFun('suc', '恭喜你！试卷保存成功！');
                  }
                  else{
                    messageService.alertInfFun('err', '更新试卷模板是错误！错误信息为：' + mbdata.error);
                  };
                });
              }
            });
          };

          /**
           * 取消保存试卷
           */
          $scope.cancelSavePaper = function(){
            $scope.isSavePaperConfirm = false;
          };

          /**
           * 删除临时模板
           */
          var deleteTempTemp = function(){
            deletelsmbData.muban_id = $rootScope.session.lsmb_id;
            if(deletelsmbData.muban_id.length){
              $http.post(deletelsmbUrl, deletelsmbData).success(function(data){
                if(data.result){
                  $rootScope.session.lsmb_id = [];
                  deletelsmbData.muban_id = [];
                  mubanData.shuju.SHIJUANMUBAN_ID = ''; //清空试卷模板id
                }
                else{
                  messageService.alertInfFun('err', data.error);
                }
              });
            }
            else{
              mubanData.shuju.SHIJUANMUBAN_ID = ''; //清空试卷模板id
            }
          };

          /**
           * 清除试卷、模板、难度、题型的数据
           */
          var clearData = function(){
            mubanData.shuju.MUBANDATI = []; //清除模板中试题的临时数据
            shijuanData.shuju.SHIJUAN_TIMU = []; //清除试卷中的数据
            shijuanData.shuju.SHIJUANMINGCHENG = ''; //试卷名称重置
            shijuanData.shuju.FUBIAOTI = ''; //试卷副标题重置
            shijuanData.shuju.SHIJUANMUBAN_ID = ''; //删除试卷中的试卷模板id
            shijuanData.shuju.SHIJUAN_ID = ''; //清楚试卷id
            mubanData.shuju.ZONGDAOYU = ''; //试卷模板总导语重置
            _.each($scope.nanduTempData, function(ndkmtx, idx, lst){ //清除难度的数据
              ndkmtx.nanduCount = [];
              ndkmtx.ndPercentNum = '0%';
              return ndkmtx;
            });
            _.each($scope.kmtxList, function(tjkmtx, idx, lst){ //清除科目题型的统计数据
              tjkmtx.itemsNum = 0;
              tjkmtx.txPercentNum = '0%';
              return tjkmtx;
            });
            $scope.selectTestStr = ''; //清除试题加入和移除按钮
            $scope.backToZjHome(); //返回选择手动和自动组卷页面
            $scope.shijuanyulanBtn = false; //试卷预览的按钮
            $scope.fangqibencizujuanBtn = false; //放弃本次组卷的按钮
            $scope.baocunshijuanBtn = false; //保存试卷的按钮
          };

          /**
           * 放弃组卷
           */
          $scope.dropMakePaper = function(){
            $scope.totalSelectedItmes = 0; //已选试题的总数量
            $scope.addMoreTiMuBtn = false; //添加试卷按钮隐藏
            $scope.autoMakePaperClass = false; //加载自动组卷的样式
            $scope.zuJuanParam.xuanTiError = [];
            deleteTempTemp();
            clearData();
            restoreKmtxDtscore();
          };

          /**
           * 当考试和考试规则列表加载时，变换tab-content的宽度
           */
          var widthChangeFun = function() {
            $('.tab-content').width($('.sub-nav').width() - 16 + 'px');
          };

          /**
           *  查询试卷列表的函数，组卷页面加载时，查询数据
           */
          var isFirstQryPaperList;
          var qryShiJuanList = function(){
            $scope.loadingImgShow = true;  //zj_paperList.html loading
            paperPageArr = [];
            sjlbIdArrRev = []; //反转试卷列表id
            $http.get(qryCxsjlbUrl).success(function(sjlb){
              if(sjlb.length){
                $scope.papertListIds = sjlb;
                isFirstQryPaperList = true;
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
                if(!isDeletePaper){
                  $scope.getThisSjgyPageData();
                  isDeletePaper = false;
                }
                $scope.loadingImgShow = false;  //zj_paperList.html loading
              }
              else{
                messageService.alertInfFun('err', '没有相关试卷信息！');
                $scope.loadingImgShow = false;  //zj_paperList.html loading
              }
            });
          };
          qryShiJuanList();

          /**
           * 返回组卷首页
           */
          $scope.showZuJuan = function(){
            mubanData.shuju.MUBANDATI = []; //清除模板中试题的临时数据
            shijuanData.shuju.SHIJUAN_TIMU = []; //清除试卷中的数据
            shijuanData.shuju.SHIJUANMINGCHENG = ''; //试卷名称重置
            shijuanData.shuju.FUBIAOTI = ''; //试卷副标题重置
            shijuanData.shuju.SHIJUANMUBAN_ID = ''; //删除试卷中的试卷模板id
            shijuanData.shuju.SHIJUAN_ID = ''; //清楚试卷id
            mubanData.shuju.ZONGDAOYU = ''; //试卷模板总导语重置
            _.each($scope.nanduTempData, function(ndkmtx, idx, lst){ //清除难度的数据
              ndkmtx.nanduCount = [];
              ndkmtx.ndPercentNum = '0%';
              return ndkmtx;
            });
            _.each($scope.kmtxList, function(tjkmtx, idx, lst){ //清除科目题型的统计数据
              tjkmtx.itemsNum = 0;
              tjkmtx.txPercentNum = '0%';
              return tjkmtx;
            });
            $scope.selectTestStr = ''; //清除试题加入和移除按钮
            $scope.shijuanyulanBtn = false; //试卷预览的按钮
            $scope.fangqibencizujuanBtn = false; //放弃本次组卷的按钮
            $scope.baocunshijuanBtn = false; //保存试卷的按钮
            $scope.paper_hand_form = false;
            $scope.sjPreview = false; //试卷预览
            $scope.showBackToPaperListBtn = false;
            $scope.txTpl = 'views/partials/zj_home.html';
            $scope.showPaperList();
            deleteTempTemp();
            restoreKmtxDtscore();
          };

          /**
           * 查看试卷列表
           */
          $scope.showPaperList = function(isBackToPaperList){
            $scope.zj_tabActive = 'shiJuan';
            qryShiJuanList(isBackToPaperList);
            $scope.zjTpl = 'views/partials/zj_paperList.html';
          };

          /**
           * 查看组卷规则列表
           */
          $scope.showZuJuanRuleList = function(){
            $scope.zj_tabActive = 'zjRule';
            qryZjRule();
            $scope.zjTpl = 'views/partials/zj_ruleList.html'; //加载试卷列表模板
            $timeout(widthChangeFun, 100);
          };

          /**
           * 查询试卷概要的分页代码
           */
          $scope.getThisSjgyPageData = function(pg){
            $scope.loadingImgShow = true;  //zj_paperList.html loading
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
                    $scope.loadingImgShow = false;  //zj_paperList.html loading
                    $scope.paperListData = sjlbgy;
                    if(isFirstQryPaperList){
                      $scope.totalSelectedItmes = 0; //已选试题的总数量
                      $scope.showBackToMakePaperBtn = true;
                      $scope.showBackToPaperListBtn = false; //返回试卷列表
                      $scope.zjTpl = 'views/partials/zj_paperList.html'; //加载试卷列表模板
                      isFirstQryPaperList = false;
                      $timeout(widthChangeFun, 100);
                    }
                  }
                  else{
                    messageService.alertInfFun('err', '查询创建人名称失败！');
                    $scope.loadingImgShow = false;  //zj_paperList.html loading
                  }
                });
              }
              else{
                messageService.alertInfFun('err', '很遗憾！没有相关数据！');
                $scope.loadingImgShow = false;  //zj_paperList.html loading
              }
            });
          };

          /**
           * 查看试卷详情
           */
          $scope.showPaperDetail = function(sjId){
            var qryPaperDetailUrl = qryPaperDetailUrlBase + sjId;
            mubanData.shuju.MUBANDATI = [];
            shijuanData.shuju.SHIJUAN_TIMU = [];
            paperDetailData = '';
            paperDetailId = ''; //用来存放所选试卷的id
            paperDetailName = ''; //用来存放所选试卷的名称

            $http.get(qryPaperDetailUrl).success(function(data){
              if(!data.error){
                paperDetailId = data.SHIJUAN.SHIJUAN_ID; //用来存放所选试卷的id
                paperDetailName =  data.SHIJUAN.SHIJUANMINGCHENG; //用来存放所选试卷的名称
                //给临时模板赋值
                mubanData.shuju.SHIJUANMUBAN_ID = data.MUBAN.SHIJUANMUBAN_ID; //模板id
                mubanData.shuju.MUBANMINGCHENG = data.MUBAN.MUBANMINGCHENG; //模板名称
                mubanData.shuju.ZONGDAOYU = data.MUBAN.ZONGDAOYU; //总导语
    //            mubanData.shuju.MUBANDATI = data.MUBANDATI; //模板大题数组
                //给试卷赋值
                shijuanData.shuju.SHIJUAN_ID = data.SHIJUAN.SHIJUAN_ID; //试卷id
                shijuanData.shuju.SHIJUANMINGCHENG = data.SHIJUAN.SHIJUANMINGCHENG; //试卷名称
                shijuanData.shuju.FUBIAOTI = data.SHIJUAN.FUBIAOTI; //副标题
                shijuanData.shuju.SHIJUANMUBAN_ID = data.SHIJUAN.SHIJUANMUBAN_ID; //试卷模板id
                //将模板大题赋值到模板里面
                _.each(data.MUBANDATI, function(mbdt, indx, lst){
                  mbdt.TIMUARR = []; //自己添加的数组
                  mbdt.datiScore = 0; //自己定义此大题的分数
                  mubanData.shuju.MUBANDATI.push(mbdt);
                });
                var mbdtdLength = mubanData.shuju.MUBANDATI.length;//模板大题的长度
                //将试卷详情放入临时模板的数组中
                _.each(data.TIMU, function(tm, indx, lst){
                  // SHIJUAN_TIMU里的元素
                  var sjtm = {
                    TIMU_ID: '',
                    MUBANDATI_ID: '',
                    WEIZHIXUHAO: '',
                    FENZHI: ''
                  };
                  //将本题加入试卷
                  sjtm.TIMU_ID = tm.TIMU_ID;
                  sjtm.MUBANDATI_ID = tm.MUBANDATI_ID;
                  sjtm.WEIZHIXUHAO = tm.WEIZHIXUHAO;
                  sjtm.FENZHI = tm.FENZHI;
                  shijuanData.shuju.SHIJUAN_TIMU.push(sjtm);
                  //将此题加入模板
                  for(var i = 0; i < mbdtdLength; i++){
                    //将题加入到临时模板
                    if(tm.MUBANDATI_ID == mubanData.shuju.MUBANDATI[i].MUBANDATI_ID){
                      tm.DETAIL.xiaotiScore = tm.FENZHI;
                      mubanData.shuju.MUBANDATI[i].TIMUARR.push(tm.DETAIL);
                      mubanData.shuju.MUBANDATI[i].datiScore += tm.FENZHI;
                    }
                    //统计每种题型的数量和百分比
                    tixingStatistics(i, kmtxListLength);
                  }
                  //难度统计  nanduTempData NANDU_ID
                  for(var j = 0; j < nanduLength; j++){
                    if(nanduTempData[j].nanduId == tm.DETAIL.NANDU_ID){
                      nanduTempData[j].nanduCount.push(tm.TIMU_ID);
                    }
                  }
                });
                nanduPercent(); //难度统计
                addOrRemoveItemToPaper(shijuanData.shuju.SHIJUAN_TIMU); //添加和删除按钮
                //二级控制面板上的分数统计
                restoreKmtxDtscore();
                _.each(mubanData.shuju.MUBANDATI, function(mbdt, indx, lst){ //再给kmtx.datiScore赋值
                  _.each($scope.kmtxList, function(kmtx, idx, lst){
                    if(kmtx.TIXING_ID == mbdt.MUBANDATI_ID){
                      kmtx.datiScore = mbdt.datiScore;
                    }
                  });
                });
                $scope.shijuanPreview(); //试卷预览
                $scope.shijuanyulanBtn = false; //试卷预览的按钮
                $scope.fangqibencizujuanBtn = true; //放弃本次组卷的按钮
                $scope.baocunshijuanBtn = true; //保存试卷的按钮
                paperDetailData = mubanData; //用于答题卡赋值
              }
              else{
                messageService.alertInfFun('err', data.error);
              }
            });
          };

          /**
           * 删除试卷 xgsjUrl
           */
          var isDeletePaper;
          $scope.deleteThisPaper = function(paperId, idx){
            var deleteDate = {
              token: token,
              caozuoyuan: caozuoyuan,
              jigouid: jigouid,
              lingyuid: lingyuid,
              shuju:{
                SHIJUAN_ID: paperId,
                ZHUANGTAI: -1
              }
            };
            var alertCon = confirm("确定要删除次试卷吗？");
            if(alertCon){
              $http.post(xgsjUrl, deleteDate).success(function(data){
                if(data.result){
                  $scope.paperListData.splice(idx, 1);
                  isDeletePaper = true;
                  qryShiJuanList();
                  messageService.alertInfFun('suc', '删除成功！');
                }
                else{
                  messageService.alertInfFun('err', data.error);
                }
              });
            }
          };

          /**
           * 上下移动题目 //周
           */
          $scope.moveTM = function(tm, num){
            var dati = _.where(mubanData.shuju.MUBANDATI, { MUBANDATI_ID: tm.TIMULEIXING_ID })[0],
                tmIds = _.map(dati.TIMUARR, function(t){ return t.TIMU_ID;}),
                index = _.indexOf(tmIds, tm.TIMU_ID),
                toIndex = index + num,
                item = dati.TIMUARR[index];
            if(num>0){
              dati.TIMUARR.splice(toIndex + 1, 0, item);
              dati.TIMUARR.splice(index, 1);
            }
            else{
              dati.TIMUARR.splice(index, 1);
              dati.TIMUARR.splice(toIndex, 0, item);
            }
            $('button.reloadMath').click();
          };

          /**
           * 当离开本页的时候触发事件，删除无用的临时模板
           */
          $scope.$on('$destroy', function () {
            var nextPath = $location.$$path,
                myInterval = setInterval(1000);
            deletelsmbData.muban_id = $rootScope.session.lsmb_id;
            if(deletelsmbData.muban_id && deletelsmbData.muban_id.length > 0){
              $http.post(deletelsmbUrl, deletelsmbData).success(function(data){
                if(data.result){
                  $rootScope.session.lsmb_id = [];
                  clearInterval(myInterval);
                  urlRedirect.goTo('/zujuan', nextPath);
                }
                else{
                  messageService.alertInfFun('err', data.error);
                }
              });
            }
            else{
              urlRedirect.goTo('/zujuan', nextPath);
            }
          });

        } // 002

      ] //controller 里面的结束 ]
    ); //controller的结束 )
  }); // 001
