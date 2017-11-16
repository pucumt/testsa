function renderStudentSearchCriteria() {
    $('#selectModal .modal-dialog').removeClass("modal-lg");
    $selectSearch.empty();
    $selectSearch.append('<div class="row form-horizontal"><div class="col-md-8"><div class="form-group">' +
        '<label for="studentName" class="control-label">姓名:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="studentName" id="studentName"></div></div>' +
        '<div class="col-md-8"><div class="form-group"><label for="mobile" class="control-label">手机号:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="mobile" id="mobile"></div></div>' +
        '<div class="col-md-8"><button type="button" id="btnSearch" class="btn btn-primary panelButton">查询</button></div></div>');
    openStudent();
};

function openStudent(p) {
    $('#selectModal #selectModalLabel').text("选择学生");
    var filter = {
            name: $("#selectModal #InfoSearch #studentName").val(),
            mobile: $("#selectModal #InfoSearch #mobile").val()
        },
        pStr = p ? "p=" + p : "";
    $selectHeader.empty();
    $selectBody.empty();
    $selectHeader.append('<tr><th>学生姓名</th><th width="120px">电话号码</th><th width="120px">性别</th></tr>');
    selfAjax("post", "/admin/studentInfo/search?" + pStr, filter, function (data) {
        if (data && data.studentInfos.length > 0) {
            data.studentInfos.forEach(function (student) {
                student.School = "";
                student.className = "";
                var sex = student.sex ? "女" : "男";
                var $tr = $('<tr><td>' + student.name +
                    '</td><td>' + student.mobile + '</td><td>' + sex + '</td></tr>');
                $tr.data("obj", student);
                $selectBody.append($tr);
            });
            setSelectEvent($selectBody, function (entity) {
                $('#enrollInfo #studentName').val(entity.name); //
                $('#enrollInfo #studentId').val(entity._id); //
                $('#enrollInfo #mobile').val(entity.mobile); //
                $('#enrollInfo #sex').val(entity.sex ? 1 : 0); //
                $('#enrollInfo #discount').val(entity.discount ? entity.discount : 100); //
                $('#selectModal').modal('hide');
                setPrice();
                renderCoupon();
                renderAttributeCoupon();
            });
        }
        $("#selectModal #total").val(data.total);
        $("#selectModal #page").val(data.page);
        setPaging("#selectModal", data);
        $('#selectModal').modal({
            backdrop: 'static',
            keyboard: false
        });
    });
};