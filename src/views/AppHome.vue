<template>

  <div class="float-end m-2 w-25">
    <a href="https://boardgamegeek.com/boardgame/248125/monumental" target="_blank" rel="noopener">
      <img src="../assets/game-monumental.jpg" class="rounded shadow w-100"/>
    </a>
  </div>

  <h1>{{t('home.title')}}</h1>

  <p v-html="t('home.play1')"></p>
  <p v-html="t('home.play2')"></p>
  <p v-html="t('home.play3')"></p>

  <p class="text-muted fst-italic">
    {{t('home.feedback')}}
    <a href="https://boardgamegeek.com/thread/2825042/brdgmme-monumental-solo-helper-web-application" target="_blank" rel="noopener">Board Game Geek Thread</a> |
    <a href="https://github.com/brdgm/monumental-solo-helper" target="_blank" rel="noopener">GitHub</a>
  </p>

  <router-link to="/setup/gameDifficulty" class="btn btn-primary btn-lg mt-3">{{t('action.playGame')}}</router-link>

  <p class="disclaimer">
    This is not an official Funforge product and has no affiliation with <a href="https://funforge.fr/" target="_blank" rel="noopener">Funforge</a>.
    All art in this app is from <a href="https://funforge.fr/game/en/monumental" target="_blank" rel="noopener">Monumental</a>.
    See <a href="#" data-bs-toggle="modal" data-bs-target="#creditsModal">{{t('footer.credits')}}</a>.
    <a href="https://ko-fi.com/brdgm_me" target="_blank"><img class="kofi-button" src="@/assets/kofi_button_dark.png"/></a>
  </p>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'AppHome',
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
.kofi-button {
  height: 1.4rem;
}
</style>
