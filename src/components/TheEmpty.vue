<template>
    <div class="empty-container">
        <a-empty image="/nodata.svg" :image-style="{ height: '200px', }">
        <template #description>
            <span class="light-text">(ノへ￣、)</span>
            <br />
            <span class="light-text">现在可是撒子都没偶</span>
        </template>
    </a-empty>
    </div>
    
</template>

<style>
.empty-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(93vh - 72px);
    /* Subtract the top and bottom paddings (36px each) */
}

.light-text {
  color: #7c7c7c; 
}
</style>