
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

// 搜索框定义
const AppSearchBox = {
  template:/*html*/`
  <div class="search-container">
    <div class="search-box">
      <a class="search-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z" fill="#888888"/></svg>
      </a>
      <input type="text" class="search-txt" placeholder="搜索" 
      v-model="content" @keyup.enter="sendSearchResult"/>
      <div class="search-line"></div>
      <div class="search-btn-count" v-show="content!=''">{{getMatchCount}}</div>
      <button class="clean-content" @click="clean">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.59 7L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7Z" fill="black"/>
        </svg>
      </button>
    </div>
  </div> 
  `,
  props: {
    cardInfoList: Array,
  },
  emits: ['returnMatchInfo'],
  data() {
    return {
      content: '',
      oldContent: '',
      matchTags: [],
      matchCardSet: new Set(),
      matchCount: 0,
    }
  },
  methods: {
    //f 触发搜索事件
    sendSearchResult() {
      // 获取结果并更新标记
      this.getMatchIndexList(this.matchTags)
      // 并发送新结果给父组件
      this.$emit('returnMatchInfo', {
        matchTags: this.matchTags,
        matchCardSet: this.matchCardSet,
      })
    },
    //f 获取匹配信息
    getMatchIndexList(matchTags = []) {
      this.cardInfoList.forEach((card) => {
        let isMatch = false
        if (matchTags.length > 0) {
          for (let i = 0, len = matchTags.length; i < len; i++) {
            const matchTag = matchTags[i];
            if (card.Content.toLowerCase().includes(matchTag.toLowerCase())
              || (card.index + 1) == Number(matchTag)) {
              isMatch = true
            }
          }
        } else {
          // 如果匹配关键词小于1则默认全部匹配
          isMatch = true
        }
        if (isMatch) {
          this.matchCardSet.add(card)
        } else {
          this.matchCardSet.delete(card)
        }
      })
    },
    //f 清空
    clean() {
      this.content = ''
      this.matchCount = 0
      this.matchCardSet = new Set(this.cardInfoList)
      this.$emit('returnMatchInfo', {
        matchTags: this.matchTags,
        matchCardSet: this.matchCardSet,
      })
    },
  },
  computed: {
    getMatchCount() {
      return this.cardInfoList.filter((card) => {
        let isMatch = false
        if (this.matchTags.length > 0) {
          for (let i = 0, len = this.matchTags.length; i < len; i++) {
            const matchTag = this.matchTags[i];
            if (card.Content.toLowerCase().includes(matchTag.toLowerCase())
              || (card.index + 1) == Number(matchTag)) {
              isMatch = true
            }
          }
        } else {
          // 如果匹配关键词小于1则默认全部匹配
          isMatch = true
        }
        return isMatch
      }).length
    },
  },
  watch: {
    //f 监视content变化(实时获取匹配结果)
    content(newVal, oldVal) {
      if (newVal == oldVal) {
        return
      }
      // 获取匹配关键词
      if (newVal.includes('|')) {
        this.matchTags = newVal.split('|')
      } else {
        this.matchTags[0] = newVal
      }
    }

  },
  mounted() {
    this.getMatchIndexList() //首次运行先进行一次搜索结果更新
    this.sendSearchResult()// 并发送新结果给父组件
  },
}
// viewer的定义
const AppPreViewer = {
	components: {AppThumbBox},
	template: /*html*/ `
    <div id="preViewer" ref="preViewerInner"
    :data-show="info.show" 
    :data-now-index="info.nowIndex" 
    :data-show-type="info.showType" 
    @mousedown="clickToClose"
    @dblclick="dblClickToClose" 
    @mousewheel.passive="turnPageByRoll" v-cloak>

    <span id="messageInViewer" v-cloak>
      ({{Number(info.nowIndex)+1}}/{{cardInfoList.length}})<br>
      {{message.content}}
    </span>

    <!-- 悬浮按钮菜单 -->
    <div class="preViewer-menu">

      <!-- 缩略图导航栏切换按钮 -->
      <div class="open-thumbnail-track" 
      :data-open="btn.openThumbTrackBtn" 
      @click="switchThumbnailTrack">
        <svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M18 20C16.8954 20 16 19.1046 16 18C16 16.8954 16.8954 16 18 16C19.1046 16 20 16.8954 20 18C20 19.1046 19.1046 20 18 20ZM12 20C10.8954 20 10 19.1046 10 18C10 16.8954 10.8954 16 12 16C13.1046 16 14 16.8954 14 18C14 19.1046 13.1046 20 12 20ZM6 20C4.89543 20 4 19.1046 4 18C4 16.8954 4.89543 16 6 16C7.10457 16 8 16.8954 8 18C8 19.1046 7.10457 20 6 20ZM18 14C16.8954 14 16 13.1046 16 12C16 10.8954 16.8954 10 18 10C19.1046 10 20 10.8954 20 12C20 12.5304 19.7893 13.0391 19.4142 13.4142C19.0391 13.7893 18.5304 14 18 14ZM12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C13.1046 10 14 10.8954 14 12C14 12.5304 13.7893 13.0391 13.4142 13.4142C13.0391 13.7893 12.5304 14 12 14ZM6 14C4.89543 14 4 13.1046 4 12C4 10.8954 4.89543 10 6 10C7.10457 10 8 10.8954 8 12C8 12.5304 7.78929 13.0391 7.41421 13.4142C7.03914 13.7893 6.53043 14 6 14ZM18 8C16.8954 8 16 7.10457 16 6C16 4.89543 16.8954 4 18 4C19.1046 4 20 4.89543 20 6C20 6.53043 19.7893 7.03914 19.4142 7.41421C19.0391 7.78929 18.5304 8 18 8ZM12 8C10.8954 8 10 7.10457 10 6C10 4.89543 10.8954 4 12 4C13.1046 4 14 4.89543 14 6C14 6.53043 13.7893 7.03914 13.4142 7.41421C13.0391 7.78929 12.5304 8 12 8ZM6 8C4.89543 8 4 7.10457 4 6C4 4.89543 4.89543 4 6 4C7.10457 4 8 4.89543 8 6C8 6.53043 7.78929 7.03914 7.41421 7.41421C7.03914 7.78929 6.53043 8 6 8Z"
            fill="black" />
        </svg>
      </div>
      <!-- 图片定位按钮 -->
      <div class="targetLocate" 
      @click="toLocateTarget">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 21C10.7369 19.9226 9.56619 18.7415 8.5 17.469C6.9 15.558 5 12.712 5 9.99999C4.99858 7.16754 6.70425 4.61338 9.32107 3.52939C11.9379 2.44539 14.9501 3.04523 16.952 5.04899C18.2685 6.3596 19.0059 8.14238 19 9.99999C19 12.712 17.1 15.558 15.5 17.469C14.4338 18.7415 13.2631 19.9226 12 21ZM12 6.99999C10.9282 6.99999 9.93782 7.57179 9.40193 8.49999C8.86603 9.42819 8.86603 10.5718 9.40193 11.5C9.93782 12.4282 10.9282 13 12 13C13.6569 13 15 11.6568 15 9.99999C15 8.34313 13.6569 6.99999 12 6.99999Z"
            fill="black" />
        </svg>
      </div>

    </div>

    <!-- 展示区 -->
    <div id="displayArea">

      <!-- 图片播放器 -->
      <div id="picShowBoard" ref="picShowBoard"
      :style="{
        'aspect-ratio': info.showCard != null? info.showCard.scale : 'auto',
        left: info.style.left,
        top: info.style.top,
        width: info.style.width,
        height: info.style.height,
      }" 
      @mousedown="mousedownViewer" 
      @mousewheel.passive="zoomViewer">

        <!-- 内容区img -->
        <!-- <img id="showPic" alt="" ref="showPic"
				data-show="false"
        :src="info.picShowBoardUrl"
				> -->

      </div>

      <!-- 视频播放器 -->
      <div id="videoPlayer" 
      :style="{
        'aspect-ratio': info.showCard != null? info.showCard.scale : 'auto',
        left: info.style.left,
        top: info.style.top,
        width: info.style.width,
        height: info.style.height,
      }" >

        <!-- 内容区video -->
        <video id="showVideo" ref="showVideo" controls loop="loop"
				data-show="false"
        :src="info.videoPlayerUrl" ></video>

      </div>

    </div>

    <!-- 前一张 -->
    <span class="pv-pic-window-pre" 
    @click="turnPage(0)">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <g data-name="Layer 2">
          <g data-name="arrow-left">
            <rect width="24" height="24" opacity="0" />
            <path
              d="M13.54 18a2.06 2.06 0 0 1-1.3-.46l-5.1-4.21a1.7 1.7 0 0 1 0-2.66l5.1-4.21a2.1 2.1 0 0 1 2.21-.26 1.76 1.76 0 0 1 1.05 1.59v8.42a1.76 1.76 0 0 1-1.05 1.59 2.23 2.23 0 0 1-.91.2z" />
          </g>
        </g>
      </svg>
    </span>
    <!-- 后一张 -->
    <span class="pv-pic-window-next" 
    @click="turnPage(1)">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <g data-name="Layer 2">
          <g data-name="arrow-right">
            <rect width="24" height="24" transform="rotate(180 12 12)" opacity="0" />
            <path
              d="M10.46 18a2.23 2.23 0 0 1-.91-.2 1.76 1.76 0 0 1-1.05-1.59V7.79A1.76 1.76 0 0 1 9.55 6.2a2.1 2.1 0 0 1 2.21.26l5.1 4.21a1.7 1.7 0 0 1 0 2.66l-5.1 4.21a2.06 2.06 0 0 1-1.3.46z" />
          </g>
        </g>
      </svg>
    </span>

    <!-- 底部图片缩略图区域 -->
    <div id="thumbnail-viewport" 
    :style="{
      'scroll-snap-type':thumbnailViewport.style['scroll-snap-type'],
      height:thumbnailViewport.height+'px'
    }">
      <!-- 缩略图轨道 -->
      <div id="thumbnail-track">
        <!-- 缩略图容器 -->
        <app-thumb-box v-for="(card, index) in cardInfoList" :key="card.id"
        :card="card" :data-index="index"
        :listInfo="listInfo"
        :selectingInfo="selectingInfo" 
        :searchInfo="searchInfo" 
        :data-selected="index==info.nowIndex"
        :style="{
          '--scale':card.scale,
        }"
				@click="()=>{toShow(index)}"
        ></app-thumb-box>

      </div>

    </div>

  </div>
  `,
	props: {
		cardInfoList: Object, // 卡片信息
		matchIndexList: Object, // 匹配的index列表
		onceLoadMaxCount: Number, // 单次加载最大数量
		listInfo: Object,
		selectingInfo: Object,
		searchInfo: Object,
	},
	emits: ["requestLoadCard", "returnNowPreviewIndex"],
	data() {
		return {
			// cardInfoList: cardInfoList,
			info: {
				nowIndex: -1,
				showCard: null,
				previousIndex: -1,
				show: false,
				showType: "none",
				imgEle: null,
				videoPlayerUrl: "",
				width: 0,
				height: 0,
				style: {
					"aspect-ratio": "auto",
					left: "auto",
					top: "auto",
					width: "auto",
					height: "auto",
				},
			},
			btn: {
				openThumbTrackBtn: false,
			},
			message: {
				content: "",
			},
			thumbnailViewport: {
				height: 150,
				style: {
					"scroll-snap-type": null,
				},
			},
		};
	},
	// 方法
	methods: {
		//f 图像显示函数
		toShow(index) {
			this.info.nowIndex = index;
			// 去除所点击的目标焦点
			if (window.event != undefined) window.event.target.blur();
			// 将焦点定位到viewer上
			this.$el.focus();
			// 找到取得对应信息
			const target = this.cardInfoList[index];
			this.message.content = this.cardInfoList[this.info.nowIndex].Content;
			this.info.width = target.Width;
			this.info.height = target.Height;
			this.info.style["aspect-ratio"] = target.scale;
			this.info.show = true;
			this.info.showCard = target;

			//* 清空画布
			this.info.imgEle = null;
			this.$refs.picShowBoard.innerHTML = "";
			this.info.picShowBoardUrl = "";
			this.info.videoPlayerUrl = "";
			this.info.imgEle = document.createElement("img"); //* 新img标签dom
			this.info.imgEle.id = "showPic";
			this.info.imgEle.dataset.show = false;
			this.$refs.picShowBoard.appendChild(this.info.imgEle);

			const videoEle = this.$refs.showVideo; //* video标签dom
			videoEle.dataset.show = false;

			// 赋予链接
			if (target.urlType === "img") {
				this.info.imgEle.src = target.LinkUrl;
				this.info.videoPlayerUrl = "";
				this.info.showType = "img";
			} else if (target.urlType === "video") {
				this.info.imgEle.src = "";
				this.info.videoPlayerUrl = target.LinkUrl;
				this.info.showType = "video";
			} else if (target.urlPicType === "img") {
				this.info.imgEle.src = target.PicUrl;
				this.info.videoPlayerUrl = "";
				this.info.showType = "img";
			} else if (target.urlPicType === "video") {
				this.info.imgEle.src = "";
				this.info.videoPlayerUrl = target.PicUrl;
				this.info.showType = "video";
			} else {
				this.info.showType = "none";
			}

			if (this.info.showType === "img") {
				if (this.info.imgEle.complete) {
					setTimeout(() => (this.info.imgEle.dataset.show = true));
				} else {
					this.info.imgEle.onload = () => {
						if (this.info.imgEle != null) {
							this.info.imgEle.dataset.show = true;
						}
					};
				}
			}
			if (this.info.showType === "video") {
				// 等可播放时在执行
				videoEle.oncanplay = () => {
					// 自动播放
					videoEle.dataset.show = true;
					this.videoPlayerControl("play");
				};
			}

			// 居中
			this.toCenter();
			// 向父组件返回当前查看的index
			this.$emit("returnNowPreviewIndex", index);
			// this.$emit("requestLoadCard", list);
			// 注册键盘事件
			document.addEventListener("keydown", this.keyboardViewer);
			document.addEventListener("wheel", this.wheelInViewer, {passive: true});
			// 注册窗口改变事件
			window.addEventListener("resize", this.windowReSize, {passive: true});
		},
		//f 窗口改变事件
		windowReSize() {
			this.toCenter(this.info.nowIndex);
		},
		//f [图片预览器显示&居中&图片切换]
		toCenter() {
			const windowInfo = document.documentElement; //获取窗口信息
			// 获取窗口信息
			let ww = windowInfo.clientWidth;
			let wh = windowInfo.clientHeight;
			// let ww = this.$refs.preViewerInner.clientWidth
			// let wh = this.$refs.preViewerInner.clientHeight
			if (this.btn.openThumbTrackBtn === true) {
				wh = wh - this.thumbnailViewport.height;
			}
			// 尝试获取原图宽高比
			let ratio = this.cardInfoList[this.info.nowIndex].scale;

			// 获取显示的初始尺寸
			const initZoom = 0.94;
			let initWidth, initHeight;
			// 如果实际宽度超过窗口宽度则按照窗口宽度调整大小
			if (initZoom * wh * ratio > ww) {
				initWidth = initZoom * ww;
				initHeight = initWidth / ratio;
			} else {
				initHeight = initZoom * wh;
				initWidth = initHeight * ratio;
			}

			// 设置画板位置
			this.info.style.left = 0.5 * (ww - initWidth) + "px";
			this.info.style.top = 0.5 * (wh - initHeight + 20) + "px";
			// 画板设置宽高
			this.info.style.width = initWidth + "px";
			this.info.style.height = initHeight + "px";
			this.toCenterThumbBox();
		},
		//f 单击关闭
		clickToClose(e) {
			// console.log(e.target);
			if (e.target.id === "preViewer") {
				this.closeViewer();
			}
		},
		//f 双击关闭
		dblClickToClose(e) {
			if (e.target.id === "showPic" || e.target.id === "picShowBoard" || e.target.id === "thumbnail-viewport") {
				this.closeViewer();
			}
		},
		//f 关闭窗口
		closeViewer(toLocate = false) {
			//* 清空画布
			this.info.imgEle = null;
			this.$refs.picShowBoard.innerHTML = "";
			//* 参数还原
			this.info = {
				nowIndex: -1,
				show: false,
				showType: "none",
				imgEle: null,
				videoPlayerUrl: "",
				width: 0,
				height: 0,
				style: {
					"aspect-ratio": "auto",
					left: "auto",
					top: "auto",
					width: "auto",
					height: "auto",
				},
			};
			this.message = {
				content: "",
				nowNum: 1,
			};
			// 移除键盘事件
			document.removeEventListener("keydown", this.keyboardViewer);
			document.removeEventListener("wheel", this.wheelInViewer);
			// 移除窗口改变事件
			window.removeEventListener("resize", this.windowReSize);
			// 停止视频播放
			this.videoPlayerControl("pause");
			if (!toLocate) {
				// 向父组件返回当前查看的index
				this.$emit("returnNowPreviewIndex", -1);
			}
		},
		//f 窗口拖动函数
		mousedownViewer(e) {
			let target = e.target;
			if (target.id != "picShowBoard") {
				target = target.parentNode;
				if (target.id != "picShowBoard") {
					return;
				}
			}
			// 先给画布标记为拖拽中
			target.dataset.dragging = true;

			const main = this.info;
			// 获取盒子的信息
			let targetInfo = target.getBoundingClientRect();
			// 点击时鼠标的坐标
			let mouseX = window.event.clientX;
			let mouseY = window.event.clientY;

			// 为document添加移动事件的监听
			document.addEventListener("mousemove", mousemoveMouse);
			// 添加“鼠标抬起document”的事件监听
			document.addEventListener("mouseup", mouseupViewer);
			// [事件实现]
			//f 鼠标移动事件
			function mousemoveMouse() {
				// 点击时鼠标的坐标 - 移动后鼠标的坐标 = 移动距离
				const moveX = window.event.clientX - mouseX;
				const moveY = window.event.clientY - mouseY;
				// 原位置 + 移动的距离 = 移动后的位置
				// target.style.left = (targetInfo.left + moveX) + "px"
				// target.style.top = (targetInfo.top + moveY) + "px"
				main.style.left = targetInfo.left + moveX + "px";
				main.style.top = targetInfo.top + moveY + "px";
			}
			//f 鼠标抬起事件(移除所有事件)
			function mouseupViewer() {
				// 画布标记为"未拖拽"
				target.dataset.dragging = false;

				// 移除document移动事件的监听
				document.removeEventListener("mousemove", mousemoveMouse);
				// 移除“鼠标抬起document”的事件监听
				document.removeEventListener("mouseup", mouseupViewer);
			}
		},
		//f [滚动缩放预览窗口]
		zoomViewer(e, ratio = 0.5) {
			e = e || window.event;

			// 获取鼠标参数
			let mouseX = e.clientX;
			let mouseY = e.clientY;

			// 获取盒子的信息
			let picShowBoardInfo = document.querySelector("#picShowBoard").getBoundingClientRect();
			// 获取img标签信息
			let ImgTagInfo = document.querySelector("#showPic").getBoundingClientRect();
			// 获取窗口信息
			const windowInfo = document.documentElement;

			let scaleImage = this.cardInfoList[this.info.nowIndex].scale;

			if (e.wheelDelta > 0) {
				// 修正缩放倍率
				let factor = ratio * 1.5;
				// 获取新高度
				let newHeight = picShowBoardInfo.height * (1 + factor);
				if (newHeight < 20 * windowInfo.clientHeight) {
					// 位置
					this.info.style.top = picShowBoardInfo.top - (mouseY - picShowBoardInfo.top) * factor + "px";
					this.info.style.left = picShowBoardInfo.left - (mouseX - picShowBoardInfo.left) * factor + "px";
					// 尺寸
					this.info.style.height = newHeight + "px";
					this.info.style.width = newHeight * scaleImage + "px";
				}
			} else {
				// 修正缩放倍率
				let factor = ratio;
				// 获取新高度
				let newHeight = picShowBoardInfo.height * (1 - factor);
				if (newHeight > 0.15 * windowInfo.clientHeight) {
					// 位置
					this.info.style.top = picShowBoardInfo.top + (mouseY - picShowBoardInfo.top) * factor + "px";
					this.info.style.left = picShowBoardInfo.left + (mouseX - picShowBoardInfo.left) * factor + "px";
					// 尺寸
					this.info.style.height = newHeight + "px";
					this.info.style.width = newHeight * scaleImage + "px";
				}
			}
		},

		//f 定位按钮
		toLocateTarget() {
			// 目标对象
			const target = document.querySelector(`.card[data-index="${this.info.nowIndex}"]`);
			// console.log(target);
			// 关闭窗口
			this.closeViewer(true);
			// console.log(target);
			// 滚动参数
			let scrollIntoViewOptions = {
				behavior: "smooth",
				block: "center",
				inline: "center",
			};

			// 执行滚动
			if (target != null) {
				this.thumbnailViewport.style["scroll-snap-type"] = "none";
				target.scrollIntoView(scrollIntoViewOptions);
				setTimeout(() => {
					this.thumbnailViewport.style["scroll-snap-type"] = null;
				}, 1000);
				const list = document.querySelector("#list");
				// 向父组件返回当前查看的index
				setTimeout(this.$emit("returnNowPreviewIndex", -1), 0);
				// list.addEventListener('transitionend', reNewNowPreviewIndex)
				// const _this = this
				// function reNewNowPreviewIndex() {
				//   // 向父组件返回当前查看的index
				//   setTimeout(_this.$emit('returnNowPreviewIndex', -1), 0)
				//   list.removeEventListener('transitionend', reNewNowPreviewIndex)
				// }
			}
		},
		//f 缩略图track切换按钮
		switchThumbnailTrack() {
			// 更改按钮值
			this.btn.openThumbTrackBtn = !this.btn.openThumbTrackBtn;
			// 进行视图居中
			this.toCenter();
		},
		//f 居中thumbBox
		toCenterThumbBox() {
			if (this.info.show == false) {
				return;
			}
			// 获取对应thumb盒子
			let thumbBox;
			const thumbTrack = document.querySelector("#thumbnail-track");

			thumbBox = thumbTrack.querySelector(`.thumb-box[data-index="${this.info.nowIndex}"]`);

			// 滚动参数
			let scrollIntoViewOptions = {
				behavior: "smooth",
				block: "center",
				inline: "center",
			};

			if (
				(this.info.previousIndex != -1 &&
					((this.info.previousIndex == 0 && this.info.nowIndex == this.cardInfoList.length - 1) || (this.info.previousIndex == this.cardInfoList.length - 1 && this.info.nowIndex == 0))) ||
				this.btn.openThumbTrackBtn == false
			) {
				scrollIntoViewOptions.behavior = "instant";
			}

			this.info.previousIndex = this.info.nowIndex;

			// 滚动到可视位置
			if (thumbBox != null) {
				// console.log(scrollIntoViewOptions);
				thumbBox.scrollIntoView(scrollIntoViewOptions);
			}
		},
		//f 翻页函数(0:向前,1:向后)
		turnPage(value) {
			let nowIndex = this.matchIndexList.indexOf(this.info.nowIndex);
			if (nowIndex == -1) {
				return;
			} else {
				if (value === 0) {
					if (nowIndex > 0) {
						nowIndex--;
					} else {
						nowIndex = this.searchInfo.matchCardSet.size - 1;
					}
				}
				if (value === 1) {
					if (nowIndex < this.searchInfo.matchCardSet.size - 1) {
						nowIndex++;
					} else {
						nowIndex = 0;
					}
				}
				nowIndex = this.matchIndexList[nowIndex];
			}
			if (nowIndex != this.info.nowIndex) {
				this.toShow(nowIndex);
			}
		},
		//f 鼠标滚动翻页事件
		turnPageByRoll(e) {
			if (e.target.id != "showPic" && e.target.id != "picShowBoard" && e.target.id != "showVideo" && e.target.id != "videoPalyer") {
				if (e.wheelDelta > 0) {
					this.turnPage(0);
				} else {
					this.turnPage(1);
				}
			}
		},
		//f 预览器的键盘事件
		keyboardViewer(e) {
			this.$el.focus();
			// 若当前是显示图片
			if (this.info.showType == "img") {
				if (e.key == "a" || e.key == "ArrowLeft" || e.key == "ArrowUp") this.turnPage(0);
				if (e.key == "d" || e.key == "ArrowRight" || e.key == "ArrowDown") this.turnPage(1);
			}
			// 若当前是显示视频
			if (this.info.showType == "video") {
				// 上一个
				if ((e.key == "q" || e.key == "ArrowLeft") && e.ctrlKey) {
					this.turnPage(0);
				}
				// 下一个
				if ((e.key == "e" || e.key == "ArrowRight") && e.ctrlKey) {
					this.turnPage(1);
				}
				// 后退.5s
				if (e.key == "a") this.videoPlayerControl("toback", 0.5);
				// 前进.5s
				if (e.key == "d") this.videoPlayerControl("toforward", 0.5);
				// 后退5s
				if ((e.key == "q" || e.key == "ArrowLeft") && !e.ctrlKey) this.videoPlayerControl("toback", 5);
				// 前进5s
				if ((e.key == "e" || e.key == "ArrowRight") && !e.ctrlKey) this.videoPlayerControl("toforward", 5);
				// 增加音量
				if (e.key == "w" || e.key == "ArrowUp") this.videoPlayerControl("volup");
				// 减少音量
				if (e.key == "s" || e.key == "ArrowDown") this.videoPlayerControl("voldown");
				// 播放和暂停切换
				if (e.key == " ") this.videoPlayerControl("switch");
				// 静音切换
				if (e.key == "m") this.videoPlayerControl("mute");
			}
		},
		//f 鼠标事件(部分)
		wheelInViewer(e) {
			if (e.target.id == "showVideo") {
				if (e.wheelDelta > 0) {
					this.videoPlayerControl("volup");
				} else {
					this.videoPlayerControl("voldown");
				}
			}
		},
		//f [视频播放器控制]
		videoPlayerControl(command, option) {
			// 获取视频播放器dom
			const videoEle = this.$refs.showVideo;
			videoEle.blur();
			const vol = 0.1; // 1代表100%音量，每次增减0.1
			const timeConst = 5; // 通常增量单位秒
			let time = timeConst;
			if (option != undefined) {
				time = option;
			}
			// [进度条控制]
			if (command == "toback") {
				if (videoEle.currentTime - time > 0) {
					videoEle.currentTime = videoEle.currentTime - time;
				} else {
					videoEle.currentTime = 0;
				}
			}
			if (command == "toforward") {
				if (videoEle.currentTime + time < videoEle.duration) {
					videoEle.currentTime = videoEle.currentTime + time;
				} else {
					videoEle.currentTime = videoEle.duration;
				}
			}
			// [音量控制]
			if (command == "voldown") videoEle.volume = videoEle.volume - vol >= 0 ? videoEle.volume - vol : 0;
			if (command == "volup") videoEle.volume = videoEle.volume + vol <= 1 ? videoEle.volume + vol : 1;
			if (command == "mute") {
				if (videoEle.muted) {
					videoEle.muted = false;
				} else {
					videoEle.muted = true;
				}
			}
			// [播放控制]
			if (command == "pause") videoEle.pause();
			if (command == "play") videoEle.play();
			if (command == "switch") {
				if (videoEle.paused) {
					videoEle.play();
				} else {
					videoEle.pause();
				}
			}
		},
	},
	// 计算属性
	computed: {
		getThumbnailViewportStyle: {
			get() {
				return this.thumbnailViewport.height + "px";
			},
		},
	},
	watch: {},
	// [自定义指令]
	directives: {},
	// [挂载后执行]
	mounted() {},
};

