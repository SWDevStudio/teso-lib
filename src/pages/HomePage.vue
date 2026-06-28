<template>
  <div class="space-y-8">
    <header class="space-y-3">
      <p class="text-sm uppercase tracking-[0.3em] text-primary">Кодекс Тамриэля</p>
      <h1 class="text-4xl font-bold md:text-5xl">Свод знаний Старшего Народа</h1>
      <p class="max-w-2xl opacity-80">
        Мы, альтмеры, помним истину о Мундусе яснее прочих рас. Здесь собрано то, что низшие народы
        давно исказили — выбери раздел и внемли голосу высокого эльфа.
      </p>
    </header>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <RouterLink
        v-for="card in navCards"
        :key="card.routeName"
        :to="{ name: card.routeName }"
        class="h-full"
      >
        <UiCard clickable class="h-full">
          <div class="flex items-center gap-4">
            <UiIcon :name="card.icon" :size="40" class="shrink-0 text-primary" />
            <div class="min-w-0 grow">
              <h3 class="card-title">{{ card.title }}</h3>
              <p class="text-base opacity-80">{{ card.description }}</p>
            </div>
          </div>
        </UiCard>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { navCards } from '@/assets/data/navigation'
import UiCard from '@/components/ui/UiCard.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
</script>
