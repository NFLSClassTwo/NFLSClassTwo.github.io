(function() {
    /**
     *
     *
     * 这里记录系统的所有APP清单
     */
    const APP_CONFIG = {}
    window.APP_CONFIG = APP_CONFIG;

    APP_CONFIG.apiUrl = '/api'
    /**
     * 所有的应用
     * @type {*[]}
     */
    APP_CONFIG.apps = [
        {name:'我的文件',url:'app/file/index.html',iconCls:'fa-folder',headHover:true},
        {name:'百度一下',url:'http://www.baidu.com'},
        {name:'日历',url:'app/Simple-Calendar/index.html',iconCls:'fa-folder',headHover:true , maximize : false,width:500,height : 450},
    ]


    /**
     * 加载在桌面的应用
     * @type {*[]}
     */
    APP_CONFIG.desktopApp = [
        {name:'我的文件',url:'app/file/index.html',iconCls:'fa-folder',headHover:true , maximize : false,width:500,height : 300},
        {name:'百度一下',url:'http://www.baidu.com',iconCls:'fa-edge'},
        {name:'文本编辑器',url:'app/file/text-editor.html',iconCls:'fa-pencil-square-o', maximize : false,width:500,height : 300},
        {name:'API文档',url:'doc/api-doc.txt',iconCls:'fa-align-justify', maximize : false,width:500,height : 300},
        {name:'图标库',url:'app/icon/icon.html',iconCls:'fa-building-o',type:'', maximize : false,width:800,height : 500},
        {name:'计算器',url:'app/calculator/index.html',iconCls:'fa-building-o',type:'', maximize : false,width:300,height : 500},
    ]

    APP_CONFIG.userBtns = [
        {name:'退出',iconCls:'fa-sign-out',click:function () { location.href = 'login.html'  }},
        {name:'我的资料',url:'app/file/index.html',iconCls:'fa-user', maximize : false,width:500,height : 300},
        {name:'文档',url:'app/file/index.html',iconCls:'fa-user', maximize : false,width:500,height : 300},
        {name:'设置',url:'app/file/index.html',iconCls:'fa-cog', maximize : false,width:500,height : 300},
    ]

    /**
     * 获取一个APP的参数
     * @param id id || url
     * @returns {*}
     */
    APP_CONFIG.getAppOptions = function(id){
        var appOptions
        var allApp = APP_CONFIG.apps.concat(APP_CONFIG.desktopApp)
        $.each( allApp , function () {
            if(id == (this.is || this.url)){
                appOptions = this
                return false
            }
        })
        return appOptions
    }

    desk.waite(1 , '检查登录信息')
    $.ajax({
        url : APP_CONFIG.apiUrl ,
        data : {method : 'getUser'},
        success:function (user) {
            if(!user){desk.tip('没有获取到登录信息，正在退回到登录界面')}
            setTimeout(function () {
                location.href = 'login.html'
            },5000)
        },
        error : function () {
            desk.removeWaite()
            desk.tip('获取用户信息失败')
        }
    })

    desk.waite(2)
    $.get(APP_CONFIG.apiUrl , {method : 'getApps'},function (apps) {
        desk.removeWaite()
        APP_CONFIG.apps = apps
    },'json').fail(function (e) {
        desk.removeWaite()
        desk.tip('获取开始菜单数据异常')
    })
    $.get(APP_CONFIG.apiUrl , {method : 'getDesktopApp'},function (desktopApp) {
        desk.removeWaite()
        APP_CONFIG.desktopApp = desktopApp
    },'json').fail(function (e) {
        desk.removeWaite()
        desk.tip('获取桌面APP数据异常')
    })



})()
