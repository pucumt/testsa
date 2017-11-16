$(document).ready(function () {
    $(".enroll .pageTitle .glyphicon-menu-left").on("click", function (e) {
        location.href = "/personalCenter";
    });

    $(".enroll #resetForm .btn").on("click", function (e) {
        var validator = $('#resetForm').data('formValidation').validate();
        if (validator.isValid()) {
            $(".enroll #resetForm .btn").attr("disabled", "disabled");
            selfAjax("post", "/personalCenter/resetPWD", {
                oldPassword: hex_md5($('#resetForm #oldPassword').val()),
                password: hex_md5($('#resetForm #password').val()),
                originalUrl: "/personalCenter/resetPWD"
            }, function (data) {
                $(".enroll #resetForm .btn").removeAttr("disabled");
                if (data) {
                    if (data.notLogin) {
                        location.href = "/login";
                        return;
                    }

                    if (data.sucess) {
                        $("#bgBack").show();
                        showAlert("密码修改成功", null, function () {
                            $("#bgBack").hide();
                        });
                    } else {
                        $("#bgBack").show();
                        showAlert(data.error, null, function () {
                            $("#bgBack").hide();
                        });
                    }
                }
            });
        }
    });

    addValidation();
});

function addValidation() {
    setTimeout(function () {
        $('#resetForm').formValidation({
            declarative: false,
            // List of fields and their validation rules
            fields: {
                'oldPassword': {
                    trigger: "blur change",
                    validators: {
                        notEmpty: {
                            message: '旧密码不能为空'
                        },
                        stringLength: {
                            min: 6,
                            max: 15,
                            message: '密码在6-15个字符之间'
                        }
                    }
                },
                'password': {
                    trigger: "blur change",
                    validators: {
                        notEmpty: {
                            message: '新密码不能为空'
                        },
                        stringLength: {
                            min: 6,
                            max: 15,
                            message: '密码在6-15个字符之间'
                        }
                    }
                },
                // 'confirmPassword': {
                //     trigger: "blur change",
                //     validators: {
                //         notEmpty: {
                //             message: '新密码不能为空'
                //         },
                //         stringLength: {
                //             min: 6,
                //             max: 20,
                //             message: '密码在6-20个字符之间'
                //         }
                //     }
                // }
            }
        });
    }, 0);
};