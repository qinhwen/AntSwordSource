/**
 * AntSword::ShellManager::Toolbar
 * Create: 2019-09-01
 * Update: 2019-09-01
 * Author: Virink <https://github.com/virink>
 */

'use strict';

const LANG_T = antSword['language']['toastr'];
const LANG = antSword['language']['shellmanager']['toolbar'];
const WIN = require("ui/window");

class Toolbar {

  constructor(cell, manager) {
    var self = this;
    cell.hideHeader();
    cell.setHeight(43);
    let lang = antSword.storage('language', false, navigator.language.substr(0, 2));
    this.lang = (lang == 'en') ? '_en' : '';

    // Create toolbar
    let toolbar = cell.attachToolbar();
    toolbar.setIconSize(32);
    toolbar.attachEvent("onClick", function (id) {
      console.log(id);
      if (id == 'setting') {
        self.settingPane();
      } else {
        // Load Plugin
        let plug = antSword['plugins'][id];
        if (!antSword['plugins'][id]['module']) {
          antSword['plugins'][id]['module'] = require(path.join(plug['path'], plug['info']['main'] || 'index.js'));
        }
        // Load WebShell
        var ids = (manager.list.grid.getSelectedId() || '').split(',');
        if (ids.length >= 1 && ids[0] != "") {
          var infos = antSword.ipcRenderer.sendSync('shell-find', {
            _id: {
              $in: ids
            }
          });
          if (infos.length > 0) {
            new antSword['plugins'][id]['module'](plug['info']['multiple'] ? infos : infos[0]);
          }
        } else if (plug['info']['global']) {
          new antSword['plugins'][id]['module']({});
        } else {
          toastr.error(LANG['select'], LANG_T['error']);
        }
      }
    });

    this.toolbar = toolbar;
    // antSword.modules.shellmanager.toolbar.reloadToolbar()

  }

  /**
   * ::reloadToolbar
   * Reload Toolbar
   */
  reloadToolbar() {
    this.toolbar.clearAll();
    var plugsData = [];
    try {
      var plugsList = JSON.parse(antSword.storage('toolbar', false, '[]'));
      plugsList.forEach((plug) => {
        if (plug in antSword["plugins"]) {
          p = antSword["plugins"][plug]["info"];
          plugsData.push({
            id: plug,
            text: antSword.noxss(p["name" + this.lang] || p["name"]),
            title: antSword.noxss(p["description" + this.lang] || p["description"]),
            icon: p["icon"],
            type: 'button'
          }, {
            type: 'separator'
          });
        }
      });
    } catch (e) {
      toastr.error(e, LANG_T['error']);
    }

    // Add Setting Button
    plugsData.push({
      id: 'setting',
      text: LANG['setting']['text'],
      title: LANG['setting']['title'],
      icon: 'cog',
      type: 'button'
    });

    this.toolbar.loadStruct(plugsData);
  }

  /**
   * ::settingPane
   * Open the Setting Pane
   */
  settingPane() {
    let win = new WIN({
      title: LANG['setting']['text'],
      height: 450,
      width: 400
    });
    let layout = win.win.attachLayout('1C');
    let cell = layout.cells('a');
    cell.hideHeader();
    let plugsForm = cell.attachForm();
    var plugsData = [];
    try {
      var i = 1;
      var plugs = JSON.parse(antSword.storage('toolbar', false, '[]'));
      for (let plug in antSword["plugins"]) {
        p = antSword["plugins"][plug]["info"];
        plugsData.push({
          type: "checkbox",
          label: antSword.noxss(p["name" + this.lang] || p["name"]),
          name: plug,
          checked: plugs.indexOf(plug) != -1
        });
        plugsData.push({
          type: 'newcolumn',
        });
      }
    } catch (e) {
      toastr.error(e, LANG_T['error']);
    }
    plugsForm.loadStruct([{
      type: "settings",
      position: "label-right"
    }, {
      type: "fieldset",
      name: "Setting",
      label: LANG['setting']['text'],
      list: plugsData
    }, {
      type: "button",
      name: "toolbar_setting_save",
      value: "Save",
      width: 378
    }])

    var eventId = plugsForm.attachEvent("onButtonClick", (name) => {
      if (name == 'toolbar_setting_save') {
        var save_data = []
        var _formvals = plugsForm.getValues();
        for (let v in _formvals) {
          if (_formvals[v])
            save_data.push(v)
        }
        // Save and Reload Toolbar
        antSword.storage('toolbar', save_data);
        antSword.modules.shellmanager.toolbar.reloadToolbar()
      }
      plugsForm.detachEvent(eventId);
      win.close()
    });
  }

}

module.exports = Toolbar;