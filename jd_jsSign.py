# encoding=utf-8
# @ModuleName : free_sign
# @Author : erpeng
# @Time ; 2021/10/20 13:43
import requests
import re
import os
import time, datetime
from urllib.parse import unquote

cookie_path = "/jd/config/config.sh"
token = ""

t = time.time()
time_stamp = int(round(time.time() * 1000))
date_stamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S%f')[0:-3]


class Util(object):
    
    def get_cookies(self):
        
        # 获取指定路径下的cookie_list
        # :return:
        
        cookie_exists = os.path.exists(cookie_path)
        if cookie_exists:
            with open(cookie_path, "r", encoding="utf-8") as f:
                data = f.read()
            r = re.compile(r"pt_key=.*?pt_pin=.*?;", re.M | re.S | re.I)
            cookie_list = re.findall(r, data)
            if len(cookie_list) >= 1:
                print("从配置文件中获取到{}个cookie".format(len((cookie_list))))
                return cookie_list
            else:
                print("get_cookies:获取cookie失败。")
                return False
        else:
            print("get_cookies:获取cookie文件失败。请确认cookie_path得路径是否正确")
            return False
    
    def is_chinese(self, string):
        """
        检查整个字符串是否包含中文
        :param string: 需要检查的字符串
        :return: bool
        """
        for ch in string:
            if u'\u4e00' <= ch <= u'\u9fff':
                return True
        return False

    def push_msg(self, title, content):
        """
        pushplus微信公众号推送消息
        :param title: 消息的标题
        :param content: 消息的内容
        :return:
        """

        urls = "http://pushplus.hxtrip.com/send?token={}&title={}&content={}&template=html".format(token, title,
                                                                                                   content)
        push_resp = requests.get(urls)
        if push_resp.status_code == 200:
            push_resp = push_resp.content.decode("utf-8")
            msg_pattern =  ("<msg>(.*)</msg>")
            resp_msg = re.findall(msg_pattern,push_resp)[0]
            success_msg = "请求成功"
            if resp_msg == success_msg:
                print("推送成功")
            else:
                print("推送失败。token异常:{}".format(resp_msg))
        else:
            resp_content = push_resp.content.decode("utf-8")
            print("推送失败，失败的内容是{}".format(resp_content))


util = Util()

class JdjsSign(object):
    def sign(self, cookie):
        """
        签到方法
        :param cookie:
        :return:
        """
        goods_info_urls = 'https://api.m.jd.com/?functionId=signFreeHome&body={"linkId":"PiuLvM8vamONsWzC0wqBGQ"}&t=%s&appid=activities_platform&client=H5&clientVersion=1.0.0&h5st=%s;8049586222727262;9cca1;tk02w5ad21aaa18nD3uuSjb83DHMpUj9T/FHd6+25WBk7Qu3raBMBNX7q52kvdtAH5+cIgr3r1VRPjLLEaxLDcRNflIa;3eb79f9d0efaff1013af1991173a47409f775eb8c9a7ecfab33ed9d66a71cc07;3.0;%s' % (
            time_stamp, date_stamp, time_stamp)
        goods_headers = {
            "Host": "api.m.jd.com",
            "Connection": "keep-alive",
            "Accept": "application/json, text/plain, */*",
            "Origin": "https://signfree.jd.com",
            "X-Requested-With": "com.jd.jdlite",
            "Cookie": cookie

        }
        print(cookie)
        goods_resp = requests.get(goods_info_urls, headers=goods_headers)
        sign_result = ""
        if goods_resp.status_code == 200:
            goods_resp = goods_resp.json()
            goods_err_msg = goods_resp["errMsg"]
            if goods_err_msg == "success":
                sign_data = goods_resp["data"]
                surplus_count = sign_data["surplusCount"]
                if surplus_count == 3:
                    sign_result = "当前用户未选择商品"
                    return sign_result
                else:
                    goods_list = sign_data["signFreeOrderInfoList"]
                    for goods in goods_list:
                        goods_id = goods["id"]
                        order_id = goods["orderId"]
                        goods_name = goods["productName"]
                        total_days = goods["needSignDays"]
                        signed_days = goods["hasSignDays"]
                        # 在这里调用签到接口
                        sign_url = "https://api.m.jd.com/"
                        sign_data = {
                            "functionId": "signFreeSignIn",
                            "body": '{"linkId":"PiuLvM8vamONsWzC0wqBGQ","orderId":%s}' % order_id,
                            "t": time_stamp,
                            "appid": "activities_platform",
                            "client": "H5",
                            "clientVersion": "1.0.0",
                        }
                        sign_info = "商品名{}。共需签到{}天，已经签到{}天".format(goods_name, total_days, signed_days)
                        print(sign_info)
                        sign_resp = requests.post(sign_url, params=sign_data, headers=goods_headers)
                        if sign_resp.status_code == 200:
                            sign_resp = sign_resp.json()
                            print("sign_resp:", sign_resp)
                            code = sign_resp["code"]
                            if code == 0:
                                msg = sign_resp["errMsg"]
                                if msg == "success":
                                    sign_result = "商品{},签到成功。还需签到{}天".format(goods_name, total_days - signed_days - 1)
                            if code == 400013:
                                sign_err_msg = sign_resp["errMsg"]
                                sign_result = sign_err_msg
                        else:
                            sign_result = "签到接口响应异常"
                            print(sign_resp.content.decode("utf-8"))
                        if len(goods_list) > 1:
                            sign_result += sign_result + "\n"
                    return sign_result
            else:
                sign_result = "获取个人免单列表接口Msg响应异常:{}".format(goods_err_msg)
                print(goods_resp)
                return sign_result
        else:
            sign_result = "获取个人免单列表接口响应异常"
            print(goods_resp.content.decode("utf-8"))
            return sign_result

    def run(self):
        """
        运行、遍历cookie_list调用签到方法进行签到。拼接签到结果一起通知
        :return:
        """
        cookie_list = util.get_cookies()
        #cookie_01 = os.environ.get('Cookie1')
        #cookie_list = [cookie_01]
        if cookie_list:
            total_count = len(cookie_list)
            index = 1
            push_content = '签到结果\n共计{}个账号'.format(total_count)
            if cookie_list:

                for cookie in cookie_list:
                    print(goods_resp.content.decode("utf-8"))
                    pt_pattern = ("pin=(.*);")
                    pt_pin = re.findall(pt_pattern, cookie)[0]
                    pt_pin = unquote(pt_pin)
                    print("开始做pin为{}的用户的任务".format(pt_pin))
                    sign_result = self.sign(cookie)
                    # 拼接li标签，消息详情内以li标签列表形式显示
                    result_content = "<li>❤账号{}：{}签到结果为：{}</li>".format(index, pt_pin, sign_result)
                    index += 1
                    push_content += result_content
            if token:
                util.push_msg("京东极速版签到返现通知", push_content)


if __name__ == '__main__':
    t = JdjsSign()
    t.run()
