# -*- coding: utf-8 -*-
"""
Created on Thu Jul 16 23:02:52 2015

@author: yiyuezhuo
"""

'''我突然想起来pyparsing说它不适合解决一些问题，于是我发现我就在用它解决不适合解决的问题。。
这个模块将用传统方法split解析三个部分的文件。这尼玛经典的逗号分隔文件用啥语法解析器真是作死。。。'''

import networkx as nx
import json

class Parser(object):
    def __init__(self):
        self.mark=None
        self.sign_seq=None#感觉这个用继承处理更好
        self.content=[]
        self.name=None
    def parse(self,file_name):
        self.name=file_name
        f=open(file_name,'r')
        ssl=f.readlines()
        f.close()
        sl=[]
        for i in ssl:
            sl.append(i.decode(encoding='GB2312',errors='ignore'))   
        return self.parse_string_l(sl)
    def pre(self,s):
        ss=s.replace(':',',')
        sss=ss.replace(' ','')
        sss=sss.replace('\t','')
        return sss
    def match(self,seq):
        #这里应不应该转成字典呢，涉及一些逻辑问题
        obj={}
        for i in range(len(self.sign_seq)):
            try:
                obj[self.sign_seq[i]]=seq[i]
            except:
                print self.sign_seq
                print seq
                raw_input('!BUG!')
        return obj
    def parse_string_l(self,ssl):
        stat=0
        '''作者十分不知所云的使数据文件有一个&+换行符，谁会直接去看数据文件！
        这尼玛除了增加解析难度有什么N用。'''
        sl=self.remove_postfix(ssl)
        for line in sl:
            if stat==0:
                if self.mark+' {' in line:
                    stat=1
                else:
                    continue
            elif stat==1:
                if '}' in line:
                    break
                linep=self.pre(line)
                seq=linep.split(',')
                self.content.append(self.match(seq))
        self.sign_map()
        self.pure()#这个reduce是将属性交叉考虑，比如去掉一些属性等。与上面的对每个属性操作不同
        return self.content
    def remove_postfix(self,ssl):
        sl=[]
        enter_down=False
        #print 'enter'
        for line in ssl:
            if enter_down:
                if line[-3:]=='&+\n':
                    #print 'hit'
                    enter_down=True
                    sl[-1]=sl[-1]+line[:-3]
                else:
                    enter_down=False
                    sl[-1]=sl[-1]+line
            else:
                if line[-3:]=='&+\n':
                    #print 'hit'
                    enter_down=True
                    sl.append(line[:-3])
                else:
                    enter_down=False
                    sl.append(line)
        return sl
    def sign_map(self):
        for obj in self.content:
            for key in obj.keys():
                obj[key]=self.change(key,obj[key])
    def change(self,key,value):#进一步对每个sign的内容进行处理而不是保留原始形式
        return value
    def pure(self):
        return
        '''
        for obj in self.content:
            for key in obj.keys():
                obj[key]=obj[key].decode('gb2312').encode('utf-8') if type(obj[key])==type('') else obj[key]
                '''
        
class Shiro_Parser(Parser):
    def __init__(self):
        Parser.__init__(self)
        self.mark='Shiro'
        self.sign_seq=['id','name','zone','fort_level_max','fort_level','x','y','pop_max','pop',
        'trade_max','trade','mine_max','mine','port?','port_ship','battle_ship','sea?','loyal',
        'type','side','description']
    def change(self,key,value):
        if key in ['battle_ship','fort_level','fort_level_max','loyal','mine',
                   'mine_max','pop','pop_max','port_ship','trade','trade_max',
                   'x','y']:
            return int(value)
        elif key in ['port?','sea?']:
            return True if value==u'YES' else False
        elif key in ['id','side']:
            return int(value[2:])
        elif key in ['name','description']:
            return value[1:-1]
        else:
            return value
        
class Connect_Parser(Parser):
    def __init__(self):
        Parser.__init__(self)
        self.mark='ShiroConnect'
        self.sign_seq=['out','in','type']#后面的都不关心，估计是怎么画之类的信息
    def change(self,key,value):
        if key in ['out','in']:
            return int(value[2:])
        else:
            return value

