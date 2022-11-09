<template>
  
  <div class="row">
    <div class="col-md-3 col-xl-2">
      <label for="numberPlayers" class="form-label">{{t('setup.civilization.numberPlayers')}}</label>
    </div>
    <div class="col-md-6">
      <select class="form-select" id="numberPlayers" v-model="numberPlayers" @change="updateNumberPlayers">
        <option v-for="i in hasFivePlayers ? 4 : 3" :key="i" :value="i+1">{{i+1}}</option>
      </select>
    </div>
  </div>
  <div class="row mt-3">
    <div class="col-md-3 col-xl-2">
      <label for="numberHumanPlayers" class="form-label">{{t('setup.civilization.numberHumanPlayers')}}</label>
    </div>
    <div class="col-md-6">
      <select class="form-select" id="numberHumanPlayers" v-model="numberHumanPlayers" @change="updateNumberPlayers">
        <option v-for="i in numberPlayers - 1" :key="i" :value="i">{{i}}</option>
      </select>
    </div>
  </div>
  <div class="row mt-3" v-for="i in numberHumanPlayers" :key="i">
    <div class="col-md-3 col-xl-2">
      {{t('setup.civilization.playerCiv', { number: i }, numberHumanPlayers)}}
    </div>
    <div class="col-md-6">
      <SelectCivilization v-model="playerCivilization[i-1]" @update:model-value="updatePlayerCivilization(i)"/>
    </div>
  </div>
  <div class="row mt-3" v-for="i in numberPlayers - numberHumanPlayers" :key="i">
    <div class="col-md-3 col-xl-2">
      {{t('setup.civilization.botCiv', { number: i }, numberPlayers-numberHumanPlayers)}}
    </div>
    <div class="col-md-6">
      <SelectCivilization v-model="botCivilization[i-1]" @update:model-value="updateBotCivilization(i)"/>
    </div>
  </div>

  <div class="alert alert-warning mt-4 col-md-9 col-xl-8" role="alert" v-if="!valid">
    {{t('setup.civilization.selectDifferentWarning', { count: numberPlayers })}}
  </div>

  <h3 class="mt-4">{{t('setup.civilization.botMaterial.title', {}, numberPlayers-1)}}</h3>
  <ul>
    <li v-html="t('setup.civilization.botMaterial.info1', {}, numberPlayers-1)"></li>
    <li v-html="t('setup.civilization.botMaterial.info2')"></li>
  </ul>

</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { CivilizationSetup, useStore } from '@/store'
import SelectCivilization from './SelectCivilization.vue'
import Expansion from '@/services/enum/Expansion'
import CivilizationName from '@/services/enum/CivilizationName'
import Civilizations from '@/services/Civilizations'

export default defineComponent({
  name: 'SelectCivilizations',
  components: {
    SelectCivilization
  },
  setup() {
    const { t } = useI18n()
    const store = useStore()
    return { t, store }
  },
  emits: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    valid(_valid: boolean) {
      return true
    }
  },
  data() {
    return {
      numberPlayers: this.$store.state.setup.civilizations.numberPlayers,
      numberHumanPlayers: this.$store.state.setup.civilizations.numberHumanPlayers,
      playerCivilization: [...this.$store.state.setup.civilizations.playerCivilization],
      botCivilization: [...this.$store.state.setup.civilizations.botCivilization],
      valid: false
    }
  },
  computed: {
    hasLostKingdoms() : boolean {
      return this.$store.state.setup.expansions.includes(Expansion.LOST_KINGDOMS)
    },
    hasAfricanEmpires() : boolean {
      return this.$store.state.setup.expansions.includes(Expansion.AFRICAN_EMPIRES)
    },
    hasFivePlayers() : boolean {
      return this.hasLostKingdoms || this.hasAfricanEmpires
    }
  },
  methods: {
    updateNumberPlayers() {
      this.validate()
    },
    updatePlayerCivilization(playerIndex : number) {
      for (let i=0; i<=3; i++) {
        if (i != playerIndex-1 && this.playerCivilization[i] == this.playerCivilization[playerIndex-1]) {
          delete this.playerCivilization[i]
        }
      }
      for (let i=0; i<=3; i++) {
        if (this.botCivilization[i] == this.playerCivilization[playerIndex-1]) {
          delete this.botCivilization[i]
        }
      }
      this.validate()
    },
    updateBotCivilization(botIndex : number) {
      for (let i=0; i<=3; i++) {
        if (this.playerCivilization[i] == this.botCivilization[botIndex-1]) {
          delete this.playerCivilization[i]
        }
      }
      for (let i=0; i<=3; i++) {
        if (i != botIndex-1 && this.botCivilization[i] == this.botCivilization[botIndex-1]) {
          delete this.botCivilization[i]
        }
      }
      this.validate()
    },
    validate() {
      // validate player count and civs
      if (this.numberHumanPlayers >= this.numberPlayers) {
        this.numberHumanPlayers = this.numberPlayers - 1
      }
      let valid = this.numberPlayers >= 2 && this.numberPlayers <= (this.hasFivePlayers ? 5 : 4)
          && this.numberHumanPlayers >= 1 && this.numberHumanPlayers < this.numberPlayers
      for (let i=0; i<this.numberHumanPlayers; i++) {
        valid = valid && this.isValidCivilization(this.playerCivilization[i])
      }
      for (let i=0; i<this.numberPlayers-this.numberHumanPlayers; i++) {
        valid = valid && this.isValidCivilization(this.botCivilization[i])
      }

      // update store
      if (valid) {
        const civilizations : CivilizationSetup = {
          numberPlayers: this.numberPlayers,
          numberHumanPlayers: this.numberHumanPlayers,
          playerCivilization: this.playerCivilization.slice(0, this.numberHumanPlayers),
          botCivilization: this.botCivilization.slice(0, this.numberPlayers - this.numberHumanPlayers)
        }
        this.$store.commit('setupCivilizations', civilizations)
      }

      this.valid = valid
      this.$emit('valid', valid)
    },
    isValidCivilization(name?: CivilizationName) : boolean {
      if (name == undefined) {
        return false
      }
      const civ = Civilizations.get(name)
      if (!civ) {
        return false;
      }
      if (civ.expansion != undefined && !this.$store.state.setup.expansions.includes(civ.expansion)) {
        return false
      }
      return true
    }
  },
  mounted() {
    this.validate()
  }
})
</script>
