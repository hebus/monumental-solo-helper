<template>
  <div class="goldEarned" :title="t('gold.earned')">
    <input type="number" min="0" max="20" v-model="value"/>
    <img src="@/assets/coin.png" alt=""/>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'GoldEarned',
  props: { 
    modelValue: Number
  },
  emits: [
    'update:modelValue'
  ],
  setup(props, { emit }) {
    const { t } = useI18n()

    const value = computed({ 
      get: () => props.modelValue, 
      set: (v) => emit('update:modelValue', v) 
    }) 

    return { t, value }
  },
})
</script>

<style lang="scss" scoped>
.goldEarned {
  margin-top: -0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  display: inline;
  float: right;
  input {
    width: 3.5rem;
  }
  img {
    height: 1.75rem;
    filter: drop-shadow(0.15rem 0.15rem 0.15rem #aaa);
    margin-left: 0.25rem;
    margin-top: -0.25rem;
  }
}</style>
