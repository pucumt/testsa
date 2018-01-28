var isNew = true;

$(document).ready(function () {
    $("#left_btnRollCallProcess").addClass("active");

    loadData();

    $("#InfoSearch #drpYear")
        .off("change")
        .on("change", function (e) {
            changeAttributes();
        });
});

//------------search funfunction
var objFilters;

function loadData() {
    selfAjax("post", "/admin/rollCallConfigureList/search", null, function (data) {
        if (data) {
            objFilters = data;
            if (data.years) {
                data.years.forEach(function (year) {
                    var selected = "";
                    if (year._id == data.configure.yearId) {
                        selected = " selected";
                    }
                    $("#InfoSearch #drpYear").append("<option value='" + year._id + "' " + selected + " sequence='" + year.sequence +
                        "'>" + year.name + "</option>");
                });
                changeAttributes(data.configure.attributeId);
            }
        }
    });
};


function changeAttributes(attributeId) {
    $('#InfoSearch #searchAttribute').find("option").remove();
    if (objFilters.classAttributes.length > 0) {
        var yearAttributeRelations = objFilters.classAttributes.filter(function (relation) {
            return relation.yearId == $(" #InfoSearch #drpYear").val();
        });
        if (yearAttributeRelations.length > 0) {
            $(' #InfoSearch .attribute').show();
            yearAttributeRelations.forEach(function (classAttribute) {
                var selected = "";
                if (classAttribute._id == attributeId) {
                    selected = " selected";
                }
                $(" #InfoSearch #searchAttribute").append("<option value='" + classAttribute._id + "' " + selected + ">" + classAttribute.name + "</option>");
            });
        } else {
            $(' #InfoSearch .attribute').hide();
        }
    }
};

$("#btnSave").on("click", function (e) {
    selfAjax("post", "/admin/rollCallConfigure/edit", {
        yearId: $("#InfoSearch #drpYear").val(),
        yearName: $("#InfoSearch #drpYear").find("option:selected").text(),
        attributeId: $("#InfoSearch #searchAttribute").val(),
        sequence: $("#InfoSearch #drpYear").find("option:selected").attr("sequence")
    }, function (data) {
        location.href = location.href;
    });
});