// 右键菜单样式
const AppRightClickMenu = {
  template: /*html*/ `
    <div class="right-click-menu" 
    :data-show="info.show" 
    :style="{
      top: info.top + 'px',
      left: info.left + 'px',
    }"
    >

      <div class="menu-option" id="view-target"
      @click="rightClickMenu_viewTarget" >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g>
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M1.181 12C2.121 6.88 6.608 3 12 3c5.392 0 9.878 3.88 10.819 9-.94 5.12-5.427 9-10.819 9-5.392 0-9.878-3.88-10.819-9zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
              fill="green" />
          </g>
        </svg>
        预览
      </div>
      <div class="menu-option" id="open-in-new-TAB"
      @click="rightClickMenu_openInNewTAB" >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17.001 20H6.00098C4.89641 20 4.00098 19.1046 4.00098 18V7C4.00098 5.89543 4.89641 5 6.00098 5H10.001V7H6.00098V18H17.001V14H19.001V18C19.001 19.1046 18.1055 20 17.001 20ZM11.701 13.707L10.291 12.293L16.584 6H13.001V4H20.001V11H18.001V7.415L11.701 13.707Z"
            fill="black" />
        </svg>
        新标签中打开
      </div>
      <div class="menu-option" id="rename-card"
      @click="rightClickMenu_renameCard" >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path d="M20.005 5.995h-1v2h1v8h-1v2h1c1.103 0 2-.897 2-2v-8c0-1.102-.898-2-2-2zm-14 4H15v4H6.005z" />
          <path
            d="M17.005 17.995V4H20V2h-8v2h3.005v1.995h-11c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h11V20H12v2h8v-2h-2.995v-2.005zm-13-2v-8h11v8h-11z" />
        </svg>
        重命名
      </div>
      <div class="menu-option" id="refresh-card"
      @click="rightClickMenu_refreshCard" alt="重新验证">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.995 4.00001C7.8362 3.99432 4.36664 7.17599 4.01299 11.3197C3.65933 15.4634 6.53955 19.187 10.6391 19.8862C14.7387 20.5853 18.6903 18.0267 19.73 14H17.649C16.6318 16.8771 13.617 18.5324 10.6434 17.8465C7.66989 17.1605 5.68488 14.3519 6.03079 11.3199C6.3767 8.28792 8.94332 5.99856 11.995 6.00001C13.5845 6.00234 15.1064 6.64379 16.218 7.78002L13 11H20V4.00001L17.649 6.35002C16.1527 4.84464 14.1175 3.99873 11.995 4.00001Z" fill="black"/>
        </svg>
        重新验证
      </div>
      <div class="menu-option" id="SetAsBackground"
      @click="rightClickMenu_setAsBackground" >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19.999 4h-16c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm-13.5 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5.5 10h-7l4-5 1.5 2 3-4 5.5 7h-7z" fill="#007bd9"/>
      </svg>
        设为背景
      </div>
      <hr>
      <hr>
      <hr>
      <hr>
      <div class="menu-option" id="delete-card"
      @click="rightClickMenu_deleteCard" >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <g>
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M7 6V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5zm6.414 8l1.768-1.768-1.414-1.414L12 12.586l-1.768-1.768-1.414 1.414L10.586 14l-1.768 1.768 1.414 1.414L12 15.414l1.768 1.768 1.414-1.414L13.414 14zM9 4v2h6V4H9z"
              fill="#c70000" />
          </g>
        </svg>
        删除
      </div>
      
    </div>
  `,
  props: {
    selectingInfo: Object, // 选中结果的集合信息
  },
  emits: [
    "requestToShow",
    "requestToVerifyCard",
    "requestRemoveCard",
    "requestSetBackGround",
  ],
  data() {
    return {
      targetCard: null,
      info: {
        show: false,
        top: null,
        left: null,
      },
    };
  },
  methods: {
    // [右键菜单]
    // 显示右键菜单
    showMenu(e, card) {
      // console.log(e, card);
      // 获取当前点击位置的坐标
      const { clientX, clientY } = e;
      this.info.top = clientY;
      this.info.left = clientX;
      this.info.show = true;

      // 记录右键时点击的目标
      this.targetCard = card;
    },
    closeMenu(e) {
      if (
        !e.target.classList.contains("right-click-menu") &&
        !e.target.classList.contains("menu-option")
      ) {
        this.info.show = false;
      }
    },
    // 菜单按钮事件
    rightClickMenu_viewTarget() {
      // [预览]按钮
      this.info.show = false;
      this.$emit("requestToShow", this.targetCard.index);
    },
    rightClickMenu_openInNewTAB() {
      // [新标签中打开]按钮
      this.info.show = false;
      window.open(this.targetCard.LinkUrl, "_blank");
    },
    rightClickMenu_renameCard() {
      // [重命名]按钮
      this.info.show = false;
      let newName = prompt("新名称", this.targetCard.Content);
      const reg = /^\s*$/g;
      if (newName != null && !reg.test(newName)) {
        this.targetCard.Content = newName;
      }
    },
    rightClickMenu_refreshCard() {
      // [重新验证]按钮
      this.info.show = false;
      // 获取被点击对象以及被选中集合
      let set = new Set(this.selectingInfo.cardSet);
      set.add(this.targetCard);
      // console.log(`待更新index列表:${indexList}`);
      set.forEach((card) => {
        this.$emit("requestToVerifyCard", card);
      });
    },
    // 设为背景
    rightClickMenu_setAsBackground() {
      this.info.show = false;
      // 发送背景设置请求
      this.$emit("requestSetBackGround", this.targetCard, true);
    },
    rightClickMenu_deleteCard() {
      // [删除]按钮
      this.info.show = false;
      // 获取被点击对象
      // 获取被点击对象以及被选中集合
      let set = new Set(this.selectingInfo.cardSet);
      set.add(this.targetCard);
      // console.log(`待更新index列表:${indexList}`);
      let msg;
      if (set.size > 1) {
        msg = `确认删除"${this.targetCard.Content}"以及,已选中${this.selectingInfo.cardSet.size}的项 (共${set.size}项)`;
      } else {
        msg = `确认删除"${this.targetCard.Content} (共${1}项)"`;
      }
      if (confirm(msg)) {
        set.forEach((card) => {
          this.$emit("requestRemoveCard", card);
        });
      }
    },
  },
};

