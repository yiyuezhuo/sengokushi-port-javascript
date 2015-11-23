/**
 * Created by yiyuezhuo on 2015/10/19.
 */
positiveBase=1;//主动吸引基础点数
passiveBase=1;//被动吸引基础点数
positiveTend=0.5;//主动1传播率
passiveTend=0.5;
positivePhase=3;//传播次数
passivePhase=3;
myPowerTend=0.5;
yourPowerTend=0.5;
myPowerPhase=3;
yourPowerPhase=3;

function reconcileOdds(x,y){
    //var odd=Math.log(x/y);
    var odd=x-y;
    var t=20;
    return 1/(1+1/Math.pow(t,odd));
}
function max(l,key){
    var func=key ? key : function(x){return x;};
    var ln=l.map(func);
    return ln.reduce(function(x,y){return x>y ? x:y});
}
function argmax(l,key){
    var func=key ? key : function(x){return x;};
    var ln=l.map(func);
    var maxvalue=max(ln);
    var maxitem=false;
    l.forEach(function(e){
        if (func(e)===maxvalue){
            maxitem=e;
            return;
        }
    });
    return maxitem;
}
function setDiff(Alist,Blist){
    //从Alist里删除所有Blist里出现过的元素
    var rl=copy(Alist);
    for (var i=0;i<Blist.length;i++){
        var atom=Blist[i];
        for(var j=0;j<Alist.length;j++){
            var atom2=Alist[j];
            if (atom2===atom){
                delete(rl[j]);
            }
        }
    }
    var rll=[];
    rl.forEach(function(x){if(x!==undefined) rll.push(x);});
    return rll;
}
function member(atom,list){
    for(var i=0;i<list.length;i++){
        if (atom===list[i]){
            return true;
        }
    }
    return false;
}

function side_action_ai(side_id){
    var side=side_d[side_id];
    for (var i=0;i<zone_l.length;i++){
        var zone=zone_l[i];
        zone.ai={};
        zone.ai.friendPower= side_id===zone.side ? estimateLeaderList(zone.leader) : 0;
        zone.ai.enemyPower= side_id===zone.side ? 0 : estimateLeaderList(zone.leader);
        zone.ai.friendAttract = side_id===zone.side? 0 : positiveBase;
        zone.ai.enemyAttract = side_id===zone.side? positiveBase : 0;
    }
    var circulation=[['friendPower','enemyPower','friendAttract','enemyAttract'],
        [passiveTend,positiveTend,myPowerTend,yourPowerTend],
        [passivePhase,positivePhase,myPowerPhase,yourPowerPhase]];
    for (var i=0;i<circulation[0].length;i++){
        var item=circulation[0][i];
        var tend=circulation[1][i];
        var phase=circulation[2][i];
        var temp={};//这个字典缓存delta值来进行之后的更新
        for (var j=0;j<phase;j++){
            for(var k=0;k<zone_l.length;k++){
                var zone=zone_l[k];
                var nei=zone.nei.map(function(zone_id){return zone_d[zone_id];});
                temp[zone.id]=sum(nei.map(function(zone){return zone.ai[item]*tend;}));
            }
        }
        zone_l.forEach(function(zone){zone[item]+=temp[zone.id];});
    }
    zone_l.forEach(function(zone){
        var fp=zone.ai.friendPower;
        var ep=zone.ai.enemyPower;
        var fa=zone.ai.friendAttract;
        var ea=zone.ai.enemyAttract;
        zone.ai.mult=reconcileOdds(fp,ep)*ea+reconcileOdds(ep,fp)*fa;
    });
    var best=argmax(zone_l,function(zone){return zone.ai.mult;});//best是最好的目标区域对象，当然这样的方式有很多问题，但暂时。。
    for(var i=0;i<leader_l.length;i++){//将领向最优区域移动，
        var leader=leader_l[i];
        if (leader.zone!==null && leader.side===side.id){
            var path=greedy(leader.zone,best.id);
            var first_step=path[1];
            //console.log(leader.name,leader.zone,first_step);
            move_leader(leader.id,first_step);
        }
    }
    for(var i=0;i<zone_l.length;i++){
        var zone=zone_l[i];
        if (isBliz(zone.id)){
            if (!isConflict(zone.id)) {
                zone_change(zone.id, leader_d[zone.leader[0]].side);
            }
            else{
                fight_do(zone.id);
            }
        }
    }
    screen_update();
}
function ai_great_war(){
    for (var i=0;i<side_l.length;i++){
        var side=side_l[i];
        side_action_ai(side.id);
    }
}

function greedy(zone_x_id,zone_y_id,banListp){
    //给定两个zone的id，返回一个路径,这里是带回朔的贪婪算法，banList禁止循环搜索，递归实现
    var banList=banListp ? banListp : [];

    var zone_x=zone_d[zone_x_id];
    var zone_y=zone_d[zone_y_id];
    //console.log(zone_x);
    console.log(zone_x.id);
    var ava=setDiff(zone_x.nei,banList);
    var r;

    if (member(zone_y_id,ava)){
        return [zone_x_id,zone_y_id];
    }

    //var banList=banListp ? banListp : [];

    function distance(zone_a,zone_b){
        return Math.sqrt(Math.pow((zone_a.x-zone_b.x),2)+Math.pow((zone_a.y-zone_b.y),2));
    }
    ava.sort(function(zone_a_id,zone_b_id){
        var zone_a=zone_d[zone_a_id];
        var zone_b=zone_d[zone_b_id];
        return distance(zone_a,zone_y)-distance(zone_b,zone_y);});//得到估计距离从小到大的列表

    for(var i=0;i<ava.length;i++){
        var newBanList=copy(banList);
        newBanList.push(ava[i]);
        //console.log('do',zone_x_id,zone_y_id,banList,ava);
        r=greedy(ava[i],zone_y_id,newBanList);
        if (r!==false){
            return [zone_x_id].concat(copy(r));
        }
    }
    //console.log('redo',zone_x_id,zone_y_id,banList,ava);
    return false;
}