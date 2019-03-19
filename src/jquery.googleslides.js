/**
 * jQuery Google Slides - https://github.com/reviewingcode/jquery-googleslides
 * Copyright (c) 2019 Mateen Irshad - https://github.com/reviewingcode
 * License: https://github.com/reviewingcode/jquery-googleslides/blob/master/LICENSE
 *
 * Forked from: https://github.com/bradymholt/jquery-googleslides
 */

/**** Original License and Copyright Notice ****/
// googleslides v1.1 - jQuery Google Slides plugin
// (c) 2012 Brady Holt - www.geekytidbits.com
// License: http://www.opensource.org/licenses/mit-license.php

(function($) {
  var defaults = {
    url: 'https://photos.app.goo.gl/bjwsrJRXt7qkoHP1A',
    imgmax: 460,
    maxresults: 100,
    random: true,
    caption: true,
    albumlink: true,
    time: 5000,
    fadespeed: 1000,
  };

  var methods = {
    init: function(options) {
      var settings = $.extend({}, defaults, options);
      var index = settings.url.lastIndexOf('/');
      settings.albumid = settings.url.substring(index + 1);
      this.data('googleslidesOptions', settings);

      if ($('.googleslides[albumid=' + settings.albumid + ']').length > 0) {
        var error =
          'jQuery.googleslides ERROR: albumid:' +
          settings.albumid +
          ' is already on the page.  Only one album per page is supported.';
        this.text(error);
        console.log(error);
      } else {
        this.attr('albumid', settings.albumid);

        var albumJsonUrl =
          '<script src="https://api.allorigins.win/get?url=' +
          settings.url +
          '&callback=jQuery.fn.googleslides.prepare_' +
          settings.albumid +
          '"></sc' +
          'ript>';

        var prepareFunCallback =
          'jQuery.fn.googleslides.prepare_' +
          settings.albumid +
          ' = function(data) { $(".googleslides[albumid=' +
          settings.albumid +
          ']").googleslides("prepare", data); };';
        eval(prepareFunCallback);

        this.width(settings.imgmax);
        this.addClass('googleslides');
        $('body').append(albumJsonUrl);
      }
    },
    prepare: function(data) {
      var json = data.contents;
      var settings = this.data('googleslidesOptions');

      var count = json.split('["https://lh3.googleusercontent.com/').length - 1;
      var entry = [];

      for (var j = 0; j < count; j++) {
        var metadata = json.split('["https://lh3.googleusercontent.com/')[j + 1];

        if (metadata.startsWith('a/')) {
          continue;
        }
        metadata = metadata.split('\n]')[0];
        metadata = metadata.split('",');
        var hash = metadata[0];

        var _width = metadata[1].split(',', 1)[0];
        if (settings.imgmax < _width) {
          _width = settings.imgmax
        }

        var repeated = entry.some(function(photo) {
          return photo.url === 'https://lh3.googleusercontent.com/' + hash + '=w' + _width;
        });
        if (repeated) {
          continue;
        }

        entry.push({
          url: 'https://lh3.googleusercontent.com/' + hash + '=w' + _width,
          width: _width,
          height: 'auto',
          link: settings.url,
          caption: '',
        });

        if (entry.length === settings.maxresults) {
          break;
        }
      }

      var i = entry.length;
      var item, url, link, caption, slide, height, width;
      var slides = [];
      while (i--) {
        item = entry[i];
        url = item.url;
        height = item.height;
        width = item.width;
        link = item.link;
        caption = item.caption;
        slide = $('<div class="googleslide"></div>');
        var slideInner = slide;
        if (settings.albumlink == true) {
          slide.append($('<a target="_blank" href="' + link + '"></a>'));
          slideInner = slide.children().first();
        }

        slideInner.append($('<img src="' + url + '" alt="' + caption + '"/>'));

        $('img', slideInner)
          .width(width)
          .height(height);

        if (settings.caption == true && caption != '') {
          slideInner.append(
            '<div class="captionWrapper"><div class="caption">' + caption + '</div></div>',
          );
          $('.captionWrapper', slideInner).width(width);
        }

        slides.push(slide);
      }

      if (settings.random == true) {
        slides.sort(methods.randomSort);
      }

      for (var i = 0; i < slides.length; i++) {
        this.append(slides[i]);
      }

      //set width of container so that it is just big enough to contain all the images
      this.width(
        Math.max.apply(
          Math,
          $('.googleslide img', this)
            .map(function() {
              return $(this).width();
            })
            .get(),
        ) + 2,
      );

      this.googleslides('start');
    },
    randomSort: function(a, b) {
      return 0.5 - Math.random();
    },
    start: function() {
      var settings = this.data('googleslidesOptions');

      this.find('.googleslide')
        .first()
        .fadeIn(settings.fadespeed);

      var target = this;
      setInterval(function() {
        var first = target.find('.googleslide').first();
        //fade out with .animate() in case parent is hidden
        first.animate({ opacity: 0 }, settings.fadespeed, function() {
          first.css('opacity', '');
          first.hide();
          first.next().fadeIn(settings.fadespeed, function() {
            first.appendTo(target);
          });
        });
      }, settings.time);
    },
  };

  $.fn.googleslides = function(method) {
    // Method calling logic
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.tooltip');
    }
  };
})(jQuery);
