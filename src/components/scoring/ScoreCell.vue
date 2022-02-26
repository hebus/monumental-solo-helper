<template>
  <td class="score">
    {{value}}<span class="suffix" :class="{dominance: dominanceValue > 0}">+{{dominanceValue}}</span>
  </td>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ScoreCell',
  props: {
    value: {
      type: Number,
      required: true
    },
    dominanceValue: {
      type: Number,
      required: false,
      default: 0
    }
  }
})
</script>

<style lang="scss" scoped>
.suffix {
  display: inline-block;
  padding: 0.1rem;
  margin-left: 0.25rem;
  border-radius: 0.33rem;
  visibility: hidden;
}
.dominance {
  background-color: bisque;
  visibility: unset;
}

</style>
