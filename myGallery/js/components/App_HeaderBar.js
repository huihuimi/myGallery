// 标题栏定义
const AppHeaderBar = {
	template: /*html*/ `
  <div class="header">
    <!-- 标题拖拽块 -->
    <div class="titleDragBlock"
    :style="{
      'app-region': 'drag',
    }"
    >{{title}}
    <!-- 关闭按钮 -->
    <button id="closeWindow" @click="closeWindow" :style="{'app-region': 'none'}">
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C9.34711 22.0024 6.80218 20.9496 4.9263 19.0737C3.05042 17.1978 1.99762 14.6529 2 12V11.8C2.08179 7.79223 4.5478 4.22016 8.26637 2.72307C11.9849 1.22597 16.2381 2.0929 19.074 4.92601C21.9365 7.78609 22.7932 12.0893 21.2443 15.8276C19.6955 19.5659 16.0465 22.0024 12 22ZM12 13.41L14.59 16L16 14.59L13.41 12L16 9.41001L14.59 8.00001L12 10.59L9.41001 8.00001L8.00001 9.41001L10.59 12L8.00001 14.59L9.41001 16L12 13.411V13.41Z"/>
      </svg>
    </button>
    <!-- 窗口加载进度条 -->
    <div id="loadProgressBox" 
    :data-percentage="percentage" 
    :data-loaded="loaded">
      <div class="progressBar" :style="{width:percentage}"></div>
    </div>
  </div>
    
    
  </div>
  `,
	props: {
		title: {
			type: String,
			default: "图库",
		},
		nowCount: Number,
		allCount: Number,
	},
	data() {
		return {
			loaded: false, // 加载完成情况
		};
	},
	watch: {
		nowCount(newVal, oldVal) {
			if (newVal >= this.allCount) {
				setTimeout(() => {
					this.loaded = true;
				}, 2000);
			}
		},
	},
	computed: {
		// 百分比获取
		percentage() {
			if (this.nowCount == 0 || this.allCount == 0) {
				return `0%`;
			} else {
				return `${(this.nowCount / this.allCount) * 100}%`;
			}
		},
	},
	methods: {
		closeWindow() {
			window.close();
		},
	},
};
// export {AppHeaderBar};
