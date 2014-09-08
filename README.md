smart-img web component
=======

This is a polyfil of srcet using web component by upgrading HTMLImageElement.

So the old IMG tag become smarter! Works on all browsers.

Use MutationObserver to monitor future added smart-img. Browsers that doesn't support MutationObserver will fallback to use jQuery to listen 'DOMNodeInserted' event.

IE8, as usual, doesn't support MutationObserver and 'DOMNodeInserted' event... So I would suggest after an ajax success event, simple find img[is='smart-img'] in your new content and call each image's prototype.createdCallback()

Web component constructor will set into namespace "window.WC".

The srcset regular expression was created based on the rules in the srcset W3C specification available at:

http://www.w3.org/html/wg/drafts/srcset/w3c-srcset/

----
Usage:

src is an optional attribute in srcset standard, in order to avoid loading multiple images in older browsers, just don't assign it. 
This web component will work it out.

```javascript
 
<img is="smart-img" 
		srcset="images/totoro.png, images/totoro2x.png 320w 2x" 
		width="209" height="308" 
		alt="Srcset image">
 
```


License
----

BSD