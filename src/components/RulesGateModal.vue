<template>
  <UiModal v-model="open" :title="copy.title">
    <div class="flex flex-col items-center gap-4 py-2 text-center">
      <UiIcon :name="copy.icon" :size="72" class="book text-primary" />
      <p class="text-xl font-bold text-primary">{{ copy.headline }}</p>
      <p class="opacity-70">{{ copy.subtitle }}</p>
    </div>
    <template #actions>
      <UiButton block @click="accept">{{ copy.button }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRulesGateStore } from '@/stores/rulesGate'
import type { IconName } from '@/components/ui/icons'
import UiModal from '@/components/ui/UiModal.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiIcon from '@/components/ui/UiIcon.vue'

interface GateCopy {
  title: string
  icon: IconName
  headline: string
  subtitle: string
  button: string
}

const router = useRouter()
const gate = useRulesGateStore()

const open = computed({
  get: () => gate.open,
  set: (value: boolean) => {
    if (!value) gate.dismiss()
  },
})

const RULES_GATE_CUTOFF = new Date(2026, 6, 5)
const isBeforeCutoff = new Date() < RULES_GATE_CUTOFF

const copy: GateCopy = isBeforeCutoff
  ? {
      title: 'Постой, авантюрист',
      icon: 'rules',
      headline: 'Ты действительно собрался учить правила до игры?',
      subtitle: 'Невиданное прилежание для смертного. Летописец впечатлён — и слегка встревожен.',
      button: 'Да, я зубрила',
    }
  : {
      title: 'Поздно, авантюрист',
      icon: 'chronicles',
      headline: 'Правило нужно было учить до игры',
      subtitle: 'Игра уже идёт, а ты только засел за свод? Что ж, читай — на руинах своих надежд.',
      button: 'Ладно, открыть правила',
    }

function accept() {
  const path = gate.pendingPath
  gate.accept()
  router.push(path)
}
</script>

<style scoped>
.book {
  transform-origin: center;
  animation: book-wiggle 1.6s ease-in-out infinite;
}

@keyframes book-wiggle {
  0%,
  100% {
    transform: rotate(-8deg);
  }
  50% {
    transform: rotate(8deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .book {
    animation: none;
  }
}
</style>
