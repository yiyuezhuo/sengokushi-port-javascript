function int(n){
	var m=Number(n);
	if (m%1===0){
		return m;
	}
	else{
		return Number(n)-Number(n)%1;
	}
}


random=(function(){
	module={};
	module.random=Math.random;
	module.choose=function(list){
		var index=int(Math.random()*list.length);
		return list[index];
	};
	return module;
})()

function max(l,key){
	if (key!=undefined){
		var ll=l.map(key);
	}
	else{
		var ll=l;
	}
	var maxv=ll[0];
	ll.forEach(function(value){
		if (value>maxv){
			maxv=value;
		}
	})
	return maxv;
}
function min(l,key){
	if (key!=undefined){
		var ll=l.map(key);
	}
	else{
		var ll=l;
	}
	var minv=ll[0];
	ll.forEach(function(value){
		if (value<minv){
			minv=value;
		}
	})
	return minv;
}
function zip(){
	var head_list=arguments[0];
	var rl=[];
	for (var i=0;i<head_list.length;i++){
		rrl=[];
		for (var j=0;j<arguments.length;j++){
			var sub_list=arguments[j];
			rrl.push(sub_list[i]);
		}
		rl.push(rrl);
	}
	return rl;
}

function member(atom,list){
    for(var i=0;i<list.length;i++){
        if (atom===list[i]){
            return true;
        }
    }
    return false;
}
function remove(l,atom){
		var index=l.indexOf(atom);
		l.splice(index,1);
		return l;
}
function other(l,atom){
	for (var i=0;i<l.length;i++){
		if (atom!=l[i]){
			return l[i];
		}
	}
}
function groupby(obj_l,attr){
	//根据obj_l里各个对象的attr属性进行分类
	var group_l=[];
	for (var i=0;i<obj_l.length;i++){
		var obj=obj_l[i];
		var s='pass';
		for (var j=0;j<group_l.length;j++){
			if (group_l[j][0][attr]===obj[attr]){
				group_l[j].push(obj);
				s='break';
				break
			}
		}
		if (s==='pass') {
			group_l.push([obj]);
		}
	}
	return group_l;
}

function id_dic_by_list(ll){
		rd={};
		for (var i=0;i<ll.length;i++){
				rd[ll[i]['id']]=ll[i]
		}
		return rd;
}
function copy(l){
	var rl=[]
	for (var i=0;i< l.length;i++){
		rl.push(l[i])
	}
	return rl;
}
function not(b){
	return !b;
}
function all(l){
	return l.reduce(function(a,b){return a&&b});
}
function set(l){
	var s=[];
	l.forEach(function(x){
		if (not(member(x,s))){
			s.push(x);
		}
	})
	return s;
}

function downloadFile(fileName, content){
	//copy from http://www.jb51.net/article/47723.htm
    var aLink = document.createElement('a');
    var blob = new Blob([content]);
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错, 感谢 Barret Lee 的反馈
    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);
    aLink.dispatchEvent(evt);
}
function downloadFileLink(aLink,fileName,content){
    //var aLink = document.createElement('a');
    var blob = new Blob([content]);
    //var evt = document.createEvent("HTMLEvents");
    //evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错, 感谢 Barret Lee 的反馈
    aLink.download = fileName;//虽然这个但主要还是应该另存为
    aLink.href = URL.createObjectURL(blob);
    //aLink.dispatchEvent(evt);
}


function draw_line(map_el,x1,y1,x2,y2){
		//console.log(x1,y1,x2,y2);
		var dx=x2-x1;
		var dy=y2-y1;
		var dd=Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
		var cos_n=dx/dd;
		var sin_n=dy/dd;
		var pi=Math.PI;
		if (dy>0){
			var cos_c=Math.acos(cos_n);
			var sin_c=Math.asin(sin_n);
		}
		else{
			var cos_c=pi+pi-Math.acos(cos_n);
			var sin_c=pi+pi-Math.asin(sin_n)+pi;
		}
		var cos_d=cos_c/(2*pi)*360;
		var sin_d=sin_c/(2*pi)*360;
		var degree=cos_d;
		//console.log(degree);
		var x3=(x1+x2)/2-dd/2;
		var y3=(y1+y2)/2;
		var line=$("<div class='line' style='left: "+(x3)+"px; top: "+(y3)+"px;'></div>");
		line.css({width:dd,height:5,position:"absolute",transform:"rotate("+degree+"deg)","background-color":"rgb(150,200,150)"});
		map_el.append(line);
		//Crafty的旋转是从出发点旋转的，CSS的是从中心旋转的，都用的角度

		return line;
}

