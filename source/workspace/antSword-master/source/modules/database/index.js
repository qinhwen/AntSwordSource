//
// 数据库管理模块
//
// TODO: 数据管理模块目前的代码存在大量冗余，后期会考虑将 数据库驱动 与 core 分成两个块来做 import React from
// 'react'; import ReactDOM from 'react-dom'; import AceEditor from 'react-ace';

const LANG = antSword['language']['database'];
const LANG_T = antSword['language']['toastr'];
const crypto = require('crypto');

class Database {

  constructor(opt) {
    this.hash = (+new Date * Math.random()).toString(16).substr(2, 8);
    this.opt = opt;
    let config = {
      bookmarks: {}
    };
    this.config = JSON.parse(antSword['storage']("adefault_database", false, JSON.stringify(config)));
    // 初始化UI
    const tabbar = antSword['tabbar'];
    tabbar.addTab(`tab_database_${this.hash}`, `<i class="fa fa-database"></i> ${opt['ip']}`, null, null, true, true);
    this.cell = tabbar.cells(`tab_database_${this.hash}`);
    this.cell.progressOn();

    // layout
    this.layout_main = this.cell.attachLayout('2U');
    this.layout_right = this.layout_main.cells('b').attachLayout('2E');

    this.list = this.initList(this.layout_main.cells('a'));
    this.query = this.initQuery(this.layout_right.cells('a'));
    this.result = this.initResult(this.layout_right.cells('b'));

    this.win = new dhtmlXWindows();
    this.win.attachViewportTo(this.cell.cell);

    // 加载数据库驱动
    const _module = require(`./${opt['type']}/index`);
    this.drive = new _module({
      core: new antSword['core'][opt['type']](opt),
      super: this
    });
    this.cell.progressOff();
  }

