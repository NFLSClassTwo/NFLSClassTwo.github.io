/**
 * 主页脚本
 */
(function($){
    // 获取此js的目录
    var thisScriptPath = $('script:last').attr('src')
    var thisScriptParent = thisScriptPath.substr(0 , thisScriptPath.lastIndexOf('/'))
    console.log(thisScriptPath)
    console.log(thisScriptParent)
    window.desk = {}
    const libs = ['https://www.jq22.com/jquery/font-awesome.4.7.0.css',thisScriptParent + '/config.js']
    const DATA = {}
    /**
     * 所有的APP
     * @type {Array}
     */
    const APPS = [{name:'我的文件',url:'app/file/index.html',iconCls:'fa-folder',headHover:true},{name:'百度一下',url:'http://www.baidu.com'}]

    /**
     * 动态加载依赖库，css直接加载，js加入加载列表，等待依次加载
     * @param js
     */
    function load(lib) {
        if(lib.substring(lib.lastIndexOf('.')) == '.css'){
            loadCss(lib)
        }else{
            DATA.libs_js_list = DATA.libs_js_list || []
            DATA.libs_js_list.push(lib);
            DATA.libs_js_list_count =  DATA.libs_js_list.length
        }
    }

    /**
     * 加载CSS文件
     * @param css
     */
    function loadCss(css) {
        const link = $('<link rel="stylesheet"  type="text/css">')
        link.attr('href' , css)
        $('body').append(link)
    }

    /**
     * 加载js依赖，从js列表依次加载，加载完成后调取回调加载成功的函数 onLoadSuccess
     */
    function loadJs() {
        if(!DATA.libs_js_list || DATA.libs_js_list.length == 0){
            loadUi(DATA.libs_js_list_count,DATA.libs_js_list_count);
            if(DATA.waite_count === 0 || !DATA.waite_count ){  onLoadSuccess()   }
            return
        }
        loadUi(DATA.libs_js_list_count - DATA.libs_js_list.length , DATA.libs_js_list_count)
        $.getScript(DATA.libs_js_list.splice(0 , 1) , loadJs)
    }

    /**
     * 让桌面挂起，暂时不加载桌面
     */
    function waite(count) {
        DATA.waite_count = DATA.waite_count || 0
        DATA.waite_count += (count || 1 )
    }

    /**
     * 移除等待
     */
    function removeWaite(count) {
        DATA.waite_count -= (count || 1)
        if(DATA.waite_count == 0){
            onLoadSuccess()
        }
    }

    /**
     * 将js注册到libs中
     * @param js
     */
    function register(js) {
        libs.push(js)
    }

    /**
     * 加载lib的进度条
     * @param index
     * @param all
     */
    function loadUi(index , all) {
        const div = $('.load-libs').length > 0 ? $('.load-libs') : $('<div class="load-libs"><div></div></div>').appendTo('body')
        div.find('div').width(index * 100 / all + '%')
    }

    /**
     * 当lib加载成功
     */
    function onLoadSuccess() {
        // 移除加载过程的UI
        $('.load-libs').remove()
        $('.welcome').remove()
        // 开启时间刷新
        refDateTime()
        // 自动打开首页
        openApp({id:'home',url : 'home.html',type:'sub',name:'首页',closable:false , toolbar :false})
        // 开始菜单点击事件
        $('#start-menu').click(function () {
            $('#start-menu-content,#start-menu-bg').toggle()
        })
        $('#start-menu-bg').click(function () {
            $('#start-menu-content,#start-menu-bg').hide()
        })
        // 时间点击事件
        $('#date-time').click(function (){
            openApp('app/Simple-Calendar/index.html')
        })
        reload(true)
    }

    function reload(isStart) {
        if(!isStart){
            // 刷新首页
            loadAppBody(DATA.apps['home'])
        }
        // 加载开始菜单
        var　startMenu = $('#start-menu-content div.menu')
        startMenu.empty()
        $.each(APP_CONFIG.apps || APPS , function () {
            var that = this
            var app = $('<div>').appendTo(startMenu)
            var icon = $('<div class="icon fa">').appendTo(app)
            var text = $('<div class="text">').appendTo(app)
            icon.addClass(this.iconCls || 'fa-edge')
            text.text(this.name)
            app.click(function () {
                openApp(that)
                $('#start-menu-content,#start-menu-bg').hide()
            })
        })

        $.each(APP_CONFIG.userBtns , function () {
            addUserButton(this);
        })
    }

    /**
     * 加载libs
     */
    function loadLibs() {
        DATA.libs_count = DATA.libs_count || libs.length
        DATA.libs_index = DATA.libs_index || 0
        setTimeout(function () {
            if(libs.length > 0){
                load(libs.splice(0,1)[0])
                loadUi(DATA.libs_index++ , DATA.libs_count)
                loadLibs()
            }else{
                loadUi(DATA.libs_index++ , DATA.libs_count)
                // 全部加载完成之后再加载JS，因为1、JS加载是有顺序；2、JS加载完之后可能需要回调
                setTimeout(loadJs,100);
            }
        }, 10)
    }

   function refDateTime() {
       DATA.ref_date_time?clearInterval(DATA.ref_date_time):null
       DATA.ref_date_time = setInterval(function () {
            DATA.ref_date_time_split = DATA.ref_date_time_split == " "? ":" : " "
            const date = new Date();
            const dateStr = date.getFullYear() + '/' + (date.getMonth() +1 )+ '/' + date.getDate()
            const timeStr = date.getHours() + DATA.ref_date_time_split + (date.getMinutes() < 10 ? '0' : '') +date.getMinutes()
            $('#date-time').html(timeStr +'<br>'+ dateStr)
        },1000)
   }

    /**
     * 向一个容器增加按钮
     * @param toolbars
     * @param $ele
     * @returns {*|addToolbar}
     */
   function addToolbar(toolbars , $ele) {
       $ele = $ele || this
       $.each(toolbars , function () {
           var toolbar = $('<span class="fa">').appendTo($ele).addClass(this.iconCls)
           toolbar.click(this.click).append(this.label).attr('title' ,this.title)
       })
       return $ele
   }

    /**
     * 为APP增加一个菜单
     */
    function addAppMenu(menus , app , $ele) {
        $.each(menus , function () {
            if(this.hidden == false){return}
            var _this = this
           var m = $('<div class="fa"></div>').appendTo(app.menu)
            m.addClass(this.iconCls).attr('title' , this.title).append(this.title)
           m.click(function () { _this.click.call(app , this) })
        })
        return app;
    }


    /**
     * 加载APP
     */
   function loadAppBody(app) {
        var appOption = app.appOption
        app.content.empty()
        var bodyClass = 'body'
        if(appOption.toolbar != false){
            app.head = $('<div class="head">').appendTo(app.content)
            app.title = $('<span class="title fa">').appendTo(app.head)
            app.title.append(appOption.name).addClass(appOption.iconCls)
            app.toolbar = $('<div class="toolbar">').appendTo(app.head)
            var toolbar = [
                {title : '最大化',iconCls : 'fa-square-o',click : function () { maximizeApp(app) }},
                {title : '还原',iconCls : 'fa-minus-square-o',click : function () { restoreApp(app) }},
                {title : '最小化',iconCls : 'fa-minus',click : function () { hideApp(app) }},
                {title : '关闭',iconCls : 'fa-close',click : function () { closeApp(app) }},
            ]
            addToolbar($.extend(toolbar,appOption.toolbar) , app.toolbar)
            if(appOption.headHover){
                app.head.addClass('hover')
                bodyClass = 'body full-screen'
            }
        }else{
            bodyClass = 'body full-screen'
        }
        if(appOption.type == 'sub'){
            app.iframe = $('<div>').appendTo(app.content ).addClass(bodyClass)
            app.iframe.load(appOption.url)
        }else{
            app.iframe = $('<iframe>').appendTo(app.content ).addClass(bodyClass)
            app.iframe.attr('src',appOption.url)
        }
        if(appOption.maximize == false){
            restoreApp(app)
        }else{
            maximizeApp(app)
        }
        return app;
   }

    /**
     * 加载APP任务栏按钮
     */
   function loadAppTaskbar(app) {
        var appOption = app.appOption
        app.taskbar = $('<div class="fa">').appendTo('#task-bar')
        app.taskbar.addClass(appOption.iconCls)
        app.taskbar.attr('title' , appOption.name)
        app.menu = $('<div class="menu">').appendTo(app.taskbar)
        var menus =[
            {title : '关闭',iconCls : 'fa-close',click : function () { closeApp(app) },hidden : appOption.closable},
            {title : '刷新',iconCls : 'fa-refresh',click : function () { loadAppBody(app);}},
            {title : '收藏',iconCls : 'fa-minus',click : function () { appOption.collect = true}},
        ]
        addAppMenu($.extend(menus, appOption.taskbarMenus), app ,app.menu)
        // 绑定任务栏点击事件
        app.menu_click_ele = $('<div style="position: absolute;width: 40px;height: 40px;bottom: 0px;">').appendTo(app.taskbar)
        app.menu_click_ele.click(function () {  openApp(appOption) })
   }

    /**
     * 显示APP
     * app : app对象
     * isShow : 未指定时自动判断，已置为当前则隐藏，指定了则始终显示
     */
   function showApp(app , isShow) {
       if(app == DATA.currApp){
           if(app.id != 'home' && !isShow){
            hideApp(app) ; 
           }
            return
        }
        if(DATA.currApp && DATA.currApp.content){
            DATA.currApp.taskbar.removeClass('active')
        }
        DATA.currApp = app;
        DATA.open_app_list =  DATA.open_app_list || []
        DATA.open_app_list.unshift(app)
        app.content.show()
        DATA.content_z_index = DATA.content_z_index || 1
        app.content.css({'z-index' : ++DATA.content_z_index })
        app.taskbar.addClass('active')
        $('head>title').text(app.appOption.name)
        location.hash = app.appOption.url
        return app;
   }

    /**
     * app的最小化
     * @param app
     */
   function hideApp(app) {
        app.content.hide()
        app.taskbar.removeClass('active')
        if(DATA.currApp == app){
            DATA.currApp = null;
        }
   }

    /**
     * 将APP最大化还原成窗口
     * @param app
     */
   function restoreApp(app) {
        app.content.addClass('dialog')
        app.content.css({height : app.appOption.height  || app.content.parent().height(), width : app.appOption.width || app.content.parent().width() })
        addMoveEvent(app.head[0] , app.content[0])
        app.title.click(function () {  showApp(app , true)  })
        setCenter(app.content)
        app.head.find('.toolbar .fa-square-o').show()
        app.head.find('.toolbar .fa-minus-square-o').hide()
   }

    /**
     * 将元素居中
     * @param ele
     */
   function setCenter(ele) {
       var pHeight = $(ele).parent().height()
       var pWidth = $(ele).parent().width()
       var height = $(ele).height()
       var width = $(ele).width()
       var top = (pHeight - height) / 2
       var left = (pWidth - width) / 2
       $(ele).css({top : top , left : left})
   }

   /**
     * 将APP为窗口化转换为最大化
     * @param app
     */
   function maximizeApp(app) {
       app.content.removeClass('dialog')
       app.content.css({height : '100%', width : '100%',top : 0 ,left : 0 })
       if(app.head){
           app.head.find('.toolbar .fa-square-o').hide()
           app.head.find('.toolbar .fa-minus-square-o').show()
       }
   }
    /**
     * 关闭APP
     * @param app
     */
    function closeApp(app) {
        app.content.remove();app.taskbar.remove();delete DATA.apps[app.appOption.id]
        DATA.open_app_list.splice(0,1)
        for(var k in DATA.open_app_list){
            var thisApp = DATA.apps[DATA.open_app_list[k].appOption.id]
            if(thisApp){
                showApp(thisApp);return;
            }else{
                DATA.open_app_list.splice(k , 1)
            }
        }
    }
    /**
     * 打开一个APP
     * @param app
     */
    function openApp(appOption) {
        if(appOption instanceof HTMLElement || appOption.nodeType === 1){
            appOption = getOptions(appOption)
        }else if(typeof appOption == 'string'){
            var this_appOptions = APP_CONFIG.getAppOptions(appOption)
            if(!this_appOptions){tip("没用找到应用：" + appOption);return;}
            appOption = this_appOptions
        }
        DATA.apps = DATA.apps || {}
        appOption.id = appOption.id || appOption.url
        appOption.iconCls = appOption.iconCls || 'fa-square-o'
        let app = DATA.apps[appOption.id];
        // 已经打开过的
        if(!app){
            app = {appOption : appOption}
            // 将APP增加到全局变量
            DATA.apps[appOption.id] = app
            // APP 内容
            app.content = $('<div class="content">').appendTo('#desktop')
            // 加载APP
            loadAppBody(app)
            // 加载任务栏按钮
            loadAppTaskbar(app);
        }
        // 显示APP
        showApp(app)
    }

    /**
     * 增加用户按钮，位置：开始菜单左侧
     */
    function addUserButton(userButtonOptions) {
        var div = $('#start-menu-content>.user')
        var btn = $('<div class="user-button fa">').appendTo(div)
        btn.addClass(userButtonOptions.iconCls  || 'fa-user')
        btn.attr('title' ,userButtonOptions.title || userButtonOptions.name)
        btn.click(function () {
            if($.isFunction(userButtonOptions.click)){
                userButtonOptions.click.call(this)
                $('#start-menu-content,#start-menu-bg').hide()
            }else if(userButtonOptions.url){
                openApp(userButtonOptions)
                $('#start-menu-content,#start-menu-bg').hide()
            }
        })
    }

    /**
     * 获取一个元素的所有属性
     * @param ele
     * @returns {*}
     */
    function getOptions(ele){
        var options = $(ele).attr('data-options') || '' , opts
        if(options.substring(0,1) == '{'){
            opts = eval( '(' + options + ')')
        }else{
            opts = eval( '({' + options + '})')
        }
        $.each(ele.attributes, function() {
            if(this.specified) {
                opts[this.name] = this.value;
            }
        });
       return opts;
    }

    /**
     * 为元素增加拖拽事件
     * @param ele
     * @param callback
     */
    function addMoveEvent(dragEle ,moveEle ,callback){
        dragEle.onmousedown = function(ev) {
            var oevent = ev;
            var distanceX = oevent.clientX - moveEle.offsetLeft;
            var distanceY = oevent.clientY - moveEle.offsetTop;

            document.onmousemove = function (ev) {
                moveEle.style.left = ev.clientX - distanceX + 'px';
                moveEle.style.top = ev.clientY - distanceY + 'px';
            };
            document.onmouseup = function () {
                document.onmousemove = null;
                document.onmouseup = null;
                if(typeof callback == 'function'){
                    callback.call(moveEle , dragEle)
                }
            };
        }
    }

    /**
     * 在右下方弹出一个提示信息
     * @param message
     */
    var tip = (function() {
        var div
        function setTimeRemove(ele){
            return setTimeout(function () {
                $(ele).hide(500 , function () {  $(this).remove() })
            } , 5000)
        }
        return function(msg) {
            if(!div){div = $('<div class="tip-box">').appendTo('body')}
            var msgDiv = $('<div class="message">').appendTo(div).append(msg)
            var i = setTimeRemove(msgDiv)
            msgDiv.hover(function () { clearTimeout(i)  } , function () { i = setTimeRemove(msgDiv)  })
        }
    })()

    // 解析器
    desk.parse = function (div) {
        $(div || 'body').find('.app').each(function () {
            $(this).click(function () {
                openApp(getOptions(this))
            })
        })
    }
    desk.openApp = openApp
    desk.tip = tip
    desk.reload = reload
    desk.waite = waite
    desk.removeWaite = removeWaite
    // 加载依赖库
    loadLibs()
})(jQuery)