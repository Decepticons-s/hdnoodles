import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOrderStore = defineStore('order', () => {
  const orders = ref(JSON.parse(localStorage.getItem('orders')) || [])
  const pickupNumbers = ref([])
  const currentOrderNumber = ref(1)

  // 今日订单计算
  const todayOrders = computed(() => {
    const today = new Date().toDateString()
    return orders.value.filter(order => 
      new Date(order.createTime).toDateString() === today
    )
  })

  const todayOrderCount = computed(() => todayOrders.value.length)

  // 初始化函数
  const initializeStore = () => {
    const lastDate = localStorage.getItem('lastDate');
    const today = new Date().toISOString().slice(0, 10);
    
    if (lastDate !== today) {
      localStorage.setItem('lastDate', today);
      localStorage.setItem('pickupNumber', 1); // 重置取餐号
      localStorage.setItem('orderNumber', 0); // 重置订单号
    } else {
      const currentPickupNumber = parseInt(localStorage.getItem('pickupNumber')) || 1;
      pickupNumbers.value.push(currentPickupNumber); // 恢复取餐号
    }
  }

  // 在 store 创建时调用初始化函数
  initializeStore();

  // 创建新订单
  async function createOrder(cartItems, total) {
    try {
      const lastOrderNumber = parseInt(localStorage.getItem('orderNumber')) || 0
      const newOrderNumber = lastOrderNumber + 1
      const orderNumber = `${new Date().getFullYear()}${String(newOrderNumber).padStart(6, '0')}`

      const order = {
        id: Date.now(),
        orderNumber,
        pickupNumber: newOrderNumber,
        items: [...cartItems],
        total,
        status: 'pending',
        createTime: new Date().toISOString(),
        payTime: null
      }

      // 保存订单号到 localStorage
      localStorage.setItem('orderNumber', newOrderNumber)
      localStorage.setItem('pickupNumber', newOrderNumber)

      orders.value.push(order)
      localStorage.setItem('orders', JSON.stringify(orders.value)) // 保存订单到 localStorage
      pickupNumbers.value.push(newOrderNumber)
      return order
    } catch (err) {
      console.error('订单创建失败:', err)
      throw err
    }
  }

  // 检查并重置计数器
  const resetCounterIfNewDay = () => {
    const lastDate = localStorage.getItem('lastDate');
    const today = new Date().toISOString().slice(0, 10);
    
    if (lastDate !== today) {
      localStorage.setItem('lastDate', today);
      localStorage.setItem('pickupNumber', 1); // 重置取餐号
      localStorage.setItem('orderNumber', 0); // 重置订单号
    } else {
      const currentPickupNumber = parseInt(localStorage.getItem('pickupNumber')) || 1;
      localStorage.setItem('pickupNumber', currentPickupNumber + 1); // 累加取餐号
    }
  }

  // 更新订单状态
  function updateOrderStatus(orderId, status) {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = status
      if (status === 'paid') {
        order.payTime = new Date().toISOString()
      } else if (status === 'completed') {
        order.completeTime = new Date().toISOString()
      }
      localStorage.setItem('orders', JSON.stringify(orders.value)) // 更新订单状态后保存到 localStorage
    }
  }

  // 获取订单详情
  function getOrder(orderId) {
    return orders.value.find(o => o.id === orderId)
  }

  return {
    orders,
    todayOrders,
    todayOrderCount,
    pickupNumbers,
    createOrder,
    updateOrderStatus,
    getOrder,
    currentOrderNumber
  }
})
