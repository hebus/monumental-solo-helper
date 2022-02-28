<template>
  <h1>{{round}}: {{t('roundPlayer.title', { player: playerIndex }, playerCount )}} <CivilizationIconName :name="civilizationName"/></h1>

  <p class="mt-4 mb-4">{{t('roundPlayer.info')}}</p>

  <router-link :to="nextButtonRouteTo" class="btn btn-primary btn-lg mt-3">
    {{t('action.next')}}
  </router-link>

  <FooterButtons endGameButtonType="finishGame" :backButtonRouteTo="backButtonRouteTo"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from '@/store'
import CivilizationIconName from '@/components/structure/CivilizationIconName.vue'
import FooterButtons from '@/components/structure/FooterButtons.vue'
import NavigationState from '@/util/NavigationState'

export default defineComponent({
  name: 'RoundPlayer',
  components: {
    CivilizationIconName,
    FooterButtons
  },
  setup() {
    const { t } = useI18n()
    const route = useRoute()
    const store = useStore()

    const navigationState = new NavigationState(route, store.state)
    const round = navigationState.round
    const playerIndex = navigationState.playerIndex
    const playerCount = navigationState.playerCount
    const botIndex = navigationState.botIndex
    const botCount = navigationState.botCount
    const civilizationName = navigationState.civilizationName as string

    return { t, round, playerIndex, playerCount, botIndex, botCount, civilizationName }
  },
  computed: {
    nextButtonRouteTo() : string {
      if (this.playerIndex < this.playerCount) {
        return '/round/' + this.round + '/player/' + (this.playerIndex+1)
      }
      else {
        return '/round/' + this.round + '/bot/1'
      }
    },
    backButtonRouteTo() : string | undefined {
      if (this.round <= 1 && this.playerIndex <= 1) {
        return undefined
      }
      if (this.playerIndex > 1) {
        return '/round/' + this.round + "/player/" + (this.playerIndex-1)
      }
      else {
        return '/round/' + (this.round-1) + "/bot/" + this.botCount
      }
    }
  }
})
</script>

<style lang="scss">
h1 .civ-icon {
  width: 2.25rem;
  margin-top: -0.5rem;
}
</style>