<template>
  <Teleport to="body">
    <div
      class="modal z-[1000]"
      :class="{ 'modal-open': isOpen }"
      role="alertdialog"
      aria-modal="true"
      @keydown.esc="respond(false)"
    >
      <div class="modal-box max-w-sm">
        <h3 v-if="options.title" class="text-lg font-semibold">{{ options.title }}</h3>
        <p class="py-2 opacity-90">{{ options.message }}</p>
        <div class="modal-action">
          <UiButton variant="ghost" @click="respond(false)">
            {{ options.cancelText ?? 'Отмена' }}
          </UiButton>
          <UiButton :variant="options.danger ? 'error' : 'primary'" @click="respond(true)">
            {{ options.confirmText ?? 'Подтвердить' }}
          </UiButton>
        </div>
      </div>
      <button type="button" class="modal-backdrop" aria-label="Отмена" @click="respond(false)" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useConfirmHost } from '@/composables/useConfirm'
import UiButton from '@/components/ui/UiButton.vue'

const { isOpen, options, respond } = useConfirmHost()
</script>