function draw_zone(map_el,x,y,w,h){
		var cell=$("<div class='zone' style='left: "+(x)+"px; top: "+(y)+"px;'></div>");
		cell.css({width:w,height:h,"background-color":"rgb(0,0,0)",position:"absolute"});
		map_el.append(cell);
		return cell;
}
function draw_text(map_el,x,y,w,h,s){
		var cell=$("<div class='text' style='left: "+(x)+"px; top: "+(y)+"px;'>"+s+"</div>");
		cell.css({width:w,height:h,position:"absolute"});
		map_el.append(cell);
		return cell
}
function draw_zone_snr(map_el,zone){
		var x=zone.x*map_percent_x+x_transform;
		var y=zone.y*map_percent_y+y_transform;
		var w=cellW;
		var h=cellH;
	    var zone_el = draw_zone(map_el, x, y, w, h);
		var text1=draw_text(map_el,x,y+h,w*2,h,side_d[zone.side].name);
		var text2=draw_text(map_el,x,y-18,w*2,h,zone.name);
		return [zone_el,text1,text2];
}


function zone_change(zone_id,side_id){
	var zone=zone_d[zone_id];
	zone.side=side_id;
	var side_name_el=$('div #'+zone_id+' + div');
	side_name_el.html(side_d[side_id].name);
	zone_color_reshresh();
	zone_number_refresh();
}
function boxShift(show_class,sub_class){
		$('.oneShow').hide();
		$('.'+show_class).show();
		$('.'+sub_class).show();//除了主box的显示外，主box下还可以按照这些方法进行显示
}
function focus_player(){
	zone_l.forEach(function(zone){
		if (isFriend(zone.side)){
			scrollTo(zone.x_el-200,zone.y_el-200);
			return;
		}
	})
}

//地区点击事件测试版
function zone_click0(){//这个版本只是显示地区将领数量，
	map_el.hide();
	var leader_id_l=zone_d[Number(this.id)].leader;
	var leader_en_l=[];
	for (var i=0;i<leader_id_l.length;i++){
		leader_en_l.push(leader_d[leader_id_l[i]]);
	}
	show_leader(leader_en_l);
	console.log(this);
	console.log(leader_id_l);
}
function zone_click(){//外接口方法，用于取得引用。
	click_box.click_zone(this);
}
function showBoxButtonHandel(){
	map_el.show();
}

