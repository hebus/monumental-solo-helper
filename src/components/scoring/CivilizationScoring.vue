<template> 
  <table class="scoringTable">
    <tr>
      <td class="text-muted text-start">{{t('scoring.playedRounds', {count:roundCount})}}</td>
      <td v-for="(civilization,index) in playerCivilization" :key="civilization" colspan="2" class="civilization">
        <CivilizationIconName :name="civilization"/>
        <div class="small text-muted">{{t('roundPlayer.title', {player:index+1}, playerCount)}}</div>
      </td>
      <td v-for="(civilization,index) in botCivilization" :key="civilization" colspan="2" class="civilization">
        <CivilizationIconName :name="civilization"/>
        <div class="small text-muted">{{t('roundBot.title', {bot:index+1}, botCount)}}</div>
      </td>
    </tr>
    <tr>
      <th>{{t('scoring.knowledgeCards')}}</th>
      <template v-for="playerIndex in playerCount" :key="playerIndex">
        <td class="count"><input type="number" min="0" max="99" v-model="knowledgeCardCount[playerIndex-1]" @change="persist"></td>
        <tdScore :value="knowledgeCardVP[playerIndex-1]" :dominance-value="knowledgeCardDominanceVP[playerIndex-1]"/>
      </template>
      <template v-for="botIndex in botCount" :key="botIndex">
        <td class="count"><input type="number" min="0" max="99" v-model="knowledgeCardCount[botIndex+playerCount-1]" @change="persist"></td>
        <tdScore :value="knowledgeCardVP[botIndex+playerCount-1]" :dominance-value="knowledgeCardDominanceVP[botIndex+playerCount-1]"/>
      </template>
    </tr>
    <tr>
      <th>{{t('scoring.wonderCards')}}</th>
      <template v-for="playerIndex in playerCount" :key="playerIndex">
        <td class="count"><input type="number" min="0" max="99" v-model="wonderCardCount[playerIndex-1]" @change="persist"></td>
        <tdScore :value="wonderCardVP[playerIndex-1]" :dominance-value="wonderCardDominanceVP[playerIndex-1]"/>
      </template>
      <template v-for="botIndex in botCount" :key="botIndex">
        <td class="count"><input type="number" min="0" max="99" v-model="wonderCardCount[botIndex+playerCount-1]" @change="persist"></td>
        <tdScore :value="wonderCardVP[botIndex+playerCount-1]" :dominance-value="wonderCardDominanceVP[botIndex+playerCount-1]"/>
      </template>
    </tr>
    <tr>
      <th>{{t('scoring.culturalPolicies')}}</th>
      <template v-for="playerIndex in playerCount" :key="playerIndex">
        <td class="count"><input type="number" min="0" max="99" v-model="culturalPolicyCount[playerIndex-1]" @change="persist"></td>
        <tdScore :value="culturalPolicyVP[playerIndex-1]" :dominance-value="culturalPolicyDominanceVP[playerIndex-1]"/>
      </template>
      <template v-for="botIndex in botCount" :key="botIndex">
        <td class="count"><input type="number" min="0" max="99" v-model="culturalPolicyCount[botIndex+playerCount-1]" disabled></td>
        <tdScore :value="culturalPolicyVP[botIndex+playerCount-1]" :dominance-value="culturalPolicyDominanceVP[botIndex+playerCount-1]"/>
      </template>
    </tr>
    <tr>
      <th>{{t('scoring.provinces')}}</th>
      <template v-for="playerIndex in playerCount" :key="playerIndex">
        <td class="count"><input type="number" min="0" max="99" v-model="provinceCount[playerIndex-1]" @change="persist"></td>
        <tdScore :value="provinceVP[playerIndex-1]" :dominance-value="provinceDominanceVP[playerIndex-1]"/>
      </template>
      <template v-for="botIndex in botCount" :key="botIndex">
        <td class="count"><input type="number" min="0" max="99" v-model="provinceCount[botIndex+playerCount-1]" @change="persist"></td>
        <tdScore :value="provinceVP[botIndex+playerCount-1]" :dominance-value="provinceDominanceVP[botIndex+playerCount-1]"/>
      </template>
    </tr>
    <tr>
      <th>{{t('scoring.monster')}}</th>
      <template v-for="playerIndex in playerCount" :key="playerIndex">
        <td class="count"><input type="number" min="0" max="99" v-model="monsterCount[playerIndex-1]" @change="persist"></td>
        <tdScore :value="monsterCount[playerIndex-1]"/>
      </template>
      <template v-for="botIndex in botCount" :key="botIndex">
        <td class="count"></td>
        <td class="score"></td>
      </template>
    </tr>
    <tr>
      <th>{{t('scoring.gold')}}</th>
      <template v-for="playerIndex in playerCount" :key="playerIndex">
        <td class="count"></td>
        <td class="score"></td>
      </template>
      <template v-for="botIndex in botCount" :key="botIndex">
        <td class="count"><input type="number" min="0" max="99" v-model="botGold[botIndex-1]" disabled></td>
        <tdScore :value="goldVP[botIndex+playerCount-1]"/>
      </template>
    </tr>
    <tr class="total">
      <th>{{t('scoring.total')}}</th>
      <template v-for="playerIndex in playerCount" :key="playerIndex">
        <td class="count"></td>
        <tdScore :value="totalVP[playerIndex-1]"/>
      </template>
      <template v-for="botIndex in botCount" :key="botIndex">
        <td class="count"></td>
        <tdScore :value="totalVP[botIndex+playerCount-1]"/>
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

    const playerCivilization = store.state.setup.civilizations.playerCivilization
    const playerCount = store.state.setup.civilizations.playerCivilization.length
    const botCivilization = store.state.setup.civilizations.botCivilization
    const botCount = store.state.setup.civilizations.botCivilization.length
    const roundCount = store.state.rounds.length

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
    const knowledgeCardCount = ref(scoring?.knowledgeCardCount ?? _.fill(Array(playerCount+botCount),0))
    const wonderCardCount = ref(scoring?.wonderCardCount ?? _.fill(Array(playerCount+botCount),0))
    const culturalPolicyCount = ref([...scoring?.culturalPolicyCountPlayer ?? _.fill(Array(playerCount),0), ...botCulturalPolicies])
    const provinceCount = ref(scoring?.provinceCount ?? _.fill(Array(playerCount+botCount),0))
    const monsterCount = ref([...scoring?.monsterCountPlayer ?? _.fill(Array(playerCount),0), ..._.fill(Array(botCount),0)])

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
    const monsterVP = computed({
      get: () => monsterCount.value,
      set: (v) => v
    })
    const goldVP =  [..._.fill(Array(playerCount),0), ...botGold.map(gold => Math.floor(gold / 3))]
    const totalVP = computed({
      get: () => {
        const result : number[] = []
        for (let i=0; i<playerCount+botCount;i++) {
          result[i] = knowledgeCardVP.value[i] + knowledgeCardDominanceVP.value[i]
              + wonderCardVP.value[i] + wonderCardDominanceVP.value[i]
              + culturalPolicyVP.value[i] + culturalPolicyDominanceVP.value[i]
              + provinceVP.value[i] + provinceDominanceVP.value[i]
              + monsterVP.value[i] + goldVP[i]
        }
        return result
      },
      set: (v) => v
    })

    return { t, store, playerCivilization, playerCount, botCivilization, botCount, roundCount,
      knowledgeCardCount, knowledgeCardVP, knowledgeCardDominanceVP,
      wonderCardCount, wonderCardVP, wonderCardDominanceVP,
      culturalPolicyCount, culturalPolicyVP, culturalPolicyDominanceVP,
      provinceCount, provinceVP, provinceDominanceVP,
      monsterCount, botGold, goldVP,
      totalVP
    }
  },
  methods: {
    persist() {
      this.store.commit('scoring', {
        knowledgeCardCount: this.knowledgeCardCount,
        wonderCardCount: this.wonderCardCount,
        culturalPolicyCountPlayer: this.culturalPolicyCount.slice(0, this.playerCount),
        provinceCount: this.provinceCount,
        monsterCountPlayer: this.monsterCount.slice(0, this.playerCount)
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