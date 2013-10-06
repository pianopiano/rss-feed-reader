(function() {
	google.load("feeds", "1");
	$(function() {
		var rssURL = '',
			nowEntry = {},
			items = [],
			favos = [],
			reads = [],
			readItems = [],
			nowFeed = '',
			entrieFlag = false,
			nowFeedPageURL = '',
			folderNavigation = '',
			selected = '',
			// folderに入れるもの
			currentNavigation = 'naviLeft'; // 現在地
		var utils = new Utils();
		setNavigation();
		addEvents();

		function feedLoader() {
			var feed = new google.feeds.Feed(rssURL);
			feed.setNumEntries(10);
			feed.load(function(result) {
				if (!result.error) feedBuild(result);
			});
		}

		function addEvents() {
			var folderNavigationHover = false;
			$(window).resize(resizeHandler);
			$(document).on('mouseover', '.items, #navigation ul#naviLeft li, #navigation ul#naviRight li', function(e) {
				if ($(this).hasClass('folder-inner-title')) return;
				if ($(this).find('div').hasClass('folderNavigation')) return;
				$(this).css({
					'background-color': '#fff'
				});
				if ($(this).parent().parent().parent().attr('id') == 'navigation') {
					$(this).find('.delete-rss-btn').show()
					$(this).find('.navi-folder-btn').show()
				}
			}).on('mouseout', '.items, #navigation ul#naviLeft li, #navigation ul#naviRight li', function() {
				if ($(this).hasClass('folder-inner-title')) return;
				$(this).css({
					'background-color': '#f3f3ea'
				})
				if ($(this).parent().parent().parent().attr('id') == 'navigation') {
					$(this).find('.delete-rss-btn').hide()
					$(this).find('.navi-folder-btn').hide()
				}
			}).on('click', '#navigation ul#naviLeft li, #navigation ul#naviRight li', function(e) {
				if ($(this).hasClass('folder-inner-title')) return;
				var rss = $(this).attr('data-rss');
				if (rss) {
					rssURL = '';
					rssURL = rss.toString();
					var domain = utils.searchDomain(rss);
					for (var i = 0; i < reads.length; i++) {
						if (reads[i][domain] !== undefined) {
							readItems = reads[i][domain];
						}
					}
					feedLoader();
				} else {
					setUpFolderInner($(this).attr('data-folder'));
				}
			}).on('click', '#navigation ul#naviRight li .navigationRight-back-btn', function() {
				navigationBack();
			}).on('click', '.delete-rss-btn', function() {
				if ($(this).parent('li').attr('data-rss')) {
					var li = $(this).parent('li')
					deleteRss(li.attr('data-rss'), li.parent('ul').attr('id'));
					li.hide();
					return false;
				} else {
					var li = $(this).parent('li')
					deleteFolder(li);
					li.hide();
					return false;
				}
			}).on('mouseover', '.folderNavigation div p', function() {
				$(this).css({
					'color': '#ce6040'
				});
			}).on('mouseout', '.folderNavigation div p', function() {
				$(this).css({
					'color': '#231712'
				});
			})
			// =======================================================
			// folderNavigation
			// =======================================================
			.on('click', '.folderNavigation div p', function(e) {
				if ($(e.target).text() === $('#' + currentNavigation).find('li').eq(0).text()) return;
				putInFolder($(e.target).text());
				deleteRss(selected, currentNavigation);
				var len = $('#' + currentNavigation).children('li').length;
				for (var i = 0; i < len; i++) {
					if (selected === $('#' + currentNavigation).children('li').eq(i).attr('data-rss')) {
						$('#' + currentNavigation).children('li').eq(i).remove();
					}
				}
				$('.folderNavigation').empty().remove();
			}).on('mouseenter', '.folderNavigation', function(e) {
				$('.folderNavigation').show();
			}).on('mouseleave', '.folderNavigation', function(e) {
				$('.folderNavigation').hide();
			}).on('click', '.navi-folder-btn', function() {
				selected = $(this).parent('li').attr('data-rss');
				currentNavigation = $(this).parent('li').parent('ul').attr('id')
				$(document.body).append(folderNavigation);
				$('.folderNavigation').css({
					'top': $(this).offset().top - 5 + 'px',
					'left': $(this).offset().left - 5 + 'px'
				}).show();
				return false;
			}).on('click', '.items', function() {
				var index = $('.items').index(this);
				addEntrie(nowEntry.feed.entries[index].title, nowEntry.feed.entries[index].content);
				if ($(this).hasClass('read')) return false;
				var url = ($(this).find('a').attr('href').toString());
				addRead(utils.searchDomain(url), url);
				$(this).addClass('read');
				if ($('.read-btn').text() === 'ALL') {
					$(this).addClass('read-hide');
				}
			}).on('click', '.linkicon', function(e) {
				e.preventdefault();
			}).on('click', '.faboStar', function() {
				if ($(this).find('img').attr('src') === 'images/favo_x.png') {
					removeFavo($(this).next('.linkicon').find('a').attr('href'));
					$(this).find('img').attr('src', 'images/favo_d.png');
					return false;
				}
				addFavo($(this).parent());
				$(this).find('img').attr('src', 'images/favo_x.png');
				return false;
			}).on('mouseover', '.linkicon, .faboStar, .read-btn', function() {
				$(this).css('opacity', '0.6');
			}).on('mouseout', '.linkicon, .faboStar, .read-btn', function() {
				$(this).css('opacity', '1.0');
			}).on('mouseover', '.favo-caps', function() {
				$(this).css('background-color', '#ffffff');
			}).on('mouseout', '.favo-caps', function() {
				$(this).css('background-color', '#f3f3ea');
			}).on('click', '.feed-title', function() {}).on('click', '.read-btn', function() {
				if ($('.read').hasClass('read-hide')) {
					$(this).text('未読')
					$('.read').removeClass('read-hide');
				} else {
					$(this).text('ALL');
					$('.read').addClass('read-hide');
				}
			}).on('click', '.favo-category', function(e) {
				if ($(e.target).hasClass('feed-title')) {
					if ($(this).find('li').height() !== 0) {
						$(this).find('li').animate({
							'height': '0px'
						}, 200, 'swing', function() {
							$(this).hide();
						});
					} else {
						$(this).find('li').animate({
							'height': '23px'
						}, 300, 'swing').show();
					}
				}
			}).on('mouseover', '.feed-title', function() {
				$(this).css({
					'color': '#e25527'
				});
			}).on('mouseout', '.feed-title', function() {
				$(this).css({
					'color': '#666'
				});
			});
			$('#backBtn').on('click', removeArticle);
			$('#add-btn').on('click', function() {
				var feed = new google.feeds.Feed($('#add-rss').val());
				feed.setNumEntries(1);
				feed.load(function(result) {
					if (!result.error) {
						utils.setItemStorage($('#add-rss').val(), items);
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
			$('#fabutton').on('click', function() {
				if (favos !== null) {
					if (favos.length === 0) {
						$('#main').empty().append('<p style="font-size: 120px;">まだ<br /><strong>Favorite</strong><br />無いよー！</p>');
						return false;
					}
					favoBuild();
				}
			});
			var addFolderFlag = false;
			$('#addFolder p').on('click', function() {
				if (addFolderFlag === false) {
					addFolderOpen($(this), function() {
						addFolderFlag = true;
					});
				} else if (addFolderFlag === true) {
					addFolderClose($(this), function() {
						addFolderFlag = false;
					});
				}
			});
			$('#add-folder-btn').on('click', function() {
				if ($('#folder-name').val().length === 0) return;
				addFolder($('#folder-name').val());
				addFolderClose($(this), function() {
					addFolderFlag = false;
				});
			})
		}

		function setUpFolderInner(name) {
			for (var i = 0; i < items.length; i++) {
				if (typeof items[i] === 'object') {
					if (name === Object.keys(items[i]).toString()) {
						setNavigationRight(items[i][name], name)
					}
				}
			}
		}

		function setNavigationRight(_items, _name) {
			if (_items.length === 0) return;
			navigationMove()
			$('#navigation').find('ul#naviRight').append('<img src="images/ajax-loader.gif" style="margin: 50px 130px;" />')
			for (var i = 0; i < _items.length; i++) {
				var contents = '<li class="folder-inner-title" style="border-bottom-color: #c75e43;">' + _name + '<span class="navi-folder-btn"></span><span class="navigationRight-back-btn"><img style="margin-top: 4px;" src="images/back-btn.png" /></span></li>';
				var folderNames = [];
				var n = 0;
				naviLoader(_items[i], function(url, title) {
					n++;
					if (utils.check2Byte(title.toString())) {}
					contents += '<li data-rss="' + url + '"><p>' + title + '</p><span class="navi-folder-btn"><img src="images/folder-icon.png" />' + '</span><span class="delete-rss-btn"><img src="images/trashbox.png" /></span></li>';
					if (n == _items.length) {
						start(contents, $('#navigation').find('ul#naviRight'));
					}
				});
			}
		}

		function navigationMove() {
			$('#navigationInner, #addFolder, #set-rss').animate({
				'left': '-320px'
			}, 500, 'easeOutExpo');
		}

		function navigationBack() {
			$('#navigationInner, #addFolder, #set-rss').animate({
				'left': '0px'
			}, 500, 'easeOutExpo');
			$('#navigation').find('ul#naviRight').empty();
		}

		function putInFolder(name) {
			for (var i = 0; i < items.length; i++) {
				if (typeof items[i] === 'object') {
					if (name === Object.keys(items[i]).toString()) {
						var len = items[i][name].length;
						for (var j = 0; j < len; j++) {
							if (items[i][name][j] === selected) {
								return false;
							}
						}
						items[i][name].push(selected);
						utils.setItemStorage(null, items);
					}
				}
			}
		}

		function addFavo($elm) {
			var favo = {
				feed: $elm.parent('ul').prev('h3').text().replace('ALL', '').replace('未読', ''),
				title: $elm.find('.title').text(),
				item: $elm.find('.item').text(),
				date: $elm.find('.item-date').text(),
				link: $elm.find('.linkicon').find('a').attr('href')
			}
			utils.setFavoStorage(favo, favos);
		}

		function removeFavo(str) {
			for (var i = 0; i < favos.length; i++) {
				if (favos[i].link === str) {
					favos.splice(i, 1);
					utils.setFavoStorage(null, favos);
				}
			}
		}

		function addEntrie(title, art) {
			art = art.replace(/src="\//g, 'src="http://' + nowFeedPageURL + '/')
			entrieFlag = true;
			var article = '<div id="article-title">' + title + '</div><br />' + art;
			$(document.body).scrollTop(0).append('<div id="articleBg"></div><div id="article" class="shadow rad15"></div>');
			$('#backBtn, #favoBtn').animate({
				'top': '6px'
			}, 300, 'swing');
			$('#article').hide().css({
				'width': '700px',
				'position': 'absolute',
				'top': '50px',
				'left': $(window).width() / 2 - 400 + 'px',
				'padding': '30px 50px',
				'font-size': '12px',
				'background-color': '#f3f3ea',
				'margin': '0 0 200px 0'
			}).html(article).fadeIn(300).find('img').css({
				'margin': '20px'
			})
			$('#articleBg').hide().css({
				'position': 'absolute',
				'top': '0',
				'left': '0',
				'width': $(window).width() + 'px',
				'height': $(document).height() + 50 + 'px',
				'background-color': '#f2e9de',
				'opacity': '0.85'
			}).on('click', removeArticle).fadeIn(300);
			$('#article').find('a').attr('target', '_blank');
		}

		function removeArticle() {
			$('#article').fadeOut(300, function() {
				$(this).empty().remove();
			});
			$('#articleBg').fadeOut(300, function() {
				$(this).empty().remove();
			});
			$('#backBtn, #favoBtn').animate({
				'top': '-50px'
			}, 200, 'swing');
			entrieFlag = false;
		}

		function deleteRss(rss, ul) {
			if (ul === 'naviLeft') {
				for (var i = 0; i < items.length; i++) {
					if (items[i] == rss) {
						items.splice(i, 1);
						utils.setItemStorage(null, items);
					}
				}
			} else if (ul === 'naviRight') {
				var name = $('#naviRight').find('li').eq(0).text().split('Back')[0];
				var len = items.length;
				for (var i = 0; i < len; i++) {
					if (typeof items[i] === 'object') {
						if (name === Object.keys(items[i]).toString()) {
							var len = items[i][name].length;
							for (var j = 0; j < len; j++) {
								if (items[i][name][j] === rss) {
									items[i][name].splice(j, 1);
									utils.setItemStorage(null, items);
									return false;
								}
							}
						}
					}
				}
			}
		}

		function favoSort() {
			favos.sort(

			function(a, b) {
				var afeed = a['feed'];
				var bfeed = b['feed'];
				if (afeed < bfeed) return -1;
				if (afeed > bfeed) return 1;
				return 0;
			});
		}

		function unique(array) {
			var storage = {};
			var uniqueArray = [];
			var i, value;
			for (i = 0; i < array.length; i++) {
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
				categoryItem += '<ul class="favo-category"><div class="feed-title">' + categorys[i] + '</div></ul>'
			}
			$('#main').empty().hide().append('<div class="channel">' + categoryItem + '</div>')
			var contents = '';
			for (var i = 0; i < len; i++) {
				var content = '<li class="favo-one">' + '<a href="' + favos[i].link + '" target="_blank"><div class="favo-caps">' + '<p class="favo-title">' + favos[i].title + '</p>' + '<p class="favo-date">' + favos[i].date + '</p>' + '</div></a>' +
				//'<p class="favo-item">'+favos[i].item+'</p>'+
				'</li>'
				for (var j = 0; j < categorys.length; j++) {
					if (favos[i].feed == categorys[j]) {
						$('.favo-category').eq(j).append(content);
					}
				}
			}
			$('#main').fadeIn(500);
			$('.favo-category').find('li').height(0).hide();
		}

		function feedBuild(entry) {
			nowEntry = {};
			nowEntry = entry;
			var entries = entry.feed.entries;
			var channelTitle = entry.feed.title;
			var contents = '';
			for (var i = 0; i < entry.feed.entries.length; i++) {
				var favoImage = 'favo_d.png';
				for (var j = 0; j < favos.length; j++) {
					if (entries[i].link === favos[j].link) {
						favoImage = 'favo_x.png';
					}
				}
				contents += '<li class="items">' + '<p class="title text15">' + entries[i].title + '</p>' + '<p class="item">' + entries[i].contentSnippet + '</p>' + '<p class="item-date text11">' + utils.trimDate(entries[i].publishedDate) + '</p>' + '<p class="faboStar"><img src="images/' + favoImage + '" /></p>' + '<p class="linkicon"><a href="' + entries[i].link + '" target="_blank"><img src="images/link.png" /></a></p>' + '</li>'
			}
			$('#main').empty().hide().append('<div class="channel"><h3 class="feed-title"><span>' + channelTitle + '</span><span class="read-btn">未読</span></h3><ul>' + contents + '</ul></div>').fadeIn(500);
			$('.feed-title').css({
				background: "url(http://g.etfv.co/" + entry.feed.link + ") 15px 15px no-repeat #fff",
				'background-size': '16px 16px',
				"padding-left": "35px"
			}).find('span').css({
				'margin': '5px 0 0 5px'
			});
			//$('.channel').find('img').width(20).height(20);
			for (var i = 0; i < $('.items').length; i++) {
				for (var j = 0; j < readItems.length; j++) {
					if ($('.items').eq(i).find('a').attr('href') === readItems[j]) {
						$('.items').eq(i).addClass('read');
					}
				}
			}
			$('.read').find('img').css({
				'opacity': '0.5'
			});
			nowFeedPageURL = '';
			nowFeedPageURL = entries[0].link.match(/^[httpsfile]+:\/{2,3}([0-9a-z\.\-:]+?):?[0-9]*?\//i)[1];
		}
		window.onload = function() {
			//window.localStorage.removeItem('reads');
			//window.localStorage.removeItem('favos')
			if (JSON.parse(window.localStorage.getItem('favos')) !== null) {
				favos = JSON.parse(window.localStorage.getItem('favos'));
			}
			if (JSON.parse(window.localStorage.getItem('reads')) !== null) {
				reads = JSON.parse(window.localStorage.getItem('reads'));
			}
			var domain = utils.searchDomain($('#navigation ul#naviLeft li').eq(0).attr('data-rss'));
			for (var i = 0; i < reads.length; i++) {
				if (reads[i][domain] !== undefined) {
					readItems = reads[i][domain];
				}
			}
		}

		function setNavigation() {
			items = JSON.parse(window.localStorage.getItem('items'));
			if (items === null || items === undefined || items.length === 0) {
				$('#main').append('<div id="noitem" style="font-size: 40px; padding: 120px 0 0 0;">←RSSのURLいれてー！</div>')
				items = [];
				return false;
			}
			for (var i = 0; i < items.length; i++) {
				var contents = '';
				var folderNames = [];
				var n = 0;
				naviLoader(items[i], function(url, title) {
					n++;
					if (url === null) {
						contents += '<li data-folder="' + title + '">' + title + '<span class="delete-rss-btn"><img src="images/trashbox.png" /></span></li>';
						folderNames.push(title[0]);
					} else {
						contents += '<li data-rss="' + url + '"><p>' + title + '</p><span class="navi-folder-btn"><img src="images/folder-icon.png" />' + '</span><span class="delete-rss-btn"><img src="images/trashbox.png" /></span></li>';
					}
					if (n == items.length) {
						start(contents, $('#navigation').find('ul#naviLeft'));
						buildFolderNavigation(folderNames)
					}
				});
			}
		}

		function buildFolderNavigation(names) {
			var p = '';
			for (var i = 0; i < names.length; i++) {
				p += '<p class="folderName">' + names[i] + '</p>'
			}
			folderNavigation = '<div class="folderNavigation"><p class="fn-tit">フォルダへ追加</p><div>' + p + '</div></div>'
		}

		function start(contents, $elm) {
			$elm.empty().append(contents);
			setFavi($elm);
			rssURL = $('ul#naviLeft').find('li').eq(0).attr('data-rss');
			google.setOnLoadCallback(feedLoader);
		}

		function naviLoader(url, collback) {
			var feed = new google.feeds.Feed(url);
			feed.setNumEntries(1);
			feed.load(function(result) {
				if (!result.error) {
					collback(url, result.feed.title);
					return false;
				} else {
					if (typeof url === 'object') {}
					collback(null, Object.keys(url));
					return false;
				};
			});
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
						if (reads[i][key][j] === read) addFlag = true;
					}
					flag = true;
				}
			}
			if (addFlag === false) {
				target.push(read);
			}
			if (flag === false) {
				var obj = {}
				obj[key] = [read];
				reads.push(obj)
			};
			utils.setAllReadyRead(reads);
		}
		// =============================================
		// Resize Handler
		// =============================================

		function resizeHandler() {
			if (entrieFlag) {
				$('#articleBg').css({
					'width': $(window).width() + 'px',
					'height': $(document).height() + 'px'
				});
				$('#article').css({
					'left': $(window).width() / 2 - 400 + 'px'
				})
			}
		}
		// =============================================
		// Folder
		// =============================================

		function addFolder(name) {
			var obj = new Object();
			obj[name] = []
			utils.setItemStorage(obj, items);
			setNavigation();
			//$('#navigation').find('ul').append('<li data-folder="#">'+name+'<span class="delete-rss-btn"><img src="images/trashbox.png" /></span></li>');
		}

		function addFolderOpen(elm, collback) {
			elm.parent().animate({
				'width': 270 + 'px',
				'height': 110 + 'px'
			}, 200, 'swing', function() {
				$('#folder-name').fadeIn(300);
				$('#add-folder-btn').fadeIn(300);
				collback();
			})
		}

		function addFolderClose(elm, collback) {
			$('#folder-name').fadeOut(100);
			$('#add-folder-btn').fadeOut(100);
			elm.parent().animate({
				'width': 100 + 'px',
				'height': 30 + 'px'
			}, 200, 'swing', function() {
				collback();
			});
		}

		function deleteFolder(folder) {
			for (var i = 0; i < items.length; i++) {
				if (typeof items[i] === 'object') {
					if ($(folder).attr('data-folder') === Object.keys(items[i]).toString()) {
						items.splice(i, 1);
						utils.setItemStorage(null, items);
					}
				}
			}
		}
		// =============================================
		// Favicon load
		// =============================================

		function setFavi($elm) {
			var $li = $elm.find('li');
			var len = $li.length;
			for (var i = 0; i < len; i++) {
				var link = $li.eq(i).attr('data-rss');
				if (link) {
					$li.eq(i).css({
						background: "url(http://g.etfv.co/" + link + ") 10px center no-repeat",
						"background-size": "16px 16px",
						"padding-left": "35px"
					})
				} else {
					$li.eq(i).css({
						background: "url(/images/folder.png) 10px center no-repeat",
						"background-size": "16px 16px",
						"padding-left": "35px",
						"color": "#ce6040"
					})
				}
			}
		}
	})
})();