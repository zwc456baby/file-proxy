#!/usr/bin/env bash

# echo $ts2 |sed "s/\\\/-/g"
# md5sum |awk '{print $1}'

CHECK_HOST=https://pd.zwc365.com

# 一些必须的环境遍历
export LOG_FILENAME=checkhost
COUNT_SAVE_KEY="file_proxy_count_save_$(echo $CHECK_HOST |md5sum |awk '{print $1}')"
COUNT_YESTERDAY_SAVE_KEY="file_proxy_count_yesterday_save_$(echo $CHECK_HOST |md5sum |awk '{print $1}')"
COUNT_YESTERDAY_KEY="file_proxy_count_yesterday_$(echo $CHECK_HOST |md5sum |awk '{print $1}')"

function redis-cli(){
    /usr/local/bin/redis-cli -h 127.0.0.1 -p 8888 $@
}

function countSplit(){
    yesterdayFull=`redis-cli get "$COUNT_YESTERDAY_SAVE_KEY"`
    countFull=`redis-cli get "$COUNT_SAVE_KEY"`
    if [ "$yesterdayFull"x == ""x ]; then
        yesterdayFull=0
    fi
    if [ "$countFull"x == ""x ]; then
        countFull=0
    fi
    todayCount=$(($countFull-$yesterdayFull))
    redis-cli set "$COUNT_YESTERDAY_KEY" "$todayCount"
    redis-cli set "$COUNT_YESTERDAY_SAVE_KEY" "$countFull"
}

function logSave(){
    yesterDayCount=`redis-cli get "$COUNT_YESTERDAY_KEY"`
    fullCount=`redis-cli get "$COUNT_SAVE_KEY"`
    log -o "${CHECK_HOST} save_key: ${COUNT_SAVE_KEY}"
    log -o "${CHECK_HOST} yesterday_key: ${COUNT_YESTERDAY_KEY}"
    log -o "${CHECK_HOST} full request count: ${fullCount}"
    log -o "${CHECK_HOST} yesterday request count: $yesterDayCount"
}

countSplit
logSave

