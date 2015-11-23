pi=3.1415926;

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
		draw_text(map_el,x,y+h,w*2,h,side_d[zone.side].name);
		draw_text(map_el,x,y-15,w*2,h,zone.name);
		return zone_el;
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
function Class_click_control(){
	//控制器的各个函数是调用的入口，本身可以看成有限状态机的输入，（之前）状态由对象内部保持，还应保持一个前select属性。
	//除了这个属性以外就应该以调用对应函数作为对应输入的逻辑实现成有限状态机。
	//状态:初始start,已选择己方区域selected,
	this.state='start';
	this.select_last=null;

	this.click_zone=function (zone_el) {
		//响应地区选择的入口函数，处理
		var zone_id = Number(zone_el.id);
		var zone = zone_d[zone_id];

		console.log(zone);

		switch(this.state){
			case 'selected':
				if (isFriend(zone.side)) {
					this.move(zone);
					this.select_last = zone;
					this.state = 'start';
				}
				else{
					this.attack_move(zone);
					this.select_last=zone;
					this.state='start';
				}
				break;
			case 'start':
				/*
				this.showZoneLeader(zone);
				this.select_last=zone;
				if (isFriend(zone.side)) {
					this.state = 'selecting_friend';//ing状态一般是交由之后的按钮继续处理，在一次处理结束时不应有ing状态。
				}
				else{
					this.state='selecting_enemy';
				}
				break;
				*/
				console.log(this);
				break;
		}
	};

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
		el.html(zone.strength);
		el.css({'font-size':'16px','text-align':'center','line-height':'45px'});
	}
}
function screen_update(){
	zone_color_reshresh();
	zone_number_refresh();
}
function isFriend(side_id){
	return member(side_id,player_side_list) || side_id === player_side;
}




click_box=new Class_click_control();



var map_el = $('#map');
//map_el.draggable();
//map_el.css({width:'3000px',height:'1500px'});
map_el.dblclick(function(){boxShift('messageBox')});
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
map_percent_x=0.06;
map_percent_y=0.06;
//圆周率常数
pi=Math.PI;

player_side=8;
player_side_list=[8];

zone_el_d={};
//画区域同时加强定义
for (var i=0;i<zone_l.length;i++){
	var zone=zone_l[i];

	var zone_e=draw_zone_snr(map_el,zone);
	zone.element=zone_e;
	zone.x_el=zone.x*map_percent_x;
	zone.y_el=zone.y*map_percent_y;
	//zone.leader=[];
	zone.strength=0;
	zone.nei=[];//虽然有个link属性但那货不好用
	zone_el_d[zone.id]=zone_e;
	zone_e.click(zone_click);
	//zone_e.click(click_box.click_zone);
	zone_e.attr({'id':zone.id});
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