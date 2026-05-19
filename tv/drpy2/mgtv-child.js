var rule = {
    title: '芒果TV-少儿',
    host: 'https://www.mgtv.com',
    homeUrl: '/child/',
    searchUrl: 'https://so.mgtv.com/so?k=**',
    searchable: 0,
    quickSearch: 0,
    filterable: 1,
    url: 'fyclass',
    headers: {
        'User-Agent': 'PC_UA',
        //'Cookie':'cna=VvNvGX3e0ywCAavVEXlnA2bg; __ysuid=1626676228345Rl1; __ayft=1652434048647; __arycid=dm-1-00; __arcms=dm-1-00; __ayvstp=85; __arpvid=1667204023100cWWdgM-1667204023112; __ayscnt=10; __aypstp=60; isg=BBwcqxvvk3BxkWQGugbLpUSf7TrOlcC_U7GAj_YdfYfvQbzLHqYGT4Hgp6m5TvgX; tfstk=c3JOByYUH20ilVucLOhh0pCtE40lZfGc-PjLHLLfuX7SWNyAiQvkeMBsIw7PWDC..; l=eBQguS-PjdJFGJT-BOfwourza77OSIRA_uPzaNbMiOCPOb1B5UxfW6yHp4T6C3GVhsGJR3rp2umHBeYBqQd-nxvOF8qmSVDmn',
    },
    timeout: 5000,
    //动态分类获取 列表;标题;链接;正则提取 不需要正则的时候后面别加分号
    //class_parse:'div.hitv_wrap&&a;a&&Text;a&&href;/b/.*?/.*?\.html.*?',
    filter: {
        '20': [{
                'key': 'myclass',
                'name': '类型',
                'value': [{
                        "v": "/b/714377/22338087.html",
                        "n": "嘿，托玛"
                    }, {
                        "v": "/b/611790/21155332.html",
                        "n": "汪汪队"
                    }, {
                        "v": "/b/739419/22598301.html",
                        "n": "熊出没"
                    }, {
                        "v": "/b/8427/1860689.html",
                        "n": "小猪佩奇"
                    }, {
                        "v": "/b/394132/14601580.html",
                        "n": "宝宝巴士"
                    }, {
                        "v": "/b/662664/22307572.html",
                        "n": "萌宝战警"
                    }, {
                        "v": "/b/499348/17832608.html",
                        "n": "叮咚小芒果"
                    }, {
                        "v": "/b/609576/20419363.html",
                        "n": "依娜和恰恰"
                    }, {
                        "v": "/b/331145/6208522.html",
                        "n": "宝贝JOJO"
                    }, {
                        "v": "/b/558378/19286002.html",
                        "n": "喜羊羊"
                    }, {
                        "v": "/b/408475/15305703.html",
                        "n": "动物王国"
                    }, {
                        "v": "/b/332743/6602443.html",
                        "n": "猪猪侠"
                    }, {
                        "v": "/b/327386/4793372.html",
                        "n": "萌鸡小队"
                    }
                ]
            }
        ]
    },
    limit: 20,
    play_parse: false,
    // 手动调用解析请求json的url,此lazy不方便
    // lazy:'js:print(input);fetch_params.headers["user-agent"]=MOBILE_UA;let html=request(input);let rurl=html.match(/window\\.open\\(\'(.*?)\',/)[1];rurl=urlDeal(rurl);input={parse:1,url:rurl};',
    //lazy:'js:input={parse:1,jx:1,url:input};',
    // 推荐:'.list_item;img&&alt;img&&src;a&&Text;a&&data-float',
    // 预处理:'rule_fetch_params.headers.Cookie = "xxxx";',
    // 类似海阔一级 列表;标题;图片;描述;链接;详情 其中最后一个参数选填
    // 如果是双层定位的话,推荐的第2段分号代码也是第2层定位列表代码
    推荐: 'div[data-track-id];a&&img&&alt;a&&img&&src;a&&img&&alt;a&&href',
    //一级 列表;标题;图片;描述;链接;详情 其中最后一个参数选填
    一级: 'div[data-track-id];a&&img&&alt;a&&img&&src;a&&img&&alt;a&&href',
    二级: {
        title: 'div.introduce&&div.content&&p.name&&Text',
        img: 'div.introduce&&div.img&&a&&img&&src',
        desc: 'div.introduce-items&&p:eq(0)&&Text;div.introduce-items&&p:eq(1)&&Text;div.introduce-items&&p:eq(2)&&Text;div.introduce-items&&p:eq(3)&&Text',
        content: 'div.introduce&&div.content&&p.e-txthide2&&Text',
        tabs: '',
        lists: '',
        tab_text: '',
        list_text: '',
        list_url: ''
    },
    搜索: '',
}
