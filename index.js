// 负责返回一个长的string(包含html tag),返回值会被赋值给innerHTML
const movieTemplate = movieDetail => {
	const dollars = parseInt(
		movieDetail.BoxOffice.replace(/\$/g, "").replace(/,/g, "")
	);
	const metascore = parseInt(movieDetail.Metascore);
	const rating = parseFloat(movieDetail.imdbRating);
	const votes = parseInt(movieDetail.imdbVotes.replace(/,/g, ""));

	let count = 0;
	movieDetail.Awards.split(" ").forEach(word => {
		if (isNaN(parseInt(word))) return;
		else count += parseInt(word);
	});
	const awards = count;
    // 在其中添加隐式的data proporty,用于parse data并储存,方便在 runComparision()方法中直接提取进行比较 
	return `
      <article class="media">
        <figure class="media-left">
          <p class="image">
            <img src="${movieDetail.Poster}" />
          </p>  
        </figure>
        <div class="media-content">
          <div class="content">
            <h1>${movieDetail.Title}</h1>
            <h4>${movieDetail.Genre}</h4>
            <p>${movieDetail.Plot}</p>
          </div>
        </div>
      </article>
      <article data-value=${awards} class="notification is-primary">
        <p class="title">${movieDetail.Awards}</p>
        <p class="subtitle">Awards</p>
      </article>
      <article data-value=${dollars} class="notification is-primary">
        <p class="title">${movieDetail.BoxOffice}</p>
        <p class="subtitle">Box Office</p>
      </article>
      <article data-value=${metascore} class="notification is-primary">
        <p class="title">${movieDetail.Metascore}</p>
        <p class="subtitle">Metascore</p>
      </article>
      <article data-value=${rating} class="notification is-primary">
        <p class="title">${movieDetail.imdbRating}</p>
        <p class="subtitle">IMDB Rating</p>
      </article>
      <article data-value=${votes} class="notification is-primary">
        <p class="title">${movieDetail.imdbVotes}</p>
        <p class="subtitle">IMDB Votes</p>
      </article>
    `;
};

let leftMovie;
let rightMovie;
// 用于获取关于某个特定电影(id)的相关信息, 并调用 movieTemplate func 来进行html格式操作
const onMovieSelect = async (movie, sideElement, side) => {
	const response = await axios.get("http://www.omdbapi.com/", {
		params: {
			apikey: "967cebcb",
			i: movie.imdbID
		}
	});
	const movieDetail = response.data;
	sideElement.innerHTML = movieTemplate(movieDetail);
	side === "left" ? (leftMovie = movieDetail) : (rightMovie = movieDetail);
	// 只有左右两侧movie都被定义时 才可以调用runComparision
	if (leftMovie && rightMovie) {
		runComparision();
	}
};

// 当两个电影搜索都有结果时调用此方程, 用于比较数据的大小, 并根据它改变颜色
const runComparision = () => {
    const leftTotlalData = document.querySelectorAll("#left-summary .notification");
    const rightTotlalData = document.querySelectorAll("#right-summary .notification");
    leftTotlalData.forEach((leftSingleData, index) => {
        const rightSingleData = rightTotlalData[index];
        //  in the DOM, all dataset values are stored as strings. 
        // 要使用parse method将其转换为number
        // 想要获取data-value 属性, 需要使用 ele.dataset.value
        const leftSideValue = parseFloat(leftSingleData.dataset.value);
        const rightSideValue = parseFloat(rightSingleData.dataset.value);

        if(isNaN(leftSideValue) && isNaN(rightSideValue)) return;
        // 把小的值所处的背景变为黄色(add "is-warning" class)
        if(leftSideValue > rightSideValue){
            rightSingleData.classList.remove("is-primary");
            rightSingleData.classList.add("is-warning");
        }else{
            leftSingleData.classList.remove("is-primary");
            leftSingleData.classList.add("is-warning");
        }
    })
};

const autoCompleteConfig = {
	renderOption(movie) {
		let imageSrc = movie.Poster;
		if (imageSrc === "N/A") imageSrc = "";
		return `
            <img src="${imageSrc}" /> ${movie.Title}(${movie.Year})
        `;
	},
	inputValue(movie) {
		return movie.Title;
	},
	// 用于从API中获取与keyword有关的电影的相关信息
	async fetchData(keyword) {
		const response = await axios.get("http://www.omdbapi.com/", {
			// 把所有要一起传递的parameters列在params object中. 会自动补在url结尾
			params: {
				apikey: "967cebcb",
				s: keyword
			}
		});
		/**
        当有error的时候,返回这样的object,所以只需要检查其中的Error属性
        正常情况下,没有error属性
        {
            "Response": "False",
            "Error": "Movie not found!"
        }
        */
		if (response.data.Error) {
			console.log("WE DID NOT FIND ANY MOVIE");
			return [];
		}
		const movies = response.data.Search;
		return movies;
	}
};

// 使用createAutoComplete.js中的方程去创建应用框架和结构
//这里储存application specific code(这个code会随着不同的application而改变)
createAutoComplete({
	root: document.querySelector("#left-autocomplete"),
	...autoCompleteConfig,
	// 将会有两个版本的onOptionSelect function, 因为要确定在点击时在哪一边显示对应的信息
	// 这里负责左侧搜索框
	onOptionSelect(movie) {
		// 由于实际改变html code发生在 onMovieSelect func 中, 所以在两个版本的 onOptionSelect中会
		// 传递第二个参数告诉仅一个版本的 onMovieSelect到底添加html到哪边
		onMovieSelect(movie, document.querySelector("#left-summary"), "left");
		document.querySelector(".tutorial").classList.add("is-hidden");
	}
});
createAutoComplete({
	root: document.querySelector("#right-autocomplete"),
	...autoCompleteConfig,
	// 这里负责右侧搜索框
	onOptionSelect(movie) {
		onMovieSelect(movie, document.querySelector("#right-summary"), "right");
		document.querySelector(".tutorial").classList.add("is-hidden");
	}
});
