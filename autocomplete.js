// root: 那里去防止autocomplete
// renderOption: 如何对于individual item产生html
// onOptionSelect: 定义点击以后的操作
// inputValue:  在点击后在搜索栏应该变为的内容
// fetchData: 如何提取数据
const createAutoComplete = ({root, renderOption, onOptionSelect, inputValue, fetchData}) => {
	// 添加创造搜索框的code
	root.innerHTML = `
        <label><b>Search For A Movie</b></label>
        <input id="movieSearch" class="input"/>
        <div class="dropdown">
        <div class="dropdown-menu">
        <div class="dropdown-content results"></div>
        </div>
        </div>
    `;

	// 选取传入的root element中需要的DOM元素
	const input = root.querySelector("#movieSearch");
	const dropdown = root.querySelector(".dropdown");
	const resultsWrapper = root.querySelector(".results");

	const onInput = async event => {
		const items = await fetchData(event.target.value);
		// 处理empty response, 指当我们输入查找一个结果后然后删除查找的内容,底下的dropdown也会消失
		if (items.length === 0) {
			//用其中的is-active class来控制dropdown的出现或消失
			dropdown.classList.remove("is-active");
			return;
		}
		// 每次清空 resultsWrapper 中的内容, 确保再次搜索时不会叠加内容
		resultsWrapper.innerHTML = "";
		// 添加css属性'is-active'使它可见
        dropdown.classList.add("is-active");
        
		items.forEach(item => {
			const option = document.createElement("a");
			option.classList.add("dropdown-item");
			option.innerHTML = renderOption(item);
			resultsWrapper.appendChild(option);
			option.addEventListener("click", () => {
				dropdown.classList.remove("is-active");
				input.value = inputValue(item);
				onOptionSelect(item);
			});
		});
	};

	// 使用 input能使在text改变时实时更新
	input.addEventListener("input", debounce(onInput, 500));

	// 给整体添加click事件,当root element群组不包含你所点击的地方,则取消 dropdown-menu
	document.addEventListener("click", event => {
		// event.target获取正在点击的element
		if (!root.contains(event.target)) {
			dropdown.classList.remove("is-active");
		}
	});
};
