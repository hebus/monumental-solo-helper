import Action from './enum/Action';
import ActionHelp from './enum/ActionHelp';

const mappings = [
  { help: ActionHelp.GAIN_DEVELOPMENT_CARD, actions: [
    Action.BUILDING_TAKE_LOWEST_COST,
    Action.BUILDING_TAKE_HIGHTEST_COST,
    Action.KNOWLEDGE_TAKE_LOWEST_COST,
    Action.KNOWLEDGE_TAKE_HIGHEST_COST,
    Action.KNOWLEDGE_TAKE_ALL,
  ]},
  { help: ActionHelp.BUILD_WONDER, actions: [
    Action.WONDER_COMPLETE_ACQUIRE_LOWEST_COST,
  ]},
  { help: ActionHelp.CONQUER_PROVINCE, actions: [
    Action.CONQUER_1_ADJACENT_LOWEST_COST,
    Action.CONQUER_1_ADJACENT_HIGHEST_COST,
    Action.CONQUER_3_ADJACENT_HIGHEST_COST,
  ]},
  { help: ActionHelp.MOVE_EXPLORERS, actions: [
    Action.EXPLORER_BOTH_MOVE_1_SPACE,
    Action.EXPLORER_BOTH_MOVE_2_SPACE,
    Action.EXPLORER_BOTH_MOVE_3_SPACE
  ]},
]

const actionMap = new Map<Action,ActionHelp>()
mappings.forEach(mapping => {
  mapping.actions.forEach(action => actionMap.set(action, mapping.help))
})

export default {

  /**
   * Get action help for action
   * @param action Action
   * @returns Action help
   */
  get(action: Action) : ActionHelp | undefined {
    return actionMap.get(action)
  }

}
