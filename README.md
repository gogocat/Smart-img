srcset polyfill via web componet
===============

smart-img 
-----------------------

**smart-img** is a srcet polyfill via web component by upgrading the *HTMLImageElement*.

Suddenly the old IMG tag become smarter! 

This polyfill works on all browsers majors. 

Usage
-----

Just add this script after jQuery. 

    <script src="dist/smartImg.js"></script>

**Image tag with is="smart-img" **

*src* is optional in srcset standard, in order to avoid loading multiple images in older browsers, just don't assign it. The script will works out the best candidates as selected source.

    <img is="smart-img" 
            srcset="images/totoro.png, images/totoro2x320.png 320w, images/totoro2x360.png 360w, images/totoro2xiPad.png 768w" 
            width="209" height="308" 
            alt="Srcset image">

The srcset regular expression was created based on the rules in the srcset W3C specification available at:

http://www.w3.org/html/wg/drafts/srcset/w3c-srcset/

An easy to read version:
http://css-tricks.com/video-screencasts/133-figuring-responsive-images/

As current W3C specification. Width descriptors and density descriptors don't mix.

*"If an image candidate string for an source or img element has the width descriptor specified, all other image candidate strings for that element must also have the width descriptor specified."*

----------

The script will use MutationObserver to monitor future added smart-img element and automatic parse srcset definition.

Browsers that doesn't support MutationObserver will fallback to use jQuery to listen 'DOMNodeInserted' event.

IE8, *as usual*, doesn't support neither MutationObserver or 'DOMNodeInserted' event... 
I don't like to use time base polling, so I would suggest after an ajax success event, simple find img[is='smart-img'] in the new data and call each image's prototype.createdCallback()

The web component constructor will set into namespace "*window.WC*".

Unit tested the core function for different use cases.
 
To see if MutationObserver works, just run the example and click to add new image button.

**Tested**

 - IE8,9,10,11.  
 - Chrome 
 - Firefox 
 - Sarfari 
 - Android Browser 
 - Android Chrome
 - Android Firefox
 - iOS Safari

License
----

BSD
