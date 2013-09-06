/**
 *  DOMParser HTML extension
 *  2012-09-04
 * 
 *  By Eli Grey, http://eligrey.com
 *  Public domain.
 *  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 *
 *  @source https://gist.github.com/kketch/5656689
 */

(function(DOMParser) {
	
	if (!DOMParser) {
		
		return;
		
	}
	
	var parseFromStringNative = DOMParser.prototype.parseFromString;

	// Firefox/Opera/IE throw errors on unsupported types
	try {

		// WebKit returns null on unsupported types
		if ((new DOMParser).parseFromString("", "text/html")) {

			// text/html parsing is natively supported
			return;

		}

	} catch (e) {}

	DOMParser.prototype.parseFromString = function(markup, type) {

		if (/^\s*text\/html\s*(?:;|$)/i.test(type)) {

			var doc = document.implementation.createHTMLDocument("");

			doc.open();
			doc.write(markup);
			doc.close();

			return doc;

		} else {

			return parseFromStringNative.apply(this, arguments);

		}

	};

}(this.DOMParser));