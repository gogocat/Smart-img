/*jslint browser: true*/
/**
 * @ngdoc web component
 * @name smart-img
 *
 * @description
 * Polyfill srcet using web component by upgrading HTMLImageElement. 
 * Use MutationObserver to monitor future added smart-img.
 * Web component constructor will set into namespace window.WC
 *
 * Fallback to simple jQuery element manipulation for old browsers and augment HTMLImageElement prototype with function createdCallback()
 * 
 * Old browsers doesn't support MutationObserver will fallback to use jQuery listen to 'DOMNodeInserted' event.
 * Doesn't support MutationObserver for <= IE8. 'DOMNodeInserted' also won't work.
 * For IE8 user. Simply if you have ajax loaded content. After ajax success, simple find img[is='smart-img'] in your new content and call each image's prototype.createdCallback()
 *
 * Note: Chrome support basic srcset only. This web component upgrade can not overwrite Chrome's native implemention. The fall back logic is more accurate.
 * 
 * @example
 * src is an optional attribute in srcset standard.
 * img src should be omit in order to avoid double image loading in old browsers.
 * 
 * 
 * <img is="smart-img" 
 *		srcset="images/totoro.png, images/totoro2x.png 320w 2x" 
 *		width="209" height="308" 
 *		alt="Srcset image">
 * 
 *
 *  For IE <=8 with future ajax loaded content, MutationObserver will not work.
 *  However, you can do this on completed.
 *
 *  $("img[is='smart-img']").each(function() {
 *      this.createdCallback();
 *  });
 *
 */

// define WC namespace
window.WC = window.WC || {};

