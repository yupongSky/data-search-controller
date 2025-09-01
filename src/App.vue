<script lang="ts" setup>
import { computed, ref } from "vue";

import type { TabPaneName } from "element-plus";
import { ElMessage } from "element-plus";
import CreateOrEdit from "./components/CreateOrEdit.vue";
import { getPerformance } from "./service/baseDB";
import Table from "./components/Table.vue";
import MaterialShows from "./components/MaterialShows.vue";
let tabIndex = 2;
const editableTabsValue = ref("0");
const editableTabs = ref([]);

const removeTab = (targetName: TabPaneName) => {
  console.log("🚀 ~ removeTab ~ targetName:", targetName);
  const tabs = editableTabs.value;
  let activeName = editableTabsValue.value;
  if (activeName === targetName) {
    tabs.forEach((tab, index) => {
      if (tab.name === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1];
        if (nextTab) {
          activeName = nextTab.name;
        }
      }
    });
  }
  console.log("🚀 ~ removeTab ~ activeName:", activeName);

  editableTabsValue.value = activeName;
  editableTabs.value = tabs.filter((tab) => tab.name !== targetName);
  if (!editableTabs.value.length) {
    editableTabsValue.value = "0";
  }
};

const searchName = ref("");
const searchStatus = ref("1");
const editData = ref({});
const dialogVisible = ref(false);

function addNew() {
  dialogVisible.value = true;
}

function searchMaterial() {
  getPerformance(searchName.value, searchStatus.value).then((res) => {
    console.log("🚀 ~ searchMaterial ~ res:", res);
    if (!res.length) {
      ElMessage.error("未查询到材料");
    } else {
      const data = res[0];
      handleView(data);
    }
  });
}

function handleView(data) {
  console.log("🚀 ~ handleView ...data~ row:", data);
  const tabName = `${data.name}-${data.type === "1" ? "基材" : "无磁部分"}`;
  if (editableTabs.value.find((item) => item.name === tabName)) {
    console.log(
      "🚀 ~ handleView ~ editableTabsValue.value:",
      editableTabsValue.value
    );
    editableTabsValue.value = tabName;
    return;
  }
  console.log(
    "🚀 ~ handleView ~ editableTabsValue.value:",
    editableTabsValue.value
  );
  console.log("🚀 ~ handleView ~ editableTabs.value:", editableTabs.value);

  editableTabs.value.push({
    title: tabName,
    name: tabName,
    data: data,
  });
  editableTabsValue.value = tabName;
}

function refresh() {
  searchName.value = "";
  searchStatus.value = "1";
}

function handleEdit(row) {
  console.log("🚀 ~ handleEdit ~ row:", row);
  editData.value = row;
  dialogVisible.value = true;
}

function changeSearch() {
  editableTabsValue.value = "0";
  editData.value = {};
}
</script>

<template>
  <el-watermark
    :font="font"
    content="试用版本，禁止对外！！！"
    class="app-container"
  >
    <div class="search-bar">
      <el-text>材料名称：</el-text>
      <el-input
        type="text"
        placeholder="请输入材料名称"
        style="width: 200px; margin-right: 20px"
        v-model="searchName"
        clearable
        @change="changeSearch"
      />
      <el-text>材料状态：</el-text>
      <el-select
        v-model="searchStatus"
        placeholder="请选择"
        :disabled="!searchName"
        style="width: 200px; margin-right: 20px"
        @change="changeSearch"
      >
        <el-option label="基材" value="1" />
        <el-option label="无磁部分" value="2" />
      </el-select>
      <!-- <el-button
        type="primary"
        @click="searchMaterial"
        :disabled="!searchName || !searchStatus"
        >查询材料</el-button
      > -->
      <el-button @click="addNew">新增材料</el-button>
    </div>
    <div class="box-container">
      <el-tabs
        v-model="editableTabsValue"
        type="border-card"
        class="demo-tabs"
        @tab-remove="removeTab"
      >
        <el-tab-pane label="数据总览" name="0" :closable="false">
          <template #default>
            <Table
              @view="handleView"
              @refresh="refresh"
              @editData="handleEdit"
              :targetName="searchName"
              :targetStatus="searchStatus"
              :toogleCreate="dialogVisible"
            ></Table>
          </template>
        </el-tab-pane>
        <el-tab-pane
          v-for="item in editableTabs"
          :key="item.name"
          :label="item.title"
          :name="item.name"
          closable
        >
          <MaterialShows :material="item.data"></MaterialShows>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-watermark>

  <CreateOrEdit
    :showDialog="dialogVisible"
    @close="dialogVisible = false"
    :key="Date.now()"
    :editData="editData"
    @submit="changeSearch"
  ></CreateOrEdit>
</template>

<style>
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>

<style scoped lang="scss">
.watermark {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}
.app-container {
  margin: 0 auto;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding-top: 60px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  padding-bottom: 40px;
}
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.search-bar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
p.msg {
  font-size: 16px;
  color: #ff4d4f;
  width: 100%;
  text-align: center;
}
.box-container {
  width: 90%;
  margin: 0 auto;
  margin-top: 60px;
  box-sizing: border-box;
  flex: auto;
  height: auto;
  overflow: hidden;
  border-bottom: 1px solid var(--el-border-color);
  .el-tabs,
  .el-tabs__content {
    height: 100%;
    .el-tab-pane {
      height: 100%;
      overflow: auto;
    }
  }
}
</style>
