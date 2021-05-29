#!/usr/bin/env bash

# MAX_FLOW="1572864"
# 目前流量限制 1.5 T
MAX_FLOW="1610612736"

test -f ~/software/.runrc && . ~/software/.runrc
export LOG_FILENAME="ali-vnstat-monitor"

# vnstat -m |awk -F\| '{print $2}' |awk 'NR==-1{print}'
# 首先获取这个月的出站流量信息,此信息位于第二列
info_list=`vnstat -m |awk -F\| '{print $2}'`

# 获取信息的总行数，而当前这个月的出站流量信息位于倒数第二行
line_count=`echo -E "$info_list" |wc -l`
if [ "$line_count" -le 3 ]; then
  log -o -- "vnstat get month flow faild: $info_list"
  exit 1
fi
cur_line=$((line_count-2))

# 也就是说这个月的出站流量信息位于 vnstat 命令打印的
# 第二列倒数第二行，现在将其打印出来
check_str=`echo -E "$info_list" |sed -n "${cur_line},${cur_line}p"`

# 这是一个乘法计算方法，用来将流量根据单位换算成真实的数据
function mult(){
  echo -E "$1 $2" |awk '{printf("%.2f",$1*$2)}'
}

# 获取流量和单位
mflow=`echo -E "$check_str" |awk '{print $1}'`
unit=`echo -E "$check_str" |awk '{print $2}'`

# 将流量根据单位换算成 kb 单位的数据
if [ "$unit"x == "PiB"x ]; then
  mflow=`mult $mflow "1024"`
  unit="TiB"
fi
if [ "$unit"x == "TiB"x ]; then
  mflow=`mult $mflow "1024"`
  unit="GiB"
fi
if [ "$unit"x == "GiB"x ]; then
  mflow=`mult $mflow "1024"`
  unit="MiB"
fi
if [ "$unit"x == "MiB"x ]; then
  mflow=`mult $mflow "1024"`
  unit="KiB"
fi
if [ "$unit"x != "KiB"x ]; then
  log -o "unit not KiB: $unit"
  exit 1
fi
# 上面代码是逐步将流量单位换算成 KiB

# 截取小数点，显示是统一单位的流量数据了
# 如果截取失败则退出
mkb=`echo "$mflow" |awk -F. '{print $1}'`
if [ "$mkb"x == ""x ]; then
  log -o -- "get unit flow faild: $mflow"
  exit 1
fi
# 流量没有超出最大限制，则退出
if [ "$mkb" -lt "$MAX_FLOW" ]; then
  log -o -- "flow no overflow: $mkb"
  exit 0
fi

# 到这里流量已经超出限制。执行下列脚本
log -o -- "flow overflow: $mkb"
################################

echo "# 服务器流量超出限制" >/home/admin/software/fileproxyserver/proxylist.txt


