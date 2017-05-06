var isNew = true;

$(document).ready(function() {
    $("#left_btnTrainClass").addClass("active");
    renderDropDown();
});
//------------search funfunction
$("#btnSubmit").on("click", function(e) {
    $.post("/admin/batchTrainClasspublish", { id: $("#year").val() }, function(data) {
        if (data && data.sucess) {
            showAlert("发布成功！");
        } else {
            showAlert("发布失败！");
        }
    });
});

$("#btnStop").on("click", function(e) {
    $.post("/admin/batchTrainClassUnpublish", { id: $("#year").val() }, function(data) {
        if (data && data.sucess) {
            showAlert("停用成功！");
        } else {
            showAlert("停用失败！");
        }
    });
});

function renderDropDown() {
    $.post("/admin/year/all", function(data) {
        if (data && data.length > 0) {
            data.forEach(function(year) {
                $("#year").append("<option value='" + year._id + "'>" + year.name + "</option>");
            });
        };
    });
};