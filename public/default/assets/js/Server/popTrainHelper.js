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

    $("#selectModal #InfoSearch #searchYear")
        .off("change")
        .on("change", function (e) {
            changeAttributes();
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
        '<label for="category" class="control-label">难度:</label><select name="category" id="category" class="form-control"></select></div><div class="form-group">' +
        '<label for="searchYear" class="control-label">年度:</label>' +
        '<select name="searchYear" id="searchYear" class="form-control"></select></div><div class="form-group searchAttribute">' +
        '<label for="searchAttribute" class="control-label">学期:</label>' +
        '<select name="searchAttribute" id="searchAttribute" class="form-control"></select></div></div>' +
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
            attributeId: $('#selectModal #InfoSearch #searchAttribute').val(),
            yearId: $("#selectModal #InfoSearch #searchYear").val()
        },
        pStr = p ? "p=" + p : "";
    $selectHeader.empty();
    $selectBody.empty();
    $selectHeader.append('<tr><th>课程名称</th><th width="220px">年级/科目/难度</th><th width="170px">上课时间</th><th width="120px">老师</th><th width="110px">培训费/教材费</th><th width="80px">报名情况</th></tr>');
    selfAjax("post", "/admin/trainClassWithTeacher/search?" + pStr, filter, function (data) {
        if (data && data.trainClasss.length > 0) {
            data.trainClasss.forEach(function (trainClass) {
                trainClass.courseContent = "";
                var grade = trainClass.gradeName + "/" + trainClass.subjectName + "/" + trainClass.categoryName,
                    price = trainClass.trainPrice + "/" + trainClass.materialPrice,
                    countStr = trainClass.enrollCount + '/' + trainClass.totalStudentCount;
                var $tr = $('<tr><td>' + trainClass.name +
                    '</td><td>' + grade +
                    '</td><td>' + trainClass.courseTime +
                    '</td><td>' + trainClass.teacherName + (trainClass.engName && ("/" + trainClass.engName)) +
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
    selfAjax("get", "/admin/trainClass/gradesubjectcategoryschoolyearattribute", null, function (data) {
        if (data) {
            objFilters = data;
            var curSchoolId = $("#oldSchoolId").val() || $("#adminSchoolId").val();
            if (data.schools && data.schools.length > 0) {
                data.schools.forEach(function (school) {
                    var select = "";
                    if (curSchoolId == school._id) {
                        select = "selected";
                    }
                    $("#selectModal #InfoSearch #schoolArea").append("<option value='" + school._id + "' " + select + ">" + school.name + "</option>");
                });
            }
            if (data.years && data.years.length > 0) {
                data.years.forEach(function (year) {
                    var select = "";
                    if ($("#oldYearId").val() && $("#oldYearId").val() == year._id) {
                        select = "selected";
                    } else if (year.isCurrentYear) {
                        select = "selected";
                    }
                    $("#selectModal #InfoSearch #searchYear").append("<option value='" + year._id + "' " + select + ">" + year.name + "</option>");
                });
            }
            changeGrades();
            if ($("#oldGradeId").val()) {
                $("#selectModal #InfoSearch #grade").val($("#oldGradeId").val());
            }

            changeSubjects();
            if ($("#oldSubjectId").val()) {
                $("#selectModal #InfoSearch #subject").val($("#oldSubjectId").val());
            }

            changeCategories();
            if ($("#oldCategoryId").val()) {
                $("#selectModal #InfoSearch #category").val($("#oldCategoryId").val());
            }

            changeAttributes();
            if ($("#oldAttributeId").val()) {
                $("#selectModal #InfoSearch #searchAttribute").val($("#oldAttributeId").val());
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

function changeAttributes() {
    $('#selectModal #InfoSearch #searchAttribute').find("option").remove();
    if (objFilters.classAttributes.length > 0) {
        var yearAttributeRelations = objFilters.classAttributes.filter(function (relation) {
            return relation.yearId == $("#selectModal #InfoSearch #searchYear").val();
        });
        if (yearAttributeRelations.length > 0) {
            $('#selectModal #InfoSearch .searchAttribute').show();
            yearAttributeRelations.forEach(function (classAttribute) {
                $("#selectModal #InfoSearch #searchAttribute").append("<option value='" + classAttribute._id + "'>" + classAttribute.name + "</option>");
            });
        } else {
            $('#selectModal #InfoSearch .searchAttribute').hide();
        }
    }
};