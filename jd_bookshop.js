/*
口袋书店
更新时间：2021-06-26 
加了一个码,修复需要手动打开的问题
活动入口：京东app首页-京东图书-右侧口袋书店
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#口袋书店
1 8,12,18 * * *  https://raw.githubusercontent.com/Wenmoux/scripts/wen/jd/chinnkarahoi_jd_bookshop.js, tag=口袋书店, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true

================Loon==============
[Script]
cron "1 8,12,18 * * *" script-path= https://raw.githubusercontent.com/Wenmoux/scripts/wen/jd/chinnkarahoi_jd_bookshop.js,tag=口袋书店

===============Surge=================
口袋书店 = type=cron,cronexp="1 8,12,18 * * *",wake-system=1,timeout=3600,script-path= https://raw.githubusercontent.com/Wenmoux/scripts/wen/jd/chinnkarahoi_jd_bookshop.js

============小火箭=========
口袋书店 = type=cron,script-path= https://raw.githubusercontent.com/Wenmoux/scripts/wen/jd/chinnkarahoi_jd_bookshop.js, cronexpr="1 8,12,18* * *", timeout=3600, enable=true
 */
const $ = new Env('口袋书店');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message;
const ACT_ID = 'dz2010100034444201', shareUuid = '28a699ac78d74aa3b31f7103597f8927'
let ADD_CART = false
ADD_CART = $.isNode() ? (process.env.PURCHASE_SHOPS ? process.env.PURCHASE_SHOPS : ADD_CART) : ($.getdata("ADD_CART") ? $.getdata("ADD_CART") : ADD_CART);
// 加入购物车开关，与东东小窝共享

let inviteCodes = [
  '28a699ac78d74aa3b31f7103597f8927@dbffb1e337174317a6482c237a871bfd@2f14ee9c92954cf79829320dd482bf49@fdf827db272543d88dbb51a505c2e869@ce2536153a8742fb9e8754a9a7d361da@38ba4e7ba8074b78851e928af2b4f6b2',
  '28a699ac78d74aa3b31f7103597f8927@dbffb1e337174317a6482c237a871bfd@2f14ee9c92954cf79829320dd482bf49@fdf827db272543d88dbb51a505c2e869'
]

if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
  };
} else {
  cookiesArr = [$.getdata('CookieJD'), $.getdata('CookieJD2'), ...jsonParse($.getdata('CookiesJD') || "[]").map(item => item.cookie)].filter(item => !!item);
}

