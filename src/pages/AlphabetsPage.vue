<template>
  <section class="space-y-8">
    <header class="space-y-4">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="space-y-2">
          <h1 class="text-3xl font-bold text-primary">Алфавиты Тамриэля</h1>
          <p class="max-w-prose opacity-80">
            Всеобщая речь у всех народов одна на слух, но на письме каждый из старших народов
            оставил своё начертание. Здесь собраны четыре древних письмена: разбери их буквы или
            впиши слово всеобщим — и увидишь, как оно ляжет рукою айлейдов, двемеров, данмеров и
            драконов.
          </p>
        </div>
        <UiButton variant="primary" outline size="sm" @click="originalOpen = true">
          <UiIcon name="image" />
          Посмотреть оригинал
        </UiButton>
      </div>
    </header>

    <UiCard v-if="translatorUnlocked">
      <div class="space-y-4">
        <div class="space-y-1">
          <h2 class="text-lg font-semibold">Начертай по-древнему</h2>
          <p class="text-sm opacity-70">
            Впиши слово или имя — и узри его в каждом из письмён старших народов.
          </p>
        </div>

        <label class="input flex w-full items-center gap-2">
          <UiIcon name="edit" class="opacity-60" />
          <input
            v-model="sample"
            type="text"
            maxlength="40"
            class="grow"
            placeholder="Тамриэль"
            aria-label="Текст для начертания"
          />
        </label>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div
            v-for="alphabet in alphabets"
            :key="alphabet.id"
            class="space-y-1.5 rounded-md border border-base-300 bg-base-200 px-3 py-2.5"
          >
            <div class="flex items-center gap-2 text-sm opacity-70">
              <UiIcon :name="alphabet.icon" :size="16" class="text-primary" />
              {{ alphabet.name }}
            </div>
            <GlyphText
              :text="sampleText"
              :font="alphabet.font"
              class="block break-words text-3xl text-primary"
            />
          </div>
        </div>
      </div>
    </UiCard>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <button
        v-for="alphabet in alphabets"
        :key="alphabet.id"
        type="button"
        class="h-full w-full text-left"
        @click="open(alphabet)"
      >
        <UiCard clickable class="h-full">
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <UiIcon :name="alphabet.icon" :size="28" class="shrink-0 text-primary" />
              <div class="min-w-0">
                <h2 class="text-xl font-semibold">{{ alphabet.name }}</h2>
                <p class="text-base opacity-80">{{ alphabet.peoples }} · {{ alphabet.region }}</p>
              </div>
            </div>

            <GlyphText
              :text="alphabet.sampleWord"
              :font="alphabet.font"
              class="block break-words text-4xl text-primary"
            />

            <p class="line-clamp-2 opacity-90">{{ alphabet.shortDesc }}</p>
          </div>
        </UiCard>
      </button>
    </div>

    <UiModal v-model="modalOpen" :title="selected?.name">
      <div v-if="selected" class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <UiBadge color="primary" size="sm">{{ selected.langName }}</UiBadge>
          <UiBadge color="neutral" size="sm">{{ selected.nameEn }}</UiBadge>
        </div>

        <p class="italic opacity-80">{{ selected.oneLine }}</p>

        <dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt class="text-sm font-semibold uppercase tracking-wide opacity-70">Народ</dt>
            <dd>{{ selected.peoples }}</dd>
          </div>
          <div>
            <dt class="text-sm font-semibold uppercase tracking-wide opacity-70">Земли</dt>
            <dd>{{ selected.region }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-sm font-semibold uppercase tracking-wide opacity-70">Эпоха</dt>
            <dd>{{ selected.era }}</dd>
          </div>
        </dl>

        <div class="space-y-2">
          <h4 class="text-sm font-semibold uppercase tracking-wide opacity-70">Начертания</h4>
          <AlphabetTable :font="selected.font" @glyph-click="onGlyphClick" />
        </div>

        <div class="divider my-1" />

        <UiMarkdown :source="selected.fullText" />
      </div>
    </UiModal>

    <UiModal v-model="originalOpen" title="Свод письмён — оригинал">
      <img
        :src="referenceImage"
        alt="Сводная таблица алфавитов Айлейдис, Двемерского, Даэдрического и Драконьего"
        class="mx-auto w-full max-w-full rounded-md border border-base-300"
      />
    </UiModal>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { alphabets, type Alphabet } from '@/assets/data/alphabets'
import referenceImage from '@/assets/alphabets-reference.png'
import UiIcon from '@/components/ui/UiIcon.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiModal from '@/components/ui/UiModal.vue'
import UiMarkdown from '@/components/ui/UiMarkdown.vue'
import GlyphText from '@/components/GlyphText.vue'
import AlphabetTable from '@/components/AlphabetTable.vue'
import { useAutoTranslator } from '@/composables/useAutoTranslator'
import { useConfirm } from '@/composables/useConfirm'

const sample = ref('')
const sampleText = computed(() => sample.value.trim() || 'Тамриэль')

const { translatorUnlocked, toggle } = useAutoTranslator()
const { confirm } = useConfirm()
const secretTaps = ref(0)

const selected = ref<Alphabet | null>(null)
const originalOpen = ref(false)

const modalOpen = computed({
  get: () => selected.value !== null,
  set: (value: boolean) => {
    if (!value) selected.value = null
  },
})

function open(alphabet: Alphabet) {
  selected.value = alphabet
  secretTaps.value = 0
}

function onGlyphClick(char: string) {
  if (selected.value?.id !== 'daedric') return
  if (char !== 'А') {
    secretTaps.value = 0
    return
  }
  secretTaps.value += 1
  if (secretTaps.value < 5) return
  secretTaps.value = 0
  const wasUnlocked = translatorUnlocked.value
  toggle()
  void confirm({
    title: wasUnlocked ? 'Автопереводчик сокрыт' : 'Открыт автопереводчик',
    message: wasUnlocked
      ? 'Ты вновь пять раз коснулся даэдрической «А» — и переводчик сокрылся, будто его и не было. Позовёшь его тем же тайным касанием.'
      : 'Ты пять раз коснулся даэдрической «А» — и древний знак поддался. В разделе «Алфавиты» открыт переводчик: впиши слово всеобщим — и узри его рукою айлейдов, двемеров, данмеров и драконов.',
    confirmText: wasUnlocked ? 'Пусть будет так' : 'Отлично',
    hideCancel: true,
  })
}

const route = useRoute()

watch(
  () => route.query.open,
  (id) => {
    if (typeof id !== 'string') return
    const alphabet = alphabets.find((item) => item.id === id)
    if (alphabet) open(alphabet)
  },
  { immediate: true },
)
</script>
