// card的定义
const AppCard = {
	template: /*html*/ `
    <div class="card" 
      v-if="listInfo.loadedCardSet.has(card)"
      v-show="searchInfo.matchCardSet.has(card)"
      :data-show="searchInfo.matchCardSet.has(card)"
      :data-index="index" 
    >
      <!-- 图片类(内容区) -->
      <img class="content"
        v-if="card.urlPicType=='img'"
        :alt="card.Content"
        :title="card.Content"
        v-lazy="card.showUrl"
        srcset="" 
      >
      <!-- 视频类(内容区) -->
      <video class="content"
        controls loop 
        controlslist="nofullscreen noremoteplayback" 
        disablepictureinpicture
        v-if="card.urlPicType=='video'"
        v-lazy="card.showUrl"
        :title="card.Content"
      ></video>
      <!-- title区 -->
      <div class="title">
        <div class="linkBox" v-cloak>
          <a :href="card.LinkUrl" target="_blank" v-cloak>{{card.Content}}</a>
        </div>
      </div>

      <!-- 遮罩(插入位置视觉提示器) -->
      <div class="card-mask">
        <div data-hover="false" class="card-mask-left card-mask-public"></div>
        <div data-hover="false" class="card-mask-right card-mask-public"></div>
      </div>
    </div>
  `,
	props: {
		card: Object,
		index: Number,
		listInfo: Object,
		selectingInfo: Object,
		searchInfo: Object,
	},
	emits: [],
	updated() {
		//? 每次卡片位置更新时都重新获取新index
		this.card.index = this.index;
	},
	methods: {},
	directives: {
		// [自定义指令] 定义懒加载图片或者文件等
		lazy: {
			// 当插入时执行
			mounted(el, binding, vNode) {
				el.dataset.show = false; //先设置为不显示(配合css)
				let url = binding.value; //保存src
				// 回调函数定义
				let observer = new IntersectionObserver(
					(entries, observer) => {
						entries.forEach((entire) => {
							// 调用方法得到该elDOM元素是否处于可视区域
							if (entire.isIntersecting) {
								//回调是否处于可视区域，true or false
								observer.unobserve(el); // 只需要监听一次即可，第二次滑动到可视区域时候不在监听
								el.src = url; //如果处于可视区域额，将最开始保存的真实路径赋予DOM元素渲染
								// el.dataset.show = true;
								if (el.tagName == "IMG") {
									if (el.complete) {
										el.dataset.show = true;
									} else {
										el.addEventListener("load", fn);
										el.addEventListener("error", fn);
										function fn() {
											el.dataset.show = true;
											el.removeEventListener("load", fn);
											el.removeEventListener("error", fn);
										}
									}
								} else {
									el.dataset.show = true;
								}
							}
						});
					},
					{
						root: document.querySelector("#listPage"),
						rootMargin: "10%",
					}
				); // 设置阈值
				// 监听调用
				observer.observe(el);
			},
		},
	},
};
// export {AppCard};
