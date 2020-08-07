const ALBUM = 1;
const LIST = 2;


class App {
    constructor(){ this.init(); }
    async init(){
        this.renderType = ALBUM;
        this.viewer = document.querySelector("#viewer");
        
        this.getFestivals().then(() => {
            this.update();
            this.setEvents();
        });
    }

    // 이벤트 설정
    setEvents(){
        $(".render__icon").on("click", e => {
            let type = e.currentTarget.dataset.type;
            if(type === "album") this.renderType = ALBUM;
            else this.renderType = LIST;

            this.update();
        });
    }

    // 화면 업데이트
    update(){
        this.viewer.innerHTML = "";
        let viewList = this.festivals;


        if(this.renderType === ALBUM) this.renderAlbum(viewList);
        else if(this.renderType === LIST) this.renderList(viewList);
    }

    // 생성하기 - 리스트 형식
    renderList(viewList){
        let wrap = $(`<div class="data__list"></div>`)[0];
        
        viewList.forEach(fs => {
            let elem = $(`<div class="list__row">
                            <div class="list__no">${`${fs.sn}`.length < 2 ? '0' + fs.sn : fs.sn}</div>
                            <div class="list__content">
                                <h5 class="nm font-weight-bold">${fs.nm}</h5>
                                <div class="text-muted fx-n2">
                                    <span class="area mr-2">${fs.area}</span>
                                    <span class="dt">${fs.dt}</span>
                                </div>
                            </div>
                        </div>`)[0];
            wrap.append(elem);
        });

        this.viewer.innerHTML = wrap.outerHTML;
    }

    // 생성하기 - 앨범 형식
    renderAlbum(viewList){
        let last = viewList[viewList.length - 1];
        let wrap = $(`<div class="notice__album">
                        <div class="album__top">
                            <div class="row align-items-center">
                                <div class="col-lg-5">
                                    <div class="image">
                                        ${
                                            last.images.length > 0 ?
                                            `<img src="http://localhost/xml/festivalImages/${this.getFestivalId(last)}/${last.images[0]}" title="축제 정보 이미지" alt="축제 정보 이미지">`
                                            : `<div class="no-image"></div>`
                                        }
                                    </div>
                                </div>
                                <div class="col-lg-7 p-3">
                                    <div class="fx-n2 text-red">대표 축제</div>
                                    <div class="fx-4 font-weight-bold mt-2">${last.nm}</div>
                                    <div class="text-muted fx-n1 mt-3">${last.dt}</div>
                                    <div class="fx-n2 keep-all mt-4">
                                        ${last.cn}
                                    </div>
                                    <button class="btn__dynamic--bordered mt-4">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        자세히 보기
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="album__row row mt-5"></div>
                    </div>`)[0];
        let row = wrap.querySelector(".album__row");

        viewList.forEach(fs => {
            let elem = $(`<div class="col-lg-4 mb-3">
                            <div class="album__item">
                                <div class="image">${
                                        fs.images.length == 0 ? `<div class="no-image"></div>` :
                                        `<div class="no">${fs.images.length}</div>
                                        <img class="fit-cover" src="http://localhost/xml/festivalImages/${this.getFestivalId(fs)}/${fs.images[0]}" title="축제 정보 이미지" alt="축제 정보 이미지">`
                                    }</div>
                                <div class="px-3 py-3">
                                    <div class="font-weight-bold fx-2 mb-1">${fs.nm}</div>
                                    <div class="fx-n1 text-muted">${fs.dt}</div>
                                </div>
                            </div>
                        </div>`)[0];
            row.append(elem);
        });
        this.viewer.innerHTML = wrap.outerHTML;
    }

    // 축제 고유 번호 가져오기
    getFestivalId(fs){
        if(fs){
            let id = new String(fs.sn);
            while(id.length < 3) id = "0" + id;
            return id + "_" + fs.no;
        }
    }


    // 축제 정보 가져오기
    getFestivals(){
        return fetch("/xml/festivalList.xml")
            .then(res => res.text())
            .then(async textData => {
                let parser = new DOMParser();
                let xmlDoc = parser.parseFromString(textData, "text/xml");
                let xmlItems = Array.from(xmlDoc.querySelectorAll("item"));
                let items = [];
                await Promise.all(xmlItems.map(async xmlItem => {
                    let item = {};
                    item.sn = xmlItem.querySelector("sn").innerHTML;
                    item.no = xmlItem.querySelector("no").innerHTML;
                    item.nm = xmlItem.querySelector("nm").innerHTML;
                    item.area = xmlItem.querySelector("area").innerHTML;
                    item.location = xmlItem.querySelector("location").innerHTML;
                    item.cn = xmlItem.querySelector("cn").innerHTML;
                    item.dt = xmlItem.querySelector("dt").innerHTML;
                    item.images = (await Promise.all(Array.from(xmlItem.querySelectorAll("image")).map(xmlImage => new Promise(res => {
                        let filename = xmlImage.innerHTML;
                        let xhr = new XMLHttpRequest();
                        xhr.open("GET", `/xml/festivalImages/${this.getFestivalId(item)}/${filename}`);
                        xhr.onload = () => {
                            if(xhr.status == 200 || xhr.status == 201) res(filename);
                            else res(null);
                        }
                        xhr.onerror = () => res(null)
                        xhr.send();
                    }))))
                    .filter(image => image !== null);
                    items[item.sn - 1] = item;
                }));
                this.festivals = items;
            });
    }
}

window.addEventListener("load", () => {
    const app = new App();
});