// 框选工具
const AppAreaSelector = {
  template: /*html*/ `
  <!-- 框选box -->
  <div id="areaSelector" ref="areaSelector"
  :style="{
    display:info.show?null:'none',
    top: info.top+'px',
    left: info.left+'px',
    width: info.width+'px',
    height: info.height+'px',
    position: 'absolute',
    border: '1px solid rgb(0,119,255)',
    background: 'rgba(0,119,255,0.2)',
    zIndex: '100',
  }"></div>
  `,
  props: {
    cardInfoList: Object, // 可选内容
    selectingInfo: Object, // 选中信息
    listDomSelector: String, // list的Dom对象选择器
  },
  data() {
    return {
      // [框选盒子信息]
      mouseKey: 0, // 选区触发按键
      startPoint: { x: 0, y: 0 }, // div选区的起始坐标(相对可选区域)
      endPoint: { x: 0, y: 0 }, // div选区的结束坐标(相对可选区域)
      ctrlKeyPressed: false, // 是否按下ctrl键
      selectedSet: new Set(), // 记录被选结果Key的数组
      tempSelectedSet: new Set(), // 缓存每次框选选中的元素，避免直接修改 selectedSet
      lastTimeSelectedSet: new Set(), // 上一次选中的集合
      syncSelectedSet: new Set(), // 同步数组
      unselectedSet: new Set(), // 没有选中的集合
      info: {
        show: false,
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      },
    };
  },
  methods: {
    // [框选功能]
    // 由相对视窗的坐标计算相对可选区域的坐标
    getRelativePositionInElement(clientX, clientY) {
      // 获取选区对象
      const element = document.querySelector(this.listDomSelector);
      // 获取可选区域的坐标对象
      const rect = element.getBoundingClientRect();
      // 通过WIndow对象提供的getComputedStyle() 获取可选区域的的 CSS 样式
      let listStyle = window.getComputedStyle(element, null);
      // 获取可选区域的border-top和border-left
      const borderTop = parseFloat(listStyle.getPropertyValue("border-top"));
      const borderLeft = parseFloat(listStyle.getPropertyValue("border-left"));

      // 记录可选区域的left,top
      const { left, top } = rect;
      // 记录可选区域的内容区的left,top,width,height
      const { scrollLeft, scrollTop, scrollWidth, scrollHeight } = element;

      // 计算相对坐标
      // let x = clientX - left + scrollLeft - borderLeft
      // let y = clientY - top + scrollTop - borderTop
      let x = clientX - left + scrollLeft - borderLeft;
      let y = clientY - top + scrollTop - borderTop;
      // let x = clientX - left + scrollLeft
      // let y = clientY - top + scrollTop
      // console.log({
      //   scrollLeft,
      //   scrollTop,
      //   scrollWidth,
      //   scrollHeight
      // }, rect, window.event, { x, y });

      // 判断是否超出可选区域(防止超出区域)
      if (x < 0) {
        x = 0;
      } else if (x > scrollWidth) {
        x = scrollWidth;
      }
      if (y < 0) {
        y = 0;
      } else if (y > scrollHeight) {
        y = scrollHeight;
      }

      // 返回结果(去除小数部分保留整数,即只精确到像素)(节省资源开销)
      return {
        x: Math.round(x),
        y: Math.round(y),
      };
    },
    // 选区盒子的状态切换
    switchShowArea(value) {
      if (value === 0) {
        // value=0隐藏
        this.info.show = false;
      }
      if (value === 1) {
        // value=1显示
        this.info.show = true;
      }
    },
    // 判断两个矩形区域是否有交集
    twoRectsHaveIntersection(rect1, rect2) {
      const left1 = rect1.left;
      const left2 = rect2.left;
      const right1 = rect1.left + rect1.width;
      const right2 = rect2.left + rect2.width;

      const top1 = rect1.top;
      const top2 = rect2.top;
      const bottom1 = rect1.top + rect1.height;
      const bottom2 = rect2.top + rect2.height;

      const width1 = rect1.width;
      const width2 = rect2.width;
      const height1 = rect1.height;
      const height2 = rect2.height;

      // 没有交集的情况
      const noIntersection =
        left2 > right1 ||
        left1 > right2 ||
        bottom1 < top2 ||
        bottom2 < top1 ||
        width1 <= 0 ||
        width2 <= 0 ||
        height1 <= 0 ||
        height2 <= 0;

      return !noIntersection;
    },
    // 更新被选项目
    updateSelectItems() {
      // 获取选区div的坐标对象
      const areaRect = this.$refs.areaSelector.getBoundingClientRect();
      // 获取所有可选项
      const items = document
        .querySelector(this.listDomSelector)
        .querySelectorAll(".card");
      // console.log(items);
      // 对每个可选项进行判断
      items.forEach((item) => {
        // 获取可选项的坐标对象
        const itemRect = item.getBoundingClientRect();
        // 获取Key
        const index = Number(item.dataset.index);
        // 获取对象的vue实例
        const card = this.cardInfoList[index];

        // 判断可选项与选区div是否有交集
        const hasIntersection = this.twoRectsHaveIntersection(
          areaRect,
          itemRect
        );
        // 判断是否在上一次选中的结果中
        const isHasInLastTimeSelected = this.lastTimeSelectedSet.has(card);

        if (!this.ctrlKeyPressed) {
          // 没有按下ctrl
          if (hasIntersection) {
            // 与选区相交
            this.selectingInfo.tempCardSet.add(card);
          } else {
            // 与选区没有相交
            this.selectingInfo.tempCardSet.delete(card);
          }
        } else {
          // 按下了ctrl
          if (hasIntersection) {
            // 与选区相交
            if (isHasInLastTimeSelected) {
              // 在上一次选中的结果中
              this.selectingInfo.tempCardSet.delete(card);
            } else {
              // 不在上一次选中的结果中
              this.selectingInfo.tempCardSet.add(card);
            }
          } else {
            // 与选区没有相交
            if (isHasInLastTimeSelected) {
              // 在上一次选中的结果中
              this.selectingInfo.tempCardSet.add(card);
            } else {
              // 不在上一次选中的结果中
              this.selectingInfo.tempCardSet.delete(card);
            }
          }
        }
        [];
      });
      // console.log([...this.selectingInfo.tempCardSet].map(card => card.index));
    },
    // 选区盒子的信息获取
    updateArea() {
      // 计算div的top,left
      const top = Math.min(this.startPoint.y, this.endPoint.y);
      const left = Math.min(this.startPoint.x, this.endPoint.x);
      // 计算div的width,height
      const width = Math.abs(this.startPoint.x - this.endPoint.x);
      const height = Math.abs(this.startPoint.y - this.endPoint.y);
      // 设置选区div的top,left,width,height
      this.info.top = top;
      this.info.left = left;
      this.info.width = width;
      this.info.height = height;

      // 更新被选项目
      // this.updateSelectItems()
    },
    // 处理鼠标按下
    handleMouseDown(e) {
      // 获取选区对象
      const element = document.querySelector(this.listDomSelector);
      if (e.button != this.mouseKey || e.target != element) {
        return;
      }
      // 为可选区域添加鼠标按下事件(此处e为鼠标)
      const { clientX, clientY, ctrlKey } = e; //记录鼠标相对视窗的坐标和按下的按键
      // 记录是否按下ctrl键
      this.ctrlKeyPressed = ctrlKey;
      // 初始化被选id列表(缓存)和反选id列表
      // this.selectingInfo.tempCardSet = new Set(this.selectingInfo.cardSet)
      if (ctrlKey) {
        this.lastTimeSelectedSet = new Set(this.selectingInfo.cardSet);
      } else {
        this.selectingInfo.tempCardSet = new Set();
      }

      // 计算鼠标的起始位置(相对可选区域)
      this.startPoint = this.getRelativePositionInElement(clientX, clientY);
      // 先让鼠标的结束位置等于起始位置(初始化)
      this.endPoint = this.startPoint;
      // 更新选区div
      this.updateArea();
      // this.updateSelectItems()
      // 显示选区div
      this.switchShowArea(1);
      // 鼠标移动事件
      // [调用]在windows上添加鼠标移动事件
      window.addEventListener("mousemove", this.handleMouseMove);
      // [调用]抬起事件注册
      window.addEventListener("mouseup", this.handleMouseUp);
    },
    // 处理鼠标移动
    handleMouseMove(e) {
      const { clientX, clientY } = e; //记录鼠标相对视窗的坐标
      // 更新鼠标的结束位置(相对于可选区域)
      this.endPoint = this.getRelativePositionInElement(clientX, clientY);
      // 更新选区div
      this.updateArea();
      // 更新被选项目
      this.updateSelectItems();
      // 用于滚动
      this.scrollOnDrag(clientX, clientY);
    },
    // 处理鼠标抬起
    handleMouseUp(e) {
      if (e.button != this.mouseKey) {
        return;
      }
      // 鼠标抬起后移除鼠标移动的监听事件
      window.removeEventListener("mousemove", this.handleMouseMove);
      // 鼠标抬起后移除鼠标移动的监听事件
      window.removeEventListener("mouseup", this.handleMouseUp);
      // 隐藏选区div
      this.switchShowArea(0);
      // 更新结果
      this.selectingInfo.cardSet = new Set(this.selectingInfo.tempCardSet);
    },
    // 鼠标拖动过程中的可选区域滚动
    scrollOnDrag(mouseX, mouseY) {
      // 获取选区对象
      const element = document.querySelector(this.listDomSelector);
      const { x, y, width, height } = element.getBoundingClientRect();
      // x,y方向的滚动值
      let scrollX, scrollY;

      if (mouseX < x) {
        scrollX = mouseX - x;
      } else if (mouseX > x + width) {
        scrollX = mouseX - (x + width);
      }
      if (mouseY < y) {
        scrollY = mouseY - y;
      } else if (mouseY > y + height) {
        scrollY = mouseY - (y + height);
      }

      if (scrollX || scrollY) {
        // 滚动可选区域(将页面滚动至 相对于当前位置的 (scrollX,scrollY)位置)
        element.scrollBy({
          left: scrollX,
          top: scrollY,
          behavior: "auto",
        });
      }
    },
  },
};

