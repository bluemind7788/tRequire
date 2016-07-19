var requirejs, require, define;
(function() {
	requirejs={};
	var context = requirejs.context = {};
	
	context.topModule = ''
	context.modules = {}
	context.waiting = [];
	context.loaded = [];
	
	var req = function(url, deps, cb) {
		context.modules[url] = {deps:[]};
		context.modules[url].cb = cb;
		
		for(var i = 0;i < deps.length;i++) {
			context.waiting.push(deps[i])
			context.modules[url].deps.push(deps[i])
			load(deps[i])
		}
	}
	
	var load = function(url) {
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
	}
	
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
	
	var excuteCb = function(mod) {
		var deps = context.modules[mod].deps
		if(deps.length > 0) {
			for(var i=0;i<deps.length;i++) {
				excuteCb(deps[i])
			}
		}
		context.modules[mod].cb.call();
	}
	
	var getCurrentJs = function() {
		var scripts = document.getElementsByTagName('script'),
			reqScript = scripts[scripts.length-1]
		return reqScript;
	}
	
	define = require = function(deps, cb) {
		var reqScript = getCurrentJs(),
			url = reqScript.src.substring(reqScript.src.lastIndexOf('/')+1, reqScript.src.length)
		req(url, deps, cb)
	}
	
	var reqScript = getCurrentJs()
	mainJsUrl = reqScript.getAttribute('data-main');
	context.topModule = mainJsUrl
	
	load(mainJsUrl)
}());
