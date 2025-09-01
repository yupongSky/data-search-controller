<template>
  <div class="table-container">
    <!-- <el-button type="primary" @click="getAlldatas">查看所有数据</el-button> -->
    <el-table :data="showData" height="100%" stripe>
      <el-table-column label="序号" type="index" width="60"></el-table-column>
      <el-table-column label="材料名称" prop="name"></el-table-column>
      <el-table-column label="材料类型" prop="type" width="100">
        <template #default="scope">
          {{ scope.row.type === "1" ? "基材" : "无磁部分" }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime"> </el-table-column>
      <el-table-column label="更新时间" prop="updateTime"> </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" type="primary" @click="handleView(scope.row)"
            >查看</el-button
          >
          <el-button size="small" @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-button type="danger" size="small" @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, toRaw, watchEffect, computed, h } from "vue";
import {
  getAllMaterial,
  getPerformance,
  deleteMaterial,
} from "../service/baseDB";
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";
const emit = defineEmits(["view", "editData"]);
const tableData = ref([]);
const props = defineProps({
  targetName: {
    type: String,
    default: "",
  },
  targetStatus: {
    type: String,
    default: "1",
  },
  toogleCreate: {
    type: Boolean,
    default: false,
  },
});

getAlldatas();

watchEffect(() => {
  if (props.toogleCreate || !props.toogleCreate) {
    getAlldatas();
  }
});

const showData = computed(() => {
  if (props.targetName && props.targetStatus) {
    return tableData.value.filter((item) => {
      return (
        item.name.toLowerCase().indexOf(props.targetName.toLowerCase()) > -1 &&
        item.type === props.targetStatus
      );
    });
  }
  return tableData.value;
});

function getTargetData() {
  getPerformance(props.targetName, props.targetStatus).then((res) => {
    tableData.value = res;
  });
}

function getAlldatas() {
  getAllMaterial().then((res) => {
    tableData.value = res;
  });
}

function handleView(row) {
  console.log("🚀 ~ handleView ~ row:", row);
  emit("view", toRaw(row));
}

function handleEdit(row) {
  console.log("🚀 ~ handleEdit ~ row:", row);
  emit("editData", toRaw(row));
}

function handleDelete(row) {
  console.log("🚀 ~ handleDelete ~ row:", row);
  ElMessageBox.alert(
    `确认删除吗?`,
    `删除${row.name}-${row.type === "1" ? "基材" : "无磁部分"}`,
    {
      confirmButtonText: "确认删除",
      callback: (action) => {
        console.log("🚀 ~ handleDelete ~ action:", action);
        if (action === "confirm") {
          deleteMaterial(row.name, row.type).then((res) => {
            getAlldatas();
            ElMessage({
              type: "success",
              message: "删除成功",
            });
          });
        }
      },
    }
  );
}
</script>

<style lang="scss" scoped>
.table-container {
  height: 100%;
}
</style>
