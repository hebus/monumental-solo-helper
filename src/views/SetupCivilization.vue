<template>
  <h1>{{t('setup.title')}}</h1>

  <SelectCivilizations @valid="setValid"/>

  <button class="btn btn-primary btn-lg mt-3" :class="{disabled: !valid}" @click="startGame">
    {{t('action.startGame')}}
  </button>

  <FooterButtons endGameButtonType="abortGame" backButtonRouteTo="/setup/gameDifficulty"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import SelectCivilizations from '@/components/setup/SelectCivilizations.vue'
import FooterButtons from '@/components/structure/FooterButtons.vue'

export default defineComponent({
  name: 'SetupCivilization',
  components: {
    SelectCivilizations,
    FooterButtons
  },
  setup() {
    const { t } = useI18n()
    return { t }
  },
  data() {
    return {
      valid: false
    }
  },
  methods: {
    setValid(valid: boolean) : void {
      this.valid = valid
    },
    startGame() : void {
      this.$store.commit('resetGameRounds')
      this.$router.push('/round/1/player/1')
    }
  }
})
</script>
