<template>
  <div class="order-system">
    <!-- 左侧分类导航 -->
    <div class="category-sidebar">
      <div class="logo">
        <h1>美味点餐</h1>
      </div>
      <div class="category-list">
        <div 
          v-for="category in categories" 
          :key="category.id"
          :class="['category-item', { active: currentCategory === category.id }]"
          @click="currentCategory = category.id"
        >
          {{ category.name }}
        </div>
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="main-content">
      <!-- 顶部信息栏 -->
      <div class="top-bar">
        <div class="actions">
          <el-button 
            @click="$router.push('/history')"
            type="primary"
            class="history-btn"
          >
            <el-icon><List /></el-icon>
            订单历史
          </el-button>
          <div class="order-info">
            今日已售：{{ todayOrders }} 单
          </div>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="products-grid">
        <div 
          v-for="product in filteredProducts" 
          :key="product.id" 
          class="product-card"
          @click="showProductDetail(product)"
        >
          <div class="product-image">
            <img :src="product.image" :alt="product.name">
          </div>
          <div class="product-info">
            <h3>{{ product.name }}</h3>
            <p class="price">{{ product.price }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 购物车悬浮按钮 -->
    <div class="cart-button" @click="showCartDrawer = true">
      <el-badge :value="cartItemCount" class="cart-badge">
        <el-icon><ShoppingCart /></el-icon>
      </el-badge>
      <span class="total-price">¥{{ cartTotal }}</span>
    </div>

    <!-- 添加商品详情弹窗 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="currentProduct?.name"
      width="400px"
      :style="{ maxHeight: '80vh', overflowY: 'auto' }"
      custom-class="product-dialog"
    >
      <template v-if="currentProduct">
        <div class="product-detail">
          <div class="product-image">
            <img :src="currentProduct.image" :alt="currentProduct.name">
          </div>
          <div class="product-description">
            {{ currentProduct.description }}
          </div>
          <div class="options-section">
            <div v-if="currentProduct?.options.types?.length" class="option-group">
              <h4>类型</h4>
              <el-radio-group v-model="selectedOptions.type">
                <el-radio-button 
                  v-for="type in currentProduct.options.types" 
                  :key="type" 
                  :value="type"
                >
                  {{ type }}
                </el-radio-button>
              </el-radio-group>
            </div>
            <div v-if="currentProduct?.options.portions?.length > 1" class="option-group">
              <h4>分量</h4>
              <el-radio-group v-model="selectedOptions.portion">
                <el-radio-button 
                  v-for="portion in currentProduct.options.portions" 
                  :key="portion" 
                  :value="portion"
                >
                  {{ portion }}
                </el-radio-button>
              </el-radio-group>
            </div>
            <div class="option-group">
              <h4>备注</h4>
              <el-input v-model="selectedOptions.remark" placeholder="干拌，汤面，清汤，红油"></el-input>
            </div>
          </div>
        </div>
      </template>
      
      <template #footer>
        <div class="dialog-footer">
          <div class="price">¥{{ currentPrice }}</div>
          <el-button type="primary" @click="addToCart">
            加入购物车
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加购物车抽屉 -->
    <el-drawer
      v-model="showCartDrawer"
      title="购物车"
      direction="rtl"
      size="400px"
    >
      <template v-if="cartStore.items.length">
        <div class="cart-items">
          <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <div class="item-options">
                <span>{{ item.options.type }}</span>
                <span>{{ item.options.portion }}</span>
                <span>{{ item.options.remark }}</span>
              </div>
              <div class="item-price">¥{{ item.price * item.quantity }}</div>
            </div>
            <div class="item-actions">
              <el-button-group>
                <el-button 
                  @click="updateItemQuantity(item, -1)"
                  :icon="Minus"
                  circle
                />
                <span class="quantity">{{ item.quantity }}</span>
                <el-button 
                  @click="updateItemQuantity(item, 1)"
                  :icon="Plus"
                  circle
                />
              </el-button-group>
              <el-button
                type="danger"
                :icon="Delete"
                circle
                @click="cartStore.removeItem(item.id)"
              />
            </div>
          </div>
        </div>
        <div class="cart-footer">
          <div class="total">
            总计：<span class="price">¥{{ cartTotal }}</span>
          </div>
          <el-button type="primary" size="large" @click="goToCheckout">
            去结算
          </el-button>
        </div>
      </template>
      <template v-else>
        <div class="empty-cart">
          <el-empty description="购物车是空的" />
        </div>
      </template>
    </el-drawer>

    <div id="receipt" style="display:none;">
      <!-- 小票内容 -->
      <h2>小票</h2>
      <p>感谢您的购买！</p>
      <!-- 其他小票内容 -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ShoppingCart, Minus, Plus, Delete, List } from '@element-plus/icons-vue'
