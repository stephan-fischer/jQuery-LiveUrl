/*
 * jQuery LiveUrl
 *
 * MIT License - You are free to use this commercial projects as long as the copyright header is left intact.
 * @author        Stephan Fischer
 * @copyright     (c) 2012 Stephan Fischer (www.ainetworks.de)
 * @version 0.0.1 (pre-alpha)
 * 
 * UriParser is a function from my addon "Superswitch" for Mozilla FireFox.
 *  
 */
/*
 * CHECK http://video.golem.de/games/9559/vor-assassins-creed-3-trailer-(was-bisher-geschah).html
 */

(function( $ )
{
    $.fn.extend(
    { 
        /*
         * TODO:
         *  Multiple Image choose
         */
        
        liveUrl : function( options) 
        {
            var defaults = 
            {
                preview : '',
                meta: [
                    ['description','name',     'description'],
                    ['description','property', 'og:description'],
                    ['description','property', 'pinterestapp:about'],
                    ['image','property', 'og:image'],
                    ['image','itemprop', 'image'],
                    ['title','property', 'og:title'],
                    ['video','property', 'og:video'],
                    ['video_type','property', 'og:video:type'],
                    ['video_width','property', 'og:video:width'],
                    ['video_height','property', 'og:video:height']
               ],
               findLogo         : false,
               matchNoData      : true,
               multipleImages   : true,
               defaultProtocol  : 'http://',
               minWidth         : 32,
               minHeight        : 32,
               success          : function() {},
               loadStart        : function() {},
               loadEnd          : function() {},
               imgLoadStart     : function() {},
               imgLoadEnd       : function() {},
               addImage         : function() {}
            }

            var options =  $.extend(defaults, options);
            
            this.each(function() 
            {
                
                var o       = options,
                    core    = {already : []},
                    url     = {},
                    preview = {};
                
                core.init = function () 
                {
                    core.preview = false;
                    preview      = {
                        url : '',
                        images: [],
                        image : '',
                        title: '' ,
                        description: ''
                    };  
                };
                
                core.textUpdate = function() 
                {                
                    // read all links   
                    var links = $.urlHelper.getLinks($(this).val());
                    core.cleanDuplicates(links);
                    
                    if (links != null) {
                        if (!core.preview) {
                            core.current = $(this);
                            core.process(links);
                        }
                    }
                };
                
                core.process = function(urlArray) 
                {
        
                    for (var index in urlArray) {
        
                        var strUrl      = urlArray[index] ;
                        var strUrl      = strUrl.slice(0,-1);
                        var pLink       = new $.urlHelper.UriParser(strUrl);
                       
                        if (pLink.subdomain.length > 0 || pLink.protocol.length > 0 ) {
            
                            if  (pLink.protocol.length == 0) {
                                strUrl = o.defaultProtocol + strUrl;
                            }
            
                            if (!core.isDuplicate(strUrl, core.already)) {
                               
                               if ($.urlHelper.isImage(strUrl)) {
                                   preview.image = strUrl;
                                   core.getPreview({}, strUrl);
                                   
                               } else {
                                   core.getData(strUrl);  
                               }
                               
                               return true;
                            }
                        }
                    } 
                };
                
                core.cleanDuplicates = function(urlArray) 
                {
                    var links = core.createLinks(urlArray);
                    
                    for(var index in core.already) {
                        var strUrl  = core.already[index];
                          
                        if (!core.isDuplicate(strUrl, links)){
                            
                            var index = core.already.indexOf(strUrl);
                            core.already.splice(index, 1);
                        }
                    }
                };
                
                core.createLinks = function(urlArray) 
                {
                    var links = [];
                    
                    for(var index in urlArray) {
                        var strUrl  = urlArray[index];
                        var strUrl  = strUrl.slice(0,-1);
                        var pLink   = new $.urlHelper.UriParser(strUrl);
                       
                        if (pLink.subdomain.length > 0 || 
                            pLink.protocol.length  > 0 ) {
                                
                            if  (pLink.protocol.length == 0) {
                                strUrl = o.defaultProtocol + strUrl;
                            }
                            
                            links.push(strUrl);
                        }
                    }
                    
                    return links;
                }
                
                core.isDuplicate = function(url, array) 
                {
                    var duplicate = false;
                    $.each(array, function(key, val)
                    {
                          console.log(val + "__" + url);
                          
                        if (val == url) {
                            duplicate = true;
                        } 
                    }); 
                    
                    return duplicate;
                };
                
                core.getData = function (url)
                {
                  
                    var xpath  =  '//title|//head/meta|//head|//body';
                    var query  =  'select * from html where url="' + url + '" and compat="html5" and xpath="'+xpath+'"';

                    core.addLoader();
                    
                    $.yql(query, function() 
                        {
                            core.removeLoader();
                            return false;  
                        },
                        function(data)
                        {
                            // URL already loaded, or preview is already shown.
                            if (core.isDuplicate(url, core.already) || core.preview) {
                                core.removeLoader();
                                return false;  
                            }
        
                            if (data.query.results == null) {
                                core.already.push(url);
                                core.removeLoader();
                                if (o.matchNoData) {
                                    core.getPreview({}, url);
                                } else {
                                    return false;  
                                }
                                
                            } else {
                                core.getPreview(data.query.results, url);
                            } 
                        }
                    )
                }; //getData
                
                core.isImage     = function(){
                    return (preview.image.length == 0) ? false : true;  
                };
                
                core.getPreview = function(data, uri)
                {
                    core.preview = true; 
                    core.already.push(uri);  
        
                    preview.title       = (data.title || uri);
                    preview.url         = uri;
                    
                    if (data.hasOwnProperty('meta')) {
                        if (typeof data.meta.length == 'undefined') 
                             core.setMetaData(data.meta);
                        else  
                            $.each(data.meta, function(key, val)
                            {
                                core.setMetaData(val);
                            }); 
                    }

                    // Image fallback
                    if (!core.isImage()) {
                    
                        var images = core.getImages(data.body);
                        
                        if (o.findLogo) {
                            
                            $.each(images, function(key, val)
                            {
                                 if (val.hasOwnProperty('id')) {
                                    var id   = val.id.toLowerCase();
                                    var isID = id.indexOf('logo');
                                    
                                    if (isID != -1) {
                                        preview.image = val.src;
                                        return false;
                                    }
                                 }
                             });
                        
                            if (!core.isImage()) {
                                $.each(images, function(key, val)
                                 {
                                    var src   = val.src.toLowerCase();
                                    var isID = src.indexOf('logo');
                                    
                                    if (isID != -1) {
                                        preview.image = val.src;
                                        return false;
                                    
                                     }
                                 });
                             }
       
                        }
                        
                        if (!core.isImage() && images.length > 0 ) {
                            for  (var index in images) {
                                preview.images.push(images[index].src);
                            }
                        } 
                    }
                    
                    core.removeLoader();
                    
                    // prepare output
                    var not   = 'undefined';
                    var data  = {
                        title       : preview.title,
                        description : preview.description,
                        url         : preview.url,
                        video       : (typeof preview.video != not && preview.video.length > 0) ? {} : null,
                    };
                    
                    if (data.video != null) {
                        data.video = {
                            file  :   preview.video,
                            type  : (typeof preview.video_type   != not) ? preview.video_type  : '',
                            width : (typeof preview.video_width  != not) ? preview.video_width : '',
                            height: (typeof preview.video_height != not) ? preview.video_height :''
                        }
                    }
                    
                    o.success(data);
                    
                    if (core.isImage()){
                        preview.images.push(preview.image); 
                        preview.image = '';
                    }
                    
                    
                    core.addImages();
                    core.current.one('clear', function() 
                    {
                       core.init();
                    });
                    
                    /* Show Videos */
                    /*
                    if(o.allowVideos) {
                        if(typeof preview.video != 'undefined') {
                            console.log(preview);
                            if (
                            typeof preview.video_type == 'undefined' ||
                            preview.video_type        != 'application/x-shockwave-flash' ) return false;
                            
                            video = o.video.replace(/{video}/ig, preview.video);
                            var flashVideo = $(video);
                            jqPrev.append(flashVideo);
                        }
                    }
                    */
                          
                };
                
                core.addLoader = function()
                {  
                    o.loadStart();
                };
                
                core.removeLoader = function() 
                {
                    o.loadEnd();
                };
                
                core.setMetaData = function(val) 
                {
                    for (index in o.meta) {
                        var meta = o.meta[index];
                        preview[meta[0]] = (core.getValue(val,meta[1],meta[2])||preview[meta[0]]);
                    }
                };
                
                core.getImages = function(content)
                {
                    var data   = [];
                    var images = [];
                    
                    iterate = function(obj, tag)
                    {
                        for(var key in obj) {
                            var elem = obj[key]; 
                    
                            if(key === tag)              data.push(elem);
                            if(typeof elem === "object") iterate(elem, tag); 
                        }
                    }
                    
                    iterate(content, 'img'); 
         
                    if(data.length > 0) {
                         $.each(data, function(key, val)
                         {
                             if (val.hasOwnProperty('src')) {
                                 if (val.src.length > 0) {
                                     if ($.urlHelper.isImage(val.src)) {
                                         images.push(val);
                                     }
                                 }
                             }
                         });
                    }
                    
                    return images;
                };
                
                core.addImages = function() 
                {
                    var images = [];
                    
                    for (var index in preview.images) {
                        var image = preview.images[index];
                       
                        
                        if (!$.urlHelper.isAbsolute(image)) {
                            var pLink    = new $.urlHelper.UriParser(preview.url);
                            var host     = pLink.url + pLink.subdomain + pLink.domain;

                            if ($.urlHelper.isPathAbsolute(image)) 
                                 image = host + image; 
                            else image = host + $.urlHelper.stripFile(pLink.path) + '/' + image;
                        }
                        
                        core.getImage(image, function(img) 
                        {
                            
                            if (img.width  >= o.minWidth  && 
                                img.height >= o.minHeight && core.preview) {

                                o.addImage(img);
                                
                                if(!o.multipleImages) {
                                    return;
                                }
                                
                            }
                        });
                    }

                };
                
                core.getImage = function(image, callback)
                {
                    var img     = new Image();
                    img.addEventListener("load", function() 
                    {
                        var tmrLoaded = window.setInterval(function()
                        {   
                            if (img.width) {
                                window.clearInterval(tmrLoaded);  
                                callback(img);
                            }
                        }, 100);
                    }, false);
                    
                    img.src          = image;
                };
                
                core.getValue = function (val,key, tag) {
                    if (val.hasOwnProperty(key)) {
                        if (val[key].toLowerCase() ==  tag.toLowerCase()) {
                            if (val.hasOwnProperty('content') &&val.content.length > 0) {
                                return val.content;
                            }
                        } 
                        
                    }
                } ;
                
                core.init();
                var self  = $(this);
                self.on('keyup change', core.textUpdate);
    
            });
        }
    });

    jQuery.yql = function yql(query, error, success) 
    {
        var yql = {
            path: 'http://query.yahooapis.com/v1/public/yql?q=',
            query: encodeURIComponent(query),
            format: '&format=json&callback=?'
        };

        $.ajax({
            type    : 'GET',
            url     : yql['path'] + yql['query'] + yql['format'], 
            timeout : 8000,  
            dataType: 'jsonp',
            error   : error,
            success : success
        });
    };
    
    jQuery.urlHelper =
    {
        UriParser :  function (uri)
        { 
            this._regExp      = /^((\w+):\/\/\/?)?((\w+):?(\w+)?@)?([^\/\?:]+)?(:\d+)?(.*)?/;
            this._regExpHost  = /^(.+\.)?(.+\..+)$/;
   
            this._getVal = function(r, i) 
            {
                if(!r) return null;
                return (typeof(r[i]) == 'undefined' ? "" : r[i]);
            };
          
            this.parse = function(uri) 
            {
                var r          = this._regExp.exec(uri);
                this.results   = r;
                this.url       = this._getVal(r,1);
                this.protocol  = this._getVal(r,2);
                this.username  = this._getVal(r,4);
                this.password  = this._getVal(r,5);
                this.domain    = this._getVal(r,6);
                this.port      = this._getVal(r,7);
                this.path      = this._getVal(r,8);
                
                var rH         = this._regExpHost.exec( this.domain );
                this.subdomain = this._getVal(rH,1);
                this.domain    = this._getVal(rH,2); 
                return r;
            }
              
            if(uri) this.parse(uri);
        },
        getLinks : function(text) 
        {
           // var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?\s|\n\r/gi;
           // var expression = /(?i)\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;
           
            var expression = /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)(\s|\n\r)/gi;
            return (text.match(expression));
        },
        isImage : function(img, allowed)
        {
            //Match jpg, gif or png image  
            if (allowed == null)  allowed = 'jpg|gif|png|jpeg';
            
            var expression = /([^\s]+(?=\.(jpg|gif|png|jpeg))\.\2)/gm; 
            return (img.match(expression));
        },
        isAbsolute : function(path)
        {
            var expression = /^(https?:)?\/\//i;
            var value =  (path.match(expression) != null) ? true: false;
            
                            
            return value;
        },
        isPathAbsolute : function(path)
        {
            if (path.substr(0,1) == '/') return true;
        },
        stripFile : function(path) {
            return path.substr(0, path.lastIndexOf('/') + 1);
        } 
    }
})( jQuery );