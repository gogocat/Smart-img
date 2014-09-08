/*
* injector
* convert test spec into string and inject to closure to run test 
*/

// convert function body to string
function getFnBodyString(fn) {
    var fnString,
        fnBody;
    
    if (typeof fn !== "function") {
        return;
    }
    fnString = fn.toString();
    fnBody = fnString.substring(fnString.indexOf("{") + 1, fnString.lastIndexOf("}"));
    return fnBody;
}

// same logic in smarImg.js to normalise screenDensity
function mockDensity(num) {
	return Math.round(num);
}

// test spec
var testRunner = getFnBodyString(function() {
	var $img = $('<img is="smart-img" srcset="images/totoro.png, images/totoro320.png 320w, images/totoro2xiPad.png 768w 2x, images/totoro3x.png 3x">'),
		ret = parseSrcset($img[0]);
	
	describe("parseSrcset test as desktop fallback density 1x", function() {
	
		beforeEach(function() {
			screenWidth = 960;
			screenDensity = mockDensity(1);
			register = null; 
		});
		
		it("should return default src path as string", function() {
			expect(typeof ret).toEqual("string");
		});
		
		it("should return src path as images/totoro.png when screen width greater than 320w", function() {
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro.png");
		});
		
		it("should return src path as images/totoro320.png when screen width match definition of 320w", function() {
			screenWidth = 320;
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro320.png");
		});
		
	});
	
	
	describe("parseSrcset test as old andriod fallback density 0.5x", function() {
		beforeEach(function() {
			screenWidth = 960;
			screenDensity = mockDensity(0.5);
			register = null; 
		});
		it("should return default src path as string", function() {
			expect(typeof ret).toEqual("string");
		});
		
		it("should return src path as images/totoro.png", function() {
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro.png");
		});
		
		it("should return src path as images/totoro320.png when screen width is 320w and density undefined", function() {
			screenWidth = 320;
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro320.png");
		});
	});
	
	describe("parseSrcset test as old andriod fallback density 1.5x", function() {
		beforeEach(function() {
			screenWidth = 960;
			screenDensity = mockDensity(1.5);
			register = null; 
		});
		it("should return default src path as string", function() {
			expect(typeof ret).toEqual("string");
		});
		
		it("should return src path as images/totoro2xiPad.png", function() {
			var ret = parseSrcset($img[0]);
			console.log("ret: ", ret, " screenWidth: ", screenWidth, " screenDensity: ", screenDensity );
			expect(ret).toEqual("images/totoro2xiPad.png");
		});
		
		it("should return src path as images/totoro2xiPad.png when screen width is 360w but match density", function() {
			screenWidth = 360;
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro2xiPad.png");
		});
	});

	describe("parseSrcset test as HiDPI device fallback density 2x", function() {
		beforeEach(function() {
			screenWidth = 960;
			screenDensity = mockDensity(2);
			register = null; 
		});
		
		it("should return default src path as string", function() {
			expect(typeof ret).toEqual("string");
		});
		
		// check srset spec - it seems return first density match, regardless screen width
		it("should return src path as images/totoro2xiPad.png when screen width greater than 768w because density takes higher priority.", function() {
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro2xiPad.png");
		});
		
		it("should return src path as images/totoro2xiPad.png with screen width smaller than 768w", function() {
			screenWidth = 450;
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro2xiPad.png");
		});
		
	});
	
	
	describe("parseSrcset test as HiDPI device fallback density 3x", function() {
		beforeEach(function() {
			screenWidth = 960;
			screenDensity = mockDensity(3);
			register = null; 
		});
		it("should return default src path as string", function() {
			expect(typeof ret).toEqual("string");
		});
		
		it("should return src path as images/totoro3x.png", function() {
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro3x.png");
		});
		
		it("should return src path as images/totoro3x.png when screen width match 768w definition but not match in density", function() {
			screenWidth = 768;
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro3x.png");
		});
	});
	
});
