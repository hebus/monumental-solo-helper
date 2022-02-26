import { BotCardActionPersistence } from "@/store"
import ActionsHelp from "./ActionsHelp"
import Bot from "./Bot"
import Card from "./Card"
import Action from "./enum/Action"
import ActionHelp from "./enum/ActionHelp"
import CivilizationType from "./enum/CivilizationType"

export default class BotCardAction {

  private static readonly AUTOMATIC_ACTIONS = [
    Action.DEVELOP_1_CULTURAL_POLICY,
    Action.DEVELOP_1_CULTURAL_POLICY_2_GOLD_PER_POLICY,
    Action.GAIN_3_GOLD,
    Action.SHUFFLE_CARDS,
    Action.DRAW_CARD,
    Action.ATLANTIS_NEXUS_PLACE_NEXT_USE_ALL,
    Action.CHINA_DRAW_UNTIL_TECHNOLOGICAL_ACTION,
    Action.EGYPT_DRAW_CARD_GET_TWICE_ACTION_NON_SPECIAL,
    Action.GREECE_DRAW_GET_ACTION_SPECIAL,
    Action.MUGHALS_DRAW_NEXT_REMOVE_NON_ECONOMIC
  ]

  private static readonly EARN_GOLD_ACTIONS = [
    Action.EXPLORER_BOTH_MOVE_1_SPACE,
    Action.EXPLORER_BOTH_MOVE_2_SPACE,
    Action.EXPLORER_BOTH_MOVE_3_SPACE,
    Action.CONQUER_1_ADJACENT_LOWEST_COST,
    Action.CONQUER_1_ADJACENT_HIGHEST_COST,
    Action.CONQUER_3_ADJACENT_HIGHEST_COST,
    Action.AZTECS_SACRIFICE_GET_GOLD,
    Action.DENMARK_COASTAL_PROVINCES_GOLD
  ]

  private readonly _bot : Bot
  private _cardNumber : number
  private _action : Action
  private readonly _goldCost : number
  private _actionOptions: Action[]
  private _completed : boolean
  private _skipped : boolean
  private _gold : number

  constructor(bot : Bot, cardNumber : number, action : Action, goldCost? : number, actionOptions?: Action[], completed? : boolean, skipped? : boolean, gold? : number) {
    this._bot = bot
    this._cardNumber = cardNumber
    this._action = action
    this._goldCost = goldCost ?? 0
    this._actionOptions = actionOptions ?? []
    this._completed = completed ?? false
    this._skipped = skipped ?? false
    this._gold = gold ?? 0
  }

  public get cardNumber() : number {
    return this._cardNumber
  }

  public get action() : Action {
    return this._action
  }

  public get actionHelp() : ActionHelp | undefined {
    return ActionsHelp.get(this._action)
  }

  public get goldCost() : number {
    return this._goldCost
  }

  public get completed() : boolean {
    return this._completed
  }

  public get skipped() : boolean {
    return this._skipped
  }

  public get gold() : number {
    return this._gold
  }

  public get actionOptions() : Action[] {
    return this._actionOptions
  }

  /**
   * Checks if this action will be executed automatically when calling the complete method.
   * No player interaction required.
   * @returns true if action can be played automatically
   */
  public canBePlayedAutomatically() : boolean {
    return BotCardAction.AUTOMATIC_ACTIONS.includes(this._action)
  }

  /**
   * Checks if the action can be played by the bot.
   * @returns true if action has not any gold cost, or it has and the bot has enough gold to pay it.
   */
  public canBePlayed() : boolean {
    if (this._goldCost == 0) {
      return true
    }
    else {
      return this._goldCost <= this._bot.goldTotal
    }
  }

  /**
   * Whether the bot may earn gold with this action.
   * @param action to check. If none given the default action is checked.
   * @returns true if the bot may earn gold
   */
  public mayEarnGold(action: Action = this.action) : boolean {
    return BotCardAction.EARN_GOLD_ACTIONS.includes(action)
  }

  /**
   * Complete the action.
   * @param goldEarned Enter gold the bot hea earned in this action (e.g. from barbarian troops or free cities)
   * @param actionOption Selection action option for CHOOSE_ACTION action
   */
  public complete(options : CompleteOptions = {}) : void {
    if (this.completed) {
      throw new Error("Action is already completed: " + this.action)
    }
    if (!this.canBePlayed()) {
      throw new Error("This action cannot be played.")
    }
    if (this.action == Action.CHOOSE_ACTION) {
      if (options.actionOption) {
        this._action = options.actionOption
      }
      else {
        throw new Error("No action chosen for CHOOSE_ACTION.")
      }
    }
    else if (options.actionOption) {
      throw new Error("Action can only be chosen for CHOOSE_ACTION action.")
    }
    if (options.goldEarned && !this.mayEarnGold()) {
      throw new Error('No gold can be earned with this action: ' + this.action)
    }
    this._completed = true
    this._gold = (options.goldEarned ?? 0) - this.goldCost
    this.executeActionAutomatically()
    this._bot.checkNextActionPlayAutomatically()
  }

