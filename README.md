# sengokushi-port-javascript
Sengokushi(戦国史) is a great Historical Simulation Game in PC.This is project port it to javascript.

这个项目视图将战国史移植到javascript上去，战国史有着众所周知的“简洁”以及众多信息量很大的剧本，这个项目最初是想
把战国史的剧本移植到民国无双上（都是点对点驱动，很相近），不过没人关注，pick2.py就是转换成民国无双信息的脚本，
现在那个转民国无双部分废弃了，增加了转成JSON/javascript的功能后整合进这个项目。

[他们官方](http://www.max.hi-ho.ne.jp/asaka/ "Title")。

文件结构：
pick2.py是提取战国史剧本信息的python脚本，其输出为JSON格式。

project1和project3各是一个实现，project1代码更乱（基本之前没有javascript基础）但更贴近战国史本意，是将领驱动的。

project3是RISK风格的，代码稍微好看一点，但是我懂还是很乱。。只是懒得重构。

project1可以双击进菜单选下一回合，project3要到控制行输next_turn()。试了一下移动端的表现，发现稍作修改貌似就能
正常运行了。
