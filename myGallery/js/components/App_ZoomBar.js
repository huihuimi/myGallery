// zoomBar的定义
const AppZoomBar = {
	template: /*html*/ `
    <div id="zoomBar" data-show="true" 
    @contextmenu.prevent.native="(e)=>{e.preventDefault()}">
      <input type="range" class="range" min="0" max="100.1" 
      v-model="value" :step="100/maxColumn"
      @mousewheel.passive="wheel"
      >
    </div>
  `,
	props: {
		maxColumn: Number,
	},
	data() {
		return {
			nowColumnInner: 0,
		};
	},
	methods: {
		// 鼠标滚轮更改缩放条数值
		wheel(e) {
			// 获取当前列数
			let nowColumn = Math.round((this.value / 100) * this.maxColumn);
			if (e.wheelDelta > 0) {
				nowColumn--;
			} else {
				nowColumn++;
			}
			// 布局判断
			if (nowColumn > 0) {
				if (nowColumn <= this.maxColumn) {
					// 如果nowColumn>0&&nowColumn<=最大行数则正常赋值
					this.nowColumn = nowColumn;
				}
			} else {
				// 如果nowColumn<=0则变换布局
				this.nowColumn = 0;

				// …………(待续)
			}
			// 更新参数
			this.value = 100 * (this.nowColumn / this.maxColumn);
		},
	},
	watch: {
		nowColumnInner(newVal, oldVal) {
			// 行显示信息发送变化时向父组件发送新数据
			this.$emit("returnNowColumn", this.nowColumnInner);
		},
	},
	computed: {
		value: {
			get() {
				return (this.nowColumnInner / this.maxColumn) * 100;
			},
			set(value) {
				this.nowColumnInner = Math.round((value / 100) * this.maxColumn);
			},
		},
	},
	mounted() {
		this.nowColumnInner = Math.round(this.maxColumn / 2);
	},
};
// export {AppZoomBar};