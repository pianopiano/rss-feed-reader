// =====================================================
// Feed
// =====================================================
var Feeds = (function(){
	
	function Feeds() {
		var ITEMS_CLICK = 'item_click';
		var STAR_CLICK = 'star_click'
		
		this.init = function() {
			this.addEvents()
		}
		
		this.hoge = function() {
			
		}
		
		this.addEvents = function() {
			$(document).on('mouseover', '.items', function(e){
				$(this).css({'background-color': '#fff'});
			}).on('mouseout', '.items', function(e) {
				$(this).css({'background-color': '#f3f3ea'});
			}).on('mouseover', '.linkicon, .faboStar, .read-btn', function(){
				$(this).css('opacity', '0.6');
			}).on('mouseout', '.linkicon, .faboStar, .read-btn', function(){
				$(this).css('opacity', '1.0');
			}).on('click', '.items', function(){
				$(window).trigger(new $.Event(ITEMS_CLICK, {
					_this: this,
					index: $('.items').index(this)
				}));
			}).on('click', '.linkicon', function(e){
				
			}).on('click', '.faboStar', function(){
				$(window).trigger(new $.Event(STAR_CLICK, {
					_this: this
				}));
			})
		}
		
		this.self = function(){
		}
		
		this.ITEMS_CLICK = ITEMS_CLICK
		this.STAR_CLICK = STAR_CLICK;
	}
	
	
	return Feeds;
})()