const debounce = (func, delay = 1000) => {
	let timeoutID;
	return (...args) => {
		if (timeoutID) {
			clearTimeout(timeoutID);
		}

		// 确保只有在一秒钟之内不输入新的字母时才会对现有的 value使用 fetchData对方法
		timeoutID = setTimeout(() => {
			func.apply(null, args);
		}, delay);
	};
};