class Bushou_Parser(Parser):
    def __init__(self,country_pure=None):
        Parser.__init__(self)
        self.country_pure={} if country_pure==None else country_pure
        self.mark='Bushou'
        self.sign_seq=['id','name','force','policy','IQ','army','navy','loyal','wild',
                       'cav','inf','art','birth','died','died_type','enter_date',
                       'side','inherit','enter_location','description']
    def change(self,key,value):
        '''这个东西的坑爹之处在于一些属性用的是坑爹的语法来实现的，而且我也不好断言之
        对于这些属性，诸如birth等全部直接不处理'''
        if key in ['IQ','army','art','cav','force','inf','inherit','loyal','navy',
                   'policy','wild']:
                       return int(value)
        elif key=='id':
            return int(value[2:])
        elif key=='side':#注意location那个有两种写法，最好根本不要处理.还有个free状态这里没处理
            s=value[1:-1] if value[0]=='(' else value
            return int(s[2:])
        elif key in ['name','description']:
            return value[1:-1]
        elif key=='enter_location':#这里假设了没有国登场武将，如果要扩展的话就只能加入国的语义了，比较烦
            try:
                return int(value[2:])
            except ValueError:#通过传入一个特殊词典暂时解决这个问题
                value=self.country_pure[value[2:]]
                return int(value)
        else:
            return value
    

                       
class Daimyou_Parser(Parser):
    def __init__(self):
        Parser.__init__(self)
        self.mark='Daimyou'
        self.sign_seq=['id','name','nation','sea','mine','gold','art','ship',
        'player?','action','description']
    def change(self,key,value):
        if key in ['art','gold','mine','sea','ship']:
            return int(value)
        elif key=='player?':
            return True if value==u'YES' else False
        elif key=='id':
            return int(value[2:])
        elif key=='name':
            return value[1:-1]
        else:
            return value

class Snr_parser(object):
    def __init__(self,file_name,country_pure=None):
        self.name=file_name
        self.daimyou=Daimyou_Parser().parse(file_name)
        self.shiro=Shiro_Parser().parse(file_name)
        self.connect=Connect_Parser().parse(file_name)
        self.bushou=Bushou_Parser(country_pure=country_pure).parse(file_name)
        self.side=self.daimyou
        self.zone=self.shiro
        self.link=self.connect
        self.people=self.bushou#重新命名以避免日语使用，之前那么叫是因为战国史编辑器里就这样叫
        self.name_to_id_zone={}
        self.id_to_name_zone={}
        for i in self.zone:
            self.name_to_id_zone[i['name']]=i['id']
            self.id_to_name_zone[i['id']]=i['name']
        self.name_to_id_people={}
        self.id_to_name_people={}
        self.id_to_name_side={}
        self.name_to_id_side={}
        for i in self.side:
            self.id_to_name_side[i['id']]=i['name']
            self.name_to_id_side[i['name']]=i['id']
        for i in self.people:
            self.name_to_id_people[i['name']]=i['id']
            self.id_to_name_people[i['id']]=i['name']
    def link_setup(self):
        edge_list=[]
        for i in self.link:
            edge_list.append((i['out'],i['in']))
        edge_list=[(i['out'],i['in']) for i in self.link]
        self.G=nx.from_edgelist(edge_list)
        for zone in self.zone:
            zone['link']=[self.id_to_name_zone[nei_id] for nei_id in self.G.neighbors(zone['id'])]
            zone['side_name']=self.id_to_name_side[zone['side']]
    def people_setup(self):
        for person in self.people:
            person['side_name']=self.id_to_name_side[person['side']]
    def side_setup(self):
        #这个地方应该追加commander，HQ，units，diplomacy,friendship,market
        sides=[i['name'] for i in self.side]
        for side in self.side:
            side_id=side['id']
            leaders=[person for person in self.people if person['side']==side_id]
            #print leaders,side['name'],side['id']
            side['units']=[i['id'] for i in leaders]
            inl=[i['inherit'] if i['inherit']!=-1 else 9 for i in leaders]
            if len(inl)>0:
                commander=leaders[inl.index(min(inl))]
                side['commander']=commander['name']
                side['HQ']=self.id_to_name_zone[commander['enter_location']]
            else:
                side['commander']=''
                side['HQ']=''
            side['diplomacy']=self.side_n_f(sides)
            side['friendship']=self.side_n_f(sides)
            side['market']=self.side_n_f(sides)
    def side_n_f(self,sides,n=50):
        assert(len(sides)<50)
        l=sides+['' for i in range(n-len(sides))]
        ll=['0' for i in range(n)]
        return zip(l,ll)
    def total_dict(self,condense=False):
        '''return total value as json format'''
        rd1={'side':self.side,'link':self.link,'people':self.people,'zone':self.zone}
        rd2={'name_to_id_zone':self.name_to_id_zone,
            'id_to_name_zone':self.id_to_name_zone,'name_to_id_people':self.name_to_id_people,
            'id_to_name_people':self.id_to_name_people,'name_to_id_side':self.name_to_id_side,
            'id_to_name_side':self.id_to_name_side}
        if condense:
            return rd1
        else:
            rd1.update(rd2)
            return rd1
    def to_json(self,condense=False):
        rd=self.total_dict(condense=condense)
        js=json.dumps(rd)
        return js
    def to_js(self,name=None,obj_name=None,condense=False):
        '''Why the 25kb file be a 105KB js-file?I can't image the big file situation.
        Fine ,I still get a 99KB file even I cut the id_name dictionary.So redundancy.'''
        if name==None:
            name=self.name.split('.')[0]+'.js'
        if obj_name==None:
            obj_name=self.name.split('.')[0]+'_data'
        rs=self.to_json(condense=condense)
        f=open(name,'w')
        f.write(obj_name+'=')
        f.write(rs)
        f.close()
        

        
            
            
    
