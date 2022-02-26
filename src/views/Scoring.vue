<template>
  <h1>Scoring</h1>

  <CivilizationScoring/>

  <FooterButtons endGameButtonType="endGame" :backButtonRouteTo="backButtonRouteTo"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from '@/store'
import CivilizationScoring from '@/components/scoring/CivilizationScoring.vue'
import FooterButtons from '@/components/structure/FooterButtons.vue'
import NavigationState from '@/util/NavigationState'

export default defineComponent({
  name: 'Scoring',
  components: {
    CivilizationScoring,
    FooterButtons
  },
  setup() {
    const { t } = useI18n()
    const route = useRoute()
    const store = useStore()

    const navigationState = new NavigationState(route, store.state)
    const round = navigationState.round
    const botCount = navigationState.botCount
    const civilizationName = navigationState.civilizationName as string

    return { t, round, botCount, civilizationName }
  },
  computed: {
    backButtonRouteTo() : string {
      if (this.round > 1) {
        return '/round/' + (this.round-1) + "/bot/" + this.botCount
      }
      else {
        return ''
      }
    }
  }
})
</script>
