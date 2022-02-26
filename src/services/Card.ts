import Action from "./enum/Action"
import CardName from "./enum/CardName"
import CivilizationType from "./enum/CivilizationType"
import CivilizationName from "./enum/CivilizationName"

export default interface Card {
  name: CardName
  actions: CardAction[],
  advanced?: boolean,
  civilization?: CivilizationName
}

export interface CardAction {
  action: Action
  gold?: number
  ifType?: CivilizationType,
  actionOptions?: Action[]
}