#snr=Snr_parser('Roma01.snr')


def is_tuple(obj):
    return type(obj)==type(())
def is_list(obj):
    return type(obj)==type([])
#下面是ROC剧本对应的类,这些类对应一个xnl元素。必须能转换成文本的xml元素
class RocE(dict):
        def __init__(self,iid):
            dict.__init__(self)
            self.order=[]#字典里的顺序是用这个列表来声明和规范的，虽然并没有什么卵用
            self.name=''
            self.id=iid
        def tuple_string(self,key,body):
            tl=['' if i==None else str(i) for i in body]
            #print key,body,tl
            return ' '+key+'='+','.join(tl)
        def toXML(self):#关于那个是不是xml我不想评论..只是这样写起来比较好看
            '''信息全部保存在dic中，dic假如对应一个列表，则那个列表会对应若干行同样key的
            标示文本。如果不是列表，则直接使用key=attr的语义。如果是元组。无论是列表里的
            元组还是本来就是元组（然而绝不会发生元组里的元组的情况）。则代表一个逗号表达式'''
            head='['+self.name+']'+str(self.id)
            tail='[/'+self.name+']\n'
            cl=[]
            for key in self.order:
                body=self[key]
                if not(is_tuple(body)) and not(is_list(body)):
                    sss=' '+key+'='+str(body)
                    cl.append(sss)
                elif is_tuple(body):
                    sss=self.tuple_string(key,body)
                    cl.append(sss)
                elif is_list(body):
                    #print 'is_list',body
                    for i in body:
                        if is_tuple(i):
                            sss=self.tuple_string(key,i)
                            cl.append(sss)
                        else:
                            sss=' '+key+'='+str(i)
                            cl.append(sss)
            result='\n'.join([head]+cl+[tail])
            return result
        def loadDic(self,dic):#标准的载入方法是从；另一个dic中读取
            pass
        
class CITY(RocE):
    def __init__(self,iid,dic):
        RocE.__init__(self,iid)
        self.name='CITY'
        self.order=['Name','Graph','PosX','PosY','Faction','Owner','Index','Delay',
                    'SP','TP','PP','NavyPt','Size','Police','Terrain','Resource0',
                    'Resource1','Resource2','Resource3','Resource4','Resource5','SLink']
        self.loadDic(dic)
    def loadDic(self,dic):
        self['Name']=dic['name']
        self['Graph']=''
        self['PosX']=str(int(dic['x']/50))
        self['PosY']=str(int(dic['y']/50))
        self['Faction']='黃埔系'
        self['Owner']=dic['side_name']
        self['Index']=str(self.id)
        self['Delay']=str(0)
        self['SP']=str(self.SP(dic))
        self['TP']=str(self.TP(dic))
        self['PP']=str(self.PP(dic))
        self['NavyPt']=str(self.NavyPt(dic))
        self['Size']='0'
        self['Police']=dic['loyal']
        self['Terrain']='Plain'#战国史里是通过路线来体现“地形”，所以反应不出这个信息
        self['Resource0'],self['Resource1'],self['Resource2']='0','0','0'
        self['Resource3'],self['Resource4'],self['Resource5']='0','0','0'
        #这个时候link应该已经装备了它自己的邻接信息,称为link，是一个列表，里面有其他的名字
        self['SLink']=dic['link']
    def SP(self,dic):
        return 1
    def TP(self,dic):
        return 1
    def PP(self,dic):
        return 1
    def NavyPt(self,dic):
        return 0
        
