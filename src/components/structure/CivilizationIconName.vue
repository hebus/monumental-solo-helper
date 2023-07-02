<template>
  <img :src="civilizationImageUrl" alt="" class="civ-icon"/>
  <span class="civ-name">{{t('civilization.' + civilization?.name)}}</span>
  <span class="text-muted small" v-if="showType">{{t('civilizationType.' + civilization?.type)}}</span>
</template>

<script lang="ts">
import Civilization from '@/services/Civilization'
import Civilizations from '@/services/Civilizations'
import CivilizationName from '@/services/enum/CivilizationName'
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'CivilizationIconName',
  setup() {
    const { t } = useI18n()
    return { t }
  },
  props: {
    name: {
      type: String,
      required: true
    },
    showType: {
      type: Boolean,
      required: false      
    },
  },
  computed: {
    civilization() : Civilization | undefined {
      return Civilizations.getOptional(this.name as CivilizationName)
    },
    civilizationImageUrl() : string {
      return new URL(`/src/assets/civilization/${this.name}.png`, import.meta.url).toString()
    }
  }
})
</script>

<style lang="scss">
.civ-icon {
  width: 1.75rem;
}
.civ-name {
  font-weight: bold;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}
</style>