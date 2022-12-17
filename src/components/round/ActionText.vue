<template>
  <span v-if="showActionHelp" v-html="t(actionTextKey)" class="actionHelp" data-bs-toggle="modal" :data-bs-target="'#'+actionHelpId"></span>
  <span v-else v-html="t(actionTextKey)"></span>
  <span v-if="action.goldCost">{{' ' + t('roundBot.goldCost', {number: action.goldCost})}}</span>
  
  <ModalDialog v-if="showActionHelp" :id="actionHelpId" :title="t(actionHelpTitleKey)"
      :size-lg="true" :scrollable="true">
    <template #body>
      <div v-html="t(actionHelpTextKey)"></div>
    </template>
  </ModalDialog>

</template>

<script lang="ts">
import BotCardAction from '@/services/BotCardAction'
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import ModalDialog from 'brdgm-commons/src/components/structure/ModalDialog.vue'

export default defineComponent({
  name: 'ActionText',
  components: {
    ModalDialog
  },
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
