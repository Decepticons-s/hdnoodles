import axios from 'axios'
import iconv from 'iconv-lite'
import SHA1 from 'crypto-js/sha1'

const USER = 'sonnyeee@outlook.com' // 用户邮箱
const USER_KEY = '0a573c4eab424185baf408b953ca1e08' // 开发者密钥
const SN = '02S234163178448' // 设备 SN
const PRINT_URL = '/api/openapi/xprinter/print'

// 生成签名
function generateSign(user, userKey, timestamp) {
  const str = user + userKey + timestamp
  return SHA1(str).toString()
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
    console.log('请求参数：', params)
    const response = await fetch(PRINT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8'
      },
      body: JSON.stringify(params)
    })

    // 首先检查响应状态
    if (!response.ok) {
      // 如果响应不是 2xx，尝试读取错误信息
      const errorText = await response.text()
      throw new Error(`服务器错误：${response.status} - ${errorText}`)
    }

    // 尝试解析 JSON
    const data = await response.json()
    console.log('服务器响应：', data)
    if (data.code !== 0) {
      throw new Error(`打印失败：${data.message}`)
    }
    return true
  } catch (error) {
    console.error('打印错误：', error)
    throw new Error(`打印失败：${error.message}`)
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