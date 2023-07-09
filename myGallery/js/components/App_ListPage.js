// import {AppList} from "./App_List.js";
// import {AppBackGroundBoard} from "./App_BackGroundBoard.js";
// import {AppZoomBar} from "./App_ZoomBar.js";
// import {AppNavBar} from "./App_NavBar.js";
// import {AppHeaderBar} from "./App_HeaderBar.js";
// import {config} from "../config.js";
//listPage的定义
const AppListPage = {
	// 导入组件
	components: {
		AppList,
		AppBackGroundBoard,
		AppZoomBar,
		AppNavBar,
		AppHeaderBar,
	},
	// listPage的模板框架
	template: /*html*/ `
  <!-- 背景板 -->
  <app-back-ground-board ref="backGroundBoard"
		:cardInfoList="cardInfoList"
    :regex="regex"
  ></app-back-ground-board>
  <!-- 页面头部 -->
  <app-header-bar
    :title="title"
    :allCount="cardInfoList.length"
    :nowCount="listInfo.loadedCardSet.size"
  ></app-header-bar>
  <!-- 中间主体区域 -->
  <div class="body">
    <!-- 左侧导航栏 -->
    <app-nav-bar
      :onceLoadMaxCount="onceLoadMaxCount"
      @returnOnceLoadingMax="(value)=>{onceLoadMaxCount = value}"
      @returnBtnInfo="(value)=>{btnInfo = value}"
      @downloadRequest="downloadToQuicker"
      @toNormalMode="toNormalMode"
      @reVerifyAllCard="()=>{$refs.list.reVerifyAllCard()}"
      @allSelectRequest="(value)=>{$refs.list.selectionAll(value)}"
      @cleanSelectionRequest="()=>{$refs.list.cleanSelection()}"
      @loadingRemainingRequest="()=>{$refs.list.loadingRemaining()}"
      :loadingState="{
        nowCount:listInfo.loadedCardSet.size,
        allCount:cardInfoList.length,
      }"
      :selectingInfo="{
        nowCount:selectingInfo.tempCardSet.size
      }"
    ></app-nav-bar>
    <!-- 列表区域 -->
    <app-list ref="list"
      :cardInfoList="cardInfoList"
      :cardDefaultaspectRatio="cardDefaultaspectRatio"
      :regex="regex"
      :nowColumn="nowColumn"
      :onceLoadMaxCount="onceLoadMaxCount"
      :btnInfo="btnInfo"
      :selectingInfo="selectingInfo"
      @returnListInfo="(value)=>{listInfo = value}"
      @alterBackGroundRequest="setBackGround"
      @requestRemoveCard="removeCard"
    ></app-list>

    <!-- 右侧缩放条 -->
    <app-zoom-bar 
      :maxColumn="maxColumn"
      @returnNowColumn="(value)=>{nowColumn = value}"
    ></app-zoom-bar>
  </div>

  `,
	// 数据定义
	data() {
		return {
			title: config.title,
			openDragBlock: true,
			cardInfoList: [], // 卡片信息
			cardInfoListBackup: [], // 卡片信息备份
			cardDefaultaspectRatio: 9 / 16, // 卡片预设宽高比
			listInfo: {
				loadingQueueList: [], //* 加载队列
				visibleCardSet: new Set(),
				loadedCardSet: new Set(),
				unloadedCardSet: new Set(),
				visibleIndexListInMatched: [],
				// loadedIndexListInMatched: [],
				unloadedIndexListInMatched: [],
			}, // list信息
			selectingInfo: {
				cardSet: new Set(), // 选中的card集合
				tempCardSet: new Set(), // 临时的card集合
			}, // 选中信息
			btnInfo: {
				slowLoading: false, // 缓慢加载切换按钮
				enableSwitchBackGround: config.initClickSwBackgroundState, // "运行背景切换"切换按钮
				openScrollSnap: config.initOpenScrollSnap, // 滚动吸附切换按钮
			},
			onceLoadMaxCount: config.initLoadingCount, // 最大单次加载数量
			maxColumn: config.maxColumn, // 最大显示行数
			nowColumn: config.maxColumn / 2, // 当前显示行数
			initialBackgroundIndexByCard: config.initialBackgroundIndexByCard, // 初始背景的index
			initialBackgroundCard: null, // 用于记录初始背景卡片(用于quicker交互)
			regex: {
				// 正则表达式
				isImg: /^.+?\.(png|jpg|jpeg|gif|webp|bmp)/i, //判断是否是图片的正则表达式
				isGif: /^.+?\.(gif)/i, //判断是否是gif的正则表达式
				isVideo: /^.+?\.(mp4|avi|mov|webm|mkv|flv)/i, //判断是否是视频的正则表达式
			},
		};
	},
	methods: {
		//f 初始化
		initialization() {
			this.cardInfoListBackup = Array.from(this.cardInfoList); //* 更新备份
			//? 给每张卡片初化始信息
			this.initial_addGeneralAttributesForAllCards();
		},
		//? 给所有卡片添加通用属性
		initial_addGeneralAttributesForAllCards() {
			this.cardInfoList.forEach((card, i) => {
				card.index = i;
				//* 通用设置
				card.showUrl = card.PicUrl; //? 展示栏内容的链接向置为空
				card.metaInfoAvailable = false; //? 先标记为metaInfo无效
				card.verified = false; //? 已验证标记
				//* 默认属性
				if (card.Width > 0 && card.Height > 0) {
					//* 卡片尺寸有效：则由卡片尺寸设置卡片scale
					card.scale = card.Width / card.Height;
				} else {
					//* 卡片尺寸有效：则设置卡片为默认比例
					card.scale = this.cardDefaultaspectRatio;
				}
			});
		},
		//? 设置背景
		setBackGround(card, record = false) {
			if (card != null) {
				// console.log(card);
				// 获取适合的背景链接
				let url = null;
				if (this.regex.isImg.test(card.LinkUrl) || this.regex.isVideo.test(card.LinkUrl)) {
					url = card.LinkUrl;
				} else if (this.regex.isImg.test(card.PicUrl) || this.regex.isVideo.test(card.PicUrl)) {
					url = card.PicUrl;
				}
				// 如果背景链接不为空则执行
				if (url != null) {
					// 控制子组件backGroundBoard切换背景
					this.$refs.backGroundBoard.alterBackground(url);
					if (record) {
						// 如果需要记录为初始背景则进行记录
						this.initialBackgroundCard = card;
					}
				}
			}
		},
		//? 删除指定card
		removeCard(card) {
			let realIndex = this.cardInfoList.findIndex((innerCard) => card === innerCard);
			// console.log(realIndex);
			this.cardInfoList.splice(realIndex, 1);
			this.listInfo.loadedCardSet.delete(card);
			this.listInfo.unloadedCardSet.delete(card);
			this.selectingInfo.cardSet.delete(card);
			this.selectingInfo.tempCardSet.delete(card);
			this.$refs.list.searchInfo.matchCardSet.delete(card);
		},
		//! [Quicker交互部分]
		//? [向Quicker返回内容]
		returnToQuicker(varInQuicker, content) {
			// 注:varInQuicker必须为string类型;content类型可用为:常见类型
			chrome.webview.hostObjects.sync.v.setVar(varInQuicker, content);
		},
		//? [清单下载](Quicker)
		downloadToQuicker() {
			console.log(this.getJsonList());
			this.returnToQuicker("jsonListSelected", this.getJsonList());
			this.returnToQuicker("nextStep", "download");
			window.close();
		},
		//? [模式切换](Quicker)
		toNormalMode() {
			console.log("切换模式(Quicker)");
			this.returnToQuicker("jsonListSelected", this.getJsonList());
			this.returnToQuicker("nextStep", "switchNormalMode");
			window.close();
		},
		//? [获取当前结果的Json清单]
		getJsonList() {
			let cardList; // card列表
			if (this.selectingInfo.cardSet.size < 1) {
				// 如果所选项为空则选择全部
				cardList = this.cardInfoList;
			} else {
				// 如果所选项不为空则获取所有所选项
				cardList = [...this.selectingInfo.cardSet];
			}
			// 合成json
			let Json = "";
			for (let i = 0, len = cardList.length; i < len; i++) {
				const card = cardList[i];
				let metaInfo = {
					Width: 0,
					Height: 0,
					scale: 0,
				}; // 用于记录元信息

				// 判断元信息是否有效
				if (card.metaInfoAvailable) {
					metaInfo.Width = card.Width;
					metaInfo.Height = card.Height;
					metaInfo.scale = card.scale;
				}

				// [合成模板]
				const itemJson = `${JSON.stringify(String(card.id))}:{
          "id": ${JSON.stringify(card.id)},
          "index": ${JSON.stringify(i)},
          "Content": ${JSON.stringify(card.Content)},
          "LinkUrl": ${JSON.stringify(card.LinkUrl)},
          "PicUrl": ${JSON.stringify(card.PicUrl)},
          "urlType": ${JSON.stringify(card.urlType)},
          "urlPicType": ${JSON.stringify(card.urlPicType)},
          "Width":${JSON.stringify(metaInfo.Width)},
          "Height":${JSON.stringify(metaInfo.Height)},
          "scale":${JSON.stringify(metaInfo.scale)},
        }`;
				// 拼接
				Json += itemJson;
				if (i + 1 < cardList.length) {
					Json += ",";
				}
			}
			// 最后一对{}括号包围
			Json = `{${Json}}`;
			// 返回结果(String类型)
			// console.log(Json);
			return Json;
		},
	},
	computed: {
		
	},
	watch: {
		cardInfoList(newVal, oldVal) {
			this.cardInfoListBackup = Array.from(this.cardInfoList); //* 更新备份
			this.initial_addGeneralAttributesForAllCards();
		},
	},
	directives: {},
	updated() {},
	mounted() {
		this.initialization(); //* 初始化调用
	},
	//? 创建时进行处理
	created() {},
};
// export {AppListPage};
