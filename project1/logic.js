/*
logic.js

remove
id_dic_by_list
draw_line
draw_zone
draw_text
draw_zone_snr
show_leader_setup
show_leader
move_leader
boxShift
zone_click0
zone_click
showBoxButtonHandel
Class_click_control
*/


pi=3.1415926;

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
function show_leader_setup(){
	//注意这里用它官方写法中途出现空列表没关系，反正写过去不出其他错就没问题，注意draw才会将更新在页面上显示出来
  	var table=$("#showTable").DataTable({
  			data:[],
  			columns:[
  					{data:'name',title:TEXT.nameText},
  					{data:'cav',title:TEXT.cavText},
					{data:'inf',title:TEXT.infText},
  					{data:'art',title:TEXT.artText},
  					{data:'force',title:TEXT.forceText},
  					{data:'IQ',title:TEXT.IQText},
  					{data:'policy',title:TEXT.policyText},
  					{data:'army',title:TEXT.armyText},
  					{data:'navy',title:TEXT.navyText},
					{data:'side_name',title:TEXT.side_nameText}
  			],
  			select: {
            style: 'multi'
			},
        scrollY: 400
  	})
  	return table;
}
function show_leader(data){
		var table=$('#showTable').DataTable();
		table.clear();
		table.rows.add(data);
		table.draw();
		return table;
}
function move_leader(leader_id,zone_id){
		var leader=leader_d[leader_id];
		var zone_to=zone_d[zone_id];
		var zone_from=zone_d[leader.zone];
		remove(zone_from.leader,leader_id);
		zone_to.leader.push(leader_id);
		leader.zone=zone_id;
}
function remove_leader(leader_id){
	var leader=leader_d[leader_id];
	remove(zone_d[leader.zone].leader,leader_id);
	leader.zone=null;
	//leader.caught=true;//现在移除（由于只能因为围歼引起）就当做抓住了
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
				this.showZoneLeader(zone);
				this.select_last=zone;
				if (isFriend(zone.side)) {
					this.state = 'selecting_friend';//ing状态一般是交由之后的按钮继续处理，在一次处理结束时不应有ing状态。
				}
				else{
					this.state='selecting_enemy';
				}
				break;
		}
		/*
		if (this.state == 'move_do')
			this.move(zone);
		else if (this.state == 'move_ready')
			boxShift('showBox');
		*/

	};

	this.move=function(zone){
		//这个不是响应函数，只是一个执行方法
		var table=$('#showTable').DataTable();
		var td_total=table.data();
		var td=table.rows({selected:true});
		//console.log('data',table.data(),table.data().length);
		//console.log('selected rows',table.rows({selected:true}),td.length);
		for (var i=0;i<td[0].length;i++){
			//var leader=td[i];
			var leader=td_total[td[0][i]];
			move_leader(leader.id,zone.id);
		}
		//this.state='move_ready';
		console.log(this);
		console.log('move');
	};
	this.attack_move=function(zone){
		this.move(zone);
		console.log('but this is a attack move ever it do move action as well');
	};
	this.showZoneLeader=function(zone){
		//这是显示Leader的执行方法
		var leader_id_l = zone.leader;
		var leader_en_l = [];
		for (var i = 0; i < leader_id_l.length; i++) {
			leader_en_l.push(leader_d[leader_id_l[i]]);
		}
		show_leader(leader_en_l);
		$('#showBoxButton3').hide();
		$('#showBoxButton4').hide();
		if (isConflict(zone.id)){
			$('#showBoxButton3').show();
			//$('#showBoxButton3').hide();
		}
		else{
			if (isBliz(zone.id)){
				$('#showBoxButton4').show();
			}
		}
		//this.state='start';
		boxShift('showBox','battle_check');
	};

	this.cancel=function(){
		//将领选择区的cancel的响应
		boxShift('mapBox');
		this.state='start';
		console.log('cancel');
	};

	this.ok=function() {
		//将领选择区的ok的响应
		switch(this.state) {
			case 'selecting_friend':
				boxShift('mapBox');
				this.state = 'selected';
				console.log('ok_select');
				break;
			case 'selecting_enemy':
				boxShift('mapBox');
				this.state='start';
				console.log('ok_obs');
				break;
			case 'selecting_caught':
				boxShift('mapBox');
				this.state='start';
				console.log('caught ok');
				break;
		}
	};
	/*
	this.fight=function(){
		var zone=this.select_last;
		var leaderList=zone.leader.map(function(leader_id){return leader_d[leader_id];});
		var groupList=groupby(leaderList,'side');
		var Alist=groupList[0].map(function(leader){return leader.id;});
		var Blist=groupList[1].map(function(leader){return leader.id;});
		var rr=fightToRouted(Alist,Blist);
		//leader_withdraw_zone_side
		var withDrawSide,vicSide;
		if (rr.result==='Avic'){
			withDrawSide=groupList[1][0].side;
			vicSide=groupList[0][0].side;
		}
		else{
			withDrawSide=groupList[0][0].side;
			vicSide=groupList[1][0].side;
		}
		leader_withdraw_zone_side(zone.id,withDrawSide,vicSide);
		zone_change(zone.id,vicSide);
		//zone_color_reshresh();
		this.state='start';
		boxShift('mapBox');
	};
	*/

	this.fight=function(){
		var zone=this.select_last;
		var rr=fight_do(zone.id);
		//zone_color_reshresh();
		this.state='start';
		boxShift('mapBox');
		return rr;
	};

	this.bliz=function(){
		var zone=this.select_last;
		zone_change(zone.id,leader_d[zone.leader[0]].side);
		this.state='start';
		boxShift('mapBox');
	};

	this.message_back=function(){
		boxShift("mapBox");
	};

	this.message_caught=function(){
		//$('#showBoxButton3').hide();
		//$('#showBoxButton4').hide();

		boxShift('showBox','caught_check');
		this.state='selecting_caught';
		var leader_en_l = [];
		for (var i = 0; i < leader_l.length; i++) {
			var leader=leader_l[i];
			if (leader.caught===true && isFriend(leader.side_caught)){
				leader_en_l.push(leader);
			}
		}
		show_leader(leader_en_l);
	};

	this.next_turn=function(){
		progress();
		boxShift('mapBox');
	};
}