import { useCartStore } from '../stores/cart'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useOrderStore } from '../stores/order'
import { printOrder } from '../services/print'

// 模拟数据
const categories = ref([
  { id: 1, name: '面/粉' },
  { id: 2, name: '抄手/馄饨' },
  { id: 3, name: '特色面' },
])

const currentCategory = ref(1)
const showCart = ref(false)

// 模拟商品数据
const products = ref([
  {
    id: 1,
    categoryId: 1,
    name: '牛肉',
    basePrice: 9,
    image: '/images/niuroumian.jpg',
    description: '精选牛肉，汤鲜味美',
    options: {
      types: ['面', '米粉'],
      portions: ['一两', '二两', '三两']
    }
  },
  {
    id: 2,
    categoryId: 1,
    name: '炸酱',
    basePrice: 9,
    image: '/images/niuroumian.jpg',
    description: '传统炸酱配方，酱香浓郁',
    options: {
      types: ['面', '米粉'],
      portions: ['一两', '二两', '三两']
    }
  },
  {
    id: 3,
    categoryId: 1,
    name: '素',
    basePrice: 7,
    image: '/images/niuroumian.jpg',
    description: '清淡爽口，素食者首选',
    options: {
      types: ['面', '米粉'],
      portions: ['一两', '二两', '三两']
    }
  },
  {
    id: 4,
    categoryId: 2,
    name: '红油抄手',
    basePrice: 9,
    image: '/images/chaoshou.jpg',
    description: '现包现煮，配以秘制红油',
    options: {
      types: [],
      portions: ['一两', '二两', '三两']
    }
  },
  {
    id: 5,
    categoryId: 2,
    name: '鲜肉饺子',
    basePrice: 9,
    image: '/images/jiaozi.jpg',
    description: '手工现包，皮薄馅大',
    options: {
      types: [],
      portions: ['一两', '二两', '三两']
    }
  },
  {
    id: 6,
    categoryId: 2,
    name: '馄饨',
    basePrice: 9,
    image: '/images/huntun.jpg',
    description: '整颗虾仁，鲜美多汁',
    options: {
      types: [],
      portions: ['一两', '二两', '三两']
    }
  },
  {
    id: 7,
    categoryId: 3,
    name: '牛肉丸金汤酸辣',
    basePrice: 13,
    image: '/images/niuroumian.jpg',
    description: '手工牛肉丸搭配酸辣金汤',
    options: {
      types: ['面', '米粉'],
      portions: ['标准份']
    }
  },
  {
    id: 8,
    categoryId: 3,
    name: '酥肉金汤酸辣',
    basePrice: 13,
    image: '/images/surou.jpg',
    description: '现炸酥肉搭配秘制酸汤',
    options: {
      types: ['面', '米粉'],
      portions: ['标准份']
    }
  },
  {
    id: 9,
    categoryId: 3,
    name: '火锅',
    basePrice: 13,
    image: '/images/huoguomian.jpg',
    description: '川味火锅风味汤底',
    options: {
      types: ['面', '米粉'],
      portions: ['标准份']
    }
  }
])

const filteredProducts = computed(() => {
  return products.value.filter(p => p.categoryId === currentCategory.value)
})

