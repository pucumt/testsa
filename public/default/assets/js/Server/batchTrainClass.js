var isNew = true;

$(document).ready(function() {
    $("#left_btnTrainClass").addClass("active");
});
//------------search funfunction

$("#editfile #btnResult").on("click", function(e) {
    location.href = "/admin/score";
});
$("#editfile #btnClear").on("click", function(e) {
    $.get("/admin/score/clearAll", function(data) {
        if (data && data.sucess) {
            showAlert("删除失败记录成功");
        }
    });
});

$("#editfile #btnScore").on("click", function(e) {
    var file = document.getElementById('upfile').files;
    if (file.length > 0) {
        var formData = new FormData();
        formData.append("avatar", file[0]);
        $.ajax({
            type: "POST",
            data: formData,
            url: "/admin/batchTrainClass",
            contentType: false,
            processData: false,
        }).then(function(data) {
            location.href = "/admin/score";
        });
    }
});