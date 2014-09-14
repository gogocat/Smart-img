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
	
	// test srcset with density descriptors
	describe("parseSrcset test as srcset='images/totoro.png, images/totoro2x.png 2x, images/totoro3x.png 3x'", function() {
		var $img = $('<img is="smart-img" srcset="images/totoro.png, images/totoro2x.png 2x, images/totoro3x.png 3x">'),
			ret = parseSrcset($img[0]);
		
		beforeEach(function() {
			screenDensity = mockDensity(1);
			register = null; 
		});
		
		it("should return default src path as string", function() {
			expect(typeof ret).toEqual("string");
		});
		
		it("should return src path as images/totoro.png when screen density is 0.5x", function() {
			screenDensity = mockDensity(0.5);
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro.png");
		});
		
		it("should return src path as images/totoro.png when screen density is 1x", function() {
			screenDensity = mockDensity(1);
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro.png");
		});
		
		it("should return src path as images/totoro2x.png when screen density is 1.5x", function() {
			screenDensity = mockDensity(1.5);
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro2x.png");
		});
		
		it("should return src path as images/totoro2x.png when screen density is 2x", function() {
			screenDensity = mockDensity(2);
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro2x.png");
		});
		
		it("should return src path as images/totoro2x.png when screen density is 3x", function() {
			screenDensity = mockDensity(3);
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro3x.png");
		});
		
	});
	
	// test srcset with width descriptors
	describe("parseSrcset test as srcset='images/totoro.png, images/totoro2x320.png 320w, images/totoro2x360.png 360w, images/totoro2xiPad.png 768w'", function() {
		var $img = $('<img is="smart-img" srcset="images/totoro.png, images/totoro2x320.png 320w, images/totoro2x360.png 360w, images/totoro2xiPad.png 768w">'),
			ret = parseSrcset($img[0]);
		
		beforeEach(function() {
			register = null; 
		});
		
		it("should return default src path as string", function() {
			expect(typeof ret).toEqual("string");
		});
		
		it("should return src path as images/totoro.png when screen width is 960", function() {
			screenWidth = 960;
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro.png");
		});
		
		it("should return src path as images/totoro2xiPad.png when screen width is 768", function() {
			screenWidth = 768;
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro2xiPad.png");
		});
		
		it("should return src path as images/totoro2xiPad.png when screen width is 600", function() {
			screenWidth = 600;
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro2xiPad.png");
		});
		
		it("should return src path as images/totoro2x360.png when screen width is 360", function() {
			screenWidth = 360;
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro2x360.png");
		});
		
		it("should return src path as images/totoro2x360.png when screen width is 340", function() {
			screenWidth = 340;
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro2x360.png");
		});
		
		it("should return src path as images/totoro2x320.png when screen width is 320", function() {
			screenWidth = 320;
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro2x320.png");
		});
		
		it("should return src path as images/totoro2x320.png when screen width is 280", function() {
			screenWidth = 280;
			var ret = parseSrcset($img[0]);
			expect(ret).toEqual("images/totoro2x320.png");
		});
		
	});
	
});
