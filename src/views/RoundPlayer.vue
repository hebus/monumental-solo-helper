<template>
  <h1>{{round}}: {{t('roundPlayer.title')}} <CivilizationIconName :name="civilizationName"/></h1>

  <p class="mt-4 mb-4">{{t('roundPlayer.info')}}</p>

  <router-link :to="'/round/' + round + '/bot/1'" class="btn btn-primary btn-lg mt-3">
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

<style lang="scss">
h1 .civ-icon {
  width: 2.25rem;
  margin-top: -0.5rem;
}
</style>