var objFilters;

function initTrainEvents() {
    $("#selectModal #InfoSearch #schoolArea")
        .off("change")
        .on("change", function (e) {
            changeGrades();
            changeSubjects();
            changeCategories();
        });
    $("#selectModal #InfoSearch #grade")
        .off("change")
        .on("change", function (e) {
            changeSubjects();
            changeCategories();
        });
    $("#selectModal #InfoSearch #subject")
        .off("change")
        .on("change", function (e) {
            changeCategories();
        });
};

function renderTrainSearchCriteria() {
    $('#selectModal .modal-dialog').addClass("modal-lg");
    $selectSearch.empty();
    $selectSearch.append('<div class="row form-horizontal examSearchInfo"><div class="col-md-20" style=""><div class="form-group">' +
        '<label for="trainName" class="control-label">名称:</label>' +
        '<input type="text" maxlength="30" class="form-control" name="trainName" id="trainName"></div>' +
        '<div class="form-group"><label for="schoolArea" class="control-label">校区:</label>' +
        '<select name="schoolArea" id="schoolArea" class="form-control"></select></div>' +
        '<div class="form-group"><label for="grade" class="control-label">年级:</label><select name="grade" id="grade" class="form-control"></select></div>' +
        '<div class="form-group" style="width:190px;"><label for="subject" class="control-label">科目:</label><select name="subject" id="subject" class="form-control"></select></div></div>' +
        '<div class="col-md-20" style="margin-top:10px"><div class="form-group">' +
        '<label for="category" class="control-label">难度:</label><select name="category" id="category" class="form-control"></select></div><div class="form-group searchAttribute">' +
        '<label for="searchAttribute" class="control-label">属性:</label>' +
        '<select name="searchAttribute" id="searchAttribute" class="form-control"></select></div><div class="form-group">' +
        '<label for="searchYear" class="control-label">年度:</label>' +
        '<select name="searchYear" id="searchYear" class="form-control"></select></div></div>' +
        '<div class="col-md-4" style=""><button type="button" id="btnSearch" class="btn btn-primary panelButton">查询</button></div></div>');
    renderGradeSubjectCategoryYear(openTrain);

    initTrainEvents();
};

