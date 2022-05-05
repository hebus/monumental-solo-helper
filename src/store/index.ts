import * as _ from "lodash"
import { InjectionKey } from 'vue'
import { createStore, useStore as baseUseStore, Store } from 'vuex'
import DifficultyLevel from '@/services/enum/DifficultyLevel'
import CivilizationName from '@/services/enum/CivilizationName'
import Expansion from '@/services/enum/Expansion'
import CardName from '@/services/enum/CardName'
import toggleArrayItem from '@/util/toggleArrayItem'
import Action from '@/services/enum/Action'

const LOCALSTORAGE_KEY = process.env.VUE_APP_LOCALSTORAGE_KEY_PREFIX + "store"

export interface State {
  language: string
  baseFontSize: number
  setup: Setup
  rounds: Round[]
  scoring?: ScoringPersistence
}
export interface Setup {
  difficultyLevel: DifficultyLevel
  expansions: Expansion[]
  civilizations: CivilizationSetup
}
export interface CivilizationSetup {
  numberPlayers: number
  numberHumanPlayers: number
  playerCivilization: CivilizationName[]
  botCivilization: CivilizationName[]
}
export interface Round {
  round: number
  bots: BotPersistence[]
}
export interface BotPersistence {
  civilization: CivilizationName
  cardDeck: CardDeckPersistence
  gold: number
  culturalPolicies: number
  actions: BotCardActionPersistence[]
  cardsDrawn: CardName[]
  cardsDrawnForRound: number
}
export interface BotCardActionPersistence {
  cardNumber: number
  action: Action
  goldCost: number
  actionOptions: Action[]
  completed: boolean
  skipped: boolean
  gold: number
}
export interface CardDeckPersistence {
  drawPile: CardName[]
  discardPile: CardName[]
  openCards: CardName[]
  nexusCards: CardName[]
}
export interface ScoringPersistence {
  knowledgeCardCount: number[]
  wonderCardCount: number[]
  culturalPolicyCountPlayer: number[]
  provinceCount: number[]
  monsterCountPlayer: number[]
}

export interface RoundBotPayload {
  round: number
  botIndex: number
  bot: BotPersistence
}
export interface RoundResetTurnPayload {
  round: number
  botIndex: number
}

declare module '@vue/runtime-core' {
  // provide typings for `this.$store`
  interface ComponentCustomProperties {
    $store: Store<State>
  }
}

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    language: "en",
    baseFontSize: 1.0,
    setup: {
      difficultyLevel: DifficultyLevel.BEGINNER,
      expansions: [],
      civilizations: {
        numberPlayers: 2,
        numberHumanPlayers: 1,
        playerCivilization: [],
        botCivilization: []
      }
    },
    rounds: []
  },
  mutations: {
    // reload state from local storage
    initialiseStore(state) {
      const localStorageCache = localStorage.getItem(LOCALSTORAGE_KEY)
      if (localStorageCache) {
        this.replaceState(Object.assign(state, JSON.parse(localStorageCache)));
      }
    },
    language(state : State, language: string) {
      state.language = language
    },
    setupToggleExpansionLostKingdoms(state : State) {
      toggleArrayItem(state.setup.expansions, Expansion.LOST_KINGDOMS)
    },
    setupToggleExpansionAfricanEmpires(state : State) {
      toggleArrayItem(state.setup.expansions, Expansion.AFRICAN_EMPIRES)
    },
    setupDifficultyLevel(state : State, level: number) {
      state.setup.difficultyLevel = level
    },
    setupCivilizations(state : State, civilizations: CivilizationSetup) {
      state.setup.civilizations = civilizations
    },
    roundBot(state : State, data: RoundBotPayload) {
      // remove round from state if it already exists
      let round = state.rounds.find(r => r.round==data.round)
      if (!round) {
        round = { round: data.round, bots: [] }
        state.rounds[data.round-1] = round
      }
      round.bots[data.botIndex-1] = data.bot
    },
    roundResetTurn(state : State, data: RoundResetTurnPayload) {
      // remove all rounds > the given round
      _.remove(state.rounds, r => r.round > data.round)
      const round = state.rounds.find(r => r.round==data.round)
      if (round) {
        // remove bot persistence from current and subsequent bots
        round.bots = round.bots.slice(0, data.botIndex-1)
      }
    },
    scoring(state : State, data: ScoringPersistence) {
      state.scoring = data
    },
    endGame(state : State) {
      state.setup.civilizations = {
        numberPlayers: 2,
        numberHumanPlayers: 1,
        playerCivilization: [],
        botCivilization: []
      }
      state.rounds = []
      state.scoring = undefined
    },
    zoomFontSize(state : State, baseFontSize: number) {
      state.baseFontSize = baseFontSize
    }
  }
})

store.subscribe((mutation, state) => {
	// store state asJSON string in local storage
	localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
})

// define your own `useStore` composition function
export function useStore() : Store<State> {
  return baseUseStore(key)
}
