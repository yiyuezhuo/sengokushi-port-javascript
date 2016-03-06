# -*- coding: utf-8 -*-
"""
Created on Thu Jul 16 23:02:52 2015

@author: yiyuezhuo
"""

'''我突然想起来pyparsing说它不适合解决一些问题，于是我发现我就在用它解决不适合解决的问题。。
这个模块将用传统方法split解析三个部分的文件。这尼玛经典的逗号分隔文件用啥语法解析器真是作死。。。'''

#import networkx as nx
import json
import sys

class ParseErrorDel(Exception):
	def __init__(self,value):
             Exception(self)
             self.value=value
class ParseErrorPass(Exception):
        pass
class ParseErrorRem(Exception):
    pass

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
                raise ParseErrorRem
        return obj
    def parse_string_l(self,ssl):
        stat=0
        '''作者十分不知所云的使数据文件有一个&+换行符，谁会直接去看数据文件！
        这尼玛除了增加解析难度有什么N用。'''
        sl=self.remove_postfix(ssl)
        for line_index in range(len(sl)):
                line=sl[line_index]
                try:
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
                except ParseErrorPass:
                        pass
                except ParseErrorRem:
                        print 'in t-line:',line_index
                        print 'origin:',line
        self.sign_map()
        self.pure()#这个reduce是将属性交叉考虑，比如去掉一些属性等。与上面的对每个属性操作不同
        return self.content
    def remove_postfix(self,ssl):
        #有的剧本居然在那几个定义里有注释，真是惊了，难道是手写的
        #现在这里除了负责行合并还负责消去注释行
        sl=[]
        enter_down=False
        #print 'enter'
        #行合并
        for line in ssl:
            if enter_down:
                if line[-2:]=='+\n':
                    #print 'hit'
                    enter_down=True
                    sl[-1]=sl[-1]+line[:-3]
                else:
                    enter_down=False
                    sl[-1]=sl[-1]+line
            else:
                if line[-2:]=='+\n':
                    #print 'hit'
                    enter_down=True
                    sl.append(line[:-3])
                else:
                    enter_down=False
                    sl.append(line)
        #消去注释行
        rl=[]
        for line in sl:
            if line[:2]!='//':
                rl.append(line)
        return rl
    def sign_map(self):
        bugl=[]
        for obj in self.content:
            try:
                    for key in obj.keys():
                        obj[key]=self.change(key,obj[key])
            except ParseErrorPass:
                        bugl.append(obj)
        for bug in bugl:
                self.content.remove(bug)
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
            #return int(value[2:])
            return value[2:]
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
            #return int(value[2:])
            return value[2:]
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
            try:
                #return int(value[2:])
                return value[2:]
            except:
                print 'id transform unknow error.removed'
                raise ParseErrorPass
        elif key=='side':#注意location那个有两种写法，最好根本不要处理.还有个free状态这里没处理
            try:
                    s=value[1:-1] if value[0]=='(' else value
                    return int(s[2:])
            except ValueError:
                    raise ParseErrorPass
        elif key in ['name','description']:
            return value[1:-1]
        elif key=='enter_location':#这里假设了没有国登场武将，如果要扩展的话就只能加入国的语义了，比较烦
            try:
                return int(value[2:])
            except ValueError:#通过传入一个特殊词典暂时解决这个问题
                try:
                    value=self.country_pure[value[2:]]
                    return int(value)
                except:
                    print 'Warning:Try country pure fail.Removed'
                    raise ParseErrorPass
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
            #return int(value[2:])
            return value[2:]#从苍狼剧本来看其实都是可以不是数字的，狗眼已瞎
        elif key=='name':
            return value[1:-1]
        else:
            return value
            
class from_edgelist(object):
    def __init__(self,edge_list):
        self.node={}
        self.edge={}
        for edge in edge_list:
            if not self.node.has_key(edge[0]):
                self.node[edge[0]]={'nei':[]}
            if not self.node.has_key(edge[1]):
                self.node[edge[1]]={'nei':[]}
            if not self.edge.has_key(edge):
                self.edge[edge]={}
                self.node[edge[0]]['nei'].append(edge[1])
                self.node[edge[1]]['nei'].append(edge[0])
    def neighbors(self,iid):
        return self.node[iid]['nei']
    
            

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
        self.G=from_edgelist(edge_list)
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
            #obj_name=self.name.split('.')[0]+'_data'
            obj_name='SNR_script'
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

def trans(fname1,fname2):
    snr=Snr_parser(unicode(fname1))
    snr.to_js(fname2)
        
if __name__=='__main__':
    #snr3=Snr_parser('MiniWorldWar2.snr',country_pure={'ENGLAND':'0101'})
    if len(sys.argv)>=2:
        if sys.argv[1]=='trans':
            if len(sys.argv)>=3:
                fname1=sys.argv[2]
            else:
                fname1='input.snr'
            if len(sys.argv)>=4:
                fname2=sys.argv[3]
            else:
                fname2='output.js'
            trans(fname1,fname2)
            print fname1,'->',fname2
        elif sys.argv[1]=='help':
            print 'Example usage'
            print '$ python snr_picker.py trans scenario.snr obj.js'
        else:
            print '$ python snr_picker.py help for help doc'
    '''
    s=raw_input('Please input the file name you want to transform:')
    s=unicode(s)
    snr=Snr_parser(s,country_pure={'ENGLAND':'0101'})
    ss=raw_input('load sucess!please give a name as javascript file to export:')
    snr.to_js(ss)
    raw_input('OK! please press any key to continue.')
    '''
