// import {config} from "../config.js";
// 导航栏定义
const AppNavBar = {
	template: /*html*/ `
  <div id="navBarBox" @contextmenu.prevent.native="(e)=>{e.preventDefault()}">
    <div id="navBarBody">
      <!-- 导航栏折叠框 -->
      <div class="navBarCallBox">
        <div class="navBarCallButton" :data-unfold="unfold" @click="unfold=!unfold" >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.28809 12L14.2981 18.01L15.7121 16.596L11.1121 11.996L15.7121 7.39601L14.2981 5.99001L8.28809 12Z" fill="black"/>
          </svg>
        </div>
       
      </div>
      
      <!-- 加载状态栏 -->
      <span id="cardLoadState" v-cloak>
        <div class="cardLoadMessage">
          {{loadingState.nowCount}}/{{loadingState.allCount}}</div>
        <div class="miniLoadingBar" :style="{width:getPercentage}"></div>
      </span>
      <!-- 选择信息状态栏 -->
      <span id="cardSelectedCount" v-cloak>{{selectingInfo.nowCount}}</span>
     

      <!-- 导航按钮列表 -->
      <div id="navbar">
        <button id="allSelection" type="button"
        @click="sendAllSelectRequest('all')">
          全选
        </button>
        <button id="allSelectionNow" type="button"
        @click="sendAllSelectRequest('nowWindowAll')">
          全选当前
        </button><hr>  
        <button id="cleanSelection" type="button"
        @click="sendCleanSelectionRequest">
          清空选择
        </button>
        <button id="getSelectedUrlInfo" type="button">
          获取链接
        </button>
        <button id="downloadSelectedInQuicker" type="button" 
        v-if="info.openQuickerInteraction"
        @click="sendDownloadRequest">
          下载选中
        </button>
        <br>
        <button id="toNormalMode" 
        v-if="info.openQuickerInteraction"
        @click="sendToNormalModeRequest">
          普通模式
        </button><br>
        <button id="allReVerify" type="button" @click="sendReVerifyAllCardRequest">
          全部重验证
        </button>
        <div id="once-loading-count-options-box">
          单次加载数量
          <select id="once-loading-count-options-box-select" 
          v-model="getOnceLoadingMax">
            <option v-bind:value="10">10条</option>
            <option v-bind:value="20">20条</option>
            <option v-bind:value="30">30条</option>
            <option v-bind:value="40">40条</option>
            <option v-bind:value="50">50条</option>
            <option v-bind:value="60">60条</option>
            <option v-bind:value="70">70条</option>
            <option v-bind:value="80">80条</option>
            <option v-bind:value="90">90条</option>
            <option v-bind:value="100">100条</option>
            <option v-bind:value="200">200条</option>
            <option v-bind:value="300">300条</option>
            <option v-bind:value="400">400条</option>
            <option v-bind:value="500">500条</option>
          </select>
        </div>
        <button id="slowLoading" type="button" 
        :data-value="btn.slowLoading"
        @click="btn.slowLoading = !btn.slowLoading">
          缓慢加载<hr>
        </button>
        <button id="loadingRemaining" type="button"
        @click="sendLoadingRemainingRequest">
          加载剩余项
        </button><br>
        <button id="NSFWModeSwitch" type="button" 
        :data-value="btn.NSFWMode" 
        @click="btn.NSFWMode = !btn.NSFWMode">
          NSFW模式<hr>
        </button>
        <button id="cardTitleShowSwitch" type="button" 
        :data-value="btn.cardTitleShow"
        @click="btn.cardTitleShow = !btn.cardTitleShow">
          卡片标题<hr>
        </button>
        <button id="enableSwitchBackGround" type="button"
        :data-value="btn.enableSwitchBackGround"
        @click="btn.enableSwitchBackGround = !btn.enableSwitchBackGround">
          背景切换<hr>
        </button>
        <button id="openScrollSnap" type="button"
        :data-value="btn.openScrollSnap"
        @click="btn.openScrollSnap = !btn.openScrollSnap">
          滚动吸附<hr>
        </button>
        <button id="listPageShowSwitch" type="button"
        :data-value="btn.listPageShow" 
        @click="btn.listPageShow = !btn.listPageShow">
          画廊切换<hr>
        </button>
      </div>
    </div>
    
  </div>
  `,
	props: {
		onceLoadMaxCount: Number,
		loadingState: Object,
		selectingInfo: Object,
	},
	emits: ["returnBtnInfo", "returnOnceLoadingMax", "downloadRequest", "reVerifyAllCard", "toNormalMode", "allSelectRequest", "cleanSelectionRequest", "loadingRemainingRequest"],
	computed: {
		getPercentage() {
			if (this.loadingState.nowCount == 0 || this.loadingState.allCount == 0) {
				return `0%`;
			} else {
				return `${(this.loadingState.nowCount / this.loadingState.allCount) * 100}%`;
			}
		},
		getOnceLoadingMax: {
			get() {
				return this.onceLoadMaxCount;
			},
			set(value) {
				this.$emit("returnOnceLoadingMax", value);
			},
		},
	},
	data() {
		return {
			unfold: true,
			info: {
				openQuickerInteraction: config.openQuickerInteraction,
			},
			btn: {
				slowLoading: false, // 缓慢加载切换按钮
				NSFWMode: config.initNSFWState, // NSFW模式切换按钮
				cardTitleShow: config.initCardTitleState, // 卡片标题显示切换按钮
				enableSwitchBackGround: config.initClickSwBackgroundState, // "运行背景切换"切换按钮
				openScrollSnap: config.initOpenScrollSnap, // 滚动吸附切换按钮
				listPageShow: true, // 画廊显示切换按钮
			},
		};
	},
	watch: {
		btn: {
			handler(newVal, oldVal) {
				// console.log(newVal);
				this.$emit("returnBtnInfo", {
					slowLoading: newVal.slowLoading,
					enableSwitchBackGround: newVal.enableSwitchBackGround,
					openScrollSnap: newVal.openScrollSnap,
				});
			},
			deep: true, //深度监听
		},
	},
	methods: {
		// 向父组件发送"下载"请求
		sendDownloadRequest() {
			this.$emit("downloadRequest");
		},
		// 向父组件发送"切换普通模式"请求
		sendToNormalModeRequest() {
			this.$emit("toNormalMode");
		},
		// 向父组件发送"全部重新验证"请求
		sendReVerifyAllCardRequest() {
			this.$emit("reVerifyAllCard");
		},
		// 向父组件发送"全选"请求
		sendAllSelectRequest(value) {
			this.$emit("allSelectRequest", value);
		},
		// 向父组件发送"清空选择"请求
		sendCleanSelectionRequest() {
			this.$emit("cleanSelectionRequest");
		},
		// 向父组件发送"记住剩余项"请求
		sendLoadingRemainingRequest() {
			this.$emit("loadingRemainingRequest");
		},
	},
	created() {
		this.$emit("returnBtnInfo", {
			slowLoading: this.btn.slowLoading,
			enableSwitchBackGround: this.btn.enableSwitchBackGround,
			openScrollSnap: this.btn.openScrollSnap,
		});
	},
};
// export {AppNavBar};