  // 初始化左侧列表
  initList(layout) {
    layout.setText(`<i class="fa fa-server"></i> ${LANG['list']['title']}`);
    layout.setWidth('270');

    // tree图标
    const imgs = [
      // connect
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAPCAQAAACouOyaAAAABGdBTUEAAL' +
      'GPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAK' +
      'qNIzIAAAAJcEhZcwAAAGQAAABkAA+Wxd0AAAEUSURBVCjPddA9S1txAIXx370JwVCJ0YRCI4FARl2EOr' +
      'rZdu4USjt0yDewg7uLk1/AF0gcXJylu7MQEUpbaCHcraGNbSik6r1/h2ZIhpzpnIdnOkxnz8B3A/vTMJ' +
      '5RarpeOFGbr0RSYw+zdFb5ouXSO5/NzYJDQUdxGuZBVVGEIEOmOlljAyKxNz5YFoGykpEhCH47cBqp+O' +
      'i5X/6Bkif++gMKKnpe8cwnd95qamo6EnQnvWXsq3peEASJb2CI20l/KhOE2IqCWEWMBUsoKSJWlVOwwp' +
      'VE4sYmdvQl+nax4Voi0Ys1tG0bqWPNuS1n1rFq7KX3arFMKpUJCNLJ+v9RKpXlZY7dW/QTP7S9VtbBUM' +
      'OFvNwjiZlZspGW2aUAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTUtMDctMjVUMjE6NDk6MzQrMDg6MDAa6y' +
      'DqAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE0LTA1LTAxVDIxOjEyOjA2KzA4OjAwmIBnWAAAAE50RVh0c2' +
      '9mdHdhcmUASW1hZ2VNYWdpY2sgNi44LjgtMTAgUTE2IHg4Nl82NCAyMDE1LTA3LTE5IGh0dHA6Ly93d3' +
      'cuaW1hZ2VtYWdpY2sub3JnBQycNQAAACV0RVh0c3ZnOmNvbW1lbnQAIEdlbmVyYXRlZCBieSBJY29Nb2' +
      '9uLmlvIDDLy0gAAAAYdEVYdFRodW1iOjpEb2N1bWVudDo6UGFnZXMAMaf/uy8AAAAYdEVYdFRodW1iOj' +
      'pJbWFnZTo6SGVpZ2h0ADY2N7Lgj5AAAAAXdEVYdFRodW1iOjpJbWFnZTo6V2lkdGgANzExhvGGCAAAAB' +
      'l0RVh0VGh1bWI6Ok1pbWV0eXBlAGltYWdlL3BuZz+yVk4AAAAXdEVYdFRodW1iOjpNVGltZQAxMzk4OT' +
      'Q5OTI2Hzsr2gAAABN0RVh0VGh1bWI6OlNpemUANy4yMUtCQtXNgY4AAABadEVYdFRodW1iOjpVUkkAZm' +
      'lsZTovLy9ob21lL3d3d3Jvb3Qvd3d3LmVhc3lpY29uLm5ldC9jZG4taW1nLmVhc3lpY29uLmNuL3NyYy' +
      '8xMTU4Mi8xMTU4Mjc4LnBuZwIRWX8AAAAASUVORK5CYII=',
      // databass
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAPCAQAAAB+HTb/AAAABGdBTUEAAL' +
      'GPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAK' +
      'qNIzIAAAAJcEhZcwAAAGQAAABkAA+Wxd0AAAEXSURBVBjTZck/S5RxAADg5+f75+5t8NTUSktEKCGCFp' +
      '0U8dwcBMFBNwlu1a8Rrn4CJ0drdDF0bY1e4hAFQcEbTpT0ulfPc2irZ30C3lhWNabsrz/OHPrqLFiy6d' +
      'KRXEMLmWHvzXlpm1xN6l+pmrzHiKbivyw0jQR36o4cqGtqo6TfpAXz3gUnNnwwpYIHxLiR+247lmnYkh' +
      'jQL0PLFda0lWOpVUN+amjoIih75dqiUnBsVcWEVEcHkUjHrbrdWMWQfd+UPZOicKfkk3u9sUdzXvjl3I' +
      '0WEs+99ttH3eDEosikAYmArnu3Ij98ibXN2JEjEuNBR2bdgiJyoaaqT0kikRn0VtWsaZ8Dxq2YNyr1iB' +
      '6Fc4f2nD4BUO1Rv9s0w+gAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTUtMDctMjVUMjE6NTA6MjYrMDg6MD' +
      'B8RcVXAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE0LTA1LTAxVDIwOjUwOjM1KzA4OjAwTl0AHAAAAE50RV' +
      'h0c29mdHdhcmUASW1hZ2VNYWdpY2sgNi44LjgtMTAgUTE2IHg4Nl82NCAyMDE1LTA3LTE5IGh0dHA6Ly' +
      '93d3cuaW1hZ2VtYWdpY2sub3JnBQycNQAAACV0RVh0c3ZnOmNvbW1lbnQAIEdlbmVyYXRlZCBieSBJY2' +
      '9Nb29uLmlvIDDLy0gAAAAYdEVYdFRodW1iOjpEb2N1bWVudDo6UGFnZXMAMaf/uy8AAAAYdEVYdFRodW' +
      '1iOjpJbWFnZTo6SGVpZ2h0ADcxMRUA1lUAAAAXdEVYdFRodW1iOjpJbWFnZTo6V2lkdGgANjI03HRLcw' +
      'AAABl0RVh0VGh1bWI6Ok1pbWV0eXBlAGltYWdlL3BuZz+yVk4AAAAXdEVYdFRodW1iOjpNVGltZQAxMz' +
      'k4OTQ4NjM1LMlreQAAABN0RVh0VGh1bWI6OlNpemUAMjEuM0tCQnpsrG8AAABadEVYdFRodW1iOjpVUk' +
      'kAZmlsZTovLy9ob21lL3d3d3Jvb3Qvd3d3LmVhc3lpY29uLm5ldC9jZG4taW1nLmVhc3lpY29uLmNuL3' +
      'NyYy8xMTU3Ny8xMTU3NzMyLnBuZxOTOSYAAAAASUVORK5CYII=',
      // table
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAABGdBTUEAAL' +
      'GPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAK' +
      'qNIzIAAAAJcEhZcwAABLAAAASwAJArFzAAAADgSURBVCjPfdA9L0NhGAbg660X7aaHQXo6kKYswmQUhP' +
      'KT/Yl20sRQ0qKLGFjo11GW0w4t7unK/eRZ7qBsQ/BX3oMb+/j+5RjQDab//COaepUhSryZLGiLvnM7dp' +
      '1oulhSN8o862FqNNfQU64sWpEaIbWuYpArNUQqBkNtAxTt6SzpgL5LNTWnWhq5mrnO9KJMzwMyQ49zzb' +
      'pJVFC2iURUlggSUZKrEHxq+kDJkdtch9q5julrqKs713I911WuXpTpusfYQFdnQZPZDkFVUcVAmO8QVM' +
      'XgTskYq7a9LGjN1w888l4QdsfN6AAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNS0wNy0yNVQyMTo1MDozMi' +
      'swODowMESg4doAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTQtMDQtMDZUMDk6NTM6MTcrMDg6MDA8MBsjAA' +
      'AATnRFWHRzb2Z0d2FyZQBJbWFnZU1hZ2ljayA2LjguOC0xMCBRMTYgeDg2XzY0IDIwMTUtMDctMTkgaH' +
      'R0cDovL3d3dy5pbWFnZW1hZ2ljay5vcmcFDJw1AAAAI3RFWHRzdmc6Y29tbWVudAAgR2VuZXJhdG9yOi' +
      'BJY29Nb29uLmlvILwwrIAAAAAYdEVYdFRodW1iOjpEb2N1bWVudDo6UGFnZXMAMaf/uy8AAAAYdEVYdF' +
      'RodW1iOjpJbWFnZTo6SGVpZ2h0ADUzM8q8AZUAAAAXdEVYdFRodW1iOjpJbWFnZTo6V2lkdGgANTMzWU' +
      '1RyAAAABl0RVh0VGh1bWI6Ok1pbWV0eXBlAGltYWdlL3BuZz+yVk4AAAAXdEVYdFRodW1iOjpNVGltZQ' +
      'AxMzk2NzQ5MTk37+6JEgAAABN0RVh0VGh1bWI6OlNpemUAMi45NUtCQn9HCG8AAABadEVYdFRodW1iOj' +
      'pVUkkAZmlsZTovLy9ob21lL3d3d3Jvb3Qvd3d3LmVhc3lpY29uLm5ldC9jZG4taW1nLmVhc3lpY29uLm' +
      'NuL3NyYy8xMTQzNS8xMTQzNTI4LnBuZ1baGAoAAAAASUVORK5CYII=',
      // column
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAPCAQAAABHeoekAAAABGdBTUEAAL' +
      'GPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAK' +
      'qNIzIAAAAJcEhZcwAAASwAAAEsAHOI6VIAAAB1SURBVBjTY2TYyrCbATcwY2CoYsAHElgYWBjYkAT+Mz' +
      'AwMCLxWRgZtjHsQRIQYGBmeIvEN2VhOMswD0nAiYGXYSOcx8jwk4XhO8MHJAWfGBhQ+F+Z0BzFiM5HV4' +
      'ABhoiC/yj8f+h8FgYNBh8kAQMGLobfyHwAyM8UUNk8qsEAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTUtMD' +
      'ctMjVUMjE6NDk6MzYrMDg6MDCNdDHDAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDE0LTEyLTE5VDE4OjU2Oj' +
      'EyKzA4OjAwOU9bHwAAAE50RVh0c29mdHdhcmUASW1hZ2VNYWdpY2sgNi44LjgtMTAgUTE2IHg4Nl82NC' +
      'AyMDE1LTA3LTE5IGh0dHA6Ly93d3cuaW1hZ2VtYWdpY2sub3JnBQycNQAAAGN0RVh0c3ZnOmNvbW1lbn' +
      'QAIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLi' +
      'BTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgcgt1lgAAABh0RVh0VGh1bWI6OkRvY3VtZW50OjpQYW' +
      'dlcwAxp/+7LwAAABh0RVh0VGh1bWI6OkltYWdlOjpIZWlnaHQAMjY1W+dGYAAAABd0RVh0VGh1bWI6Ok' +
      'ltYWdlOjpXaWR0aAAyNjZRH0eHAAAAGXRFWHRUaHVtYjo6TWltZXR5cGUAaW1hZ2UvcG5nP7JWTgAAAB' +
      'd0RVh0VGh1bWI6Ok1UaW1lADE0MTg5ODY1NzJGLGnJAAAAE3RFWHRUaHVtYjo6U2l6ZQAxLjEzS0JCW7' +
      'QG7wAAAFp0RVh0VGh1bWI6OlVSSQBmaWxlOi8vL2hvbWUvd3d3cm9vdC93d3cuZWFzeWljb24ubmV0L2' +
      'Nkbi1pbWcuZWFzeWljb24uY24vc3JjLzExODMwLzExODMwMjcucG5nOFxJnwAAAABJRU5ErkJggg=='
    ];

    // 左侧拦toolbar
    const toolbar = layout.attachToolbar();
    toolbar.loadStruct([{
      id: 'add',
      text: LANG['list']['add'],
      icon: 'plus-circle',
      type: 'button'
    }, {
      type: 'separator'
    }, {
      id: 'edit',
      text: LANG['list']['edit'],
      icon: 'edit',
      type: 'button',
      disabled: true
    }, {
      type: 'separator'
    }, {
      id: 'del',
      text: LANG['list']['del'],
      icon: 'trash-o',
      type: 'button',
      disabled: true
    }, {
      type: 'separator'
    }, {
      id: 'check',
      text: LANG['list']['check'],
      icon: 'spinner',
      type: 'button'
    }]);
    toolbar.attachEvent('onClick', (id) => {
      switch (id) {
        case 'add':
          this
            .drive
            .addConf();
          break;
        case 'del':
          this
            .drive
            .delConf();
          break;
        case 'edit':
          this
            .drive
            .editConf();
          break;
        case 'check': // 探针检测支持的函数
          this.checkprobe();
          break;
      }
    });
    return {
      imgs: imgs,
      layout: layout,
      toolbar: toolbar
    };
  }

