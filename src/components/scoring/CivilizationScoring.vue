<template> 
  <table class="scoringTable">
    <tr>
      <td></td>
      <td colspan="2" class="civilization"><CivilizationIconName :name="playerCivilization"/></td>
      <td v-for="civilization in botCivilization" :key="civilization" colspan="2" class="civilization"><CivilizationIconName :name="civilization"/></td>
    </tr>
    <tr>
      <th>{{t('scoring.knowledgeCards')}}</th>
      <td class="count"><input type="number" min="0" max="99" v-model="knowledgeCardCount[0]" @change="persist"></td>
      <tdScore :value="knowledgeCardVP[0]" :dominance-value="knowledgeCardDominanceVP[0]"/>
      <template v-for="botIndex in botCount" :key="botIndex">
        <td class="count"><input type="number" min="0" max="99" v-model="knowledgeCardCount[botIndex]" @change="persist"></td>
        <tdScore :value="knowledgeCardVP[botIndex]" :dominance-value="knowledgeCardDominanceVP[botIndex]"/>
      </template>
    </tr>
    <tr>
      <th>{{t('scoring.wonderCards')}}</th>
      <td class="count"><input type="number" min="0" max="99" v-model="wonderCardCount[0]" @change="persist"></td>
      <tdScore :value="wonderCardVP[0]" :dominance-value="wonderCardDominanceVP[0]"/>
      <template v-for="botIndex in botCount" :key="botIndex">
        <td class="count"><input type="number" min="0" max="99" v-model="wonderCardCount[botIndex]" @change="persist"></td>
        <tdScore :value="wonderCardVP[botIndex]" :dominance-value="wonderCardDominanceVP[botIndex]"/>
      </template>
    </tr>
    <tr>
      <th>{{t('scoring.culturalPolicies')}}</th>
      <td class="count"><input type="number" min="0" max="99" v-model="culturalPolicyCount[0]" @change="persist"></td>
      <tdScore :value="culturalPolicyVP[0]" :dominance-value="culturalPolicyDominanceVP[0]"/>
      <template v-for="botIndex in botCount" :key="botIndex">
        <td class="count"><input type="number" min="0" max="99" v-model="culturalPolicyCount[botIndex]" disabled></td>
        <tdScore :value="culturalPolicyVP[botIndex]" :dominance-value="culturalPolicyDominanceVP[botIndex]"/>
      </template>
    </tr>
    <tr>
      <th>{{t('scoring.provinces')}}</th>
      <td class="count"><input type="number" min="0" max="99" v-model="provinceCount[0]" @change="persist"></td>
      <tdScore :value="provinceVP[0]" :dominance-value="provinceDominanceVP[0]"/>
      <template v-for="botIndex in botCount" :key="botIndex">
        <td class="count"><input type="number" min="0" max="99" v-model="provinceCount[botIndex]" @change="persist"></td>
        <tdScore :value="provinceVP[botIndex]" :dominance-value="provinceDominanceVP[botIndex]"/>
      </template>
    </tr>
    <tr>
      <th>{{t('scoring.gold')}}</th>
      <td class="count"></td>
      <td class="score"></td>
      <template v-for="botIndex in botCount" :key="botIndex">
        <td class="count"><input type="number" min="0" max="99" v-model="botGold[botIndex-1]" disabled></td>
        <tdScore :value="goldVP[botIndex]"/>
      </template>
    </tr>
    <tr class="total">
      <th>{{t('scoring.total')}}</th>
      <td class="count"></td>
      <tdScore :value="totalVP[0]"/>
      <template v-for="botIndex in botCount" :key="botIndex">
        <td class="count"></td>
        <tdScore :value="totalVP[botIndex]"/>
      </template>
    </tr>
  </table>
</template>

