import * as _ from "lodash"
import { BotPersistence } from "@/store"
import CardDeck from "./CardDeck"
import Civilization from "./Civilization"
import Civilizations from "./Civilizations"
import CivilizationName from "./enum/CivilizationName"
import BotCardAction from "./BotCardAction"
import Card, { CardAction } from "./Card"
import toCardNames from "@/util/toCardNames"
import toCards from "@/util/toCards"

export default class Bot {

  private _civilization : Civilization
  private _cardDeck : CardDeck
  private _gold : number
  private _culturalPolicies : number
  private _actions : BotCardAction[]
  private _cardsDrawn : Card[]  // total cards drawn
  private _cardsDrawnForRound : number  // cards drawn for this round (without additional cards)

  private constructor(civilization : Civilization, cardDeck : CardDeck, gold : number, 
      culturalPolicies: number, actions : BotCardAction[], cardsDrawn: Card[], cardsDrawnForRound: number) {
    this._civilization = civilization
    this._cardDeck = cardDeck
    this._gold = gold
    this._culturalPolicies = culturalPolicies
    this._actions = actions
    this._cardsDrawn = cardsDrawn
    this._cardsDrawnForRound = cardsDrawnForRound
  }

  public get civilization() : Civilization {
    return this._civilization
  }

  public get goldInitial() : number {
    return this._gold
  }

  public get goldTotal() : number {
    // initial gold + gold earned/payed in completed actions
    return this._gold + _.reduce(this.actions.filter(action => action.completed),
        (sum, action) => sum + action.gold, 0)
  }

  public get culturalPolicies() : number {
    return this._culturalPolicies
  }

  public get actions() : readonly BotCardAction[] {
    return this._actions
  }

  public get cardsDrawn() : readonly Card[] {
    return this._cardsDrawn
  }

  public get nexusCards() : readonly Card[] {
    return this._cardDeck.nexusCards
  }

  /**
   * Gets persistence view of bot.
   */
  public toPersistence() : BotPersistence {
    return {
      civilization: this._civilization.name,
      cardDeck: this._cardDeck.toPersistence(),
      gold: this._gold,
      culturalPolicies: this._culturalPolicies,
      actions: this._actions.map(action => action.toPersistence()),
      cardsDrawn: toCardNames(this._cardsDrawn),
      cardsDrawnForRound: this._cardsDrawnForRound
    }
  }

  /**
   * Start round by drawing the first card.
   */
  public startRound() : void {
    this._cardsDrawnForRound++
    this.drawCard()
  }

  /**
   * Draws one card form the deck and adds the actions (matching to the civilization) to the action list.
   * @param inspector Optionally allows to add an inspector to accept cards or modify the derived actions
   * @return Drawn card
   */
  public drawCard(inspector? : (card: Card) => DrawCardInspection) : Card {
    this._cardDeck.discardAll()
    const card = this._cardDeck.draw()
    let actions : CardAction[]
    if (inspector) {
      const inspection = inspector(card)
      if (inspection.accept ?? true) {
        actions = inspection.actions ?? card.actions
      }
      else {
        this._cardDeck.discardCard(card)
        return this.drawCard(inspector)
      }
    }
    else {
      actions = this.filterByCivilizationType(card.actions)
    }
    const cardNumber = this._cardsDrawn.length + 1
    this.addActions(cardNumber, actions)
    this._cardsDrawn.push(card)
    this.checkNextActionPlayAutomatically()
    return card
  }

  /**
   * Draws another card from the deck, puts it to the Nexus, and adds the actions from all cards of the Nexus.
   */
  public drawCardToNexusUseAll() : void {
    // draw card and put it to nexus
    const nextCard = this._cardDeck.draw()
    this._cardDeck.moveToNexus(nextCard)

    // add actions from all cards currently in nexus
    const cardNumber = this._cardsDrawn.length
    this._cardDeck.nexusCards.forEach(card => {
      const actions = this.filterByCivilizationType(card.actions)
      this.addActions(cardNumber, actions)
    })
    this.checkNextActionPlayAutomatically()
  }

  private filterByCivilizationType(actions : CardAction[]) : CardAction[] {
    return actions.filter(action => action.ifType == undefined || action.ifType == this._civilization.type)
  }