// 添加商品详情弹窗相关状态
const showDetailDialog = ref(false)
const currentProduct = ref(null)
const selectedOptions = ref({})

// 显示商品详情
const showProductDetail = (product) => {
  if (window.innerWidth <= 768) {
    document.body.style.overflow = 'hidden'
  }
  currentProduct.value = product
  selectedOptions.value = {
    type: product.options.types[0] || '',
    portion: product.options.portions[0] || '',
    remark: ''
  }
  showDetailDialog.value = true
}

const cartStore = useCartStore()

// 更新购物车相关的计算属性
const cartItemCount = computed(() => cartStore.itemCount)
const cartTotal = computed(() => cartStore.total)

// 更新添加到购物车的方法
const addToCart = () => {
  if (!currentProduct.value) return; // 确保当前商品存在
  cartStore.addItem(currentProduct.value, selectedOptions.value); // 添加商品到购物车
  showDetailDialog.value = false; // 关闭详情对话框
  ElMessage.success('已添加到购物车'); // 显示成功消息
}

// 添加购物车抽屉组件状态
const showCartDrawer = ref(false)

// 更新商品数量的方法
const updateItemQuantity = (item, delta) => {
  cartStore.updateQuantity(item.id, item.quantity + delta)
}

// 添加去结算方法
const router = useRouter()
const goToCheckout = () => {
  if (cartStore.items.length === 0) {
    ElMessage.warning('购物车为空')
    return
  }
  router.push('/checkout')
}

const orderStore = useOrderStore()

// 更新今日订单数量
const todayOrders = computed(() => orderStore.todayOrderCount)

// 计算当前价格
const currentPrice = computed(() => {
  if (!currentProduct.value) return 0
  return cartStore.calculatePrice(currentProduct.value, selectedOptions.value.portion)
})

// 在弹窗关闭时恢复滚动
watch(showDetailDialog, (val) => {
  if (!val && window.innerWidth <= 768) {
    document.body.style.overflow = 'auto'
  }
})

const showPaymentDialog = ref(false)

// 确认支付的方法
const confirmPayment = () => {
  showPaymentDialog.value = true
}

// 完成支付的方法
const completePayment = () => {
  // 假设这里是支付逻辑
  const paymentSuccess = true

  if (paymentSuccess) {
    showPaymentDialog.value = false
  } else {
    ElMessage.error('支付失败，请重试')
  }
}

// 监控支付页面关闭状态
watch(showPaymentDialog, (newValue) => {
  if (!newValue) {
    printOrder({ /* 传入订单信息 */ })
      .then(() => {
        ElMessage.success('小票打印成功')
      })
      .catch((error) => {
        ElMessage.error(error.message)
      })
  }
})
</script>

<style lang="scss" scoped>
.order-system {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
  }
}