function Weight(){
	//this.element=$('#assign');
	this.state='hidden';//取show或hidden
	this.last_location=[0,0];
	this.show=function(x,y){
		this.state='show';
		this.element.show();
		this.element.css({left:x,top:y});
		this.last_location=[x,y];
	}
	this.hidden=function(){
		this.state='hidden';
		this.element.hide();
	}
	this.hide=function(){
		this.hidden();
	}
	this.turn=function(){
		if (this.state=='hidden'){
			this.show(this.last_location[0],this.last_location[1]);
		}
		else{
			this.hidden();
		}
	}
}
function Weight_choose(){
	this.element=$('#choose');
	Weight.call(this);
	
	this.activate=function(zone){
		this.last_zone=zone;
		console.log('activate');
	}
	var assign_a=$('#assign_a');
	var transport_a=$('#transport_a');
	var that=this;
	this.assign_do=function(){
		that.hidden();
		weight_assign.show(that.last_location[0],that.last_location[1]);
		weight_assign.activate(that.last_zone);
	};
	assign_a.on('click',this.assign_do);
	this.transport_do=function(){
		that.hidden();
		click_box.state='transport';
	}
	transport_a.on('click',this.transport_do);
}
function Weight_choose_e(){
	var that=this;
	this.element=$('#choose_e');
	Weight.call(this);
	
	var battle_a=$('#battle_a');
	var bliz_a=$('#bliz_a');
	
	this.activate=function(zone,state){
		this.last_zone=zone;
		console.log('activate');
		switch(state){
			case 'battle':
				battle_a.show();
				bliz_a.hide();
				break;
			case 'bliz':
				battle_a.hide();
				bliz_a.show();
				break;
		}
	}

	this.battle_do=function(){
		that.hidden();
		//weight_assign.show(that.last_location[0],that.last_location[1]);
		//weight_assign.activate(zone);
		battle_cal(that.last_zone.id);
		screen_update();
	};
	this.bliz_do=function(){
		that.hidden();
		var tl=[];
		side_l.forEach(function(side){
			if (that.last_zone.total_strength(side.id)!==0){
				tl.push(side.id);
			}
		})
		that.last_zone.side=tl[0];
		screen_update();
	}
	battle_a.on('click',this.battle_do);
	bliz_a.on('click',this.bliz_do);
}
function Weight_assign(){
	this.element=$('#assign');
	Weight.call(this);
	
	this.slide=$('#slide_range');
	this.confirm=$('#confirm');
	this.value=0;
	this.range=0;
	this.value_history=[];
	var that=this;
	this.slider=null;
	this.activate=function(zone){
		this.last_zone=zone;
		this.range=zone.move_able();
		/*
		$( "#slider-range" ).slider({
			  range: "max",
			  min: 0,
			  max: that.range,
			  value: 0,
			  slide: function( event, ui ) {
					$( "#amount" ).val( ui.value );
					//this.value=ui.value;
					//this.value_history.push(ui.value);
			}
		});
		*/
		that.slider=slider($( "#slider-range" ),{
			  range: "max",
			  min: 0,
			  max: that.range,
			  value: 0,
			  slide: function( event, ui ) {
					$( "#amount" ).val( ui.value );
					//this.value=ui.value;
					//this.value_history.push(ui.value);
			}
		});
		//$( "#amount" ).val( $( "#slider-range-max" ).slider( "value" ) );
		$( "#amount" ).val(that.value );
		console.log('weight_assign activate end');
	}
	this.get_value=function(){
		return that.slider.value;
		//return $( "#slider-range" ).slider( "value" );
		//return this.slide.slider("value");
	};
	var that=this;
	this.confirm_do=function(){
		that.hidden();
		console.log('This should run the move attack handle');
		click_box.state='attacking';
		
	}
	this.confirm.on('click',this.confirm_do);
}
function Weight_side_chooser(){
	this.element=$('#side_chooser');
	Weight.call(this);
	var el=this.element;
	var that=this;
	var activated=false;
	this.activate=function(){
		if (!(activated)){
			side_l.forEach(function(side){
				//var el_a=el.append('<a>'+side.name+'</a>');
				var el_a=$('<a>'+side.name+'</a>').appendTo(el);
				//console.log(el_a);
				el.append('<br>');
				el_a.on('click',function(side){
					return function(){
							//console.log('side');
							//console.log(side);
							player_side=side.id;
							player_side_list=[player_side];
							screen_update();
							that.element.hide();};
				}(side));
			});
			activated=true;
		}
	}
	//el.append('')
}
function Toolbox(){
	var next_turn_a=$('#next_turn_a');
	var save_load_a=$('#save_load_a');
	var save_load_div=$('#save_load_div');
	var save_a=$('#save_a');
	var load_input=$('#load_input');
	var load_a=$('#load_a');
	var fold_a=$('#fold_a');
	var tend_a=$('#tend_a');
	var tend_fold_a=$('#tend_fold_a');
	var tend_div=$('#tend_div');
	var change_side_a=$('#change_side_a');
	var resize_a=$('#resize_a');
	var scenario_chooser_div=$('#scenario_chooser_div');
	var scenario_chooser_a=$('scenario_chooser_a');
	var focus_a=$('#focus_a');
	next_turn_a.on('click',next_turn);
	var that=this;
	tend_div.hide();
	change_side_a.on('click',function(){
		side_chooser.activate();
		side_chooser.show();
	})
	function save_obj(){
		//目前看来变了的只有zone的一些属性，strengths以及side,基本上可以在载入源文件后再读入此文件完成加载
		var modify={};
		zone_l.forEach(function(zone){
			modify[zone.id]={};
			modify[zone.id].strengths=zone.strengths;
			modify[zone.id].id=zone.id;
			modify[zone.id].side=zone.side;
			modify[zone.id].trans_to=zone.trans_to;
		})
		return modify;
	}
	function save_activate(){
		var obj=save_obj()
		downloadFileLink(save_a[0],'auto_save.json',JSON.stringify(obj));
	}
	function load_obj(modify){
		zone_l.forEach(function(zone){
			//modify[zone.id]={};
			zone_d[zone.id].strengths=modify[zone.id].strengths;
			//zone_d[zone.id].id=zone.id;
			zone_d[zone.id].side=modify[zone.id].side;
			zone_d[zone.id].trans_to=modify[zone.id].trans_to;
		})
		screen_update();
	}
	tend_a.on('click',function(){
		tend_div.show();
		tend_a.hide();
	})
	tend_fold_a.on('click',function(){
		tend_div.hide();
		tend_a.show();
	})
	load_a.on('click',function(){
			var source=load_input[0];//var source=load_input;
			var file = source.files[0];
			if(window.FileReader) {
				var fr = new FileReader();
				fr.onloadend = function(e) {
					//document.getElementById("portrait").src = e.target.result;
					load_obj(JSON.parse(e.target.result));
				};
				//fr.readAsDataURL(file);
				fr.readAsText(file)
			}
	})
	save_load_div.hide();
	save_load_a.on('click',function(){
		save_load_div.show();
		save_load_a.hide();
		save_activate();
	});
	fold_a.on('click',function(){
		save_load_div.hide();
		save_load_a.show();
	});
	resize_a.on('click',function(){
		auto_resize();
		UI_init();
	})
	//save_load_a.on('click',save_activate);
	scenario_chooser_div.hide();
	focus_a.on('click',function(){
		zone_l.forEach(function(zone){
			if (isFriend(zone.side)){
				scrollTo(zone.x_el-200,zone.y_el-200);
				return;
			}
		})
	})
}
function Class_click_control(){
	//控制器的各个函数是调用的入口，本身可以看成有限状态机的输入，（之前）状态由对象内部保持，还应保持一个前select属性。
	//除了这个属性以外就应该以调用对应函数作为对应输入的逻辑实现成有限状态机。
	//状态:初始start,已选择己方区域selected,
	this.state='start';
	//this.select_last=null;
	this.select_history=[];

	this.click_zone=function (zone_el) {
		//响应地区选择的入口函数，处理
		//var zone_id = Number(zone_el.id);
		var zone_id=zone_el.id;
		var zone = zone_d[zone_id];
		var last_zone=this.select_history[this.select_history.length-1];

		console.log(zone);
		console.log(zone.id);
		console.log(this.state);

		switch(this.state){
			case 'start':
				
				//this.showZoneLeader(zone);
				this.select_last=zone;
				if (isFriend(zone.side)) {
					weight_choose.show(zone.element.css('left'),zone.element.css('top'));
					weight_choose.activate(zone);
					this.state = 'wait';//如果在选择地区命令时又选择地区就是wait情况，即重置
					
				}
				else{
					//this.state='selecting_enemy';
					if (is_conflict(zone.id)){
						weight_choose_e.activate(zone,'battle');
						weight_choose_e.show(zone.element.css('left'),zone.element.css('top'));
					}
					else if (is_bliz(zone.id)){
						weight_choose_e.activate(zone,'bliz');
						weight_choose_e.show(zone.element.css('left'),zone.element.css('top'));						
					}
					this.state='start';
				}
				break;
				
				console.log(this);
				break;
			case 'wait':
				weight_assign.hidden();
				weight_choose.hidden();
				weight_choose_e.hidden();
				this.state='start';
				break;
			case 'attacking':
				army_move(last_zone.id,zone.id,weight_assign.get_value(),last_zone.side);
				this.state='start';
				break;
			case 'transport':
				last_zone.trans_to=zone.id;//这里不输送没有特殊值标记，就是指向自己就表示不输送，这个之后逻辑处理
				this.state='start';
				break;
		}
		this.select_history.push(zone);
		screen_update();
	};
}

