function AI(side_id){
	var side=side_d[side_id];
	zone_l.forEach(function(zone){
		if(zone.side===side_id && !zone.fighted)
		{
			var el=[];//敌方区域
			var fl=[];//友方区域
			var al=[];//可攻击区域
			var sl=[];//静态区域（不可通行友方区域）
			zone.nei.forEach(function(nei_id){
				var nei=zone_d[nei_id];
				if ((nei.side)===side_id){
				//if (side.is_friendly(nei.id)){
					fl.push(nei);
				}
				else if (side.is_friendly(nei.id)){
					sl.push(nei);
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
				//army_move(zone.id,target.id,zone.strength(),zone.side);
				army_move(zone.id,target.id,zone.move_able(),zone.side);
			}
			else if(al.length!==0){
				var target=random.choose(al)//zone_d[random.choose(al)];
				//army_move(zone.id,target.id,zone.strength(),zone.side);
				army_move(zone.id,target.id,zone.move_able(),zone.side);
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
function friend(side_id_a,side_id_b){
	side_d[side_id_a].diplomacy[side_id_b]=1;
	side_d[side_id_b].diplomacy[side_id_a]=1;
}
function alliance(sl){
	for(var i=0;i<sl.length;i++){
		for(var j=0;j<sl.length;j++){
			friend(sl[i],sl[j]);
		}
	}
}

function global_think(){
	//此函数将综合起来计算效率更高的全部逻辑放在一起，之后应该传入单个AI操作的函数中作为信息源之一。
	//准备阶段，标注“边界”与第一第二进攻来源。
	//每个每方映射到一个它所具有的地区的集合，而每个地区被映射到“势”（当前区域距离最近敌人的格数，
	//只对所有方有意义）与第一第二威胁来源
	var side_map={};
	var zone_map={};
	var potential_now=1;
	var activate_zone=[];
	side_l.forEach(function(side){
		side_map[side.id]={have:[],border:[],attack:[]};
	});
	zone_l.forEach(function(zone){
		zone_map[zone.id]={strengths:{},potential:undefined,hint:[],is_border:false};
	});
	//预备遍历
	zone_l.forEach(function(zone){
		var zone_id=zone.id;
		var owner=side_d[zone.side];
		side_map[owner.id]['have'].push(zone.id);
		var is_border=not(all(zone.nei.map(function(zone_id){return owner.is_friendly(zone_id)})));
		//边界判定
		if (is_border){
			zone_map[zone.id]['potential']=potential_now;
			zone_map[zone.id]['is_border']=true;
			side_map[owner.id]['border'].push(zone.id);
			activate_zone.push(zone);
		}
		//威胁来源计入,之后除第一威胁来源方本身以外将第一威胁当做威胁值，第一威胁把第二威胁当做威胁值。
		//算了，直接保存威胁值，这个威胁值的结构与strengths应该完全相同，再计算第一第二威胁度到hint里。
		zone_map[zone.id]['strengths']={};
		zone.nei.forEach(function(nei_id){
			zone_map[zone.id]['strengths'][zone_d[nei_id].side]=0;
		});
		zone.nei.forEach(function(nei_id){
			var nei=zone_d[nei_id];
			zone_map[zone.id]['strengths'][nei.side]+=nei.strength();
		});
		//var sl= zone.nei.map(function(nei_id){return [zone_d[nei_id].side,zone_map[zone.id]['strengths']]})
		var ssl=set(zone.nei.map(function(nei_id){return zone_d[nei_id].side}))
		//var sl= zone.nei.map(function(nei_id){return [zone_d[nei_id].side,zone_map[zone.id]['strengths'][zone_d[nei_id].side]]})
		var sl= ssl.map(function(side_id){return [side_id,zone_map[zone.id]['strengths'][side_id]]});
		sl.sort(function(obj){return obj[1]});
		sl.reverse();
		zone_map[zone_id]['hint']=[];
		zone_map[zone_id]['hint'][0]=[sl[0][0],sl[0][1]];
		if (sl[1]!==undefined){
			zone_map[zone_id]['hint'][1]=[sl[1][0],sl[1][1]];
		}
		else{
			zone_map[zone_id]['hint'][1]=[undefined,undefined];
		}
	})
	//继续计算potential，直到activate_zone为空
	while (activate_zone.length!==0){
		potential_now+=1;
		activate_zone.forEach(function(a_zone){
			//console.log(activate_zone);
			var self_nei= a_zone.nei.filter(function(nei_id){
				return zone_d[nei_id].side===a_zone.side && zone_map[nei_id]['potential']===undefined;
			})
			self_nei.forEach(function(nei_id){
				zone_map[nei_id]['potential']=potential_now;
			})
		})
		activate_zone=[];
		zone_l.forEach(function(zone){
			if (zone_map[zone.id]['potential']===potential_now){
				activate_zone.push(zone);
			}
		})
	}
	return {side_map:side_map,zone_map:zone_map};
}

function AI_run2(){
	//var think= global_think();
	side_l.forEach(function(side){
		var think= global_think();//本来那是个全局运算，但发现如果那样会有信息过时问题，结果为这个全局算又有性能损失，伤不起
		if (!(isFriend(side.id))){
			AI2(side.id,think);
		}
	});
}
function AI2(side_id,think){
	var side=side_d[side_id];
	var zone_map=think.zone_map;
	var side_map=think.side_map;
	var threat_map={};
	zone_l.forEach(function(zone){
		if (zone_map[zone.id]['hint'][0][0]!==side_id){
			threat_map[zone.id]=zone_map[zone.id]['hint'][0][1];
		}
		else if (zone_map[zone.id]['hint'][1][0]!==undefined){
			threat_map[zone.id]=zone_map[zone.id]['hint'][1][1];
		}
		else{
			threat_map[zone.id]=0;
		}
	})
	//现在的策略是，在威胁超过己方strength的情况下全部不予移动。在此前提下，在非边界区域优先走势最低的区域
	//若有等势的区域则走随机一个。若在border区域情况复杂化一些，应该留有分散袭扰的策略，但现在先只实现
	//降势运动，另外进攻除了要使得自己strength高于对方，还要剩下的strength要足够抗击威胁，为此应当利用虚拟战斗。
	//符合这些要求的才会成为进攻可行区域，如果没有进攻可行区域计算自己所在区域的威胁，若低于己方，则暂时只是不移动，
	//不实现分兵。如果高于自己则向升势方向移动，若有等势者则随机选择一栋移动。
	
	var inner_l=[];//inner的先移动，缓解一下分区移动的弊病，本来就是整体规划复杂度的东西果然还是不能分区
	var outer_l=[];
	side_map[side.id]['have'].forEach(function(zone_id){
		var zone=zone_d[zone_id];
		if (zone_map[zone.id]['is_border']){
			outer_l.push(zone_id);
		}
		else{
			inner_l.push(zone_id);
		}
	});
	inner_l.forEach(function(zone_id){
		//非边界情况
		var zone=zone_d[zone_id];
		inner_move(side,zone,zone_map,threat_map);
	});
	outer_l.forEach(function(zone_id){
			var zone=zone_d[zone_id];
			//边界情况
			//先检查是否需要撤退。不需要撤退的话，计算出能投入进攻的兵力与若投入这个兵力进攻若成功剩下的兵力
			//是否还能抵抗threat，若通过才考虑发动进攻。
			if (threat_map[zone.id]>zone.strength()){
				//需要撤退
				route_move(side,zone,zone_map,threat_map);
			}
			else{
				//不需要撤退
				front_move(side,zone,zone_map,threat_map);
			}
	});
	/*
	side_map[side.id]['have'].forEach(function(zone_id){
		var target_id;
		var zone=zone_d[zone_id];
		if (zone_map[zone.id]['is_border']){
			//边界情况
			//先检查是否需要撤退。不需要撤退的话，计算出能投入进攻的兵力与若投入这个兵力进攻若成功剩下的兵力
			//是否还能抵抗threat，若通过才考虑发动进攻。
			if (threat_map[zone.id]>zone.strength()){
				//需要撤退
				route_move(side,zone,zone_map,threat_map);
			}
			else{
				//不需要撤退
				front_move(side,zone,zone_map,threat_map);
			}
		}
		else{
			//非边界情况
			inner_move(side,zone,zone_map,threat_map);
		}
	})
	*/
}
function inner_move(side,zone,zone_map,threat_map){
			//非边界情况
			var target_id;
			var al=zone.nei.filter(function(nei_id){return threat_map[nei_id]<=zone_d[nei_id].strength()+zone.move_able()});
			var potential_min=min(al.map(function(nei_id){return zone_map[nei_id]['potential']}));
			var bl=al.filter(function(nei_id){return zone_map[nei_id]['potential']===potential_min});
			if (bl.length!==0){
				target_id=random.choose(bl);
				army_move(zone.id,target_id,zone.move_able(),zone.side);
			}
			else{
				console.log('I am hard to breath!');
			}
}
function route_move(side,zone,zone_map,threat_map){
				var target_id;
				var side_id=side.id;
				var al=zone.nei.filter(function(nei_id){return zone_d[nei_id].side===side_id});
				var potential_max=max(al.map(function(nei_id){return zone_map[nei_id]['potential']}));
				var bl=al.filter(function(nei_id){return zone_map[nei_id]['potential']===potential_max});
				if (bl.length!==0){
					target_id=random.choose(bl);
					army_move(zone.id,target_id,zone.move_able(),zone.side);
				}
				else{
					console.log('I can not do anything!');
				}
}
function front_move(side,zone,zone_map,threat_map){
				var target_id;
				var ready=zone.move_able()-threat_map[zone.id];
				var al=zone.nei.filter(function(nei_id){
					var nei=zone_d[nei_id];
					if (ready<=0){
						return false
					}
					//else if (nei.side===side_id){
					else if (side.is_friendly(nei.id)){
						return false;
					}
					else if (ready<nei.strength()){
						return false;
					}
					else if (int(lancheste(ready,nei.strength(),1,1)[0])<threat_map[nei_id]){
						return false;
					}
					else{
						return true;
					}
				});
				if (al.length!==0){
					//分兵进攻
					target_id=random.choose(al);
					army_move(zone.id,target_id,ready,zone.side);
					battle_cal(target_id);
				}
				else{
					//无力进攻,暂时设定为不做任何事,保持对峙
					console.log('I do not want to do anything!');
				}
}