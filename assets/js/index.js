/**
 * Main JS file for Casper behaviours
 */

/* globals jQuery, document */
(function ($, undefined) {
  "use strict";

  const TRIGGER_CLICK = 'click',
      TRIGGER_HOVER = 'hover',
      TRIGGER_AUTO = 'auto',
      TRIGGER_ONSCREEN = 'onscreen',
      TRIGGER_DEFAULT = TRIGGER_CLICK;

  class Ajax {
    static call (opts) {
      opts = opts || {};
      let params = opts.params || {},
        callback = opts.callback || new Function(),
        errCb = opts.err || new Function(),
        url = opts.url,
        method = opts.method || opts.type || 'GET';

      $.ajax({
        url: url,
        type: method,
        data: params
      }).done(callback).fail(errCb);
    }

    static parser (url) {
      url = url || this.url || '';
      let parser = document.createElement('a'),
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
    }
  };

  class u {
    static rest (arr) {
      var clone = this.clone(arr, []);
      clone.splice(0, 1);
      return clone;
    };
    static clone (thing, extender) {
      extender = extender || {};
      return jQuery.extend(true, extender, thing);
    };
  };

  class J {
    constructor ($element, options) {
      if ($.isEmptyObject(options)) {

        if ($element.data('inline')) {
          options = $element.data('inline');
        }
        else {
          var args = $element.text().split(',');
          options = args[1] ? JSON.parse(u.rest(args).join(',')) || {} : {};
          options.body = args[0];
        }

      }

      options.$element =      $element || $("<div />");
      options.body =          options.body || $element.text();
      options.src =           options.src || $element.data('src') || $element.attr('href');
      options.autoplay =      options.autoplay || false;
      options.trigger =       options.trigger || TRIGGER_DEFAULT;

      this.config = options;
      this.$element = options.$element;
      this.$mediaContainer = $('<div />');
      this.generated = false;

      // clean out the config
      if (this.config.body) {
        $element.text(this.config.body);
      }
    };

    generate () {

      // if (this.generated) {
      //   return;
      // }

      let config = this.config;

      if (config.src.match(/streamable/)) {
        this.handleStreamableMedia(config);
      }
      else if (config.src.match(/mp4/)) {
        this.handleVidFile(config);
      }
      else if (config.src.match(/gfycat/)) {
        this.handleGfyCat(config);
      }
      else if (config.src.match(/gifv/)) {
        this.handleImgur(config);
      }
      else if (config.src.match(/gif/)) {
        this.buildIMGWith(config);
      }
      else if (config.src.match(/jpg|jpeg|png/)) {
        this.buildIMGWith(config);
      }
      else if (config.src.match(/youtube/)) {
        this.handleYouTube(config);
      }
      else {
        console.log("JOE: Link doesn't have fun media.");
      }
    }

    destroy () {
      this.$mediaContainer.empty();
    }

    arm () {
      let trigger = this.config.trigger;
      switch (trigger) {
        case TRIGGER_CLICK:
          this.handleClick();
        break;
        case TRIGGER_HOVER:
          this.handleHover();
        break;
        case TRIGGER_ONSCREEN:
          this.showMedia();
        break;
        case TRIGGER_AUTO:
          this.showMedia();
        break;
      }
    }

    // Various handlers
    handleStreamableMedia () {
      let uriArray = this.config.src.split('/'),
          streamableId = uriArray[uriArray.length - 1],
          src = '//streamable.com/res/' + streamableId,
          $element = this.$element;

      this.buildiFrame({
        $element: $element,
        width: '100%',
        src: src,
        scrolling: 'no'
      });
    };

    handleGfyCat () {
      let uriArray = this.config.src.split('/'),
          gfyCatDealie = uriArray[uriArray.length - 1],
          $element = this.$element,
          that = this,
          webmSrc, mp4Src;

      Ajax.call({
        url: '//gfycat.com/cajax/get/' + gfyCatDealie,
        method: 'GET',
        callback: function (response) {
          webmSrc = response.gfyItem.webmUrl;
          mp4Src = response.gfyItem.mp4Url;
          that.buildHTML5Video({
            $element: $element,
            wrapChildSources: true,
            webmSrc: webmSrc,
            mp4Src: mp4Src
          });
        },
        errCb: function () {
          console.log("Error: Failure to retrieve response for gfycat: ", gfyCatDealie);
        }
      });

    };

    handleYouTube () {
      let src = this.config.src,
          result = Ajax.parser(src),
          ytKey = result.search.split('=')[1],
          $element = this.$element;

      this.buildiFrame({
        $element: $element,
        src: '//youtube.com/embed/' + ytKey
      });
    };

    handleImgur (opts) {
      let $element = this.$element,
          arr = $element.data('src').split('.');
      arr.pop();
      let src = arr.join('.'),
          webmSrc = src + '.webm',
          mp4Src = src + '.mp4';

      this.buildHTML5Video({
        $element: $element,
        wrapChildSources: true,
        webmSrc: webmSrc,
        mp4Src: mp4Src
      });

    };

    handleVidFile () {
      this.buildHTML5Video(this.config);
    };

    // f()s that build html elments
    buildHTML5Video (opts) {
      opts = opts || {};
      let height = opts.height || 450,
          width = opts.width || '100%',
          $element = opts.$element || $('<div />'),
          src = opts.src || $element.data('src'),
          autoplay = opts.autoplay,
          //webmSrc = opts.webmSrc || (src + '.webm'),
          //mp4Src = opts.mp4Src || (src + '.mp4'),
          webmSrc = opts.webmSrc || false,
          mp4Src = opts.mp4Src || false,
          wrapChildSources = opts.wrapChildSources || false,
          $video = $('<video>', {
            height: height,
            width: width,
            loop: '',
            autoplay: autoplay,
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

      this.finishItUp($video);
    };

    buildIMGWith (opts) {
      let $element = opts.$element,
          $img = $('<img>', {
            src: opts.src,
            width: "100%"
          });

      this.finishItUp($img);
    };

    buildiFrame (opts) {
      opts = opts || {}
      let height = opts.height || 450,
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

      this.finishItUp($iframe);
    };

    finishItUp ($mediaElement) {
      this.$mediaContainer.append($mediaElement);
      this.generated = true;
    };

    // event handlers
    handleClick () {
      var $trigger = this.$element,
          $payload = this.$mediaContainer;

      $trigger.on('click', e => {
        e.preventDefault();

        if ($payload.is(':visible')) {
          this.destroy();
          $payload.detach();
        }
        else {
          this.generate();
          $payload.appendTo($trigger);
        }
      });
    };

    handleHover () {
      var $trigger = this.$element,
          $payload = this.$mediaContainer;

      $trigger.on('click', e => e.preventDefault());
      $trigger.on('mouseenter', e => {
        if (!$payload.is(':visible')) {
          this.generate()
          $payload.appendTo($trigger);
        }
      });
      $trigger.on('mouseleave', e => {
        if ($payload.is(':visible')) {
          this.destroy();
          $payload.detach();
        }
      });
    };

    showMedia () {
      var $trigger = this.$element,
          $payload = this.$mediaContainer;

      this.generate();
      $payload.appendTo($trigger);
    };

  };

  var $document = $(document),
      dealieArray = [];

  $document.ready(function () {
    checkInlineMedia();
    setArcticScroll();
  });

  var checkInlineMedia = function () {
    // $('a[data-inline]').each(function () {
    //   var $this = $(this),
    //       src = $this.data('src'),
    //       dealie = new J({
    //         $element: $this
    //       });

    //   dealieArray.push(dealie);
    // });

    $('section.post-content').find('a').each(function () {
      let $this = $(this),
          dealie = new J($this, {});

      dealie.arm();
      //dealie.arm();
      dealieArray.push(dealie);
    });
  };



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
