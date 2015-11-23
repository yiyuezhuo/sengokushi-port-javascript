pi=3.1415926;
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

function draw_line(map_el,x1,y1,x2,y2){
				//console.log(x1,y1,x2,y2);
  			var dx=x2-x1;
  			var dy=y2-y1;
  			var dd=Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
  			var cos_n=dx/dd;
  			var sin_n=dy/dd;
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
		var x=zone.x*map_percent_x;
		var y=zone.y*map_percent_y;
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
	var that=this;
	this.assign_do=function(){
		that.hidden();
		weight_assign.show(that.last_location[0],that.last_location[1]);
		weight_assign.activate(that.last_zone);
	};
	assign_a.on('click',this.assign_do);
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
			if (that.last_zone.strengths[side.id]!==0){
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
	this.activate=function(zone){
		this.last_zone=zone;
		this.range=zone.strength();
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
		$( "#amount" ).val( $( "#slider-range-max" ).slider( "value" ) );
		console.log('weight_assign activate end');
	}
	this.get_value=function(){
		return $( "#slider-range" ).slider( "value" );
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
function Class_click_control(){
	//控制器的各个函数是调用的入口，本身可以看成有限状态机的输入，（之前）状态由对象内部保持，还应保持一个前select属性。
	//除了这个属性以外就应该以调用对应函数作为对应输入的逻辑实现成有限状态机。
	//状态:初始start,已选择己方区域selected,
	this.state='start';
	//this.select_last=null;
	this.select_history=[];

	this.click_zone=function (zone_el) {
		//响应地区选择的入口函数，处理
		var zone_id = Number(zone_el.id);
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
		}
		this.select_history.push(zone);
		screen_update();
	};
}

function army_move(source_id,target_id,number,side){
	var source=zone_d[source_id];
	var target=zone_d[target_id];
	source.strengths[side]-=number;
	target.strengths[side]+=number;
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
		if (zone.strengths[side.id]!==0){
			sides.push(side.id);
		}
	});
	var attacker,defender;
	defender=zone.side;
	attacker=other(sides,defender);
	var atk_s,def_s;
	atk_s=zone.strengths[attacker];
	def_s=zone.strengths[defender];
	var r=lancheste(atk_s,def_s,1,1);
	zone.strengths[attacker]=int(r[0]);
	zone.strengths[defender]=int(r[1]);
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
			if (zone.strengths[side.id]!==0){
				tl.push(side.id);
			}
		})
		zone.side=tl[0];
		zone.fighted=true;
		screen_update();
}

function AI(side_id){
	zone_l.forEach(function(zone){
		if(zone.side===side_id && !zone.fighted)
		{
			var el=[];//敌方区域
			var fl=[];//右方区域
			var al=[];//可攻击区域
			zone.nei.forEach(function(nei_id){
				var nei=zone_d[nei_id];
				if ((nei.side)===side_id){
					fl.push(nei);
				}
				else{
					el.push(nei);
					if (nei.strength()<zone.strength()){
						al.push(nei);
					}
				}
			});
			if (al.length===0 && fl.length!==0){
				var target=random.choose(fl)//zone_d[random.choose(fl)];
				army_move(zone.id,target.id,zone.strength(),zone.side);
			}
			else if(al.length!==0){
				var target=random.choose(al)//zone_d[random.choose(al)];
				army_move(zone.id,target.id,zone.strength(),zone.side);
				battle_cal(target.id);
			}
			else if (al.length===0 && fl.length===0){
				console.log('I am hard to do anything!');
			}
		}
	})
}
function AI_run(){
	side_l.forEach(function(side){
		if (!(isFriend(side.id))){
			AI(side.id);
		}
	});
}
function nature_update(){
	zone_l.forEach(function(zone){
		zone.fighted=false;
		zone.strengths[zone.side]+=1;
	})
}
function next_turn(){
	nature_update();
	AI_run();
}
function is_conflict(zone_id){
	var zone=zone_d[zone_id];
	var al=[];
	side_l.forEach(function(side){
		if(zone.strengths[side.id]!==0){
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
		if(zone.strengths[side.id]!==0){
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
			zone_el.css({"background-color": "rgb(50,200,50)"});
		}
		else {
			zone_el.css({"background-color": "rgb(200,50,50)"});
		}
	}
}
function zone_number_refresh(){
	for(var i=0;i<zone_l.length;i++){
		var zone=zone_l[i];
		//var zone_id=zone.id;
		var el=$('#'+zone.id);
		el.html(zone.strength());
		el.css({'font-size':'16px','text-align':'center','line-height':'45px'});
	}
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
}




click_box=new Class_click_control();
weight_choose=new Weight_choose();
weight_assign=new Weight_assign();
weight_choose_e=new Weight_choose_e();



var map_el = $('#map');
//map_el.draggable();
//map_el.css({width:'3000px',height:'1500px'});
//map_el.dblclick(function(){boxShift('messageBox')});
var cellW=50;
var cellH=50;
var x=3;
var y=3;

map_el.css({"background-color":"rgb(200,200,200)"});
var zone_z_index=3;
var line_z_index=zone_z_index-1;

//这段没解耦好，要同时修改两个地方比较蛋疼。
//big_dic=MiniWorldWar2_data;
//big_dic=Europe1805_data;
big_dic=SNR_script;

leader_l=big_dic.people;
zone_l=big_dic.zone;
link_l=big_dic.link;
side_l=big_dic.side;
zone_d=id_dic_by_list(zone_l);
side_d=id_dic_by_list(side_l);
leader_d=id_dic_by_list(leader_l);
//地图缩放常数
map_percent_x=0.05;
map_percent_y=0.05;
//圆周率常数
pi=Math.PI;

player_side=8;
player_side_list=[8];

zone_el_d={};
//画区域同时加强定义
for (var i=0;i<zone_l.length;i++){
	var zone=zone_l[i];

	var els=draw_zone_snr(map_el,zone);
	var zone_e=els[0];
	var text1=els[1];
	var text2=els[2];
	zone.element=zone_e;
	zone.element_text1=text1;
	zone.element_text2=text2;
	zone.x_el=zone.x*map_percent_x;
	zone.y_el=zone.y*map_percent_y;
	//zone.leader=[];
	zone.strengths={};
	side_l.forEach(function(side){
		zone.strengths[side.id]=0;
	})
	zone.strengths[side_d[zone.side].id]=int(random.random()*10);
	zone.strength=function(){
		return this.strengths[this.side];
	};
	zone.nei=[];//虽然有个link属性但那货不好用
	zone_el_d[zone.id]=zone_e;
	zone_e.click(zone_click);
	//zone_e.click(click_box.click_zone);
	zone_e.attr({'id':zone.id});
	zone.fighted=false;
}
//画线,注意CSS里的旋转是绕中心旋转,还对zone增加其nei属性
for (var i=0;i<link_l.length;i++){
	//if (i>3) break;
	var link=link_l[i]
	var in_zone=zone_d[link.in];
	var out_zone=zone_d[link.out];
	var x1,y1,x2,y2;
	x1=in_zone.x_el+cellW/2;
	y1=in_zone.y_el+cellH/2;
	x2=out_zone.x_el+cellW/2;
	y2=out_zone.y_el+cellH/2;
	draw_line(map_el,x1,y1,x2,y2);
	//增加属性部分
	in_zone.nei.push(link.out);
	out_zone.nei.push(link.in);

}

zone_color_reshresh();
zone_number_refresh();

boxShift('mapBox');
weight_assign.hidden();
weight_choose.hidden();
weight_choose_e.hidden();