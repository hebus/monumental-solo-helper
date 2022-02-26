<template>
  
  <div class="row">
    <div class="col-md-3 col-xl-2">
      <label for="numberPlayers" class="form-label">{{t('setup.civilization.numberPlayers')}}</label>
    </div>
    <div class="col-md-6">
      <select class="form-select" id="numberPlayers" v-model="numberPlayers" @change="updateNumberPlayers">
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5" v-if="hasFivePlayers">5</option>
      </select>
      <p class="text-muted mt-2">{{t('setup.civilization.numberPlayersInfo')}}</p>
    </div>
  </div>
  <div class="row mt-3">
    <div class="col-md-3 col-xl-2">
      {{t('setup.civilization.playerCiv')}}
    </div>
    <div class="col-md-6">
      <SelectCivilization v-model="playerCivilization" @update:model-value="updatePlayerCivilization"/>
    </div>
  </div>
  <div class="row mt-3" v-for="i in numberPlayers - 1" :key="i">
    <div class="col-md-3 col-xl-2">
      {{t('setup.civilization.botCiv', { number: i })}}
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
    valid(valid: boolean) {
      return true
    }
  },
  data() {
    return {
      numberPlayers: this.$store.state.setup.civilizations.numberPlayers,
      playerCivilization: this.$store.state.setup.civilizations.playerCivilization,
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
    updatePlayerCivilization() {
      for (let i=0; i<=3; i++) {
        if (this.botCivilization[i] == this.playerCivilization) {
          delete this.botCivilization[i]
        }
      }
      this.validate()
    },
    updateBotCivilization(bot : number) {
      if (this.playerCivilization == this.botCivilization[bot-1]) {
        this.playerCivilization = undefined
      }
      for (let i=0; i<=3; i++) {
        if (i != bot-1 && this.botCivilization[i] == this.botCivilization[bot-1]) {
          delete this.botCivilization[i]
        }
      }
      this.validate()
    },
    validate() {
      // validate player count and civs
      let valid = (this.numberPlayers >= 2 && this.numberPlayers <= (this.hasFivePlayers ? 5 : 4))
      valid = valid && this.isValidCivilization(this.playerCivilization)
      for (let i=0; i<this.numberPlayers-1; i++) {
        valid = valid && this.isValidCivilization(this.botCivilization[i])
      }

      // update store
      if (valid) {
        const civilizations : CivilizationSetup = {
          numberPlayers: this.numberPlayers,
          playerCivilization: this.playerCivilization,
          botCivilization: this.botCivilization.slice(0, this.numberPlayers - 1)
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
      let civ = Civilizations.get(name)
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
