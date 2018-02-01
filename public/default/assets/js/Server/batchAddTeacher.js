var isNew = true;

$(document).ready(function () {
    $("#left_btnTeacher").addClass("active");
});

//------------search funfunction
$("#editfile #btnSubmit").on("click", function (e) {
    var file = document.getElementById('upfile').files;
    if (file.length > 0) {
        $('#editfile #btnSubmit').attr("disabled", "disabled");
        var formData = new FormData();
        formData.append("avatar", file[0]);
        $.ajax({
            type: "POST",
            data: formData,
            url: "/admin/batchAddTeacher",
            contentType: false,
            processData: false,
        }).then(function (data) {
            $('#editfile #btnSubmit').removeAttr("disabled");
            if (data && data.sucess) {
                location.href = "/admin/score";
            } else {
                showAlert("批量导入失败！");
            }
        });
    }
});

$("#editfile #btnResult").on("click", function (e) {
    location.href = "/admin/score";
});

$("#editfile #btnClear").on("click", function (e) {
    selfAjax("get", "/admin/score/clearAll", null, function (data) {
        if (data && data.sucess) {
            showAlert("删除记录成功");
        }
    });
});