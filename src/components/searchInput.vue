<!-- src/components/Layout.vue -->
<template>
  <div class="searchInput" :class="{ 'is-focused': isFocused, 'has-value': searchValue }">
    <input 
      type="text" 
      v-model="searchValue" 
      placeholder="请输入筛选信息" 
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keyup.enter="handleConfirm"
    />
    <button class="confirm-btn" @click="handleConfirm">确认</button>
  </div>
</template>

<script>
export default {
  name: 'SearchInput',
  data() {
    return {
      searchValue: '',
      isFocused: false
    }
  },
  methods: {
    handleConfirm() {
      this.$emit('confirm', this.searchValue);
    }
  }
};
</script>

<style lang="scss" scoped>
.searchInput {
  display: flex;
  align-items: center;
  width: 100%;
  height: 2.5rem;
  background: rgba(68, 83, 111, 0.4);
  border: 1px solid rgba(207, 231, 255, 0.3);
  border-radius: 4px;
  padding: 0 4px 0 12px;
  transition: all 0.3s;
  box-sizing: border-box;

  &.is-focused {
    border-color: #5592ED;
    background: rgba(12, 21, 43, 0.5);
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    color: #e2e8f0;
    font-size: var(--font-size-12);
    outline: none;
    
    &::placeholder {
      color: #718096;
    }
  }

  .confirm-btn {
    height: 1.5rem;
    padding: 0 0.5rem;
    background: rgba(172, 192, 212, 0.1);
    border: 1px solid rgba(172, 192, 212, 0.4);
    color: #D4E9FF;
    border-radius: 4px;
    cursor: pointer;
    font-size: var(--font-size-14);
    transition: all 0.3s;
    
    &:hover {
      background: linear-gradient(0deg, rgba(5, 94, 241, 0.3041), rgba(5, 94, 241, 0.3041)), rgba(172, 192, 212, 0.1);
      border: 1px solid rgba(172, 192, 212, 0.4);
      color: #FFFFFF;
    }
  }

  &.has-value .confirm-btn {
    background: #3b82f6;
    border-color: #3b82f6;
    color: #fff;
    
    &:hover {
      background: #2563eb;
    }
  }
}
</style>