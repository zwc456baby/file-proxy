

# 下载服务使用统计后端

此目录托管下载服务统计的后端程序

该统计程序实际上是用 shell 脚本编写的，通过 nginx + fastcgi 程序部署运行


此统计并非实时的，而是通过 crontab 定时任务，在每天夜间通过分析 nginx 日志文件进行统计

也就是说，主页的统计功能，实际上只能统计昨天之前的使用次数

后面版本可能会统计当日的

(目前暂时不加，因为没有想到很好的方法，解决实时日志分析造成的性能问题)

