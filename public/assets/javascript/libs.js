
// Classie
(function(g){'use strict';function f(a,b){(c(a,b)?d:e)(a,b)}var c,e,d;"classList"in document.documentElement?(c=function(a,b){return a.classList.contains(b)},e=function(a,b){a.classList.add(b)},d=function(a,b){a.classList.remove(b)}):(c=function(a,b){return RegExp("(^|\\s+)"+b+"(\\s+|$)").test(a.className)},e=function(a,b){c(a,b)||(a.className=a.className+" "+b)},d=function(a,b){a.className=a.className.replace(RegExp("(^|\\s+)"+b+"(\\s+|$)")," ")});g.classie={hasClass:c,addClass:e,removeClass:d,toggleClass:f}})(window);

/*
 * ajax.js - simple ajax utility
 *
 * Usage:
 *
 *  ajax({
 *    type: 'get',
 *    url: 'http://example.com',
 *    data: {name: 'John Smith'},
 *    timeout: 5000,
 *    onSuccess: function(data) {
 *      console.log('Here is the data: ' + data);
 *    },
 *    onComplete: function() {
 *
 *    },
 *    onError: function() {
 *
 *    }
 *  });
 */

(function( global ) {

  'use strict';

  var ajax, serialize;

  serialize = function(a) {

    var s = [];

    if (a.constructor == Array) {
      for (var i=0; i < a.length; i++)
        s.push(a[i].name + '=' + encodeURIComponent(a[i].value));
    } else {
      for (var j in a)
        s.push(j + '=' + encodeURIComponent(a[j]));
    }

    return s.join('&');
  };

  ajax = function(options) {

    options = {
      type: options.type || "POST",
      url: options.url || "",
      timeout: options.timeout || 5000,
      onSuccess: options.onSuccess || function(){},
      onComplete: options.onComplete || function(){},
      onError: options.onError || function(){},
      data: options.data || null,
      headers: options.headers || []
    };

    var xml = new XMLHttpRequest();
    xml.open(options.type, options.url, true);
    xml.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    for (var i=0; i < options.headers.length; i++)
      xml.setRequestHeader( options.headers[i][0], options.headers[i][1] );

    var timeoutLength = options.timeout;
    var requestDone = false;

    setTimeout(function(){
      requestDone = true;
    }, timeoutLength);

    xml.onreadystatechange = function(){
      if ( xml.readyState == 4 && !requestDone ) {

        if ( httpSuccess( xml ) ) {
          options.onSuccess( httpData( xml, options.type ) );
        } else {
          options.onError();
        }

        options.onComplete();
        xml = null;
      }
    };

    if (options.type.toUpperCase() === 'POST' || options.type.toUpperCase() === 'PUT') {
      xml.send(JSON.stringify(options.data));
    } else {
      xml.send(null);
    }

    function httpSuccess(r) {
      try {
        return !r.status && location.protocol == "file:" ||
        ( r.status >= 200 && r.status < 300 ) ||
        r.status == 304 ||
        navigator.userAgent.indexOf("Safari") >= 0 && typeof r.status == "undefined";
      } catch(e){}
      return false;
    }

    function httpData(r,type) {
      var ct = r.getResponseHeader("content-type");
      var data = !type && ct && ct.indexOf("xml") >= 0;
      data = type == "xml" || data ? r.responseXML : r.responseText;
      if ( type == "script" )
        eval.call( window, data );

      return data;

    }
  };

  global.ajax = ajax;

})( window );
