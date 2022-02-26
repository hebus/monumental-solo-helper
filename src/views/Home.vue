<template>

  <div class="float-end m-2 w-25">
    <a href="https://boardgamegeek.com/boardgame/248125/monumental" target="_blank">
      <img src="../assets/game-monumental.jpg" class="rounded shadow w-100"/>
    </a>
  </div>

  <h1>{{t('home.title')}}</h1>

  <p v-html="t('home.play1')"></p>
  <p v-html="t('home.play2')"></p>
  <p v-html="t('home.play3')"></p>

  <router-link to="/setup/gameDifficulty" class="btn btn-primary btn-lg mt-3">{{t('action.playGame')}}</router-link>

  <p class="disclaimer">
    This is not an official Funforge product and has no affiliation with <a href="https://funforge.fr/" target="_blank">Funforge</a>.
    All art in this app is from <a href="https://funforge.fr/game/en/monumental" target="_blank">Monumental</a>.
    See <a href="#" data-bs-toggle="modal" data-bs-target="#creditsModal">{{t('footer.credits')}}</a>.
  </p>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'Home',
  setup() {
    const { t } = useI18n()
    return { t }
  },
})
</script>

<style lang="scss" scoped>
.disclaimer {
  clear: both;
  margin-top: 4rem;
  font-size: smaller;
}
</style>