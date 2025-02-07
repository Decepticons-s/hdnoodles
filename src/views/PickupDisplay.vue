<template>
  <div class="pickup-display">
    <div class="header">
      <div class="time">{{ currentTime }}</div>
      <div class="stats">
        今日订单：{{ orderStore.todayOrderCount }} 单
      </div>
    </div>

    <div class="content">
      <div class="current-numbers">
        <h2>当前取餐号</h2>
        <div class="number-grid">
          <div 
            v-for="number in recentPickupNumbers" 
            :key="number"
            class="number-item"
          >
            {{ number }}
          </div>
        </div>
      </div>

      <div class="recent-orders">
        <h2>最新订单</h2>
        <div class="order-list">
          <div 
            v-for="order in recentOrders" 
            :key="order.id"
            class="order-item"
          >
            <div class="order-number">
              订单号：{{ order.orderNumber }}
            </div>
            <div class="pickup-number">
              取餐号：<span class="highlight">{{ order.pickupNumber }}</span>
            </div>
            <div class="order-time">
              {{ formatTime(order.payTime) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useOrderStore } from '../stores/order'
import { useNow } from '@vueuse/core'

const orderStore = useOrderStore()
const now = useNow()

const currentTime = computed(() => {
  return new Date(now.value).toLocaleString()
})

// 获取最近的取餐号（最新的5个）
const recentPickupNumbers = computed(() => {
  return orderStore.pickupNumbers.slice(-5)
})

// 获取最近的订单（最新的8个已支付订单）
const recentOrders = computed(() => {
  return orderStore.orders
    .filter(order => order.status === 'paid')
    .sort((a, b) => new Date(b.payTime) - new Date(a.payTime))
    .slice(0, 8)
})

const formatTime = (timeString) => {
  return new Date(timeString).toLocaleTimeString()
}

// 自动刷新数据
let refreshInterval
onMounted(() => {
  refreshInterval = setInterval(() => {
    // 这里可以添加实时数据刷新逻辑
  }, 10000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style lang="scss" scoped>
.pickup-display {
  min-height: 100vh;
  background: #1a1a1a;
  color: #fff;
  padding: 40px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  font-size: 24px;

  .time {
    color: #409eff;
  }

  .stats {
    color: #67c23a;
  }
}

.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.current-numbers, .recent-orders {
  background: #2a2a2a;
  border-radius: 16px;
  padding: 30px;

  h2 {
    margin: 0 0 30px;
    color: #409eff;
    font-size: 28px;
    text-align: center;
  }
}

.number-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  .number-item {
    background: #409eff;
    color: #fff;
    font-size: 48px;
    font-weight: bold;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(64,158,255,0.3);
    animation: fadeIn 0.5s ease-out;
  }
}

.order-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  .order-item {
    background: #333;
    padding: 20px;
    border-radius: 12px;
    animation: slideIn 0.5s ease-out;

    .order-number {
      color: #999;
      margin-bottom: 10px;
    }

    .pickup-number {
      font-size: 20px;
      margin-bottom: 10px;

      .highlight {
        color: #409eff;
        font-weight: bold;
      }
    }

    .order-time {
      color: #666;
      font-size: 14px;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .content {
    grid-template-columns: 1fr;
  }

  .number-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .order-list {
    grid-template-columns: 1fr;
  }
}
</style> 