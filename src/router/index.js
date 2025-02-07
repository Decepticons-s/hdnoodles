import { createRouter, createWebHistory } from 'vue-router'
import OrderSystem from '@/views/OrderSystem.vue'
import Checkout from '../views/Checkout.vue'
import OrderDetail from '../views/OrderDetail.vue'
import PickupDisplay from '../views/PickupDisplay.vue'
import OrderHistory from '../views/OrderHistory.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'order',
      component: OrderSystem
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: Checkout
    },
    {
      path: '/order/:id',
      name: 'orderDetail',
      component: OrderDetail
    },
    {
      path: '/display',
      name: 'pickupDisplay',
      component: PickupDisplay
    },
    {
      path: '/history',
      name: 'orderHistory',
      component: OrderHistory
    }
  ]
})

export default router 