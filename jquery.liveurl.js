/*
 * jQuery LiveUrl
 *
 * MIT License - You are free to use this commercial projects as long as the copyright header is left intact.
 * @author        Stephan Fischer
 * @copyright     (c) 2012 Stephan Fischer (www.ainetworks.de)
 * @version 1.2.2
 * 
 * UriParser is a function from my addon "Superswitch" for Mozilla FireFox.
 */

(function( $ ) {

  var initComponent = function(options) {
    var o = options;

    return {
      already: [],

      init: function () {
        this.preview = false;
        preview      = {
          url : '',
          images: [],
          image : '',
          title: '' ,
          description: ''
        };
      },

      textUpdate: function(self) {
        // read all links
        var links = $.urlHelper.getLinks($(self).val());
        this.cleanDuplicates(links);

        if (links != null) {
          if (!this.preview) {
            this.current = $(self);
            this.process(links);
          }
        }
      },

      process: function(urlArray) {
        for (var index in urlArray) {
          var strUrl      = urlArray[index];
          if (typeof strUrl == 'string') {
            var pLink       = new $.urlHelper.UriParser(strUrl);

            if (pLink.subdomain && pLink.subdomain.length > 0 ||
                pLink.protocol  && pLink.protocol.length  > 0 ) {

              if  (pLink.protocol.length == 0) {
                strUrl = o.defaultProtocol + strUrl;
              }
              if (!this.isDuplicate(strUrl, this.already)) {
                if ($.urlHelper.isImage(strUrl)) {
                  preview.image = strUrl;
                  this.getPreview({}, strUrl);
                } else {
                  this.getData(strUrl);
                }
                return true;
              }
            }
          }
        }
      },

      cleanDuplicates: function(urlArray) {
        var links = this.createLinks(urlArray);
        for(var index in this.already) {
          var strUrl  = this.already[index];
          if (!this.isDuplicate(strUrl, links)) {
            var index = $.inArray(strUrl, this.already);
            this.already.splice(index, 1);
          }
        }
      },

      createLinks: function(urlArray) {
        var links = [];
        for(var index in urlArray) {
          var strUrl  = urlArray[index];
          if (typeof strUrl == 'string') {
            var pLink   = new $.urlHelper.UriParser(strUrl);
            if (pLink.subdomain && pLink.subdomain.length > 0 ||
                pLink.protocol  && pLink.protocol.length  > 0 ) {
              if  (pLink.protocol.length == 0) {
                strUrl = o.defaultProtocol + strUrl;
              }
              links.push(strUrl);
            }
          }
        }
        return links;
      },

      isDuplicate: function(url, array) {
        var duplicate = false;
        $.each(array, function(key, val) {
          if (val == url) {
            duplicate = true;
          }
        });
        return duplicate;
      },

      getData: function (url) {
        var xpath  =  '//head|//body';
        var query  =  'select * from html where url="' + url + '" and compat="html5" and xpath="'+xpath+'"';

        this.addLoader();
        var that = this;
        $.yql(query, function() {
          var data = {
            query : {results: null}
          }
          that.ajaxSuccess(data, url);
          that.removeLoader();
          return false;
          },
          function(data) {
            that.ajaxSuccess(data, url)
          }
        );
      }, //getData

      ajaxSuccess: function(data, url) {
        // URL already loaded, or preview is already shown
        if (this.isDuplicate(url, this.already) || this.preview) {
          this.removeLoader();
          return false;
        }

        if ($(data).find("results").text().length == 0) {

          if (o.matchNoData) {
            this.getPreview(data, url);
          }  else {
            this.already.push(url);
            this.removeLoader();
          }
        } else {
          this.getPreview(data, url);
        }
      },

      hasValue: function(section) {
        return (preview[section].length == 0) ? false : true;
      },

      getPreview: function(data, uri) {
        var that = this;
        this.preview = true;
        this.already.push(uri);

        var title  = "" ;
        $(data, '<head>').find('title').each(function() {
          title = $(this).text();
        });
        preview.title       = ( title || uri);
        preview.url         = uri;

        $(data, '<head>').find('meta').each(function() {
          that.setMetaData($(this));
        });
        if(o.findDescription && !this.hasValue('description')) {
          $(data, '<body>').find('p').each(function() {
            var text = $.trim($(this).text());
            if(text.length > 3) {
              preview.description = text;
              return false;
            }
          });
        }
        if (!this.hasValue('image')) {
          // meta tag has no images:
          var images = $(data, '<body>').find('img');
          if (o.findLogo ) {
            images.each(function() {
              var self = $(this);
              if (self.attr('src') && self.attr('src').search(o.logoWord, 'i')  != -1 ||
                  self.attr('id' ) && self.attr('id' ).search(o.logoWord, 'i')  != -1 ||
                    this.className   &&   this.className.search(o.logoWord, 'i')  != -1) {
                preview.image = $(this).attr('src');
              return false;
              }

            });
          }
          if (!this.hasValue('image') && images.length > 0 ) {
            images.each(function() {
              preview.images.push($(this).attr('src'));
            });
          }
        }
        this.removeLoader();
        // prepare output
        var not   = 'undefined';
        var data  = {
          title       : preview.title,
          description : preview.description,
          url         : preview.url,
          video       : (typeof preview.video != not && preview.video.length > 0) ? {} : null
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
        if (this.hasValue('image')) {
          preview.images.push(preview.image);
          preview.image = '';
        }
        this.addImages();
        this.current.one('clear', function() {
          that.init();
        });
      },

      addLoader: function() {
        o.loadStart();
      },

      removeLoader: function() {
        o.loadEnd();
      },

      setMetaData: function(val) {
        for (index in o.meta) {
          var meta = o.meta[index];
          preview[meta[0]] = (this.getValue(val,meta[1],meta[2])|| preview[meta[0]] );
        }
      },

      getValue: function (val,key, tag) {
        if (val.attr(key)) {
          if (val.attr(key).toLowerCase() ==  tag.toLowerCase()) {
            if (val.attr('content') && val.attr('content').length > 0) {
              return val.attr('content');
            }
          }
        }
      },

      addImages: function() {
        var that = this;
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

          this.getImage(image, function(img) {
            if (img.width  >= o.minWidth  &&
                img.height >= o.minHeight && that.preview) {
              o.addImage(img);
            if(!o.multipleImages) {
              return;
            }
            }
          });
        }
      },

      getImage: function(src, callback) {
        var concat  =  $.urlHelper.hasParam(src) ? "&" : "?";
        src        +=  concat + 'random=' + (new Date()).getTime();
        $('<img />').attr({'src': src}).load(function() {
          var img = this;
          var tmrLoaded = window.setInterval(function() {
            if (img.width) {
              window.clearInterval(tmrLoaded);
              callback(img);
            }
          }, 100);
        });
      }
    }
  };

  var defaults = {
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
    findDescription  : true,
    matchNoData      : true,
    multipleImages   : true,
    defaultProtocol  : 'http://',
    minWidth         : 100,
    minHeight        : 32,
    logoWord         : 'logo',
    success          : function() {},
    loadStart        : function() {},
    loadEnd          : function() {},
    imgLoadStart     : function() {},
    imgLoadEnd       : function() {},
    addImage         : function() {}
  }

  $.fn.extend({
    liveUrl : function(options) {
      var options =  $.extend({}, defaults, options);

      this.each(function() {
        var core = initComponent(options);

        core.init();
        var that  = this;
        var self  = $(this);

        self.on('keyup', function(e) {
          var links = $.urlHelper.getLinks(self.val());
          core.cleanDuplicates(links);
          window.clearInterval(core.textTimer);
          var code = (e.keyCode ? e.keyCode : e.which);
          if(code == 13 || code == 32) { //Enter keycode
            core.textUpdate(that);
          } else {
            core.textTimer = window.setInterval(function() {
              core.textUpdate(that);
              window.clearInterval(core.textTimer);
            }, 1000);
          }
        }).on('paste', function() {core.textUpdate(that)});
      });
    },
    processUrl : function(options) {
      var options =  $.extend({}, defaults, options);

      this.each(function() {
        var core = initComponent(options);

        core.init();
        var that  = this;
        var self  = $(this);

        var text = self.val() || self.text();
        var links = $.urlHelper.getLinks(text);
        window.clearInterval(core.textTimer);

        if (links != null && !core.preview) {
          core.current = $(self);
          core.process(links);
        }
      });
    }
  });

  jQuery.yql = function yql(query, error, success) {
    var yql = {
      path: 'http://query.yahooapis.com/v1/public/yql?q=',
      query: encodeURIComponent(query)
    };

    var isIE = /msie/.test(navigator.userAgent.toLowerCase());
    if (isIE && window.XDomainRequest) {
      var xdr = new XDomainRequest();
      xdr.open("get", yql['path'] + yql['query']);
      xdr.onload = function() {
        success(xdr.responseText);
      };
      xdr.send();
    } else {
      $.ajax({
        crossDomain : true,
        cache    : false,
        type     : 'GET',
        url      : yql['path'] + yql['query'],
        timeout  : 8000,
        dataType : 'xml',
        error    : error,
        success  : success
      });
    }
  };

  jQuery.urlHelper = {
    UriParser :  function (uri) {
      this._regExp      = /^((\w+):\/\/\/?)?((\w+):?(\w+)?@)?([^\/\?:]+)?(:\d+)?(.*)?/;
      this._regExpHost  = /^(.+\.)?(.+\..+)$/;

      this._getVal = function(r, i) {
        if(!r) return null;
        return (typeof(r[i]) == 'undefined' ? "" : r[i]);
      };

      this.parse = function(uri) {
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
    getLinks : function(text) {
      var expression = /((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi;
      return (text.match(expression));
    },
    isImage : function(img, allowed) {
      //Match jpg, gif or png image
      if (allowed == null)  allowed = 'jpg|gif|png|jpeg';
      var expression = /([^\s]+(?=\.(jpg|gif|png|jpeg))\.\2)/gm;
      return (img.match(expression));
    },
    isAbsolute : function(path) {
      var expression = /^(https?:)?\/\//i;
        var value =  (path.match(expression) != null) ? true: false;
      return value;
    },
    isPathAbsolute : function(path) {
      if (path.substr(0,1) == '/') return true;
    },
    hasParam : function(path) {
      return (path.lastIndexOf('?') == -1 ) ? false : true;
    },
    stripFile : function(path) {
      return path.substr(0, path.lastIndexOf('/') + 1);
    }
  }
})( jQuery );
