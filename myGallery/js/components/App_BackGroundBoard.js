// import { config } from "../config.js";
// 背景板的定义
const AppBackGroundBoard = {
	template: /*html*/ `
  <div id="backGroundBoard" ref="backGroundBoard"
    :data-show-type="info.showType"
    @mousewheel="wheelInViewer"
  >
    <!-- 图片类背景 -->
		<div id="backgroundImg" ref="backgroundImg"
			:data-show="info.show&&info.imgUrl!=''"
			:style="{
				'background-image':'url('+ info.imgUrl +')',
			}"
		></div>
    <!-- 视频类背景 -->
    <video id="backgroundVideo" ref="backgroundVideo" controls loop="loop" autoplay="true"
		:data-show="info.show&&info.videoUrl!=''"
    :src="info.videoUrl"
    ></video>
  </div>
  `,
	props: {
		cardInfoList: Object,
		regex: Object, // 正则表达式
	},
	data() {
		return {
			info: {
				nsfw: false,
				show: false,
				showType: "none",
				imgUrl: "",
				videoUrl: "",
			},
		};
	},
	methods: {
		//f 初始化背景
		async initialBackground() {
			if (config.initialBackgroundIndexByCard >= 0) {
				let url = this.cardInfoList[config.initialBackgroundIndexByCard].LinkUrl
				let isOK = await this.alterBackground(url)
				if (!isOK) {
					url = this.cardInfoList[config.initialBackgroundIndexByCard].PicUrl
					await this.alterBackground(url)
				}
			} else {
				for (let i = 0; i < this.cardInfoList.length; i++) {
					if (this.info.showType != "none") {
						break;
					}
					const card = this.cardInfoList[i];
					let url = card.LinkUrl;
					let isOK = await this.alterBackground(url)
					if (!isOK) {
						url = card.PicUrl;
						await this.alterBackground(url);
					}
				}
			}
		},
		// 更改body的背景(bodyDom操作)
		async alterBackground(url) {
			let isOK = false;
			let promiseListTemp = []//* 请求列表
			//* 记录旧数据
			let old = {
				showType: 'none',
				imgUrl: '',
				videoUrl: '',
			}
			if (this.info.showType == 'img') {
				old.showType = 'img'
				old.imgUrl = this.info.imgUrl
			} else if (this.info.showType == 'video') {
				old.showType = 'video'
				old.videoUrl = this.info.videoUrl
			}
			this.info.show = false
			//* 判断url类型并尝试更换
			if (this.regex.isImg.test(url)) {
				this.info.imgUrl = `'${url}'`;
				this.info.videoUrl = "";
				this.info.showType = "img";
				let p = new Promise((resolve, reject) => {
					let img = new Image()
					img.src = url
					if (img.complete) {
						resolve(true)
						img = null
					} else {
						img.onload = () => {
							img = null
							resolve(true)
						}
						img.onerror = () => {
							img = null
							reject(false)
						}
					}
				})
				promiseListTemp.push(p)
				isOK = await p
			} else if (this.regex.isVideo.test(url)) {
				this.info.videoUrl = url;
				this.info.imgUrl = "";
				this.info.showType = "video";
				const videoEle = this.$refs.backgroundVideo
				let p = new Promise((resolve, reject) => {
					videoEle.oncanplay = () => {
						resolve(true)
					}
					videoEle.onerror = () => {
						reject(false)
					}
					// console.log(videoEle.error);
				})
				promiseListTemp.push(p)
				isOK = await p
			} else {
				this.info.showType = "none";
			}

			if (!isOK) {
				//* 失败则还原数据
				this.info.showType = old.showType
				this.info.imgUrl = old.imgUrl
				this.info.videoUrl = old.videoUrl
			}
			this.info.show = true
			return isOK

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
			// console.log('更新');
			this.initialBackground()
		},
	},
	created() { },
};
// export { AppBackGroundBoard };
