let rule = {
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
    class_parse:'div.hitv_wrap&&a;a&&Text;a&&href;/b/.*?/.*?\.html.*?',
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
    二级: `js:
//let html = JSON.parse(fetch(input, fetch_params));
//let the_url = input;
//https://www.mgtv.com/b/611790/21155332.html?fpa=1566&fpos=&lastp=ch_child
let the_origin_url = "https://www.mgtv.com/b/611790/21155332.html?fpa=1566&fpos=&lastp=ch_child";
let the_regex = /\/b\/(\d+)\/(\d+)\.html/;
print(input);
let the_match = the_origin_url.match(the_regex);
let the_vid;
let the_cid;
let base_vod;
let the_reqHeaders={"accept":"application/json, text/plain, */*","origin": "https://www.mgtv.com","referer": "https://www.mgtv.com/","user-agent": PC_UA};
let the_reqOptions01 = {
    method: "GET",
    headers: the_reqHeaders
};
print("-------------");
print(the_match);
print("-------------");
if (the_match) {
    the_cid = the_match[1]; // "611790"
    the_vid = the_match[2]; // "21155332"
	print("-------------");
	print(the_cid);
	print(the_vid);
	print("-------------");
    let the_info_url = "https://pcweb.api.mgtv.com/video/info?allowedRC=1&vid=" + the_vid + "&cid=" + the_cid + "&type=b&_support=10000000";
	print("-------------");
	print(the_info_url);
	print("-------------");
	let the_req_ret_raw = fetch(the_info_url, the_reqOptions01);
	print(the_req_ret_raw);
    let the_info_data = JSON.parse(the_req_ret_raw);
    if (the_info_data.code == 200) {
        let the_vdata = the_info_data.data;
        let the_vdata_info = the_vdata.info;
        base_vod = {
            vod_id: the_origin_url,
            vod_name: the_vdata_info.title,
            type_name: the_vdata_info.detail.kind,
            vod_actor: the_vdata_info.detail.leader,
            vod_director: the_vdata_info.detail.presenter,
            vod_content: the_vdata_info.detail.story,
            vod_remarks: the_vdata_info.detail.join(","),
            vod_pic: the_vdata_info.clipImage
        };
    }
    let the_page = 0;
    let the_size = 30;
    //https://pcweb.api.mgtv.com/episode/list?_support=10000000&version=5.5.35&video_id=21155332&page=0&size=30&platform=4&src=mgtv
    let the_playlist_url = "https://pcweb.api.mgtv.com/episode/list?_support=10000000&version=5.5.35&video_id=" + the_vid + "&page=" + the_page + "&size=" + the_size + "&platform=4&src=mgtv";
    let the_playlist_data = JSON.parse(fetch(the_playlist_url, {
                method: "GET",
                redirect: "follow"
            }));
    if (the_playlist_data.code == 200) {
        let the_pdata = the_playlist_data.data;
        let the_ptotal = the_pdata.total;
        let the_pcount = the_pdata.count;
        let the_ptotal_page = the_pdata.total_page;
        let the_plists = the_pdata.list;
        let vod_play = {};
        let playList = "";
        let vodItems = [];
        the_plists.forEach(function (plist, pindex) {
            if (parseInt(plist.isIntact) == 1) {
                vodItems.push((plist.t4 || "") + "$" + urlDeal("https://www.mgtv.com" + item.url || ""))
            }

        });
        if (vodItems.length > 0) {
            playList = vodItems.join("#")
        }
        if (playList.length > 0) {

            vod_play["mgtv"] = playList;
            //
            let tabs = Object.keys(vod_play);
            let playUrls = [];
            for (let id in tabs) {
                print("id:" + id);
                playUrls.push(vod_play[tabs[id]])
            }
            if (tabs.length > 0) {
                let vod_play_from = tabs.join("$$$");
                let vod_play_url = playUrls.join("$$$");
                base_vod.vod_play_from = vod_play_from;
                base_vod.vod_play_url = vod_play_url
            }
            VOD = base_vod;
            console.log(base_vod);
        }

    }
}

	`,
    搜索: '',
}