// ?list的定义
const AppList = {
	components: {
		AppCard,
		AppPreViewer,
		AppSearchBox,
		AppRightClickMenu,
		AppAreaSelector,
	},
	template: /*html*/ `
  <!-- list列表 -->
  <div id="list" ref="list"
  :data-column-count="nowColumn"
  :style="{
  '--column-count':getStyle.columnCount,
  '--card-max-height':getStyle.cardMaxHeight,
  'scroll-snap-type':scrollSnapType,
  }"
  @contextmenu.prevent.native="(e)=>{e.preventDefault()}"
  @click="clickEvent"
  @mousedown="(e)=>{$refs.selector.handleMouseDown(e)}"
  @mouseup="clickEventRight"
  >
    <!-- card卡片 -->
    <app-card v-for="(card, index) in cardInfoList" :key="card.id"
      :card="card" 
      :index="index" 
      :listInfo="listInfo" 
      :selectingInfo="selectingInfo" 
      :searchInfo="searchInfo" 

      :data-previewed="preViewIndex==index" 
      :style="{'--ratio':card.scale}" 
      :class="{moving:dragSorting.index==index}" 
      :data-selected="selectingInfo.tempCardSet.has(card)" 
      
      :draggable="dragSorting.enable" 

      @click="cardClickEvent(card)"
      @dblclick="cardDblclickEvent(card)"
			@dragstart="dragStart"
			
      @dragover.prevent="dragEnterOrLeave" 
      @dragenter.prevent="dragEnterOrLeave" 
      
			@dragend.prevent="dragEnd"
    ></app-card>
    
    <!-- 框选工具 -->
    <app-area-selector ref="selector"
    :cardInfoList="cardInfoList"
    :selectingInfo="selectingInfo"
    :listDomSelector="'#list'"
    ></app-area-selector>
  </div>
  
  <!-- 预览器工具 -->
  <app-pre-viewer ref="preViewer"
    :cardInfoList="cardInfoList"
    :matchIndexList="getMatchIndexList"
    :onceLoadMaxCount="onceLoadMaxCount"
    :listInfo="listInfo"
    :selectingInfo="selectingInfo" 
    :searchInfo="searchInfo" 

    @requestLoadCard="(indexList)=>{verifyMultipleCard(indexList, false)}"
    @returnNowPreviewIndex="(index)=>{
			preViewIndex=index
			
			verifySingleCardMandatory(cardInfoList[index],()=>{
				$refs.preViewer.toCenterThumbBox()
			})
		}"
  ></app-pre-viewer>

    <!-- 搜索框 -->
  <app-search-box 
    :cardInfoList="cardInfoList"
    @returnMatchInfo="(value)=>{searchInfo = value}"
  ></app-search-box>

  <!-- 右键菜单 -->
  <app-right-click-menu ref="rightClickMenu"
    :selectingInfo="selectingInfo"
    @requestToShow="(index)=>{$refs.preViewer.toShow(index)}"
    @requestToVerifyCard="(card,updateVerify)=>{verifySingleCardMandatory(card)}"
    @requestRemoveCard="(card)=>{removeCard(card)}"
    @requestSetBackGround="(card,record)=>{sendAlterBackGroundRequest(card,record)}"
  ></app-right-click-menu>
  
  `,
	// ?要向父组件获取信息
	props: {
		cardInfoList: Object, // ?卡片信息
		cardDefaultaspectRatio: Number, // ?卡片默认宽高比
		selectingInfo: Object, // ?选中信息
		regex: Object, // ?正则表达式
		nowColumn: Number, // ?当前显示列数
		onceLoadMaxCount: Number, // ?最大单次加载数量
		btnInfo: Object, // ?按钮信息
	},
	emits: [
		"returnListInfo",
		// ?'requestCandidateBackGround',
		"alterBackGroundRequest",
		"requestRemoveCard",
	],
	data() {
		return {
			preViewIndex: -1,
			scrollSnapType: "none", // ?滚动贴合样式
			listInfo: {
				loadingQueueList: [], //* 动态加载队列
				visibleCardSet: new Set(),
				loadedCardSet: new Set(),
				unloadedCardSet: new Set(this.cardInfoList),
				visibleIndexListInMatched: [],
				unloadedIndexListInMatched: [],
			}, // ?列表信息
			searchInfo: {
				matchTag: [],
				matchCardSet: new Set(),
			}, // ?检索信息
			dragSorting: {
				enable: config.openDragSort, // ?是否启用拖拽排序
				tempTarget: null,
				tempTargetIndicator: null,
				index: null,
				targetIndex: null,
				item: null,
			}, // ?拖拽排序
		};
	},
	computed: {
		//f 获取样式list的计算属性
		getStyle() {
			let style = {
				columnCount: this.nowColumn,
				cardMaxHeight: "calc((100vh - 69px - 8px * (var(--column-count) - 1)) / var(--column-count))",
			};
			if (this.nowColumn <= 0) {
				style.cardMaxHeight = "1000%";
			}
			return style;
		},
		//f 匹配的index列表
		getMatchIndexList() {
			return [...this.searchInfo.matchCardSet].map((card) => card.index).sort((a, b) => a - b);
		},
	},
	watch: {
		"btnInfo.openScrollSnap"() {
			if (this.btnInfo.openScrollSnap && this.listInfo.unloadedIndexListInMatched.length <= 0) {
				this.scrollSnapType = null;
			} else {
				this.scrollSnapType = "none";
			}
		},
	},
	methods: {
		//f listInfo获取并生成合适的dom元素并且返回
		getListInfo() {
			// ?获取可见Card集Set
			const pageInfo = this.$refs.list.getBoundingClientRect(); // ?获取listPage信息
			this.$refs.list.querySelectorAll(".card").forEach((card) => {
				const cardInfo = card.getBoundingClientRect();
				if (this.twoRectsContains(pageInfo, cardInfo)) {
					this.listInfo.visibleCardSet.add(this.cardInfoList[Number(card.dataset.index)]);
				} else {
					this.listInfo.visibleCardSet.delete(this.cardInfoList[Number(card.dataset.index)]);
				}
			});

			// ?获取可见(匹配)index列表
			this.listInfo.visibleIndexListInMatched = [...this.listInfo.visibleCardSet]
				.filter((card) => {
					return this.searchInfo.matchCardSet.has(card);
				})
				.map((card) => card.index)
				.sort((a, b) => a - b);
			// ?获取未加载(匹配)index列表
			this.listInfo.unloadedIndexListInMatched = [...this.listInfo.unloadedCardSet]
				.filter((card) => {
					return this.searchInfo.matchCardSet.has(card);
				})
				.map((card) => card.index)
				.sort((a, b) => a - b);

			// ?向父组件返回数据的方法
			this.$emit("returnListInfo", this.listInfo);
		},
		//f 给所有卡片添加通用属性
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
		//f 判断rect1是否完整的包含rect2
		twoRectsContains(rect1, rect2, extraPadding = 0) {
			const left1 = rect1.left;
			const left2 = rect2.left;
			const right1 = rect1.left + rect1.width;
			const right2 = rect2.left + rect2.width;

			const top1 = rect1.top;
			const top2 = rect2.top;
			const bottom1 = rect1.top + rect1.height;
			const bottom2 = rect2.top + rect2.height;

			const width1 = rect1.width;
			const width2 = rect2.width;
			const height1 = rect1.height;
			const height2 = rect2.height;

			return top1 < top2 && bottom1 > bottom2 && left1 < left2 && right1 > right2;
		},
		//f (异步)获取图片、视频的信息
		getMediaRatio(url) {
			// ?卡片默认宽高比
			const cardDefaultaspectRatio = this.cardDefaultaspectRatio;
			// ?取得regex
			const regex = this.regex;
			//* 创建并返回异步实例
			return new Promise(function (resolve, reject) {
				if (url != null && url != "") {
					if (regex.isVideo.test(url)) {
						//* 视频类
						const video = document.createElement("video");
						video.src = url;
						video.oncanplay = function () {
							// ?返回一个对象：记录原始宽高以及宽高比
							const res = {
								state: "ok",
								width: video.videoWidth,
								height: video.videoHeight,
								scale: video.videoWidth / video.videoHeight,
							};
							// ?[视频类]获取参数成功返回对应信息
							resolve(res);
						};
						video.onerror = function () {
							const err = {
								state: "error",
								width: 0,
								height: 0,
								scale: cardDefaultaspectRatio,
							};
							// ?[视频类]获取参数失败返回预设信息
							reject(err);
						};
					} else {
						//* 图片类
						const img = new Image();
						img.src = url;
						if (img.complete) {
							// ?返回一个对象：记录原始宽高以及宽高比
							const res = {
								state: "ok",
								width: img.width,
								height: img.height,
								scale: img.width / img.height,
							};
							// ?[图片类]获取参数成功返回对应信息
							resolve(res);
						} else {
							img.onload = () => {
								// ?返回一个对象：记录原始宽高以及宽高比
								const res = {
									state: "ok",
									width: img.width,
									height: img.height,
									scale: img.width / img.height,
								};
								resolve(res);
							};
							img.onerror = () => {
								const err = {
									// ?返回一个对象：记录原始宽高以及宽高比
									state: "error",
									width: 1080 * cardDefaultaspectRatio,
									height: 1080,
									scale: cardDefaultaspectRatio,
								};
								reject(err);
							};
						}
					}
				}else{
					const err = {
						// ?返回一个对象：记录原始宽高以及宽高比
						state: "error",
						width: 1080 * cardDefaultaspectRatio,
						height: 1080,
						scale: cardDefaultaspectRatio,
					};
					reject(err);
				}
			});
		},
		//f 背景切换请求
		sendAlterBackGroundRequest(card, record = false) {
			this.$emit("alterBackGroundRequest", card, record);
		},
		//f 从给定数组中获取符条件的index列表
		getUnloadingIndexList({
			inputIndexList = [], // ?要查询的index列表
			limitedIndexList = [], // ?用于限定范围的index列表
			mode = "inner", // ?查询模式
			startIndex = 0, // ?起始index(非index列表的索引,而是index列表中的值)
			endIndex = 0, // ?结束index(非index列表的索引,而是index列表中的值)(可选)
			count = -1, // ?返回结果数量(-1表示全部)
			includeBounding = false, // ?是否包含starIndex和endIndex
			toReturn = false, //? 是否折返
		}) {
			let set = new Set();
			if (mode == "inner") {
				inputIndexList.forEach((value, index) => {
					let isMatch = false;
					let realIndex = limitedIndexList.indexOf(value); // ?在限定数组中的下标
					if (realIndex != -1) {
						//* 判断是否符合条件
						if (toReturn) {
							if (startIndex < 0) {
								isMatch = (realIndex > limitedIndexList.length - 1 + startIndex && realIndex <= limitedIndexList.length - 1) || isMatch;
							}
							if (endIndex > limitedIndexList.length - 1) {
								isMatch = (realIndex >= 0 && realIndex < endIndex - limitedIndexList.length - 1) || isMatch;
							}
						}
						// ?判断是否包含边界
						if (includeBounding) {
							isMatch = (realIndex >= startIndex && realIndex <= endIndex) || isMatch;
						} else {
							isMatch = (realIndex > startIndex && realIndex < endIndex) || isMatch;
						}
					}
					if (isMatch) {
						set.add(value);
					}
				});
			}
			let list = Array.from(set).sort((a, b) => a - b);
			if (count != -1 && list.length > count) {
				list = list.slice(0, count);
			}
			return list;
		},
		//f [轮询]加载队列(调用一次)
		loadingQueue(delay = 500) {
			let loadingQueueList = this.listInfo.loadingQueueList;
			let step = 10;
			let times = 0,
				max = this.onceLoadMaxCount / step;

			const handleAllRequest = async () => {
				//f 处理过程
				let handleOneRequest = async (card) => {
					if (card == null) {
						return;
					}
					//? 更新listInfo(防止重复添加项目)
					this.listInfo.loadedCardSet.add(card);
					this.listInfo.unloadedCardSet.delete(card);
					// console.log(card);
					let promiseListTemp = []; //* 临时请求队列
					let status = "ok"; //* 状态标识符
					if (!card.verified) {
						// ?图片、视频类的处理
						if (card.urlPicType === "img" || card.urlPicType === "video") {
							if (card.Width > 0 && card.Height > 0) {
								//* 尺寸有效直接赋值
								card.scale = card.Width / card.Height;
								// ?标记为metaInfo有效
								card.metaInfoAvailable = true;
							} else {
								//* 尺寸无效通过请求获取(需要请求)
								// ?向设置临时尺寸撑起card
								card.Width = 1080 * this.cardDefaultaspectRatio;
								card.Height = 1080;
								// ?异步获取尺寸
								let p = this.getMediaRatio(card.PicUrl);
								promiseListTemp.push(p); //! 加入请求队列
								p.then(
									(res) => {
										// ?[获取成功]
										// ?使用返回结果设置
										card.Width = res.width;
										card.Height = res.height;
										card.scale = res.width / res.height;
										// ?标记为metaInfo有效
										card.metaInfoAvailable = true;
									},
									(err) => {
										// ?[获取失败]
										// ?标记为metaInfo无效
										card.metaInfoAvailable = false;
									}
								);
							}
						} else {
							// ?其他类的处理
							// ?由于属于其他类型因此直接设置为默认宽高
							card.Width = 1080 * this.cardDefaultaspectRatio;
							card.Height = 1080;
							card.scale = this.cardDefaultaspectRatio;
							// ?标记为metaInfo无效
							card.metaInfoAvailable = false;
							card.verified = true;
						}
					} else {
						//* 居中缩略图轨道
						if (this.preViewIndex >= 0) {
							this.$refs.preViewer.toCenterThumbBox();
							// console.log(this.preViewIndex,card.index);
							if (this.preViewIndex == card.index) {
								//* 调整画布尺寸
								this.$refs.preViewer.toCenter();
							}
						}
					}
					//! 等待所有请求完成后再执行
					Promise.all(promiseListTemp).finally(() => {
						// console.log(times + 1, max);
						if (status == "ok") {
							//* 处理成功
							card.verified = true;
							// this.listInfo.loadedCardSet.add(card);
							// this.listInfo.unloadedCardSet.delete(card);
							//? 更新listInfo(防止重复添加项目)
							// this.listInfo.loadedCardSet.add(card);
							// this.listInfo.unloadedCardSet.delete(card);
							if (loadingQueueList.length) {
								times++;
								if (times > 0 && times < step) {
									//* 如果队列中还含有未处理的card则进行处理
									max = (this.onceLoadMaxCount / step) * (times + 1);
								} else if (times >= step) {
									max = this.onceLoadMaxCount;
								}
								//* 如果队列不为空则继续处理
								setTimeout(() => handleOneRequest(loadingQueueList.shift()), 100);
								//* 从队列头部取出一个进行处理
							} else {
								times = 0;
								//* 如果当前队列处理完成则进入循环等待过程
								setTimeout(handleAllRequest, delay);
							}
						} else {
							//* 如果处理失败则更新listInfo(移除失败项目)
							this.listInfo.loadedCardSet.delete(card);
							this.listInfo.unloadedCardSet.add(card);
						}
						//* 居中缩略图轨道
						if (this.preViewIndex >= 0) {
							this.$refs.preViewer.toCenterThumbBox();
							if (this.preViewIndex == card.index) {
								//* 调整画布尺寸
								this.$refs.preViewer.toCenter();
							}
						}
					});
				};
				if (!loadingQueueList.length) {
					times = 0;
					max = this.onceLoadMaxCount / step;
					//* 如果当前队列处理完成则进入循环等待过程
					setTimeout(handleAllRequest, delay);
				} else {
					for (let i = 0; i < loadingQueueList.length && i < max; i++) {
						handleOneRequest(loadingQueueList.shift()); //* 从队列头部取出一个进行处理
					}
				}
			};
			handleAllRequest(); //! 首次调用进入循环
		},
		//f [轮询]调度加载
		pollingLoading() {
			let delay = 1000;
			//* 执行函数
			let handle = () => {
				//* 更新信息
				this.getListInfo();
				//* 如果加载数量小于总卡片数量则执行
				let matchIndexList = [...this.searchInfo.matchCardSet].map((card) => card.index);
				//? 判断是否在浏览模式
				if (this.preViewIndex < 0) {
					//* 普通模式
					if (this.listInfo.loadedCardSet.size < this.cardInfoList.length) {
						const visibleIndexListInMatched = this.listInfo.visibleIndexListInMatched;
						let listIndex = [],
							startIndex = 0,
							endIndex = this.onceLoadMaxCount;
						// ?向查找"前中后"列表
						if (visibleIndexListInMatched.length > 0) {
							let realIndex1 = matchIndexList.indexOf(visibleIndexListInMatched[0]);
							let realIndex2 = matchIndexList.indexOf(visibleIndexListInMatched[visibleIndexListInMatched.length - 1]);
							startIndex = realIndex1 - this.onceLoadMaxCount;
							endIndex = realIndex2 + this.onceLoadMaxCount;
						}
						listIndex = this.getUnloadingIndexList({
							inputIndexList: this.listInfo.unloadedIndexListInMatched,
							limitedIndexList: Array.from(this.searchInfo.matchCardSet).map((card) => card.index),
							mode: "inner",
							targetParam: "value",
							startIndex: startIndex,
							endIndex: endIndex,
							count: this.onceLoadMaxCount,
							includeBounding: true,
						});
						// ?如果"前中后"都没有,则判断是否缓慢加载剩余项目
						if (listIndex < 1 && this.btnInfo.slowLoading) {
							listIndex = this.getUnloadingIndexList({
								inputIndexList: this.listInfo.unloadedIndexListInMatched,
								limitedIndexList: Array.from(this.searchInfo.matchCardSet).map((card) => card.index),
								mode: "inner",
								targetParam: "value",
								startIndex: 0,
								endIndex: this.cardInfoList.length,
								count: this.onceLoadMaxCount * 0.1,
								includeBounding: true,
							});
						}
						// console.log(listIndex);
						this.verifyMultipleCard(listIndex, false);
					}
				} else {
					//* 预览图片模式
					let realIndex = matchIndexList.indexOf(this.preViewIndex);
					startIndex = realIndex - this.onceLoadMaxCount;
					endIndex = realIndex + this.onceLoadMaxCount;
					listIndex = this.getUnloadingIndexList({
						inputIndexList: this.listInfo.unloadedIndexListInMatched,
						limitedIndexList: Array.from(this.searchInfo.matchCardSet).map((card) => card.index),
						mode: "inner",
						targetParam: "value",
						startIndex: startIndex,
						endIndex: endIndex,
						count: this.onceLoadMaxCount,
						includeBounding: true,
						toReturn: true,
					});
					// console.log(listIndex);
					this.verifyMultipleCard(listIndex, false);
				}

				//* 滚动吸附判断
				if (this.btnInfo.openScrollSnap && this.listInfo.unloadedIndexListInMatched.length <= 0) {
					this.scrollSnapType = null;
				} else {
					this.scrollSnapType = "none";
				}
			};
			//* 循环调度
			let timer = setInterval(handle, delay);
		},
		//f 多张卡片验证(非强制)
		verifyMultipleCard(cardList, cardMode = true) {
			if (cardMode) {
				this.listInfo.loadingQueueList.push(...cardList);
			} else {
				for (let i = 0, len = cardList.length; i < len; i++) {
					this.listInfo.loadingQueueList.push(this.cardInfoList[cardList[i]]);
				}
			}
		},
		//f 单张卡片的验证(强制)
		async verifySingleCardMandatory(card, callback = () => {}) {
			if (card == null) {
				return;
			}
			let promiseListTemp = [];
			// console.log(card.index);
			// ?图片、视频类的处理
			if (card.urlPicType === "img" || card.urlPicType === "video") {
				// ?异步获取尺寸
				let p = this.getMediaRatio(card.PicUrl);
				promiseListTemp.push(p);
				p.then(
					(res) => {
						// ?[获取成功]
						// ?使用返回结果设置
						card.Width = res.width;
						card.Height = res.height;
						card.scale = res.width / res.height;
						// ?标记为metaInfo有效
						card.metaInfoAvailable = true;
					},
					(err) => {
						// ?[获取失败]
						// ?标记为metaInfo无效
						card.metaInfoAvailable = false;
					}
				);
			} else {
				// ?其他类的处理
				// ?由于属于其他类型因此直接设置为默认宽高
				card.Width = 1080 * this.cardDefaultaspectRatio;
				card.Height = 1080;
				card.scale = this.cardDefaultaspectRatio;
				// ?标记为metaInfo无效
				card.metaInfoAvailable = false;
			}
			Promise.all(promiseListTemp).finally(() => {
				card.verified = true;
				this.listInfo.loadedCardSet.add(card);
				this.listInfo.unloadedCardSet.delete(card);
				callback();
			});
		},
		//f 全部重新验证
		reVerifyAllCard() {
			// ?console.log('收到请求');
			const handle = () => {
				// ?console.log('验证');
				this.listInfo.loadedCardSet.forEach((card) => {
					// console.log("重新验证ing");
					this.throttle(this.verifySingleCardMandatory(card), 1000);
				});
			};
			handle();
		},
		//f 加载剩余所有项目
		loadingRemaining() {
			if (this.listInfo.loadedCardSet.size >= this.cardInfoList.length) {
				alert("所有内容已加载！(若需要重新验证请点击“重新验证”按钮)");
				return;
			}
			const confirm = window.confirm("确认剩余加载所有?(如果内容数量过多可能造成严重卡顿，甚至卡死)");
			if (confirm) {
				this.listInfo.loadingQueueList.push(...Array.from(this.listInfo.unloadedCardSet));
			}
		},
		//f 判断元素是否是指定类的子元素(若是则返回对应的父元素)
		isChildOfTheSpecifiedClass(target, className) {
			let result = null;
			if (target.classList.contains(className)) {
				result = target;
			} else {
				if (target != document.body) {
					result = this.isChildOfTheSpecifiedClass(target.parentNode, className);
				}
			}
			// ?若没找到会返回null
			return result;
		},
		//f [card]发送卡片点击事件
		cardClickEvent(card) {
			const e = window.event;
			// 判断左右
			if (e.button == 0) {
				// 左键
				if (e.target.tagName != "A") {
					// 向父组件发送背景切换请求
					if (this.btnInfo.enableSwitchBackGround) this.sendAlterBackGroundRequest(card);
				}
				if (!this.selectingInfo.cardSet.has(card)) {
					this.selectingInfo.cardSet.add(card);
					this.selectingInfo.tempCardSet.add(card);
				} else {
					this.selectingInfo.cardSet.delete(card);
					this.selectingInfo.tempCardSet.delete(card);
				}
			}
		},
		//f 发送卡片双击事件
		cardDblclickEvent(card) {
			const e = window.event;
			if (e.target.tagName != "A") {
				// 向父组件发送toShow请求切换请求
				this.$refs.preViewer.toShow(card.index);
			}
		},
		//f 发送右键菜单事件
		clickEventRight() {
			const e = window.event;
			if (e.button == 2) {
				//? 右键
				const cardDom = this.isChildOfTheSpecifiedClass(e.target, "card");
				if (cardDom != null) {
					//? 获取对应的card对象
					const card = this.cardInfoList[Number(cardDom.dataset.index)];
					//? 向父组件请求右键菜单
					this.$refs.rightClickMenu.showMenu(e, card);
				}
			}
		},
		//f [拖拽排序](当标签属性draggable为true时才支持拖拽)
		//f 按下鼠标(按住card)
		dragStart(e) {
			console.log("开始拖拽");
			// console.log(e.target.classList.contains('card'));
			// ?获取拖拽对象对应的card
			const card = this.isChildOfTheSpecifiedClass(e.target, "card");
			// ?记录拖拽对象的index
			this.dragSorting.index = card.dataset.index;
			this.dragSorting.tempTarget = card;
			this.dragSorting.targetIndex = Number(card.dataset.index);
			if (this.dragSorting.index == null) {
				return;
			}
			// ?设置拖拽时候的样式
			// ?this.dragSorting.item
		},
		dragEnterOrLeave(e) {
			const _this = this;
			_this.throttle(fn(), 10000);
			function fn() {
				// e.preventDefault()
				// ?获取拖拽对象对应的card
				const card = _this.isChildOfTheSpecifiedClass(e.target, "card");
				// ?拖回到原来的位置,就什么也不做
				if (card == null || card.dataset.index === _this.dragSorting.index) {
					if (card.dataset.index === _this.dragSorting.index) {
						if (_this.dragSorting.tempTargetIndicator != null) {
							_this.dragSorting.tempTargetIndicator.left.dataset.hover = false;
							_this.dragSorting.tempTargetIndicator.right.dataset.hover = false;
						}
					}
					return;
				}
				// ?还原指示器
				if (_this.dragSorting.index != card.dataset.index && _this.dragSorting.tempTargetIndicator != null) {
					_this.dragSorting.tempTargetIndicator.left.dataset.hover = false;
					_this.dragSorting.tempTargetIndicator.right.dataset.hover = false;
				}
				// ?获取当前鼠标所在位置的可拖动项目的下标
				let targetIndex = Number(card.dataset.index);
				if (targetIndex == null) {
					return;
				}
				// ?获取目标的拖拽指示器
				_this.dragSorting.tempTargetIndicator = {
					left: card.querySelector(".card-mask-left"),
					right: card.querySelector(".card-mask-right"),
				};
				// ?获取目标的尺寸信息
				let targetInfo = card.getBoundingClientRect();
				// ?更新指示器(记录应该插入到前面还是后面)
				if (e.clientX < targetInfo.left + targetInfo.width / 2) {
					_this.dragSorting.tempTargetIndicator.left.dataset.hover = true;
					_this.dragSorting.tempTargetIndicator.right.dataset.hover = false;
					if (_this.dragSorting.index > targetIndex) {
						_this.dragSorting.targetIndex = targetIndex; //* 记录目标
					} else {
						_this.dragSorting.targetIndex = targetIndex - 1; //* 记录目标
					}
				} else {
					_this.dragSorting.tempTargetIndicator.left.dataset.hover = false;
					_this.dragSorting.tempTargetIndicator.right.dataset.hover = true;
					if (_this.dragSorting.index > targetIndex) {
						_this.dragSorting.targetIndex = targetIndex + 1; //* 记录目标
					} else {
						_this.dragSorting.targetIndex = targetIndex; //* 记录目标
					}
				}
				// console.log(_this.dragSorting.targetIndex);
			}
		},
		//f 拖动结束
		dragEnd(e) {
			// ?先保存被拖拽的元素
			this.dragSorting.item = this.cardInfoList[this.dragSorting.index];
			// ?删除原先位置
			this.cardInfoList.splice(this.dragSorting.index, 1);
			// ?然后判断插入位置
			this.cardInfoList.splice(this.dragSorting.targetIndex, 0, this.dragSorting.item);
			// ?参数还原
			this.dragSorting.index = null;
			this.dragSorting.item = null;
			if (this.dragSorting.tempTargetIndicator != null) {
				this.dragSorting.tempTargetIndicator.left.dataset.hover = false;
				this.dragSorting.tempTargetIndicator.right.dataset.hover = false;
				this.dragSorting.tempTargetIndicator == null;
			}
		},
		//f 全选函数
		selectionAll(mode = "all") {
			// ?所有全选
			if (mode === "all") {
				this.cardInfoList.forEach((card) => {
					this.selectingInfo.cardSet.add(card);
					this.selectingInfo.tempCardSet.add(card);
				});
			}
			// ?局部全选
			if (mode === "nowWindowAll") {
				this.searchInfo.matchCardSet.forEach((card) => {
					this.selectingInfo.cardSet.add(card);
					this.selectingInfo.tempCardSet.add(card);
				});
			}
		},
		//f 清空选中
		cleanSelection() {
			this.selectingInfo.cardSet = new Set();
			this.selectingInfo.tempCardSet = new Set();
		},
		//f 点击事件
		clickEvent(e) {
			this.$refs.rightClickMenu.closeMenu(e); //* 关闭菜单
		},
		//f 删除卡片请求
		removeCard(card) {
			this.$emit("requestRemoveCard", card);
		},
		//f 防抖函数
		debounce(fn, delay) {
			let timer;
			return function () {
				if (timer) {
					clearTimeout(timer);
				}
				timer = setTimeout(() => {
					fn();
				}, delay);
			};
		},
		//f 节流函数
		throttle(fn, delay) {
			let isThrottle = Vue.ref(true);
			return () => {
				if (!isThrottle.value) return;
				isThrottle.value = false;
				setTimeout(() => {
					fn();
				}, delay);
			};
		},
	},
	directives: {},
	mounted() {
		//f 先给指定数量(onceLoadMaxCount)的card进行有效性验证
		this.pollingLoading();
		this.loadingQueue();
	},
	beforeMount() {},
	created() {
		// ?给每张卡片初化始信息
		// this.initial_addGeneralAttributesForAllCards();
	},
	beforeCreate() {
		// console.log(this.cardInfoList);
	},
};