function army_move(source_id,target_id,num,side){
	var source=zone_d[source_id];
	var target=zone_d[target_id];
	source.strengths[side][1]-=num;
	target.strengths[side][0]+=num;
}
function lancheste(M,N,a,b){
	//a*(M^2-m(t)^2=b*(N^2)-n(t)^2)
	var t1,t2;
	t1=Math.pow(M,2)-(b/a)*Math.pow(N,2);
	t2=Math.pow(N,2)-(a/b)*Math.pow(M,2);
	if(t1>0){
		return [Math.sqrt(t1),0];
	}
	else if(t2>0){
		return [0,Math.sqrt(t2)];
	}
	else{
		return [0,0];
	}
}
function battle_cal(zone_id){
	var zone=zone_d[zone_id];
	var sides=[];
	if (is_bliz(zone_id)){
		occupy(zone_id);
		return;
	}
	side_l.forEach(function(side){
		if (zone.total_strength(side.id)!==0){
			sides.push(side.id);
		}
	});
	var attacker,defender;
	defender=zone.side;
	attacker=other(sides,defender);
	var atk_s,def_s;
	atk_s=zone.total_strength(attacker);
	def_s=zone.total_strength(defender);
	var r=lancheste(atk_s,def_s,1,1);
	zone.strengths[attacker][0]=int(r[0]);
	zone.strengths[defender][0]=int(r[1]);
	zone.strengths[attacker][1]=0;
	zone.strengths[defender][1]=0;
	if (r[0]>0){
		zone.side=attacker;
	}
	zone.fighted=true;
	screen_update();
	//assert sides.lengths===2
}
function occupy(zone_id){
		var zone=zone_d[zone_id];
		var tl=[];
		side_l.forEach(function(side){
			if (zone.total_strength(side.id)!==0){
				tl.push(side.id);
			}
		})
		zone.side=tl[0];
		zone.fighted=true;
		screen_update();
}


