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
          <el-icon><component :is="category.icon" /></el-icon>
          <span>{{ category.name }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧内容区 -->
    <div class="main-content">
      <!-- 顶部信息栏 -->
      <div class="top-bar">
        <div class="time-info">
          <el-icon><Clock /></el-icon>
          <span>{{ currentTime }}</span>
        </div>
        <div class="actions">
          <el-button 
            type="primary" 
            @click="$router.push('/display')"
          >
            <el-icon><Monitor /></el-icon>
            取餐号大屏
          </el-button>
          <el-button 
            @click="$router.push('/history')"
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
      width="500px"
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
                  :label="type"
                />
              </el-radio-group>
            </div>

            <div v-if="currentProduct?.options.flavors?.length" class="option-group">
              <h4>口味</h4>
              <el-radio-group v-model="selectedOptions.flavor">
                <el-radio-button 
                  v-for="flavor in currentProduct.options.flavors" 
                  :key="flavor" 
                  :label="flavor"
                />
              </el-radio-group>
            </div>

            <div v-if="currentProduct?.options.practices?.length" class="option-group">
              <h4>做法</h4>
              <el-radio-group v-model="selectedOptions.practice">
                <el-radio-button 
                  v-for="practice in currentProduct.options.practices" 
                  :key="practice" 
                  :label="practice"
                />
              </el-radio-group>
            </div>

            <div v-if="currentProduct?.options.portions?.length > 1" class="option-group">
              <h4>分量</h4>
              <el-radio-group v-model="selectedOptions.portion">
                <el-radio-button 
                  v-for="portion in currentProduct.options.portions" 
                  :key="portion" 
                  :label="portion"
                />
              </el-radio-group>
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
                <span>{{ item.options.flavor }}</span>
                <span>{{ item.options.portion }}</span>
                <span>{{ item.options.practice }}</span>
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Clock, ShoppingCart, Minus, Plus, Delete, Monitor, List } from '@element-plus/icons-vue'
import { useNow } from '@vueuse/core'
import { useCartStore } from '../stores/cart'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useOrderStore } from '../stores/order'

// 模拟数据
const categories = ref([
  { id: 1, name: '面/粉', icon: 'Bowl' },
  { id: 2, name: '抄手/馄饨/饺子', icon: 'Food' },
  { id: 3, name: '特色面/粉', icon: 'HotWater' },
])

const currentCategory = ref(1)
const showCart = ref(false)

// 获取当前时间
const now = useNow()
const currentTime = computed(() => {
  return new Date(now.value).toLocaleTimeString()
})

// 模拟商品数据
const products = ref([
  {
    id: 1,
    categoryId: 1,
    name: '牛肉面',
    basePrice: 9,
    image: '/images/beef-noodle.jpg',
    description: '精选牛肉，汤鲜味美',
    options: {
      types: ['面', '米粉'],
      flavors: ['红油', '清汤'],
      practices: ['汤面', '干拌'],
      portions: ['一两', '二两', '三两']
    }
  },
  {
    id: 2,
    categoryId: 1,
    name: '炸酱面',
    basePrice: 9,
    image: '/images/zhajiangmian.jpg',
    description: '传统炸酱配方，酱香浓郁',
    options: {
      types: ['面', '米粉'],
      flavors: ['红油', '清汤'],
      practices: ['汤面', '干拌'],
      portions: ['一两', '二两', '三两']
    }
  },
  {
    id: 3,
    categoryId: 1,
    name: '素面',
    basePrice: 7,
    image: '/images/sumian.jpg',
    description: '清淡爽口，素食者首选',
    options: {
      types: ['面', '米粉'],
      flavors: ['原味', '红油', '麻辣'],
      practices: ['汤面', '干拌'],
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
      flavors: ['藤椒', '红油', '清汤'],
      practices: ['汤面', '干拌'],
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
      flavors: ['红油', '清汤'],
      practices: ['汤面', '干拌'],
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
      flavors: ['红油', '海鲜'],
      practices: ['汤面', '干拌'],
      portions: ['一两', '二两', '三两']
    }
  },
  {
    id: 7,
    categoryId: 3,
    name: '牛肉丸金汤酸辣',
    basePrice: 13,
    image: '/images/niurouwan.jpg',
    description: '手工牛肉丸搭配酸辣金汤',
    options: {
      types: ['面', '米粉'],
      flavors: [],
      practices: [],
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
      flavors: [],
      practices: [],
      portions: ['标准份']
    }
  },
  {
    id: 9,
    categoryId: 3,
    name: '火锅面',
    basePrice: 13,
    image: '/images/huoguomian.jpg',
    description: '川味火锅风味汤底',
    options: {
      types: ['面', '米粉'],
      flavors: ['清汤', '红汤'],
      practices: [],
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
const selectedOptions = ref({
  type: '',
  flavor: '',
  portion: '',
  practice: ''
})

// 显示商品详情
const showProductDetail = (product) => {
  if (window.innerWidth <= 768) {
    document.body.style.overflow = 'hidden'
  }
  currentProduct.value = product
  selectedOptions.value = {
    ...(product.options.types?.length && { type: product.options.types[0] }),
    flavor: product.options.flavors[0],
    portion: product.options.portions[0],
    practice: product.options.practices?.[0] || '汤面'
  }
  showDetailDialog.value = true
}

const cartStore = useCartStore()

// 更新购物车相关的计算属性
const cartItemCount = computed(() => cartStore.itemCount)
const cartTotal = computed(() => cartStore.total)

// 更新添加到购物车的方法
const addToCart = () => {
  cartStore.addItem(currentProduct.value, selectedOptions.value)
  showDetailDialog.value = false
  ElMessage.success('已添加到购物车')
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

// 修改当前价格计算方式
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
</script>

<style lang="scss" scoped>
.order-system {
  display: flex;
  height: 100vh;
  background: #f5f5f5;
}

.category-sidebar {
  width: 240px;
  background: #fff;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  padding: 20px 0;

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
    padding: 15px 20px;
    display: flex;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s;

    &:hover, &.active {
      background: #f0f7ff;
      color: #409eff;
    }

    .el-icon {
      margin-right: 10px;
      font-size: 20px;
    }
  }

  @media (max-width: 1200px) {
    width: 180px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    position: static;
  }
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;

  .top-bar {
    display: flex;
    flex-direction: column;
    gap: 15px;
    
    @media (min-width: 768px) {
      flex-direction: row;
    }
    
    .time-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;

    @media (max-width: 480px) {
      grid-template-columns: 1fr 1fr;
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

  &:hover {
    transform: translateY(-5px);
  }

  .product-image {
    height: 150px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .product-info {
    padding: 15px;

    h3 {
      margin: 0;
      font-size: 16px;
      color: #333;
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

  .options-section {
    .option-group {
      margin-bottom: 20px;

      h4 {
        margin: 0 0 10px;
        color: #333;
      }

      .el-radio-group {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
    }
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

  .category-sidebar {
    width: 100%;
    position: sticky;
    top: 0;
    z-index: 1000;
    padding: 10px 0;

    .category-list {
      display: flex;
      overflow-x: auto;
      padding: 0 10px;

      .category-item {
        flex: 0 0 auto;
        padding: 10px 15px;
        white-space: nowrap;
      }
    }
  }

  .main-content {
    padding: 10px;
    overflow-x: hidden;
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