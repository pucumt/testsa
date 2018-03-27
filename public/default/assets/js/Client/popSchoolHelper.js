var publicSchools;

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

function initSchool(entity) {
    var curSchool = publicSchools.filter(function (school) {
        return school.name == entity.School;
    });

    if (curSchool && curSchool.length > 0) {
        // 找到了原来的学校
        $('#studentInfo #schoolSelect').val(curSchool[0]._id);
        $('#studentInfo #School').hide();
    } else {
        // 原来填写的学校不存在
        curSchool = publicSchools.filter(function (school) {
            return school.name == "其他";
        });
        $('#studentInfo #schoolSelect').val(curSchool[0]._id);
        $('#studentInfo #School').show();
    }
    $('#studentInfo #School').val(entity.School);
};

function renderSchoolDropDown() {
    var curGrade = getGradeType();
    var schools = publicSchools.filter(function (school) {
        return school.gradeName == curGrade;
    });
    $("#studentInfo #schoolSelect").find("option").remove();
    schools.forEach(function (school) {
        $("#studentInfo #schoolSelect").append("<option value='" + school._id + "'>" + school.name + "</option>");
    });

    if (schools.length > 0) {
        $("#studentInfo #School").val(schools[0].name);
    }
};

$("#studentInfo #schoolSelect").on("change", function (e) {
    var schoolStr = $("#studentInfo #schoolSelect").find("option:selected").text();
    $("#studentInfo #School").val(schoolStr);

    if (schoolStr == "其他") {
        $("#studentInfo #School").show();
    } else {
        $("#studentInfo #School").hide();
    }
});

$("#studentInfo #grade").on("change", function (e) {
    renderSchoolDropDown();
});