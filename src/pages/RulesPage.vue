<template>
  <section class="space-y-6">
    <header class="space-y-2">
      <h1 class="text-3xl font-bold text-primary">Правила</h1>
    </header>

    <div
      class="flex flex-col items-center gap-4 rounded-box border border-dashed border-base-300 p-10 text-center"
    >
      <UiIcon name="rules" :size="56" class="opacity-40" />
      <p class="text-xl font-semibold">Здесь будут правила</p>
      <p class="max-w-md opacity-70">Ты серьёзно планировал выучить их до игры?</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import UiIcon from '@/components/ui/UiIcon.vue'
</script>
