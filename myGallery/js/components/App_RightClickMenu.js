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
	emits: ["requestToShow", "requestToVerifyCard", "requestRemoveCard", "requestSetBackGround"],
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
			const {clientX, clientY} = e;
			this.info.top = clientY;
			this.info.left = clientX;
			this.info.show = true;

			// 记录右键时点击的目标
			this.targetCard = card;
		},
		closeMenu(e) {
			if (!e.target.classList.contains("right-click-menu") && !e.target.classList.contains("menu-option")) {
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
// export {AppRightClickMenu};