  private addActions(cardNumber : number, actions : CardAction[]) {
    actions.forEach(action => this._actions.push(new BotCardAction(this, cardNumber, action.action, action.gold, action.actionOptions)))
  }

  /**
   * Reveal card and remove it from game if it meets the given condition. Otherwise discard it.
   * @param condition Condition
   */
  public revealCardRemoveIfCondition(toRemove: (card: Card) => boolean) : void {
    const card = this._cardDeck.draw()
    if (toRemove(card)) {
      this._cardDeck.removeCard(card)
    }
    else {
      this._cardDeck.discardCard(card)
    }
  }

  /**
   * Develop a cultural policy.
   * @returns true if successful, false if max. number was already reached
   */
  public developCulturalPolicy() : boolean {
    if (this._culturalPolicies >= 5) {
      return false
    }
    else {
      this._culturalPolicies++
      return true
    }
  }

  /**
   * Discard all cards including the open ones and shuffle discard pile.
   */
  public shuffleCards() : void {
    this._cardDeck.discardAll()
    this._cardDeck.shuffleDiscardDrawPile()
  }

  /**
   * Checks the next uncompleted action if it can be played automatically.
   * If this is the case, play it automatically.
   */
  public checkNextActionPlayAutomatically() : void {
    const nextAction = this.actions.find(action => !action.completed)
    if (nextAction) {
      if (nextAction.canBePlayedAutomatically()) {
        if (nextAction.canBePlayed()) {
          nextAction.complete()
        }
        else {
          nextAction.skipCannotPlay()
        }
      }
      else if (nextAction.goldCost > this.goldTotal) {
        // next action has a gold cost that cannot be payed - skip
        nextAction.skipCannotPlay()
      }
    }
    else {
      // no next action - draw next card for this round if not two drawn already
      if (this._cardsDrawnForRound < 2) {
        this._cardsDrawnForRound++
        this.drawCard()
      }
    }
  }

  /**
   * Checks if there are more actions to play.
   * @returns No more actions
   */
  public hasMoreActions() : boolean {
    return this._actions.find(action => !action.completed) != undefined
  }

  /**
   * Gets the index of next action.
   * @returns Index of next action
   */
  public getNextActionIndex() : number | undefined {
    for (let i=0; i<this._actions.length; i++) {
      if (!this._actions[i].completed) {
        return i
      }
    }
    return undefined
  }

  /**
   * Creates a new bot for a new game.
   */
  public static new(numAdvancedCards: number, civilizationName: CivilizationName, gold: number) : Bot {
    const civilization = Civilizations.get(civilizationName)
    const cardDeck = CardDeck.new(numAdvancedCards, civilizationName)
    return new Bot(civilization, cardDeck, gold, 0, [], [], 0)
  }

  /**
   * Re-creates a bot for a current round.
   */
  public static fromPersistence(persistence : BotPersistence) : Bot {
    const civilization = Civilizations.get(persistence.civilization)
    const cardDeck = CardDeck.fromPersistence(persistence.cardDeck)
    const actions : BotCardAction[] = []
    const bot = new Bot(civilization, cardDeck,
      persistence.gold, persistence.culturalPolicies, actions,
      toCards(persistence.cardsDrawn), persistence.cardsDrawnForRound)
    actions.push(...persistence.actions.map(actionPersistence => BotCardAction.fromPersistence(bot, actionPersistence)))
    return bot
  }

  /**
   * Creates a new bot to continue from last round.
   */
  public static fromPersistenceStartNewRound(persistence : BotPersistence) : Bot {
    if (persistence.actions.find(action => !action.completed) != undefined) {
      throw new Error("Previous round was not completed.")
    }
    const civilization = Civilizations.get(persistence.civilization)
    const cardDeck = CardDeck.fromPersistence(persistence.cardDeck)
    // calculate new initial gold from previous actions and discard the actions
    const gold = persistence.gold + _.reduce(persistence.actions, (sum, action) => sum + action.gold, 0)
    return new Bot(civilization, cardDeck,
      gold, persistence.culturalPolicies, [], [], 0)
  }

}

export interface DrawCardInspection {
  accept?: boolean
  actions? : CardAction[]
}