  // 初始化右侧::SQL执行
  initQuery(layout) {
    let self = this;
    layout.setText(`<i class="fa fa-code"></i> ${LANG['query']['title']}`);
    layout.setHeight('200');

    let editor;
    // SQL语句编辑器
    editor = ace.edit(layout.cell.lastChild);
    editor.$blockScrolling = Infinity;
    editor.setTheme('ace/theme/tomorrow');
    editor.session.setMode('ace/mode/sql');
    editor.session.setUseWrapMode(true);
    editor.session.setWrapLimitRange(null, null);

    editor.setOptions({
      fontSize: '14px',
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true
    });

    // 快捷键
    editor.commands.addCommand({
      name: 'exec',
      bindKey: {
        win: 'Ctrl-E',
        mac: 'Command-E'
      },
      exec: () => {
        toolbar.callEvent('onClick', ['exec']);
      }
    });

    editor.session.setValue("SELECT 'Hello antSword :)' AS welcome;");

    // SQL语句toolbar
    const toolbar = layout.attachToolbar();
    let bookmark = JSON.parse(this.storage('dbbookmarks').get('{}'));
    let reloadToolbar = () => {
      let bookmark_opts = [{
        id: 'bookmark_add',
        type: 'button',
        icon: 'plus-circle',
        text: LANG['query']['bookmark']['add'],
        // enabled:
        // !!bookmark[Buffer.from(editor.session.getValue()).toString('base64')],
      }];
      let global_bookmarks = this.config.bookmarks || {};
      if (Object.keys(global_bookmarks).length > 0) {
        bookmark_opts.push({
          type: 'separator'
        });
        for (let gb in global_bookmarks) {
          bookmark_opts.push({
            id: 'bookmark_' + global_bookmarks[gb],
            text: antSword.noxss(gb),
            icon: 'bookmark',
            type: 'button',
            // enabled: Buffer.from(editor.session.getValue()).toString('base64') !=
            // global_bookmarks[gb] ,
          });
        }
      }
      if (!$.isEmptyObject(bookmark)) {
        bookmark_opts.push({
          type: 'separator'
        });
      };
      for (let _ in bookmark) {
        bookmark_opts.push({
          id: 'bookmark_' + _, // _ 是 base64 格式
          text: antSword.noxss(bookmark[_]),
          icon: 'bookmark-o',
          type: 'button',
          // enabled: Buffer.from(editor.session.getValue()).toString('base64') != _ ,
        });
      }
      // 添加清除按钮
      if (bookmark_opts.length > 2) {
        bookmark_opts.push({
          type: 'separator'
        });
        bookmark_opts.push({
          id: 'bookmark_remove',
          icon: 'remove',
          text: LANG['query']['bookmark']['del'],
          type: 'button'
        });
        bookmark_opts.push({
          id: 'bookmark_clear',
          icon: 'trash-o',
          text: LANG['query']['bookmark']['clear'],
          type: 'button'
        });
      };
      let btnstatus = {};
      ['exec', 'clear'].map((btn) => {
        try {
          btnstatus[btn] = toolbar.isEnabled(btn);
        } catch (e) {
          btnstatus[btn] = true;
        }
      })
      toolbar.clearAll();
      toolbar.loadStruct([{
          id: 'exec',
          text: LANG['query']['exec'],
          icon: 'play',
          type: 'button',
          disabled: !btnstatus['exec']
        },
        // { type: 'separator' }, { id: 'import', text: '导入', icon: 'download', type:
        // 'button' },
        {
          type: 'separator'
        }, {
          id: 'clear',
          text: LANG['query']['clear'],
          icon: 'remove',
          type: 'button'
        }, {
          type: 'separator'
        }, {
          id: 'bookmark',
          text: LANG['query']['bookmark']['title'],
          icon: 'bookmark',
          type: 'buttonSelect',
          openAll: true,
          options: bookmark_opts
        }
      ]);
    }

    reloadToolbar();
    toolbar.attachEvent('onClick', (id) => {
      switch (id) {
        case 'clear':
          editor
            .session
            .setValue('');
          break;
        case 'exec':
          this
            .drive
            .execSQL(editor.session.getValue());
          break;
        case 'bookmark_add':
          // 添加书签
          layer.prompt({
            value: antSword.noxss(editor.session.getValue()),
            title: LANG['query']['prompt']['add']['title']
          }, (value, i, e) => {
            bookmark[Buffer.from(editor.session.getValue()).toString('base64')] = value;
            self.storage('dbbookmarks').set(JSON.stringify(bookmark));
            toastr.success(LANG['query']['prompt']['add']['success'](editor.session.getValue()), LANG_T['success']);
            reloadToolbar();
            layer.close(i);
          });
          break;
        case 'bookmark_remove':
          layer.confirm(LANG['query']['prompt']['remove']['confirm'], {
            icon: 2,
            shift: 6,
            title: `<i class="fa fa-remove"></i> ${LANG['query']['prompt']['remove']['title']}`
          }, (_) => {
            // 删除书签并刷新
            delete bookmark[
              Buffer
              .from(editor.session.getValue())
              .toString('base64')
            ];
            self
              .storage('dbbookmarks')
              .set(JSON.stringify(bookmark));
            reloadToolbar();
            toastr.success(LANG['query']['prompt']['remove']['success'], LANG_T['success']);
            layer.close(_);
          });
          break;
        case 'bookmark_clear':
          layer.confirm(LANG['query']['prompt']['clear']['confirm'], {
            icon: 2,
            shift: 6,
            title: `<i class="fa fa-trash-o"></i> ${LANG['query']['prompt']['clear']['title']}`
          }, (_) => {
            bookmark = {};
            self
              .storage('dbbookmarks')
              .set('{}');
            reloadToolbar();
            toastr.success(LANG['query']['prompt']['clear']['success'], LANG_T['success']);
            layer.close(_);
          });
          break;
        default:
          let arr = id.split('_');
          if (arr.length === 2 && arr[0] === 'bookmark') {
            editor
              .session
              .setValue(Buffer.from(arr[1], 'base64').toString());
            // toolbar.enableItem('exec');
          };
          break;
      };
    });

    return {
      reloadToolbar: reloadToolbar,
      editor: editor,
      layout: layout,
      toolbar: toolbar
    };
  }