class UNIT(RocE):
    def __init__(self,iid,dic):
        RocE.__init__(self,iid)
        self.name='UNIT'
        self.order=['Name','Leader','BattleTry','Country','Strength','Stress',
                    'UnitClass','ExtraUnit','Experience','Supplied','Lv']
        self.loadDic(dic)
    def loadDic(self,dic):
        self['Name']=dic['name']
        self['Leader']=dic['name']#这个设置合不合逻辑我不想评论
        self['BattleTry']='0'
        self['Country']=dic['side_name']
        self['Strength']='100'
        self['Stress']='0'
        self['UnitClass']='0'
        self['ExtraUnit']='0'
        self['Experience']='0'
        self['Supplied']='1'
        self['Lv']='1'
        
class LEADER(RocE):
    def __init__(self,iid,dic):
        RocE.__init__(self,iid)
        self.name='LEADER'
        self.order=['Name','Status','Power','History','Faction','Will','Loyality',
                    'UnitIndex','Icon','RecruitType','RecruitValue','LeaderSkill0',
                    'LeaderSkill1','LeaderSkill2','LeaderSkill3','LeaderSkill4',
                    'LeaderSkill5','Description0','Description1','Description2',
                    'Description3']
        self.loadDic(dic)
    def loadDic(self,dic):
        self['Name']=dic['name']
        self['Status']=dic['inherit']
        self['Power']=dic['force']
        self['History']='1'
        self['Faction']='黃埔系'
        self['Will']=dic['wild']
        self['Loyality']=dic['loyal']
        self['UnitIndex']=dic['id']
        self['Icon']='3'
        self['RecruitType']='4'
        self['RecruitValue']='0'
        self['LeaderSkill0']='HP+10'
        self['LeaderSkill1']='HP+10'
        self['LeaderSkill2']='HP+10'
        self['LeaderSkill3']='HP+10'
        self['LeaderSkill4']='HP+10'
        self['LeaderSkill5']='HP+10'
        self['Description0']=''
        self['Description1']=''
        self['Description2']=''
        self['Description3']=''
        
