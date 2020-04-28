var cache_path = '/var/www/dev-php/cached';

function cache_file(r) {
    var crypto = require('crypto')
    var fs = require('fs')
    // do md5 on r.variables.request_uri and calculate folder-structure
    // Bonus: sort get_params so that
    // "?color=blue&size=medium" and "?size=medium&color=blue"
    // result in the *same* cache_key
    var uri = r.uri;
    var args = r.args;
    var extension = getExtension(r);
    var hashed = crypto.createHash('md5').update(uri).digest('hex');
    fs.appendFileSync(`${cache_path}/args.txt`, `${JSON.stringify(args)}\r\n${uri}: ${hashed}`, function () {
        r.log('done');
    });

    return `${hashed}${extension}`
}

function getExtension(r) {
    var uri = r.uri;
    // var hashed = crypto.createHash('md5').update(uri).toString();
    var extension = '.html';
    if (uri.lastIndexOf('.') >= 0) {
        extension = uri.slice(uri.lastIndexOf('.'));
    }

    return extension;
}

function proxy(r) {
    var fs = require('fs')
    // do sub_request to /fetch-location
    r.subrequest("/fetch")
        .then(reply => {
            r.headersOut['Content-type'] = getContentType(r);
            var responseBody = reply.responseBody;
            r.return(200, responseBody)

            return responseBody;
        }).then(responseBody => cache_response(r, responseBody));
    // after reply to client save response body to tmp file
    // do antother sub_request in "detached" mode to tell node.js to pick up tmp file
    // TODO: Test if this works with @fetch instead of /fetch
}

function cache_response(r, body) {
    var fs = require('fs')
    var hashed = cache_file(r);

    fs.writeFile(`${cache_path}/${hashed}`, body, function () {
    });
}


function getContentType(r) {
    var contentType = 'text/html';
    var types = MimeTypes;
    var extension = getExtension(r);
    extension = extension.replace('\.', '');

    if (types[extension]) {
        contentType = types[extension];
    }

    return contentType;
}

var MimeTypes = {
    'html': 'text/html',
    'htm': 'text/html',
    'shtml': 'text/html',
    'css': 'text/css',
    'xml': 'text/xml',
    'gif': 'image/gif',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'application/javascript',
    'atom': 'application/atom+xml',
    'rss': 'application/rss+xml',

    'mml': 'text/mathml',
    'txt': 'text/plain',
    'jad': 'text/vnd.sun.j2me.app-descriptor',
    'wml': 'text/vnd.wap.wml',
    'htc': 'text/x-component',

    'png': 'image/png',
    'svg': 'image/svg+xml',
    'svgz': 'image/svg+xml',
    'tif': 'image/tiff',
    'tiff': 'image/tiff',
    'wbmp': 'image/vnd.wap.wbmp',
    'webp': 'image/webp',
    'ico': 'image/x-icon',
    'jng': 'image/x-jng',
    'bmp': 'image/x-ms-bmp',

    'woff': 'font/woff',
    'woff2': 'font/woff2',

    'jar': 'application/java-archive',
    'war': 'application/java-archive',
    'ear': 'application/java-archive',
    'json': 'application/json',
    'hqx': 'application/mac-binhex40',
    'doc': 'application/msword',
    'pdf': 'application/pdf',
    'ps': 'application/postscript',
    'eps': 'application/postscript',
    'ai': 'application/postscript',
    'rtf': 'application/rtf',
    'm3u8': 'application/vnd.apple.mpegurl',
    'kml': 'application/vnd.google-earth.kml+xml',
    'kmz': 'application/vnd.google-earth.kmz',
    'xls': 'application/vnd.ms-excel',
    'eot': 'application/vnd.ms-fontobject',
    'ppt': 'application/vnd.ms-powerpoint',
    'odg': 'application/vnd.oasis.opendocument.graphics',
    'odp': 'application/vnd.oasis.opendocument.presentation',
    'ods': 'application/vnd.oasis.opendocument.spreadsheet',
    'odt': 'application/vnd.oasis.opendocument.text',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'wmlc': 'application/vnd.wap.wmlc',
    '7z': 'application/x-7z-compressed',
    'cco': 'application/x-cocoa',
    'jardiff': 'application/x-java-archive-diff',
    'jnlp': 'application/x-java-jnlp-file',
    'run': 'application/x-makeself',
    'pl': 'application/x-perl',
    'pm': 'application/x-perl',
    'prc': 'application/x-pilot',
    'pdb': 'application/x-pilot',
    'rar': 'application/x-rar-compressed',
    'rpm': 'application/x-redhat-package-manager',
    'sea': 'application/x-sea',
    'swf': 'application/x-shockwave-flash',
    'sit': 'application/x-stuffit',
    'tcl': 'application/x-tcl',
    'tk': 'application/x-tcl',
    'der': 'application/x-x509-ca-cert',
    'pem': 'application/x-x509-ca-cert',
    'crt': 'application/x-x509-ca-cert',
    'xpi': 'application/x-xpinstall',
    'xhtml': 'application/xhtml+xml',
    'xspf': 'application/xspf+xml',
    'zip': 'application/zip',

    'bin': 'application/octet-stream',
    'exe': 'application/octet-stream',
    'dll': 'application/octet-stream',
    'deb': 'application/octet-stream',
    'dmg': 'application/octet-stream',
    'iso': 'application/octet-stream',
    'img': 'application/octet-stream',
    'msi': 'application/octet-stream',
    'msp': 'application/octet-stream',
    'msm': 'application/octet-stream',

    'mid': 'audio/midi',
    'midi': 'audio/midi',
    'kar': 'audio/midi',
    'mp3': 'audio/mpeg',
    'ogg': 'audio/ogg',
    'm4a': 'audio/x-m4a',
    'ra': 'audio/x-realaudio',

    '3gpp': 'video/3gpp',
    '3gp': 'video/3gpp',
    'ts': 'video/mp2t',
    'mp4': 'video/mp4',
    'mpeg': 'video/mpeg',
    'mpg': 'video/mpeg',
    'mov': 'video/quicktime',
    'webm': 'video/webm',
    'flv': 'video/x-flv',
    'm4v': 'video/x-m4v',
    'mng': 'video/x-mng',
    'asx': 'video/x-ms-asf',
    'asf': 'video/x-ms-asf',
    'wmv': 'video/x-ms-wmv',
    'avi': 'video/x-msvideo',
}
// export default { cache_file, cache_response, proxy };