<script lang="ts">
import * as _ from "lodash"
import { computed, defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '@/store'
import CivilizationIconName from '@/components/structure/CivilizationIconName.vue'
import tdScore from "./ScoreCell.vue"
import Bot from "@/services/Bot"

export default defineComponent({
  name: 'CivilizationScoring',
  components: {
    CivilizationIconName,
    tdScore
  },
  setup() {
    const { t } = useI18n()
    const store = useStore()

    const playerCivilization = store.state.setup.civilizations.playerCivilization as string
    const botCivilization = store.state.setup.civilizations.botCivilization
    const botCount = store.state.setup.civilizations.botCivilization.length

    // get gold and cultural policies from bots
    const botGold : number[] = []
    const botCulturalPolicies : number[] = []
    for (let i=0; i<botCount; i++) {
      botGold[i] = 0
      botCulturalPolicies[i] = 0
      for (let roundIndex=store.state.rounds.length-1; roundIndex>=0; roundIndex--) {
        const round = store.state.rounds[roundIndex]
        if (i < round.bots.length) {
          const bot = Bot.fromPersistence(round.bots[i])
          botGold[i] = bot.goldTotal
          botCulturalPolicies[i] = bot.culturalPolicies
          break;
        }
      }
    }

    const scoring = store.state.scoring
    const knowledgeCardCount = ref(scoring?.knowledgeCardCount ?? _.fill(Array(botCount+1),0))
    const wonderCardCount = ref(scoring?.wonderCardCount ?? _.fill(Array(botCount+1),0))
    const culturalPolicyCount = ref([scoring?.culturalPolicyCountPlayer ?? 0, ...botCulturalPolicies])
    const provinceCount = ref(scoring?.provinceCount ?? _.fill(Array(botCount+1),0))

    const knowledgeCardVP = computed({
      get: () => knowledgeCardCount.value,
      set: (v) => v
    })
    const knowledgeCardDominanceVP = computed({
      get: () => knowledgeCardCount.value.map(c => c>0 && c==_.max(knowledgeCardCount.value) ? 3 : 0),
      set: (v) => v
    })
    const wonderCardVP = computed({
      get: () => wonderCardCount.value.map(c => c*2),
      set: (v) => v
    })
    const wonderCardDominanceVP = computed({
      get: () =>  wonderCardCount.value.map(c => c>0 && c==_.max( wonderCardCount.value) ? 3 : 0),
      set: (v) => v
    })
    const culturalPolicyVP = computed({
      get: () => culturalPolicyCount.value.map(c => c*2),
      set: (v) => v
    })
    const culturalPolicyDominanceVP = computed({
      get: () => culturalPolicyCount.value.map(c => c>0 && c==_.max(culturalPolicyCount.value) ? 3 : 0),
      set: (v) => v
    })
    const provinceVP = computed({
      get: () => provinceCount.value,
      set: (v) => v
    })
    const provinceDominanceVP = computed({
      get: () => provinceCount.value.map(c => c>0 && c==_.max(provinceCount.value) ? 3 : 0),
      set: (v) => v
    })
    const goldVP =  [0, ...botGold.map(gold => Math.floor(gold / 3))]
    const totalVP = computed({
      get: () => {
        const result : number[] = []
        for (let i=0; i<botCount+1;i++) {
          result[i] = knowledgeCardVP.value[i] + knowledgeCardDominanceVP.value[i]
              + wonderCardVP.value[i] + wonderCardDominanceVP.value[i]
              + culturalPolicyVP.value[i] + culturalPolicyDominanceVP.value[i]
              + provinceVP.value[i] + provinceDominanceVP.value[i]
              + goldVP[i]
        }
        return result
      },
      set: (v) => v
    })

    return { t, store, playerCivilization, botCivilization, botCount,
      knowledgeCardCount, knowledgeCardVP, knowledgeCardDominanceVP,
      wonderCardCount, wonderCardVP, wonderCardDominanceVP,
      culturalPolicyCount, culturalPolicyVP, culturalPolicyDominanceVP,
      provinceCount, provinceVP, provinceDominanceVP,
      botGold, goldVP,
      totalVP
    }
  },
  methods: {
    persist() {
      this.store.commit('scoring', {
        knowledgeCardCount: this.knowledgeCardCount,
        wonderCardCount: this.wonderCardCount,
        culturalPolicyCountPlayer: this.culturalPolicyCount[0],
        provinceCount: this.provinceCount
      })
    }
  }
})
</script>

<style lang="scss" scoped>
.scoringTable {
  width: 100%;
  border-collapse: collapse;
  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
  th, td {
    border-collapse: collapse;
    min-width: 3rem;
    padding: 1rem 0.2rem 1rem 0.2rem;
  }
  td {
    text-align: center;
  }
  td.civilization, td.count {
    border-left: 0.5px solid black;
  }
  input {
    width: 3rem;
  }
  tr.total {
    border-top: 2px solid #888;
    font-weight: bold;
  }
}
</style>