// 背景板的定义
const AppBackGroundBoard = {
  template:/*html*/`
  <div id="backGroundBoard" ref="backGroundBoard"
    :data-show-type="info.showType"
    :style="{
      'background-image':'url('+ info.imgUrl +')',
    }"
    @mousewheel="wheelInViewer"
  >
    <!-- 图片类背景用backGroundBoard容器自身显示 -->
    <!-- 视频类背景 -->
    <video id="backgroundVideo" ref="backgroundVideo" controls loop="loop" autoplay="true"
    :src="info.videoUrl"
    ></video>
  </div>
  `,
  props: {
    regex: Object,// 正则表达式
  },
  data() {
    return {
      info: {
        nsfw: false,
        showType: 'none',
        imgUrl: '',
        videoUrl: '',
      }
    }
  },
  methods: {
    // 更改body的背景(bodyDom操作)
    alterBackground(url) {
      let isOK = false
      // 判断url类型
      if (this.regex.isImg.test(url)) {
        this.info.imgUrl = `'${url}'`
        this.info.videoUrl = ''
        this.info.showType = 'img'
        isOK = true
      } else if (this.regex.isVideo.test(url)) {
        this.info.videoUrl = url
        this.info.imgUrl = ''
        this.info.showType = 'video'
        isOK = true
      } else {
        this.info.showType = 'none'
      }
      return isOK
    },
    // 鼠标滚动事件
    wheelInViewer(e) {
      // console.log(e);
      if (e.target.id == 'backgroundVideo') {
        if (e.wheelDelta > 0) {
          this.videoPlayerControl('volup')
        } else {
          this.videoPlayerControl('voldown')
        }
      }
    },
    // [视频播放器控制]
    videoPlayerControl(command, option) {
      // 获取视频播放器dom
      const videoEle = this.$refs.backgroundVideo
      videoEle.blur()
      const vol = 0.1 // 1代表100%音量，每次增减0.1
      const timeConst = 5 // 通常增量单位秒
      let time = timeConst
      if (option != undefined) {
        time = option
      }
      // [进度条控制]
      if (command == 'toback') {
        if (videoEle.currentTime - time > 0) {
          videoEle.currentTime = videoEle.currentTime - time
        } else {
          videoEle.currentTime = 0
        }
      }
      if (command == 'toforward') {
        if (videoEle.currentTime + time < videoEle.duration) {
          videoEle.currentTime = videoEle.currentTime + time
        } else {
          videoEle.currentTime = videoEle.duration
        }
      }
      // [音量控制]
      if (command == 'voldown') videoEle.volume =
        videoEle.volume - vol >= 0 ? videoEle.volume - vol : 0
      if (command == 'volup') videoEle.volume =
        videoEle.volume + vol <= 1 ? videoEle.volume + vol : 1
      if (command == 'mute') {
        if (videoEle.muted) {
          videoEle.muted = false
        } else {
          videoEle.muted = true
        }
      }
      // [播放控制]
      if (command == 'pause') videoEle.pause()
      if (command == 'play') videoEle.play()
      if (command == 'switch') {
        if (videoEle.paused) {
          videoEle.play()
        } else {
          videoEle.pause()
        }
      }

    },
  },
  created() {
    // 挂载首张背景图
    if (config.initialBackgroundIndexByCard >= 0) {
      this.alterBackground(cardInfoList[config.initialBackgroundIndexByCard].PicUrl)
    } else {
      for (let i = 0; i < cardInfoList.length; i++) {
        if (this.info.showType != 'none') {
          break
        }
        const card = cardInfoList[i];
        let url = card.PicUrl
        if (!this.alterBackground(url)) {
          url = card.LinkUrl
          this.alterBackground(url)
        }
      }
    }
  },
}
// zoomBar的定义
const AppZoomBar = {
  template:/*html*/`
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
    }
  },
  methods: {
    // 鼠标滚轮更改缩放条数值
    wheel(e) {

      // 获取当前列数
      let nowColumn = Math.round(this.value / 100 * this.maxColumn)
      if (e.wheelDelta > 0) {
        nowColumn--
      } else {
        nowColumn++
      }
      // 布局判断
      if (nowColumn > 0) {
        if (nowColumn <= this.maxColumn) {
          // 如果nowColumn>0&&nowColumn<=最大行数则正常赋值
          this.nowColumn = nowColumn
        }
      } else {
        // 如果nowColumn<=0则变换布局
        this.nowColumn = 0

        // …………(待续)
      }
      // 更新参数
      this.value = 100 * (this.nowColumn / this.maxColumn)
    }
  },
  watch: {
    'nowColumnInner'(newVal, oldVal) {
      // 行显示信息发送变化时向父组件发送新数据
      this.$emit('returnNowColumn', this.nowColumnInner)
    }
  },
  computed: {
    value: {
      get() {
        return (this.nowColumnInner / this.maxColumn) * 100
      },
      set(value) {
        this.nowColumnInner = Math.round((value / 100) * this.maxColumn)
      }
    },
  },
  mounted() {
    this.nowColumnInner = Math.round(this.maxColumn / 2)
  },
}
// 导航栏定义
const AppNavBar = {
  template:/*html*/`
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
  emits: [
    'returnBtnInfo',
    'returnOnceLoadingMax',
    'downloadRequest',
    'reVerifyAllCard',
    'toNormalMode',
    'allSelectRequest',
    'cleanSelectionRequest',
    'loadingRemainingRequest',
  ],
  computed: {
    getPercentage() {
      if (this.loadingState.nowCount == 0 || this.loadingState.allCount == 0) {
        return `0%`
      } else {
        return `${(this.loadingState.nowCount / this.loadingState.allCount) * 100}%`
      }

    },
    getOnceLoadingMax: {
      get() {
        return this.onceLoadMaxCount
      },
      set(value) {
        this.$emit('returnOnceLoadingMax', value)
      }
    },
  },
  data() {
    return {
      unfold: true,
      info: {
        openQuickerInteraction: config.openQuickerInteraction,
      },
      btn: {
        slowLoading: false,// 缓慢加载切换按钮
        NSFWMode: config.initNSFWState,// NSFW模式切换按钮
        cardTitleShow: config.initCardTitleState,// 卡片标题显示切换按钮
        enableSwitchBackGround:
          config.initClickSwBackgroundState, // "运行背景切换"切换按钮
        openScrollSnap: config.initOpenScrollSnap,// 滚动吸附切换按钮
        listPageShow: true,// 画廊显示切换按钮
      }
    }
  },
  watch: {
    btn: {
      handler(newVal, oldVal) {
        // console.log(newVal);
        this.$emit('returnBtnInfo', {
          slowLoading: newVal.slowLoading,
          enableSwitchBackGround: newVal.enableSwitchBackGround,
          openScrollSnap: newVal.openScrollSnap,
        })
      },
      deep: true //深度监听
    }
  },
  methods: {
    // 向父组件发送"下载"请求
    sendDownloadRequest() {
      this.$emit('downloadRequest')
    },
    // 向父组件发送"切换普通模式"请求
    sendToNormalModeRequest() {
      this.$emit('toNormalMode')
    },
    // 向父组件发送"全部重新验证"请求
    sendReVerifyAllCardRequest() {
      this.$emit('reVerifyAllCard')
    },
    // 向父组件发送"全选"请求
    sendAllSelectRequest(value) {
      this.$emit('allSelectRequest', value)
    },
    // 向父组件发送"清空选择"请求
    sendCleanSelectionRequest() {
      this.$emit('cleanSelectionRequest')
    },
    // 向父组件发送"记住剩余项"请求
    sendLoadingRemainingRequest() {
      this.$emit('loadingRemainingRequest')
    },
  },
  created() {
    this.$emit('returnBtnInfo', {
      slowLoading: this.btn.slowLoading,
      enableSwitchBackGround: this.btn.enableSwitchBackGround,
      openScrollSnap: this.btn.openScrollSnap,
    })
  },
}
// 标题栏定义
const AppHeaderBar = {
  template:/*html*/`
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
      default: '图库',
    },
    nowCount: Number,
    allCount: Number,
  },
  data() {
    return {
      loaded: false, // 加载完成情况
    }
  },
  watch: {
    nowCount(newVal, oldVal) {
      if (newVal >= this.allCount) {
        setTimeout(() => {
          this.loaded = true
        }, 2000)
      }
    }
  },
  computed: {
    // 百分比获取
    percentage() {
      if (this.nowCount == 0 || this.allCount == 0) {
        return `0%`
      } else {
        return `${(this.nowCount / this.allCount) * 100}%`
      }
    }
  },
  methods: {
    closeWindow() {
      window.close()
    }
  },
}
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
			cardInfoList: cardInfoList, // 卡片信息
			cardInfoListBackup: Array.from(cardInfoList), // 卡片信息备份
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
		// 给list组件传递的数据
		giveInfoToList() {
			return {
				cardInfoList: this.cardInfoList,
			};
		},
	},
	directives: {
		
	},
	mounted() {
		this.intiOK = true;
	},
	//? 创建时进行处理
	created() {
		//? 给每张卡片初化始信息
		this.initial_addGeneralAttributesForAllCards();
	},
};
