(function(){
	google.load("feeds", "1");
	$(function(){
		var rssURL = '';
		var nowEntry = {};
		var items = [];
		
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
				feedLoader();
			}).on('click', '.delete-rss-btn', function(){
				deleteRss($(this).parent('li').attr('data-rss'));
				$(this).parent('li').hide();
				return false;
			}).on('click', '.items', function(){
				var index = $('.items').index(this);
				addEntrie(nowEntry.feed.entries[index].title, nowEntry.feed.entries[index].content);
			}).on('click', '.linkicon', function(){
				var index = $('.items').index($(this).parent('.items'));
				window.open(nowEntry.feed.entries[index].link)
				return false;
			});
			$('#add-btn').on('click', function(){
				var feed = new google.feeds.Feed($('#add-rss').val());
				feed.setNumEntries(1);
				feed.load(function (result){
					if (!result.error) {
						setSStorage($('#add-rss').val());
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
			
		}
		
		function addEntrie(title, art) {
			var article = '<div id="article-title">'+title+'</div><br />' + art;
			$(document.body).scrollTop(0).append(
				'<div id="articleBg"></div><div id="article" class="rad15"></div>'
			)
			$('#backBtn').animate({'top': '6px'}, 300, 'swing').on('click', removeArticle);
			$('#article').hide().css({
				'width': '700px',
				'position': 'absolute',
				'top': '0px',
				'left': $(window).width()/2-400+'px',
				'padding': '30px 50px',
				'font-size': '12px',
				'background-color': '#f3f3ea',
				'margin': '0 0 200px 0'
			}).html(article).fadeIn(300).find('img').css({
				'margin': '20px'
			});
			
			$('#articleBg').hide().css({
				'position': 'absolute',
				'top': '0',
				'left': '0',
				'width': $(window).width()+'px',
				'height': $(document).height()+'px',
				'background-color': '#f2e9de',
				'opacity': '0.85'
			}).on('click', removeArticle).fadeIn(300);
		}
			
		function removeArticle() {
			$('#article').fadeOut(300, function(){
				$(this).empty().remove();
			});
			$('#articleBg').fadeOut(300, function(){
				$(this).empty().remove();
			});
			$('#backBtn').animate({'top': '-50px'}, 200, 'swing').off('click', removeArticle);
		}
	

		function deleteRss(rss) {
			for (var i = 0; i < items.length; i++) {
				if (items[i]==rss) {
					items.splice(i, 1);
					setSStorage();
				}
			}
		}

		function feedBuild(entry) {
			nowEntry = {};
			nowEntry = entry;
			
			var entries = entry.feed.entries;
			var channelTitle = entry.feed.title;
			var contents = '';
			for (var i = 0; i<entry.feed.entries.length; i++) {
				contents += '<li class="items">'+
								'<p class="title text15">'+entries[i].title+'</p>'+
								'<p class="item">'+entries[i].contentSnippet+'</p>'+
								'<p class="item-date text11">'+trimDate(entries[i].publishedDate)+'</p>'+
								'<img class="linkicon" src="images/link.png" />'+
							'</li>'
			}
			
			$('#main').empty().hide().append('<div class="channel"><h3 class="feed-title">'+channelTitle+'</h3><ul>'+contents+'</ul></div>').fadeIn(500);
			$('.feed-title').css({background: "url(http://g.etfv.co/" + entry.feed.link + ") 10px center no-repeat #fff", "padding-left": "35px"});
			$('.channel').find('img').width(20).height(20);
		}
		
		function setFavi() {
			var len = $('#navigation').find('li').length;
			for (var i = 0; i < len; i++) {
				var link = $('#navigation').find('li').eq(i).attr('data-rss');
				$('#navigation').find('li').eq(i).css({
					background: "url(http://g.etfv.co/" + link + ") 10px center no-repeat", "padding-left": "35px"
				})
			}
		}
		
		function setNavigation() {
			items = JSON.parse(window.localStorage.getItem("items"));
			
			if (items===null||items===undefined||items.length===0) {console.log(items)
				$('#main').append('<div id="noitem" style="font-size: 80px; padding: 100px 0 0 0;">←URLいれてー！</div>')
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
			var now = new Date(d);
			var y = now.getFullYear();
			var m = now.getMonth() + 1;
			var d = now.getDate();
			var w = now.getDay();
			var week = ['日', '月', '火', '水', '木', '金', '土'];
			if (m < 10) {
			  m = '0' + m;
			}
			if (d < 10) {
			  d = '0' + d;
			}
			return y + '年' + m + '月' + d + '日 (' + week[w] + ')';
		}
		
		function setSStorage(item) {
			if (item)items.push(item);
			window.localStorage.setItem('items', JSON.stringify(items));
		}
		
	})

})();