class FACTION(RocE):
    def __init__(self,iid,dic):
        RocE.__init__(self,iid)
        self.name='FACTION'
        self.order=['Name','Player','BGM1','EmpireName','ChinaName','NationName',
                    'BattleBonus','AttackBouns','DefenseBonus','NextSoul','SoulPlayer',
                    'SoulAP','AP','SP','TP','BanWeapon','OffboardSP','OffboardIP',
                    'OffboardTP','Field_Stat','War_Stat','Government_Stat',
                    'Defense_Stat','Monpooly_Stat','Die_Stat','Value_Stat',
                    'Strike_Stat','Art_Stat','Armor_Stat','NoPoint_Stat','Faction',
                    'Flag','WarTry','MoveTry','StrikeTry','TrainTry','ReformTry',
                    'DipTry','SPTry','Index','Culture','Neutral','Rubbish',
                    'Government','Economy','Value','Strategy','Target','Master',
                    'Commander','Conscription','Conscription1','Conscription2',
                    'Conscription3','Conscription4','Reform','ReformPoint','Agenda0',
                    'Agenda1','Agenda2','Agenda3','Agenda4','Description0','Description1',
                    'Description2','Description3','EndingPNG','EndingText','EndingEvent',
                    'HeadQuarter','SortList','Feat','BanCom','BanImp','BanPol',
                    'Formation','Diplomacy','Friendship','Market']
        self.loadDic(dic)
    def loadDic(self,dic):
        self['Name']=dic['name']
        self['Player']='Computer'
        self['BGM1']='Dadao March.mp3'
        self['EmpireName']=dic['name']
        self['ChinaName']=dic['name']
        self['NationName']=dic['name']
        self['BattleBonus'],self['AttackBouns'],self['DefenseBonus']='0','0','0'
        self['NextSoul']='0'
        self['SoulPlayer']=''
        self['SoulAP']='0'
        self['AP'],self['SP'],self['TP'],self['BanWeapon']='0','0','0','0'
        self['OffboardSP'],self['OffboardIP'],self['OffboardTP']='0','0','0'
        self['Field_Stat'],self['War_Stat'],self['Government_Stat']='0','0','1'
        self['Defense_Stat'],self['Monpooly_Stat'],self['Die_Stat']='0','0','0'
        self['Value_Stat'],self['Strike_Stat'],self['Art_Stat']='0','0','0'
        self['Armor_Stat'],self['NoPoint_Stat']='0','0'
        self['Faction']='黃埔系'
        self['Flag']=self.id
        self['WarTry'],self['MoveTry'],self['StrikeTry'],self['TrainTry']='-1','0','0','0'
        self['ReformTry'],self['DipTry'],self['SPTry']='0','0','0'
        self['Index']=self.id
        self['Culture'],self['Neutral'],self['Rubbish']='0','0','0'
        self['Government']='Warlord'
        self['Economy']='Traditional'
        self['Value']='Religion'
        self['Strategy']='Banzai'
        self['Target']='None'
        self['Master']='[無所屬]'
        self['Commander']=dic['commander']
        self['Conscription'],self['Conscription1'],self['Conscription2']='0','1','6'
        self['Conscription3'],self['Conscription4']='4','9'
        self['Reform'],self['ReformPoint']='None','4'
        self['Agenda0'],self['Agenda1'],self['Agenda2']='Warlord','Traditional','Banzai'
        self['Agenda3'],self['Agenda4']='Religion','China'
        self['Description0'],self['Description1'],self['Description2'],self['Description3']='','','',''
        self['EndingPNG']='commonending.PNG'
        self['EndingText']=''
        self['EndingEvent']='-1'
        self['HeadQuarter']=dic['HQ']
        self['SortList']=dic['units']
        self['Feat']=['','']
        self['BanCom']=['','']
        self['BanImp']=['','']
        self['BanPol']=['','']
        self['Formation']=self.formation()
        self['Diplomacy']=dic['diplomacy']
        self['Friendship']=dic['friendship']
        self['Market']=dic['market']
    def formation(self):
        l=[]
        for left in range(7):
            for right in range(7):
                l.append((left,right,-1))
        return l
        
class BASIC(RocE):
    def __init__(self,iid,dic={}):
        RocE.__init__(self,iid)
        self.order=['CampaignName','Turn','CurrentPlayer','AICheat','Script']
        self.loadDic(dic)
        self.name='BASIC'
    def loadDic(self,dic):#这里这个并没有真的原型字典可用
        self['CampaignName']='战国史转化剧本'
        self['Turn']='0'
        self['CurrentPlayer']='0'
        self['AICheat']='0'
        self['Script']=[('102','1'),('106','1')]
        
class MAIN(object):
    def __init__(self,name='MiniWorldWar2.snr'):
        snr=Snr_parser(name)
        snr.link_setup()
        snr.people_setup()
        snr.side_setup()
        self.snr=snr
        self.basic=BASIC(0)
        self.factions=[FACTION(i,snr.side[i]) for i in range(len(snr.side))]
        self.citys=[CITY(i,snr.zone[i]) for i in range(len(snr.zone))]
        self.leaders=[LEADER(i,snr.people[i]) for i in range(len(snr.people))]
        self.units=[UNIT(i,snr.people[i]) for i in range(len(snr.people))]
    def output(self):
        te=[self.basic.toXML()]+[i.toXML() for i in self.factions]+[i.toXML() for i in self.citys]\
        +[i.toXML() for i in self.leaders]+[i.toXML() for i in self.units]
        #return te
        f=open('output_test.txt','w')
        for i in te:
            f.write(i)
        f.close()
        return te
        
if __name__=='__main__':
    main=MAIN('MiniWorldWar2.snr')
    #te=main.output()
    snr=main.snr
    snr2=Snr_parser('Europe1805.snr',country_pure={'ENGLAND':'0101'})
    #print te[0]
    #print te[1]
    #a=snr.zone[0]