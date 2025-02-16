import CryptoJS from 'crypto-js'
import iconv from 'iconv-lite'
import axios from 'axios'
import { Buffer } from 'buffer'
window.Buffer = Buffer

const USER = 'sonnyeee@outlook.com'
const USER_KEY = '0a573c4eab424185baf408b953ca1e08'
const SN = '02S234163178448'

// 生成签名
function generateSignature(timestamp) {
  const rawString = USER + USER_KEY + timestamp
  return CryptoJS.SHA1(rawString).toString(CryptoJS.enc.Hex)
}

// 修改编码函数
function encodeGBK(content) {
  return content // 直接返回原始字符串
}

// 打印订单
export async function printOrder(order) {
  try {
    // 计算商品总价
    const totalPrice = order.items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0).toFixed(2);

    // 生成商品列表
    const itemsContent = order.items.map(item => 
      `${item.name} ${item.quantity}份 ￥${(item.price * item.quantity)}\n`
    ).join('');

    const content = `
<CB><C>厚道面小票
<N><C>--在线支付--
<CB>取餐码    ${order.pickupNumber} 
<L><N>下单时间:${new Date(order.createTime).toLocaleString()}
订单编号:${order.orderNumber}
**************商品**************
<L><B>${itemsContent}
<B>订单总价:￥${totalPrice}
<BR><BR>
`
    

    const timestamp = Math.floor(Date.now() / 1000).toString()
    const params = {
      user: USER,
      sn: SN,
      timestamp,
      sign: generateSignature(timestamp),
      content: content, // 直接使用原始字符串
      times: 1,
      charset: 'UTF-8', // 根据实际内容编码设置
      userKey: USER_KEY
    }

    const response = await axios.post('/api/openapi/xprinter/print', params, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      }
    })

    if (response.data.code !== 0) {
      throw new Error(`打印失败：${response.data.msg}`)
    }
    return true
  } catch (error) {
    console.error('打印请求失败:', error)
    throw new Error('打印机连接异常，请联系工作人员')
  }
} 