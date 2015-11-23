/**
 * Created by yiyuezhuo on 2015/10/17.
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
var morale_percent=20;
var infCarry=1;
var cavCarry=0;
var gunCharge=3;
var morale_percent_fire=20;

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
function sum(l){
    return l.reduce(function(x,y){return x+y});
}
function any(l){
    return l.reduce(function(x,y){return x||y});
}
function all(l){
    return l.reduce(function(x,y){return x&&y});
}
function minuesZeroCut(x,y){
    if (x>y){
        return x-y;
    }
    else{
        return 0;
    }
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
    //对battleForce的野统修正应该在其他层面进行，那个层面中持有对一方leader的引用是自然地
    var leader=leader_d[leader_id];
    //var commander=leader_d[commander_id];
    leader.battleForce=leader.force//+commander.army;
    //leader.battleForce=leader.force+(leadership ? leadership:0);
    leader.morale=100;
    leader.routed=false;
    leader.check=function(){
        //console.log([this.routed,this.morale,this.morale===0]);
        if (this.morale===0){
            this.routed=true;
            //console.log('in!');
        }
    }
    leader.record=[];//这个record的各个index存的就是各个对应阶段的战斗裁决“前”的数量。
    return leader;
}
function getLeaderByIdList(id_list){
    //这个是加了battle_leader_setup修正的不是纯粹取出来
    //  现在这个东西又承担了加野统修正的功能，可以看成是一个没什么独立性的函数了
    var rl=[];
    for(var i=0;i<id_list.length;i++){
        rl.push(battle_leader_setup(id_list[i]));
    }
    var armyList=rl.map(function(leader){return leader.army});
    var maxArmy=armyList.reduce(function(x,y){return Math.max(x,y)});
    rl.forEach(function(leader){leader.battleForce+=maxArmy});
    return rl;
}

function edge_setup(unit,cls,side,loc){
    //edge attr := unit cls side routed enter loc
    that={};
    that.unit=unit;
    that.routList=[];
    that.unit_total=copy(unit);
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
        for (var i=0;i<this.unit.length;i++){
            this.unit[i].check();
            if (this.unit[i].routed===true){
                this.unit.splice(i,1);
                this.routList.push(this.unit[i]);
            }
        }
        if (this.unit.length===0){
            this.routed=true;
            this.loc=-1;
        }
    };
    return that;
}


function produceChargeByLeader(leader,battleType){
    switch(battleType){
        case 'fire':
            var ava=Math.min(leader.inf*infCarry+leader.cav*cavCarry,leader.art);
            return ava*gunCharge;
            break;
        case 'melee':
            return (leader.inf * infCharge + leader.cav * cavCharge + leader.battleForce) * (1 + leader.battleForce * 0.1);
            break;
        default :
            return (leader.inf * infCharge + leader.cav * cavCharge + leader.battleForce) * (1 + leader.battleForce * 0.1);
            break;
    }
}

function produceChargeByEdge(edge,battleType){
    var sum=0;
    for (var i=0;i<edge.unit.length;i++){
        sum+=produceChargeByLeader(edge.unit[i],battleType);
    }
    return sum;
}

function moreleCal(leader,chargePoint,battleType){
    switch(battleType){
        case 'fire':
            return randomPure(morale_percent_fire*chargePoint/produceChargeByLeader(leader));
            break;
        case 'melee':
            return randomPure(morale_percent*chargePoint/produceChargeByLeader(leader));
            break;
        default :
            return randomPure(morale_percent*chargePoint/produceChargeByLeader(leader));
            break;
    }
}

function receiveChargeByLeader(leader,chargePoint,battleType){
    leader.record.push({inf:leader.inf,cav:leader.cav,art:leader.art,morale:leader.morela});//record
    var WeightVector=[leader.battleForce,leader.inf*infCharge,leader.cav*cavCharge];
    var totalWeight=WeightVector.reduce(function(x,y){return x+y;})
    var receiveVector=WeightVector.map(function(a){return chargePoint*(a/totalWeight);});
    leader.inf=randomPure(minuesZeroCut(leader.inf,receiveVector[1]*infChargeLoss));
    leader.cav=randomPure(minuesZeroCut(leader.cav,receiveVector[2]*cavChargeLoss));
    //var morale_sl=randomPure(morale_percent*chargePoint/produceChargeByLeader(leader));
    var morale_sl=moreleCal(leader,chargePoint,battleType);
    leader.morale=minuesZeroCut(leader.morale,morale_sl);
    //art损失计算，如果发生carry不够就减到carry的水平
    var carry=leader.inf*infCarry+leader.cav*cavCarry;
    leader.art= carry<leader.art? carry:leader.art;
    return leader;
}
function receiveChargeByEdge(edge,chargePoint,battleType){
    var ll=[];
    //console.log(edge);
    for(var i=0;i<edge.unit.length;i++){
        var leader=edge.unit[i];
        ll.push(produceChargeByLeader(leader,'melee'));//权重计算时还是用melee的战斗力权重而不是battleType的
    }
    var ls=ll.reduce(function(x,y){return x+y;})
    var lll=ll.map(function(pc){return chargePoint*(pc/ls);});
    //console.log(chargePoint*(ll[2]/ls));
    //console.log(lll);
    for (var i=0;i<edge.unit.length;i++){
        receiveChargeByLeader(edge.unit[i],lll[i],battleType);
    }
    return edge;
}
function twoEdgeFight(Aedge,Bedge,battleType){
    var edges=[Aedge,Bedge];
    var totalCharge=[];
    for (var i=0;i<2;i++){
        totalCharge.push(produceChargeByEdge(edges[i],battleType));
    }
    receiveChargeByEdge(edges[0],totalCharge[1],battleType);
    receiveChargeByEdge(edges[1],totalCharge[0],battleType);
    return [Aedge,Bedge];
}
function failCal(edge){
    return edge;//暂时不对撤退方做任何处理
}
function fightToRouted(Alist,Blist) {
    //这个策略就是双方不断近战到直到一方溃退
    var Aleaders=getLeaderByIdList(Alist);
    var Bleaders=getLeaderByIdList(Blist);
    var Aedge=edge_setup(Aleaders,'class','A','0');
    var Bedge=edge_setup(Bleaders,'class','A','0');
    var vic='draw';
    for(var t=0;t<20;t++){
        if (t%2===0) {
            twoEdgeFight(Aedge, Bedge,'fire');
        }
        else{
            twoEdgeFight(Aedge,Bedge,'melee');
        }
        Aedge.check();
        Bedge.check();
        if (Aedge.routed === true) {
            failCal(Aedge);
            //return {result:'Bvic','Aedge':Aedge,'Bedge':Bedge};
            vic='Bvic';
            break;
        }
        else if (Bedge.routed == true) {
            failCal(Bedge);
            //return {result:'Avic','Aedge':Aedge,'Bedge':Bedge};
            vic='Avic';
            break;
        }
    }
    var result={result:vic,'Aedge':Aedge,'Bedge':Bedge,'turn':t};
    //console.log('report beign');
    console.log(report(result));
    //console.log('report end');
    return  result;
}



function report(result){
    //report接受一个result
    var Aedge=result.Aedge;
    var Bedge=result.Bedge;
    var turn=result.turn;
    var vic=result['result'];

    //var last_turn=Aedge.unit_total[0]
    //var Azone_name=zone_d[Aedge.unit_total[0].zone].name;
    //var Bzone_name=zone_d[Bedge.unit_total[0].zone].name;
    var vic_edge=Aedge.unit_total[0].zone===null ? Bedge : Aedge;
    var zone_name=zone_d[vic_edge.unit_total[0].zone].name;
    var Aside_name=side_d[Aedge.unit_total[0].side].name;
    var Bside_name=side_d[Bedge.unit_total[0].side].name;
    var title='在'+zone_name+'处'+Aside_name+'与'+Bside_name+'进行了战斗';
    var l1s='';
    switch(vic){
        case 'Avic':
            l1s='最终'+Aside_name+'取得了胜利。';
            break;
        case 'Bvic':
            l1s='最终'+Bside_name+'取得了胜利。';
            break;
        case 'draw':
            l1s='最终平局';
            break;
    }
    var l1='战斗进行了'+turn+'轮'+l1s;
    var map_i={0:Aedge,1:Bedge};
    var map_j={0:'inf',1:'cav',2:'art',3:'morale'};
    var mat_e=[[],[]];
    var mat_s=[[],[]];
    var mat_out=[[],[],[],[],[],[]];
    for (var i=0;i<2;i++){
        for (var j=0;j<4;j++){
            //mat_e[i][j]=map_i[i].unit_total.map(function(leader){return leader[map_j[j]]});
            //mat_out[i][j]=sum(mat_e[i][j]);
            mat_s[i][j]=map_i[i].unit_total.map(function(leader){return leader.record[0][map_j[j]]});
            mat_out[i][j]=sum(mat_s[i][j]);
        }
    }
    for (var i=0;i<2;i++){
        for (var j=0;j<4;j++){
            //mat_s[i][j]=map_i[i].unit_total.map(function(leader){return leader.record[0][map_j[j]]});
            //mat_out[i+2][j]=sum(mat_s[i][j]);
            //mat_out[i+4][j]=mat_out[i+2][j]-mat_out[i][j];
            mat_e[i][j]=map_i[i].unit_total.map(function(leader){return leader[map_j[j]]});
            mat_out[i+2][j]=sum(mat_e[i][j]);
            mat_out[i+4][j]=mat_out[i][j]-mat_out[i+2][j];
        }
    }
    var map_head={0:'投入兵力共计',1:'战后兵力共计',2:'损失兵力共计'};
    var map_side={0:Aside_name,1:Bside_name};
    var sl=[]
    for (var i=0;i<6;i++){
        var head=map_side[i%2]+map_head[Math.floor(i/2)];
        var body=mat_out[i][0]+'步兵 '+mat_out[i][1]+' 骑兵 '+mat_out[i][2]+'铁炮 ';
        sl.push(head+body+'\n');
    }
    /*
    var l2=Aside_name+'投入兵力共计'+mat_out[0][0]+'步兵'+sum(mat_s[0][1])+'骑兵'+sum(mat_s[0][2])+'铁炮';
    var l3=Bside_name+'投入兵力共计'+sum(mat_s[1][0])+'步兵'+sum(mat_s[1][1])+'骑兵'+sum(mat_s[1][2])+'铁炮';
    var l4=Aside_name+'战后兵力共计'+sum(mat_e[0][0])+'步兵'+sum(mat_e[0][1])+'骑兵'+sum(mat_e[0][2])+'铁炮';
    var l5=Bside_name+'战后兵力共计'+sum(mat_e[1][0])+'步兵'+sum(mat_e[1][1])+'骑兵'+sum(mat_e[1][2])+'铁炮';
    var l2=Aside_name+'损失兵力共计'+sum(mat_s[0][0])+'步兵'+sum(mat_s[0][1])+'骑兵'+sum(mat_s[0][2])+'铁炮';
    var l3=Bside_name+'损失兵力共计'+sum(mat_s[1][0])+'步兵'+sum(mat_s[1][1])+'骑兵'+sum(mat_s[1][2])+'铁炮';
    */
    var detail_leader='';
    var detail_turn='';
    var detail_battle=title+'\n'+l1+'\n'+sum(sl);
    var detail={'leader':detail_leader,'turn':detail_turn,'battle':detail_battle,'result':result};
    return detail;
}

function estimateLeaderList(leader_id_list){
    var leader_list=leader_id_list.map(function(leader_id){return leader_d[leader_id];});
    var powerList=leader_list.map(function(leader){return leader.inf*infCharge+leader.cav*cavCharge;});
    if (powerList.length===0){
        return 0;
    }
    return sum(powerList);
}