'use strict'

/**
 * static files (404.html, sw.js, conf.js)
 */
const ASSET_URL = 'https://pd.zwc365.com/'
// 前缀，如果自定义路由为example.com/gh/*，将PREFIX改为 '/gh/'，注意，少一个杠都会错！
const PREFIX = '/cfdownload/'
// git使用cnpmjs镜像、分支文件使用jsDelivr镜像的开关，0为关闭，默认关闭
// 此处不要开启，否则将导致下载问题
const Config = {
    jsdelivr: 0,
    cnpmjs: 0
}

/** @type {RequestInit} */
const PREFLIGHT_INIT = {
    status: 204,
    headers: new Headers({
        'access-control-allow-origin': '*',
        'access-control-allow-credentials': true,
        'access-control-allow-methods': 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS',
        'access-control-max-age': '1728000',
    }),
}

/**
 * @param {any} body
 * @param {number} status
 * @param {Object<string, string>} headers
 */
function makeRes(body, status = 200, headers = {}) {
    headers['access-control-allow-origin'] = '*'
    return new Response(body, {status, headers})
}


/**
 * @param {string} urlStr
 */
function newUrl(urlStr) {
    try {
        return new URL(urlStr)
    } catch (err) {
        return null
    }
}


addEventListener('fetch', e => {
    const ret = fetchHandler(e)
        .catch(err => makeRes('cfworker error:\n' + err.stack, 502))
    e.respondWith(ret)
})


/**
 * @param {FetchEvent} e
 */
async function fetchHandler(e) {
    console.log("new request enter")
    const req = e.request
    const urlStr = req.url
    const urlObj = new URL(urlStr)
    // let path = urlObj.searchParams.get('q')
    // if (path) {
    //     return Response.redirect('https://' + urlObj.host + PREFIX + path, 301)
    // }
    // cfworker 会把路径中的 `//` 合并成 `/`
    let path = urlObj.href.substr(urlObj.origin.length + PREFIX.length)
    if (path.startsWith('https')){
        path = path.replace(/^https?:\/+/, 'https://')
    }else{
        path = path.replace(/^http?:\/+/, 'http://')
    }
    const exp1 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:releases|archive)\/.*$/i
    const exp2 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:blob)\/.*$/i
    const exp3 = /^(?:https?:\/\/)?github\.com\/.+?\/.+?\/(?:info|git-).*$/i
    const exp4 = /^(?:https?:\/\/)?raw\.githubusercontent\.com\/.+?\/.+?\/.+?\/.+$/i

    if (path.search(exp1) === 0 || !Config.cnpmjs && (path.search(exp3) === 0 || path.search(exp4) === 0)) {
        return httpHandler(req, urlObj, path)
    } else if (path.search(exp2) === 0) {
        if (Config.jsdelivr){
            const newUrl = path.replace('/blob/', '@').replace(/^(?:https?:\/\/)?github\.com/, 'https://cdn.jsdelivr.net/gh')
            return Response.redirect(newUrl, 302)
        }else{
            path = path.replace('/blob/', '/raw/')
            return httpHandler(req, urlObj, path)
        }
    } else if (path.search(exp3) === 0) {
        const newUrl = path.replace(/^(?:https?:\/\/)?github\.com/, 'https://github.com.cnpmjs.org')
        return Response.redirect(newUrl, 302)
    } else if (path.search(exp4) === 0) {
        const newUrl = path.replace(/(?<=com\/.+?\/.+?)\/(.+?\/)/, '@$1').replace(/^(?:https?:\/\/)?raw\.githubusercontent\.com/, 'https://cdn.jsdelivr.net/gh')
        return Response.redirect(newUrl, 302)
    } else {
        if (path === '' || path === '/') {
            return new Response("success", {status: 200})
        }
        return httpHandler(req, urlObj, path)
    }
}


/**
 * @param {Request} req
 * @param {string} pathname
 */
