﻿/*
battle_cal.js

battle_cal_init
battle_leader_setup
getLeaderByIdList
locationMap
battle_edges_setup
edgeBoxDraw
randomPure
produceChargeByLeader
produceChargeByEdge
minuesZeroCut
receiveChargeByLeader
receiveChargeByEdge
twoEdgeFight
AIThink
AIAndReact
goFrontMonitor
*/

function battle_cal_init(){
		$('.panelFront').DataTable({
			  	columns:[
			  		{data:'name',title:'名称'},
  					{data:'cav',title:'骑兵'},
						{data:'inf',title:'步兵'},
  					{data:'art',title:'炮兵'},
  					{data:'battleForce',title:'武'},
  					{data:'morale',title:'士气'}
  				],
  				select: {
            style: 'multi'
        	},
        	scrollY: 300
		});
		$('.panelCenter').DataTable({
			  	columns:[
			  		{data:'name',title:'名称'},
  					{data:'cav',title:'骑兵'},
						{data:'inf',title:'步兵'},
  					{data:'art',title:'炮兵'},
  					{data:'battleForce',title:'武'},
  					{data:'morale',title:'士气'}
  				],
  				select: {
            style: 'multi'
        	},
        	scrollY: 200
		});
		$('.panelRear').DataTable({
			  	columns:[
			  		{data:'name',title:'名称'},
  					{data:'cav',title:'骑兵'},
						{data:'inf',title:'步兵'},
  					{data:'art',title:'炮兵'},
  					{data:'battleForce',title:'武'},
  					{data:'morale',title:'士气'}
  				],
  				select: {
            style: 'multi'
        	},
        	scrollY: 100
		});
		$("[value='前进']").click(goFrontMonitor);
}

var infCharge=1;
var cavCharge=3;
var infChargeLoss=0.1;
var cavChargeLoss=0.03;
var morale_percent=10;

function randomPure(n){
		if (Math.random()<n%1){
				return Math.ceil(n);
		}
		else{
				return Math.floor(n);
		}
}

function locationMap(ll){//ll是一个列表表，其按照这个规则重排，如果一个表是空的，所有左边的表向右移动补上这个位置。
		var lll=[];
		for (var i=0;i<ll.length;i++){//将列表表转成我们实际上需要的信息，即长度与原始索引值
				lll.push({len:ll[i].length,origin:i});
		}
		for(var i=1;i<lll.length;i++){//开始归约
				if (lll[i].len==0){
						for (var j=i;j>0;j--){
								lll[j]=lll[j-1];
						}
						lll[0]=null;
				}
		}
		var rd={};
		for (var i=0;i<lll.length;i++){
				if (lll[i]!=null)
					rd[lll[i].origin]=i;
		}
		return rd;
}
function sorted(l){
		l=l.map(function(x){return x});
		var len=l.length;
		for(var i=0;i<len-1;i++){
				for(var j=0;j<len;j++){
						if(l[j]>l[j+1]){
								var t=l[j+1];
								l[j+1]=l[j];
								l[j]=t;
						}
				}
		}
		return l;
}
function any(l){
		return l.reduce(function(x,y){return x||y});
}
function all(l){
		return l.reduce(function(x,y){return x&&y});
}
function resume_map(l){
		//[1,2,4,6]->{6:6,4:5,2:4,1:3}
		var l=sorted(l);
		var tm=l[l.length-1];
		var len=l.length;
		dic={};
		for (var i=len-1;i>=0;i--){
				dic[l[i]]=tm-(len-1-i);
		}
		return dic;
}

function battle_leader_setup(leader_id){
		var leader=leader_d[leader_id];
		//var commander=leader_d[commander_id];
		leader.battleForce=leader.force//+commander.army;
		leader.morale=100;
		leader.routed=false;
		return leader;
}
function getLeaderByIdList(id_list){//这个是加了battle_leader_setup修正的不是纯粹取出来
		var rl=[];
		for(var i=0;i<id_list.length;i++){
				rl.push(battle_leader_setup(id_list[i]));
		}
		return rl;
}

