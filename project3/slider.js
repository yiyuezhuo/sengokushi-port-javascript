//jQuery UI 的 slider 在移动端不能用，只能自己写一个空间来模拟了。接口应当做到与jQuery ui的完全一样，除了修改调用方法外。

function slider(el_box,data){
	function _slider(el_box,data){
		//这个方法接受jQuery包装器和参数字典 返回一个包装对象
		//参数应当实现 range min max value slide
		//$("<input type="range" name="points" min="1" max="10" />")
		el_box.empty();
		
		var el=$('<input type="range"/>');
		var that=this;
		el.appendTo(el_box);
		el.attr({min:data['min'],max:data['max']});
		this.get_value=function(){
			//return el.attr('value');
			return Number(el[0].value);
		}
		this.value=data['value'];
		el[0].value=data['value'];
		//el.on('change',data['slide']);
		el.on('change',function(){
			that.value=that.get_value();
			data['slide']('change',that);
		})
		this.el=el;
	}
	var obj=new _slider(el_box,data);
	return obj;
}