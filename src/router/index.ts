import { RouteRecordRaw } from 'vue-router'
import AppHome from '@/views/AppHome.vue'
import SetupGameDifficulty from '@/views/SetupGameDifficulty.vue'
import SetupCivilization from '@/views/SetupCivilization.vue'
import RoundPlayer from '@/views/RoundPlayer.vue'
import RoundBot from '@/views/RoundBot.vue'
import EndGameScoring from '@/views/EndGameScoring.vue'
import NotFound from '@/views/NotFound.vue'
import createRouter from 'brdgm-commons/src/util/router/createRouter'
import { name } from '@/../package.json'

const LOCALSTORAGE_KEY = `${name}.route`

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'AppHome',
    component: AppHome
  },
  {
    path: '/setup/gameDifficulty',
    name: 'SetupGameDifficulty',
    component: SetupGameDifficulty
  },
  {
    path: '/setup/civilization',
    name: 'SetupCivilization',
    component: SetupCivilization
  },
  {
    path: '/round/:round/player/:player',
    name: 'RoundPlayer',
    component: RoundPlayer
  },
  {
    path: '/round/:round/bot/:bot',
    name: 'RoundBot',
    component: RoundBot
  },
  {
    path: '/scoring',
    name: 'EndGameScoring',
    component: EndGameScoring
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

export default createRouter(routes, LOCALSTORAGE_KEY, 'AppHome')