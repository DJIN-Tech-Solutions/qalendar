<template>
  <div class="dev-header" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DevBigHeader',
});
</script>

<style lang="scss" scoped>
.dev-header {
  margin: 24px 0;
  background-color: rgba(241, 239, 239, 0.88);
  border-radius: 10px;
  border: 3px dashed darkgrey;
  height: 400px;
  width: calc(100vw - 20px);
}
</style>
