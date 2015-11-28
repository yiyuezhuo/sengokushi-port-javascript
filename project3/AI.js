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