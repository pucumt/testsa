var isNew = true;

$(document).ready(function() {
    $("#left_btnClassroom").addClass("active");
});

//------------search funfunction
$("#editfile #btnSubmit").on("click", function(e) {
    var file = document.getElementById('upfile').files;
    if (file.length > 0) {
        var formData = new FormData();
        formData.append("avatar", file[0]);
        $.ajax({
            type: "POST",
            data: formData,
            url: "/admin/batchAddClassRoom",
            contentType: false,
            processData: false,
        }).then(function(data) {
            if (data && data.sucess) {
                location.href = "/admin/score";
            } else {
                showAlert("批量导入失败！");
            }
        });
    }
});

$("#editfile #btnResult").on("click", function(e) {
    location.href = "/admin/score";
});

$("#editfile #btnClear").on("click", function(e) {
    $.get("/admin/score/clearAll", function(data) {
        if (data && data.sucess) {
            showAlert("删除记录成功");
        }
    });
});