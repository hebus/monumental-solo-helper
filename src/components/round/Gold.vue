<template>
  <div v-if="visible" class="gold" :title="t('gold.value')">{{prefix}}{{value}}<img src="@/assets/coin.png" alt=""/></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'Gold',
  setup() {
    const { t } = useI18n()
    return { t }
  },
  props: {
    value: {
      type: Number,
      required: false,
      default: 0
    },
    delta: {
      type: Boolean,
      required: false      
    },
  },
  computed: {
    visible() : boolean {
      return this.value != 0 || !this.delta
    },
    prefix() : string {
      if (this.delta && this.value > 0) {
        return '+'
      }
      else {
        return ''
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.gold {
  margin-top: -0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  display: inline;
  float: right;
  img {
    height: 1.75rem;
    filter: drop-shadow(0.15rem 0.15rem 0.15rem #aaa);
    margin-left: 0.25rem;
    margin-top: -0.25rem;
  }
}</style>
