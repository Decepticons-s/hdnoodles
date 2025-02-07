<template>
  <div class="checkout-page">
    <div class="checkout-content">
      <!-- 订单信息 -->
      <div class="order-summary">
        <h2>订单确认</h2>
        <div class="order-items">
          <div v-for="item in cartStore.items" :key="item.id" class="order-item">
            <div class="item-name">
              {{ item.name }}
              <div class="item-options">
                {{ item.options.type }} | {{ item.options.flavor }} | {{ item.options.portion }}
              </div>
            </div>
            <div class="item-quantity">x{{ item.quantity }}</div>
            <div class="item-price">¥{{ item.price * item.quantity }}</div>
          </div>
        </div>
        <div class="order-total">
          <span>总计</span>
          <span class="price">¥{{ cartStore.total }}</span>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="payment-methods">
        <h3>选择支付方式</h3>
        <el-radio-group v-model="paymentMethod">
          <el-radio label="unionpay">
            <el-icon><CreditCard /></el-icon>
            银联支付
          </el-radio>
        </el-radio-group>
      </div>

      <!-- 支付按钮 -->
      <div class="checkout-actions">
        <el-button @click="$router.push('/')">返回点餐</el-button>
        <el-button 
          type="primary" 
          :loading="processing"
          @click="handlePayment"
        >
          确认支付
        </el-button>
      </div>
    </div>

    <!-- 支付成功弹窗 -->
    <el-dialog
      v-model="showSuccessDialog"
      title="支付成功"
      width="360px"
      :show-close="false"
      :close-on-click-modal="false"
    >
      <div class="success-content">
        <el-icon class="success-icon" color="#67c23a"><CircleCheck /></el-icon>
        <h2>取餐号：{{ currentOrder?.pickupNumber }}</h2>
        <p>订单号：{{ currentOrder?.orderNumber }}</p>
        <div class="success-actions">
          <el-button @click="viewOrderDetails">查看订单详情</el-button>
          <el-button type="primary" @click="backToHome">返回首页</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useOrderStore } from '../stores/order'
import { CreditCard, CircleCheck } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const cartStore = useCartStore()
const orderStore = useOrderStore()

const paymentMethod = ref('unionpay')
const processing = ref(false)
const showSuccessDialog = ref(false)
const currentOrder = ref(null)

// 处理支付
const handlePayment = async () => {
  if (cartStore.items.length === 0) {
    ElMessage.warning('购物车为空')
    return
  }

  processing.value = true
  try {
    // 创建订单
    currentOrder.value = orderStore.createOrder(
      cartStore.items,
      cartStore.total
    )
    
    // 生成支付链接
    const amount = Math.round(cartStore.total * 100) // 转换为分
    const paymentUrl = `https://ap.scrcu.com/payweb/mobile/mer/pay.html?qrCode=https://qr.95516.com/00010000/01224895077923008075686116433377&amount=${amount}`
    
    // 打开支付页面
    window.open(paymentUrl, '_blank')
    
    // 清空购物车
    cartStore.clearCart()
    
    // 显示成功弹窗
    showSuccessDialog.value = true
  } catch (error) {
    ElMessage.error('支付失败，请重试')
  } finally {
    processing.value = false
  }
}

const viewOrderDetails = () => {
  router.push(`/order/${currentOrder.value.id}`)
}

const backToHome = () => {
  router.push('/')
}
</script>

<style lang="scss" scoped>
.checkout-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
  display: flex;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
}

.checkout-content {
  max-width: 800px;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  
  @media (max-width: 480px) {
    padding: 15px;
  }
}

.order-summary {
  margin-bottom: 30px;

  h2 {
    margin: 0 0 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }
}

.order-items {
  .order-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 15px 0;
    border-bottom: 1px solid #f5f5f5;

    .item-name {
      flex: 1;

      .item-options {
        font-size: 14px;
        color: #666;
        margin-top: 5px;
      }
    }

    .item-quantity {
      margin: 5px 0;
      color: #666;
    }

    .item-price {
      font-weight: bold;
      color: #f56c6c;
    }
  }
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  font-size: 18px;

  .price {
    font-size: 24px;
    color: #f56c6c;
    font-weight: bold;
  }
}

.payment-methods {
  margin-bottom: 30px;

  h3 {
    margin: 0 0 15px;
  }

  .el-radio {
    display: flex;
    align-items: center;
    padding: 15px;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    margin-bottom: 10px;
    transition: all 0.3s;

    &.is-checked {
      border-color: #409eff;
      background: #ecf5ff;
    }

    .el-icon {
      margin-right: 10px;
      font-size: 20px;
    }
  }
}

.checkout-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.success-content {
  text-align: center;
  padding: 20px 0;

  .success-icon {
    font-size: 48px;
    margin-bottom: 20px;
  }

  h2 {
    margin: 0 0 10px;
    color: #67c23a;
  }

  p {
    color: #666;
    margin: 0 0 20px;
  }

  .success-actions {
    display: flex;
    justify-content: center;
    gap: 15px;
  }
}
</style> 