.category-sidebar {
  width: 240px;
  background: #fff;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  padding: 20px 0;
  position: relative;
  z-index: 100;

  .logo {
    padding: 0 20px;
    margin-bottom: 30px;
    
    h1 {
      font-size: 24px;
      color: #333;
      margin: 0;
    }
  }

  .category-item {
    padding: 8px 20px;
    font-size: 16px;
    color: #666;
    cursor: pointer;
    
    &.active {
      color: #409eff;
      font-weight: 500;
      background: none;
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    height: 60px;
    padding: 0;
    overflow-x: auto;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);

    .logo {
      display: none;
    }

    .category-list {
      display: flex;
      padding: 0 10px;
    }

    .category-item {
      flex: 0 0 auto;
      padding: 8px 15px;
      white-space: nowrap;
      color: #666;
      
      &.active {
        color: #409eff;
        font-weight: 500;
        background: none;
      }
    }
  }
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  height: calc(100vh - 60px);

  @media (min-width: 768px) {
    height: auto;
  }

  .top-bar {
    display: flex;
    flex-direction: column;
    gap: 15px;
    
    @media (min-width: 768px) {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 15px;
    padding-top: 20px;

    @media (min-width: 576px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 768px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (min-width: 992px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (max-width: 768px) {
    padding: 10px;
  }
}

.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  position: relative;

  &:hover {
    transform: translateY(-5px);
  }

  .product-image {
    height: 150px;
    overflow: hidden;
    background: #f8f8f8;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }
  }

  .product-info {
    padding: 15px;

    h3 {
      margin: 0;
      font-size: 16px;
      color: #333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .price {
      color: #f56c6c;
      font-size: 18px;
      font-weight: bold;
      margin: 8px 0 0;
    }
  }

  @media (max-width: 480px) {
    .product-info h3 {
      font-size: 14px;
    }
    
    .price {
      font-size: 16px;
    }
  }
}

.cart-button {
  position: fixed;
  right: 30px;
  bottom: 30px;
  background: #409eff;
  color: #fff;
  padding: 15px 25px;
  border-radius: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 4px 12px rgba(64,158,255,0.4);
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.05);
  }

  .cart-badge {
    font-size: 24px;
  }

  .total-price {
    font-size: 18px;
    font-weight: bold;
  }
}

.product-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.product-detail {
  .product-image {
    width: 100%;
    height: 250px;
    overflow: hidden;
    border-radius: 8px;
    margin-bottom: 20px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .product-description {
    color: #666;
    margin-bottom: 20px;
    line-height: 1.5;
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .price {
    font-size: 24px;
    color: #f56c6c;
    font-weight: bold;
  }
}

.cart-items {
  padding: 20px;

  .cart-item {
    background: #fff;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);

    .item-info {
      margin-bottom: 10px;

      h3 {
        margin: 0 0 5px;
        font-size: 16px;
      }

      .item-options {
        color: #666;
        font-size: 14px;
        
        span {
          margin-right: 10px;
          
          &:not(:last-child):after {
            content: '|';
            margin-left: 10px;
            color: #ddd;
          }
        }
      }

      .item-price {
        color: #f56c6c;
        font-weight: bold;
        margin-top: 5px;
      }
    }

    .item-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .quantity {
        display: inline-block;
        width: 40px;
        text-align: center;
      }
    }
  }
}

.cart-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);

  .total {
    margin-bottom: 15px;
    font-size: 18px;

    .price {
      color: #f56c6c;
      font-weight: bold;
    }
  }

  .el-button {
    width: 100%;
  }
}

.empty-cart {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

:deep(.el-drawer) {
  width: 100% !important;
  
  @media (min-width: 768px) {
    width: 400px !important;
  }
}

/* 添加移动端专属样式 */
@media (max-width: 768px) {
  .order-system {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }

  .main-content {
    padding: 10px;
    overflow-x: hidden;
    height: calc(100vh - 120px);
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .product-card {
    .product-image {
      height: 120px;
    }

    .product-info h3 {
      font-size: 14px;
    }
  }

  /* 优化弹窗显示 */
  :deep(.el-dialog) {
    width: 90% !important;
    max-width: 100%;
    
    .el-dialog__header {
      padding: 15px;
    }
    
    .el-dialog__body {
      padding: 15px;
    }
  }

  /* 优化选项按钮 */
  .el-radio-button {
    margin: 4px;
    
    :deep(.el-radio-button__inner) {
      padding: 8px 12px;
      font-size: 12px;
    }
  }

  /* 购物车按钮优化 */
  .cart-button {
    right: 15px;
    bottom: 15px;
    padding: 10px 15px;
    font-size: 14px;
    
    .el-icon {
      font-size: 20px;
    }
  }
}

/* 修复iOS弹性滚动问题 */
html, body {
  -webkit-overflow-scrolling: touch;
}

/* 防止移动端点击闪烁 */
* {
  -webkit-tap-highlight-color: transparent;
}

/* 优化输入元素缩放 */
@media screen and (max-width: 768px) {
  input, select, textarea {
    font-size: 16px !important;
  }
}
</style>
