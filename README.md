
# 文件代下载服务，github文件加速下载

更多项目说明可以前往blog查看：[文件代下载服务说明](https://zwc365.com/2020/09/24/file-proxy-download)

项目使用地址：[https://pd.zwc365.com](https://pd.zwc365.com)

`CloudFlare 代下` 功能基于开源仓库修改：[hunshcn/gh-proxy](https://github.com/hunshcn/gh-proxy)

## 特点

支持下载文件、支持 git bash 终端直接 git clone 项目

一般情况下，**推荐使用 `CloudFlare 代下功能` ，没有速度以及文件大小限制**

支持：`zip` `tar.gz` `rar` `mp4` `apk` `iso` 等格式的下载文件

### 命令行下载使用方式

代下服务进行了命令行兼容，通过命令行代下，仅需要在下载链接的前面添加本站代下 url 前缀即可：

```
https://pd.zwc365.com/seturl/
```

示例：

```
# 原来的下载方式是:
wget https://github.com/zwc456baby/file-proxy/archive/master.zip

# 使用 CloudFlare 代下功能
wget https://pd.zwc365.com/cfdownload/https://github.com/zwc456baby/file-proxy/archive/master.zip

# 使用本站服务器代下功能
wget https://pd.zwc365.com/seturl/https://github.com/zwc456baby/file-proxy/archive/master.zip
```

![代理下载截图](https://picture.zwc365.com/2020/10/22/8pXDKAaCoPGNgME.png)

> 只需在要下载的文件前添加本站 url 即可。这样在纯命令行的系统中，也可以使用到代下服务了

## 命令行Clone项目使用方式

**使用 git clone 一个项目** 也是一样的操作步骤。如果 `git bash` 终端报错，提示不支持网页重定向，可能需要多一步设置（设定 git 跟随 302 重定向）:

```
git config --global http.followRedirects true
```

关于 Github 项目的链接，请务必使用此处的 https 链接：

![项目url](https://picture.zwc365.com/2020/10/22/OqxGtUI4ZsjQ2vg.png)

示例（目前仅支持 https 开头的项目地址）：

```
# 原来的 clone 方式
git clone https://github.com/zwc456baby/file-proxy.git
 
# 本站代理 clone 的使用方式
git clone https://pd.zwc365.com/seturl/https://github.com/zwc456baby/file-proxy.git
```

![代理 clone 截图](https://picture.zwc365.com/2020/10/22/wvqUlQemFOG4xkh.png)

> 如果使用 CloudFlare 代下，添加的链接前缀是： https://pd.zwc365.com/cfdownload/

## 如何添加子节点

**添加子节点非常简单**，只要往 Nginx 中添加一份配置并简单修改即可

如果想要部署，可以前往 [项目说明](https://zwc365.com/2020/09/24/file-proxy-download) 中的部署子节点章节

