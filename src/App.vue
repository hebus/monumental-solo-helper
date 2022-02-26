<template>
  <Header/>

  <div id="content-container" class="container-fluid mt-5 mb-5">
    <router-view :key="$route.fullPath"/>
  </div>

  <Footer @zoomFontSize="zoomFontSize"/>

  <div class="modal" tabindex="-1" id="errorMessage">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="t('action.close')"></button>
        </div>
        <div class="modal-body">
          <div class="alert alert-danger" role="alert">{{errorMessage}}</div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{t('action.close')}}</button>
        </div>
      </div>
    </div>
  </div>

</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from '@/store'
import Header from '@/components/structure/Header.vue'
import Footer from '@/components/structure/Footer.vue'
import { Modal } from 'bootstrap'

export default defineComponent({
  name: 'App',
  components: {
    Header,
    Footer
  },
  setup() {
    const { t, locale } = useI18n({
      inheritLocale: true,
      useScope: 'global'
    })
    const store = useStore()

    store.commit('initialiseStore')
    locale.value = store.state.language
    
    const baseFontSize = ref(store.state.baseFontSize)

    return { t, store, baseFontSize }
  },
  data() {
    return {
      errorMessage: 'Error'
    }
  },
  methods: {
    zoomFontSize(payload: { baseFontSize: number }) {
      this.baseFontSize = payload.baseFontSize
      this.store.commit('zoomFontSize', this.baseFontSize)
    }
  },
  errorCaptured(err : unknown) {
    this.errorMessage = err as string
    const modal = new Modal(document.getElementById('errorMessage') as Element)
    modal.show()
  }
})
</script>

<style lang="scss">
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/utilities";
#content-container {
  font-size: calc(v-bind(baseFontSize) * $font-size-base);
  h1 { font-size: calc(v-bind(baseFontSize) * $h1-font-size); }
  h2 { font-size: calc(v-bind(baseFontSize) * $h2-font-size); }
  h3 { font-size: calc(v-bind(baseFontSize) * $h3-font-size); }
  h4 { font-size: calc(v-bind(baseFontSize) * $h4-font-size); }
  h5 { font-size: calc(v-bind(baseFontSize) * $h5-font-size); }
  h6 { font-size: calc(v-bind(baseFontSize) * $h6-font-size); }
}
</style>