function openTrain(p) {
    $('#selectModal #selectModalLabel').text("选择课程");
    var filter = {
            name: $("#selectModal #InfoSearch #trainName").val(),
            grade: $("#selectModal #InfoSearch #grade").val(),
            subject: $("#selectModal #InfoSearch #subject").val(),
            category: $("#selectModal #InfoSearch #category").val(),
            schoolId: $("#selectModal #InfoSearch #schoolArea").val(),
            yearId: $("#selectModal #InfoSearch #searchYear").val()
        },
        pStr = p ? "p=" + p : "";
    $selectHeader.empty();
    $selectBody.empty();
    $selectHeader.append('<tr><th>课程名称</th><th width="240px">年级/科目/难度</th><th width="180px">校区</th><th width="140px">培训费/教材费</th><th width="100px">报名情况</th></tr>');
    selfAjax("post", "/admin/trainClass/search?" + pStr, filter, function (data) {
        if (data && data.trainClasss.length > 0) {
            data.trainClasss.forEach(function (trainClass) {
                trainClass.courseContent = "";
                var grade = trainClass.gradeName + "/" + trainClass.subjectName + "/" + trainClass.categoryName,
                    price = trainClass.trainPrice + "/" + trainClass.materialPrice,
                    countStr = trainClass.enrollCount + '/' + trainClass.totalStudentCount;
                var $tr = $('<tr><td>' + trainClass.name +
                    '</td><td>' + grade +
                    '</td><td>' + trainClass.schoolArea +
                    '</td><td>' + price + '</td><td>' + countStr + '</td></tr>');
                $tr.data("obj", trainClass);
                $selectBody.append($tr);
            });
            setSelectEvent($selectBody, function (entity) {
                $('#enrollInfo #trainName').val(entity.name); //
                $('#enrollInfo #trainId').val(entity._id); //
                $('#enrollInfo #trainPrice').val(entity.trainPrice); //
                $('#enrollInfo #materialPrice').val(entity.materialPrice); //
                $('#enrollInfo #realMaterialPrice').val(entity.materialPrice); //
                $('#enrollInfo #attributeId').val(entity.attributeId); //
                $('#enrollInfo #attributeName').val(entity.attributeName); //
                $('#selectModal').modal('hide');
                $('#enrollInfo #trainId').data("obj", entity);
                $('#enrollInfo #schoolId').val(entity.schoolId); //
                $('#enrollInfo #schoolArea').val(entity.schoolArea); //
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

function renderGradeSubjectCategoryYear(callback) {
    $('#selectModal #InfoSearch').find("#grade option").remove();
    $('#selectModal #InfoSearch').find("#subject option").remove();
    $('#selectModal #InfoSearch').find("#category option").remove();
    // $('#selectModal #InfoSearch').find("#searchYear option").remove();
    selfAjax("get", "/admin/trainClass/gradesubjectcategoryschoolyear", null, function (data) {
        if (data) {
            objFilters = data;

            if (data.schools && data.schools.length > 0) {
                data.schools.forEach(function (school) {
                    var select = "";
                    if ($("#adminSchoolId").val() == school._id) {
                        select = "selected";
                    }
                    $("#selectModal #InfoSearch #schoolArea").append("<option value='" + school._id + "' " + select + ">" + school.name + "</option>");
                });
            }
            if (data.years && data.years.length > 0) {
                data.years.forEach(function (year) {
                    var select = "";
                    if (year.isCurrentYear) {
                        select = "selected";
                    }
                    $("#selectModal #InfoSearch #searchYear").append("<option value='" + year._id + "' " + select + ">" + year.name + "</option>");
                });
            }
            changeGrades();
            changeSubjects();
            changeCategories();

            if (data.classAttributes.length > 0) {
                data.classAttributes.forEach(function (classAttribute) {
                    $("#selectModal #InfoSearch #searchAttribute").append("<option value='" + classAttribute._id + "'>" + classAttribute.name + "</option>");
                });
            } else {
                $('#selectModal #InfoSearch .searchAttribute').hide();
            }

            callback();
        }
    });
};


function changeGrades() {
    $('#selectModal #InfoSearch').find("#grade option").remove();
    if (objFilters.grades.length > 0) {
        var schoolGradeRelations = objFilters.schoolGradeRelations.filter(function (relation) {
            return relation.schoolId == $("#selectModal #InfoSearch #schoolArea").val();
        });
        objFilters.grades.forEach(function (grade) {
            if (schoolGradeRelations.some(function (relation) {
                    return relation.gradeId == grade._id;
                })) {
                $("#selectModal #InfoSearch #grade").append("<option value='" + grade._id + "'>" + grade.name + "</option>");
            }
        });
    }
};

function changeSubjects() {
    $('#selectModal #InfoSearch #subject').find("option").remove();
    if (objFilters.subjects.length > 0) {
        var gradeSubjectRelations = objFilters.gradeSubjectRelations.filter(function (relation) {
            return relation.gradeId == $("#selectModal #InfoSearch #grade").val();
        });
        objFilters.subjects.forEach(function (subject) {
            if (gradeSubjectRelations.some(function (relation) {
                    return relation.subjectId == subject._id;
                })) {
                $("#selectModal #InfoSearch #subject").append("<option value='" + subject._id + "'>" + subject.name + "</option>");
            }
        });
    }
};

function changeCategories() {
    $('#selectModal #InfoSearch #category').find("option").remove();
    if (objFilters.categorys.length > 0) {
        var gradeSubjectCategoryRelations = objFilters.gradeSubjectCategoryRelations.filter(function (relation) {
            return relation.subjectId == $("#selectModal #InfoSearch #subject").val() && relation.gradeId == $("#selectModal #InfoSearch #grade").val();
        });

        objFilters.categorys.forEach(function (category) {
            if (gradeSubjectCategoryRelations.some(function (relation) {
                    return relation.categoryId == category._id;
                })) {
                $("#selectModal #InfoSearch #category").append("<option value='" + category._id + "'>" + category.name + "</option>");
            }
        });
    }
};