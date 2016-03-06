# -*- coding: utf-8 -*-
"""
Created on Sat Jan 16 11:01:39 2016

@author: yiyuezhuo
"""
import os
#import flask
#from flask import render_template
import jinja2
from jinja2 import Environment, PackageLoader,Template


dir_list=os.listdir('scenario')
href_list=[{'d':d,'s':'index.html?scenario='+'scenario/'+d} for d in dir_list]
tag_list=['<a href="'+href['s']+'"></a>' for href in href_list]

#render_template('laucher_template.html',href_list=href_list)
#env = Environment(loader=PackageLoader('yourapplication', 'templates'))
f=open('launcher_template.html','r')
temps=f.read()
f.close()
temp=Template(temps)
content=temp.render(href_list=href_list)
print content
def dump(content):
    f=open("launcher.html",'w')
    f.write(content)
    f.close()
dump(content)
    