function nature_update(){
	zone_l.forEach(function(zone){
		zone.fighted=false;
		zone.strengths[zone.side][1]+=1;
		zone.strengths[zone.side][1]+=zone.strengths[zone.side][0];
		zone.strengths[zone.side][0]=0;
	})
	zone_l.forEach(function(zone){
		if (zone.trans_to!==zone.id && side_d[zone.side].is_friendly(zone.trans_to) 
			&& side_d[player_side].is_friendly(zone.id)){
			army_move(zone.id,zone.trans_to,zone.move_able(),zone.side);
		}
	})
}
function next_turn(){
	nature_update();
	//AI_run();
	AI_run2();
	screen_update();
}
function is_conflict(zone_id){
	var zone=zone_d[zone_id];
	var al=[];
	side_l.forEach(function(side){
		if(zone.total_strength(side.id)!==0){
			al.push(side.id);
		}
	})
	if (al.length>1){
		return true;
	}
	else{
		return false;
	}
}
function is_bliz(zone_id){
	var zone=zone_d[zone_id];
	var al=[];
	side_l.forEach(function(side){
		if(zone.total_strength(side.id)!==0){
			al.push(side.id);
		}
	})
	//assert 
	if (al.length===1 && al[0]!==zone.side){
		return true;
	}
	else{
		return false;
	}
}


