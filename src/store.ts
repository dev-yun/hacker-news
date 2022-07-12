import { NewsFeed, NewsStore } from "./types";

// 클래스로만 만들어 사용할 수 있지만 외부에서 직접 제어할 수 있으므로 보안상 위험하다.
// private로 방어를 해야함
export default class Store implements NewsStore{
    private feeds: NewsFeed[];
    private _currentPage: number;

    constructor() {
        this.feeds = [];
        this._currentPage = 1;
    }

    get currentPage(): number {
        return this._currentPage;
    }

    set currentPage(page: number) {
        this._currentPage = page;
    }

    get nextPage(): number {
        return this._currentPage * 10 < this.feeds.length
        ? this._currentPage + 1
        : this._currentPage;
    }

    get prevPage(): number {
        return this._currentPage > 1 ? this._currentPage - 1 : 1;
    }

    get numberOfFeed(): number {
        return this.feeds.length;
    }

    get hasFeeds(): boolean {
        return this.feeds.length > 0;
    }

    getAllFeeds(): NewsFeed[] {
        return this.feeds;
    }

    getFeed(position: number): NewsFeed {
        return this.feeds[position];
    }

    setFeeds(feeds: NewsFeed[]): void{
        this.feeds = feeds.map(feed => ({
            ...feed,
            read: false
        }));
    }

    makeRead(id: number): void {
       const feed = this.feeds.find((feed: NewsFeed) => feed.id === id);

       if(feed) feed.read = true;
    }
};