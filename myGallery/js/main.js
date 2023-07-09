const {createApp} = Vue;
// 挂载listPage到dom中
const listPage = Vue.createApp(AppListPage).mount("#listPage");
listPage.cardInfoList = cardInfoList //* 导入信息