import axios from 'axios'
import { createHash } from 'crypto'
import iconv from 'iconv-lite'

const USER = 'sonnyeee@outlook.com' // 用户邮箱
const USER_KEY = '0a573c4eab424185baf408b953ca1e08' // 开发者密钥
const SN = '02S234163178448' // 设备 SN
const PRINT_URL = 'https://open.xpyun.net/api/openapi/xprinter/print'

// 生成签名
function generateSign(user, userKey, timestamp) {
  const str = user + userKey + timestamp
  return createHash('sha1').update(str).digest()
}

// 生成当前时间戳（10位）
function generateTimestamp() {
  return Math.floor(Date.now() / 1000).toString()
}

// 将内容转换为 GBK 编码
function encodeToGBK(content) {
  return iconv.encode(content, 'gbk')
}

export async function printOrder(order) {
  const printContent = generatePrintContent(order)
  const timestamp = generateTimestamp()
  const sign = generateSign(USER, USER_KEY, timestamp)

  console.log('签名：', sign)
  console.log('签名长度：', sign.length)

  // 将打印内容转换为 GBK 编码
  const gbkContent = encodeToGBK(printContent)

  const params = {
    user: USER,
    timestamp,
    sign,
    sn: SN,
    content: gbkContent.toString('base64')
  }

  try {
    const response = await axios.post(PRINT_URL, params, {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      }
    })
    console.log('服务器响应：', response)
    if (response.data.code !== 0) {
      throw new Error(`打印失败：${response.data.message}`)
    }
    return true
  } catch (error) {
    console.error('打印错误：', error.response || error)
    throw error
  }
}

function generatePrintContent(order) {
  const title = '<CB>厚道面小吃</CB><BR>'
  const items = order.items.map(item => {
    return `${item.name} x${item.quantity} ¥${item.price}<BR>`
  }).join('')
  const total = `<RIGHT>合计：¥${order.total}</RIGHT><BR>`
  const time = `<RIGHT>点餐时间：${new Date(order.createTime).toLocaleString()}</RIGHT><BR>`
  const pickupNumber = `<C>取餐号：${order.pickupNumber}</C><BR>`

  return title + items + total + time + pickupNumber
} 