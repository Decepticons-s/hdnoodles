<template>
  <div class="order-history">
    <div class="page-header">
      <el-button @click="$router.push('/')" class="back-button">
        <el-icon><ArrowLeft /></el-icon>
        返回首页
      </el-button>
      <h2>订单历史</h2>
    </div>

    <div class="order-list">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="全部订单" name="all">
          <div class="orders-grid">
            <div v-for="order in filteredOrders" :key="order.id" class="order-card">
              <div class="order-header">
                <span class="order-time">{{ formatTime(order.createTime) }}</span>
                <el-tag :type="getStatusType(order.status)">
                  {{ getStatusText(order.status) }}
                </el-tag>
              </div>
              
              <div class="order-items">
                <div v-for="item in order.items" :key="item.id" class="item">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-quantity">x{{ item.quantity }}</span>
                </div>
              </div>

              <div class="order-footer">
                <div class="order-info">
                  <div class="pickup-number">取餐号：{{ order.pickupNumber }}</div>
                  <div class="total-price">总计：¥{{ order.total }}</div>
                </div>
                <el-button 
                  type="primary" 
                  link 
                  @click="$router.push(`/order/${order.id}`)"
                >
                  查看详情
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="待取餐" name="pending">
          <div class="orders-grid">
            <!-- 使用相同的订单卡片组件 -->
          </div>
        </el-tab-pane>

        <el-tab-pane label="已完成" name="completed">
          <div class="orders-grid">
            <!-- 使用相同的订单卡片组件 -->
          </div>
        </el-tab-pane>
      </el-tabs>

      <div v-if="filteredOrders.length === 0" class="empty-state">
        <el-empty description="暂无订单记录" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useOrderStore } from '../stores/order'
import { ArrowLeft } from '@element-plus/icons-vue'

const orderStore = useOrderStore()
const activeTab = ref('all')

const filteredOrders = computed(() => {
  const orders = orderStore.orders
  if (activeTab.value === 'all') {
    return orders
  }
  return orders.filter(order => {
    if (activeTab.value === 'pending') {
      return order.status === 'paid'
    }
    return order.status === activeTab.value
  })
})

const getStatusType = (status) => {
  const typeMap = {
    pending: 'warning',
    paid: 'primary',
    completed: 'success',
    cancelled: 'info'
  }
  return typeMap[status]
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待支付',
    paid: '待取餐',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusMap[status]
}

const formatTime = (timeString) => {
  return new Date(timeString).toLocaleString()
}
</script>

<style lang="scss" scoped>
.order-history {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 40px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;

  h2 {
    margin: 0;
    font-size: 24px;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 5px;
  }
}

.order-list {
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.order-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    .order-time {
      color: #666;
      font-size: 14px;
    }
  }

  .order-items {
    margin-bottom: 15px;
    padding: 10px 0;
    border-top: 1px solid #f5f5f5;
    border-bottom: 1px solid #f5f5f5;

    .item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .item-name {
        color: #333;
      }

      .item-quantity {
        color: #666;
      }
    }
  }

  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;

    .order-info {
      .pickup-number {
        color: #409eff;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .total-price {
        color: #f56c6c;
        font-weight: bold;
      }
    }
  }
}

.empty-state {
  padding: 40px 0;
}

// 响应式设计
@media (max-width: 768px) {
  .order-history {
    padding: 20px;
  }

  .orders-grid {
    grid-template-columns: 1fr;
  }
}
</style> 