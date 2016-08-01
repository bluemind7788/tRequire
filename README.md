# 自己动手写Requirejs
## 1 测试用例
[https://github.com/bluemind7788/tRequire](https://github.com/bluemind7788/tRequire)
## 2 引入
参照requirejs的api，我们来思考一下问题
- require和define方法都做了什么事情
- 模块的数据结构如何定义
- 如何用javascript去动态的加载远程的js文件
- 如何判断一个远程js文件加载完毕
- 程序执行的时机有哪些
- 如何判断所有的js文件都已经加载完毕
- 所有js加载完成之后，callback函数是按什么顺序来执行，怎么做
- 整个的执行过程是怎样的

## 3 require和define方法都做了什么事情
require和define里面定义了当前模块的依赖模块和回调函数，模块之间是树形的依赖关系，当它们执行后应该把构建模块的依赖树的工作做完，并且还要去触发加载当前模块的依赖模块。
## 4 模块的数据结构如何定义
一个模块应该至少包含：模块的url、所有依赖模块url、回调函数。
``` javascript
module = {
    url: 'xx/xxx',
    deps: [],
    cb: function(){}
}
```
## 5 如何用javascript去动态的加载远程的js文件
js动态加载js文件可以用创建`<script>`标签的方式来实现，详细代码如下
``` javascript
var js = document.createElement('script');
js.src = url;
if(navigator.appName.toLowerCase().indexOf('netscape') == -1){
    js.onreadystatechange = function(){
        if(js.readyState == 'complete'){
            jsLoaded(js,url);
        }
    }
}else{
    js.onload = function(){
        jsLoaded(js,url);
    }
}
document.head.appendChild(js)

```
## 6 如何判断一个远程js文件加载完毕
参考上面代码
## 7 程序执行的时机有哪些
程序的执行时机有两个地方：一个是requirejs代码执行时，这时会根据`data-main`的路径去加载入口的js；一个是一个js文件加载完毕之后，这时需要去判断是否需要执行模块的回调函数。
## 7 如何判断所有的js文件都已经加载完毕
我们定义一个loading的数组来存储正在加载的模块，当在执行require或define方法的时候将依赖模块加到loading里，当每一个js加载完毕之后去loading里移除这个模块，之后判断loading是否已经为空，如果loading已经空了，说明所有模块都已加载完毕。
``` javascript
module = {
    url: 'xx/xxx',
    deps: [],
    cb: function(){}
}
```
## 8 如何用javascript去动态的加载远程的js文件
js动态加载js文件可以用创建`<script>`标签的方式来实现，详细代码如下
``` javascript
var jsLoaded = function(js,url) {
	for(var i = 0;i<context.waiting.length;i++) {
		if(context.waiting[i] == url) {
			context.waiting.splice(i, 1)
		}
	}
	context.loaded.push(url);
	
	if(context.waiting.length == 0) {
		excuteCb(context.topModule)
	}
}

```
## 9 所有js加载完成之后，callback函数是按什么顺序来执行，怎么做
当所有js都加载完毕之后，需要去执行所有模块的回调函数。因为被依赖的模块必须要先执行，所以通过后序遍历来执行回调函数。
``` javascript
var excuteCb = function(mod) {
	var deps = context.modules[mod].deps
	if(deps.length > 0) {
		for(var i=0;i<deps.length;i++) {
			excuteCb(deps[i])
		}
	}
	context.modules[mod].cb.call();
}
```
## 10 整个的执行过程是怎样的
接下来，我们将整个过程串起来。程序入口时我们写的requirejs文件，执行时解析`data-main`上配置模块树的最顶层模块的js文件，然后加载这个js文件，构建依赖模块树，之后再去加载它的依赖模块，递归的这个去加载执行。当每个js加载结束之后，判断所有js是否全部加载完毕，如果是，后序遍历执行回调函数，这就是整个过程。   
**本文的实现是一个简化版的requirejs，共有不到80行代码[https://github.com/bluemind7788/tRequire](https://github.com/bluemind7788/tRequire)**
