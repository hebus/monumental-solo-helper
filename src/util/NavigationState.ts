import CivilizationName from "@/services/enum/CivilizationName";
import { State } from "@/store";
import { RouteLocation } from "vue-router";

export default class NavigationState {

  readonly round : number
  readonly botIndex : number
  readonly botCount : number
  readonly civilizationName : CivilizationName
 
  constructor(route : RouteLocation, state : State) {
    this.round = parseInt(route.params['round'] as string)
    this.botIndex = parseInt(route.params['bot'] as string)
    this.botCount = state.setup.civilizations.botCivilization.length
    if (isNaN(this.botIndex)) {
      this.civilizationName = state.setup.civilizations.playerCivilization as CivilizationName
    }
    else {
      this.civilizationName = state.setup.civilizations.botCivilization[this.botIndex-1]
    }
  }

}
