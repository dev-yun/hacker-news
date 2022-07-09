// ajax는 다른 서버의 데이터를 가져와 저장할 수 있게 돕는 도구

const container = document.getElementById('root');
const ajax = new XMLHttpRequest();
const content = document.createElement('div');
let NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
let CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';

// ajax.send() 이후 response로 JSON값을 받아올 수 있음
const newsFeed = getData(NEWS_URL);
const ul = document.createElement('ul');

// 페이지 내의 hash(#)값(주소)이 변하면 실행되는 함수
window.addEventListener('hashchange', function () {
  //location : 브라우저가 기본으로 제공하는 객체 (주소와 관련된 다양한 정보 제공)
  const id = location.hash.slice(1);

  const newsContent = getData(CONTENT_URL.replace('@id', id));
  const title = document.createElement('h1');

  title.innerHTML = newsContent.title;

  content.appendChild(title);
});

for (let i = 0; i < 10; i++) {
  const div = document.createElement('div');

  div.innerHTML = `
    <li>
        <a href="#${newsFeed[i].id}">${newsFeed[i].title} (${newsFeed[i].comments_count})</a>
    </li>
  `;

  ul.appendChild(div.firstElementChild);
}

container.appendChild(ul);
container.appendChild(content);

function getData(url) {
  // ajax.open(응답방식, 주소, 비동기 boolean값)
  ajax.open('GET', url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}
