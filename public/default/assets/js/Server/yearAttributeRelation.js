var isNew = true;

$(document).ready(function () {
    $("#btnAdmin").addClass("active");
    search();
});

//------------search funfunction
var $mainSelectBody = $('.content.mainModal table tbody');

function search() {
    var filter = {
        yearId: $("#yearId").val()
    };
    $mainSelectBody.empty();
    selfAjax("post", "/admin/yearAttributeRelationList/search", filter, function (data) {
        if (data && data.classAttributes.length > 0) {
            data.classAttributes.forEach(function (classAttribute) {
                var checkStr = "";
                if (data.relations.some(function (relation) {
                        return relation.attributeId == classAttribute._id;
                    })) {
                    checkStr = "checked isChecked=1";
                }
                var $tr = $('<tr id=' + classAttribute._id + '><td><span><input type="checkbox" class="attributeId" name="attributeId" ' + checkStr + ' value=' + classAttribute._id + ' /></span>' + classAttribute.name + '</td></tr>');
                $mainSelectBody.append($tr);
            });
        }
    });
};

//------------end

function getAttributes() {
    var result = {
        newAttributes: [],
        removeAttributes: []
    };

    $(".content.mainModal table tbody tr .attributeId")
        .each(function (index) {
            if (this.checked) {
                if ($(this).attr("isChecked") != "1") {
                    result.newAttributes.push($(this).val());
                }
            } else {
                if ($(this).attr("isChecked") == "1") {
                    result.removeAttributes.push($(this).val());
                }
            }
        });
    return result;
};

$("#btnSave").on("click", function (e) {
    var result = getAttributes();
    selfAjax("post", "/admin/yearAttributeRelation/save", {
        newAttributes: JSON.stringify(result.newAttributes),
        removeAttributes: JSON.stringify(result.removeAttributes),
        yearId: $("#yearId").val()
    }, function (data) {
        search();
    });
});

$("#btnReturn").on("click", function (e) {
    location.href = "/admin/yearList";
});