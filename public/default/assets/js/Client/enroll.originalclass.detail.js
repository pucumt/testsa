$(document).ready(function () {
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        if ($("#orderId").val() != "") {
            location.href = "/enroll/originalclass/switch/" + $("#orderId").val() + "?school=" + $(".exam-detail #schoolId").val() + "&category=" + $(".exam-detail #categoryId").val();
        } else {
            location.href = "/enroll/originalclass/classes/" + $(".exam-detail #fromClassId").val() + "/student/" + $(".exam-detail #studentId").val();
        }
    });

    $("#btnEnroll").on("click", function (e) {
        //get original student info
        selfAjax("post", "/enroll/getStudent", {
            originalUrl: "/enroll/originalclass/id/" + $("#id").val() + "/student/" + $('.exam-detail #studentId').val(),
            studentId: $(".exam-detail #studentId").val()
        }, function (data) {
            if (data) {
                if (data.notLogin) {
                    location.href = "/login";
                    return;
                }
                $("#Enroll-select .student .name").text(data.name);
                $("#Enroll-select #studentId").val(data._id);
                $("#bgBack").show();
                $("#Enroll-select").show();
            }
        });
    });

    $("#Enroll-select #btnNext").on("click", function (e) {
        if ($("#Enroll-select .student .name").text() == "" || $("#Enroll-select #studentId").val() == "") {
            showAlert("出错了，请刷新重试！");
        } else {
            location.href = "/enroll/original/order?classId=" + $("#id").val() + "&studentId=" +
                $("#Enroll-select #studentId").val() + "&orderId=" + $("#orderId").val();
        }
    });

    $("#Enroll-select .title .glyphicon-remove-circle").on("click", function (e) {
        $("#bgBack").hide();
        $("#Enroll-select").hide();
    });
});