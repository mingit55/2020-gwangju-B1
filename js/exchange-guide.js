Date.prototype.toCustomString = function(){
    let year = this.getFullYear();
    let month = this.getMonth() + 1;
    month = month < 10 ? "0" + month : month;
    let date = this.getDate();
    date = date < 10 ? "0" + date : date;

    return `${year}년 ${month}월 ${date}일`;
};

class App {
    constructor() { this.init() }
    async init(){
        this.dataList = document.querySelector(".data__list");
        this.btn_more = $(`<div class="text-center"><button class="btn--bordered mt-4 mx-auto">더 보기</button></div>`)[0];

        this.getExchangeRates().then(() => {
            this.append();
            this.setEvents();

            let ls__windowY = localStorage.getItem("windowY");
            if(ls__windowY) {
                let windowY = parseInt(ls__windowY);
                window.scrollTo(0, windowY);
            }
        });
    }
    
    // 이벤트 설정
    setEvents(){
        // 스크롤 이벤트
        $(window).on("scroll", e => {
            let winB = window.scrollY + window.innerHeight;
            let docH = document.body.offsetHeight;

            localStorage.setItem("windowY", window.scrollY);
            if(winB == docH) this.append();
        });

        // 더 보기 버튼
        this.btn_more.firstElementChild.addEventListener("click", e => {
            this.append();
        });
    }

    // 데이터 추가
    append(){
        this.btn_more.remove();
        this.dataList.innerHTML = "";

        let appended = this.hasList.splice(0, 10);
        this.viewList.push(...appended);
        this.viewList.forEach(item => {
            let elem = this.getListElement(item);
            this.dataList.append(elem);
        });

        if(this.hasList.length > 0) {
            this.dataList.append(this.btn_more);
        }

        this.save();
    }

    // 데이터를 List DOM으로 변환
    getListElement(data){
        return $(`<div class="list__row align-items-start ${data.result == 0 ? "list__row--active" : ""}">
                    <div class="list__no">${data.cur_unit}</div>
                    <div class="list__content">
                        <h5 class="font-weight-bold">${data.cur_nm}</h5>
                        <div class="row">
                            <div class="col-lg-3 col-6">
                                <span class="fx-n2 mr-2 text-muted">송금 시</span>
                                <span class="fx-n1">${data.ttb}</span>
                            </div>
                            <div class="col-lg-3 col-6">
                                <span class="fx-n2 mr-2 text-muted">수금 시</span>
                                <span class="fx-n1">${data.tts}</span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-lg-3 col-6">
                                <span class="fx-n2 mr-2 text-muted">매매 기준율</span>
                                <span class="fx-n1">${data.deal_bas_r}</span>
                            </div>
                            <div class="col-lg-3 col-6">
                                <span class="fx-n2 mr-2 text-muted">장부가격</span>
                                <span class="fx-n1">${data.bkpr}(${data.kftc_deal_bas_r})</span>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-lg-3 col-6">
                                <span class="fx-n2 mr-2 text-muted">년환가료율</span>
                                <span class="fx-n1">${data.yy_efee_r}</span>
                            </div>
                            <div class="col-lg-3 col-6">
                                <span class="fx-n2 mr-2 text-muted">10일환가료율</span>
                                <span class="fx-n1">${data.ten_dd_efee_r}</span>
                            </div>
                        </div>
                    </div>
                </div>`)[0];
    }

    // 환율 정보 조회
    getExchangeRates(){
        return new Promise(resolve => {
            let ls__exchange_data = localStorage.getItem("exchange_data");
            
            if(ls__exchange_data) {
                this.load();
                resolve();
            }
            else {
                fetch("/restAPI/currentExchangeRate.php")
                    .then(res => res.json())
                    .then(jsonData => {
                        let ymd = jsonData.dt.split(" ")[0];
                        this.updated_at = new Date(ymd);
                        console.log(ymd, this.updated_at);
                        this.hasList = jsonData.items.map((item, idx) => {
                            item.id = idx + 1;
                            return item;
                        });
                        this.viewList = [];
                        document.querySelector(".updated-at").innerText = this.updated_at.toCustomString();

                        this.save();
                        resolve();
                    });
            }

        });
    }

    load(){
        let ls__exchange_data = localStorage.getItem("exchange_data");
        let {updated_at, hasList, viewList} = JSON.parse(ls__exchange_data);
        this.updated_at = new Date(updated_at);
        this.hasList = hasList;
        this.viewList = viewList;
        
        document.querySelector(".updated-at").innerText = this.updated_at.toCustomString();
    }


    save(){
        localStorage.setItem("exchange_data", JSON.stringify({
            updated_at: this.updated_at.getTime(), 
            hasList: this.hasList,
            viewList: this.viewList
        }));
    }
}

window.addEventListener("load", e => {
    let app = new App();
});