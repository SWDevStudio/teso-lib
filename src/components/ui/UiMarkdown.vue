<template>
  <div class="ui-markdown leading-relaxed" v-html="html" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'

const props = defineProps<{ source: string }>()

const html = computed(() => marked.parse(props.source ?? '', { async: false }) as string)
</script>

<style scoped>
.ui-markdown :deep(h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1.4rem 0 0.5rem;
  color: var(--color-primary);
}
.ui-markdown :deep(h3) {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 1rem 0 0.4rem;
}
.ui-markdown :deep(p) {
  margin: 0.65rem 0;
}
.ui-markdown :deep(ul) {
  list-style: disc;
  padding-left: 1.4rem;
  margin: 0.65rem 0;
}
.ui-markdown :deep(ol) {
  list-style: decimal;
  padding-left: 1.4rem;
  margin: 0.65rem 0;
}
.ui-markdown :deep(li) {
  margin: 0.25rem 0;
}
.ui-markdown :deep(strong) {
  font-weight: 700;
  color: var(--color-primary);
}
.ui-markdown :deep(em) {
  font-style: italic;
}
.ui-markdown :deep(blockquote) {
  border-left: 3px solid var(--color-primary);
  padding-left: 1rem;
  margin: 0.85rem 0;
  font-style: italic;
  opacity: 0.9;
}
.ui-markdown :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
}
.ui-markdown :deep(hr) {
  border: 0;
  border-top: 1px solid var(--color-base-300);
  margin: 1.2rem 0;
}
</style>
