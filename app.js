// ajax는 다른 서버의 데이터를 가져와 저장할 수 있게 돕는 도구

const container = document.getElementById('root');
const ajax = new XMLHttpRequest();
let NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
let CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';

function getData(url) {
  // ajax.open(응답방식, 주소, 비동기 boolean값)
  ajax.open('GET', url, false);
  ajax.send();

  // ajax.send() 이후 response로 JSON값을 받아올 수 있음
  return JSON.parse(ajax.response);
}

function newsDetail() {
  //location : 브라우저가 기본으로 제공하는 객체 (주소와 관련된 다양한 정보 제공)
  const id = location.hash.slice(1);

  const newsContent = getData(CONTENT_URL.replace('@id', id));

  container.innerHTML = `
      <h1>${newsContent.title}</h1>
  
      <div>
          <a href='#'>목록으로</a>
      </div>
    `;
}

function newsFeedFuc() {
  const newsFeed = getData(NEWS_URL);
  // 배열을 사용하여 li태그들을 다루는 방법
  const newsList = [];

  newsList.push('<ul>');

  for (let i = 0; i < 10; i++) {
    newsList.push(`
        <li>
            <a href="#${newsFeed[i].id}">${newsFeed[i].title} (${newsFeed[i].comments_count})</a>
        </li>
    `);
  }

  newsList.push('</ul>');

  container.innerHTML = newsList.join('');
}

function router() {
  const routePath = location.hash;

  // location.hash에 '#'만 들어있으면 빈 문자열을 반환
  if (routePath === '') {
    newsFeedFuc();
  } else {
    newsDetail();
  }
}

// 페이지 내의 hash(#)값(주소)이 변하면 실행되는 함수
window.addEventListener('hashchange', router);

router();
