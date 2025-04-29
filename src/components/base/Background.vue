<script lang="ts" setup>
import {onBeforeUnmount, onMounted, type Ref, ref} from 'vue'

const spotsContainer: Ref = ref(null)

function createSpots() {
  spotsContainer.value.innerHTML = '';
  const colors = getComputedStyle(document.documentElement)
      .getPropertyValue('--background-spot-colors').split(', ');

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const screenArea = vw * vh;
  const baseAreaRatio = Number(getComputedStyle(document.documentElement)
      .getPropertyValue('--background-spot-area-ratio'));
  const totalSpotArea = screenArea * baseAreaRatio;
  const baseSpots = Math.sqrt(screenArea) * 0.1;
  let spotsCount = baseSpots * (0.8 + Math.random() * 0.4);
  spotsCount = Math.max(12, Math.min(Math.round(spotsCount), 25));

  for (let i = 0; i < spotsCount; i++) {
    const spot = document.createElement('div');
    spot.className = 'background-spot';
    const avgArea = totalSpotArea / spotsCount;
    const area = avgArea * (0.7 + Math.random() * 0.6);
    const size = Math.sqrt(area / Math.PI) * 2;
    const sizeVw = (size / vw) * 100 * (0.9 + Math.random() * 0.2);
    spot.style.cssText = `
            width: ${sizeVw}vw;
            height: ${sizeVw}vw;
            left: ${Math.random() * 140 - 20}%;
            top: ${Math.random() * 140 - 20}%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            animation-delay: ${Math.random() * -20}s;
        `;
    spotsContainer.value.appendChild(spot);
  }
}

let resizeTimer: number | undefined = undefined;

const handleResize = () => {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(createSpots, 200)
}

onMounted(() => {
  createSpots()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div ref="spotsContainer" class="background-container"></div>
</template>

<style lang="scss" scoped>
</style>