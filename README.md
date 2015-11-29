# sengokushi-port-javascript
Sengokushi(戦国史) is a great Historical Simulation Game in PC.This is project port it to javascript.

这个项目视图将战国史移植到javascript上去，战国史有着众所周知的“简洁”以及众多信息量很大的剧本，这个项目最初是想
把战国史的剧本移植到民国无双上（都是点对点驱动，很相近），不过没人关注，snr_parser.py就是转换成民国无双信息的脚本，
现在那个转民国无双部分删除了，增加了转成JSON/javascript的功能后整合进这个项目。

[他们官方](http://www.max.hi-ho.ne.jp/asaka/ "Title")。

文件结构：
snr_parser.py是提取战国史剧本信息的python脚本，其输出为JSON格式。

project1和project3各是一个实现，project1代码更乱（基本之前没有javascript基础）但更贴近战国史本意，是将领驱动的。

project3是RISK风格的，代码稍微好看一点，但是我懂还是很乱。。只是懒得重构。

project1可以双击进菜单选下一回合，project3要到控制行输next_turn()。试了一下移动端的表现，发现稍作修改貌似就能
正常运行了。

2015/11/28更新
修改了了project3，增加了每回合自动移动设定减少繁琐的操作，不过现在感觉变成路径规划游戏了。另外把上传错误的pick2.py脚本换成snr_parser.py。现在这个脚本能解析更多战国史剧本了，碰到一些错误现在改成直接删除那个项而不是报错，因为project3基本不需要那些经常出错的项。另外很想吐槽效率，仅仅到了官方默认剧本这一级跑一回合就要那么长时间了，这还没引入什么复杂的AI。

2015/11/29更新
增强了AI，原来的执行函数还留着，现在的各函数是以前的“2版”。现在AI会有意调兵力到前线，而且如果进攻会导致自己控制的地方丢失或攻过去又被攻回来就不会进攻。如果有威胁就会撤退。但是没有增援防御的意识，这个东西不好那么直接的和上面的合成。
