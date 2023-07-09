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
// export {AppPreViewer};
