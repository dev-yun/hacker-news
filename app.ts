type Store = {
  currentPage : number;
  // 배열만 타입으로 지정하면 배열내에 어떤 값이 들어갈지 알 수 없으니 명확히 타입을 명시하는 것이 좋다.
  feeds : NewsFeed[];
}

type NewsFeed = {
  id : number;
  comments_count : number;
  title : string;
  time_ago : string;
  points : number;
  url : string;
  user : string;  
  // ?는 있을때도 있고 없을때도 있다는 optional형식을 의미
  read? : boolean;
}

const container: HTMLElement | null = document.getElementById('root');
const ajax: XMLHttpRequest = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const store: Store = {
  currentPage: 1,
  feeds: [],
};

function getData(url) {
  // ajax.open(응답방식, 주소, 비동기 boolean값)
  ajax.open('GET', url, false);
  ajax.send();

  // ajax.send() 이후 response로 JSON값을 받아올 수 있음
  return JSON.parse(ajax.response);
}

// NEWS_URL로 받아온 데이터에 read라는 속성을 추가하고 false로 초기화
function makeFeeds(feeds) {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }
  return feeds;
}

function updateView(html){
  if(container){
    container.innerHTML = html;
  }else{
    console.error("최상위 컨테이너가 없어 UI를 만들지 못합니다.")
  }
}

function newsDetail() {
  //location : 브라우저가 기본으로 제공하는 객체 (주소와 관련된 다양한 정보 제공)
  const id = location.hash.slice(7);

  const newsContent = getData(CONTENT_URL.replace('@id', id));

  let template = `
        <div class="bg-gray-600 min-h-screen pb-8">
            <div class="bg-white text-xl">
                <div class="mx-auto px-4">
                    <div class="flex justify-between items-center py-6">
                        <div class="flex justify-start">
                        <h1 class="font-extrabold">Hacker News</h1>
                        </div>
                        <div class="items-center justify-end">
                        <a href="#/page/${store.currentPage}" class="text-gray-500">
                            <i class="fa fa-times"></i>
                        </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="h-full border rounded-xl bg-white m-6 p-4 ">
                <h1>${newsContent.title}</h1>
                <div class="text-gray-400 h-20">
                    ${newsContent.content}
                </div>

                {{__comments__}}

            </div>
        </div>
    `;

  for (let i = 0; i < store.feeds.length; i++) {
    if (store.feeds[i].id === Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }

  // called : 함수가 호출된 횟수를 기록하는 매개변수
  function makeComment(comments, called = 0) {
    const commentString = [];

    for (let i = 0; i < comments.length; i++) {
      commentString.push(`
          <div class="p-6 bg-gray-200 mt-6 rounded-lg shadow-md transition-colors duration-500">
            <div style="padding-left : ${called * 40}px;" class="mt-4">
                <div class="text-gray-400">
                    <i class="fa fa-sort-up mr-2"></i>
                    <strong>${comments[i].user}</strong> 
                    ${comments[i].time_ago}
                </div>
                <p class="text-gray-700">${comments[i].content}</p>
            </div>
          </div>      
      `);

      if (comments[i].comments.length > 0) {
        commentString.push(makeComment(comments[i].comments, called + 1));
      }
    }

    return commentString.join(' ');
  }
  template = template.replace(
    '{{__comments__}}',
    makeComment(newsContent.comments)
  );

  updateView(template);
}

function newsFeedFuc() {
  let newsFeed: NewsFeed[] = store.feeds;
  // 배열을 사용하여 li태그들을 다루는 방법
  const newsList = [];

  if (newsFeed.length === 0) {
    newsFeed = store.feeds = makeFeeds(getData(NEWS_URL));
  }

  // 일관성 있는 태그를 만들기 위한 템플릿
  // {{}}은 마킹하기 위해 표시한 것으로 의미는 없다. (정해진 패턴도 없음)
  let template = `
    <div class="bg-gray-600 min-h-screen">
        <div class="bg-white text-xl">
            <div class="mx-auto px-4">
                <div class="flex justify-between items-center py-6">
                    <div class="flex justify-start">
                        <h1 class="font-extrabold">Hacker News</h1>
                    </div>
                    <div class="items-center justify-end">
                        <a href="#/page/{{__prev_page__}}" class="text-gray-500">
                            Previous
                        </a>
                        <a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
                            Next
                        </a>
                    </div>
                </div> 
            </div>
        </div>
        <div class="p-4 text-2xl text-gray-700">
            {{__news_feed__}}        
        </div>
    </div>
  `;

  for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push(`
        <div class="p-6 ${
          newsFeed[i].read ? 'bg-gray-300' : 'bg-white'
        } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
            <div class="flex">
            <div class="flex-auto">
                <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
            </div>
            <div class="text-center text-sm">
                <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${
                  newsFeed[i].comments_count
                }</div>
            </div>
            </div>
            <div class="flex mt-3">
            <div class="grid grid-cols-3 text-sm text-gray-500">
                <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
                <div><i class="fas fa-heart mr-1"></i>${
                  newsFeed[i].points
                }</div>
                <div><i class="far fa-clock mr-1"></i>${
                  newsFeed[i].time_ago
                }</div>
            </div>  
            </div>
        </div> 
    `);
  }

  template = template.replace('{{__news_feed__}}', newsList.join(''));
  template = template.replace(
    '{{__prev_page__}}',
    store.currentPage > 1 ? store.currentPage - 1 : store.currentPage
  );
  template = template.replace(
    '{{__next_page__}}',
    store.currentPage * 10 < newsFeed.length
      ? store.currentPage + 1
      : store.currentPage
  );

  updateView(template);
}

function router() {
  const routePath = location.hash;

  // location.hash에 '#'만 들어있으면 빈 문자열을 반환
  if (routePath === '') {
    newsFeedFuc();
  } else if (routePath.indexOf('#/page/') >= 0) {
    store.currentPage = Number(routePath.slice(7));
    newsFeedFuc();
  } else {
    newsDetail();
  }
}

// 페이지 내의 hash(#)값(주소)이 변하면 실행되는 함수
window.addEventListener('hashchange', router);

router();
