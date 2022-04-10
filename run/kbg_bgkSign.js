/*
cron 30 0/30 * * * kbg_bgkSign.js
#20220410
不挂科签到
by: kongbg
脚本更新时间：2022-04-07
脚本兼容: Node.js (其他语言不维护)
变量填写格式，多账号用换行(\\n)隔开。export bgkCookie="ck1\\nck2"
ck就是请求里的整个完整cookie
自己抓包不挂科
===========================
[Script]
屏蔽cr屏蔽on "1 0/屏蔽30 * * *" script-path=kbg_屏蔽bgkSign.js, tag=不挂科签到
*/
const $ = new Env('不挂科签到');
const notify = $.isNode() ? require('./sendNotify') : '';
const baseUrl = 'https://appwk.baidu.com';
let cookieStr = ($.isNode() ? process.env.bgkCookie : $.getdata('bgkCookie')) || ``;
let cookieArr = [];
let allMessage = '';
const timeout = 30000;

!(async () => {
    console.log('\n变量填写格式，多账号用换行(\\n)隔开。export bgkCookie="ck1\\nck2"')
    // 处理cookie
    cookieArr = initCookie(cookieStr);
    // console.log(cookieArr)
    await $.wait(delay()); //  随机延时
    for (let i=0;i<cookieArr.length;i++) {
        $.cookie = cookieArr[i];
        $.index = i+1;
        await run();
        await $.wait(1000);
    }

    await notify.sendNotify(`不挂科签到`, allMessage, {}, `\n\n本通知 By：kongbg`);
})()
    .catch((e) => {
      $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        // console.log(`${$.name}签到：${$.currentDay || 0}天`)
      $.done();
    })

function initCookie (str) {
    return str.split('\n');
}

// 随机延时1-30s，避免大家运行时间一样
function delay () {
    let time = parseInt(Math.random()*100000);
    if (time > 30000) {// 大于30s重新生成
        return delay();
    } else{
        console.log('随机延时：', `${time}ms, 避免大家运行时间一样`)
        return time;// 小于30s，返回
    }
}

async function run () {
    return new Promise(async resolve=>{
        // 获取用户信息
        $.name = await getUserInfo();

        // 获取签到详情
        $.currentDay = await getSignInfo();

        await $.wait(1000);
        
        // 签到
        const res = await doSign();

        if (res) {
            // 获取签到详情
            $.currentDay = await getSignInfo();
            allMessage+=`【账号${$.index}】 ${$.name}\n签到成功，累计签到${$.currentDay}天\n\n`
            resolve('')
        } else {
            $.log('', `❌ ${$.name}, 签到失败! `, '')
            allMessage+=`【账号${$.index}】 ${$.name}\n签到失败!${$.currentDay}天\n\n`
            resolve('')
        }
    })
}