!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/', {"open-url": "https://bean.m.jd.com/"});
    return;
  }
  $.shareCodesArr = []
  await requireConfig()
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      $.exit = false;
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/`, {"open-url": "https://bean.m.jd.com/"});
        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await shareCodesFormat()
      await jdBeauty()
    }
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

async function jdBeauty() {
  $.score = 0
  await getIsvToken()
  await getIsvToken2()
  await getActCk()
  await getActInfo()
  await getToken()
  await accessLogWithAD()
  await getUserInfo()
  await getActContent(false, shareUuid)
  if ($.exit) return
  await doHelpList()
  await getAllBook()
  await getMyBook()
  await getActContent(true)
  if ($.gold > 800) {
    console.log(`金币大于800，去抽奖`)
    while ($.gold >= 800) {
      await draw()
      await $.wait(1000)
      $.gold -= 800
    }
  }
  if($.userInfo.storeGold) await chargeGold()
  await helpFriends()
  await showMsg();
}

async function helpFriends() {
  for (let code of $.newShareCodes) {
    if (!code) continue
    console.log(`去助力好友${code}`)
    await getActContent(true, code)
    await $.wait(500)
  }
}

// 获得IsvToken
function getIsvToken() {
  return new Promise(resolve => {
    let body = 'body=%7B%22to%22%3A%22https%3A%5C%2F%5C%2Flzdz-isv.isvjcloud.com%5C%2Fdingzhi%5C%2Fbook%5C%2Fdevelop%5C%2Factivity%3FactivityId%3Ddz2010100034444201%22%2C%22action%22%3A%22to%22%7D&build=167490&client=apple&clientVersion=9.3.2&openudid=53f4d9c70c1c81f1c8769d2fe2fef0190a3f60d2&sign=f3eb9660e798c20372734baf63ab55f2&st=1610267023622&sv=111'
    $.post(jdUrl('genToken', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            $.isvToken = data['tokenKey']
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

// 获得对应游戏的访问Token
function getIsvToken2() {
  return new Promise(resolve => {
    let body = 'body=%7B%22url%22%3A%22https%3A%5C%2F%5C%2Flzdz-isv.isvjcloud.com%22%2C%22id%22%3A%22%22%7D&build=167490&client=apple&clientVersion=9.3.2&openudid=53f4d9c70c1c81f1c8769d2fe2fef0190a3f60d2&sign=6050f8b81f4ba562b357e49762a8f4b0&st=1610267024346&sv=121'
    $.post(jdUrl('isvObfuscator', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            $.token2 = data['token']
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

// 获得游戏的Cookie
function getActCk() {
  return new Promise(resolve => {
    $.get(taskUrl("dingzhi/book/develop/activity", `activityId=${ACT_ID}`), (err, resp, data) => {
      try {
        if (err) {
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if($.isNode())
            for (let ck of resp['headers']['set-cookie']) {
              cookie = `${cookie}; ${ck.split(";")[0]};`
            }
          else{
            for (let ck of resp['headers']['Set-Cookie'].split(',')) {
              cookie = `${cookie}; ${ck.split(";")[0]};`
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

// 获得游戏信息
function getActInfo() {
  return new Promise(resolve => {
    $.post(taskPostUrl('dz/common/getSimpleActInfoVo', `activityId=${ACT_ID}`), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.result) {
              $.shopId = data.data.shopId
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

// 获得游戏的Token
function getToken() {
  return new Promise(resolve => {
    let body = `userId=${$.shopId}&token=${$.token2}&fromType=APP`
    $.post(taskPostUrl('customer/getMyPing', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            $.token = data.data.secretPin
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}

// 获得用户信息
function getUserInfo() {
  return new Promise(resolve => {
    let body = `pin=${encodeURIComponent($.token)}`
    $.post(taskPostUrl('wxActionCommon/getUserInfo', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (safeGet(data)) {
            data = JSON.parse(data);
            if (data.data) {
              console.log(`用户【${data.data.nickname}】信息获取成功`)
              $.userId = data.data.id
              $.pinImg = data.data.yunMidImageUrl
              $.nick = data.data.nickname
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
// 获得用户信息
function accessLogWithAD() {
  return new Promise(resolve => {
    let body = `venderId=${ $.shopId}&code=99&pin=${encodeURIComponent($.token)}&activityId=${ACT_ID}&pageUrl=https%3A%2F%2Flzdz-isv.isvjcloud.com%2Fdingzhi%2Fbook%2Fdevelop%2Factivity%3FactivityId%3Ddz2010100034444201%26lng%3D107.146945%26lat%3D33.255267%26sid%3Dcad74d1c843bd47422ae20cadf6fe5aw%26un_area%3D27_2442_2444_31912&subType=app&adSource=`
    $.post(taskPostUrl('common/accessLogWithAD', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
    //      if (safeGet(data)) {
          if($.isNode())
            for (let ck of resp['headers']['set-cookie']) {
              cookie = `${cookie}; ${ck.split(";")[0]};`
            }
          else{
            for (let ck of resp['headers']['Set-Cookie'].split(',')) {
              cookie = `${cookie}; ${ck.split(";")[0]};`
            }
          }
       //   }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
  })
}
// 获得游戏信息
function getActContent(info = false, shareUuid = '') {
  return new Promise(resolve => {
    let body = `activityId=${ACT_ID}&pin=${encodeURIComponent($.token)}&pinImg=${$.pinImg}&nick=${$.nick}&cjyxPin=&cjhyPin=&shareUuid=${shareUuid}`
    $.post(taskPostUrl('dingzhi/book/develop/activityContent', body), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
   //     console.log(data)
          if (data && safeGet(data)) {
            data = JSON.parse(data);
            if (data.data) {
              $.userInfo = data.data
              if (!$.userInfo.bookStore) {
                $.exit = true
                console.log(`京东账号${$.index}尚未开启口袋书店，请手动开启`)
                console.log('\n提示：从五月份开始，需要手动进入一下活动页面。不然即使是开启了这个活动。跑脚本也提示未开启活动\n')
                return
              }
              $.actorUuid = $.userInfo.actorUuid
              // if(!info) console.log(`您的好友助力码为${$.actorUuid}`)
              if(!info) console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${$.actorUuid}\n`);
              $.gold = $.userInfo.bookStore.hasStoreGold
              if (!info) {
                const tasks = data.data.settingVo
                for (let task of tasks) {
                  if (['关注店铺'].includes(task.title)) {
              