function edge_setup(unit,cls,side,loc){
		//edge attr := unit cls side routed enter loc
		that={};
		that.unit=unit;
		that.cls=cls;
		that.side=side;
		that.routed=false;
		if (unit.length===0){
				that.enter=false;
		}
		else{
				that.enter=true;
		}
		that.loc=loc;//为了解决列表表示的一堆麻烦，直接把位置存在这里，表示成类似函数的形式，不过封装在这
		that.check=function(){
				if (that.unit.all(that.unit.map(function(x){return x.routed}))){
						that.routed=true;
						that.loc=-1;
				}
		};
		return that;
}
function battle_edges_setup(Arear,Acenter,Afront,Brear,Bcenter,Bfront){
		//edges就是逻辑上两军各阵相对位置的数组,参数都是id list 但返回的都是对象了
		var ArearO=getLeaderByIdList(Arear);
		var AcenterO=getLeaderByIdList(Acenter);
		var AfrontO=getLeaderByIdList(Afront);
		var BrearO=getLeaderByIdList(Brear);
		var BcenterO=getLeaderByIdList(Bcenter);
		var BfrontO=getLeaderByIdList(Bfront);
		var Amd=locationMap([Arear,Acenter,Afront]);
		var Bmdt=locationMap([Brear,Bcenter,Bfront]);
		var Bmd={};
		for (var key in Bmdt){
				Bmd[19-key]=19-Bmdt[key];
		}
		var sEdge=new Array(20);
		for (var i=0;i<20;i++){
				sEdge[i]=null;
		}
		//edge_setup(Arear,'rear','A')~={unit:ArearO,cls:'rear',side:'A'}
		sEdge[0]=edge_setup(ArearO,'rear','A');sEdge[1]=edge_setup(AcenterO,'center','A');sEdge[2]=edge_setup(AfrontO,'front','A');
		sEdge[19]=edge_setup(BrearO,'rear','B');sEdge[18]=edge_setup(BcenterO,'center','B');sEdge[17]=edge_setup(BfrontO,'front','B');
		var rEdge=new Array(20);
		for (var origin in Amd){
				rEdge[Amd[origin]]=sEdge[origin];
				//rEdge[origin]=null;
		}
		for (var origin in Bmd){
				rEdge[Bmd[origin]]=sEdge[origin];
				//rEdge[origin]=null;
		}
		return rEdge;
}
function battle_field_setup(Arear,Acenter,Afront,Brear,Bcenter,Bfront){
		//battle_field attr := edges turn turn_max
		that={};
		that.edges=battle_edges_setup(Arear,Acenter,Afront,Brear,Bcenter,Bfront);
		that.turn=1;
		that.turn_max=20;
		that.height=10;//这个表示战场长度
		
		var ArearO=getLeaderByIdList(Arear);
		var AcenterO=getLeaderByIdList(Acenter);
		var AfrontO=getLeaderByIdList(Afront);
		var BrearO=getLeaderByIdList(Brear);
		var BcenterO=getLeaderByIdList(Bcenter);
		var BfrontO=getLeaderByIdList(Bfront);
		that.Arear=edge_setup(ArearO,'rear','A',1);
		that.Acenter=edge_setup(AcenterO,'center','A',2);
		that.Afront=edge_setup(AfrontO,'front','A',3);
		that.Brear=edge_setup(BrearO,'rear','B',1);//现在B和A用的初始loc一样，表示的是相对它们自己初始方向的偏移。
		that.Bcenter=edge_setup(BcenterO,'center','B',2);
		that.Bfront=edge_setup(BfrontO,'front','B',3);
		that.edge_list=[that.Arear,that.Acenter,that.Afront,that.Brear,that.Bcenter,that.Bfront];
		
		that.head_max_cls=function(cls){//返回cls类的各edge中可用部分中最前者
				var edge_cls=that.edge_list.filter(function(x){return x.cls===cls && x.routed===false && x.enter===true;}).map(function(y) {return y.loc;})
				var edge_cls_max=edge_cls.reduce(function(x,y){return Math.max(x,y)});
				return edge_cls_max;
		}
		that.distance=function(){
			var edge_A_max=that.head_max_cls('A');
			var edge_B_max=that.head_max_cls('B');
			return that.height-edge_A_max+edge_B_max;
		}
		that.head_cls=function(cls){
				var edge_cls=that.edge_list.filter(function(x){return x.cls===cls && x.routed===false && x.enter===true;});
				var edge_map=edge_cls.map(function(y) {return y.loc;});
				var edge_map_max=edge_map.reduce(function(x,y){return Math.max(x,y)});
				var header=edge_cls[edge_map.indexOf(edge_map_max)];
				return header;
		}
		that.fight=function(){
				var Ahead=that.head_cls('A');
				var Bhead=that.head_cls('B');
				twoEdgeFight(Ahead,Bhead);
		}
		that.move=function(cls){
				var edge_cls=that.edge_list.filter(function(x){return x.cls===cls && x.routed===false && x.enter===true;});
				for(var i in edge_cls){
						var edge=edge_cls[i];
						edge.loc+=1;
				}
		}
		that.resume=function(cls){
				var edge_cls=that.edge_list.filter(function(x){return x.cls===cls && x.routed===false && x.enter===true;});
				var edge_map=edge_cls.map(function(y){return y.loc;});
				var mapdic=resume_map(edge_map);
				for (var i in that.edge_cls){
						var edge=edge_cls[i];
						edge.loc=mapdic[edge.loc];
				}
		}
		that.check=function(){
				for(var i in that.edge_cls){
						var edge=that.edge_cls[i];
						edge.check();
				}
				var edge_A=edge_list.filter(function(x){return x.cls===A && x.routed===false && x.enter===true;});
				var edge_B=edge_list.filter(function(x){return x.cls===B && x.routed===false && x.enter===true;});
				if(edge_A.length===0 && edge_A.length!==0){
						return 'Bvic';
				}
				else if (edge_A.length!==0 && edge_A.length===0){
						return 'Avic';
				}
				else if(edge_A.length===0 && edge_A.length===0){
						return 'draw';
				}
				else{
						return 'hold';
				}
		}

}



