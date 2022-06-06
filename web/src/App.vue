<template>
  <div id="app">
    <el-scrollbar style="height: 100%">
      <router-view/>
    </el-scrollbar>
  </div>
</template>

<style lang="less">
@import url(assets/css/main);

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  height: 100%;
}

.el-scrollbar__wrap {
  overflow-x: hidden;
}

.el-scrollbar__view {
  height: 100%;
}
</style>
