// ==UserScript==
// @name         Keyprism3 WebBrain
// @namespace    http://mrobbinsassoc.com/
// @version      0.3.1
// @description  Allows interaction of TheBrain and Visual Paradigm
// @author       Mark Robbins
// @match        https://webbrain.com/brainpage/brain/09335629-E824-3836-6E1A-8A30325D2C09
// @grant        none
// @copyright    2017, Mark Robbins
// @homepageURL  http://mrobbinsassoc.com/projects/keyprism3/vp/publish/
// @supportURL   mailto:mark.robbins@mrobbinsassoc.com
// @updateURL https://openuserjs.org/meta/MarkRobbins/Keyprism3_WebBrain.meta.js
// @require      https://code.jquery.com/jquery-3.1.1.min.js
// ==/UserScript==
// ==OpenUserJS==
// @author MarkRobbins
// ==/OpenUserJS==


(function() {
  function waitJq(){
    if (!window.jQuery) {
      console.log('waiting for jQuery in WebBrain');
      setTimeout(waitJq,1000);
      return;
    }
    (function() {
      console.log('RUN in WebBrain');
      //console.log('got Jq');
      //'use strict';
      var $=jQuery;
      window.__={
        _name:'__'
        ,set:{
          _name:'set'
          ,onHashChange:{
            _name:'onHashChange'
            ,timeout:2000
            }
          } //-set
        ,data:{
          _name:'data'
          ,showkeys:true
          ,linkages:{
            }
          ,timers:{
            } //-timers
          } //-data
        ,style:{
          _name:'style'
          ,writeStyle:function(){
            var s='';
            var NL="\n";
            var parts=__.ui.parts;
            for (var i in parts) {
              //console.log(i);
              var o=parts[i];
              if (typeof o!=='object') {
                continue;
              }
              if (o.css) {
                if (o.nameit) {
                  var oo=o.q.q;
                  oo.attr('id',i);
                  s+='#'+i+'{'+NL;
                  s+=''+o.css+NL;
                  s+=''+'}'+NL;
                }else{
                  s+=''+o.q+'{'+NL;
                  s+=''+o.css+NL;
                  s+=''+'}'+NL;
                }
              }
            }
            //console.log(s);
            __.utils.updateNamedStyle(s,'dark');
            } //-writeStyle
          ,_init_:function(){
            var that=this;
            this.writeStyle();
            } //-_init_
          ,_init:function(){
            this._init_();
            } //-_init
          } //-style
        ,types:{
          _name:'types'
          ,typePubSub:{
            _name:'typePubSub'
            ,init_pubsub:function(bug,pfx){
              // xmp bc this.__topicName({});
              pfx=pfx===undefined?'':pfx;
              var i;
              if (bug){console.log('init_pubsub');}
              if (this._pubs!==undefined) {
                if(bug){console.log('init_pubsub,have pubs');}
                for (i in this._pubs) {
                  var f=new Function('o','o=o===undefined?{}:o;o.when=new Date();radio("'+i+'").broadcast(o,this);');
                  if(bug){console.log('init_pubsub, assigning function '+pfx+i,f);}
                  this[pfx+i]=f;
                }
              }
              if (this._subs!==undefined) {
                if(bug){console.log('init_pubsub,have subs');}
                for (i in this._subs) {
                  if(bug){console.log('init_pubsub, subscribing to msg:'+i+' with ',this._subs[i]);}
                  radio(i).subscribe([this._subs[i],this]);
                }
              }
            }
            ,seed:function(that){
              that.init_pubsub=this.init_pubsub;
              that._isPubSub=true;
              } //-seed
            }//-typePubSub
          ,typeCog:{
            create:function(){
              var that=this;
              function init(){
                that._ctor=that.subject.ctor;
                delete that.subject.ctor;
                var i;
                if (typeof that.subject.__static==='object') {
                  for (i in that.subject.__static) {
                    that._ctor[i]=that.subject.__static[i];
                  }
                  delete that.subject.__static[i];
                }
                this._ctor.prototype=this.subject;
                this._ctor.prototype.constructor=this._ctor;
              }
              if (this._ctor===undefined) {
                init();
              }
              // http://stackoverflow.com/a/1608546/842626
              function construct(constructor, args) {
                  function F() {
                      return constructor.apply(this, args);
                  }
                  F.prototype = constructor.prototype;
                  return new F();
              }
              var fn=this._ctor;
              var rv=construct(fn,arguments);
              return rv;
              } //-create
            ,seed:function(that){
              that.create=this.create;
              } //-seed
            } //-typeCog
          } //-types
        ,libs:{
          _name:'libs'
          ,StackTraceParser:{
            _name:'StackTraceParser'
            ,UNKNOWN_FUNCTION : '<unknown>'
            ,parse: function(stackString) {
              /**
               * This parses the different stack traces and puts them into one format
               * This borrows heavily from TraceKit (https://github.com/occ/TraceKit)
               */
              var chrome = /^\s*at (?:(?:(?:Anonymous function)?|((?:\[object object\])?\S+(?: \[as \S+\])?)) )?\(?((?:file|http|https):.*?):(\d+)(?::(\d+))?\)?\s*$/i,
                  gecko = /^(?:\s*(\S*)(?:\((.*?)\))?@)?((?:file|http|https).*?):(\d+)(?::(\d+))?\s*$/i,
                  node  = /^\s*at (?:((?:\[object object\])?\S+(?: \[as \S+\])?) )?\(?(.*?):(\d+)(?::(\d+))?\)?\s*$/i,
                  lines = stackString.split('\n'),
                  stack = [],
                  parts,
                  element;
              for (var i = 0, j = lines.length; i < j; ++i) {
                if ((parts = gecko.exec(lines[i]))) {
                  element = {
                    'file': parts[3],
                    'methodName': parts[1] || this.UNKNOWN_FUNCTION,
                    'lineNumber': +parts[4],
                    'column': parts[5] ? +parts[5] : null
                    };
                } else if ((parts = chrome.exec(lines[i]))) {
                  element = {
                    'file': parts[2],
                    'methodName': parts[1] || this.UNKNOWN_FUNCTION,
                    'lineNumber': +parts[3],
                    'column': parts[4] ? +parts[4] : null
                    };
                } else if ((parts = node.exec(lines[i]))) {
                  element = {
                    'file': parts[2],
                    'methodName': parts[1] || this.UNKNOWN_FUNCTION,
                    'lineNumber': +parts[3],
                    'column': parts[4] ? +parts[4] : null
                    };
                } else {
                  continue;
                }
                stack.push(element);
              }
              return stack;
              } //-parse
            } //-StackTraceParser
          ,Radio:{
            _name:'Radio'
            ,_init_:function(){
              if (this._initialized) {return;}
              this._initialized=true;
              (function(){ // radio
                "use strict";
                //console.log('radio');
                  window.radio=radio;
                  /**
                   * Main Wrapper for radio.$ and create a function radio to accept the channelName
                   * @param {String} channelName topic of event
                   */
                  function radio(channelName) {
                    if (arguments.length) {
                      radio.$.channel(channelName);
                      return radio.$;
                    }else{
                      return radio.$;
                    }
                    //arguments.length ? radio.$.channel(channelName) : radio.$.reset();
                  }
                radio.$ = {
                  version: '0.2',
                  channelName: "",
                  channels: [],
                    /**
                     * Reset global state, by removing all channels
                     * @example
                     *    radio()
                     */
                    reset: function() {
                      radio.$.channelName = "";
                      radio.$.channels = [];
                      },//-reset
                    /**
                     * Broadcast (publish)
                     * Iterate through all listeners (callbacks) in current channel and pass arguments to subscribers
                     * @param arguments data to be sent to listeners
                     * @example
                     *    //basic usage
                     *    radio('channel1').broadcast('my message');
                     *    //send an unlimited number of parameters
                     *    radio('channel2').broadcast(param1, param2, param3 ... );
                     */
                    broadcast: function() {
                      var i, c = this.channels[this.channelName],
                        l = c.length,
                        subscriber, callback, context;
                      //iterate through current channel and run each subscriber
                      for (i = 0; i < l; i++) {
                        subscriber = c[i];
                        //if subscriber was an array, set the callback and context.
                        if ((typeof(subscriber) === 'object') && (subscriber.length)) {
                          callback = subscriber[0];
                          //if user set the context, set it to the context otherwise, it is a globally scoped function
                          context = subscriber[1] || global;
                        }
                        callback.apply(context, arguments);
                      }
                      return this;
                      },//-broadcast
                    /**
                     * Create the channel if it doesn't exist and set the current channel/event name
                     * @param {String} name the name of the channel
                     * @example
                     *    radio('channel1');
                     */
                    channel: function(name) {
                      var c = this.channels;
                      //create a new channel if it doesn't exists
                      if (!c[name]) c[name] = [];
                      this.channelName = name;
                      return this;
                      },//-channel
                    channelKeys:function (){
                      //console.log('channelKeys');//+m.c.r
                      return Object.keys(this.channels);
                    },//-channelKeys
                    /**
                     * Add Subscriber to channel
                     * Take the arguments and add it to the this.channels array.
                     * @param {Function|Array} arguments list of callbacks or arrays[callback, context] separated by commas
                     * @example
                     *      //basic usage
                     *      var callback = function() {};
                     *      radio('channel1').subscribe(callback);
                     *
                     *      //subscribe an endless amount of callbacks
                     *      radio('channel1').subscribe(callback, callback2, callback3 ...);
                     *
                     *      //adding callbacks with context
                     *      radio('channel1').subscribe([callback, context],[callback1, context], callback3);
                     *
                     *      //subscribe by chaining
                     *      radio('channel1').subscribe(callback).radio('channel2').subscribe(callback).subscribe(callback2);
                     */
                    subscribe: function() {
                      var a = arguments,
                        c = this.channels[this.channelName],
                        i, l = a.length,
                        p, ai = [];
                      //run through each arguments and subscribe it to the channel
                      for (i = 0; i < l; i++) {
                        ai = a[i];
                        //if the user sent just a function, wrap the fucntion in an array [function]
                        p = (typeof(ai) === "function") ? [ai] : ai;
                        if ((typeof(p) === 'object') && (p.length)) c.push(p);
                      }
                      return this;
                      },//-subscribe
                    /**
                     * Remove subscriber from channel
                     * Take arguments with functions and unsubscribe it if there is a match against existing subscribers.
                     * @param {Function} arguments callbacks separated by commas
                     * @example
                     *      //basic usage
                     *      radio('channel1').unsubscribe(callback);
                     *      //you can unsubscribe as many callbacks as you want
                     *      radio('channel1').unsubscribe(callback, callback2, callback3 ...);
                     *       //removing callbacks with context is the same
                     *      radio('channel1').subscribe([callback, context]).unsubscribe(callback);
                     */
                    unsubscribe: function() {
                      var a = arguments,
                        i, j, c = this.channels[this.channelName],
                        l = a.length,
                        cl = c.length,
                        offset = 0,
                        jo;
                      //loop through each argument
                      for (i = 0; i < l; i++) {
                        //need to reset vars that change as the channel array items are removed
                        offset = 0;
                        cl = c.length;
                        //loop through the channel
                        for (j = 0; j < cl; j++) {
                          jo = j - offset;
                          //if there is a match with the argument and the channel function, unsubscribe it from the channel array
                          if (c[jo][0] === a[i]) {
                            //unsubscribe matched item from the channel array
                            c.splice(jo, 1);
                            offset++;
                          }
                        }
                      }
                      return this;
                      }//-unsubscribe
                  };//-radio.%
                return radio;
                }());
              } //-_init_
            ,_init:function(){
              this._init_();
              } //-_init
            } //-Radio
          ,FontAwesome:{
            _name:'FontAwesome'
            ,_init_:function(){
              if (this._initialized) {return;}
              this._initialized=true;
              __.utils.addScript('https://use.fontawesome.com/09bc4b9f8f.js','fontawesome');
              } //-_init_
            ,_init:function(){
              this._init_();
              } //-_init
            } //-FontAwesome
          ,_init_:function(){
            var i;
            for (i in this) {
              if (!this.hasOwnProperty(i)) {continue;}
              var o=this[i];
              if (typeof o==='object') {
                if (typeof o._init==='function') {
                  o._init();
                }
              }
            }
            } //-_init_
          ,_init:function(){
            this._init_();
            } //-_init
          } //-libs
        ,utils:{
          _name:'utils'
          ,itemXyWh:function(q){
            if (q.x!==undefined
              &&q.y!==undefined
              &&q.w!==undefined
              &&q.h!==undefined) {
              return q;
            }
            var st=$(window).scrollTop();
            var sl=$(window).scrollLeft();
            var w1=q.width();
            var h1=q.height();
            var x1,y1;
            if (q[0]===window) {
              x1=0;y1=0;
            }else{
              var b=q[0].getBoundingClientRect();
              x1=b.left;
              y1=b.top;
              w1=b.width;
              h1=b.height;
              if (0) {
                var offset1 = q.offset();
                if (offset1!==undefined) {
                  x1=offset1.left-sl;
                  y1=offset1.top-st;
                }else{
                  //hack!
                  x1=sl;y1=st;
                }
              }
            }
            return {x:x1,y:y1,w:w1,h:h1};
            } //-itemXyWh
          ,cas:function (e){
            var s = '';
            if (e.ctrlKey) {s += 'c';}
            if (e.altKey) {s += 'a';}
            if (e.shiftKey) {s += 's';}
            return s;
            } //-cas
          ,caso:function (e){
            var s = '';
            var o={
              _:false
              ,c:false
              ,a:false
              ,s:false
              ,ca:false
              ,cs:false
              ,as:false
              ,cas:false
              };
            if (e.ctrlKey) {s += 'c';}
            if (e.altKey) {s += 'a';}
            if (e.shiftKey) {s += 's';}
            if (s==='') {
              o._=true;
              return o;
            }
            if (s==='c') {
              o.c=true;
              return o;
            }
            if (s==='a') {
              o.a=true;
              return o;
            }
            if (s==='s') {
              o.s=true;
              return o;
            }
            if (s==='ca') {
              o.ca=true;
              return o;
            }
            if (s==='cs') {
              o.cs=true;
              return o;
            }
            if (s==='as') {
              o.as=true;
              return o;
            }
            if (s==='cas') {
              o.cas=true;
              return o;
            }
            } //-cas
          ,cancel:function(e){
            //console.log('keyProcessed');
            e.cancelBubble = true; // IE4+
            try {
              e.keyCode = 0;
            } catch (e) {

            } // IE5
            if (window.event) {e.returnValue = false; } // IE6
            if (e.preventDefault) {e.preventDefault(); } // moz/opera/konqueror
            if (e.stopPropagation) {e.stopPropagation(); } // all
            return false;
            } //-cancel
          ,delay:function(ms){
            ms += new Date().getTime();
            console.log('delaying '+ms);
            while (new Date() < ms){}
            console.log('delay released');
            } //-delay
          ,inheritFrom:function(obj,tgt) {
            var i;
            //console.log('inheritFrom..........'+arguments.callee.caller.name);
            var a=[];
            for (i in obj) {
              if (obj.hasOwnProperty(i)) {
                tgt[i]=obj[i];
                a[a.length]=i;
              }else{
                console.log('not inheriting "'+i+'" in '+obj.name);
              }
            }
            //console.log('inheritedFrom '+obj.name,a);
            } //-inheritedFrom
          ,perf:function(n){
            __.data.perfs=__.data.perfs===undefined?{}:__.data.perfs;
            if (__.data.perfs[n]===undefined) {
              __.data.perfs[n]=performance.now();
            }else{
              console.log('perf:'+n+' took '+(performance.now()-__.data.perfs[n])+' ms');
              delete __.data.perfs[n];
            }
            } //-perf
          ,eachNode:function(object,fn,wantTypes,re,_bag){
            /*
             * Iterate object passing its members to fn, filtered by wantTypes and regular expression.
             *
             * Parameters:
             *   object: subject object
             *   fn:     callback - optional
             *     |
             *     signature: name,item,type,object,parent,depth,path,indexes
             *              |
             *              name:      the name of the member
             *              item:      the member
             *              type:      typeof memeber
             *              object:    in which member resides
             *              parent:    the parent of object
             *              depth:     zero based recursion depth
             *              path:      dot path of current object relative to passed object
             *              indexes:   object of indexes
             *                     |
                                   itemIndex:    position item was found in containing object
                                   itemDidIndex: index count of items done for containing object
                                   didIndex:     global index count of items done for passed object
                                   index:        global index count of items for passed object
             *   wantTypes: array of Javascript types, defaults to ['object'] - optional
             *   re:        regular expression to filter member names
             *   _bag:      internal, do not supply, but this it will be returned
             *
             * Returns:
             *   _bag: bag containing collections
             *       |
             *
             *
             *
             *
             */
            var itemIndex= -1, itemDidIndex=-1, name, item, rv,indexes, dupe, retitem;
            if (_bag===undefined){
              var bag={
                  index:-1
                  ,didIndex:-1
                  ,_parents:[]
                  ,_paths:[]
                  ,did:[]
                  ,returns:{items:[],dupes:[]}
              };
              Object.defineProperty(bag,'depth',{
                get:function(){
                  return this._parents.length;
                }
                ,set:function(){}
                ,enumerable:true,configurable: false
              });
              Object.defineProperty(bag,'parent',{
                get:function(){
                  return this._parents.length>0?this._parents[this._parents.length-1]:undefined;
                }
                ,set:function(v){this._parents.push(v);}
                ,enumerable:true,configurable: false
                });
              Object.defineProperty(bag,'parents',{
                get:function(){
                  var a=[];var x;
                  for(x=0;x<this._parents.length;x++){
                    a.push(this._parents[x]);
                  }
                  return a;
                }
                ,set:function(){}
                ,enumerable: true,configurable: false
              });
              Object.defineProperty(bag,'path',{
                get:function(){
                  var p=this._paths.join('.');
                  p=p===''?p:p+'.';
                  return p+''+this._name;
                  }
                ,set:function(){}
                ,enumerable: true,configurable: false
              });
              bag.push=function(){
                this._parents.push(this._object);
                this._paths.push(this._name);
                return __.utils.eachNode(this._item,fn,wantTypes,re,this);
              };
              bag.pop=function(rv){
                this._item=this._parents.pop();
                this._paths.pop();
                this._name=this._paths.length>0?this._paths[this._paths.length-1]:'';
                if (rv===null){this._breaking=true;}
                if (this.depth===0) {
                  return this;
                }
                return rv;
              };
              bag.path=function(){
                var s='';
                var x=0;
                for (x=0;x<this._parents.length;x++){
                  s+='.'+this._parents[x]._name;
                }
                return s;
              }
              _bag=bag;
            } // if no bag
            fn=fn!==undefined?fn:function(name,item,type,object,parent,depth,path,indexes){return true;};
            wantTypes=wantTypes?wantTypes:['object'];
            _bag._object=object;
            for(name in object){
              if(!object.hasOwnProperty(name)){continue;}
              item=object[name];
              _bag._name=name;
              _bag._item=item;
              itemIndex++;
              _bag.index++;
              var type=typeof item;
              if (['function','object'].indexOf(type)!==-1&&item!==null){
                if (_bag.did.indexOf(item)!==-1){
                  indexes={
                    itemIndex:itemIndex
                    ,itemDidIndex:itemDidIndex
                    ,didIndex:_bag.didIndex
                    ,index:_bag.index
                    };
                  dupe={
                    item:item
                    ,name:name
                    ,object:object
                    ,type:type
                    ,parent:_bag.parent
                    ,depth:_bag.depth
                    ,path:_bag.path
                    ,indexes:indexes
                    };
                  _bag.returns.dupes.push(dupe);
                  continue;
                }else{
                  _bag.did.push(item);
                }
              }
              if(wantTypes.indexOf(type)!==-1){
                var doit=re===undefined?true:re.test(name);
                if (doit){
                  itemDidIndex++;
                  _bag.didIndex++;
                  // undefined: no push, true: push, false: no push, -1: no push, 'done':abort level, 'finish': abort all
                  indexes={
                    itemIndex:itemIndex
                    ,itemDidIndex:itemDidIndex
                    ,didIndex:_bag.didIndex
                    ,index:_bag.index
                    };
                  rv=fn(name,item,type,object,_bag.parent,_bag.depth,_bag.path,indexes);
                  if (false){
                  }else if (rv==='done'){
                    break;
                  }else if (rv==='finish'){
                    return _bag.pop(null);
                  }else if (rv){ // '==' is OK here
                    indexes={
                      itemIndex:itemIndex
                      ,itemDidIndex:itemDidIndex
                      ,didIndex:_bag.didIndex
                      ,index:_bag.index
                      };
                    retitem={
                      name:name
                      ,item:item
                      ,object:object
                      ,type:type
                      ,parent:_bag.parent
                      ,depth:_bag.depth
                      ,path:_bag.path
                      ,indexes:indexes
                      };
                    _bag.returns.items.push(retitem);
                  }else if (!rv||rv===-1||rv===undefined){
                    // nada
                  }
                }
              } // not want type
              if (type==='object'&&item!==null){
                rv=_bag.push();
                if(rv===null){
                  return _bag.pop(rv);
                }
              }
              if (_bag._breaking){
                break;
              }
            }
            return _bag.pop();
            } //-eachNode
          ,blackHtml:function(){
            var color = document.documentElement.style.backgroundColor;
            document.documentElement.style.backgroundColor = "black";
            var observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                if (false&&mutation.target.nodeName == "BODY") {
                  observer.disconnect();
                  document.documentElement.style.backgroundColor = color || "";
                }
              });
            });
            observer.observe(document, { childList: true, subtree: true });
            } //-blackHtml
          ,addStylesheet:function(url,id){
            var style = document.createElement('link');
            style.rel = 'stylesheet';
            style.type = 'text/css';
            style.href = chrome.extension.getURL(url);
            if (id) {
              style.id=id;
            }
            (document.head||document.documentElement).appendChild(style);
            } //-addStylesheet
          ,addScript:function(url,id){
            var el = document.createElement('script');
            el.type = 'text/javascript';
            if (chrome) {
              if (chrome.extension) {
                el.src = chrome.extension.getURL(url);
              }else{
                el.src = url;
              }
            }else{
              el.src = url;
            }
            if (id) {
              el.id=id;
            }
            (document.head||document.documentElement).appendChild(el);
            } //-addScript
          ,deleteNamedStyle:function(name_) {
            __.data.namedStyles=__.data.namedStyles?__.data.namedStyles:[];
            var i=__.data.namedStyles.indexOf(name_);
            if (i!==-1) {
              __.data.namedStyles=__.data.namedStyles.splice(i,1);
              var qo=$('#'+name_);
              if (qo.length==1) {
                qo.remove();
              }else{
                if (qo.length>1) {
                  console.error('multiple element matches for named style:'+name_);
                  qo.remove();
                }else{
                  console.error('zero element matches for named style:'+name_);
                }
              }
            }else{
              console.warn('named style not found:'+name_);
            }
            } //-deleteNamedStyle
          ,updateNamedStyle:function(style_str_,name_,fn) {
            if (name_===undefined) {
              name_='defaultStyle';
            }
            __.data.namedStyles=__.data.namedStyles?__.data.namedStyles:[];
            if (__.data.namedStyles.indexOf(name_)===-1) {
              __.data.namedStyles.push(name_);
            }
            var st=document.getElementById(name_);
            if (st!==null) {
              //st=st[0];
              st.innerHTML=style_str_;
            }else{
              var head = document.getElementsByTagName("HEAD")[0];
              var ele = head.appendChild(window.document.createElement( 'style' ));
              var eleq=$(ele);
              eleq.attr('id',name_);
              eleq.attr('type','text/css');
              if (fn!==undefined) {
                eleq.on('load',fn);
              }
              ele.innerHTML = style_str_;
            }
            } //-updateNamedStyle
          ,addScripting:function(s,id){
            var script = document.createElement("script");
            // Add script content
            script.innerHTML = s;
            if (id!==undefined) {
              script.id=id;
            }
            // Append
            document.head.appendChild(script);
            } //-addScripting
          ,addScriptingFn:function(fn){
            var s='';
            s+='('+fn+')();';
            this.addScripting(s);
            } //-addScriptingFn
          ,qOf:function(q){
            if (false) {
            }else if (typeof q==='function') {return q();
            }else if (q instanceof jQuery) {return q;
            }else if (typeof q==='string') {return q.q;
            }else if (typeof q==='object') {
              return q;
            }
            } //-q
          ,isInDocument:function(el) {
            var html = document.body.parentNode;
            while (el) {
              if (el === html) {
                return true;
              }
              el = el.parentNode;
            }
            return false;
            } //-isInDocument
          ,body_msg:function(s){
            $('body').attr('data-msg',s);
            } //
          ,timeDifference:function(earlierDate,laterDate){
            var tot = laterDate.getTime() - earlierDate.getTime();
            var o = new Object();
            o.days = Math.floor(tot/1000/60/60/24);
            tot -= o.days*1000*60*60*24;
            o.hours = Math.floor(tot/1000/60/60);
            tot -= o.hours*1000*60*60;
            o.minutes = Math.floor(tot/1000/60);
            tot -= o.minutes*1000*60;
            o.seconds = Math.floor(tot/1000);
            return o;
            }
          ,findDirection:function(me,all,dir,xtol,ytol){
            xtol=xtol===undefined?5:xtol;
            ytol=ytol===undefined?5:ytol;
            me=typeof me==='string'?me.q:me;
            all=typeof all==='string'?all.q:all;
            var res=[];
            all.each(function(){
              var vv=$(this);
              res.push({r:this.getBoundingClientRect(),q:vv});
            });
            function center(r){
              var x=r.left+r.width/2;
              var y=r.top+r.height/2;
              return {x:x,y:y};
            }
            function dist(r1,r2){
              var cp1=center(r1);
              var cp2=center(r2);
              var xx=Math.abs(cp1.x-cp2.x);
              var yy=Math.abs(cp1.y-cp2.y);
              var rv=Math.sqrt(xx*xx+yy*yy);
              return rv;
            }
            function xyc(r1,r2){
              var cp1=center(r1);
              var cp2=center(r2);
              var rv={};
              rv.x=cp2.x-cp1.x;
              rv.y=cp2.y-cp1.y;
              return rv;
            }
            var r=me.get(0).getBoundingClientRect();
            var cp=center(r);
            // dist xc yc
            res.forEach(function(v){
              v.dist=dist(r,v.r);
              v.xyc=xyc(r,v.r);
            });
            var cur=null;
            function putcur(v,max){
              if (cur===null) {
                cur=v;
                return;
              }
              max=max===undefined?false:max;
              if (!max) {
                if (v.dist<cur.dist) {cur=v;}
              }else{
                if (v.dist>cur.dist) {cur=v;}
              }
            }
            res.forEach(function(v){
              if (v.q.get(0)===me.get(0)) {
                return;
              }
              if (false) {
              }else if (dir==='left') {
                if (v.xyc.y>ytol||v.xyc.y<-ytol) {return;}
                if (v.xyc.x>=0) {return;}
                putcur(v);
              }else if (dir==='right') {
                if (v.xyc.y>ytol||v.xyc.y<-ytol) {return;}
                if (v.xyc.x<=0) {return;}
                putcur(v);
              }else if (dir==='up') {
                if (v.xyc.x>xtol||v.xyc.x<-xtol) {return;}
                if (v.xyc.y>=0) {return;}
                putcur(v);
              }else if (dir==='down') {
                if (v.xyc.x>xtol||v.xyc.x<-xtol) {return;}
                if (v.xyc.y<=0) {return;}
                putcur(v);
              }else if (dir==='home') {
                if (v.xyc.y>ytol||v.xyc.y<-ytol) {return;}
                if (v.xyc.x>=0) {return;}
                putcur(v,true);
              }else if (dir==='end') {
                if (v.xyc.y>ytol||v.xyc.y<-ytol) {return;}
                if (v.xyc.x<=0) {return;}
                putcur(v,true);
              }else if (dir==='pgup') {
                if (v.xyc.x>xtol||v.xyc.x<-xtol) {return;}
                if (v.xyc.y>=0) {return;}
                putcur(v,true);
              }else if (dir==='pgdn') {
                if (v.xyc.x>xtol||v.xyc.x<-xtol) {return;}
                if (v.xyc.y<=0) {return;}
                putcur(v,true);
              }
            });
            if (cur===null) {
              return me;
            }
            return cur.q;
            }
          ,parseQueryString:function(qstr) {
            var query = {};
            var a = (qstr[0] === '?' ? qstr.substr(1) : qstr).split('&');
            for (var i = 0; i < a.length; i++) {
              var b = a[i].split('=');
              query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
            }
            return query;
            }
          ,defunction:function(val){
            if ('function'==typeof val) {
              return val();
            }
            return val;
            }
          ,linkItemHtml:function(data){//image title url
            //https://webbrain.com/icon?path=%2Fvol%2Fwebbrain%2Fserver%2Fres%2FiconImages%2Fmimetypes%2Ftext-x-generic-template.png&maxWidth=32&maxHeight=32&match=true
            var s='';
            s+='<div class="GGD0W3FBJ4" style="cursor: pointer;">';
            s+='  <div class="GGD0W3FBG4">';
            s+='    <img class="gwt-Image" style="width:32px;height:32px;"';
            s+=' src="';
            if (data.image) {
              s+=data.image;
            }else{
              s+='https://webbrain.com/icon?path=%2Fvol%2Fwebbrain%2Fserver%2Fres%2FiconImages%2Fmimetypes%2Ftext-x-generic-template.png&maxWidth=32&maxHeight=32&match=true';
            }
            s+='"';
            s+='>';
            s+='  </div>';
            s+='  <div style="float: left; margin-top: 2px;">';
            s+='    <div class="GGD0W3FBI4">';
            if (data.title) {
              s+=data.title;
            }
            s+='    </div>'
            s+='    <div class="GGD0W3FBH4">';
            if (data.url) {
              s+=data.url;
            }
            s+='    </div>';
            s+='  </div>';
            s+='  <div style="clear: both;">';
            s+='  </div>';
            s+='</div>';
            return s;
            } //-linkItemHtml
          } //-utils
        ,state:{
          _name:'state'
          ,isViewLoading:function(){
            return $(__.ui.parts.bottomEdit.q).length===0;
            } //-isViewLoading
          ,isViewLoaded:function(){
            return !this.isViewLoading();
            } //-isViewLoading
          ,isTop:function(){
            return false;
            return window===top;
            } //-isTop
          ,_init_:function(){
            // nada
            } //-_init_
          ,_init:function(){
            this._init_();
            } //-_init
          } //-state
        ,actions:{
          _name:'actions'
          ,midBarUp:function(){
            __.ui.parts.midBarUp.q.q.click();
            } //-midBarUp
          ,midBarDown:function(){
            __.ui.parts.midBarDown.q.q.click();
            } //-midBarDown
          ,rightFrameUp:function(){
            var msg={
              from:'WebBrain'
              ,action:'rightFrameUp'
              ,innerHeight:window.innerHeight
            };
            window.top.postMessage(msg,'*');
            } //-rightFrameUp
          ,rightFrameDown:function(){
            var msg={
              from:'WebBrain'
              ,action:'rightFrameDown'
              ,innerHeight:window.innerHeight
            };
            window.top.postMessage(msg,'*');
            } //-rightFrameUp
          } //-actions
        ,hooks:{
          _name:'hooks'
          ,mouseHooks:{
            _name:'mouseHooks'
            ,_init_:function(){
              //body.on mousemove
              $(document).mousemove(function(evt){
                __.data.mmx=evt.pageX;
                __.data.mmy=evt.pageY;
                //__.event.doc.mousemove(evt);
                //console.info('evt.pageX:',evt.pageX,'evt.pageY',evt.pageY);
              });
              } //-_init_
            ,_init:function(){
              this._init_();
              }
            } //-mouseHooks
          ,hashChangeHooks:{
            _name:'hashChangeHooks'
            ,_init_:function(){
              __.data.oldHash=window.location.hash;
              $(window).bind('hashchange',function(){
                __.event.win.hashChange();
                __.data.oldHash=window.location.hash;
              });
              } //-_init_
            ,_init:function(){
              this._init_();
              } //-_init
            } //-hashChangeHooks
          ,messageHooks:{
            _name:'messageHooks'
            ,_init_:function(){
              //console.log('INIT',this._name);
              //window.onmessage= function(e){__.event.win.message(e);}
              window.addEventListener("message", function(e){
                __.event.win.message(e);
              }, false);
              window.top.postMessage({from:'WebBrain',action:'brainReady'},'*');
              } //-_init_
            ,_init:function(){
              this._init_();
              } //-_init
            } //-messageHooks
          ,kbdHooks:{
            _name:'kbdHooks'
            ,_init_:function(){
              $(document).on("keyup",function(e){return __.event.doc.keyup(e);});
              $(document).on("keydown",function(e){return __.event.doc.keydown(e);});
              $(document).on("keypress",function(e){return __.event.doc.keypress(e);});
              }
            ,_init:function(){
              this._init_();
              } //-_init
            } //-kbdHooks
          ,domHooks:{
            _name:'domHooks'
            ,_init_:function(){
              $(document).bind('DOMNodeInserted', function(event) {
                __.event.dom.node_inserted(event);
              });
              $(document).bind('DOMNodeRemoved', function(event) {
                __.event.dom.node_removed(event);
              });
              } //-_init_
            ,_init:function(){
              this._init_();
              } //_init
            } //-domHooks
          ,_init_:function(){
            var i;
            for (i in this) {
              if (!this.hasOwnProperty(i)) {
                continue;
              }
              if (false) {
              }else if (typeof this[i]==='function') {
                if (/^.+_init$/.test(i)) {
                  this[i]();
                }
              }else if (typeof this[i]==='object') {
                if (typeof this[i]._init==='function') {
                  this[i]._init();
                }
              }
            }
            } //-_init_
          ,_init:function(){
            this._init_();
            } //-init
          } //-hooks
        ,ui:{
          _name:'ui'
          ,parts:{
            _name:'parts'
            ,bottomEdit:{
              _name:'bottomEdit'
              ,q:'#contentContainer>div:eq(2)' //'.GGD0W3FBOS'
              ,css:'background-color:black;color:#555;'
              ,nameit:true
              } //-bottomEdit
            ,bottomEditTitle:{
              _name:'bottomEditTitle'
              ,q:'.GGD0W3FBKT'
              } //-bottomEditTitle
            ,greyBar:{
              _name:'greyBar'
              ,q:'.greyBar'
              ,css:'filter:invert(1) hue-rotate(180deg);'
              } //-greyBar
            ,midBar:{
              _name:'midBar'
              ,q:'.GGD0W3FBAJ'
              ,css:'filter:invert(1);'
              } //-midBar
            ,midBarDown:{
              _name:'midBarDown'
              ,q:'.GGD0W3FBAJ>img:eq(0)'
              } //-midBarDown
            ,midBarUp:{
              _name:'midBarUp'
              ,q:'.GGD0W3FBAJ>img:eq(1)'
              } //-midBarDown
            ,searchBoxInput:{
              _name:'searchBoxInput'
              ,q:'.searchBoxInput'
              ,css:'background-color:black;color:#888;border:1px solid #222;'
              } //-searcher
            ,stationaryClickMenu:{
              _name:'stationaryClickMenu'
              ,q:'ul.stationaryClickMenu'
              ,css:'background-color:black;color:#888;border:1px solid #0a0a0a;'
              } //-stationaryClickMenu
            ,stationaryClickMenuLi:{
              _name:'stationaryClickMenuLi'
              ,q:'ul.stationaryClickMenu li'
              ,css:'color:#888;border: 1px solid #0f0f0f;'
              } //-stationaryClickMenu
            ,clickMenu:{
              _name:'clickMenu'
              ,q:'ul.clickMenu'
              ,css:'background-color:black;color:#888;border:1px solid #0a0a0a;'
              } //-clickMenu
            ,clickMenuLi:{
              _name:'clickMenuLi'
              ,q:'ul.clickMenu li'
              ,css:'color:#888;border:1px solid #0a0a0a;'
              } //-stationaryClickMenu
            ,linkItemsContainer:{
              _name:'linkItemsContainer'
              ,q:'.GGD0W3FBKS'
              } //-linkItems
            ,linkItem:{
              //<div class="GGD0W3FBKS" aria-hidden="false"> linkItemsContainer
              //  <div class="GGD0W3FBJ4" style="cursor: default;">
              //    <div class="GGD0W3FBG4">
              //      <img class="gwt-Image" src="https://webbrain.com/icon?path=%2Fvol%2Fwebbrain%2Fserver%2Fres%2FiconImages%2Fmimetypes%2Ftext-x-generic-template.png&amp;maxWidth=32&amp;maxHeight=32&amp;match=true">
              //    </div>
              //    <div style="float: left; margin-top: 2px;">
              //      <div class="GGD0W3FBI4"> linkItemTitle
              //        .assets`keyprism3`_;C.$explhere
              //      </div>
              //      <div class="GGD0W3FBH4" style="text-decoration: line-through;"> linkItemUrl
              //        C:\_\keyprism3\.assets\.assets`keyprism3`_;C.$explhere
              //      </div>
              //    </div>
              //    <div style="clear: both;">
              //    </div>
              //  </div>
              //</div>
              _name:'linkItem'
              ,q:'.GGD0W3FBJ4'
              } //-linkItem
            ,explhere:{
              _name:'explhere'
              ,q:' [title$="$explhere"]'
              }
            ,linkItemUrl:{
              _name:'linkItemUrl'
              ,q:'.GGD0W3FBH4'
              } //-linkItemUrl
            ,linkItemTitle:{
              _name:'linkItemTitle'
              ,q:'.GGD0W3FBI4'
              } //-linkItemTitle
            ,linkItemImage:{
              _name:'linkItemImage'
              ,q:'.GGD0W3FBG4>img'
              } //-linkItemTitle
            ,popupIcon:{
              _name:'popupIcon'
              ,q:'.gwt-PopupPanel>.popupContent>.gwt-Image'
              } //-popupIcon
            } //-parts
          ,docLinkages:{
            _name:'docLinkages'
            ,linkages:{
              } //-linkages
            ,extractors:{
              urlEquals:function(url){
                return url.split('=')[1];
                } //-urlEquals
              } //-extractors
            ,popupIcon:{
              _name:'popupIcon'
              ,onClick:function(evt){
                console.log(this._name+' onClick',evt);
                //console.log(__.data.linkages.vpPackageDiagram);
                __.ui.docLinkages._linkageDataCall('vpPackageDiagram');
                } //-onClick
              ,_init_:function(){
                var that=this;
                $(document).on('click','.thought.active',function(evt){
                  that.onClick(evt);
                });
                } //-_init_
              ,_init:function(){
                this._init_();
                } //-_init
              } //-popupIcon
            ,_iniData:function(){
              __.data.iniData={};
              '.gwt-HTML>UL:eq(0)>li'.q.each(function(){
                var me=$(this);
                var codes=me.find('code');
                if (codes.length===2) {
                  var c1=codes.first().text();
                  var c2=codes.last().text();
                  __.data.iniData[c1]=c2;
                }
              });
              } //-_iniData
            ,_registerLinkage:function(linkage){
              this.linkages[linkage._name]=linkage;
              } //-_registerLinkage
            ,_registerLinkages:function(){
              this._registerLinkage({
                _name:'vpPackageDiagram'
                ,linkItem:{
                  title:'Package Diagram'
                  ,url:''
                  ,image:'http://mrobbinsassoc.com/images/icons/icons-ext/_vpp-48.png'
                  ,zap:true
                  ,target:'_content_pane'
                  ,find:{
                    title:/\$explhere$/
                  }
                }
                ,docLink:{
                  find:{
                    href:['/vp/publish/index.html?url=','Package']
                    }
                  ,extractor:function(url){
                    var u=__.ui.docLinkages.extractors.urlEquals(url);
                    //var pageName=
                    var vp_url=__.data.iniData.vp_url;  //keyprism3.vpp://shape/yOFsx1qGAqAAAgq_/uDwcx1qGAqAAAgsh
                    var a=vp_url.split('/');
                    var dia=a[3];
                    var shape=a[4];
                    //var tit=__.ui.parts.bottomEditTitle.q.q.text();
                    //tit=tit.replace(/ /g,'').replace(/#/g,'').split(',');
                    //return u+'?package='+encodeURIComponent(tit[0]);
                    return u+'?shapeid='+encodeURIComponent(shape);
                    }
                  ,zap:true
                }
                ,done:function(options){
                  __.data.linkages[this._name]={
                    options:options
                  };
                  } //-onComplete
              });
              if (1) {
                this._registerLinkage({
                  _name:'externalWebBrain'
                  ,docLink:{
                    find:{
                      //https://webbrain.com/brainpage/brain/09335629-E824-3836-6E1A-8A30325D2C09#-8
                      href:function(){return location.href;}
                    }
                    ,zap:true
                  }
                });
              }
              if (1) {
                this._registerLinkage({
                  _name:'BitBucket'
                  ,docLink:{
                    find:{
                      href:'https://bitbucket.org/'
                    }
                    ,target:'_blank'
                  }
                  ,linkItem:{
                    isNew:true
                    ,target:'_blank'
                    ,url:__.ui.parts.bottomEditTitle.q.q.text()
                    ,title:'BitBucket'
                    ,image:'http://mrobbinsassoc.com/images/icons/extensions/bitbucket-48.png'
                  }
                });
              }
              if (1) {
                this._registerLinkage({
                  _name:'FolderMarkdowns'
                  ,docLink:{
                    find:{
                      href:['aip://open/',/(\.md$|\.md%3F)/]
                    }
                    ,href:null
                    ,click:function(evt){
                      //find text
                      var brn='https://webbrain.com/brainpage/brain/';//09335629-E824-3836-6E1A-8A30325D2C09
                      var me=$(this);
                      /// var code=me.next();
                      /// var code_txt=code.text();
                      /// console.log('code_txt',code_txt);
                      /// // find thought with code
                      /// var thoughts=$('.thought');
                      /// console.log('thoughts',thoughts)
                      /// var tgt;
                      /// thoughts.each(function(){
                      ///   var me=$(this);
                      ///   var txt=me.text();
                      ///   if (!tgt&&txt===code_txt) {
                      ///     tgt=me;
                      ///   }
                      /// });
                      /// if (tgt) {
                      ///   console.log('tgt.click',tgt); //simulate
                      ///   window.TGT=tgt;
                      ///   tgt.click();
                      ///   return;
                      /// }
                      //aip://open/C%3A%5C_%5Ckeyprism%33%5C.assets%5Cesdoc%5CREADME.md%3Fbrain_uid%3D%30%39%33%33%35%36%32%39-E%38%32%34-%33%38%33%36-%36E%31A-%38A%33%30%33%32%35D%32C%30%39%26thought_id%3D%32%30%26vp_url%3Dkeyprism%33.vpp%3A%2F%2Fshape%2FYcUAPVqGAqAAAhK%33%2FnEwRvVqGAqAAAg%31x
                      var data=me.attr('data-href');
                      var rt=data.substr('aip://open/'.length);
                      rt=decodeURIComponent(rt);
                      if (rt.indexOf('?')===-1) {
                        location.href=data;
                        return;
                      }
                      var qs=rt.substr(rt.indexOf('?')+1);
                      //C:\_\keyprism3\.assets\esdoc\README.md?brain_uid=09335629-E824-3836-6E1A-8A30325D2C09&thought_id=20&vp_url=keyprism3.vpp://shape/YcUAPVqGAqAAAhK3/nEwRvVqGAqAAAg1x
                      var qu=__.utils.parseQueryString(qs);
                      //var newloc=brn+qu.brain_uid+'#-'+qu.thought_id;
                      if (!qu.brain_uid||!qu.thought_id) {
                        location.href=data;
                        return;
                      }
                      //console.log('click',evt);
                      if (location.href.indexOf(brn+qu.brain_uid)!==-1) {
                        console.log('location.hash','#-'+qu.thought_id);
                        location.hash='#-'+qu.thought_id;
                      }else{
                        console.log('location.href',brn+qu.brain_uid+'#-'+qu.thought_id);
                        location.href=brn+qu.brain_uid+'#-'+qu.thought_id;
                      }
                      //location.href=newloc;
                    }
                  }
                });
              }
              } //-_registerLinkage
            ,_stringMatcher:function(str,match){
              if (!str) {
                return false;
              }
              if ('string'===typeof match) {
                return str.indexOf(match)!==-1;
              }else if (match instanceof RegExp) {
                return str.match(match)!==null;
              }else if ($.isArray(match)) {
                for (var x=0;x<match.length;x++) {
                  var r=this._stringMatcher(str,match[x]);
                  if (!r) {
                    return false;
                  }
                }
                return true;
              }
              return false;
              } //-_urlHas
            ,_linkageDataCall:function(linkagename){
              var dl=__.data.linkages[linkagename];
              if (!dl||!dl.linkItem) {return;}
              var linkItem=dl.linkItem;
              if (linkItem.target==='_content_pane') {
                var msg={
                  from:'WebBrain'
                  ,action:'loadContentPane'
                  ,url:linkItem.docUrl
                };
                window.top.postMessage(msg,'*');
              }else{
                window.open(linkItem.docUrl,linkItem.target||'_blank');
              }
              } //-_linkageDataCall
            ,_linkageLinkItem:function(linkage){
              /// ,linkItem:{
              ///   title:'Package Diagram'
              ///   ,url:''
              ///   ,image:'http://mrobbinsassoc.com/images/icons/icons-ext/_vpp-48.png'
              ///   ,del:true
              ///   ,target:'_content_pane'
              ///   ,find:{
              ///     title:/\$explhere$/
              ///   }
              /// }
              var parts=__.ui.parts;
              if (!linkage.linkItem||!linkage.linkItem.find) {return $([]);}
              var find=linkage.linkItem.find;
              var q;//=qs.q;
              var that=this;
              var items=parts.linkItem.q.q;
              items.each(function(){
                var me=$(this);
                var title=me.find(parts.linkItemTitle.q).text();
                var url=me.find(parts.linkItemUrl.q).text();
                var mc=0;
                var mt=0;
                mt+=find.title?1:0;
                mt+=find.url?1:0;
                if (find.title&&that._stringMatcher(title,find.title)) {mc++;}
                if (find.url&&that._stringMatcher(url,find.url)) {mc++;}
                if (!q&&mc===mt) {q=me;}
              });
              return q?q:$([]);
              } //-_linkageLinkItem
            ,_linkageDocLinks:function(linkage){
              if (!linkage.docLink||!linkage.docLink.find) {return $([]);}
              var find=linkage.docLink.find;
              var qq=$('a');
              var q=$([]);//=qs.q;
              var that=this;
              qq.each(function(){
                var me=$(this);
                var href=me.attr('href');
                if (me.parent().get(0).tagName==='LI') {
                  if (that._stringMatcher(href,__.utils.defunction(find.href))) {q=q.add(me);}
                }
              });
              return q;
              } //-_linkageDocLinks
            ,_linkageDocLink:function(linkage){
              /// ,docLink:{
              ///   find:{
              ///     href:['/vp/publish/index.html?url=','Package']
              ///   }
              ///   ,extractor:__.ui.docLinkages.extractors.urlEquals
              ///   ,zap:true
              /// }
              if (!linkage.docLink||!linkage.docLink.find) {return $([]);}
              var find=linkage.docLink.find;
              var qq=$('a');
              var q;//=qs.q;
              var that=this;
              qq.each(function(){
                var me=$(this);
                var href=me.attr('href');
                if (me.parent().get(0).tagName==='LI') {
                  if (!q&&that._stringMatcher(href,__.utils.defunction(find.href))) {q=me;}
                }
              });
              return q?q:$([]);
              } //-_linkageDocLink
            ,_docLinkZap:function(docLink){
              var link=docLink;
              if (!link.length) {return;}
              var p=link.parent();
              var tag=p.get(0).tagName;
              if (tag==='LI') {
                if (p.prev().length==0) {p.parent().before('<p><em>none</em></p>');p.parent().remove();
                }else{p.remove();}
              }else{link.remove();}
              } //-_docLinkZap
            ,_linkageDocLinkZap:function(linkage){
              var link=this._linkageDocLink(linkage);
              this._docLinkZap(link);
              } //-_linkageDocLinkZap
            ,_linkageDocLinksUrls:function(linkage){
              var links=this._linkageDocLinks(linkage);
              var a=[];
              links.each(function(){
                var me=$(this);
                var url=me.attr('href');
                if (linkage.docLink&&linkage.docLink.extractor) {url=linkage.docLink.extractor(url);}
                a.push(url);
              });
              return a;
              } //-_linkageDocLinksUrls
            ,_linkageDocLinkUrl:function(linkage){
              var q=this._linkageDocLink(linkage);
              if (!q.length) {return null;}
              var url=q.attr('href');
              if (linkage.docLink&&linkage.docLink.extractor) {return linkage.docLink.extractor(url);}
              return url;
              } //-_linkageDocLinkUrl
            ,_linkageDocLinksFixups:function(linkage){
              var urls=this._linkageDocLinksUrls(linkage);
              var links=this._linkageDocLinks(linkage);
              for (var x=0;x<urls.length;x++) {
                var url=urls[x];
                var link=$(links.get(x));
                if (linkage.docLink.href!==undefined) {
                  link.attr('data-href',link.attr('href'));
                  link.attr('href',linkage.docLink.href);
                }
                if (linkage.docLink.target!==undefined) {link.attr('target',linkage.docLink.target);}
                if (linkage.docLink.click) {link.css('cursor','pointer');link.on('click',linkage.docLink.click);}
                if (linkage.docLink.zap) {this._docLinkZap(link);}
              }
              return urls;
              } //-_linkageDocLinksFixups
            ,_linkageDocLinkFixup:function(linkage){
              var url=this._linkageDocLinkUrl(linkage);
              var q=this._linkageDocLink(linkage);
              if (linkage.docLink.target) {q.attr('target',linkage.docLink.target);}
              if (linkage.docLink.zap) {this._linkageDocLinkZap(linkage);}
              return url;
              } //-_linkageDocLinkFixup
            ,_linkageHandleItem:function(linkage, docUrl){
              //console.log('_linkageHandleItem',linkage);
              var parts=__.ui.parts;
              var container=parts.linkItemsContainer.q.q;
              var linkItem=linkage.linkItem;
              if (!linkItem) {return;}
              var html;
              var item;
              var my;
              if (linkItem.isNew) {
                var data={};//img title url
                if (linkItem.title) {data.title=linkItem.title;}
                if (linkItem.image) {data.image=linkItem.image;}
                if (linkItem.url) {data.url=linkItem.url;}
                html=__.utils.linkItemHtml(data);
              }else{
                item=this._linkageLinkItem(linkage);
                if (item.length===0) {return;}
                html=item.outerHtml();
              }
              container.append(html);
              if (item) {my=item.next();
              }else{my=container.find(parts.linkItem.q).last();
              }
              if (item&&linkItem.zap) {item.remove();}
              //
              var linkItem_title=my.find(parts.linkItemTitle.q);
              var linkItem_title_v;
              if (linkItem.title) {var linkItem_title_v=linkItem.title;}
              if (linkItem_title_v!==undefined) {linkItem_title.html(linkItem_title_v);}
              ;
              var linkItem_url=my.find(parts.linkItemUrl.q);
              var linkItem_url_v;
              if (false) {
              }else if (linkItem.url===true) {linkItem_url_v=docUrl;
              }else if (linkItem.url==='') {linkItem_url_v=linkItem.url;
              }else if (linkItem.url) {linkItem_url_v=linkItem.url;
              }
              if (linkItem_url_v!==undefined) {linkItem_url.html(linkItem_url_v);}
              //
              var linkItem_image=my.find(parts.linkItemImage.q);
              var linkItem_image_v;
              if (linkItem.image) {linkItem_image_v=linkItem.image;}
              if (linkItem_image_v!==undefined) {
                linkItem_image.attr('src',linkItem_image_v).css('width','32px').css('height','32px');
              }
              //
              if (linkItem.target==='_content_pane') {
                my.css('cursor','crosshair');
                my.on('click',function(){
                  var msg={
                    from:'WebBrain'
                    ,action:'loadContentPane'
                    ,url:docUrl
                  };
                  window.top.postMessage(msg,'*');
                });
              }else{
                my.css('cursor','pointer');
                my.on('click',function(){
                  window.open(docUrl,linkItem.target||'_blank');
                });
              }
              if ($.isArray(linkItem.docUrl)) {
                linkItem.push(docUrl);
              }else{
                linkItem.docUrl=docUrl;
              }
              //
              if (linkage.done) {
                linkage.done({docUrl:docUrl,my:my});
              }
              }
            ,_linkageHandle:function(linkage){
              var docUrls=this._linkageDocLinksFixups(linkage);
              for (var x=0;x<docUrls.length;x++) {
                this._linkageHandleItem(linkage,docUrls[x]);
              }
              //
              } //-_cloneLast
            ,_processLinkage:function(linkage){
              this._linkageHandle(linkage);//url,text,title,icon,target,msg,del
              } //-_processLinkage
            ,onHashChange:function(){
              console.log('onHashChange',location);
              this._iniData();
              var linkages=Object.keys(this.linkages);
              for (var x=0;x<linkages.length;x++) {
                var n=linkages[x];
                //console.log('linkage:'+n);
                var linkage=this.linkages[n];
                this._processLinkage(linkage);
              }
              '#bottomEdit a[href^="http"]:not([target])'.q.attr('target','_blank');
              } //-onHashChange
            ,_init_:function(){
              __.data.docLinkages={};
              this.popupIcon._init();
              this._registerLinkages();
              } //-_init_
            ,_init:function(){
              this._init_();
              } //-_init
            } //-docLinkages
          ,onHashChange:function(){
            var that=this;
            console.log('window.name',window.name);
            if (window.name==='_brain_pane') {
              setTimeout(function(){
                that.docLinkages.onHashChange();
              },__.set.onHashChange.timeout);
            }
            } //-onHashChange
          ,onLoad:function(){
            this.onHashChange();
            } //-onLoad
          ,onMessage:function(event){
            if (event.data.from==='RealtimeBoad') {
              console.log('WebBrain onMessage',event);
            }
            if (event.data.from==='VisualParadigm') {
              console.log('VisualParadigm onMessage',event);
            }
            } //-onMessage
          ,_init_:function(){
            this.docLinkages._init();
            //this.viz._init();// keep at bottom
            } //-_init_
          ,_init:function(){
            this._init_();
            } //-_init
          } //-ui
        ,event:{
          _name:'event'
          ,dom:{
            _name:'dom'
            ,node_removed:function(event){
              //console.log('node_removed',event);
              } //-node_removed
            ,node_inserted:function(event){
              //console.log('node_inserted',event);
              var me=$(event.target);
              if (me.attr('class')=='gwt-PopupPanel') {
                //console.log('gwt-PopupPanel inserted');
                ///<div class="gwt-PopupPanel" style="left: 615px; top: 139px; z-index: 990; visibility: visible; position: absolute; clip: rect(auto auto auto auto); overflow: visible;">
                ///  <div class="popupContent">
                ///    <img class="gwt-Image" src="https://webbrain.com/icon?brain=09335629-E824-3836-6E1A-8A30325D2C09&amp;pa…mp;unique=1489963142000&amp;maxWidth=200&amp;maxHeight=200&amp;match=false">
                ///  </div>
                ///</div>
                // setTimeout(function(){
                //   console.log(me.outerHtml());
                // },1000);
                //if ($('.thought.active.hover').length) {
                //  console.log('.thought.active.hover',me.length);
                //  me.on('click',function(evt){
                //    console.log('.thought.active.hover:CLICK');
                //    __.ul.docLinkages.popupIcon.onClick(evt);
                //  });
                //
                //  // setTimeout(function(){
                //  // },200);
                //}
                //me.on('click',function(evt){});
              }
              } //-node_inserted
            } //-dom
          ,kbd:{
            _name:'kbd'
            ,k_ad33:function(evt){//pgup
              __.actions.midBarUp();
              return false;
              } //-k_au34
            ,k_ad34:function(evt){//pgdn
              __.actions.midBarDown();
              return false;
              } //-k_au34
            ,k_asd33:function(evt){
              __.actions.rightFrameUp();
              return false;
              } //-k_asu33
            ,k_asd34:function(evt){
              __.actions.rightFrameDown();
              return false;
              } //-k_asu34
            } //-kbd
          ,doc:{
            _name:'doc'
            ,_17_ct:0
            ,_keysdown:{
              } //-_keysdown
            ,cas:function(){
              var cas='';
              if (__.event.doc._keysdown._17!==undefined) {cas+='c';}
              if (__.event.doc._keysdown._18!==undefined) {cas+='a';}
              if (__.event.doc._keysdown._16!==undefined) {cas+='s';}
              return cas;
              } //-cas
            ,_do_call:function(code,evt){
              if (__.data.showkeys) {console.log('code:'+code);}
              //console.log('code:'+code);
              code._bc({evt:evt});
              if (typeof __.event.kbd[code]==='function') {
                //console.log('press:'+code);
                if (this._check_call(__.event.kbd[code])) {
                  return __.event.kbd[code](evt);
                }
                return;
              }else if (jQuery.isArray(__.event.kbd[code])) {
                var a=__.event.kbd[code];
                var x;
                for (x=0;x<a.length;x++) {
                  if (typeof a[x]==='function') {
                    console.log('press:'+x+' '+code);
                    if (!this._check_call(a[x])) {
                      console.log('item failed _check_call :'+x+' '+code);
                      continue;
                    }
                    var rv=a[x](evt);
                    if (rv!==undefined) {
                      if (rv===false) {
                        // return 'continue'
                        return rv;
                      }
                    }
                  }
                }
              }
              } //-_do_call
            ,_check_call:function(fo){
              if (fo.me===undefined) {
                return true;
              }
              console.log('_check_call:j:'+fo.me.k.j);
              if (fo.me.k.j.indexOf('c')===-1&&fo.me.k.j.indexOf('a')===-1&&fo.me.k.j.indexOf('s')===-1) {
                console.log('_check_call:plainkey?:'+fo.me.k.j);
                // plain key
                var kc=fo.me.k.j.substr(1);
                kc=parseInt(kc);
                console.log('_check_call:plainkey?:kc:'+kc);
                // enter esc space 0-9
                var aa=[13,27,32,48,49,50,51,52,53,54,55,56
                 // - = bs
                 ,189,187,8
                 // a-z
                 ,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90
                 // [ ] \
                 ,219,221,220
                 // ; '
                 ,186,222
                 // ,./
                 ,188,190,191
                 // ins hom pu del end pd
                 ,45,36,33,46,35,34
                 // left right up down
                 ,37,39,38,40
                 // f1-f12  3  4  5    6   7   8   9  10   11  12
                 //,112,113,114,115,116,117,118,119,120,121,122,123
                 // num / * - + .
                 ,111,106,109,107,110
                 // num 0-9    5   6   7   8   9
                 ,96,97,98,99,100,101,102,103,104
                 ];
                console.log('_check_call:aa.indexOf('+kc+'):'+aa.indexOf(kc));
                if (aa.indexOf(kc)!=-1) {
                  if (__.state.inEditor()) {
                    console.log('exit inEditor:'+kc+' '+fo.me.n);
                    return false;
                  }
                }
              }
              // return true if should call
              var w=fo.me.W;
              //console.log('fo,fo.me:',fo,fo.me);
              if (w===undefined) {
                return true;
              }
              //console.log('w',w);
              w=w.split(',');
              //console.log('w',w);
              //w=__.utils.cleanFor(w,'string');
              //console.log('w',w);
              //console.log('w.length',w.length);
              var ay=[];
              var an=[];
              var x;
              for (x=0;x<w.length;x++) {
                var i=w[x];
                if (typeof i!=='string') {
                  continue;
                }
                if (i.substr(0,1)=='!') {
                  an.push(i.substr(1));
                }else{
                  ay.push(i);
                }
              }
              //console.log('ay',ay,'an',an);
              //ay=__.utils.cleanFor(ay,'string');
              //an=__.utils.cleanFor(an,'string');
              //console.log('ay',ay,'an',an);
              function tryit(s){
                var f=__.state['is'+s];
                if (typeof f!=='function') {
                  console.error('state Fn not found:is'+s+'()');
                  return false;
                }
                var rv=__.state['is'+s]();
                return rv;
              }
              var yy=false;
              for (x=0;x<ay.length;x++) {
                if (tryit(ay[x])) {
                  yy=true;
                }
              }
              if (ay.length===0) {
                yy=true;
              }
              var nn=false;
              for (x=0;x<an.length;x++) {
                if (tryit(an[x])) {
                  nn=true;
                }
              }
              if (yy&&(!nn)) {
                //console.log(fo,'yy:'+yy+' nn:'+nn+' rv:true');
                return true;
              }
              //console.log(fo,'yy:'+yy+' nn:'+nn+' rv:false');
              return false;
              } //-_check_call
            ,keypress:function(evt){
              if (__.data.showkeys) {console.log('document.keypress',evt.keyCode);}
              var cas=__.utils.cas(evt);
              var foc=$(':focus');
              if (foc.length==1&&foc.prop('tagName')==='TEXTAREA') {return;}
              var code='k_'+cas+'p'+evt.keyCode;
              return this._do_call(code,evt);
              } //-keypress
            ,keyup:function(evt){
              if (__.data.showkeys) {console.log('document.keyup',evt.keyCode);}
              var foc=$(':focus');
              //console.log('document.keyup.tagName',foc.prop('tagName'));
              var cas=__.utils.cas(evt);
              if (this._keysdown['_'+evt.keyCode]!==undefined) {
                delete this._keysdown['_'+evt.keyCode];
              }
              var code='k_'+cas+'u'+evt.keyCode;
              return this._do_call(code,evt);
              } //-keyup
            ,keydown:function(evt){
              var foc=$(':focus');
              if (0) {
                if (foc.length==1&&foc.prop('tagName')==='TEXTAREA') {
                  if (evt.keyCode!==17&&evt.keyCode!==18&&evt.keyCode!==16) {
                    return;
                  }
                }
              }
              if (this._keysdown['_'+evt.keyCode]!==undefined) {return;}
              if (__.data.showkeys) {console.log('document.keydown',evt.keyCode);}
              //if (document.sk) {console.log('document.keydown',evt.keyCode);}
              this._keysdown['_'+evt.keyCode]=new Date();
              var cas=__.utils.cas(evt);
              var code='k_'+cas+'d'+evt.keyCode;
              return this._do_call(code,evt);
              } //-keydown
            } //-doc
          ,win:{
            _name:'win'
            ,hashChange:function(event){
              //console.log('hashChange',window.location.hash);
              __.ui.onHashChange();
              } //-hashChange
            ,message:function(event){
              __.ui.onMessage(event);
              } //-message
            } //-win
          } //-event
        ,inits:{
          _name:'inits'
          ,bug:false
          ,protos:function(){
            this.bug&&console.log('bugging:'+arguments.callee.name);
            if (arguments.callee.initialized) {console.error('already initialized');return;}arguments.callee.initialized=true;
            var __entityMap = {
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': '&quot;',
              "'": '&#39;',
              "/": '&#x2F;'
              };//-__entityMap
            String.prototype.escapeHTML = function() {
              return String(this).replace(/[&<>"'\/]/g, function (s) {
                  return __entityMap[s];
              });
              }; //-escapeHTML
            String.prototype.qo=function(){
              var s=''+this;
              return $(s);
              }; //-qo
            String.prototype._ropf=function(o,fn){
              var n=''+this;
              Object.defineProperty(o,n, {
                get: fn
                ,set: function() { throw "Cannot set Read Only Property '"+n+"'"; }
                ,enumerable: true
                ,configurable: false
              });
              }; //-_ropf
            String.prototype._ropq=function(o,sel){
              var n=''+this;
              Object.defineProperty(o, n, {
                get: function(){
                  return $(sel);
                }
                ,set: function() { throw "Cannot set Read Only Property '"+n+"'"; }
                ,enumerable: true
                ,configurable: false
              });
              }; //-_ropq
            String.prototype._ropqc=function(o,sel){
              var n=''+this;
              Object.defineProperty(o, n, {
                get: function(){
                  if (!arguments.callee.cache) {
                    arguments.callee.cache=$(sel);
                  }
                  return arguments.callee.cache;
                }
                ,set: function() { throw "Cannot set Read Only Property '"+n+"'"; }
                ,enumerable: true
                ,configurable: false
              });
              }; //-_ropqc
            String.prototype._pf=function(o,get_f,set_f){
              var n=''+this;
              Object.defineProperty(o, n, {
                get: get_f
                ,set: set_f
                ,enumerable: true
                ,configurable: false
              });
              }; //-_pf
            's'._ropf(String.prototype,function(){
              console.log(''+this,this.q[0]);
              return this.q;
              }); // -q
            'q'._ropf(String.prototype,function(){
              return this.qo();
              }); // -q
            'e'._ropf(String.prototype,function(){
              var q=this.qo();
              console.info(this+':',q.length);
              var dp=q.getDomPath();
              console.info(dp);
              var t='2px dotted red';
              location.href='aip://clip/'+escape(dp);
              return q
               .css('border',t)
               .css('border-left',t)
               .css('border-top',t)
               .css('border-bottom',t)
               .css('border-right',t)
               .css('box-shadow','inset 0px 0px 10px 2px #F00')
               .css('-webkit-filter','brightness(5) contrast(1.6)');
            });
            'ee'._ropf(String.prototype,function(){
              var q=this.qo();
              console.info(this+':',q.length);
              return q
               .css('border','')
               .css('border-left','')
               .css('border-top','')
               .css('border-bottom','')
               .css('border-right','')
               .css('box-shadow','')
               .css('-webkit-filter','');
            });
            'exists'._ropf(String.prototype,function(){
              var s=''+this;
              return s.q.length!==0;
            });
            '_one'._ropf(String.prototype,function(){
              var s=''+this;
              return s.q.length===1;
            });
            'p'._ropf(String.prototype,function(){
              var s=''+this;
              if (s.exists) {
                if (s.q.length==1) {
                  return s.q.getDomPath();
                }
                var a=[];
                s.q.each(function(){
                  var me=$(this);
                  a.push(me.getDomPath());
                });
                return a;
              }
              return null;
            });
            'singleSpace'._ropf(String.prototype,function(){
              var s=''+this;
              return s.replace(/\s{2,}/g, ' ');
            });
            '_trim'._ropf(String.prototype,function(){
              var s=''+this;
              return $.trim(s);
            });
            '_abbr'._ropf(String.prototype,function(){
               var s=''+this;
               if (s==='') {
                 return '';
               }
               s=s.replace(/[^a-zA-Z0-9]/g,' ');
               var a=[];
               var x;
               var p_type;
               var m={su:true,sl:true,sn:true,nl:true,nu:true,lu:true,uu:true,ln:true,un:true};
               for(x=0;x<s.length;x++){
                 var e=s.substr(x,1);
                 var is_type;//ulns
                 if ('0123456789'.indexOf(e)>=0){is_type='n';
                 }else if('abcdefghijklmnopqrstuvwxyz'.indexOf(e)>=0){is_type='l';
                 }else if('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(e)>=0){is_type='u';
                 }else{is_type='s';
                 }
                 if(p_type===undefined){
                   if(is_type!=='s'){
                     a.push(e);
                   }
                 }else{
                   if (m[p_type+is_type]){
                     a.push(e);
                   }
                 }
                 p_type=is_type;
               }
               return a.join('').toUpperCase();
            });
            '_numwrap'._ropf(String.prototype,function(){
               var s=''+this;
               return '&#9129;'+s+'&#9131;';
            });
            '_f4'._ropf(String.prototype,function(){
               var s=''+this;
               setTimeout(function(){
                 s.q.focus();
               },4000);
               return s.q[0];
            });
            '_viz'._ropf(String.prototype,function(){
               var s=''+this;
               function comp(s){
                 var co=tinycolor(s);
                 var hsl=co.toHsl();
                 var c=1;
                 var a=0.5;
                 var b=0.5;
                 var v=Math.sqrt(a*hsl.h*a*hsl.h + b*hsl.s*b*hsl.s + c*hsl.l*c*hsl.l);
                 return v;
               }
               var v0=comp(s);
               var at=10000;//Number.Infinity;
               var found;
               vizcolors.forEach(function(cc){
                 var v=comp(cc.c);
                 //console.log('v',v);
                 var dif=Math.abs(v0-v);
                 //console.log('dif',dif);
                 if (dif<at) {
                   //console.log('found..',cc);
                   at=dif;
                   found=cc;
                 }
               });
               if (found) {
                 return found;
               }
            });
            '_l'._ropf(String.prototype,function(){
               var s=''+this;
               console.log(s);
            });
            '_i'._ropf(String.prototype,function(){
               var s=''+this;
               console.info(s);
            });
            '_w'._ropf(String.prototype,function(){
               var s=''+this;
               console.warn(s);
            });
            if (1) {
              'delimiter'._ropf(String.prototype,function(){
                var s=this.toString();
                //var dels=String.fromCharCode(13)+String.fromCharCode(9)+'|:.,;_=-'+' ';
                var dels=String.fromCharCode(13)+String.fromCharCode(9)+'|,;'+' '+':.-_';
                dels=dels.split('');
                for (var x=0;x<dels.length;x++) {
                  var ss=dels[x];
                  if (s.indexOf(ss)!=-1) {
                    return ss;
                  }
                }
                return '';
              });
              String.prototype.inList=function(list,del){
                var s=this.toString();
                if (typeof list==='string') {
                  var d=list.delimiter;
                  if (d==='') {
                    d=' ';
                  }
                  del=d;
                  list=list.split(del);
                }
                return list.indexOf(s)!==-1;
              }
              String.prototype.hasItem=function(item,del){
                var s=this.toString();
                return item.inList(s,del);
              }
            }
            //'.simple-balloon.app-filters-popover .navigation li.selected'._f4
            String.prototype._abbr2=function(allows){
              var s=''+this;
              if (s==='') {
                return '';
              }
              var allows2=allows.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
              var re=new RegExp('[^a-zA-Z0-9'+allows2+']','g');
              s=s.replace(re,' ');
              var s0=s.replace(/ /g,'');
              var a=[];
              var x;
              var p_type;
              var m={su:true,sl:true,sn:true,nl:true,nu:true,lu:true,uu:true,ln:true,un:true};
              for(x=0;x<s.length;x++){
                var e=s.substr(x,1);
                var is_type;//ulns
                if ('0123456789'.indexOf(e)>=0){is_type='n';
                }else if('abcdefghijklmnopqrstuvwxyz'.indexOf(e)>=0){is_type='l';
                }else if('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(e)>=0){is_type='u';
                }else{is_type='s';
                }
                if(p_type===undefined){
                  if(is_type!=='s'){
                    a.push(e);
                  }else{
                    if (allows.indexOf(e)>=0) {a.push(e);}
                  }
                }else{
                  if (m[p_type+is_type]){
                    a.push(e);
                  }else{
                    if (allows.indexOf(e)>=0) {a.push(e);}
                  }
                }
                p_type=is_type;
              }
              if (a.length==1) {
                a.push(s0.substr(1,2));
              }
              return a.join('').toUpperCase();
            }
            String.prototype._bc=function(o,that_){return radio(this.toString()).broadcast(o,that_);}
            String.prototype._sub=function(a1,a2,a3,a4){return radio(this.toString()).subscribe(a1,a2,a3,a4);}
            } //-protos
          ,jquery_addons:function(){
            if (arguments.callee.initialized) {console.error('already initialized');return;}arguments.callee.initialized=true;
            //noinspection JSUnresolvedVariable
            (function($){
              $.fn.replaceText = function( search, replace, text_only ) {
                return this.each(function(){
                  var node = this.firstChild,val,new_val,remove = [];
                  if ( node ) {
                    do {
                      if ( node.nodeType === 3 ) {
                        val = node.nodeValue;new_val = val.replace( search, replace );
                        if ( new_val !== val ) {
                          if ( !text_only && /</.test( new_val ) ) {
                            $(node).before( new_val );remove.push( node );
                          } else {
                            node.nodeValue = new_val;
                          }
                        }
                      }
                    } while ( node = node.nextSibling );
                  }
                  remove.length && $(remove).remove();
                });
              };
            })(jQuery);
            //noinspection JSUnresolvedVariable
            (function($){
              $.fn.visibles = function() {
                return this.filter(function(){
                  if (this.isVisible()) {
                    return false;
                  }
                  return true;
                });
              };
            })(jQuery);
            //noinspection JSUnresolvedVariable
            (function($){
              $.fn.withText = function( search ) { //+ text_only second arg unused
                var rv=this.contents().filter(
                  function(){
                    if (this.nodeType!==3) {
                      return false;
                    }
                    //var me=$(this);
                    var txt=this.nodeValue;
                    if (typeof search=='object') {//re
                      return search.test(txt);
                    }
                    return txt.indexOf(search)!=-1;
                  }
                );
                return rv.parent();
             };
            })(jQuery);
            //noinspection JSUnresolvedVariable
            (function( $ ){
              var getStringForElement = function (el) {
                var string = el.tagName.toLowerCase();
                if (el.id) {
                  string += "#" + el.id;
                }
                if (el.className) {
                  if (typeof el.className==='string') {
                    if (el.className!='') {
                      string += "." + el.className.replace(/  */g,' ').replace(/ /g, '.');
                    }
                  }
                }
                string=string.replace(/\.\.*/,'.');
                return string;
              };
              $.fn.getDomPath = function(string) {
                if (typeof(string) == "undefined") {
                  string = true;
                }
                var p = [],el = $(this).first();
                el.parents().not('html').each(function() {
                  p.push(getStringForElement(this));
                });
                p.reverse();
                p.push(getStringForElement(el[0]));
                return string ? p.join(" > ") : p;
              };
            })( jQuery );
            ;(function( $, undefined ) {
            var rkeyEvent = /^key/,
              rmouseEvent = /^(?:mouse|contextmenu)|click/;
            $.fn.simulate = function( type, options ) {
              return this.each(function() {
                new $.simulate( this, type, options );
              });
            };
            $.simulate = function( elem, type, options ) {
              var method = $.camelCase( "simulate-" + type );
              this.target = elem;
              this.options = options;
              if ( this[ method ] ) {
                this[ method ]();
              } else {
                this.simulateEvent( elem, type, options );
              }
            };
            $.extend( $.simulate, {
              keyCode: {
                BACKSPACE: 8,
                COMMA: 188,
                DELETE: 46,
                DOWN: 40,
                END: 35,
                ENTER: 13,
                ESCAPE: 27,
                HOME: 36,
                LEFT: 37,
                NUMPAD_ADD: 107,
                NUMPAD_DECIMAL: 110,
                NUMPAD_DIVIDE: 111,
                NUMPAD_ENTER: 108,
                NUMPAD_MULTIPLY: 106,
                NUMPAD_SUBTRACT: 109,
                PAGE_DOWN: 34,
                PAGE_UP: 33,
                PERIOD: 190,
                RIGHT: 39,
                SPACE: 32,
                TAB: 9,
                UP: 38
              },
              buttonCode: {
                LEFT: 0,
                MIDDLE: 1,
                RIGHT: 2
              }
            });
            $.extend( $.simulate.prototype, {
              simulateEvent: function( elem, type, options ) {
                var event = this.createEvent( type, options );
                this.dispatchEvent( elem, type, event, options );
              },
              createEvent: function( type, options ) {
                if ( rkeyEvent.test( type ) ) {
                  return this.keyEvent( type, options );
                }
                if ( rmouseEvent.test( type ) ) {
                  return this.mouseEvent( type, options );
                }
              },
              mouseEvent: function( type, options ) {
                var event, eventDoc, doc, body;
                options = $.extend({
                  bubbles: true,
                  cancelable: (type !== "mousemove"),
                  view: window,
                  detail: 0,
                  screenX: 0,
                  screenY: 0,
                  clientX: 1,
                  clientY: 1,
                  ctrlKey: false,
                  altKey: false,
                  shiftKey: false,
                  metaKey: false,
                  button: 0,
                  relatedTarget: undefined
                }, options );
                if ( document.createEvent ) {
                  event = document.createEvent( "MouseEvents" );
                  event.initMouseEvent( type, options.bubbles, options.cancelable,
                    options.view, options.detail,
                    options.screenX, options.screenY, options.clientX, options.clientY,
                    options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
                    options.button, options.relatedTarget || document.body.parentNode );
                  // IE 9+ creates events with pageX and pageY set to 0.
                  // Trying to modify the properties throws an error,
                  // so we define getters to return the correct values.
                  if ( event.pageX === 0 && event.pageY === 0 && Object.defineProperty ) {
                    eventDoc = event.relatedTarget.ownerDocument || document;
                    doc = eventDoc.documentElement;
                    body = eventDoc.body;
                    Object.defineProperty( event, "pageX", {
                      get: function() {
                        return options.clientX +
                          ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
                          ( doc && doc.clientLeft || body && body.clientLeft || 0 );
                      }
                    });
                    Object.defineProperty( event, "pageY", {
                      get: function() {
                        return options.clientY +
                          ( doc && doc.scrollTop || body && body.scrollTop || 0 ) -
                          ( doc && doc.clientTop || body && body.clientTop || 0 );
                      }
                    });
                  }
                } else if ( document.createEventObject ) {
                  event = document.createEventObject();
                  $.extend( event, options );
                  // standards event.button uses constants defined here: http://msdn.microsoft.com/en-us/library/ie/ff974877(v=vs.85).aspx
                  // old IE event.button uses constants defined here: http://msdn.microsoft.com/en-us/library/ie/ms533544(v=vs.85).aspx
                  // so we actually need to map the standard back to oldIE
                  event.button = {
                    0: 1,
                    1: 4,
                    2: 2
                  }[ event.button ] || ( event.button === -1 ? 0 : event.button );
                }
                return event;
              },
              keyEvent: function( type, options ) {
                var event;
                options = $.extend({
                  bubbles: true,
                  cancelable: true,
                  view: window,
                  ctrlKey: false,
                  altKey: false,
                  shiftKey: false,
                  metaKey: false,
                  keyCode: 0,
                  charCode: undefined
                }, options );
                if ( document.createEvent ) {
                  try {
                    event = document.createEvent( "KeyEvents" );
                    event.initKeyEvent( type, options.bubbles, options.cancelable, options.view,
                      options.ctrlKey, options.altKey, options.shiftKey, options.metaKey,
                      options.keyCode, options.charCode );
                  // initKeyEvent throws an exception in WebKit
                  // see: http://stackoverflow.com/questions/6406784/initkeyevent-keypress-only-works-in-firefox-need-a-cross-browser-solution
                  // and also https://bugs.webkit.org/show_bug.cgi?id=13368
                  // fall back to a generic event until we decide to implement initKeyboardEvent
                  } catch( err ) {
                    event = document.createEvent( "Events" );
                    event.initEvent( type, options.bubbles, options.cancelable );
                    $.extend( event, {
                      view: options.view,
                      ctrlKey: options.ctrlKey,
                      altKey: options.altKey,
                      shiftKey: options.shiftKey,
                      metaKey: options.metaKey,
                      keyCode: options.keyCode,
                      charCode: options.charCode
                    });
                  }
                } else if ( document.createEventObject ) {
                  event = document.createEventObject();
                  $.extend( event, options );
                }
                if ( !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() ) || (({}).toString.call( window.opera ) === "[object Opera]") ) {
                  event.keyCode = (options.charCode > 0) ? options.charCode : options.keyCode;
                  event.charCode = undefined;
                }
                return event;
              },
              dispatchEvent: function( elem, type, event ) {
                if ( elem[ type ] ) {
                  elem[ type ]();
                } else if ( elem.dispatchEvent ) {
                  elem.dispatchEvent( event );
                } else if ( elem.fireEvent ) {
                  elem.fireEvent( "on" + type, event );
                }
              },
              simulateFocus: function() {
                var focusinEvent,
                  triggered = false,
                  element = $( this.target );
                function trigger() {
                  triggered = true;
                }
                element.bind( "focus", trigger );
                element[ 0 ].focus();
                if ( !triggered ) {
                  focusinEvent = $.Event( "focusin" );
                  focusinEvent.preventDefault();
                  element.trigger( focusinEvent );
                  element.triggerHandler( "focus" );
                }
                element.unbind( "focus", trigger );
              },
              simulateBlur: function() {
                var focusoutEvent,
                  triggered = false,
                  element = $( this.target );
                function trigger() {
                  triggered = true;
                }
                element.bind( "blur", trigger );
                element[ 0 ].blur();
                // blur events are async in IE
                setTimeout(function() {
                  // IE won't let the blur occur if the window is inactive
                  if ( element[ 0 ].ownerDocument.activeElement === element[ 0 ] ) {
                    element[ 0 ].ownerDocument.body.focus();
                  }
                  // Firefox won't trigger events if the window is inactive
                  // IE doesn't trigger events if we had to manually focus the body
                  if ( !triggered ) {
                    focusoutEvent = $.Event( "focusout" );
                    focusoutEvent.preventDefault();
                    element.trigger( focusoutEvent );
                    element.triggerHandler( "blur" );
                  }
                  element.unbind( "blur", trigger );
                }, 1 );
              }
            });
            /** complex events **/
            function findCenter( elem ) {
              var offset,
                document = $( elem.ownerDocument );
              elem = $( elem );
              offset = elem.offset();
              return {
                x: offset.left + elem.outerWidth() / 2 - document.scrollLeft(),
                y: offset.top + elem.outerHeight() / 2 - document.scrollTop()
              };
            }
            function findCorner( elem ) {
              var offset,
                document = $( elem.ownerDocument );
              elem = $( elem );
              offset = elem.offset();
              return {
                x: offset.left - document.scrollLeft(),
                y: offset.top - document.scrollTop()
              };
            }
            $.extend( $.simulate.prototype, {
              simulateDrag: function() {
                var i = 0,
                  target = this.target,
                  eventDoc = target.ownerDocument,
                  options = this.options,
                  center = options.handle === "corner" ? findCorner( target ) : findCenter( target ),
                  x = Math.floor( center.x ),
                  y = Math.floor( center.y ),
                  coord = { clientX: x, clientY: y },
                  dx = options.dx || ( options.x !== undefined ? options.x - x : 0 ),
                  dy = options.dy || ( options.y !== undefined ? options.y - y : 0 ),
                  moves = options.moves || 3;
                this.simulateEvent( target, "mousedown", coord );
                for ( ; i < moves ; i++ ) {
                  x += dx / moves;
                  y += dy / moves;
                  coord = {
                    clientX: Math.round( x ),
                    clientY: Math.round( y )
                  };
                  this.simulateEvent( eventDoc, "mousemove", coord );
                }
                if ( $.contains( eventDoc, target ) ) {
                  this.simulateEvent( target, "mouseup", coord );
                  this.simulateEvent( target, "click", coord );
                } else {
                  this.simulateEvent( eventDoc, "mouseup", coord );
                }
              }
            });
            })( jQuery );
            $.fn.extend({ // hasClasses
              hasClasses: function (selectors) {
                var self = this;
                selectors=typeof selectors==='string'?selectors.split(' '):selectors;
                for (var i in selectors) {
                  if ($(self).hasClass(selectors[i])) {
                    return true;
                  }
                }
                return false;
              } // fn
            });
            /*
             * outerHtml
             * https://github.com/JamesMGreene/jquery.outerHtml
             *
             * Copyright (c) 2013 James M. Greene
             * Licensed under the MIT license.
             */
            (function($) {
              'use strict';


              var hasNativeOuterHTML = !!('outerHTML' in $('<div></div>').get(0));

              // Prefer the native `outerHTML` property when possible
              var getterFn = function() {
                var target = this.get(0);
                // If the browser supports the `outerHTML` property on elements AND if `target` is an element node
                if (hasNativeOuterHTML && target.nodeType === 1) {
                  return target.outerHTML;
                }
                else {
                  return $('<div></div>').append(this.eq(0).clone()).html();
                }
              };

              var setterFn = function(value) {
                // Do not attempt to replace anything using the native `outerHTML` property setter
                // even if it exists: it is riddled with bugs!
                return $('<div id="jquery-outerHtml-transformer"></div>').append(value).contents().replaceAll(this);
              };
              // Detect jQuery 1.8.x bug (for which the value here is `false`)
              var doesNotLeaveTempParentOnDetachedDomElement = true;
              $.fn.outerHtml = function(value) {
                if (arguments.length) {
                  if (doesNotLeaveTempParentOnDetachedDomElement) {
                    return setterFn.call(this, value);
                  }
                  else {
                    // Fix for jQuery 1.8.x bug: https://github.com/JamesMGreene/jquery.outerHtml/issues/1
                    var parentsOfThis = (function() {
                      var parents = new Array(this.length);
                      this.each(function(i) {
                        parents[i] = this.parentNode || null;
                      });
                      return parents;
                    }).call(this);

                    return setterFn.call(this, value).map(function(i) {
                      if (!parentsOfThis[i]) {
                        if (this.parentNode) {
                          return this.parentNode.removeChild(this);
                        }
                      }
                      else if (parentsOfThis[i] !== this.parentNode) {
                        // Appending to the end: this doesn't seem right but it should cover the detached DOM scenarios
                        return parentsOfThis[i].appendChild(this);
                      }
                      return this;
                    });
                  }
                }
                else {
                  return getterFn.call(this);
                }
              };

              // Detect jQuery 1.8.x bug (for which the value here is `false`)
              doesNotLeaveTempParentOnDetachedDomElement = (function() {
                var parent = $('<s>bad</s>').outerHtml('<div>good</div>').get(0).parentNode;
                return (parent.nodeName === '#document-fragment' && parent.nodeType === 11);
              })();
            }(jQuery));
            } //-jquery_addons
          ,libs:function(){
            __.libs._init();
            } //-libs
          ,hooks:function(){
            __.hooks._init();
            } //-hooks
          ,styles:function(){
            __.style._init();
            } //-styles
          ,ui:function(){
            __.ui._init();
            } //-ui
          ,_init_:function(){
            __.utils.body_msg('inits...');
            this.protos();
            this.jquery_addons();
            this.libs();
            this.hooks();
            this.styles();
            this.ui();
            //__.inits.messaging();
            //__.ctrls._init();
            //__.inits.dom_hook();
            //+this.keyset();
            //+this.key_hook();
            //__.inits.styles();
            __.ui.onLoad();
            __.utils.body_msg('inits done');
            //this.fixes();
            } //-_init_
          ,_init:function(){
            this._init_();
            } //-_init
          } //-inits
        ,init:{
          _name:'init'
          ,_init_:function(){
            //console.info('__.init._init_');
            __.inits._init();
            } //-_init_
          ,_init:function(){
            //console.info('__.init._init');
            this._init_();
            console.log('__.init() completed');
            } //-_init
          } //-init
        } //-window.__
      var __=window.__;
      (function(){
        function waiter(){
          if (!__.state.isViewLoaded()) {
            console.log('!__.state.isViewLoaded() in WebBrain');
            setTimeout(waiter,500);
            return;
          }
          setTimeout(function(){
            console.log('__.init._init() in WebBrain');
            __.init._init();
          },100);
        }
        waiter();
      }());// - function
    })();
  } // waitJq
  waitJq()
})();