function zone_color_reshresh(){
	for(var i=0;i<zone_l.length;i++) {
		var zone = zone_l[i];
		var zone_el = zone.element;
		if (isFriend((zone.side))) {
			zone_el.css({"background-color": "rgb(100,100,200)"});
		}
		else if(side_d[player_side].is_friendly(zone.id)){
			zone_el.css({"background-color": "rgb(100,200,100)"});
		}
		else {
			zone_el.css({"background-color": "rgb(200,100,100)"});
		}
	}
}
function zone_number_refresh(){
	/*
	for(var i=0;i<zone_l.length;i++){
		var zone=zone_l[i];
		//var zone_id=zone.id;
		var el=$('#'+zone.id);
		el.html(zone.strength());
		el.css({'font-size':'16px','text-align':'center','line-height':'45px'});
	}
	*/
	zone_l.forEach(function(zone){
		zone.element.html(zone.strength());
		zone.element.css({'font-size':'16px','text-align':'center','line-height':'45px'});
	})
}
function zone_side_refresh(){
	zone_l.forEach(function(zone){
		zone.element_text1.html(side_d[zone.side].name);
	})
}
function screen_update(){
	zone_color_reshresh();
	zone_number_refresh();
	zone_side_refresh();
}
function isFriend(side_id){
	return member(side_id,player_side_list) || side_id === player_side;
	//return side_d[player_side].diplomacy[side_id]!==0;
}


function UI_init(){
	//此函数用于完全UI重置，利用的是全局变量而不是参数。
	//auto_resize();
	map_el.empty();
	//绘制区域与文字
	zone_l.forEach(function(zone){
		var els=draw_zone_snr(map_el,zone);
		var zone_e=els[0];
		var text1=els[1];
		var text2=els[2];
		zone.element=zone_e;
		zone.element_text1=text1;
		zone.element_text2=text2;
		zone.x_el=zone.x*map_percent_x+x_transform;
		zone.y_el=zone.y*map_percent_y+y_transform;
		//新元素绑定实体
		//zone_el_d[zone.id]=zone_e;
		zone_e.click(zone_click);
		zone_e.attr({'id':zone.id});
	});
	//绘制道路
	link_l.forEach(function(link){
		var in_zone=zone_d[link.in];
		var out_zone=zone_d[link.out];
		var x1,y1,x2,y2;
		x1=in_zone.x_el+cellW/2;
		y1=in_zone.y_el+cellH/2;
		x2=out_zone.x_el+cellW/2;
		y2=out_zone.y_el+cellH/2;
		draw_line(map_el,x1,y1,x2,y2);
	});
	screen_update();
}

var leader_l,zone_l,link_l,side_l,zone_d,side_d,leader_d;
function global_init(){
	var big_dic=SNR_script;
	//console.log(big_dic.side);
	leader_l=big_dic.people;
	zone_l=big_dic.zone;
	link_l=big_dic.link;
	side_l=big_dic.side;
	zone_d=id_dic_by_list(zone_l);
	side_d=id_dic_by_list(side_l);
	leader_d=id_dic_by_list(leader_l);
	
	player_side=side_l[0].id;
	player_side_list=[player_side];
}

function enhance_init(){
	for (var i=0;i<zone_l.length;i++){
		var zone=zone_l[i];
		zone.strengths={};
		side_l.forEach(function(side){
			zone.strengths[side.id]={0:0,1:0};//即有1移动力和有0移动力的单位数量的区别映射
		})
		//zone.strengths[side_d[zone.side].id][1]=int(random.random()*10);
		zone.move_able=function(){//strength现在逻辑改为可战斗单位数量
			return this.strengths[this.side][1];
		};
		zone.total_strength=function(side_id){
			var s=0;
			for (var i in this.strengths[side_id]){
				s+=this.strengths[side_id][i];
			}
			return s;
		}
		zone.strength=function(){//strength现在逻辑改为可战斗单位数量
			return this.total_strength(this.side);
		};
		zone.nei=[];//虽然有个link属性但那货不好用
		zone.fighted=false;
		zone.trans_to=zone.id;//默认不输送
	}
	//画线,注意CSS里的旋转是绕中心旋转,还对zone增加其nei属性
	for (var i=0;i<link_l.length;i++){
		var link=link_l[i]
		var in_zone=zone_d[link.in];
		var out_zone=zone_d[link.out];
		in_zone.nei.push(link.out);
		out_zone.nei.push(link.in);
	}
	for (var i=0;i<side_l.length;i++){
		var side=side_l[i];
		side.diplomacy={};
		for(var j=0;j<side_l.length;j++){
			side.diplomacy[side_l[j].id]=0;//0表示敌对，1表示友好，2表示是自己
			side.diplomacy[side.id]=2;
		}
		side.is_friendly=function(zone_id){//这个是判定区域友好与	否的方法

			return this.diplomacy[zone_d[zone_id].side] !==0 ;
		}
	}
}

