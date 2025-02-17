import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])

  const total = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const itemCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  function addItem(product, options) {
    const existingItem = items.value.find(item => 
      item.productId === product.id &&
      item.options.type === options.type &&
      item.options.flavor === options.flavor &&
      item.options.portion === options.portion
    )

    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({
        id: Date.now(),
        productId: product.id,
        name: product.name,
        price: calculatePrice(product, options.portion),
        options,
        quantity: 1
      })
    }
  }

  function calculatePrice(product, portion) {
    const portionIndex = product.options.portions.indexOf(portion)
    
    // 特色面固定价格
    const specialNoodles = [
      '牛肉丸金汤酸辣',
      '酥肉金汤酸辣', 
      '火锅面'
    ]
    if (specialNoodles.includes(product.name)) {
      return product.basePrice
    }

    // 素面特殊价格规则
    if (product.name === '素面') {
      return product.basePrice + portionIndex * 1
    }
    
    // 其他商品价格规则
    return product.basePrice + (portionIndex * 2)
  }

  function removeItem(itemId) {
    const index = items.value.findIndex(item => item.id === itemId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  function updateQuantity(itemId, quantity) {
    const item = items.value.find(item => item.id === itemId)
    if (item) {
      item.quantity = Math.max(0, quantity)
      if (item.quantity === 0) {
        removeItem(itemId)
      }
    }
  }

  function clearCart() {
    items.value = []
  }

  return {
    items,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    calculatePrice
  }
})