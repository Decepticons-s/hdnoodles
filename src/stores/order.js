import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([])
  const currentOrderNumber = ref(1)
  const pickupNumbers = ref([])

  const todayOrders = computed(() => {
    const today = new Date().toDateString()
    return orders.value.filter(order => 
      new Date(order.createTime).toDateString() === today
    )
  })

  const todayOrderCount = computed(() => todayOrders.value.length)

  function createOrder(cartItems, total) {
    const orderNumber = `${new Date().getFullYear()}${String(currentOrderNumber.value).padStart(6, '0')}`
    const pickupNumber = currentOrderNumber.value // 取餐号从1开始

    const order = {
      id: Date.now(),
      orderNumber,
      pickupNumber,
      items: [...cartItems],
      total,
      status: 'pending', // pending, paid, completed, cancelled
      createTime: new Date().toISOString(),
      payTime: null
    }

    orders.value.push(order)
    pickupNumbers.value.push(pickupNumber)
    currentOrderNumber.value++

    return order
  }

  function updateOrderStatus(orderId, status) {
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = status
      if (status === 'paid') {
        order.payTime = new Date().toISOString()
      } else if (status === 'completed') {
        order.completeTime = new Date().toISOString()
      }
    }
  }

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
    getOrder
  }
}) 