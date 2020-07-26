/**
 * Shell数据管理模块
 * 重构：2016/06/20
 */

const Data = require('./data');
const List = require('./list/');
const Toolbar = require('./toolbar');
const Category = require('./category/');

class ShellManager {
  constructor() {
    const tabbar = antSword['tabbar'];
    tabbar.addTab('tab_shellmanager', '<i class="fa fa-th-large"></i>', null, null, true, false);
    const cell = tabbar.cells('tab_shellmanager');
    const layout = cell.attachLayout('3T');
    // 初始化顶侧栏：工具栏 - 插件
    this.toolbar = new Toolbar(layout.cells('a'), this);
    // 初始化左侧栏：数据
    this.list = new List(layout.cells('b'), this);
    // 初始化右侧栏：目录
    this.category = new Category(layout.cells('c'), this);

    this.searchPop = null;
    this.searchForm = null;
    this.initSearchUI();

    this.reloadData();
    // 注册菜单事件
    antSword['menubar'].reg('shellmanager-search', () => {
      antSword
        .tabbar
        .tabs("tab_shellmanager")
        .setActive();
      if (this.searchPop.isVisible()) {
        this
          .searchPop
          .hide();
      } else {
        this
          .searchPop
          .show(120, document.body.clientHeight, 100, 100);
      }
    });
  }

  /**
   * 重新加载shell数据
   * @param  {object} arg = {} 查询参数
   * @return {[type]}     [description]
   */
  reloadData(arg = {}) {
    if (this.searchPop.isVisible()) {
      let sdata = this
        .searchForm
        .getValues();
      try {
        RegExp(sdata['searchtext']);
      } catch (e) {
        var tmpstr = sdata['searchtext'].replace(/([\$\(\)\*\+\.\[\?\\\^\{\|])/g, function ($, $1) {
          return `\\${$1}`;
        });
        sdata['searchtext'] = tmpstr;
      }
      var searchObj = {};
      switch (sdata['searchtype']) {
        case 'all':
          searchObj["$or"] = [{
            "url": {
              $regex: sdata['searchtext']
            }
          }, {
            "pwd": {
              $regex: sdata['searchtext']
            }
          }, {
            "note": {
              $regex: sdata['searchtext']
            }
          }];
          break;
        default:
          searchObj[sdata['searchtype']] = {
            $regex: sdata['searchtext']
          };
          break;
      }
      // 获取当前分类
      searchObj['category'] = this
        .category
        .sidebar
        .getActiveItem();
      $.extend(arg, searchObj);
    }
    const _data = Data.get(arg);
    // 刷新UI::数据
    this
      .list
      .grid
      .clearAll();
    this
      .list
      .grid
      .parse({
        'rows': _data['data']
      }, 'json');
    // 刷新UI::分类
    for (let _ in _data['category']) {
      // 目录存在，则更新bubble
      if (!!this.category['sidebar'].items(_)) {
        this
          .category['sidebar']
          .items(_)
          .setBubble(_data['category'][_]);
        continue;
      }
      // 目录不存在，则添加
      this
        .category['sidebar']
        .addItem({
          id: _,
          bubble: _data['category'][_],
          text: `<i class="fa fa-folder-o"></i> ${antSword.noxss(_)}`
        });
    }
    // 加载分类数据
    this
      .category
      .sidebar
      .items(arg['category'] || 'default')
      .setActive(true);
    // 更新标题
    this
      .category
      .updateHeader();
    this
      .list
      .updateHeader(_data['data'].length);
  }

  initSearchUI() {
    let that = this;
    let searchPop = new dhtmlXPopup();
    let formData = [{
      type: "settings",
      position: "label-left",
      labelWidth: 80,
      inputWidth: 130
    }, {
      type: "combo",
      name: 'searchtype',
      options: [{
        text: "All",
        value: "all",
        selected: true
      }, {
        text: "URL",
        value: "url"
      }, {
        text: "Password",
        value: "pwd"
      }, {
        text: "Remark",
        value: "note"
      }]
    }, {
      type: 'newcolumn',
      offset: 20
    }, {
      type: "input",
      name: "searchtext"
    }];
    searchPop.attachEvent("onShow", function () {
      if (that.searchForm == null) {
        that.searchForm = searchPop.attachForm(formData);
        // that.searchForm.attachEvent("onButtonClick", function(){   searchPop.hide();
        // });
        that
          .searchForm
          .attachEvent("onInputChange", (name, value, form) => {
            if (name == "searchtext") {
              that.reloadData({});
            }
          });
      }
      // 去掉 popup 的角
      var poparrows = document.getElementsByClassName('dhx_popup_arrow dhx_popup_arrow_top');
      if (poparrows.length > 0 && poparrows[0].style.display != "none") {
        poparrows[0].style.display = "none";
      }
      that
        .searchForm
        .setItemFocus("searchtext");
    });
    // searchPop.attachEvent("onBeforeHide", function(type, ev, id){   return false;
    // });
    that.searchPop = searchPop;
  }
}

module.exports = ShellManager;