var setPaging = function(data) {
    var total = parseInt($("#selectModal #total").val()),
        curPage = parseInt($("#selectModal #page").val());
    var totalPage = Math.ceil(total / 14);
    $("#selectModal .paging .total").text(total.toString());
    $("#selectModal .paging .page").text(curPage.toString() + "/" + totalPage.toString());

    if (data.isFirstPage) {
        $("#selectModal .paging .prepage").hide();
    } else {
        $("#selectModal .paging .prepage").show();
    }
    if (data.isLastPage) {
        $("#selectModal .paging .nextpage").hide();
    } else {
        $("#selectModal .paging .nextpage").show();
    }
};