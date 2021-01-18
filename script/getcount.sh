#!/usr/bin/env bash

echo "Content-Type:text/json"
echo "Access-Control-Allow-Origin: *"
echo "Access-Control-Allow-Methods: POST, GET, OPTIONS"
echo "Status:200"
echo ""

PARAM_KEY=$EXTERNAL_PARAM
COUNT_SAVE_KEY="file_proxy_count_save_${PARAM_KEY}"
COUNT_YESTERDAY_KEY="file_proxy_count_yesterday_${PARAM_KEY}"
COUNT_TODAY_KEY="file_proxy_count_today_${PARAM_KEY}"

function redis-cli(){
    /usr/local/bin/redis-cli -h 127.0.0.1 -p 8888 $@
}

count=`redis-cli get "$COUNT_SAVE_KEY"`
yesterday_count=`redis-cli get "$COUNT_YESTERDAY_KEY"`
today_count=`redis-cli get "$COUNT_TODAY_KEY"`

echo -E "{\"count\": \"${count}\"\
, \"yesterday\": \"${yesterday_count}\"\
, \"today\": \"${today_count}\"}"

