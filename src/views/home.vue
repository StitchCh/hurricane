<template>
  <v-app-bar :elevation="2" color="primary">
    <v-app-bar-title>狂飙计算器</v-app-bar-title>
    <v-btn append-icon="mdi-pencil" @click="toChangeRootRate">
      底注：{{ rootRate }}
    </v-btn>
  </v-app-bar>
  <v-main>
    <div class="h-full flex flex-col gap-2 p-2">
      <v-card v-for="item in list" :key="item.id" class="flex-1 flex flex-col" variant="outlined" :color="current[item.id].ting ? 'primary' : ''">
        <v-card-title>
          <div class="flex items-center gap-4">
            <v-avatar color="primary">{{ item.avatar }}</v-avatar>
            <input type="text" class="outline-none" v-model="item.name" @blur="changeName" />
            <div class="flex-1"></div>
            <v-btn variant="outlined" color="primary" :disabled="current.end || current[item.id].ting" @click="handleTing(item.id)">听牌</v-btn>
          </div>
        </v-card-title>
        <v-card-item class="flex-1">
          <div class="flex">
            <div class="flex-1 flex flex-col items-center">
              <div class="h-8">杠 x{{ Math.log2(current[item.id].rate) }}</div>
              <div class="h-8">倍率 x{{ current[item.id].rate }}</div>
              <v-btn variant="outlined" color="primary" :disabled="current.end || current[item.id].quit" @click="handleChangeRate(item.id)">开杠</v-btn>
            </div>
            <div v-for="val in list.filter(v => v.id !== item.id)" :key="val.id" class="flex-1 flex flex-col items-center">
              <div class="h-8">{{ val.name }}</div>
              <div class="h-8" :class="{ 'text-red': current[item.id][val.id] < 0, 'text-green': current[item.id][val.id] > 0 }">{{ current[item.id][val.id] === 0 ? '--' : current[item.id][val.id] < 0 ? '输' : '赢' }} {{ current[item.id][val.id] !== 0 ? Math.abs(current[item.id][val.id]) * rootRate : '' }}</div>
              <v-btn variant="tonal" color="primary" :disabled="current.end || !current[item.id].ting || current[val.id].quit || current[item.id].quit" @click="handleEat(item.id, val.id)">吃胡</v-btn>
            </div>
            <div class="flex-1 flex flex-col items-center">
              <div class="h-8">合计</div>
              <div class="h-8" :class="{ 'text-red': current[item.id].total() < 0, 'text-green': current[item.id].total() > 0 }">{{ current[item.id].total() === 0 ? '--' : current[item.id].total() < 0 ? '输' : '赢' }} {{ current[item.id].total() !== 0 ? Math.abs(current[item.id].total()) * rootRate : '' }}</div>
              <v-btn variant="flat" color="primary" :disabled="current.end || !current[item.id].ting || current[item.id].quit" @click="handleSelf(item.id)">自摸</v-btn>
            </div>
          </div>
        </v-card-item>
      </v-card>
    </div>
  </v-main>
  <v-bottom-navigation grow color="primary">
    <v-btn :disabled="history.length <= 1" @click="undo">
      <v-icon>mdi-undo</v-icon>

      <span>撤销</span>
    </v-btn>

    <v-btn @click="historyVisible = true">
      <v-icon>mdi-history</v-icon>

      <span>历史记录</span>
    </v-btn>

    <v-btn @click="toEnd">
      <v-icon>mdi-calculator</v-icon>

      <span>结算</span>
    </v-btn>

    <v-btn @click="init">
      <v-icon>mdi-new-box</v-icon>

      <span>新游戏</span>
    </v-btn>
  </v-bottom-navigation>

  <v-dialog
    v-model="rootRateForm.visible"
    width="80vw"
  >
    <v-card>
      <v-card-title>更改底注</v-card-title>
      <v-card-text>
        <v-text-field variant="outlined" v-model="rootRateForm.value" />
      </v-card-text>
      <v-card-actions>
        <v-btn variant="outlined" block @click="rootRateForm.visible = false">关闭</v-btn>
      </v-card-actions>
      <v-card-actions>
        <v-btn variant="flat" color="primary" block @click="handleChangeRootRate">保存</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="quitForm.visible"
    persistent
    width="80vw"
  >
    <v-card>
      <v-card-title>{{ list.find(v => v.id === quitForm.id)?.name }}是否跑路？</v-card-title>
      <v-card-actions>
        <v-btn variant="outlined" block @click="quitForm.visible = false">否</v-btn>
      </v-card-actions>
      <v-card-actions>
        <v-btn variant="flat" color="primary" block @click="handleQuit">是</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="report.visible"
    persistent
    width="80vw"
  >
    <v-card>
      <v-card-title>结算</v-card-title>
      <v-card-text>
        <p v-for="id in ids" :key="id">
          <span>{{ list.find(v => v.id === id)?.name }}</span>
          <span class="mx-1" :class="{ 'text-red': current[id].total() < 0, 'text-green': current[id].total() > 0 }"> {{ current[id].total() === 0 ? '白玩' : current[id].total() < 0 ? '输' : '赢' }}</span>
          <span v-if="current[id].total() !== 0"> {{ Math.abs(current[id].total()) * rootRate }}</span>
        </p>
        <p class="whitespace-pre-wrap">{{ getText(report.text) }}</p>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="outlined" block @click="report.visible = false">关闭</v-btn>
      </v-card-actions>
      <v-card-actions>
        <v-btn variant="flat" color="primary" block @click="init">新游戏</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-dialog
    v-model="historyVisible"
    persistent
    width="80vw"
  >
    <v-card>
      <v-card-title>历史记录</v-card-title>
      <v-card-text>
        <ol>
          <li v-for="item in history" :key="item.id">{{ getText(item.commit) }}</li>
        </ol>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="outlined" block @click="historyVisible = false">关闭</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

