$(document).ready(function() {
    $("#left_btnEnrollProcess").addClass("active");

    loadData();
});

//------------search funfunction
function loadData() {
    selfAjax("post", "/admin/enrollProcessConfigureList/search", null, function(data) {
        if (data) {
            if (data.newStudentStatus) {
                $("#btnNewStudent").text("停止");
                $("#newStudentStatus").val("开启");
            } else {
                $("#btnNewStudent").text("开启");
                $("#newStudentStatus").val("停止");
            }

            if (data.oldStudentStatus) {
                $("#btnOldStudent").text("停止");
                $("#oldStudentStatus").val("开启");
            } else {
                $("#btnOldStudent").text("开启");
                $("#oldStudentStatus").val("停止");
            }
        }
    });
};
//------------end
$("#btnNewStudent").on("click", function(e) {
    selfAjax("post", "/admin/enrollProcessConfigure/edit", {
        status: "new"
    }, function(data) {
        if (data) {
            if (data.newStudentStatus) {
                $("#btnNewStudent").text("停止");
                $("#newStudentStatus").val("开启");
            } else {
                $("#btnNewStudent").text("开启");
                $("#newStudentStatus").val("停止");
            }
        }
    });
});

$("#btnOldStudent").on("click", function(e) {
    selfAjax("post", "/admin/enrollProcessConfigure/edit", {
        status: "old"
    }, function(data) {
        if (data) {
            if (data.oldStudentStatus) {
                $("#btnOldStudent").text("停止");
                $("#oldStudentStatus").val("开启");
            } else {
                $("#btnOldStudent").text("开启");
                $("#oldStudentStatus").val("停止");
            }
        }
    });
});