  private executeActionAutomatically() : void {
    switch (this.action) {
      case Action.DEVELOP_1_CULTURAL_POLICY:
        if (!this._bot.developCulturalPolicy()) {
          if (this.goldCost == 0) {
            // gain two gold if not possible to develop another cultural policy
            this._gold += 2
          }
          else {
            // pay back the cost payed for the optional action
            this._gold += this.goldCost
          }
          this._skipped = true
        }
        break;
      case Action.DEVELOP_1_CULTURAL_POLICY_2_GOLD_PER_POLICY:
        if (!this._bot.developCulturalPolicy()) {
          if (this.goldCost == 0) {
            // gain two gold if not possible to develop another cultural policy
            this._gold += 2
          }
          else {
            // pay back the cost payed for the optional action
            this._gold += this.goldCost
          }
          this._skipped = true
        }
        this._gold += this._bot.culturalPolicies * 2
        break;
      case Action.GAIN_3_GOLD:
        this._gold += 3
        break;
      case Action.SHUFFLE_CARDS:
        this._bot.shuffleCards()
        break;
      case Action.DRAW_CARD:
        this._bot.drawCard()
        break;
      case Action.ATLANTIS_NEXUS_PLACE_NEXT_USE_ALL:
        this._bot.drawCardToNexusUseAll()
        break;
      case Action.CHINA_DRAW_UNTIL_TECHNOLOGICAL_ACTION:
        this._bot.drawCard(card => {
          return { accept: this.isCardCivilizationType(card, CivilizationType.TECHNOLOGICAL) }
        })
        break;
      case Action.EGYPT_DRAW_CARD_GET_TWICE_ACTION_NON_SPECIAL:
        this._bot.drawCard(card => {
          const nonSpecialActions = card.actions.filter(action => action.ifType == undefined)
          return { actions: [...nonSpecialActions, ...nonSpecialActions] }
        })
        break;
      case Action.GREECE_DRAW_GET_ACTION_SPECIAL:
        this._bot.drawCard(card => {
          // also not stated in rules explicitly, it would be unfair if greece draws an advanced card with no special action at all
          // so, re-draw card until we got one with a special action
          const hasSpecialAction = card.actions.find(action => action.ifType != undefined) != undefined
          const specialActions = card.actions.filter(action => action.ifType != undefined)
          return { accept: hasSpecialAction, actions: specialActions }
        })
        break;
      case Action.MUGHALS_DRAW_NEXT_REMOVE_NON_ECONOMIC:
        this._bot.revealCardRemoveIfCondition(card => {
          return !this.isCardCivilizationType(card, CivilizationType.ECONOMIC)
        })
        break;
    }
  }

  private isCardCivilizationType(card: Card, type :  CivilizationType) : boolean {
    return card.actions.find(action => action.ifType == type) != undefined
  }

  /**
   * Mark this action as "cannot play".
   * This may happen if the action has a gold cost, which cannot be payed by the bot.
   * Or if it is not possible to execute the action on the board, e.g. because no matching card
   * is available in the display. In this second case the bot earns 2 gold.
   */
  public skipCannotPlay() : void {
    if (this.completed) {
      throw new Error("Action is already completed: " + this.action)
    }
    this._completed = true
    this._skipped = true
    if (this._goldCost == 0) {
      this._gold = 2
    }
    this._bot.checkNextActionPlayAutomatically()
  }

  /**
   * Gets persistence view of bot card action.
   */
  public toPersistence() : BotCardActionPersistence {
    return {
      cardNumber: this._cardNumber,
      action: this._action,
      goldCost : this._goldCost,
      actionOptions : this._actionOptions,
      completed : this._completed,
      skipped: this.skipped,
      gold : this._gold
    }
  }

  /**
   * Re-creates a card date from persistence.
   */
  public static fromPersistence(bot : Bot, persistence : BotCardActionPersistence) : BotCardAction {
    return new BotCardAction(
      bot,
      persistence.cardNumber,
      persistence.action,
      persistence.goldCost,
      persistence.actionOptions,
      persistence.completed,
      persistence.skipped,
      persistence.gold
    )
  }  

}

export interface CompleteOptions {
  // Gold the bot has earned in this action (e.g. from barbarian troops or free cities)
  goldEarned? : number
  // Selected action option for CHOOSE_ACTION action
  actionOption? : Action
}
