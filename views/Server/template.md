{% extends "Server/partial/main.html" %} {% block left %} {% include "Server/partial/basicSetting.html" %} {% endblock %} {% block main %}
<div class="title">
    <h1>
        {{ title }}
    </h1>
</div>
<div class="toolbar">
    <div class="toolbar-list">
        <button id="btnAdd" class="btn btn-default btn-sm">新增</button>
    </div>
</div>
<div class="content">
    <table class="table table-striped">
        <thead>
            <tr>
                <th style="width:30%;">校区</th>
                <th style="width:50%;">地址</th>
                <th>操作</th>
            </tr>
        </thead>
        <tbody id="gridBody">
            {% if #name#s %} {% for #name# in #name#s %}
            <tr id={{#name#._id}}>
                <td>
                    {{ #name#.name }}
                </td>
                 <td>
                    {{ #name#.address }}
                </td>
                <td>
                    <div data-obj="{{ #name#|dump }}" class="btn-group">
                        <a class="btn btn-default btnEdit">编辑</a>
                        <a class="btn btn-default btnDelete">删除</a>
                    </div>
                </td>
            </tr>
            {% endfor %} {% endif %}
        </tbody>
    </table>
</div>
{% endblock %} {% block modal %}
<!-- Modal -->
<div class="modal fade bs-example-modal-sm" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
    <div class="modal-dialog modal-sm" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="myModalLabel">Modal title</h4>
            </div>
            <div class="modal-body">
                <form>
                    <div class="form-group">
                        <label for="name" class="control-label">校区:</label>
                        <input type="text" maxlength="30" class="form-control" name="name" id="name">
                    </div>
                    <div class="form-group">
                        <label for="address" class="control-label">地址:</label>
                        <textarea maxlength="100" rows="3" class="form-control" name="address" id="address"></textarea>
                    </div>
                    <input type="hidden" class="form-control" name="id" id="id">
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
                <button type="button" id="btnSave" class="btn btn-primary">保存</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade bs-example-modal-sm" id="confirmModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
    <div class="modal-dialog modal-sm" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="confirmModalLabel">确认</h4>
            </div>
            <div class="modal-body">
                出错了?
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-default" data-dismiss="modal">取消</button>
                <button type="button" id="btnConfirmSave" class="btn btn-primary">确定</button>
            </div>
        </div>
    </div>
</div>

<script type="text/javascript" src="/default/assets/js/#name#.js?v=1.0"></script>
{% endblock %}