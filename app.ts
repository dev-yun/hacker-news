interface Store {
  currentPage : number;
  // 배열만 타입으로 지정하면 배열내에 어떤 값이 들어갈지 알 수 없으니 명확히 타입을 명시하는 것이 좋다.
  feeds : NewsFeed[];
}

interface News {
  readonly id : number;
  readonly comments_count : number;
  readonly title : string;
  readonly time_ago : string;
  readonly points : number;
  readonly url : string;
  readonly user : string;  
  readonly domain : string;
  readonly time : number;
  readonly type : string;
}

interface NewsFeed extends News {
  // ?는 있을때도 있고 없을때도 있다는 optional형식을 의미
  read? : boolean;
}

interface NewsDetail extends News {
  readonly comments : NewsComment[];
  readonly content : string;
}

interface NewsComment extends NewsDetail {
  readonly level : number;
}

const container: HTMLElement | null = document.getElementById('root');
const ajax: XMLHttpRequest = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const store: Store = {
  currentPage: 1,
  feeds: [],
};

function applyApiMixins(targetClass: any, baseClasses: any[]): void{
  baseClasses.forEach(baseClass => {
    Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
      const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);

      if(descriptor){
        Object.defineProperty(targetClass.prototype, name, descriptor);
      }
    });
  })
}

class Api {
  getRequest<AjaxResponse>(url: string): AjaxResponse{
    const ajax = new XMLHttpRequest();
    // ajax.open(응답방식, 주소, 비동기 boolean값)
    ajax.open('GET', url, false);
    ajax.send();

    // ajax.send()로 받아온 JSON 파일을 객체로 변환하여 반환
    return JSON.parse(ajax.response);
  }
}

class NewsFeedApi{
  getData(): NewsFeed[]{
    return this.getRequest<NewsFeed[]>(NEWS_URL);
  }
}

class NewsDetailApi{
  getData(id: string): NewsDetail{
    return this.getRequest<NewsDetail>(CONTENT_URL.replace('@id', id));
  }
}

interface NewsFeedApi extends Api {};
interface NewsDetailApi extends Api {};
applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);

// NEWS_URL로 받아온 데이터에 read라는 속성을 추가하고 false로 초기화
function makeFeeds(feeds: NewsFeed[]): NewsFeed[] {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }
  return feeds;
}

function updateView(html: string): void{
  if(container){
    container.innerHTML = html;
  }else{
    console.error("최상위 컨테이너가 없어 UI를 만들지 못합니다.")
  }
}

function newsDetail(): void {
  //location : 브라우저가 기본으로 제공하는 객체 (주소와 관련된 다양한 정보 제공)
  const id = location.hash.slice(7);
  const api = new NewsDetailApi();

  const newsContent = api.getData(id);

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

  updateView(template.replace(
    '{{__comments__}}',
    makeComment(newsContent.comments)
  ));
}

function makeComment(comments: NewsComment[]): string {
  const commentString = [];

  for (let i = 0; i < comments.length; i++) {
    const comment: NewsComment = comments[i]
    commentString.push(`
        <div class="p-6 bg-gray-200 mt-6 rounded-lg shadow-md transition-colors duration-500">
          <div style="padding-left : ${comment.level * 40}px;" class="mt-4">
              <div class="text-gray-400">
                  <i class="fa fa-sort-up mr-2"></i>
                  <strong>${comment.user}</strong> 
                  ${comment.time_ago}
              </div>
              <p class="text-gray-700">${comment.content}</p>
          </div>
        </div>      
    `);

    if (comment.comments.length > 0) {
      commentString.push(makeComment(comment.comments));
    }
  }

  return commentString.join(' ');
}

function newsFeedFuc():void {
  const api = new NewsFeedApi();
  let newsFeed: NewsFeed[] = store.feeds;
  // 배열을 사용하여 li태그들을 다루는 방법
  const newsList: string[] = [];

  if (newsFeed.length === 0) {
    newsFeed = store.feeds = makeFeeds(api.getData());
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
    String(store.currentPage > 1 ? store.currentPage - 1 : store.currentPage)
  );
  template = template.replace(
    '{{__next_page__}}',
    String(store.currentPage * 10 < newsFeed.length
      ? store.currentPage + 1
      : store.currentPage)
  );

  updateView(template);
}

function router(): void {
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
