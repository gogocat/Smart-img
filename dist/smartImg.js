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

(function($, document, window, namespace) {
	"use strict";
	if ('srcset' in document.createElement('img')) {
		return true;
	}
	// settings
	var SmartImgProto,
		wcName = "smart-img",
        enableObserverFallback = true,
		register = document.registerElement || document.register,
        MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver,
		screenWidth   = (screen.width > document.documentElement.clientWidth) ? document.documentElement.clientWidth : screen.width,
		screenDensity = (window.devicePixelRatio) ? Math.round(window.devicePixelRatio) : 1;

	// Implement srcset
	// @param DOM image 
	// @return string of image path || ""
	function parseSrcset(image) {
		var srcset = image.getAttribute('srcset'),
			candidates,
			candidatesLength,
			getCandidateDescriptors,
			descriptors,
			isgScreenDensity,
			isgImgWidth,
			srcPath = "",
			widthCandidates = [],
			widthDiff,
			opt;
			
		if (!srcset) {
			return srcPath;
		}
		candidates = srcset.split(',');
		candidatesLength = candidates.length;
		
		// convert candidate string to array if match
		// http://www.w3.org/html/wg/drafts/srcset/w3c-srcset/
		// only allow either width or density descriptors
		getCandidateDescriptors = function(candidateString) {
			return candidateString.match(/^\s*([^\s]+)\s*(\s(\d+)(w|x))?\s*$/);
		};
		
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

		for (var i=0; i < candidatesLength; i+=1) {
			descriptors = getCandidateDescriptors(candidates[i]);
			if (!descriptors) {
				continue;
			}
			opt = {
				fileSrc: descriptors[1],
				width: (descriptors[4] === 'w') ? descriptors[3] : false,
				density: (descriptors[4] === 'x')? descriptors[3] : false
			};
			opt.densityMatch = (opt.density) ? isgScreenDensity(opt.density) : false;
			opt.widthMatch = (opt.width) ? isgImgWidth(opt.width) : false;

			//default
			if (!opt.density && !opt.width) {
				srcPath = opt.fileSrc;
			}
			// density match 
			else if (opt.densityMatch) {
				srcPath = opt.fileSrc;
			}
			// width match 
			else if (opt.widthMatch) {
				widthCandidates.push(opt);
			}
		}
		
		// 2nd check if there are width match candidates and find the best match
		if (widthCandidates.length) {
			for (var j=0, widthCandidatesLength = widthCandidates.length;  j < widthCandidatesLength; j+=1 ) {
				if (widthDiff === undefined) {
					widthDiff = widthCandidates[j].width - screenWidth;
					srcPath = widthCandidates[j].fileSrc;
				}
				else if ((widthCandidates[j].width - screenWidth) < widthDiff) {
					widthDiff = widthCandidates[j].width - screenWidth;
					srcPath = widthCandidates[j].fileSrc;
				}
			}
		} 
		//console.log("chosen srcPath: ", srcPath);
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
    
}(jQuery, document, window, window.WC));






