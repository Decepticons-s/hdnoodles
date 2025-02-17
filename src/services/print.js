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
    }, 0);

    // 生成商品列表
    //打印商品信息的内容结构应该是：分量+（如果有备注，需要加入备注信息）+商品名+类型+及份数
    const itemsContent = order.items.map(item => {
      let itemContent = `${item.options.portion || '无'}`;
      if (item.options.remark) {
        itemContent += `${item.options.remark}`;
      }
      itemContent += `${item.name}`;
      if (item.category !== '抄手/馄饨') {
        itemContent += `${item.options.type || ''}`;
      }
      itemContent += `${item.quantity}份\n`;
      return itemContent;
    }).join('');

    const content = `
<CB><C>厚道面小票
<N><C>--在线支付--
<CB>取餐码    ${order.pickupNumber} 
<L><N>下单时间:${new Date(order.createTime).toLocaleString()}
订单编号:${order.orderNumber}
**************商品**************
<L><BOLD>${itemsContent}
<B>订单总价:￥${totalPrice}
<BR><BR>
`;

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const params = {
      user: USER,
      sn: SN,
      timestamp,
      sign: generateSignature(timestamp),
      content: content,
      times: 1,
      charset: 'UTF-8',
      userKey: USER_KEY,
      copies: 1
    };

    const response = await axios.post('/api/openapi/xprinter/print', params, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8'
      }
    });

    if (response.data.code !== 0) {
      console.error(`打印失败：${response.data.msg}`);
      return false; // 返回失败状态
    }
    return true; // 返回成功状态
  } catch (error) {
    console.error('打印请求失败:', error);
    // 记录错误信息，但不抛出异常
    return false; // 返回失败状态
  }
}