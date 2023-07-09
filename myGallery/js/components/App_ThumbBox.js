// 缩略图盒子定义
const AppThumbBox = {
	template: /*html*/ `
  <div class="thumb-box" 
  v-if="listInfo.loadedCardSet.has(card)"
  v-show="searchInfo.matchCardSet.has(card)"
  >

    <!-- 缩略图内容 -->
    <!-- 图片类型 -->
    <img class="thumb-content" alt="" 
    v-if="card.urlPicType=='img'"   
    v-lazy="card.PicUrl">

    <!-- 视频类型 -->
    <video class="thumb-content" disablepictureinpicture 
    v-if="card.urlType=='video'"   
    v-lazy="card.LinkUrl"></video>

  </div>
  `,
	props: {
		card: Object,
		listInfo: Object,
		selectingInfo: Object,
		searchInfo: Object,
	},
	directives: {
		// [自定义指令] 定义懒加载图片或者文件等
		lazy: {
			// 当插入时执行
			mounted(el, binding, vNode) {
				// console.log(el, binding, vNode.ctx.props.card.contentShow)
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
						// root: document.querySelector('#preViewer'),
						rootMargin: "10%",
					}
				); // 设置阈值
				// 监听调用
				observer.observe(el);
			},
		},
	},
};
// export {AppThumbBox};
