// 搜索框定义
const AppSearchBox = {
	template: /*html*/ `
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
		cardInfoList: Object,
	},
	emits: ["returnMatchInfo"],
	data() {
		return {
			content: "",
			oldContent: "",
			matchTags: [],
			matchCardSet: new Set(),
			matchCount: 0,
		};
	},
	methods: {
		//f 触发搜索事件
		async sendSearchResult() {
			// 获取结果并更新标记
			await this.getMatchIndexList(this.matchTags);
			// console.log(this.cardInfoList,this.matchCardSet);
			// 并发送新结果给父组件
			this.$emit("returnMatchInfo", {
				matchTags: this.matchTags,
				matchCardSet: this.matchCardSet,
			});
		},
		//f 获取匹配信息
		async getMatchIndexList(matchTags = []) {
			this.cardInfoList.forEach((card) => {
				let isMatch = false;
				if (matchTags.length > 0) {
					for (let i = 0, len = matchTags.length; i < len; i++) {
						const matchTag = matchTags[i];
						if (card.Content.toLowerCase().includes(matchTag.toLowerCase()) || card.index + 1 == Number(matchTag)) {
							isMatch = true;
						}
					}
				} else {
					// 如果匹配关键词小于1则默认全部匹配
					isMatch = true;
				}
				if (isMatch) {
					this.matchCardSet.add(card);
				} else {
					this.matchCardSet.delete(card);
				}
			});
		},
		//f 清空
		async clean() {
			this.content = "";
			this.matchCount = 0;
			this.matchCardSet = new Set();
			this.cardInfoList.forEach((card) => {
				this.matchCardSet.add(card);
			});
			this.$emit("returnMatchInfo", {
				matchTags: this.matchTags,
				matchCardSet: this.matchCardSet,
			});
		},
	},
	computed: {
		getMatchCount() {
			return this.cardInfoList.filter((card) => {
				let isMatch = false;
				if (this.matchTags.length > 0) {
					for (let i = 0, len = this.matchTags.length; i < len; i++) {
						const matchTag = this.matchTags[i];
						if (card.Content.toLowerCase().includes(matchTag.toLowerCase()) || card.index + 1 == Number(matchTag)) {
							isMatch = true;
						}
					}
				} else {
					// 如果匹配关键词小于1则默认全部匹配
					isMatch = true;
				}
				return isMatch;
			}).length;
		},
	},
	watch: {
		//f 监视cardInfoList变化
		cardInfoList(newVal, oldVal) {
			this.clean();
		},
		//f 监视content变化(实时获取匹配结果)
		content(newVal, oldVal) {
			if (newVal == oldVal) {
				return;
			}
			// 获取匹配关键词
			if (newVal.includes("|")) {
				this.matchTags = newVal.split("|");
			} else {
				this.matchTags[0] = newVal;
			}
		},
	},
	mounted() {
		this.getMatchIndexList(); //首次运行先进行一次搜索结果更新
		this.sendSearchResult(); // 并发送新结果给父组件
	},
};
// export {AppSearchBox};