function fight_do(zone_id){
	var zone=zone_d[zone_id];
	var leaderList=zone.leader.map(function(leader_id){return leader_d[leader_id];});
	var groupList=groupby(leaderList,'side');
	var Alist=groupList[0].map(function(leader){return leader.id;});
	var Blist=groupList[1].map(function(leader){return leader.id;});
	var rr=fightToRouted(Alist,Blist);
	//leader_withdraw_zone_side
	var withDrawSide,vicSide;
	if (rr.result==='Avic'){
		withDrawSide=groupList[1][0].side;
		vicSide=groupList[0][0].side;
	}
	else{
		withDrawSide=groupList[0][0].side;
		vicSide=groupList[1][0].side;
	}
	leader_withdraw_zone_side(zone.id,withDrawSide);
	zone_change(zone.id,vicSide);
	updateHistoy(report(rr)['battle']);
	return rr;
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
		el.html(zone.leader.length);
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
function isConflict(zone_id){
	var zone=zone_d[zone_id];
	if (zone.leader.length===0){
		return false;
	}
	else{
		var first_side=leader_d[zone.leader[0]].side;
		for(var i=0;i<zone.leader.length;i++){
			var leader=leader_d[zone.leader[i]];
			if(leader.side!==first_side) {
				return true;
			}
		}
	}
	return false;
}
function isBliz(zone_id){
	//这个是判定是一个地区是否有与其所属势力不相同的军队存在的，bliz本身要无冲突才能发动。
	var zone=zone_d[zone_id];
	//leader=leader_d[zone.leader[0]];
	var boolList=zone.leader.map(function(leader_id){return leader_d[leader_id].side!==zone.side;});
	if (boolList.length===0)
		return false;
	return any(boolList);
}
function leader_move_zone(fromZone_id,toZone_id){
	var fromZone=zone_d[fromZone_id];
	var toZone_id=zone_d[toZone_id];
	for(var i=0;i<fromZone.length;i++){
		toZone.leader.push(i);
		fromZone.leader.splice(i,1);
	}
}
function leader_withdraw(leader_id,vicSide){
	var leader=leader_d[leader_id];
	var zone=zone_d[leader.zone];
	var ava_zone_list=[];
	console.log(zone.nei);
	for (var i=0;i<zone.nei.length;i++){
		var ava_zone=zone_d[zone.nei[i]];
		//console.log([ava_zone.side,leader.side]);
		if (ava_zone.side===leader.side){
			ava_zone_list.push(zone.nei[i]);
		}
	}
	if (ava_zone_list.length===0){
		remove_leader(leader_id);
		leader.caught=true;
		leader.side_caught=vicSide;
		return 'destroy';
	}
	else{
		var goal_id=ava_zone_list[Math.floor(Math.random()*ava_zone_list.length)];
		move_leader(leader_id,goal_id);
		return 'routed';
	}
}
function leader_withdraw_zone(zone_id){
	var zone=zone_d[zone_id];
	var seq=copy(zone.leader);
	for (var i=0;i<seq.length;i++){
		leader_withdraw(seq[i]);
	}
}
function leader_withdraw_zone_side(zone_id,side,vicSide){
	var zone=zone_d[zone_id];
	var seq=copy(zone.leader);
	for (var i=0;i<seq.length;i++){
		var leader=leader_d[seq[i]];
		if (leader.side===side) {
			leader_withdraw(seq[i],vicSide);
		}
	}
}
/*
function leader_move_routed(zone_id,ava_side){
	//一个区域内单位向可选区域撤退
	var zone=zone_d[zone_id];
	ava_zone_list=[];
	for (var i=0;i<zone.nei;i++){
		var ava_zone=zone.d[zone.nei[i]];
		if (ava_zone.side===ava_side){
			ava_zone_list.push(zone.nei[i]);
		}
	}
	if (ava_zone_list.length===0){
		zone.leader=[];
		return 'destroy';
	}
	else{
		var goal_id=ava_zone_list[Math.floor(Math.random()*ava_zone_list.length)];
		leader_move_zone(zone_id,goal_id);
		return 'routed';
	}
}
*/
function distribution(side_id,product){
	var side=side_d[side_id];
	var my_leader=leader_l.filter(function(leader){return leader.side===side_id && leader.zone!==-1;});
	if (my_leader.length===0){
		return ;
	}
	var avg_product=product.map(function(x){return Math.floor( x/my_leader.length)});
	my_leader.forEach(function(leader){
		leader.inf+=avg_product[0];
		leader.cav+=avg_product[1];
		leader.art+=avg_product[2];
	})
}
function supply(side_id){
	var side=side_d[side_id];
	var zone_number=sum(zone_l.map(function(zone){return zone.side===side.id ? 1:0}));
	var product=[zone_number*100,zone_number*50,zone_number*20];
	distribution(side_id,product);
}
function progress(){
	for(var i=0;i<side_l.length;i++){
		var side=side_l[i];
		if (!isFriend(side.id)){
			supply(side.id);
			side_action_ai(side.id);
		}
		else{
			supply(side.id);
			console.log('your turn');
		}
	}
}
function updateHistoy(s){
	var box= $('.battleHistoryBox > pre');
	box.html(box.html()+s+'<br><br>');
	console.log(box.innerHTML+s+'<br><br>');
}


		
click_box=new Class_click_control();



var map_el = $('#map');
//map_el.html("inner html");
map_el.draggable();
map_el.css({width:'3000px',height:'1500px'});
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
map_percent_x=0.03;
map_percent_y=0.03;
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
	zone.leader=[];
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
//使用datatables显示将领信息。
show_leader_setup();
show_leader(leader_l);
show_leader([leader_l[0]]);
//将领初始化
for (var i=0;i<leader_l.length;i++){
	var leader=leader_l[i];
	var zone_id=leader.enter_location;
	zone_d[zone_id].leader.push(leader.id);
	leader.zone=zone_id;
	leader.caught=false;
	leader.side_caught=null;
	leader.side_name=side_d[leader.side].name;
}

zone_color_reshresh();
zone_number_refresh();
