<template>
  <div class="file-list">
    <div class="img-prevew" v-for="(item, index) in fileList" :key="index">
      <img :src="item.dataUrl" alt="Preview Image" style="width: 100%" />
      <el-button
        type="danger"
        :icon="RemoveFilled"
        @click="handleRemove(index)"
        circle
        size="small"
      >
      </el-button>
    </div>
  </div>
  <el-button type="primary" @click="openFileSelector">添加图片</el-button>
  <el-dialog v-model="dialogVisible" :append-to-body="true" style="width: 60%">
    <img :src="dialogImageUrl" alt="Preview Image" style="width: 100%" />
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { RemoveFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
const emit = defineEmits(["change"]);
const fileList = ref([]);
const props = defineProps({
  editData: {
    type: Array,
    default: () => [],
  },
});
onMounted(() => {
  console.log("🚀 ~ imgpreview props.editData:", props.editData);
  fileList.value = props.editData;
});
const dialogImageUrl = ref("");
const dialogVisible = ref(false);

// 请求主进程打开文件选择器
const openFileSelector = () => {
  console.log("打开文件选择器...");
  if (window.electronAPI && window.electronAPI.openFileSelector) {
    window.electronAPI.openFileSelector().then((res) => {
      console.log("🚀 ~ openFileSelector ~ res:", res);
      fileList.value = fileList.value.concat(res);
    });
  } else {
    console.error("electronAPI.openFileSelector is not available");
    console.log("无法打开文件选择器: API不可用");
  }
};

function handleRemove(index) {
  fileList.value.splice(index, 1);
}
watch(fileList, (newVal) => {
  console.log("🚀 ~imagepreview newVal:", newVal);
  emit(
    "change",
    newVal.map((item) => {
      return {
        name: item.name,
        type: item.type,
        dataUrl: item.dataUrl,
      };
    })
  );
});

onMounted(() => {});

onUnmounted(() => {});
</script>

<style lang="scss" scoped>
.file-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.img-prevew {
  width: 120px;
  height: 120px;
  border-radius: 10px;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-right: 10px;
  margin-bottom: 10px;
  .el-button {
    position: absolute;
    top: -5px;
    right: -5px;
  }
}
</style>
