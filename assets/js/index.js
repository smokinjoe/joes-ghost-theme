/**
 * Main JS file for Casper behaviours
 */

/* globals jQuery, document */
(function ($, undefined) {
    "use strict";

    var $document = $(document);

    $document.ready(function () {
        checkInlineMedia();
        setArcticScroll();
    });

  var checkInlineMedia = function () {
    $('a[data-inline]').each(function () {
      var $this = $(this);
      buildiFrameWith($this);
    });
  };

  var buildiFrameWith = function ($element) {
    var $iframe = $('<iframe>', {
          src: $element.data('src'),
          frameborder: 0,
          height: 450,
          width: 600,
          scrolling: 'no'
        });

    $iframe.appendTo($element);
    $iframe.hide();
    $element.on('click', function (e) {
      e.preventDefault();
      
      if ($iframe.is('visible')) {
        $iframe.hide();
      }
      else {
        $iframe.show();
      }
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