// 获取用户信息
async function getUserInfo() {
    return new Promise(resolve=>{
        const queryStr = `fields=%5B%22gender%22%2C%22username%22%2C%22displayname%22%2C%22nickname%22%2C%22avatar%22%5D&cfrom=1099a&from=1099a&osbranch=i0&osname=baiduboxapp&service=bdbox&ua=828_1792_iphone_2.2.80.8_0&uid=394FA13E42ACD2E1E259B93224C16B7B56AC2EA0AOBCKGFGHTH&ut=iPhone11%2C8_15.4&appname=baiduboxapp`;
        const options = {
            url: `https://mbd.baidu.com/userx/v1/info/get?${queryStr}`,
            headers: {
                "Request-Tag": "Others",
                "Cookie":	$.cookie, 
                'X-BDBoxApp-NetEngine': -1,
                'X-Bd-Traceid': 'e3d729f9300f4235859a4fbb747c27f4',
                'User-Agent': '%E4%B8%8D%E6%8C%82%E7%A7%91/2.2.80.8 CFNetwork/1331.0.7 Darwin/21.4.0',
                'Accept': '*/*',
                'Host': "mbd.baidu.com",
                'Accept-Encoding': "gzip, deflate, br",
                "Connection": "keep-alive"
		    },
            timeout
        }
        $.get(options, (err, resp, data)=>{
            try {	
                data = JSON.parse(data) || null;
                if (data && data.errno == 0) {
                    // name
                    const name = data?.data?.fields.nickname || data?.data?.fields.username;
                    console.log('获取用户信息成功')
                    resolve(name);
                } else {
                    console.log('获取用户信息失败：', data)
                    resolve('');
                }
            }catch (e) {
                console.log('获取用户信息出错：', e, resp)
            }finally {
			}
        })
    }) 
}
// 获取签到详情
async function getSignInfo() {
    return new Promise(resolve=>{
        const queryStr = `bid=1&signCuid=e49f103fd4cb72979414658c17a46dc4&wk_New_Behavior=0&reso=828_1792&fr=2&sessid=1649331639&ua=bd_1792_828_iPhone11,8_2.2.80_15.4&baidu_cuid=394FA13E42ACD2E1E259B93224C16B7B56AC2EA0AOBCKGFGHTH&Bdi_bear=Reachable%20via%20WiFi&sys_ver=15.4&zid=bGC3SdxDDpeFMJVJcFM1vPK97fU9E5AN59vcBQVMryr6tJmKvp8YVc7lLvA65Jg_jwkWeXI04nz9kKix1BuLQkg&cuid=ee87378ed035a33ee1d9e59ef40d1cc609a65a4a&sign=969ae77868c15d2970fd8f59dc4b018c&uid=bd_0&timestamp=1649331639751&ilts=c21aa48d20d91f0e6ceefa43d09a6edb&idfv=3AA0A8D0-6EAA-41ED-8E9C-28DA2568AAEB&from=ios_&app_ver=2.2.80&pid=1&wk_cs_app=1&screen=828_1792&app_ua=iPhone11,8`;
        const options = {
            url: `${baseUrl}/naapi/stsign/activity?${queryStr}`,
            headers: {
                "Cookie": $.cookie,
                'User-Agent': '%E4%B8%8D%E6%8C%82%E7%A7%91/2.2.80.8 CFNetwork/1331.0.7 Darwin/21.4.0',
                'Accept': '*/*',
                'Host': "appwk.baidu.com",
                'Accept-Encoding': "gzip, deflate, br",
                "Connection": "keep-alive"
		    },
            timeout
        }
        $.get(options, (err, resp, data)=>{
            try {		
                data = JSON.parse(data)
                if (data.status.code == 0) {
                    let currentDay = data?.data.dayList.currentDay || 0;
                    console.log('获取签到详情成功')
                    console.log(`${$.name}已签到：${currentDay || 0}天`)
                    resolve(currentDay);
                } else {
                    console.log('获取签到详情失败：', data)
                    resolve('');
                }
            }catch (e) {
                console.log('获取签到详情出错：', e, resp)
            }finally {
                
			}
        })
    }) 
}
// 签到
async function doSign() {
    return new Promise(resolve=>{
        const queryStr = `id=bgk_sign_award_status&uid=bd_0&sessid=1649335225&app_ua=iPhone11,8&bid=1&screen=828_1792&from=ios_&timestamp=${getTimestamp()}&fr=2&signCuid=04e8065ac9300cfe2b7da10c4b1c1d25&cuid=ee87378ed035a33ee1d9e59ef40d1cc609a65a4a&wk_cs_app=1&ilts=c21aa48d20d91f0e6ceefa43d09a6edb&Bdi_bear=Reachable%20via%20WiFi&baidu_cuid=394FA13E42ACD2E1E259B93224C16B7B56AC2EA0AOBCKGFGHTH&ua=bd_1792_828_iPhone11,8_2.2.80_15.4&app_ver=2.2.80&pid=1&wk_New_Behavior=0&sys_ver=15.4`;
        const options = {
            url: `${baseUrl}/xpage/form/getform?${queryStr}`,
            headers: {
                "cookie":	$.cookie,
                'User-Agent': '%E4%B8%8D%E6%8C%82%E7%A7%91/2.2.80.8 CFNetwork/1331.0.7 Darwin/21.4.0',
                'Accept': '*/*',
                'Host': "appwk.baidu.com",
                'Accept-Encoding': "gzip, deflate, br",
                "Connection": "keep-alive"
		    },
            timeout
        }
        $.get(options, (err, resp, data)=>{
            try {		
                data = JSON.parse(data) || null;
                if (data && data.status.code == 0) {
                    console.log('签到成功')
                    resolve(true);
                } else {
                    console.log('签到失败：', data)
                    resolve(false);
                }
            }catch (e) {
                console.log('签到出错：', e, resp)
            }finally {
                
			}
        })
    }) 
}

function getTimestamp () {
    return new Date(new Date()).getTime();
}




// prettier-ignore
function Env(t,e){"undefined"!=typeof process&&JSON.stringify(process.env).indexOf("GITHUB")>-1&&process.exit(0);class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),n={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(n,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`❗️${this.name}, 错误!`,t.stack):this.log("",`❗️${this.name}, 错误!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}