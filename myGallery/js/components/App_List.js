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
  <app-search-box ref="searchBox"
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
				} else {
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
	watch: {
		cardInfoList(newVal, oldVal) {
			this.listInfo.unloadedCardSet = new Set(newVal); //* 更新list中的未加载集合
		},
	},
	directives: {},
	mounted() {
		//f 先给指定数量(onceLoadMaxCount)的card进行有效性验证
		this.pollingLoading();
		this.loadingQueue();
	},
	updated() {},
	beforeMount() {},
	created() {
		// ?给每张卡片初化始信息
		// this.initial_addGeneralAttributesForAllCards();
	},
	beforeCreate() {
		// console.log(this.cardInfoList);
	},
};
// export {AppList};