function produceChargeByLeader(leader){
		return (leader.inf*infCharge+leader.cav*cavCharge+leader.battleForce)*(1+leader.battleForce*0.1);
}
function produceChargeByEdge(edge){
		var sum=0
		for (var i=0;i<edge.unit.length;i++){
				sum+=produceChargeByLeader(edge.unit[i]);
		}
		return sum;
}

function minuesZeroCut(x,y){
		if (x>y){
				return x-y;
		}
		else{
				return 0;
		}
}

function receiveChargeByLeader(leader,chargePoint){
		/*
		var leaderWeight=leader.battleForce;
		var infWeight=leader.inf*infCharge;
		var cavWeight=leader.cav*cavCharge;
		var totalWeight=leaderWeight+infWeight+cavWeight;
		var receiveLeader=chargePoint*(leaderWeight/totalWeight);
		var receiveInf=chargePoint*(infWeight/totalWeight);
		var receiveCav=chargePoint*(cavWeight/totalWeight);
		*/
		var WeightVector=[leader.battleForce,leader.inf*infCharge,leader.cav*cavCharge];
		var totalWeight=WeightVector.reduce(function(x,y){return x+y;})
		var receiveVector=WeightVector.map(function(a){return chargePoint*(a/totalWeight);});
		leader.inf=randomPure(minuesZeroCut(leader.inf,receiveVector[1]*infChargeLoss));
		leader.cav=randomPure(minuesZeroCut(leader.cav,receiveVector[2]*cavChargeLoss));
		var morale_sl=randomPure(morale_percent*chargePoint/produceChargeByLeader(leader));
		//console.log(receiveVector[0]);
		//console.log(produceChargeByLeader(leader));
		//console.log(morale_percent);
		//console.log(morale_sl);
		leader.morale=minuesZeroCut(leader.morale,morale_sl);
		return leader;
}
function receiveChargeByEdge(edge,chargePoint){
		var ll=[];
		//console.log(edge);
		for(var i=0;i<edge.unit.length;i++){
				var leader=edge.unit[i];
				ll.push(produceChargeByLeader(leader));
		}
		var ls=ll.reduce(function(x,y){return x+y;})
		var lll=ll.map(function(pc){return chargePoint*(pc/ls);});
		console.log(chargePoint*(ll[2]/ls));
		console.log(lll);
		for (var i=0;i<edge.unit.length;i++){
				receiveChargeByLeader(edge.unit[i],lll[i]);
		}
		return edge;
}
function twoEdgeFight(Aedge,Bedge){
		var edges=[Aedge,Bedge];
		var totalCharge=[];
		for (var i=0;i<2;i++){
				totalCharge.push(produceChargeByEdge(edges[i]))
		}
		receiveChargeByEdge(edges[0],totalCharge[1]);
		receiveChargeByEdge(edges[1],totalCharge[0]);
		return [Aedge,Bedge];
}
/*
var commandServer=(function(){//试试这种蛋疼的封装方法实现单例,当然不是那种没有生成没有不生成的单例。
		var that={};
		that.Acommand=null;
		that.Bcommand=null;
		that.send=function(edge,command){
				if (edge=='A'){
						that.Acommand=command;
				}
				else(edge=='B'){
						that.Bcommand=command;
				}
				that.do();
		}
		that.do=function(){
				if (that.Acommand!=null && that.Bcommand!=null){
						if (Acommand=='goFront' && Bcommand=='goFront'){
								
						}
						that.Acommand=null;
						that.Bcommand=null;
				}
		}
		return that;
		
})()
*/
function AIThink(){
		
}
function AIAndReact(command){

}

function goFrontMonitor(){
		console.log('goFront');
		
}