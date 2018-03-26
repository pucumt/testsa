function getGradeType() {
    switch ($("#studentInfo #grade").find("option:selected").text()) {
        case "小学一年级":
        case "小学二年级":
        case "小学三年级":
        case "小学四年级":
        case "小学五年级":
        case "小学六年级":
            return "小学";
        case "初中一年级":
        case "初中二年级":
        case "初中三年级":
            return "初中";
        case "高中一年级":
        case "高中二年级":
        case "高中三年级":
            return "高中";
        default:
            return "";
            break;
    }
};

function openSchool(p) {
    $('#selectModal #selectModalLabel').text("选择学校");
    var filter = {
            name: $("#selectModal #InfoSearch #schoolName").val(),
            cityAreaId: $("#selectModal #InfoSearch #schoolArea").val(),
            grade: getGradeType()
        },
        pStr = p ? "p=" + p : "";
    $selectHeader.empty();
    $selectBody.empty();
    $selectHeader.append('<tr><th>学校名称</th></tr>');
    selfAjax("post", "/admin/publicSchool/search?" + pStr, filter, function (data) {
        if (data && data.publicSchools.length > 0) {
            data.publicSchools.forEach(function (publicSchool) {
                var $tr = $('<tr ><td>' + publicSchool.name +
                    '</td></tr>');
                $tr.data("obj", publicSchool);
                $selectBody.append($tr);
            });
            setSelectEvent($selectBody, function (entity) {
                $('#studentInfo #publicSchool').val(entity.name); //
                $('#studentInfo #publicSchoolId').val(entity._id); //
                $('#selectModal').modal('hide');
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

function renderSchoolSearchCriteria() {
    $selectSearch.empty();
    $selectSearch.append('<div class="row form-horizontal"><div class="col-md-8"><div class="form-group">' +
        '<label for="schoolName" class="control-label">名称:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="schoolName" id="schoolName"></div></div>' +
        '<div class="col-md-8"><div class="form-group">' +
        '<label for="schoolArea" class="control-label">所在区:</label>' +
        '<select name="schoolArea" id="schoolArea" class="form-control"></select></div></div>' +
        '<div class="col-md-8"><button type="button" id="btnSearch" class="btn btn-primary panelButton">查询</button></div></div>');
    selfAjax("get", "/admin/cityArea/all", null, function (data) {
        if (data && data.length > 0) {
            data.forEach(function (area) {
                $("#selectModal #InfoSearch #schoolArea").append("<option value='" + area._id + "' >" + area.name + "</option>");
            });
        }
        openSchool();
    });
};