function httpHandler(req, reqUrlObj, pathname) {
    console.log("http handler")
    const reqHdrRaw = req.headers

    PREFLIGHT_INIT.headers.set("access-control-allow-origin", reqUrlObj.origin)
    // preflight
    if (req.method === 'OPTIONS' &&
        reqHdrRaw.has('access-control-request-headers')
    ) {
        return new Response(null, PREFLIGHT_INIT)
    }

    let rawLen = ''

    const reqHdrNew = new Headers(reqHdrRaw)

    const fullReqUrl = reqUrlObj.origin + PREFIX
    if (reqHdrNew.get('Referer') && reqHdrNew.get('Referer').indexOf(fullReqUrl) == 0){
        reqHdrNew.set('Referer', reqHdrNew.get('Referer').substr(fullReqUrl.length))
    }

    let urlStr = pathname
    if (urlStr.startsWith('github')) {
        urlStr = 'https://' + urlStr
    }
    // const urlObj = newUrl('http://online.dun.ornglad.com/download/QQ%E9%82%AE%E7%AE%B1_010273872.exe')
    const urlObj = newUrl(urlStr)
    /** @type {RequestInit} */
    const reqInit = {
        method: req.method,
        headers: reqHdrNew,
        redirect: 'manual',
        body: req.body
    }
    return proxy(req, reqUrlObj, urlObj, reqInit, rawLen, 0)
}


/**
 *
 * @param {URL} urlObj
 * @param {RequestInit} reqInit
 */
async function proxy(cfReq, cfReqUrlObj, urlObj, reqInit, rawLen) {
    console.log(urlObj)
    const res = await fetch(urlObj.href, reqInit)
    const resHdrOld = res.headers
    const resHdrNew = new Headers(resHdrOld)

    // verify
    if (rawLen) {
        const newLen = resHdrOld.get('content-length') || ''
        const badLen = (rawLen !== newLen)

        if (badLen) {
            return makeRes(res.body, 400, {
                '--error': `bad len: ${newLen}, except: ${rawLen}`,
                'access-control-expose-headers': '--error',
            })
        }
    }
    var status = res.status
    if (status == 301 || status == 302 || status == 303 || status == 307 || status == 308) {
        var nextLocation = resHdrOld.get('location')
        if ( ! nextLocation.startsWith('https') && ! nextLocation.startsWith('http')){
            if (nextLocation.startsWith('//') && ! nextLocation.startsWith('///')){
                nextLocation = PREFIX + urlObj.protocol + nextLocation
            } else if (urlObj.origin.endsWith('/') || nextLocation.startsWith('/')){
                nextLocation = PREFIX + urlObj.origin + nextLocation
            } else {
                nextLocation = PREFIX + urlObj.origin + '/' + nextLocation
            }
        } else {
            nextLocation = PREFIX + nextLocation
        }
        status = 302
        resHdrNew.set('location', nextLocation)
    }
    if (cfReq.headers.has('origin')){
        resHdrNew.set('access-control-allow-origin', cfReq.headers.get('origin'))
    } else if(cfReq.headers.has('Referer') && newUrl(cfReq.headers.get('Referer'))){
        resHdrNew.set('access-control-allow-origin', newUrl(cfReq.headers.get('Referer')).origin)
    } else {
        resHdrNew.set('access-control-allow-origin', cfReqUrlObj.origin)
    }
    resHdrNew.set('access-control-expose-headers', '*')
    resHdrNew.set('access-control-allow-methods', 'GET,POST,PUT,PATCH,TRACE,DELETE,HEAD,OPTIONS')
    resHdrNew.set('access-control-allow-credentials', true)

    resHdrNew.delete('content-security-policy')
    resHdrNew.delete('content-security-policy-report-only')
    resHdrNew.delete('clear-site-data')
    resHdrNew.delete('cross-origin-resource-policy')
    return new Response(res.body, {
        status,
        headers: resHdrNew,
    })
}

