<template>
  <div class="dropdown">
    <button class="btn btn-light dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
      <template v-if="selectedCivilization">
        <CivilizationIconName :name="selectedCivilization.name" showType/>
      </template>
      <template v-else>
        {{t('setup.civilization.select')}}
      </template>
    </button>
    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
      <template v-for="expansion in civilizationExpansions" v-bind:key="expansion">
        <li v-if="expansion"><hr class="dropdown-divider"></li>
        <li v-for="civ in listCivilizations(expansion)" v-bind:key="civ.name">
          <a class="dropdown-item" @click.prevent="selectCivilization(civ.name)">
            <CivilizationIconName :name="civ.name" showType/>
          </a>
        </li>
      </template>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '@/store'
import CivilizationIconName from '../structure/CivilizationIconName.vue'
import CivilizationName from '@/services/enum/CivilizationName'
import Civilization from '@/services/Civilization'
import Civilizations from '@/services/Civilizations'
import Expansion from '@/services/enum/Expansion'

export default defineComponent({
  name: 'SelectCivilization',
  components: {
    CivilizationIconName
  },
  setup() {
    const { t } = useI18n()
    useStore()
    return { t }
  },
  props: {
    modelValue: {
      type: String,  /* civilization name */
      required: false
    }
  },
  data() {
    return {
      civilizationName: this.modelValue
    }
  },
  watch: {
    modelValue: function(newValue : string) {
      this.civilizationName = newValue
    }
  },
  emits: [
    'update:modelValue'
  ],
  computed: {
    selectedCivilization() : Civilization | undefined {
      return Civilizations.getOptional(this.civilizationName as CivilizationName)
    },
    civilizationExpansions() : (Expansion | undefined)[] {
      return [
        undefined,
        ...this.$store.state.setup.expansions
      ]
    },
  },
  methods: {
    selectCivilization(name : CivilizationName) {
      this.civilizationName = name
      this.$emit('update:modelValue', name as string)
    },
    listCivilizations(expansion? : Expansion) : Civilization[] {
      if (expansion == undefined) {
        return Civilizations.getForCoreBox()
      }
      else {
        return Civilizations.getForExpansion(expansion)
      }
    }
  }
})
</script>
