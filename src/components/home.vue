<template>
  <div class="home">
    <div class="search-bar">
      <input type="text" placeholder="搜索" />
    </div>

    <div class="import-section">
      <button @click="openFileSelector" class="import-btn">导入文件</button>

      <div
        v-if="importProgress > 0 && importProgress < 100"
        class="progress-container"
      >
        <div
          class="progress-bar"
          :style="{ width: importProgress + '%' }"
        ></div>
        <span class="progress-text">{{ importProgress }}%</span>
      </div>

      <div v-if="importStatus" class="status-message">{{ importStatus }}</div>
    </div>

    <div class="image-preview-container" v-if="importedImages.length > 0">
      <h3>已导入图片</h3>
      <div class="image-grid">
        <div
          v-for="(image, index) in importedImages"
          :key="index"
          class="image-item"
        >
          <img :src="image.url" :alt="image.name" class="preview-image" />
          <p class="image-name">{{ image.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from "vue";

// 状态管理
const importProgress = ref(0);
const importStatus = ref("");
const importedImages = ref([]);
const fileInput = ref(null);

// 请求主进程打开文件选择器
const openFileSelector = () => {
  importStatus.value = "打开文件选择器...";
  if (window.electronAPI && window.electronAPI.openFileSelector) {
    window.electronAPI.openFileSelector();
  } else {
    console.error("electronAPI.openFileSelector is not available");
    importStatus.value = "无法打开文件选择器: API不可用";
  }
};

// 获取图片URL的方法
const getImageUrl = (fileName) => {
  if (window.electronAPI && window.electronAPI.getImageDataUrl) {
    return window.electronAPI
      .getImageDataUrl(fileName)
      .then((url) => {
        console.log("🚀 ~ getImageUrl ~ url:", url);
        return url;
      })
      .catch((error) => {
        console.error("Failed to get image URL:", error);
        return "";
      });
  }
  return Promise.resolve("");
};

// 组件挂载时
onMounted(() => {
  console.log("Checking electronAPI:", window.electronAPI);
  if (window.electronAPI) {
    console.log("electronAPI is available");
  } else {
    console.log("electronAPI is undefined");
  }

  // 添加文件选择结果监听器
  const fileSelectCallback = (files) => {
    if (files && files.length > 0) {
      importStatus.value = "开始导入...";
      importProgress.value = 0;
      importedImages.value = [];
      window.electronAPI.importImages(files);
    }
  };

  // 设置其他事件监听器
  const progressCallback = (progress) => {
    importProgress.value = progress;
  };

  const statusCallback = (status) => {
    console.log("🚀 ~ statusCallback ~ status:", status);
    importStatus.value = status;
  };

  const completeCallback = (images) => {
    console.log("🚀 ~ completeCallback ~ images:", images);
    const allImags = [];
    images.forEach((image) => {
      const imgData = {};
      getImageUrl(image.name).then((url) => {
        imgData.name = image.name;
        imgData.url = url;
        allImags.push(imgData);
      });
    });
    console.log("🚀 ~ completeCallback ~ allImags:", allImags);

    importedImages.value = importedImages.value.concat(allImags);
  };

  const imagesCallback = (images) => {
    console.log("🚀 ~ imagesCallback ~ images:", images);
    const allImags = [];
    images.forEach((image) => {
      const imgData = {};
      getImageUrl(image.name).then((url) => {
        imgData.name = image.name;
        imgData.url = url;
        allImags.push(imgData);
      });
    });
    console.log("🚀 ~ imagesCallback ~ allImags:", allImags);

    importedImages.value = allImags;
  };

  // 监听主进程事件
  if (window.electronAPI) {
    window.electronAPI.onFileSelectResult(fileSelectCallback);
    window.electronAPI.onImportProgress(progressCallback);
    window.electronAPI.onImportStatus(statusCallback);
    window.electronAPI.onImportComplete(completeCallback);
    window.electronAPI.onImportedImages(imagesCallback);

    console.log("onmouted....");
  }

  // 组件卸载时清理监听器
  onUnmounted(() => {
    if (window.electronAPI) {
      window.electronAPI.removeFileSelectResult(fileSelectCallback);
      window.electronAPI.removeImportProgress(progressCallback);
      window.electronAPI.removeImportStatus(statusCallback);
      window.electronAPI.removeImportComplete(completeCallback);
      window.electronAPI.removeImportedImages(imagesCallback);
    }
  });
});
</script>

<style lang="scss" scoped>
.home {
  background-color: #232323;
  color: white;
  min-height: 100vh;
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
  input {
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 4px;
    background-color: #333;
    color: white;
  }
}

.import-section {
  margin-bottom: 30px;
}

.import-btn {
  background-color: #4caf50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
}

.progress-container {
  width: 100%;
  height: 20px;
  background-color: #333;
  border-radius: 10px;
  margin-top: 10px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s;
}

.progress-text {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  font-size: 12px;
  line-height: 20px;
}

.status-message {
  margin-top: 10px;
  padding: 10px;
  border-radius: 4px;
  background-color: #333;
}

.image-preview-container {
  margin-top: 30px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.image-item {
  background-color: #333;
  border-radius: 4px;
  overflow: hidden;
  padding: 10px;
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 150px;
  object-fit: contain;
  border-radius: 4px;
}

.image-name {
  margin-top: 10px;
  font-size: 14px;
  color: #ccc;
}
</style>
