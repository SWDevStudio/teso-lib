<template>
  <span class="glyph-text" :style="{ fontFamily: font }">{{ text }}</span>
</template>

<script setup lang="ts">
defineProps<{ text: string; font: string }>()
</script>

<style scoped>
.glyph-text {
  text-transform: uppercase;
  line-height: 1.1;
  font-weight: 400;
}
</style>
