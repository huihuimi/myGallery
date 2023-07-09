// 背景板的定义
const AppBackGroundBoard = {
	template: /*html*/ `
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
    cardInfoList:Object,
		regex: Object, // 正则表达式
	},
	data() {
		return {
			info: {
				nsfw: false,
				showType: "none",
				imgUrl: "",
				videoUrl: "",
			},
		};
	},
	methods: {
		// 更改body的背景(bodyDom操作)
		alterBackground(url) {
			let isOK = false;
			// 判断url类型
			if (this.regex.isImg.test(url)) {
				this.info.imgUrl = `'${url}'`;
				this.info.videoUrl = "";
				this.info.showType = "img";
				isOK = true;
			} else if (this.regex.isVideo.test(url)) {
				this.info.videoUrl = url;
				this.info.imgUrl = "";
				this.info.showType = "video";
				isOK = true;
			} else {
				this.info.showType = "none";
			}
			return isOK;
		},
		// 鼠标滚动事件
		wheelInViewer(e) {
			// console.log(e);
			if (e.target.id == "backgroundVideo") {
				if (e.wheelDelta > 0) {
					this.videoPlayerControl("volup");
				} else {
					this.videoPlayerControl("voldown");
				}
			}
		},
		// [视频播放器控制]
		videoPlayerControl(command, option) {
			// 获取视频播放器dom
			const videoEle = this.$refs.backgroundVideo;
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
	watch: {
		cardInfoList(newVal, oldVal) {
      console.log('更新');
			if (config.initialBackgroundIndexByCard >= 0) {
				this.alterBackground(cardInfoList[config.initialBackgroundIndexByCard].PicUrl);
			} else {
				for (let i = 0; i < cardInfoList.length; i++) {
					if (this.info.showType != "none") {
						break;
					}
					const card = cardInfoList[i];
					let url = card.PicUrl;
					if (!this.alterBackground(url)) {
						url = card.LinkUrl;
						this.alterBackground(url);
					}
				}
			}
		},
	},
	created() {
		
	},
};
// export {AppBackGroundBoard};
