$(document).ready(function () {
    $("#left_btnEnrollProcess").addClass("active");

    loadData();
});

//------------search funfunction
function loadData() {
    selfAjax("post", "/admin/enrollProcessConfigureList/search", null, function (data) {
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

            if (data.oldStudentSwitch) {
                $("#btnStudentSwitch").text("停止");
                $("#oldStudentSwitch").val("开启");
            } else {
                $("#btnStudentSwitch").text("开启");
                $("#oldStudentSwitch").val("停止");
            }

            if (data.isGradeUpgrade) {
                $("#btnGradeUpgrade").text("停止");
                $("#isGradeUpgrade").val("是");
            } else {
                $("#btnGradeUpgrade").text("开启");
                $("#isGradeUpgrade").val("否");
            }

            if (data.isOpenRigister) {
                $("#btnOpenReg").text("停止");
                $("#isOpenRigister").val("是");
            } else {
                $("#btnOpenReg").text("开启");
                $("#isOpenRigister").val("否");
            }
        }
    });
};
//------------end
$("#btnNewStudent").on("click", function (e) {
    selfAjax("post", "/admin/enrollProcessConfigure/edit", {
        status: "new"
    }, function (data) {
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

$("#btnOldStudent").on("click", function (e) {
    selfAjax("post", "/admin/enrollProcessConfigure/edit", {
        status: "old"
    }, function (data) {
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

$("#btnStudentSwitch").on("click", function (e) {
    selfAjax("post", "/admin/enrollProcessConfigure/edit", {
        status: "switch"
    }, function (data) {
        if (data) {
            if (data.oldStudentSwitch) {
                $("#btnStudentSwitch").text("停止");
                $("#oldStudentSwitch").val("开启");
            } else {
                $("#btnStudentSwitch").text("开启");
                $("#oldStudentSwitch").val("停止");
            }
        }
    });
});

$("#btnGradeUpgrade").on("click", function (e) {
    selfAjax("post", "/admin/enrollProcessConfigure/edit", {
        status: "grade"
    }, function (data) {
        if (data) {
            if (data.oldStudentSwitch) {
                $("#btnGradeUpgrade").text("停止");
                $("#isGradeUpgrade").val("是");
            } else {
                $("#btnGradeUpgrade").text("开启");
                $("#isGradeUpgrade").val("否");
            }
        }
    });
});

$("#btnOpenReg").on("click", function (e) {
    selfAjax("post", "/admin/enrollProcessConfigure/edit", {
        status: "openReg"
    }, function (data) {
        if (data) {
            if (data.isOpenRigister) {
                $("#btnOpenReg").text("停止");
                $("#isOpenRigister").val("是");
            } else {
                $("#btnOpenReg").text("开启");
                $("#isOpenRigister").val("否");
            }
        }
    });
});