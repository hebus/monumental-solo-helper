<template>
  <span v-if="showActionHelp" v-html="t(actionTextKey)" class="actionHelp" data-bs-toggle="modal" :data-bs-target="'#'+actionHelpId"></span>
  <span v-else v-html="t(actionTextKey)"></span>
  <span v-if="action.goldCost">{{' ' + t('roundBot.goldCost', {number: action.goldCost})}}</span>
  
  <div v-if="showActionHelp" class="modal" :id="actionHelpId" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{t(actionHelpTitleKey)}}</h5>
          <button class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-html="t(actionHelpTextKey)"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" data-bs-dismiss="modal">{{t('action.close')}}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BotCardAction from '@/services/BotCardAction'
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'ActionText',
  setup() {
    const { t } = useI18n()
    return { t }
  },
  props: {
    action: {
      type: BotCardAction,
      required: true
    },
    index: {
      type: String,
      required: true
    }
  },
  computed: {
    showActionHelp() : boolean {
      return this.action.actionHelp != undefined && !this.action.skipped
    },
    actionHelpId() : string {
      return "actionHelp" + this.index + "Modal"
    },
    actionTextKey() : string {
      return 'cardAction.' + this.action.action
    },
    actionHelpTitleKey() : string {
      return 'actionHelp.' + this.action.actionHelp + '.title'
    },
    actionHelpTextKey() : string {
      return 'actionHelp.' + this.action.actionHelp + '.text'
    }
  }
})
</script>

<style lang="scss" scoped>
.actionHelp {
  cursor: help;
  :deep(b) {
    text-decoration: underline dotted;
  }
}
</style>
