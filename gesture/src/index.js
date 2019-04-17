(function(){
    window.canvasLock = function (obj) { 
        this.width = obj.width;
        this.height = obj.height;
        this.chooseType = obj.chooseType; //每行多少个圈点
     };

    //  利用js来动态生成DOM
    canvasLock.prototype.initDom = function(){
        var wrap = document.createElement('div');
        var canvas = document.createElement('canvas');
        var str = '<h4 id="title" class="title">绘制解锁图案</h4>'
        wrap.setAttribute('style','position:absolute;top:0;left:0;right:0;bottom:0');
        canvas.setAttribute('id','canvas');
        canvas.style.cssText = 'background-color: #305066;display: inline-block;margin-top: 15px;';
        wrap.innerHTML=str;
        wrap.appendChild(canvas);
        var width = this.width || 300;
        var height = this.height || 300;
            
        document.body.appendChild(wrap);

            // 高清屏锁放
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";

        canvas.width = width;
        canvas.height = height;
        
    }

    canvasLock.prototype.drawCircle = function (x,y) {
        //初始化解锁密码界面
        this.ctx.strokeStyle = '#CFE6FF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.r, 0, Math.PI*2, true);
        this.ctx.closePath();
        this.ctx.stroke();
      }

    // 创建解锁点的坐标，根据canvas的大小来平均分配半径
    canvasLock.prototype.createCircle = function(){
        var n = this.chooseType;
        var count = 0;
        this.r = this.ctx.canvas.width / (2 + 4 * n);
        this.lastPoint = []; //用于记录已经被选中的圆心
        this.arr = []; //用于存放要绘制的圆心
        this.restPoint = []; //用于存放没有被选中的圆心
        var r = this.r;
        for(var i = 0; i < n ; i++){
            for(var j = 0; j < n; j++){
                count ++;
                var obj = {
                    x : j *4 *r + 3*r,
                    y : i *4 *r + 3*r,
                    index: count
                };
                this.arr.push(obj);
                this.restPoint.push(obj)
            }
        }

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for (var i = 0 ; i < this.arr.length ; i++){
            // 利用计算出来的圆心和半径，开始画圆，但是每画一个都必须清空画布一次
            this.drawCircle(this.arr[i].x, this.arr[i].y)
        }
        
    }

    canvasLock.prototype.bindEvent = function(){
        var self = this //提前保存this指向的对象到self中
        this.canvas.addEventListener("touchstart",function(e){
            // 2、touchstart判断是否点击的位置处于圆内getPosition，处于则初始化
            var po = self.getPosition(e) //getPosition()用于获取触摸点相对于canvas的坐标
            for(var i =0 ; i < self.arr.length;i++){
                // 遍历每一个圆，判断触摸点是否在圆内;
                if(Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r){
                    self.touchFlag = true;
                // 如果是在园内，就把这个圆的圆心放入被选中的圆集合lastPoint里
                    self.lastPoint.push(self.arr[i])
                // 同时，剩下没有被选中的圆集合restPoint要减去一个
                    self.restPoint.splice(i,1) //从索引为i的元素开始删除1个
                    break
                }
            }
        },false);

        this.canvas.addEventListener('touchmove',function(e){
            // touchmove用于绘制选中圆心样式和线条
            if(self.touchFlag){
                // 只有当圆心被选中才开始出发绘制函数
                self.update(self.getPosition(e))
            }
        },false)

        this.canvas.addEventListener('touchend',function(e){
            // touchend用于手势离开后开始验证密码是否正确
            if(self.touchFlag){
                self.lockTips(self.lastPoint);
                // 定义手势离开后300ms内马上重置圆
                setTimeout(function(){self.reset()},300);
            }

        },false)

    }

    canvasLock.prototype.init = function(){
        this.initDom();
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d') ;
        //  生成9个圆的函数
        this.createCircle();
        // touchFlag用于判断触摸点是否在小圆里
        this.touchFlag = false;
        // 触发手势画圈连线的函数
        this.bindEvent();
    }

    canvasLock.prototype.getPosition = function (e) {
        /*1、e.currentTarget返回的是canvas对象，也就是canvas的dom元素。 
          2、getBoundingClientRect用于获取某个html元素相对于视窗的位置集合。
          3、执行 object.getBoundingClientRect();会得到元素的top、right、
          bottom、left、width、height属性，这些属性以一个对象的方式返回。
        */
        var rect = e.currentTarget.getBoundingClientRect();
        
        var po = {
            x:(e.touches[0].clientX - rect.left),
            y:(e.touches[0].clientY - rect.top)
        }
        return po
      }

    canvasLock.prototype.update = function (po) { 
        // 作画前清空一下画布,然后重新画9个小圆
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for (var i = 0 ; i < this.arr.length ; i++){
            this.drawCircle(this.arr[i].x, this.arr[i].y)
        }
        this.drawPoint()//画小圆心
        this.drawLine(po)//根据当前触摸点坐标绘制延伸的直线

        for(var i = 0 ; i < this.restPoint.length ; i++){
            // 遍历没有经过的圆集合，判断手势位置是不是在下一个圆里，是的话就绘制圆点
            if(Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r){
                this.drawPoint();
                // 同时，把已经激活过的圆心由restPoint集合转到lastPoint集合
                this.lastPoint.push(this.restPoint[i]);
                this.restPoint.splice(i,1);
                break
            }
        }
    }

    canvasLock.prototype.drawPoint = function () {
        // drawPoint是用于绘制激活圆心的函数
        for(var i = 0; i < this.lastPoint.length; i++){
            // 从已经过的圆集合中取到圆心坐标
            this.ctx.fillStyle = '#CFE6FF';
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x,this.lastPoint[i].y,this.r/2, 0, Math.PI*2, true);
            this.ctx.closePath();
            this.ctx.fill();
        }
    }

    canvasLock.prototype.drawLine = function (po) {
        // 绘制解锁的轨迹线条，从lastPoint集合中的圆心作为起点画线
        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);
        for (var i = 0 ; i < this.lastPoint.length ; i++){
            this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
        }
        this.ctx.lineTo(po.x, po.y);
        this.ctx.stroke();
        this.ctx.closePath();
      }

    // lockTips()方法用于表示解锁验证结果，其中调用了checkPass()方法来验证是否成功
    canvasLock.prototype.lockTips = function(){
        // 
        if(this.checkPass()){
            document.getElementById('title').innerHTML = '解锁成功';
            this.drawStatusPoint('#2CFF26') //drawStatusPoint()方法用于验证结果的样式
        }else{
            document.getElementById('title').innerHTML = '解锁失败';
            this.drawStatusPoint('red')
        }
    }

    canvasLock.prototype.checkPass = function () {
        var password = '12589', input = '';
        //根据每个圆的索引来验证密码
        for(var i = 0 ; i < this.lastPoint.length ; i++){
            input += this.lastPoint[i].index;
        }
        
        return password === input
      }


    canvasLock.prototype.drawStatusPoint = function (type) {
        for (var i = 0 ; i < this.lastPoint.length ; i++){
            // 改变选中圆的样式
            this.ctx.strokeStyle = type;
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
        }
      }

    canvasLock.prototype.reset = function () {
        //用于手指离开屏幕后清除所有轨迹并重新画圆
        this.createCircle()
      }
})();