// =====================================================
// RSSLoader
// =====================================================
var RSSLoader = (function(){
	google.load("feeds", "1");
	
	function RSSLoader() {
		this.load = function(rss, num, collback) {
			var feed = new google.feeds.Feed(rss);
			feed.setNumEntries(num);
			feed.load(function (result){
				if (!result.error) {
					return collback(result);
				} else {
					return collback('error');
				}
			});
		}
		
		this.onloadCallBack = function(){
			google.setOnLoadCallback(RSSLoader.prototype.load);
		}
		
	}
	return RSSLoader;
})()