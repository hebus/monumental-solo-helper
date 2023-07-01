<template>
  
  <div class="row">
    <div class="col-6">
      <div v-for="(card,index) in bot.cardsDrawn" :key="index" class="automa-card" :class="{advanced:card.advanced}" :title="t('roundBot.automaCard' + (card.advanced ? 'Advanced' : ''))"></div>
      <template v-if="bot.nexusCards.length > 0">
        <div class="nexusDivider">{{t('roundBot.nexus')}}:</div> <div v-for="i in bot.nexusCards.length" :key="i" class="automa-card" :title="t('roundBot.automaCard')"></div>
      </template>
    </div>
    <div class="col-2"></div>
    <div class="col-2"></div>
    <div class="col-1">
      <GoldInfo :value="bot.goldInitial"/>
    </div>
    <div class="col-1" :title="t('roundBot.culturalPolicies')">
      <div class="cultural-policies">
        <div class="cultural-policy">{{bot.culturalPolicies}}</div>
        <div class="cultural-policy-card"></div>
      </div>
    </div>
  </div>
  <div v-for="(cardActions, cardIndex) in displayedActionsPerCard" :key="cardIndex" class="cardRowGroup">
    <div class="action row" v-for="(action, index) in cardActions" :key="index">
      <div class="col-10 col-md-6" :class="{skipped: action.skipped}">
        <ActionText :action="action" :index="cardIndex+'_'+index"/>
      </div>
      <div class="col-1 order-md-5">
        <template v-if="action.completed">
          <GoldInfo :value="action.gold" delta/>
        </template>
        <template v-else-if="action.goldCost">
          <GoldInfo :value="-action.goldCost" delta class="goldCost"/>
        </template>
      </div>
      <div class="col-6 mt-2 col-md-2 mt-md-0">
        <GoldEarned v-if="!action.completed && action.mayEarnGold()" v-model="currentActionGoldEarned"/>
      </div>
      <div class="col-6 mt-2 col-md-2 mt-md-0">
        <template v-if="action.skipped">❌</template>
        <template v-else-if="action.completed">✔</template>
        <template v-else-if="isChooseAction(action)">
          <button type="button" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#chooseActionModal">{{t('roundBot.action.choose')}}</button>
        </template>
        <template v-else>
          <button type="button" class="btn btn-success" @click="complete(action)">{{t('roundBot.action.complete')}}</button>
          <button type="button" class="btn btn-outline-danger not-possible" @click="notPossible(action)">{{t('roundBot.action.notPossible')}}</button>
        </template>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="col-6">
      <router-link v-if="!bot.hasMoreActions()" :to="nextButtonRouteTo" class="btn btn-primary btn-lg mt-2">
        {{t('action.next')}}
      </router-link>
    </div>
    <div class="col-2"></div>
    <div class="col-2"></div>
    <div class="col-1 goldTotal">
      <GoldInfo :value="bot.goldTotal"/>
    </div>
  </div>
  
  <ModalDialog v-if="nextAction" id="chooseActionModal" :size-xl="true">
    <template #header>
      <h5 class="modal-title"><span v-html="t('cardAction.choose-action')"></span></h5>
      <button class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </template>
    <template #body>
      <div class="container">
        <div class="action row" v-for="(action,index) in nextAction.actionOptions" :key="index">
          <div class="col-8">
            <i><span v-html="t('chooseAction.' + currentCardName + '.' + (index+1))"></span></i><br/>
            <span v-html="t('cardAction.' + action)"></span>
          </div>
          <div class="col-2">
            <GoldEarned v-if="nextAction.mayEarnGold(action)" v-model="currentActionGoldEarned"/>
          </div>
          <div class="col-2">
            <button type="button" class="btn btn-success" data-bs-dismiss="modal" @click="complete(nextAction!, action)">{{t('roundBot.action.choose')}}</button>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <button class="btn btn-secondary" data-bs-dismiss="modal">{{t('action.cancel')}}</button>
    </template>
  </ModalDialog>

</template>

<script lang="ts">
import * as _ from 'lodash'
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useStore } from '@/store'
import Bot from '@/services/Bot'
import ActionText from './ActionText.vue'
import GoldInfo from './GoldInfo.vue'
import GoldEarned from './GoldEarned.vue'
import ModalDialog from 'brdgm-commons/src/components/structure/ModalDialog.vue'
import CivilizationName from '@/services/enum/CivilizationName'
import BotCardAction from '@/services/BotCardAction'
import NavigationState from '@/util/NavigationState'
import Action from '@/services/enum/Action'
import CardName from '@/services/enum/CardName'

