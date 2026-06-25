<template>
  <article class="space-y-8">
    <RouterLink :to="{ name: 'home' }">
      <UiButton variant="ghost" size="sm">
        <UiIcon name="back" />
        На главную
      </UiButton>
    </RouterLink>

    <header class="space-y-6">
      <h1 class="text-3xl font-bold text-primary md:text-4xl">{{ creation.title }}</h1>
      <p class="max-w-prose border-l-4 border-primary pl-4 text-base italic opacity-80 md:text-lg">
        {{ creation.intro }}
      </p>
    </header>

    <div class="max-w-prose space-y-10">
      <section
        v-for="(section, index) in creation.sections"
        :id="'creation-' + index"
        :key="section.heading"
        class="space-y-3"
      >
        <h2 class="text-xl font-semibold text-primary md:text-2xl">{{ section.heading }}</h2>
        <UiMarkdown :source="section.body" />
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
import { nextTick, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { creation } from '@/assets/data/creation'
import UiButton from '@/components/ui/UiButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiMarkdown from '@/components/ui/UiMarkdown.vue'

const route = useRoute()

const scrollToSection = (open: unknown) => {
  if (typeof open !== 'string') return
  document.getElementById('creation-' + open)?.scrollIntoView({ block: 'start' })
}

onMounted(async () => {
  await nextTick()
  scrollToSection(route.query.open)
})

watch(() => route.query.open, scrollToSection)
</script>
