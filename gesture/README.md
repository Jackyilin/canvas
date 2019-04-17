# -Gesture_unlock_DEMO
一个用js配合canvas做的手势解锁DEMO练习

## 说明：
- 主要用于学习canvas用法和巩固js；
- 鬼迷心窍地打算全部东西用js动态生成，进而封装，事实是我想多了。。。

## 实现原理：
一、关于解锁图案圆的绘制：
- 难点：如何画出9个相同大小的圆，并且间隔要相同；
- 解决：关键在于半径，其实只要把整个canvas画布按正方形看，计算出能容纳多少条圆的直径，就能算出半径了。具体思路如下图：
![image](https://github.com/ChrisLee0211/-Gesture_unlock_DEMO/blob/master/src/example02.png)

二、如何实现手势滑动轨迹：
- 这里其实原理一点都不复杂，就是繁琐，主要是定义了两个全局列表```lastPoint```（已经被划过的圆的圆心坐标集合）和```restPoint```（还未必划过的圆的圆心坐标集合）；
- 每划过一个圆心就把它的圆心坐标加入到```lastPoint```，同时在```restPoint```中减去一个；

三、如何判断手势触摸点是否在某个圆内：
- 要实现手势经过下一个圆时自动激活圆心且轨迹直线连接到该圆，需要判断此时触摸点的坐标是否在圆内；
- 首先会通过一个```getPosition()```方法获取当前手势停留位置的坐标（相对于canvas画布）；
- 然后：
```javascript
var po = self.getPosition(e) //getPosition()用于获取触摸点相对于canvas的坐标
for(var i =0 ; i < self.arr.length;i++){
                // 遍历每一个圆，判断触摸点是否在圆内;
                //判断原理，当前点的x坐标减去圆心的x坐标的绝对值，如果比半径小，那么就在圆内，Y坐标同理
  if(Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r){
      self.touchFlag = true;
                // 如果是在圆内，就把这个圆的圆心放入被选中的圆集合lastPoint里
      self.lastPoint.push(self.arr[i])
                // 同时，剩下没有被选中的圆集合restPoint要减去一个
      self.restPoint.splice(i,1) //从索引为i的元素开始删除1个
      break
                }
```

##  效果预览：
![image](https://github.com/ChrisLee0211/-Gesture_unlock_DEMO/blob/master/example01.gif)