defineOptions({
  name: 'home-page'
})

const rootRate = ref(1)
const rootRateForm = reactive({
  visible: false,
  value: 0
})

type Ids = 'e' | 's' | 'w' | 'n'
const ids = ['e', 's', 'w', 'n'] as const

class StateItem {
  e: number
  s: number
  w: number
  n: number
  rate: number
  ting: boolean
  win: number
  quit: boolean
  constructor (props?: {
    e?: number
    s?: number
    w?: number
    n?: number
    rate?: number
    ting?: boolean
    win?: number
    quit?: boolean
  }) {
    this.e = props?.e || 0
    this.s = props?.s || 0
    this.w = props?.w || 0
    this.n = props?.n || 0
    this.rate = props?.rate || 1
    this.ting = props?.ting || false
    this.win = props?.win || 0
    this.quit = props?.quit || false
  }

  total() {
    return this.e + this.s + this.w + this.n
  }
}

class State {
  id = Symbol()
  e: StateItem
  s: StateItem
  w: StateItem
  n: StateItem
  end: boolean
  commit: string

  constructor (props?: {
    e?: StateItem
    s?: StateItem
    w?: StateItem
    n?: StateItem
    end?: boolean
    commit?: string
  }) {
    this.e = props?.e || new StateItem()
    this.s = props?.s || new StateItem()
    this.w = props?.w || new StateItem()
    this.n = props?.n || new StateItem()
    this.end = props?.end || false
    this.commit = props?.commit || ''
  }
}

const list = reactive<{ id: Ids; name: string; avatar: string }[]>([
  {
    id: 'e',
    name: '东',
    avatar: '东'
  },
  {
    id: 's',
    name: '南',
    avatar: '南'
  },
  {
    id: 'w',
    name: '西',
    avatar: '西'
  },
  {
    id: 'n',
    name: '北',
    avatar: '北'
  }
])

const historyVisible = ref(false)
const history = reactive([ new State() ])

const current = computed(() => history[history.length - 1])

const toChangeRootRate = () => {
  rootRateForm.value = rootRate.value
  rootRateForm.visible = true
}
const handleChangeRootRate = () => {
  rootRate.value = rootRateForm.value
  localStorage.setItem('rootRate', rootRate.value + '')
  rootRateForm.visible = false
}

const changeName = () => {
  localStorage.setItem('list', JSON.stringify(list.map(v => v.name)))
}

const undo = () => {
  history.pop()
}

const handleTing = (id: Ids) => {
  history.push(new State({
    ...current.value,
    [id]: new StateItem({ ...current.value[id], ting: true }),
    commit: `${id} 听牌`
  }))
}

const handleChangeRate = (id: Ids) => {
  history.push(new State({
    ...current.value,
    [id]: new StateItem({ ...current.value[id], rate: current.value[id].rate * 2 }),
    commit: `${id} 开杠`
  }))
}

const handleEat = (from: Ids, to: Ids) => {
  const fromState = current.value[from]
  const toState = current.value[to]
  const win = fromState.win + 1
  const num = fromState.rate
  history.push(new State({
    ...current.value,
    [from]: new StateItem({ ...fromState, [to]: fromState[to] + num, win }),
    [to]: new StateItem({ ...toState, [from]: toState[from] - num }),
    commit: `${from} 吃胡 ${to}`
  }))
  if (win === 2) toQuit(from)
}

