const $locationModal = $(`<div id="locaiton-modal" class="modal fade">
                            <div class="modal-dialog">
                                <div class="modal-content">
                                    <div class="modal-body px-3 py-4">
                                        
                                    </div>
                                </div>
                            </div>
                            </div>`);
$locationModal.body = $locationModal.find(".modal-content");

window.addEventListener("load", () => {
    $(document.body).append($locationModal);

    $(".open-location").on("click", e => {
        e.preventDefault();
        let visible = true;
        let timeout = setTimeout(() => {
            $locationModal.body.html(`<p class="py-5 text-danger text-center">찾아오는 길을 표시할 수 없습니다.</p>`);
            $locationModal.modal("show");
            visible = false;
        }, 1000);

        fetch("/location.php")     
        .then(res => res.text())
        .then(text => {
            if(visible){
                $locationModal.body.html(text);
                $locationModal.modal("show");
                clearTimeout(timeout);
            }
        });
    });
});