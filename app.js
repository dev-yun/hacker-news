const container = document.getElementById('root');
const ajax = new XMLHttpRequest();
let NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
let CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const store = {
  currentPage: 1,
};

function getData(url) {
  // ajax.open(응답방식, 주소, 비동기 boolean값)
  ajax.open('GET', url, false);
  ajax.send();

  // ajax.send() 이후 response로 JSON값을 받아올 수 있음
  return JSON.parse(ajax.response);
}

function newsDetail() {
  //location : 브라우저가 기본으로 제공하는 객체 (주소와 관련된 다양한 정보 제공)
  const id = location.hash.slice(7);

  const newsContent = getData(CONTENT_URL.replace('@id', id));

  container.innerHTML = `
      <h1>${newsContent.title}</h1>
      <p>${newsContent.user}</p>
      <div>
          <a href='#/page/${store.currentPage}'>목록으로</a>
      </div>
    `;
}

function newsFeedFuc() {
  const newsFeed = getData(NEWS_URL);
  // 배열을 사용하여 li태그들을 다루는 방법
  const newsList = [];
  // 일관성 있는 태그를 만들기 위한 템플릿
  // {{}}은 마킹하기 위해 표시한 것으로 의미는 없다. (정해진 패턴도 없음)
  let template = `
    <div>
        <h1>Hacker News</h1>
        <ul>
            {{__news_feed__}}
        </ul>
        <div>
            <a href="#/page/{{__prev_page__}}">이전 페이지</a>
            <a href="#/page/{{__next_page__}}">다음 페이지</a>
        </div>
    </div>
  `;

  for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push(`
        <li>
            <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title} (${newsFeed[i].comments_count})</a>
        </li>
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

  container.innerHTML = template;
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
