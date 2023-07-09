// 配置对象
const config = {
	title: "图库", // 标题
	openQuickerInteraction: true, // 是否启用Quicker相关交互
	openDragSort: true, // 开启拖拽排序
	initialBackgroundIndexByCard: -1, //初始背景index(-1表示不指定)
	initCardTitleState: true, // (初始)是否显示card的title
	initNSFWState: false, // (初始)NSFW模式
	initClickSwBackgroundState: false, // (初始)启用背景切换
	initLoadingCount: 50, // (初始)单次最大加载数量(10~500,10的倍数)
	initOpenScrollSnap: false, // (初始)启用滚动吸附(当所有项目加载完成后才会生效)
	maxColumn: 8, // 最大显示行数
	imgCarrier: "img", //图像载体img/canvas
	maxHeightPixelResolution: 1080, //最大高度像素分辨率(canvas生效)
};
// export {config};