export default defineComponent({
  name: 'BotActions',
  components: {
    ActionText,
    GoldInfo,
    GoldEarned,
    ModalDialog
  },
  setup() {
    const { t } = useI18n()
    const route = useRoute()
    const store = useStore()

    const navigationState = new NavigationState(route, store.state)
    const round = navigationState.round
    const botIndex = navigationState.botIndex
    const botCount = navigationState.botCount
    const civilizationName = navigationState.civilizationName as string

    const botPersistence = store.state.rounds[round-1]?.bots[botIndex-1]
    let bot
    if (botPersistence) {
      bot = Bot.fromPersistence(botPersistence)
    }
    else if (round > 1) {
      const previousRoundBotPersistence = store.state.rounds[round-2]?.bots[botIndex-1]
      if (previousRoundBotPersistence) {
        bot = Bot.fromPersistenceStartNewRound(previousRoundBotPersistence)
        bot.startRound()
        store.commit('roundBot', { round: round, botIndex: botIndex, bot: bot.toPersistence() })
      }
    }
    if (!bot) {
      bot = Bot.new(store.state.setup.difficultyLevel, civilizationName as CivilizationName, 2)
      bot.startRound()
      store.commit('roundBot', { round: round, botIndex: botIndex, bot: bot.toPersistence() })
    }

    const nextActionIndex = ref(bot.getNextActionIndex())

    return { t, round, botIndex, botCount, civilizationName, bot, nextActionIndex }
  },
  data() {
    return {
      currentActionGoldEarned: 0
    }
  },
  computed: {
    nextButtonRouteTo() : string {
      if (this.botIndex < this.botCount) {
        return '/round/' + this.round + '/bot/' + (this.botIndex+1)
      }
      else {
        return '/round/' + (this.round+1) + '/player/1'
      }
    },
    displayedActionsPerCard() : _.Dictionary<BotCardAction[]> {
      let actions = this.bot.actions;
      if (this.nextActionIndex != undefined) {
        actions = this.bot.actions.slice(0, this.nextActionIndex+1)
      }
      return _.groupBy(actions, action => action.cardNumber)
    },
    nextAction() : BotCardAction | undefined {
      if (this.nextActionIndex != undefined) {
        return this.bot.actions[this.nextActionIndex]
      }
      else {
        return undefined
      }
    },
    currentCardName() : CardName | undefined {
      if (this.bot.cardsDrawn.length > 0) {
        return this.bot.cardsDrawn[this.bot.cardsDrawn.length-1].name
      }
      else {
        return undefined
      }
    }
  },
  methods: {
    complete(action : BotCardAction, actionOption? : Action) : void {
      action.complete({goldEarned: this.currentActionGoldEarned, actionOption:actionOption})
      this.currentActionGoldEarned = 0
      this.updateAndPersist()
    },
    notPossible(action : BotCardAction) : void {
      action.skipCannotPlay()
      this.currentActionGoldEarned = 0
      this.updateAndPersist()
    },
    updateAndPersist() : void {
      this.nextActionIndex = this.bot.getNextActionIndex()
      this.$store.commit('roundBot', { round: this.round, botIndex: this.botIndex, bot: this.bot.toPersistence() })
    },
    isChooseAction(action : BotCardAction) {
      return action.action == Action.CHOOSE_ACTION
    }
  }
})
</script>

<style lang="scss" scoped>
.cardRowGroup {
  border-left: 2px solid #ccc;
  border-radius: 0.75rem;
  margin-bottom: 0.5rem;
}
.row {
  padding: 0.75rem;
  min-height: 3rem;
}
.action.row:hover {
  background-color: #eee;
}
.skipped {
  text-decoration: line-through;
  color: #999;
}
.btn {
  margin-top: -0.25rem;
  margin-right: 0.5rem;
  &.not-possible {
    font-size: x-small;
    padding: 0.25rem;
  }
}
.goldCost {
  opacity: 0.4;
}
.goldTotal {
  padding-top: 0.5rem;
  border-top: 2px solid black;
}
.automa-card {
  display: inline-block;
  border-radius: 0.25rem;
  height: 1.75rem;
  width: 1.5rem;
  margin-right: 0.25rem;
  background-image: url(@/assets/automa-symbol.jpg);
  background-size: cover;
  background-repeat: no-repeat;
  filter: drop-shadow(0.15rem 0.15rem 0.15rem #aaa);
  &.advanced {
    filter: grayscale(100%) brightness(40%) sepia(100%) hue-rotate(-50deg) saturate(600%) contrast(0.8) drop-shadow(0.15rem 0.15rem 0.15rem #aaa);
  }
}
.cultural-policies {
  white-space: nowrap;
}
.cultural-policy {
  display: inline-block;
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: -0.5rem;
  margin-right: 0.25rem;
  vertical-align: top;
}
.cultural-policy-card {
  display: inline-block;
  border: 1.5px solid black;
  border-radius: 0.25rem;
  height: 1.75rem;
  width: 1.5rem;
  margin-right: 0.25rem;
  margin-top: -0.1rem;
  background-color: #eee;
  background-image: url(@/assets/cultural-policy.png);
  background-size: 1.1rem;
  background-position: center;
  background-repeat: no-repeat;
  filter: drop-shadow(0.15rem 0.15rem 0.15rem #aaa);
}
.nexusDivider {
  display: inline-block;
  vertical-align: top;
  margin-left: 1.5rem;
  margin-right: 0.5rem;
}
</style>