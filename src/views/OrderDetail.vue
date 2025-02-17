<template>
  <div class="order-detail-page">
    <div class="order-detail-content">
      <div class="header">
        <el-button @click="$router.push('/')" class="back-button">
          <el-icon><ArrowLeft /></el-icon>
          返回首页
        </el-button>
        <div class="order-status" :class="order?.status">
          {{ getStatusText(order?.status) }}
        </div>
      </div>

      <div class="order-info">
        <div class="info-item">
          <span class="label">订单号：</span>
          <span class="value">{{ order?.orderNumber }}</span>
        </div>
        <div class="info-item">
          <span class="label">取餐号：</span>
          <span class="value highlight">{{ order?.pickupNumber }}</span>
        </div>
        <div class="info-item">
          <span class="label">下单时间：</span>
          <span class="value">{{ formatTime(order?.createTime) }}</span>
        </div>
        <div class="info-item">
          <span class="label">支付时间：</span>
          <span class="value">{{ formatTime(order?.payTime) }}</span>
        </div>
      </div>

      <div class="order-items">
        <h3>订单明细</h3>
        <div v-for="item in order?.items" :key="item.id" class="item">
          <div class="item-info">
            <h4>{{ item.name }}</h4>
            <div class="options">
              {{ item.options.type }} | {{ item.options.flavor }} | {{ item.options.portion }}
            </div>
          </div>
          <div class="item-price">
            <span class="quantity">x{{ item.quantity }}</span>
            <span class="price">¥{{ item.price * item.quantity }}</span>
          </div>
        </div>
      </div>

      <div class="order-total">
        <span>总计</span>
        <span class="total-price">¥{{ order?.total }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrderStore } from '../stores/order'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const orderStore = useOrderStore()
const order = ref(null)

const getStatusText = (status) => {
  const statusMap = {
    pending: '待支付',
    paid: '已支付',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status] || status
}

const formatTime = (timeString) => {
  if (!timeString) return '- -'
  return new Date(timeString).toLocaleString()
}

onMounted(() => {
  const orderId = Number(route.params.id)
  order.value = orderStore.getOrder(orderId)
})
</script>

<style lang="scss" scoped>
.order-detail-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.order-detail-content {
  width: 100%;
  height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  background: #fff;
  border-radius: 0;
  padding: 12px 16px;
  box-shadow: none;
  
  @media (min-width: 768px) {
    max-width: 800px;
    height: auto;
    border-radius: 12px;
    padding: 30px;
    margin: 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  .back-button {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .order-status {
    padding: 6px 12px;
    border-radius: 4px;
    font-weight: bold;

    &.pending { background: #fdf6ec; color: #e6a23c; }
    &.paid { background: #ecf5ff; color: #409eff; }
    &.completed { background: #f0f9eb; color: #67c23a; }
    &.cancelled { background: #fef0f0; color: #f56c6c; }
  }
}

.order-info {
  background: #fafafa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;

  .info-item {
    display: flex;
    margin-bottom: 10px;
    
    &:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #666;
      width: 100px;
    }

    .value {
      color: #333;
      
      &.highlight {
        color: #409eff;
        font-size: 18px;
        font-weight: bold;
      }
    }
  }
}

.order-items {
  margin-bottom: 16px;

  h3 {
    margin: 0 0 12px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }

  .item {
    display: flex;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 1px solid #f5f5f5;

    .item-info {
      flex: 1;

      h4 {
        margin: 0 0 5px;
      }

      .options {
        font-size: 14px;
        color: #666;
      }
    }

    .item-price {
      text-align: right;

      .quantity {
        color: #666;
        margin-right: 10px;
      }

      .price {
        color: #f56c6c;
        font-weight: bold;
      }
    }
  }
}

.order-total {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  padding: 8px 0;

  .total-price {
    color: #f56c6c;
    font-size: 20px;
    font-weight: bold;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 16px;

    .back-button {
      padding: 8px 12px;
    }

    .order-status {
      font-size: 14px;
    }
  }

  .info-item {
    flex-direction: column;
    gap: 4px;
    margin-bottom: 8px;

    .label {
      width: auto;
      font-size: 14px;
    }

    .value {
      font-size: 15px;
      
      &.highlight {
        font-size: 16px;
      }
    }
  }

  .item {
    flex-direction: column;
    gap: 6px;
    padding: 12px 0;

    .item-price {
      text-align: left;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