function random_setup(){
	zone_l.forEach(function(zone){
		zone.strengths[side_d[zone.side].id][1]=int(random.random()*10);
	})
}
function attr_setup(attr){
	zone_l.forEach(function(zone){
		zone.strengths[side_d[zone.side].id][1]=zone[attr]//int(random.random()*10);
	})
}

var resize_percent=70;
function auto_resize(){
	var dl=[];
	zone_l.forEach(function(zone1){
		zone_l.forEach(function(zone2){
			var dis=Math.sqrt(Math.pow((zone1.x-zone2.x),2)+Math.pow((zone1.y-zone2.y),2));
			if (zone1.id!=zone2.id && dis>1){
				dl.push(dis);
			}
		})
	})
	var min_dis=min(dl);
	map_percent_x=resize_percent/min_dis;
	map_percent_y=resize_percent/min_dis;
	
}
function parseParam(){
	var url=location.search; 
	var Request = new Object(); 
	if(url.indexOf("?")!=-1) { 
		var str = url.substr(1) //去掉?号 
		strs = str.split("&"); 
	for(var i=0;i<strs.length;i++) { 
		Request[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]); 
	} 
	} 
	return Request;
}
function loadScript(newJS){
		var scriptObj = document.createElement("script"); 
		scriptObj.src=newJS;
		document.getElementsByTagName("html")[0].appendChild(scriptObj);
}
/** 
 * 串联加载指定的脚本
 * 串联加载[异步]逐个加载，每个加载完成后加载下一个
 * 全部加载完成后执行回调
 * @param array|string 指定的脚本们
 * @param function 成功后回调的函数
 * @return array 所有生成的脚本元素对象数组
 */

function seriesLoadScripts(scripts,callback) {
   if(typeof(scripts) != "object") var scripts = [scripts];
   var HEAD = document.getElementsByTagName("head").item(0) || document.documentElement;
   var s = new Array(), last = scripts.length - 1, recursiveLoad = function(i) {  //递归
       s[i] = document.createElement("script");
       s[i].setAttribute("type","text/javascript");
       s[i].onload = s[i].onreadystatechange = function() { //Attach handlers for all browsers
           if(!/*@cc_on!@*/0 || this.readyState == "loaded" || this.readyState == "complete") {
               this.onload = this.onreadystatechange = null; this.parentNode.removeChild(this); 
               if(i != last) recursiveLoad(i + 1); else if(typeof(callback) == "function") callback();
           }
       }
       s[i].setAttribute("src",scripts[i]);
       HEAD.appendChild(s[i]);
   };
   recursiveLoad(0);
}

function reload(dir){
	//var scen_el=$('#SNRscript');
	//scen_el.attr('src',dir);
	//$('<script src="'+dir+'"></script>').appendTo($('body'));
	//var scen_el= document.getElementById("SNRscript");
	//scen_el.src=dir;//貌似直接在那个位置改src并不会引起重新加载，jQeury和dom都不行。而创建新dom对于jQuery会出跨域错误，dom不会
	//loadScript(dir);
	seriesLoadScripts([dir],setup);
}
function setup(){
	global_init();
	enhance_init();
	//auto_resize();
	UI_init();
	random_setup();
	focus_player();

	screen_update();
	boxShift('mapBox');
}

click_box=new Class_click_control();
weight_choose=new Weight_choose();
weight_assign=new Weight_assign();
weight_choose_e=new Weight_choose_e();
toolbox=new Toolbox();
side_chooser=new Weight_side_chooser();

weight_assign.hidden();
weight_choose.hidden();
weight_choose_e.hidden();//hidden是Weight的方法，jQuery是hide，Weight也有hide.


var map_el = $('#map');
var cellW=50;
var cellH=50;
var x=3;
var y=3;
//地图缩放常数
map_percent_x=0.07;
map_percent_y=0.07;
x_transform=100;
y_transform=0;

params=parseParam();
if (params["scenario"]){
	reload(params["scenario"]);
}
else{
	setup();
}
//setup();