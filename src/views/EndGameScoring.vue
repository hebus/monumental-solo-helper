<template>
  <h1>Scoring</h1>

  <CivilizationScoring/>

  <FooterButtons endGameButtonType="endGame" :backButtonRouteTo="backButtonRouteTo"/>
</template>

<script lang="ts">
import * as _ from "lodash"
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '@/store'
import CivilizationScoring from '@/components/scoring/CivilizationScoring.vue'
import FooterButtons from '@/components/structure/FooterButtons.vue'

export default defineComponent({
  name: 'EndGameScoring',
  components: {
    CivilizationScoring,
    FooterButtons
  },
  setup() {
    const { t } = useI18n()
    const store = useStore()

    const botCount = store.state.setup.civilizations.botCivilization.length
    const lastRound = _.reduce(store.state.rounds, (max, round) => Math.max(max, round.round), 0)

    return { t, botCount, lastRound }
  },
  computed: {
    backButtonRouteTo() : string | undefined {
      if (this.lastRound > 0) {
        return '/round/' + this.lastRound + "/bot/" + this.botCount
      }
      else {
        return undefined
      }
    }
  }
})
</script>
