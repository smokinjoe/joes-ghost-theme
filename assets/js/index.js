/**
 * Main JS file for Casper behaviours
 */

/* globals jQuery, document */
(function ($, undefined) {
    "use strict";

  var Ajax = (function (opts) {
    var opts = opts || {},
        params = opts.params || {},
        callback = opts.callback || new Function(),
        errCb = opts.err || new Function(),
        url = opts.url,
        method = opts.method || 'GET',
        methods = {};

    methods.call = function (opts) {
      $.ajax({
        url: url,
        type: method,
        data: params
      }).done(callback).fail(errCb);
    };


        /*
          var parser = document.createElement('a');
          parser.href = "http://example.com:3000/pathname/?search=test#hash";
          parser.protocol; // => "http:"
          parser.hostname; // => "example.com"
          parser.port;     // => "3000"
          parser.pathname; // => "/pathname/"
          parser.search;   // => "?search=test"
          parser.hash;     // => "#hash"
          parser.host;     // => "example.com:3000"
        */
    methods.parser = function (url) {
      var parser = document.createElement('a'),
          structure = {};
      parser.href = url;

      structure = {
        protocol: parser.protocol,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        hash: parser.hash,
        host: parser.host
      };

      return structure;
    };

    return methods;
  }());

  var $document = $(document);

  $document.ready(function () {
    checkInlineMedia();
    setArcticScroll();
  });

  var checkInlineMedia = function () {
    $('a[data-inline]').each(function () {
      var $this = $(this),
          src = $this.data('src');

      if (src.match(/streamable/)) {
        handleStreamableMedia($this);
      }
      else if (src.match(/mp4/)) {
        handleVidFile($this);
      }
      else if (src.match(/gfycat/)) {
        handleGfyCat($this);
      }
      else if (src.match(/gifv/)) {
        handleImgur($this);
      }
      else if (src.match(/gif/)) {
        buildIMGWith($this);
      }
      else if (src.match(/jpg|jpeg|png/)) {
        buildIMGWith($this);
      }
      else if (src.match(/youtube/)) {
        handleYouTube($this);
      }
    });
  };

  var handleStreamableMedia = function ($element) {
    var uriArray = $element.data('src').split('/'),
        streamableId = uriArray[uriArray.length - 1],
        src = '//streamable.com/res/' + streamableId;

    buildiFrame({
      $element: $element,
      width: '100%',
      src: src,
      scrolling: 'no'
    });
  };

  var handleGfyCat = function ($element) {
    var uriArray = $element.data('src').split('/'),
        gfyCatDealie = uriArray[uriArray.length - 1],
        webmSrc, mp4Src;

    $.ajax({
      url: '//gfycat.com/cajax/get/' + gfyCatDealie,
      type: 'GET'
    }).done(function (response) {
      webmSrc = response.gfyItem.webmUrl;
      mp4Src = response.gfyItem.mp4Url;
      buildHTML5Video({
        $element: $element,
        wrapChildSources: true,
        webmSrc: webmSrc,
        mp4Src: mp4Src
      });
    }).fail(function () {
      console.log("Error: Failure to retrieve response for gfycat: ", gfyCatDealie);
    });;
  };

  var handleYouTube = function ($element) {
    var src = $element.data('src'),
        result = Ajax.parser(src),
        ytKey = result.search.split('=')[1];

    buildiFrame({
      $element: $element,
      src: '//youtube.com/embed/' + ytKey
    });
  }

  var handleImgur = function ($element) {
    var arr = $element.data('src').split('.');
    arr.pop();
    var src = arr.join('.'),
        webmSrc = src + '.webm',
        mp4Src = src + '.mp4';

    buildHTML5Video({
      $element: $element,
      wrapChildSources: true,
      webmSrc: webmSrc,
      mp4Src: mp4Src
    });

  };

  var handleVidFile = function ($element) {
    buildHTML5Video({
      $element: $element
    });
  };

  var buildHTML5Video = function (opts) {
    opts = opts || {};
    var height = opts.height || 450,
        width = opts.width || '100%',
        $element = opts.$element || $('<div />'),
        src = opts.src || $element.data('src'),
        //webmSrc = opts.webmSrc || (src + '.webm'),
        //mp4Src = opts.mp4Src || (src + '.mp4'),
        webmSrc = opts.webmSrc || false,
        mp4Src = opts.mp4Src || false,
        wrapChildSources = opts.wrapChildSources || false,
        $video = $('<video>', {
          height: height,
          width: width,
          loop: '',
          //autoplay: '',
          controls: '',
          muted: 'muted'
        }),
        webmID = opts.webmID || 'webmsource',
        mp4ID = opts.mp4ID || 'mp4source',
        $webmSource, $mp4Source;

    if (wrapChildSources) {
      if (webmSrc) {
        $webmSource = $('<source>', {
          id: webmID,
          src: webmSrc,
          type: 'video/webm'
        });
        $video.append($webmSource);
      }
      if (mp4Src) {
        $mp4Source = $('<source>', {
          id: mp4ID,
          src: mp4Src,
          type: 'video/mp4'
        });
        $video.append($mp4Source);
      }
    }
    else {
      $video.attr('src', src);
    }

    handleClick($element, $video);
    return $element;
  };

  var buildIMGWith = function ($element) {
    var $img = $('<img>', {
          src: $element.data('src'),
          width: "100%"
        });

    handleClick($element, $img);
  };

  var buildiFrame = function (opts) {
    opts = opts || {}
    var height = opts.height || 450,
        width = opts.width || 710,
        scrolling = opts.scrolling || 'no',
        $element = opts.$element || $('<div />'),
        src = opts.src || $element.data('src'),
        $iframe = $('<iframe>', {
          src: src,
          frameboarder: 0,
          height: height,
          width: width,
          scrolling: scrolling,
          allowfullscreen: ''
        });

    handleClick($element, $iframe);

    return $element;
  }

  var handleClick = function ($trigger, $ammo) {
    $trigger.on('click', function (e) {
      e.preventDefault();

      if ($ammo.is(':visible')) {
        $ammo.detach();
      }
      else {
        $ammo.appendTo($trigger);
      }
    });
  }

  // Arctic Scroll Source
  var setArcticScroll = function () {
    var $postContent = $(".post-content");
    $postContent.fitVids();

    $(".scroll-down").arctic_scroll();

    $(".menu-button, .nav-cover, .nav-close").on("click", function(e){
      e.preventDefault();
      $("body").toggleClass("nav-opened nav-closed");
    });
  };
  // Arctic Scroll by Paul Adam Davis
  // https://github.com/PaulAdamDavis/Arctic-Scroll
  $.fn.arctic_scroll = function (options) {

    var defaults = {
      elem: $(this),
      speed: 500
    },

        allOptions = $.extend(defaults, options);

    allOptions.elem.click(function (event) {
      event.preventDefault();
      var $this = $(this),
          $htmlBody = $('html, body'),
          offset = ($this.attr('data-offset')) ? $this.attr('data-offset') : false,
          position = ($this.attr('data-position')) ? $this.attr('data-position') : false,
          toMove;

      if (offset) {
        toMove = parseInt(offset);
        $htmlBody.stop(true, false).animate({scrollTop: ($(this.hash).offset().top + toMove) }, allOptions.speed);
      } else if (position) {
        toMove = parseInt(position);
        $htmlBody.stop(true, false).animate({scrollTop: toMove }, allOptions.speed);
      } else {
        $htmlBody.stop(true, false).animate({scrollTop: ($(this.hash).offset().top) }, allOptions.speed);
      }
    });

  };

})(jQuery);
