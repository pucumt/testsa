var setPaging = function(formStr, data) {
    var total = parseInt($(formStr + " #total").val()),
        curPage = parseInt($(formStr + " #page").val());
    var totalPage = Math.ceil(total / 14);
    $(formStr + " .paging .total").text(total.toString());
    $(formStr + " .paging .page").text(curPage.toString() + "/" + totalPage.toString());

    if (data.isFirstPage) {
        $(formStr + " .paging .prepage").hide();
    } else {
        $(formStr + " .paging .prepage").show();
    }
    if (data.isLastPage) {
        $(formStr + " .paging .nextpage").hide();
    } else {
        $(formStr + " .paging .nextpage").show();
    }
};