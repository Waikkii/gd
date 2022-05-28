import requests, re, json, os


def GET_TUAN_ID():
    m, n = 5, 5
    while m:
        # 基于 178 大佬的 activeId.py 改写，感谢大佬！
        url = 'https://wqsd.jd.com/pingou/dream_factory/index.html'
        r = requests.get(url)
        if r.ok:
            resp = r.text
            TUAN_ACTIVEID = re.findall('((?<=.)activeId.*?==)(?:.*?)("start".*?(?=,))(?:.*?)("end".*?(?=,))', re.sub('%3D%3D', '==', ''.join(re.findall('({"width".*?})', resp))))[0][0].split("=",1)[1]
            return TUAN_ACTIVEID
        else:
            m -= 1
    # while n:
    #     url = 'https://cdn.jsdelivr.net/gh/gitupdate/updateTeam@master/shareCodes/jd_updateFactoryTuanId.json'
    #     r = requests.get(url)
    #     if r.ok:
    #         TUAN_ACTIVEID = r.json()['tuanActiveId']
    #         return TUAN_ACTIVEID
    #     else:
    #         n -= 1
    return False


def TUAN_ACTIVEID():
    TUAN_ACTIVEID = GET_TUAN_ID()
    print(TUAN_ACTIVEID)


def findCrontab():
    crontab_list = f'{env}/config/crontab.list'
    with open(crontab_list, 'r', encoding='utf-8') as f1:
        crontabs = f1.readlines()
    for crontab in crontabs:
        if crontab.find("jd_dreamFactory") != -1:
            cron = ' '.join(crontab.split(" ")[:5])
            return cron
    return False


def checkCrontab():
    storage = '/' + path_list[-2]
    file = '/' + path_list[-1]
    crontab_list = f'{env}/config/crontab.list'
    key = '# 获取京喜工厂团ID（请勿删除此行）\n'
    new = f'{cron} python /jd{storage}{file} >> /jd/log{file.split(".")[0]}.log 2>&1\n'
    with open(crontab_list, 'r', encoding='utf-8') as f1:
        crontab = f1.readlines()
    if crontab[-1] == '\n':
        del (crontab[-1])
    if key in crontab:
        m = crontab.index(key) + 1
        if crontab[m] != new:
            crontab[m] = new
            with open(crontab_list, 'w', encoding='utf-8') as f2:
                print(''.join(crontab), file=f2)
        else:
            return
    else:
        crontab.append(f'\n{key}{new}')
        with open(crontab_list, 'w', encoding='utf-8') as f2:
            print(''.join(crontab), file=f2)


def tgNofity(user_id, bot_token, text):
    TG_API_HOST = 'api.telegram.org'
    url = f'https://{TG_API_HOST}/bot{bot_token}/sendMessage'
    body = {
        "chat_id": user_id,
        "text": text,
        "disable_web_page_preview": True
    }
    headers = {
        "ontent-Type": "application/x-www-form-urlencoded"
    }
    try:
        r = requests.post(url, data=body, headers=headers)
        if r.ok:
            print("Telegram发送通知消息成功🎉。\n")
        elif r.status_code == '400':
            print("请主动给bot发送一条消息并检查接收用户ID是否正确。\n")
        elif r.status_code == '401':
            print("Telegram bot token 填写错误。\n")
    except Exception as error:
        print(f"telegram发送通知消息失败！！\n{error}")


# 开始执行主程序
if __name__ == '__main__':
    path_list = os.path.realpath(__file__).split('/')[1:]
    env = '/' + '/'.join(path_list[:-2])
    if os.path.isfile('/ql/config/cookie.sh') or os.path.isfile(f'{env}/config/cookie.sh'):  # 青龙
        isv4 = False
        if not os.path.isfile(f'{env}/config/cookie.sh'):  # 青龙容器内
            env = '/ql'
    else:  # v4-bot
        isv4 = True
        if not os.path.isfile(f'{env}/config/config.sh'):  # v4-bot 容器内
            env = '/jd'
    # bot = f'{env}/config/bot.json'
    # with open(bot, 'r', encoding='utf-8') as botSet:
    #     bot = json.load(botSet)
    # cron = '' # 此处 V4 用户需要自行设置 cron 表达式，否则程序自动设置为 jd_dreamFactory.js 的运行时间
    # if env == '/jd':
    #     if len(cron) < 9:
    #         cron = findCrontab()
    #     checkCrontab()
    msg = TUAN_ACTIVEID()
    # try:
    #     tgNofity(bot['user_id'], bot['bot_token'], msg)
    # except:
    #     None