const handleSelf = (id: Ids) => {
  const state = current.value[id]
  const win = state.win + 1
  const num = state.rate * 2
  const props = {...current.value, commit: `${id} 自摸`}
  props[id] = new StateItem({ ...props[id], win })
  ids.filter(k => k !== id).forEach(k => {
    if (props[k].quit) return
    props[k] = new StateItem({ ...props[k], [id]: props[k][id] - num })
    props[id][k] = props[id][k] + num
  })
  history.push(new State(props))
  if (win === 2) toQuit(id)
}

const quitForm = reactive<{
  id: Ids
  visible: boolean
}>({
  id: 'e',
  visible: false
})
const toQuit = (id: Ids) => {
  quitForm.id = id
  quitForm.visible = true
}
const handleQuit = () => {
  const id = quitForm.id
  history.push(new State({
    ...current.value,
    [id]: new StateItem({ ...current.value[id], quit: true }),
    commit: `${id} 跑路`
  }))
  quitForm.visible = false
}

const notTing = (id: Ids) => {
  const props = { ...current.value, commit: `${id} 未听牌` }
  props[id] = new StateItem({ ...props[id] })
  ids.filter(k => k !== id).forEach(k => {
    const num = props[k].rate * 2
    props[k] = new StateItem({ ...props[k], [id]: props[k][id] + num })
    props[id][k] = props[id][k] - num
    props.commit += `，赔 ${k} ${num} * rootRate`
  })
  history.push(new State(props))
}

const report = reactive({
  visible: false,
  text: ''
})
const toEnd = () => {
  if (!current.value.end) {
    ids.forEach(id => {
      if (!current.value[id].ting) notTing(id)
    })
    current.value.end = true
  }
  toReport()
}
const toReport = () => {
  const totals = ids.map(id => ({
    id,
    total: current.value[id].total()
  }))
  if (totals.every(v => v.total === 0)) report.text = '平局'
  else {
    const length = totals.filter(v => v.total > 0).length
    totals.sort((a, b) => a.total - b.total)
    if (length === 1) {
      report.text = ids.filter(id => id !== totals[totals.length - 1].id).map(id => {
        const u = totals.find(v => v.id === id)
        if (!u || u.total === 0) return ''
        return `${id} 向 ${totals[totals.length - 1].id} 赔 ${Math.abs(u.total) * rootRate.value }`
      }).filter(v => v).join('\n')
    }
    else if (length === 3) {
      report.text = ids.filter(id => id !== totals[0].id).map(id => {
        const u = totals.find(v => v.id === id)
        if (!u || u.total === 0) return ''
        return `${totals[0].id} 向 ${id} 赔 ${Math.abs(u.total) * rootRate.value }`
      }).filter(v => v).join('\n')
    }
    else if (length === 2) {
      if (Math.abs(totals[2].total) > Math.abs(totals[1].total)) {
        report.text = [
          totals[1].total ? `${totals[1].id} 向 ${totals[2].id} 赔 ${Math.abs(totals[1].total) * rootRate.value}` : '',
          Math.abs(totals[2].total) -  Math.abs(totals[1].total) ? `${totals[0].id} 向 ${totals[2].id} 赔 ${(Math.abs(totals[2].total) -  Math.abs(totals[1].total)) * rootRate.value}` : '',
          totals[3].total ? `${totals[0].id} 向 ${totals[3].id} 赔 ${Math.abs(totals[3].total) * rootRate.value}` : ''
        ].filter(v => v).join('\n')
      } else {
        report.text = [
          totals[0].total ? `${totals[0].id} 向 ${totals[3].id} 赔 ${Math.abs(totals[0].total) * rootRate.value}` : '',
          Math.abs(totals[3].total) -  Math.abs(totals[0].total) ? `${totals[1].id} 向 ${totals[3].id} 赔 ${(Math.abs(totals[3].total) -  Math.abs(totals[0].total)) * rootRate.value}` : '',
          totals[2].total ? `${totals[1].id} 向 ${totals[2].id} 赔 ${Math.abs(totals[2].total) * rootRate.value}` : ''
        ].filter(v => v).join('\n')
      }
    }
  }
  report.visible = true
}

const getText = (txt: string) => {
  ids.forEach(id => {
    txt = txt.replace(new RegExp(id, 'gm'), list.find(v => v.id === id)?.name || '')
  })
  txt = txt.replace('rootRate', rootRate.value + '')
  return txt
}

const init = () => {
  report.visible = false
  rootRate.value = Number(localStorage.getItem('rootRate')) || 1
  const nameList = JSON.parse(localStorage.getItem('list') || `["东", "南", "西", "北"]`)
  list.forEach((v, i) => {
    v.name = nameList[i]
  })
  history.length = 1
}

init()
</script>