  // 初始化右侧::执行结果
  initResult(layout) {
    layout.setText(`<i class="fa fa-inbox"></i> ${LANG['result']['title']}`);
    // layout.hideHeader();

    const toolbar = layout.attachToolbar();
    toolbar.loadStruct([{
      id: 'dump',
      text: '导出',
      icon: 'upload',
      type: 'button',
      disabled: true
    }, {
      type: 'separator'
    }]);
    toolbar.attachEvent('onClick', (id) => {
      switch (id) {
        case 'dump':
          this
            .drive
            .dumpResult();
          break;
      }
    });
    return {
      layout: layout,
      toolbar: toolbar
    };
  }

  // 创建窗口
  createWin(opts) {
    const hash = (+new Date * Math.random())
      .toString(16)
      .substr(2, 8);
    // 默认配置
    const opt = $.extend({
      title: 'Window:' + hash,
      width: 550,
      height: 450
    }, opts);

    // 创建窗口
    const _win = this
      .win
      .createWindow(hash, 0, 0, opt['width'], opt['height']);
    _win.setText(opt['title']);
    _win.centerOnScreen();
    _win
      .button('minmax')
      .show();
    _win
      .button('minmax')
      .enable();

    // 返回窗口对象
    return _win;
  }

  // 检测数据库函数支持
  checkprobe() {
    let that = this;
    let win = that.createWin({
      title: LANG['probedb']['title'],
      width: 350,
      height: 400
    });
    const func_mapping = {
      // PHP
      'mysql_close': 'MYSQL',
      'mysqli_close': 'MYSQLI',
      'mssql_close': 'MSSQL',
      'sqlsrv_close': 'SQLSRV',
      'ora_close': 'ORACLE',
      'oci_close': 'ORACLE_OCI8',
      'ifx_close': 'INFORMIX',
      'sqlite_close': 'SQLite',
      'pg_close': 'PostgreSQL',
      'dba_close': 'DBA',
      'dbmclose': 'DBM',
      'filepro_fieldcount': 'FilePro',
      'sybase_close': 'SyBase'
    }
    let grid = win.attachGrid();
    grid.clearAll();
    grid.setHeader(`${LANG['probedb']['coltype']},${LANG['probedb']['issupport']}`);
    grid.setColTypes("ro,ro");
    grid.setColSorting('str,str');
    grid.setColumnMinWidth(100, 50);
    grid.setInitWidths("*");
    grid.setEditable(false);
    grid.init();
    win.progressOn();
    that
      .drive
      .core
      .request(that.drive.core.base.probedb())
      .then((ret) => {
        if (ret['text'].indexOf("ERROR://") > -1) {
          throw res["text"];
        }
        let _data = ret['text'].split('\n');
        let data_arr = [];
        for (let i = 0; i < _data.length; i++) {
          let item = _data[i].split('\t');
          if (item.length < 2) {
            continue;
          }
          data_arr.push({
            id: i + 1,
            data: [
              func_mapping.hasOwnProperty(item[0]) ?
              func_mapping[item[0]] :
              antSword.noxss(item[0]),
              parseInt(item[1]) === 1 ?
              "√" :
              "×"
            ],
            style: parseInt(item[1]) === 1 ?
              "background-color:#ADF1B9" : ""
          });
        }
        grid.parse({
          'rows': data_arr
        }, 'json');
        toastr.success(LANG['probedb']['success'], LANG_T['success']);
        win.progressOff();
      })
      .catch((err) => {
        win.progressOff();
        toastr.error(JSON.stringify(err), LANG_T['error']);
      });
  }

  // 本地存储 storage('save_key').get('{}') storage('save_key').set('{a:123}')
  storage(key) {
    let md5 = crypto.createHash('md5');
    md5.update(this.opt['url']);
    const k = `${md5
      .digest('hex')
      .substr(0, 11)}_${key}`
    return {
      get: (def) => localStorage.getItem(k) || def,
      set: (val) => localStorage.setItem(k, val)
    }
  }
}

// export default Database;
module.exports = Database;