(function(){
	google.load("feeds", "1");
	$(function(){
		var rssURL = '';
		var nowEntry = {};
		var items = [];
		var favos = [];
		var reads = [];
		var readItems = [];
		var nowFeed = '';
		var entrieFlag = false;
		
		setNavigation();
		addEvents();
		
		function feedLoader() {
			var feed = new google.feeds.Feed(rssURL);
			feed.setNumEntries(10);
			feed.load(function (result){
				if (!result.error) feedBuild(result);
			});
		}
		
		function addEvents() {
			$(window).resize(resizeHandler);
			$(document).on('mouseover', '.items, #navigation ul li', function(){
				$(this).css({'background-color': '#fff'});
				if ($(this).parent().parent().attr('id')=='navigation') {
					$(this).find('.delete-rss-btn').show()
				}
			}).on('mouseout', '.items, #navigation ul li', function(){
				$(this).css({'background-color': '#f3f3ea'})
				if ($(this).parent().parent().attr('id')=='navigation') {
					$(this).find('.delete-rss-btn').hide()
				}
			}).on('click', '#navigation ul li', function(e){
				var rss = $(this).attr('data-rss');
				rssURL = '';
				rssURL = rss.toString();
				var domain = searchDomain(rss);
				for (var i = 0; i < reads.length; i++ ){
					if (reads[i][domain]!==undefined) {
						readItems = reads[i][domain];
					}
				}
				feedLoader();
			}).on('click', '.delete-rss-btn', function(){
				deleteRss($(this).parent('li').attr('data-rss'));
				$(this).parent('li').hide();
				return false;
			}).on('click', '.items', function(){
				var index = $('.items').index(this);
				addEntrie(nowEntry.feed.entries[index].title, nowEntry.feed.entries[index].content);
				if ($(this).hasClass('read')) return false;
				var url = ($(this).find('a').attr('href').toString());
				addRead(searchDomain(url), url);
				$(this).addClass('read');
				if ($('.read-btn').text()==='ALL') {
					$(this).addClass('read-hide');
				}
			}).on('click', '.linkicon', function(e){
				e.preventdefault();
			}).on('click', '.faboStar', function(){
				if ($(this).find('img').attr('src')==='images/favo_x.png') {
					removeFavo($(this).next('.linkicon').find('a').attr('href'));
					$(this).find('img').attr('src', 'images/favo_d.png');
					return false;
				}
				addFavo($(this).parent());
				$(this).find('img').attr('src', 'images/favo_x.png');
				return false;
			}).on('mouseover', '.linkicon, .faboStar, .read-btn', function(){
				$(this).css('opacity', '0.6');
			}).on('mouseout', '.linkicon, .faboStar, .read-btn', function(){
				$(this).css('opacity', '1.0');
			}).on('mouseover', '.favo-caps', function(){
				$(this).css('background-color', '#ffffff');
			}).on('mouseout', '.favo-caps', function(){
				$(this).css('background-color', '#f3f3ea');
			}).on('click', '.feed-title', function(){
			}).on('click', '.read-btn', function(){
				if ($('.read').hasClass('read-hide')) {
					$(this).text('未読')
					$('.read').removeClass('read-hide');
				} else {
					$(this).text('ALL');
					$('.read').addClass('read-hide');
				}
			});
			$('#backBtn').on('click', removeArticle);
			$('#add-btn').on('click', function(){
				var feed = new google.feeds.Feed($('#add-rss').val());
				feed.setNumEntries(1);
				feed.load(function (result){
					if (!result.error) {
						setItemStorage($('#add-rss').val());
						setNavigation();
						$('#add-rss').val('');
						if ($('#noitem')) {
							$('#noitem').remove();
						}
					} else {
						alert('有効なURLではないみたいです。')
					};
				});
			});
			$('#fabutton').on('click', function(){
				if (favos!==null) {
					if (favos.length===0) {
						$('#main').empty().append('<p style="font-size: 120px;">まだ<br /><strong>Favorite</strong><br />無いよー！</p>');
						return false;
					}
					favoBuild();
				}
			})
			
		}
		
		function resizeHandler() {
			if (entrieFlag) {
				$('#articleBg').css({'width': $(window).width()+'px','height': $(document).height()+'px'});
				$('#article').css({'left': $(window).width()/2-400+'px'})
			}
		}
		
		function searchDomain(url) {
			var domain = url.match(/^[httpsfile]+:\/{2,3}([0-9a-zA-Z\.\-:]+?):?[0-9]*?\//i)[1].split('.').join('');
			nowFeed = domain;
			return domain;
		}
		
		function addFavo($elm) {
			var favo = {
				feed: $elm.parent('ul').prev('h3').text().replace('ALL', '').replace('未読', ''),
				title: $elm.find('.title').text(),
				item: $elm.find('.item').text(),
				date: $elm.find('.item-date').text(),
				link: $elm.find('.linkicon').find('a').attr('href')
			}
			setFavoStorage(favo);
		}
		
		function removeFavo(str) {
			for (var i = 0; i < favos.length; i++) {
				if (favos[i].link===str) {
					favos.splice(i, 1);
					setFavoStorage();
				}
			}
		}
		
		function addEntrie(title, art) {
			entrieFlag = true;
			var article = '<div id="article-title">'+title+'</div><br />' + art;
			$(document.body).scrollTop(0).append('<div id="articleBg"></div><div id="article" class="shadow rad15"></div>');
			$('#backBtn, #favoBtn').animate({'top': '6px'}, 300, 'swing');
			$('#article').hide().css({'width': '700px','position': 'absolute','top': '50px','left': $(window).width()/2-400+'px','padding': '30px 50px','font-size': '12px','background-color': '#f3f3ea','margin': '0 0 200px 0'
			}).html(article).fadeIn(300).find('img').css({'margin': '20px'})
			$('#articleBg').hide().css({'position': 'absolute','top': '0','left': '0','width': $(window).width()+'px','height': $(document).height()+50+'px','background-color': '#f2e9de','opacity': '0.85'}).on('click', removeArticle).fadeIn(300);
			$('#article').find('a').attr('target', '_blank');
		}
			
		function removeArticle() {
			$('#article').fadeOut(300, function(){
				$(this).empty().remove();
			});
			$('#articleBg').fadeOut(300, function(){
				$(this).empty().remove();
			});
			$('#backBtn, #favoBtn').animate({'top': '-50px'}, 200, 'swing');
			entrieFlag = false;
		}

		function deleteRss(rss) {
			for (var i = 0; i < items.length; i++) {
				if (items[i]==rss) {
					items.splice(i, 1);
					setItemStorage();
				}
			}
		}
		
		function favoSort() {
			favos.sort(
				function(a, b) {
					var afeed = a['feed'];
					var bfeed = b['feed'];
					if( afeed < bfeed ) return -1;
					if( afeed > bfeed ) return 1;
					return 0;
				}
			);
		}
				
		function unique(array) {
			var storage = {};
			var uniqueArray = [];
			var i,value;
			for ( i=0; i<array.length; i++) {
				value = array[i];
				if (!(value in storage)) {
					storage[value] = true;
					uniqueArray.push(value);
				}
			}
			return uniqueArray;
		}
			
		function favoBuild() {
			favoSort();
			var len = favos.length;
			var categorys = [];
			var categoryItem = '';
			// title取り出し
			for (var i = 0; i < len; i++) {
				categorys.push(favos[i].feed);
			}
			categorys = unique(categorys);
			
			for (var i = 0; i < categorys.length; i++) {
				categoryItem += '<ul class="favo-category"><div class="feed-title">'+categorys[i]+'</div></ul>'
			}
			
			$('#main').empty().hide().append(
				'<div class="channel">'+categoryItem+'</div>'
			)
			var contents = '';
			for (var i = 0; i < len; i++) {
				var content = '<li class="favo-one">'+
								'<a href="'+favos[i].link+'" target="_blank"><div class="favo-caps">'+
									'<p class="favo-title">'+favos[i].title+'</p>'+
									'<p class="favo-date">'+favos[i].date+'</p>'+
								'</div></a>'+
								//'<p class="favo-item">'+favos[i].item+'</p>'+
							'</li>'
							
				for (var j = 0;j < categorys.length; j++) {
					if (favos[i].feed==categorys[j]) {
						$('.favo-category').eq(j).append(content);
					}
				}
			}
			$('#main').fadeIn(500);
		}

		function feedBuild(entry) {
			nowEntry = {};
			nowEntry = entry;
			
			var entries = entry.feed.entries;
			var channelTitle = entry.feed.title;
			var contents = '';
			
			for (var i = 0; i<entry.feed.entries.length; i++) {
				var favoImage = 'favo_d.png';
				for (var j=0;j<favos.length;j++){
					if (entries[i].link===favos[j].link) {
						favoImage = 'favo_x.png';
					}
				}
				contents += '<li class="items">'+
								'<p class="title text15">'+entries[i].title+'</p>'+
								'<p class="item">'+entries[i].contentSnippet+'</p>'+
								'<p class="item-date text11">'+trimDate(entries[i].publishedDate)+'</p>'+
								'<p class="faboStar"><img src="images/'+favoImage+'" /></p>'+
								'<p class="linkicon"><a href="'+entries[i].link+'" target="_blank"><img src="images/link.png" /></a></p>'+
							'</li>'
			}
			
			$('#main').empty().hide().append('<div class="channel"><h3 class="feed-title"><span>'+channelTitle+'</span><span class="read-btn">未読</span></h3><ul>'+contents+'</ul></div>').fadeIn(500);
			$('.feed-title').css({background: "url(http://g.etfv.co/" + entry.feed.link + ") 15px 15px no-repeat #fff", 'background-size': '16px 16px', "padding-left": "35px"}).find('span').css({'margin': '5px 0 0 5px'});
			//$('.channel').find('img').width(20).height(20);
			for (var i = 0; i < $('.items').length; i++) {
				for (var j = 0; j < readItems.length; j++) {
					if ($('.items').eq(i).find('a').attr('href')===readItems[j]) {
						$('.items').eq(i).addClass('read');
					}
				}
			}
			$('.read').find('img').css({'opacity': '0.5'});
		}
		window.onload = function(){
			//window.localStorage.removeItem('reads');
			//window.localStorage.removeItem('favos')
			if (JSON.parse(window.localStorage.getItem('favos'))!==null) {
				favos = JSON.parse(window.localStorage.getItem('favos'));
			}
			if (JSON.parse(window.localStorage.getItem('reads'))!==null) {
				reads = JSON.parse(window.localStorage.getItem('reads'));
			}
			var domain = searchDomain($('#navigation ul li').eq(0).attr('data-rss'));
			for (var i = 0; i < reads.length; i++ ){
				if (reads[i][domain]!==undefined) {
					readItems = reads[i][domain];
				}
			}
		
		}
		function setFavi() {
			var len = $('#navigation').find('li').length;
			for (var i = 0; i < len; i++) {
				var link = $('#navigation').find('li').eq(i).attr('data-rss');
				$('#navigation').find('li').eq(i).css({
					background: "url(http://g.etfv.co/" + link + ") 10px center no-repeat", "background-size": "16px 16px", "padding-left": "35px"
				})
			}
		}
		
		function setNavigation() {
			items = JSON.parse(window.localStorage.getItem('items'));
			if (items===null||items===undefined||items.length===0) {
				$('#main').append('<div id="noitem" style="font-size: 40px; padding: 120px 0 0 0;">←RSSのURLいれてー！</div>')
				items = [];
				return false;
			}
			for (var i = 0; i < items.length; i++) {
				var contents = '';
				var n = 0;
				naviLoader(items[i], function(url, title){
					n++;
					contents += '<li data-rss="'+url+'">'+title+'<span class="delete-rss-btn"><img src="images/trashbox.png" /></span></li>';
					if (n==items.length) {
						start(contents);
					}
				});
			}
			
		}
		
		function start(contents) {
			$('#navigation').find('ul').empty().append(contents);
			setFavi();
			
			
			rssURL = $('#navigation').find('li').eq(0).attr('data-rss');
			google.setOnLoadCallback(feedLoader);
		}
		
		function naviLoader(url, collback) {
			var feed = new google.feeds.Feed(url);
			feed.setNumEntries(1);
			feed.load(function (result){
				if (!result.error) {
					collback(url, result.feed.title);
					return false;
				};
			});
		}
		
		function trimDate(d) {
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
		
		function setItemStorage(item) {
			if (item)items.push(item);
			window.localStorage.setItem('items', JSON.stringify(items));
		}
		
		function setFavoStorage(favo) {
			if (favo) {
				var len = favos.length;
				for (var i=0; i<len; i++) {
					if (favos[i].link===favo.link) return false;
				}
				favos.push(favo);
			}
			window.localStorage.setItem('favos', JSON.stringify(favos));
		}
		
		function setAlreadyRead() {
			window.localStorage.setItem('reads', JSON.stringify(reads));
		}
		
		function addRead(key, readUrl) {
			var read = readUrl
			var flag = false;
			var addFlag = false;
			var target = [];
			for (var i = 0; i < reads.length; i++) {
				if (reads[i][key]) {
					target = reads[i][key];
					for (var j = 0; j < reads[i][key].length; j++) {
						if (reads[i][key][j]===read) addFlag = true;
					}
					flag = true;
				}
			}
			if (addFlag===false){
				target.push(read);
			}
			if (flag===false) {
				var obj = {}
				obj[key] = [read];
				reads.push(obj)
			};
			setAlreadyRead();
		}
	})

})();