// =====================================================
// Utils
// =====================================================
var Utils = (function(){
	function Utils() {
		
		this.setItemStorage = function(item, items) {
			if (item) {
				if (item!==null) items.push(item);
			}
			window.localStorage.setItem('items', JSON.stringify(items));
		}
		
		
		this.setFavoStorage = function(favo, favos) {
			if (favo) {
				if (favo!==null) {
					var len = favos.length;
					for (var i=0; i<len; i++) {
						if (favos[i].link===favo.link) return false;
					}
					favos.push(favo);
				}
			}
			window.localStorage.setItem('favos', JSON.stringify(favos));
		}
		
		
		this.setAllReadyRead = function(reads) {
			window.localStorage.setItem('reads', JSON.stringify(reads));
		}
		
		
		this.searchDomain = function(url){
			if (url===undefined) return;
			var domain = url.match(/^[httpsfile]+:\/{2,3}([0-9a-zA-Z\.\-:]+?):?[0-9]*?\//i)[1].split('.').join('');
			nowFeed = domain;
			return domain;
		}
		
		
		this.trimDate = function(d) {
			var now = new Date(d)
			,	y = now.getFullYear()
			,	m = now.getMonth() + 1
			,	d = now.getDate()
			,	w = now.getDay()
			,	week = ['日', '月', '火', '水', '木', '金', '土'];
			if (m < 10) {
			  m = '0' + m;
			}
			if (d < 10) {
			  d = '0' + d;
			}
			return y + '年' + m + '月' + d + '日 (' + week[w] + ')';
		}
	}
	return Utils;
})()