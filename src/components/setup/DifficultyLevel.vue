<template>
  <h3 class="mt-4 mb-3">{{t('setup.difficultyLevel.title')}}</h3>

  <div class="row">
    <div class="col-1 text-end">
      <label for="difficultyLevel" class="form-label">{{t('setup.difficultyLevel.easy')}}</label>
    </div>
    <div class="col-8 col-md-4">
      <input type="range" class="form-range" min="0" max="4" id="difficultyLevel"
          :value="$store.state.setup.difficultyLevel" @input="updateDifficultyLevel($event)">
      <div class="text-muted">{{t('setup.difficultyLevel.useCards', { count: $store.state.setup.difficultyLevel }, $store.state.setup.difficultyLevel)}}</div>
    </div>
    <div class="col-1">
      <label for="difficultyLevel" class="form-label">{{t('setup.difficultyLevel.hard')}}</label>
    </div>
  </div>  
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '@/store'

export default defineComponent({
  name: 'SelectExpansion',
  setup() {
    const { t } = useI18n()
    const store = useStore()
    return { t, store }
  },
  methods: {
    updateDifficultyLevel(event: Event) {
      let level = parseInt((event.target as HTMLInputElement).value)
      this.$store.commit('setupDifficultyLevel', level)
    }
  }
})
</script>

<style lang="scss" scoped>
</style>
