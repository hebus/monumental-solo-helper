import Bot from '@/services/Bot'
import Action from '@/services/enum/Action'
import CardName from '@/services/enum/CardName'
import CivilizationName from '@/services/enum/CivilizationName'
import { expect } from 'chai'

interface BotSetupOptions {
  gold?: number
  culturalPolicies? : number
}
const setupBot = function(civilization: CivilizationName, drawPile: CardName[],
    options : BotSetupOptions = {}) : Bot {
  return Bot.fromPersistence({
    civilization: civilization,
    cardDeck: {
      drawPile: drawPile,
      discardPile: [],
      openCards: [],
      nexusCards: []
    },
    gold: options.gold ?? 0,
    culturalPolicies: options.culturalPolicies ?? 0,
    actions: [],
    cardsDrawn: [],
    cardsDrawnForRound: 0
  })
}

describe('Bot', () => {
  it('new', () => {
    const bot = Bot.new(3, CivilizationName.GREECE, 2)

    expect(bot.civilization.name).to.eq(CivilizationName.GREECE)
    expect(bot.goldTotal).to.eq(2)
    expect(bot.culturalPolicies).to.eq(0)
    expect(bot.actions).to.eql([])
    expect(bot.cardsDrawn.length).to.eq(0)

    const persistence = bot.toPersistence()
    expect(persistence.civilization).to.eq(CivilizationName.GREECE)
    expect(persistence.cardDeck.drawPile.length).to.gt(0)
    expect(persistence.cardDeck.discardPile.length).to.eq(0)
    expect(persistence.cardDeck.openCards.length).to.eq(0)
    expect(persistence.gold).to.eq(2)
    expect(persistence.culturalPolicies).to.eq(0)
    expect(persistence.actions).to.eql([])
    expect(persistence.cardsDrawn.length).to.eq(0)
    expect(persistence.cardsDrawnForRound).to.eq(0)
  }),

  it('startRound.drawAllCards', () => {
    const bot = setupBot(CivilizationName.CHINA,
      [CardName.GOLD_IF_TECHNOLOGICAL,CardName.EXPLORERS_IF_AGGRESSIVE,CardName.WONDER_IF_ECONOMIC],
      {gold:2})

    bot.startRound()
    expect(bot.actions.length).to.eq(3)
    expect(bot.actions[0].completed).to.true   // GAIN_3_GOLD played automatically
    expect(bot.goldTotal).to.eq(5)
    expect(bot.hasMoreActions()).to.true
    expect(bot.getNextActionIndex()).to.eq(1)

    bot.actions[1].complete()  // KNOWLEDGE_TAKE_LOWEST_COST
    bot.actions[2].complete()  // KNOWLEDGE_TAKE_HIGHEST_COST
    expect(bot.goldTotal).to.eq(5)
    expect(bot.actions.length).to.eq(6)  // additional card drawn automatically
    expect(bot.hasMoreActions()).to.true
    expect(bot.getNextActionIndex()).to.eq(3)
   
    bot.actions[3].complete({goldEarned: 1})  // EXPLORER_BOTH_MOVE_1_SPACE
    bot.actions[4].complete()  // EXPLORER_BOTH_MOVE_1_SPACE (gold cost: 2)
    bot.actions[5].complete()  // BUILDING_TAKE_LOWEST_COST
    expect(bot.goldTotal).to.eq(4)
    expect(bot.actions.length).to.eq(6)  // no more cards
    expect(bot.hasMoreActions()).to.false
    expect(bot.getNextActionIndex()).to.undefined

    expect(bot.actions[1].cardNumber).to.eq(1)
    expect(bot.actions[2].cardNumber).to.eq(1)
    expect(bot.actions[3].cardNumber).to.eq(2)
    expect(bot.actions[4].cardNumber).to.eq(2)
    expect(bot.actions[5].cardNumber).to.eq(2)
  }),

  it('multipleRounds', () => {
    const bot1 = setupBot(CivilizationName.CHINA,
      [CardName.CULTURAL_POLICY_IF_AGGRESSIVE,CardName.KNOWLEDGE_IF_AGGRESSIVE,CardName.CONQUER_IF_ECONOMIC,CardName.EXPLORERS_IF_AGGRESSIVE],
      {gold:6})

    bot1.startRound()

    // DEVELOP_1_CULTURAL_POLICY - played automatically
    // DEVELOP_1_CULTURAL_POLICY - played automatically (gold cost: 3)
    bot1.actions[2].complete()  // KNOWLEDGE_TAKE_HIGHEST_COST
    bot1.actions[3].complete()  // KNOWLEDGE_TAKE_HIGHEST_COST (gold cost: 2)

    expect(bot1.goldTotal, "gold round 1").to.eq(1)
    expect(bot1.culturalPolicies, "cultural policies round 1").to.eq(2)
    expect(bot1.hasMoreActions(), "more actions round 1").to.false

    // bot for next round
    const bot2 = Bot.fromPersistenceStartNewRound(bot1.toPersistence())

    bot2.startRound()

    expect(bot2.goldTotal, "gold round 2").to.eq(1)
    expect(bot2.culturalPolicies, "cultural policies round 2").to.eq(2)
    expect(bot2.actions.length, "actions round 2").to.eq(2)
    expect(bot2.actions[0].action).to.eq(Action.CONQUER_1_ADJACENT_LOWEST_COST)
    expect(bot2.actions[1].action).to.eq(Action.CONQUER_1_ADJACENT_LOWEST_COST)
  }),

  it('GREECE.CONQUER_IF_ARCHITECTURAL_action1_action2.skip', () => {
    const bot = setupBot(CivilizationName.GREECE,
      [CardName.CONQUER_IF_ARCHITECTURAL,CardName.WONDER_IF_ECONOMIC])
    
    bot.startRound()

    expect(bot.goldTotal).to.eq(0, "initial gold")
    expect(bot.actions.length).to.eq(2)
    const action1 = bot.actions[0]
    expect(action1.action).to.eq(Action.CONQUER_1_ADJACENT_LOWEST_COST)
    expect(action1.goldCost).to.eq(0)
    expect(action1.gold).to.eq(0)
    expect(action1.completed).to.false
    expect(action1.skipped).to.false
    const action2 = bot.actions[1]
    expect(action2.action).to.eq(Action.CONQUER_1_ADJACENT_LOWEST_COST)
    expect(action2.goldCost).to.eq(2)
    expect(action2.gold).to.eq(0)
    expect(action2.completed).to.false
    expect(action2.skipped).to.false

    expect(action1.canBePlayed()).to.true
    expect(action1.canBePlayedAutomatically()).to.false
    action1.complete({goldEarned: 1})

    expect(bot.goldTotal).to.eq(1, "gold after action 1")

    // cannot be played because gold cost 2 cannot be paid
    expect(action2.canBePlayed()).to.false
    expect(action2.canBePlayedAutomatically()).to.false

    expect(action1.completed).to.true
    expect(action1.skipped).to.false
    expect(action1.gold).to.eq(1)
    expect(action2.completed).to.true
    expect(action2.skipped).to.true
    expect(action2.gold).to.eq(0)

    expect(bot.goldTotal).to.eq(1, "gold after skipping action 2")
  }),

  it('GREECE.CONQUER_IF_ARCHITECTURAL_action1.skip_action2', () => {
    const bot = setupBot(CivilizationName.GREECE,
      [CardName.CONQUER_IF_ARCHITECTURAL,CardName.WONDER_IF_ECONOMIC])

    bot.startRound()

    expect(bot.goldTotal).to.eq(0, "initial gold")

    // simulate the free action cannot be played = 2 gold
    const action1 = bot.actions[0]
    action1.skipCannotPlay()

    expect(bot.goldTotal).to.eq(2, "gold after skipping action 1")

    const action2 = bot.actions[1]
    expect(action2.canBePlayed(), "action 2 can be played").to.true
    action2.complete({goldEarned: 3})

    expect(bot.goldTotal).to.eq(3, "gold after action 2")
  }),

  it('JAPAN.CULTURAL_POLICY_IF_AGGRESSIVE.GOLD_IF_CULTURAL', () => {
    const bot = setupBot(CivilizationName.JAPAN,
      [CardName.CULTURAL_POLICY_IF_AGGRESSIVE,CardName.GOLD_IF_CULTURAL],
      {gold:5})

    bot.startRound()

    // all actions played automatically:
    // card 1: DEVELOP_1_CULTURAL_POLICY
    // card 1: DEVELOP_1_CULTURAL_POLICY - gold cost: 3
    // card 2: GAIN_3_GOLD - gold revenue: 3
    // card 2: DEVELOP_1_CULTURAL_POLICY_2_GOLD_PER_POLICY - gold revenue: 2*3
    expect(bot.culturalPolicies, "cultural policies").to.eq(3)
    expect(bot.goldTotal, "gold").to.eq(5 - 3 + 3 + 2*3)
    expect(bot.hasMoreActions(), "has more actions").to.false
  }),

  it('DENMARK.EXPLORERS_IF_AGGRESSIVE', () => {
    const bot = setupBot(CivilizationName.DENMARK,
      [CardName.EXPLORERS_IF_AGGRESSIVE,CardName.KNOWLEDGE_IF_ARCHITECTURAL,CardName.EXPLORERS_IF_ARCHITECTURAL],
      {gold:2})

    bot.startRound()

    expect(bot.actions.length).to.eq(5)
    expect(bot.hasMoreActions()).to.true

    bot.actions[0].complete()  // EXPLORER_BOTH_MOVE_1_SPACE
    bot.actions[1].complete()  // EXPLORER_BOTH_MOVE_1_SPACE pay 2 gold
    bot.actions[2].complete()  // BUILDING_TAKE_LOWEST_COST
    bot.actions[3].complete()  // CONQUER_3_ADJACENT_HIGHEST_COST
    
    // SHUFFLE_CARDS is played automatically - discard pile is empty
    const persistence = bot.toPersistence()
    expect(persistence.cardDeck.discardPile.length).to.eq(0)
  }),

  it('AMAZONS.AMAZON_CIVILIZATION', () => {
    const bot = setupBot(CivilizationName.AMAZONS,
      [CardName.AMAZON_CIVILIZATION,CardName.CULTURAL_POLICY_IF_AGGRESSIVE,CardName.KNOWLEDGE_IF_ARCHITECTURAL],
      {gold:2})

    bot.startRound()

    expect(bot.actions.length).to.eq(2)

    bot.actions[0].complete()  // AMAZON_GAIN_MOUNT_2_HORSES
    
    // DRAW_CARD played automatically
    expect(bot.actions.length).to.eq(6)
    expect(bot.cardsDrawn.length).to.eq(2)

    // DEVELOP_1_CULTURAL_POLICY played automatically
    expect(bot.actions[2].completed).to.true
    expect(bot.culturalPolicies).to.eq(1)

    // DEVELOP_1_CULTURAL_POLICY skipped automatically
    expect(bot.actions[3].completed).to.true
    expect(bot.actions[3].skipped).to.true

    bot.actions[4].complete()  // CONQUER_1_ADJACENT_LOWEST_COST
    bot.actions[5].complete()  // CONQUER_1_ADJACENT_HIGHEST_COST

    expect(bot.actions.length).to.eq(8)
    expect(bot.cardsDrawn.length).to.eq(3)

    bot.actions[6].complete()  // KNOWLEDGE_TAKE_HIGHEST_COST
    bot.actions[7].complete()  // KNOWLEDGE_TAKE_HIGHEST_COST, gold cost: 2

    expect(bot.goldTotal).to.eq(0)
    expect(bot.hasMoreActions()).to.false
  }),

  it('CHINA.CHINA_CIVILIZATION', () => {
    const bot = setupBot(CivilizationName.CHINA,
      [CardName.CHINA_CIVILIZATION,CardName.CULTURAL_POLICY_IF_AGGRESSIVE,
       CardName.ADVANCED_EXPLORERS_WONDER,CardName.EXPLORERS_IF_TECHNOLOGICAL],
       {gold:2})

    bot.startRound()

    // CHINA_DRAW_UNTIL_TECHNOLOGICAL_ACTION played automatically
    expect(bot.actions.length).to.eq(6)
    expect(bot.cardsDrawn.length).to.eq(2)

    // open card is EXPLORERS_IF_TECHNOLOGICAL, others are discarded
    const persistence = bot.toPersistence()
    expect(persistence.cardDeck.openCards).to.eql([CardName.EXPLORERS_IF_TECHNOLOGICAL])
    expect(persistence.cardDeck.discardPile.length).to.eq(3)
  }),

  it('EGYPT.CHINA_CIVILIZATION', () => {
    const bot = setupBot(CivilizationName.EGYPT,
      [CardName.EGYPT_CIVILIZATION,CardName.CULTURAL_POLICY_IF_AGGRESSIVE,CardName.ADVANCED_EXPLORERS_WONDER],
      {gold:2})

    bot.startRound()

    // EGYPT_DRAW_CARD_GET_TWICE_ACTION_NON_SPECIAL played automatically
    // DEVELOP_1_CULTURAL_POLICY played automatically
    // DEVELOP_1_CULTURAL_POLICY gold cost: 3 - skipped automatically
    // DEVELOP_1_CULTURAL_POLICY played automatically
    // DEVELOP_1_CULTURAL_POLICY gold cost: 3 - skipped automatically
    // next card drawn is ADVANCED_EXPLORERS_WONDER with 6 actions

    expect(bot.actions.length).to.eq(11)
    expect(bot.cardsDrawn.length).to.eq(3)
    expect(bot.culturalPolicies).to.eq(2)
  }),

  it('GREECE.GREECE_CIVILIZATION', () => {
    const bot = setupBot(CivilizationName.GREECE,
      [CardName.GREECE_CIVILIZATION,CardName.ADVANCED_EXPLORERS_WONDER,CardName.CULTURAL_POLICY_IF_AGGRESSIVE],
      {gold:2})

    bot.startRound()

    // GREECE_DRAW_GET_ACTION_SPECIAL played automatically
    // ADVANCED_EXPLORERS_WONDER is skipped because it has not special action
    // CULTURAL_POLICY_IF_AGGRESSIVE is drawn, special action used

    expect(bot.actions.length).to.eq(3)
    expect(bot.cardsDrawn.length).to.eq(2)

    expect(bot.actions[1].action).to.eq(Action.CONQUER_1_ADJACENT_LOWEST_COST)
    expect(bot.actions[2].action).to.eq(Action.CONQUER_1_ADJACENT_HIGHEST_COST)
  }),

  it('MUGHALS.MUGHALS_CIVILIZATION', () => {
    const bot = setupBot(CivilizationName.MUGHALS,
      [CardName.MUGHALS_CIVILIZATION,CardName.ADVANCED_EXPLORERS_WONDER,CardName.KNOWLEDGE_IF_ARCHITECTURAL],
      {gold:2})

    bot.startRound()

    // MUGHALS_DRAW_NEXT_REMOVE_NON_ECONOMIC played automatically -> ADVANCED_EXPLORERS_WONDER gets removed from game
    // DRAW_CARD is played automatically
    // KNOWLEDGE_IF_ARCHITECTURAL is drawn

    expect(bot.actions.length).to.eq(4)
    expect(bot.cardsDrawn.length).to.eq(2)

    expect(bot.actions[2].action).to.eq(Action.KNOWLEDGE_TAKE_HIGHEST_COST)
    expect(bot.actions[3].action).to.eq(Action.KNOWLEDGE_TAKE_HIGHEST_COST)
  }),

  it('JAPAN.JAPAN_CIVILIZATION.option.CONQUER_1_ADJACENT_LOWEST_COST', () => {
    const bot = setupBot(CivilizationName.JAPAN,
      [CardName.JAPAN_CIVILIZATION,CardName.KNOWLEDGE_IF_ARCHITECTURAL],
      {gold:2})

    bot.startRound()

    expect(bot.actions.length).to.eq(1)

    bot.actions[0].complete({actionOption: Action.CONQUER_1_ADJACENT_LOWEST_COST, goldEarned: 2})

    expect(bot.goldTotal).to.eq(4)
    expect(bot.actions[0].action == Action.CONQUER_1_ADJACENT_LOWEST_COST)
    expect(bot.actions.length).to.eq(3)
  }),

  it('JAPAN.JAPAN_CIVILIZATION.option.DEVELOP_1_CULTURAL_POLICY', () => {
    const bot = setupBot(CivilizationName.JAPAN,
      [CardName.JAPAN_CIVILIZATION,CardName.KNOWLEDGE_IF_ARCHITECTURAL],
      {gold:2})

    bot.startRound()

    expect(bot.actions.length).to.eq(1)

    bot.actions[0].complete({actionOption: Action.DEVELOP_1_CULTURAL_POLICY})

    expect(bot.culturalPolicies).to.eq(1)
    expect(bot.actions[0].action == Action.DEVELOP_1_CULTURAL_POLICY)
    expect(bot.actions.length).to.eq(3)
  }),

  it('JAPAN.JAPAN_CIVILIZATION.option.DRAW_CARD', () => {
    const bot = setupBot(CivilizationName.JAPAN,
      [CardName.JAPAN_CIVILIZATION,CardName.KNOWLEDGE_IF_ARCHITECTURAL],
      {gold:2})

    bot.startRound()

    expect(bot.actions.length).to.eq(1)

    bot.actions[0].complete({actionOption: Action.DRAW_CARD})

    expect(bot.actions[0].action == Action.DRAW_CARD)
    expect(bot.actions.length).to.eq(3)
  }),

  it('ATLANTIS.ATLANTIS_CIVILIZATION', () => {
    const bot = setupBot(CivilizationName.ATLANTIS,
      [CardName.ATLANTIS_CIVILIZATION,CardName.KNOWLEDGE_IF_ARCHITECTURAL,
        CardName.ATLANTIS_CIVILIZATION,CardName.CULTURAL_POLICY_IF_AGGRESSIVE],
      {gold:3})

    bot.startRound()

    // ATLANTIS_NEXUS_PLACE_NEXT_USE_ALL executed automatically, next card put to nexus
    expect(bot.cardsDrawn.length).to.eq(1)
    expect(bot.nexusCards.length).to.eq(1)

    expect(bot.actions.length).to.eq(3)
    expect(bot.actions[0].action).to.eq(Action.ATLANTIS_NEXUS_PLACE_NEXT_USE_ALL)
    expect(bot.actions[1].action).to.eq(Action.KNOWLEDGE_TAKE_HIGHEST_COST)
    expect(bot.actions[2].action).to.eq(Action.KNOWLEDGE_TAKE_HIGHEST_COST)

    bot.actions[1].complete()
    bot.actions[2].complete()  // gold cost 2

    // ATLANTIS_NEXUS_PLACE_NEXT_USE_ALL executed automatically, next card put to nexus
    expect(bot.cardsDrawn.length).to.eq(2)
    expect(bot.nexusCards.length).to.eq(2)

    expect(bot.actions.length).to.eq(8)
    expect(bot.actions[3].action).to.eq(Action.ATLANTIS_NEXUS_PLACE_NEXT_USE_ALL)
    expect(bot.actions[4].action).to.eq(Action.KNOWLEDGE_TAKE_HIGHEST_COST)
    expect(bot.actions[5].action).to.eq(Action.KNOWLEDGE_TAKE_HIGHEST_COST)
    expect(bot.actions[6].action).to.eq(Action.DEVELOP_1_CULTURAL_POLICY)
    expect(bot.actions[7].action).to.eq(Action.DEVELOP_1_CULTURAL_POLICY)
  }),

  it('developCulturalPolicy.exceedLimit', () => {
    const bot = setupBot(CivilizationName.JAPAN,
      [CardName.CULTURAL_POLICY_IF_AGGRESSIVE,CardName.CULTURAL_POLICY_IF_TECHNOLOGICAL],
      {gold:16, culturalPolicies:5})

    bot.startRound()

    expect(bot.actions.length).to.eq(4)

    expect(bot.actions[0].skipped, "action 1 skipped").to.true
    expect(bot.actions[0].gold, "action 1 gold").to.eq(2)
    expect(bot.actions[1].skipped, "optional action 2 skipped").to.true
    expect(bot.actions[1].gold, "action 2 gold").to.eq(0)

    expect(bot.actions[2].skipped, "action 3 skipped").to.true
    expect(bot.actions[2].gold, "action 3 gold").to.eq(2)
    expect(bot.actions[3].skipped, "optional action 4 skipped").to.true
    expect(bot.actions[3].gold, "action 4 gold").to.eq(0)

    expect(bot.goldTotal).to.eq(20)
  })

})