(function($, document, window, namespace, testRunner) {
	"use strict";
	if ('srcset' in document.createElement('img')) {
		return true;
	}
	// settings
	var SmartImgProto,
		wcName = "smart-img",
		useSpec = "standard",
        enableObserverFallback = true,
		register = document.registerElement || document.register,
        MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,
		screenWidth   = (screen.width > document.documentElement.clientWidth) ? document.documentElement.clientWidth : screen.width,
		screenHeight  = (screen.height > document.documentElement.clientHeight) ? document.documentElement.clientHeight : screen.height,
		screenDensity = (window.devicePixelRatio) ? Math.round(window.devicePixelRatio) : 1,
		srcsetSpec;
	
	// strategy
	// standard is current w3c implementation (consider density or image size matches, but not mix)
	// edge spec will consider both density and image size matches  
	srcsetSpec = {
		edge: function(options) {
			var srcPath = "";
			// default src 
			if (!options.density && !options.width && !options.height) {
				srcPath = options.fileSrc;
			}
			// densityMatch
			else if (options.densityMatch) {
				if (!options.width || !options.height) {
					srcPath = options.fileSrc;
				}
				// check match screen size 
				if (options.widthMatch || options.heightMatch) {
					srcPath = options.fileSrc;
				}
			}
			// no density but match width or height
			else if (!options.density && (options.widthMatch || options.heightMatch)) {
				srcPath = options.fileSrc;
			}
			return srcPath;
		},
		standard: function(options) {
			var srcPath = "";
			// default src 
			if (!options.density && !options.width && !options.height) {
				srcPath = options.fileSrc;
			}
			// densityMatch ignore img size
			else if (options.densityMatch) {
				srcPath = options.fileSrc;
			}
			// match width or height ignore density
			else if (options.widthMatch || options.heightMatch) {
				srcPath = options.fileSrc;
			}
			return srcPath;
		}
	};

	// Implement srcset
	// @param DOM image 
	// @return string of image path || ""
	function parseSrcset(image) {
		var srcset = image.getAttribute('srcset'),
			candidates,
			candidatesLength,
			descriptors,
			isgScreenDensity,
			isgImgWidth,
			isgImgHeight,
			srcPath = "",
			i;
			
		if (!srcset) {
			return srcPath;
		}
		candidates = srcset.split(',');
		candidatesLength = candidates.length;
		
		// normalise Android 1.5 to 2
		isgScreenDensity = function(density) {
			density = Math.round(Number(density)); 
			return (screenDensity >= density);
		};
		// is img width >= screen width
		isgImgWidth = function(width) {
			if(!width) {
				return false;
			}
			return (width >= screenWidth);
		};
		// is img height >= screen height
		isgImgHeight = function(height) {
			if(!height) {
				return false;
			}
			return (height >= screenHeight);
		};

		for (i=0; i < candidatesLength; i+=1) {
			// original by @culshaw : https://github.com/culshaw/srcset
			// in the srcset W3C specification available at:
			// http://www.w3.org/html/wg/drafts/srcset/w3c-srcset/
			descriptors = candidates[i].match(/^\s*([^\s]+)\s*(\s(\d+)w)?\s*(\s(\d+)h)?\s*(\s(\d+)x)?\s*$/);
			
			// use srcsetSpec strategy to get srcPath
			srcPath = srcsetSpec[useSpec]({
				fileSrc: descriptors[1],
				width: descriptors[3],
				height: descriptors[5],
				density: descriptors[7] || false,
				densityMatch: (this.density) ? isgScreenDensity(this.density) : false,
				widthMatch: isgImgWidth(this.width),
				heightMatch: isgImgHeight(this.height)
			});
		}
		return srcPath;
	}

	// normalise document.registerElement
	function registerWC(tagName, definition) {
		if (register) {
			return register.call(document, tagName, definition);
		} 
	}
	
	// observe DOM mutation
    // if smart-img web component added to DOM. It will trigger its createdCallback function.
	function observeWC(targetElement) {
		var observerTarget = targetElement || document.body,
			observer,
			observerCallback;
			
        if (!MutationObserver) {
            if (!enableObserverFallback) {
                return;
            }
            // use jQuery to listen 'DOMNodeInserted' event
            $(document).on('DOMNodeInserted', function(e) {
                var element = e.target,
                    $element = $(e.target),
                    $imgs = $element.find("img[is='"+ wcName +"']"),
                    $smartImgs = [];

                if ($imgs.length) {
                    $smartImgs = $imgs;
                }
                if (element.tagName === "IMG" && element.getAttribute("is") === wcName) {
                    if ($smartImgs.length) {
                        $smartImgs.add($element);
                    } else {
                        $smartImgs = $element;
                    }
                }
                if ($smartImgs.length) {
                    $smartImgs.each(function() {
                        if (typeof this.createdCallback === "function") {
                            this.createdCallback();
                        }
                    });
                }
            });
            return;
		}
		
        // MutationObserver on addedNodes
		observerCallback = function(mutations) {
			var smartImgCollection = [];
            
            mutations.forEach(function(mutation) {
				var addedNodesLength = mutation.addedNodes.length,
                    thisNode,
                    smartImgs,
                    i;
                    
				for (i = 0; i < addedNodesLength; i+=1) {
					thisNode = mutation.addedNodes[i];
                    smartImgs = thisNode.querySelectorAll("img[is='"+ wcName +"']");
					if (thisNode.tagName === "IMG" && thisNode.getAttribute("is") === wcName) {
                        smartImgCollection.push(thisNode);
					} 
                    if (smartImgs && smartImgs.length) {
                        smartImgCollection = smartImgCollection.concat(smartImgs);
                    }
				}
			});
            
            // update all found smartImgs
            if (smartImgCollection.length) {
                smartImgCollection.forEach(function(value) {
                    var thisImg = value; 
                    if (Object.prototype.toString.call(value) === "[object NodeList]") {
                        thisImg = value[0];
                    }
                    if (typeof thisImg.createdCallback === "function") {
                        thisImg.createdCallback();
                    }
                });
            }
		};
        
		observer = new MutationObserver(observerCallback);
		observer.observe(observerTarget, { childList: true, subtree: true });
	}
    
    function elCreatedCallback() {
        this.src = parseSrcset(this);
    }
	
	// helper objectCreate shim
	function objectCreate(proto) {
		var Fn = function(){};
		if (typeof Object.create === "function") {
			return Object.create(proto);
		}
		Fn.prototype = proto;
        return new Fn();
	}
	
	// extend HTMLImageElement prototype - check if browser support register element
    if (register) {
		SmartImgProto = objectCreate(HTMLImageElement.prototype);
        SmartImgProto.createdCallback = elCreatedCallback;
		// register web component
		namespace.SmartImg = registerWC(wcName, {
			prototype: SmartImgProto,
			"extends": "img"
		});
	} else {
		// old browsers implementation
		// Consider move this to page bottom
		$(document).ready(function() {
            // augment img propotype. add createdCallback
            if (typeof HTMLImageElement.prototype.createdCallback !== "function") {
               HTMLImageElement.prototype.createdCallback = elCreatedCallback;
            }
            $("img[is='"+ wcName +"']").each(function() {
                this.createdCallback();
			});
			// set observer if browser doesn't support web component. So when future img tag create it trigger createdCallback
			observeWC();
		});
	}

	// !!! remove this unit test injector for production
	if (testRunner) {
        var test = function() {
			eval(testRunner);
		}
		test();
    }
    
    
}(jQuery, document, window, window.WC, window.testRunner));






