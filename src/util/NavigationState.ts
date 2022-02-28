import CivilizationName from "@/services/enum/CivilizationName";
import { State } from "@/store";
import { RouteLocation } from "vue-router";

export default class NavigationState {

  readonly round : number
  readonly playerIndex : number
  readonly playerCount : number
  readonly botIndex : number
  readonly botCount : number
  readonly civilizationName? : CivilizationName
 
  constructor(route : RouteLocation, state : State) {
    let round = 0
    if (route.name == 'RoundPlayer' || route.name == 'RoundBot') {
      round = parseInt(route.params['round'] as string)
    }
    let civilizationName = undefined
    let playerIndex = 0
    if (route.name == 'RoundPlayer') {
      playerIndex = parseInt(route.params['player'] as string)
      civilizationName = state.setup.civilizations.playerCivilization[playerIndex-1]
    }
    let botIndex = 0
    if (route.name == 'RoundBot') {
      botIndex = parseInt(route.params['bot'] as string)
      civilizationName = state.setup.civilizations.botCivilization[botIndex-1]
    }

    this.round = round
    this.playerIndex = playerIndex
    this.playerCount = state.setup.civilizations.playerCivilization.length
    this.botIndex = botIndex
    this.botCount = state.setup.civilizations.botCivilization.length
    this.civilizationName = civilizationName
  }

}
