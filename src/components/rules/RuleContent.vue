<template>
  <div class="rule-prose" v-html="html" />
</template>

<script setup lang="ts">
defineProps<{ html: string }>()
</script>

<style scoped>
.rule-prose {
  font-size: 1.0625rem;
  line-height: 1.7;
}
.rule-prose :deep(p) {
  margin: 0.55rem 0;
}
.rule-prose :deep(ul),
.rule-prose :deep(ol) {
  margin: 0.55rem 0;
  padding-left: 1.4rem;
}
.rule-prose :deep(ul) {
  list-style: disc;
}
.rule-prose :deep(ol) {
  list-style: decimal;
}
.rule-prose :deep(li) {
  margin: 0.35rem 0;
}
.rule-prose :deep(strong) {
  font-weight: 700;
  color: var(--color-primary);
}
.rule-prose :deep(em) {
  font-style: italic;
}
.rule-prose :deep(h3),
.rule-prose :deep(h4) {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 1rem 0 0.4rem;
  color: var(--color-primary);
}
.rule-prose :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
}
.rule-prose :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin: 0.4rem 0;
}
.rule-prose :deep(table) {
  display: block;
  width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  margin: 0.75rem 0;
  font-size: 0.95rem;
}
.rule-prose :deep(th),
.rule-prose :deep(td) {
  border: 1px solid var(--color-base-300);
  padding: 0.4rem 0.6rem;
  text-align: left;
  vertical-align: top;
}
.rule-prose :deep(th) {
  background: color-mix(in oklab, var(--color-primary) 12%, transparent);
}
.rule-prose :deep(.rule-callout) {
  border-left: 4px solid var(--color-primary);
  background: color-mix(in oklab, var(--color-primary) 8%, transparent);
  padding: 0.6rem 0.85rem;
  border-radius: 0.4rem;
  margin: 0.75rem 0;
}
.rule-prose :deep(.rule-callout > p:first-child) {
  margin-top: 0;
}
.rule-prose :deep(.rule-callout > p:last-child) {
  margin-bottom: 0;
}
</style>
