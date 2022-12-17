<template>
  <div class="end-game-buttons">
    <router-link v-if="backButtonRouteTo" :to="backButtonRouteTo" class="btn btn-secondary btn-sm me-2">{{t('action.back')}}</router-link>
    <button v-if="roundResetTurnButton" class="btn btn-secondary btn-sm me-2" data-bs-toggle="modal" data-bs-target="#roundResetTurnModal">{{t('action.roundResetTurn')}}</button>
    <button v-if="endGameButtonType" class="btn btn-secondary btn-sm" data-bs-toggle="modal" data-bs-target="#endGameModal">{{t('action.' + endGameButtonType)}}</button>
  </div>

  <ModalDialog v-if="roundResetTurnButton" id="roundResetTurnModal" :title="t('action.roundResetTurn')">
    <template #body>
      <p>{{t('action.roundResetTurnConfirm')}}</p>
    </template>
    <template #footer>
      <button class="btn btn-danger" @click="roundResetTurn" data-bs-dismiss="modal">{{t('action.roundResetTurn')}}</button>
      <button class="btn btn-secondary" data-bs-dismiss="modal">{{t('action.cancel')}}</button>
    </template>
  </ModalDialog>

  <ModalDialog v-if="endGameButtonType" id="endGameModal" :title="t('action.' + endGameButtonType)">
    <template #body>
      <p>{{t('action.' + endGameButtonType + 'Confirm')}}</p>
    </template>
    <template #footer>
      <button class="btn btn-danger" @click="endGame" data-bs-dismiss="modal">{{t('action.' + endGameButtonType)}}</button>
      <button class="btn btn-secondary" data-bs-dismiss="modal">{{t('action.cancel')}}</button>
    </template>
  </ModalDialog>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '@/store'
import { useRoute } from 'vue-router'
import NavigationState from '@/util/NavigationState'
import ModalDialog from 'brdgm-commons/src/components/structure/ModalDialog.vue'

export default defineComponent({
  name: 'FooterButtons',
  components: {
    ModalDialog
  },
  setup() {
    const { t } = useI18n()
    const store = useStore()
    const route = useRoute()

    const navigationState = new NavigationState(route, store.state)
    const roundView = (route.name=="RoundPlayer" || route.name=="RoundBot")

    return { t, store, navigationState, roundView }
  },
  props: {
    endGameButtonType: {
      type: String,  /* Type of end game button <X> (i18n action.<X> and action.<X>Confirm needs to be present); button is hidden when not set */
      required: false
    },
    backButtonRouteTo: {
      type: String,  /* router-link to */
      required: false
    },
    roundResetTurnButton: {
      type: Boolean,
      required: false
    },
  },
  methods: {
    roundResetTurn() {
      this.store.commit('roundResetTurn', {
        round: this.navigationState.round,
        botIndex: this.navigationState.botIndex
      })
      document.location.reload()
    },
    endGame() {
      if (this.roundView) {
        this.$router.push("/scoring")
      }
      else {
        this.store.commit('endGame')
        this.$router.replace("/")
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.end-game-buttons {
  position: fixed;
  right: 0;
  bottom: 0;
  z-index: 5000;
}
</style>