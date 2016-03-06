# -*- coding: utf-8 -*-
"""
Created on Sun Mar 06 14:24:49 2016

@author: yiyuezhuo
"""

'''
This script auto translate chinese or japanese JSON file
to English
'''
import json
import requests
import math
import sys
import os

DISPLAY_PROCESS=True
QUERY_LIMIT=20


def return_monitor(head):
    def _func(f):
        def new_func(*arg,**kwarg):
            if 'process' in kwarg:
                process=kwarg.pop('process')
            else:
                process=False
            r=f(*arg,**kwarg)
            if process:
                print head
                for ch,eng in r.items():
                    print ch,'->',eng
            return r
        return new_func
    return _func
            
@return_monitor('request')
def baidu_trans(words,from_='zh',to='en'):
    if type(words)==str:
        words=[words]
    url='http://fanyi.baidu.com/v2transapi'
    data={'from':from_,'to':to,'query':'\n'.join(words),
          'transtype':'enter','simple_means_flag':3}
    res=requests.post(url,data=data)
    dic=json.loads(res.content)
    r={record['src']:record['dst'] for record in dic['trans_result']['data']}
    return r    
    
def name_fetch(dic):
    zone=dic['name_to_id_zone'].keys()
    people=dic['name_to_id_people'].keys()
    side=dic['name_to_id_side'].keys()
    return list(set(zone+people+side))
def name_trans_fetch(trans_list,query_limit=20,trans=None,process=False):
    if trans==None:
        trans=baidu_trans
    trans_dic={'':''}
    for i in range(int(math.ceil(len(trans_list)/float(query_limit)))):
        section=trans_list[i:(i+1)*query_limit]
        trans_dic.update(trans(section,process=process))
    return trans_dic
    
def name_apply(dic,trans_dic):
    rd={'link':dic['link']}
    for skey in ['zone','people','side']:
        obj_l=[]
        for obj in dic[skey]:
            obj['name']=trans_dic[obj['name']]
            obj_l.append(obj)
        rd[skey]=obj_l
        name_to_id_obj={}
        for name in dic['name_to_id_'+skey].keys():
            name_to_id_obj[trans_dic[name]]=dic['name_to_id_'+skey][name]
        rd['name_to_id_'+skey]=name_to_id_obj
        id_to_name_obj={}
        for id in dic['id_to_name_'+skey].keys():
            id_to_name_obj[id]=trans_dic[dic['id_to_name_'+skey][id]]
        rd['id_to_name_'+skey]=id_to_name_obj
    return rd
    
def run(path,objpath='output.js'):
    f=open(path)
    s=f.read()
    head=s[:11]
    body=s[11:]
    f.close()
    scen=json.loads(body)
    trans_list=name_fetch(scen)
    trans_dic=name_trans_fetch(trans_list,process=DISPLAY_PROCESS,
                               query_limit=QUERY_LIMIT)
    new_dic=name_apply(scen,trans_dic)
    body2=json.dumps(new_dic)
    f=open(objpath,'w')
    f.write(head+body2)
    f.close()
    print path,'-->',objpath
    
def run_all(root,prefix='eng'):
    succ_l=[]
    fail_l=[]
    for name in os.listdir(root):
        try:
            path=os.path.join(root,name)
            objpath=os.path.join(root,prefix+'_'+name)
            if os.path.exists(objpath):
                continue
            else:
                run(path,objpath)
                succ_l.append((path,objpath))
        except Exception,e:
            print path,'!->',objpath
            fail_l.append((path,objpath,e))
    print 'summary'
    for path,objpath in succ_l:
        print path,'-->',objpath
    for path,objpath,error in fail_l:
        print path,'!->',objpath
        print error
    print 'clear'
    
if __name__=='__main__':
    if len(sys.argv)==1:
        print 'Usage:'
        print 'python ch_to_english.py input.js output.js'
        print 'or'
        print 'python ch_to_english.py -a project3/scenario'
    else:
        if sys.argv[1]=='-a':
            run_all(sys.argv[2])
        else:
            path=sys.argv[1]
            objpath=sys.argv[2] if len(sys.argv)>=3 else None
            run(path,objpath)
                
        
'''
f=open('project3/scenario/fantasy.js')
s=f.read()
f.close()
content=s[11:]
scen=json.loads(content)
'''