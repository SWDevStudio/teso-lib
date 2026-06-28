<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-3xl font-bold text-primary">Вести Тамриэля</h1>
      <p class="opacity-80">
        Свежие выпуски «Тамриэльского вестника» и летопись слухов по годам Четвёртой эры — всё, о
        чём говорят от Сиродила до Саммерсета.
      </p>
    </header>

    <div class="overflow-x-auto">
      <div role="tablist" class="tabs tabs-box w-max min-w-full flex-nowrap">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          role="tab"
          class="tab gap-2 whitespace-nowrap"
          :class="{ 'tab-active': activeTab === tab.id }"
          :aria-selected="activeTab === tab.id"
          @click="selectTab(tab.id)"
        >
          <UiIcon :name="tab.icon" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <HeraldFeed v-if="activeTab === 'herald'" />
    <ChroniclesFeed v-else-if="activeTab === 'chronicles'" />
    <CyclesFeed v-else />
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { IconName } from '@/components/ui/icons'
import UiIcon from '@/components/ui/UiIcon.vue'
import HeraldFeed from '@/components/HeraldFeed.vue'
import ChroniclesFeed from '@/components/ChroniclesFeed.vue'
import CyclesFeed from '@/components/CyclesFeed.vue'

type NewsTab = 'herald' | 'chronicles' | 'cycles'

const tabs: { id: NewsTab; label: string; icon: IconName }[] = [
  { id: 'herald', label: 'Вестник', icon: 'herald' },
  { id: 'chronicles', label: 'История и слухи', icon: 'chronicles' },
  { id: 'cycles', label: 'Онлайн-циклы', icon: 'cycles' },
]

const route = useRoute()
const router = useRouter()

const activeTab = ref<NewsTab>('herald')

function selectTab(tab: NewsTab) {
  activeTab.value = tab
  if (route.query.open || route.query.tab) router.replace({ query: { tab } })
}

watch(
  () => [route.query.tab, route.query.open],
  ([tab, open]) => {
    if (tab === 'herald' || tab === 'chronicles' || tab === 'cycles') {
      activeTab.value = tab
    } else if (typeof open === 'string') {
      if (open.startsWith('sluhi-')) activeTab.value = 'chronicles'
      else if (open.startsWith('vestnik-')) activeTab.value = 'herald'
      else if (open.startsWith('c2') || open === 'otchet-masterov') activeTab.value = 'cycles'
    }
  },
  { immediate: true },
)
</script>
