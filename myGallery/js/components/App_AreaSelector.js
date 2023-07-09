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
			startPoint: {x: 0, y: 0}, // div选区的起始坐标(相对可选区域)
			endPoint: {x: 0, y: 0}, // div选区的结束坐标(相对可选区域)
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
			const {left, top} = rect;
			// 记录可选区域的内容区的left,top,width,height
			const {scrollLeft, scrollTop, scrollWidth, scrollHeight} = element;

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
			const noIntersection = left2 > right1 || left1 > right2 || bottom1 < top2 || bottom2 < top1 || width1 <= 0 || width2 <= 0 || height1 <= 0 || height2 <= 0;

			return !noIntersection;
		},
		// 更新被选项目
		updateSelectItems() {
			// 获取选区div的坐标对象
			const areaRect = this.$refs.areaSelector.getBoundingClientRect();
			// 获取所有可选项
			const items = document.querySelector(this.listDomSelector).querySelectorAll(".card");
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
				const hasIntersection = this.twoRectsHaveIntersection(areaRect, itemRect);
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
			const {clientX, clientY, ctrlKey} = e; //记录鼠标相对视窗的坐标和按下的按键
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
			const {clientX, clientY} = e; //记录鼠标相对视窗的坐标
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
			const {x, y, width, height} = element.getBoundingClientRect();
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
// export {AppAreaSelector};
