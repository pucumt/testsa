var isNew = true;

$(document).ready(function() {
    $("#left_btnTrainClass").addClass("active");
    renderDropDown();
});
//------------search funfunction
$("#btnSubmit").on("click", function(e) {
    showComfirm("真的要发布吗？");

    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/batchTrainClasspublish", { id: $("#year").val() }, function(data) {
            if (data && data.sucess) {
                showAlert("发布成功！", null, true);
            } else {
                showAlert("发布失败！", null, true);
            }
        });
    });
});

$("#btnStop").on("click", function(e) {
    showComfirm("真的要停用吗？");

    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/batchTrainClassUnpublish", { id: $("#year").val() }, function(data) {
            if (data && data.sucess) {
                showAlert("停用成功！", null, true);
            } else {
                showAlert("停用失败！", null, true);
            }
        });
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

$("#btnBatchAdd").on("click", function(e) {
    showComfirm("真的要加100吗？");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/batchAdd100", { id: $("#year").val() }, function(data) {
            if (data && data.sucess) {
                showAlert("加100成功！", null, true);
            } else {
                showAlert("加100失败！", null, true);
            }
        });
    });
});

$("#btnBatchMin").on("click", function(e) {
    showComfirm("真的要减100吗？");
    $("#btnConfirmSave").off("click").on("click", function(e) {
        $.post("/admin/batchMin100", { id: $("#year").val() }, function(data) {
            if (data && data.sucess) {
                showAlert("减100成功！", null, true);
            } else {
                showAlert("减100失败！", null, true);
            }
        });
    });
});