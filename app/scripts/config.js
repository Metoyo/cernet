define( "config", [], function () {
  return {
    token: '12345',
    apiurl_rz: "http://test.taianting.com:3000/api/",//认证的url
    apiurl_mt: "http://test.taianting.com:4000/api/",//命题的url
    apiurl_kw: "http://test.taianting.com:4100/api/",//考务的url
    apiurl_tj: "http://test.taianting.com:4300/api/",//统计的url
    apiurl_tj_ori: "http://test.taianting.com:4300/",//统计的原始url
    secret: '076ee61d63aa10a125ea872411e433b9',
    hostname: 'localhost:3000',
    letterArr: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
      'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'], //英文字母序号数组
    cnNumArr: ['一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五','十六','十七','十八','十九',
      '二十'], //中文数字序号数组
    routes: {
      '/mingti': {
        templateUrl: 'views/mingti.html',
        controller: 'MingtiCtrl',
        requireLogin: true
      },
      '/dagang': {
        templateUrl: 'views/dagang.html',
        controller: 'DagangCtrl',
        requireLogin: true
      },
      '/renzheng': {
        templateUrl: 'views/renzheng.html',
        controller: 'RenzhengCtrl',
        requireLogin: false
      },
      '/user/:name': {
        templateUrl: 'views/user.html',
        controller: 'UserCtrl',
        requireLogin: true
      },
      '/register': {
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl',
        requireLogin: false
      },
      '/zujuan': {
        templateUrl: 'views/zujuan.html',
        controller: 'ZujuanCtrl',
        requireLogin: true
      },
      '/kaowu': {
        templateUrl: 'views/kaowu.html',
        controller: 'KaowuCtrl',
        requireLogin: true
      },
      '/lingyu': {
        templateUrl: 'views/selectLingYu.html',
        controller: 'LingyuCtrl',
        requireLogin: true
      },
      '/tongji': {
        templateUrl: 'views/tongji.html',
        controller: 'TongjiCtrl',
        requireLogin: true
      }
    },
    quanxianObj: [ //得到角色是数组
      {
        qxArr: ['2006', '2007'],
        targetUrl: '/dagang',
        navName : 'dagang'
      },
      {
        qxArr: ['2010', '2011', '2012', '2013', '2031', '2032'],
        targetUrl: '/mingti',
        navName : 'mingti'
      },
      {
        qxArr: ['2017', '2020', '2021', '2022', '2023', '2030', '2033', '2034'],
        targetUrl: '/zujuan',
        navName : 'zujuan'
      },
      {
        qxArr: ['3001'],
        targetUrl: '/kaowu',
        navName : 'kaowu'
      },
      {
        qxArr: ['4001', '4002'],
        targetUrl: '/tongji',
        navName : 'tongji'
      }
    ],
    tiXingNameArr: [
      '单选题', '多选题','双选题','判断题','是非题','填空题','单词翻译题','单词解释题','计算题','问答题','简答题','论述题','翻译题',
      '作文题','证明题','作图题','解答题'
    ],
    imgType: ['.jpg', '.jpeg', '.png', '.gif', '.bmp'],
    videoType: ['.ogv', '.mp4', '.avi', '.mkv', '.wmv'],
    audioType: ['.ogg', '.mp3', '.wav'],
    uploadFileSizeLimit: 2097152 //上传文件的大小限制2MB
//    uploadCommand: git push edu master && git push bt master
  };
});
