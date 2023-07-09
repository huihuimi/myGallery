const {createApp,onMounted,onBeforeMount} = Vue;
// 挂载listPage到dom中
const listPage = createApp(AppListPage);
listPage.mount("#listPage");
listPage._instance.proxy.cardInfoList = cardInfoList//* 导入信息

