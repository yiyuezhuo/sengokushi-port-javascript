window.onload = function() {
	Crafty.init(800, 600);
	go();
};

function remove(l,atom){
		var index=l.indexOf(atom);
		l.splice(index,1);
		return l;
}

function id_dic_by_list(ll){
		rd={};
		for (var i=0;i<ll.length;i++){
				rd[ll[i]['id']]=ll[i]
		}
		return rd;
}

function draw_line(x1,y1,x2,y2){
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
  			
  			var line=Crafty.e("2D, Canvas, Color")
  			.attr({x: x1+map_box_w/2, y: y1+map_box_h/2, w: dd, h: 2,z:-1})
  			//.attr({x: x1, y: y1, w: dd, h: 2,z:-1})
  			.color('green');
  			line._attr('_rotation', line._rotation+degree);
}
  	
function leader_move(leader_id,obj_zone)
{
		var leader=leader_d[leader_id];
		remove(zone_d[leader.zone].leader,leader.id);
		zone_d[obj_zone].leader.push(leader.id);
		leader.zone=obj_zone;
}

function go(){
		big_dic=MiniWorldWar2_data;
		leader_l=big_dic.people;
		zone_l=big_dic.zone;
		link_l=big_dic.link;
		side_l=big_dic.side;
		zone_d=id_dic_by_list(zone_l);
		side_d=id_dic_by_list(side_l);
		leader_d=id_dic_by_list(leader_l);
		
		map_percent_x=0.03;
		map_percent_y=0.03;
		map_box_w=30;
		map_box_h=30;
		pi=3.1415926;
		
		zone_el_d={};
		for (var i=0;i<zone_l.length;i++){
				var zone=zone_l[i];
				var xz=zone.x*map_percent_x;
				var yz=zone.y*map_percent_y
				var zone_e=Crafty.e('2D, Canvas, Color,Mouse')
  			.attr({x: xz, y:yz, w: map_box_w, h: map_box_h,
  						 id:zone.id,link:zone.link,"zone":zone})//这里携带这些不可变的属性方便起见，本来应该是给zone访问的
  			.color('black').bind("Click",function(){Crafty.trigger("zone_select",{from:this})});
  			zone.leader=[];
  			zone_el_d[zone.id]=zone_e;
  			var zone_e_name=Crafty.e('2D, Canvas, Text')
  			.attr({x:xz,y:yz-15,z:1}).text(zone.name);
  			var zone_e_name_side=Crafty.e('2D, Canvas, Text')
  			.attr({x:xz,y:yz+zone_e.h,z:1}).text(zone.side_name);
  			zone_e.attach(zone_e_name);
  			zone_e.attach(zone_e_name_side);	
		}
		for (var i=0;i<leader_l.length;i++){
				var leader=leader_l[i];
				leader.zone=leader.enter_location
				leader_move(leader.id,leader.enter_location);
		}
		
		/*
		var line=Crafty.e("2D, Canvas, Color")
  	.attr({x: 0, y: 250, w: 250, h: 10})
  	.color('green');
  	//line.rotate({sin:Math.sin(pi*1/6),cos:Math.cos(pi*1/6)});
  	line._attr('_rotation', line._rotation - 30);
 		var line2=Crafty.e("2D, Canvas, Color")
  	.attr({x: 0, y: 250, w: 250, h: 10})
  	.color('green');
  	*/

  	//draw_line(50,50,100,100);
  	for (var i=0;i<link_l.length;i++){
  			//if (i>3) break;
  			var link=link_l[i]
  			var in_zone=zone_el_d[link.in];
  			var out_zone=zone_el_d[link.out];
  			draw_line(in_zone.x,in_zone.y,out_zone.x,out_zone.y);
  	}
  	/*
  	console.log("test");
  	var test_x=400;
  	var test_y=400;
  	var leng=100;
  	for (var deg=60;deg<360;deg+=10){
  			var radian=deg/360*(2*pi);
  			draw_line(test_x,test_y,test_x+(leng*Math.cos(radian)),test_y+(leng*Math.sin(radian)));
  			console.log(test_x,test_y,test_x+(leng*Math.cos(radian)),test_y+(leng*Math.sin(radian)));
  	}
  	*/
  	Crafty.e().bind("zone_select",function(e){console.log(e)});
}