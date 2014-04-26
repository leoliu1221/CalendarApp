
var ptASObj = function (fld, param, id) {
  
  var ptAS = {
    ptBaseURI : String(location).match(/\/ps(c|p)\/?([^\/]*)?\/?([^\/]*)?\/?([^\/]*)?\//)[0].replace('psp', 'psc'),
    fld: null,
    prevVal: "",   
    inputVal: "",  
    inputCount: 0, 
    autoSuggest: [],
    highLiteNum: 0,
    options: null,
    asId: "",
    scroll : null,                
    IEquirksMode : browserInfoObj2.isIE && document.compatMode != "CSS1Compat",            
    scrollDownId : "ptasScrollDown",   
    scrollUpId : "ptasScrollUp",       
    scrollCfg : null, 
	firstSearch : true,  
    keys : {ARRUP : 38,ARRDN : 40,RETURN : 13,ESC : 27},

    init: function(fld, param, id) {      
      if (!fld) { return; }
      this.fld = fld;   
      this.asId = id;
      this.options = param ? param: {};
      var def = {
        minchars: 1,     
        searchURI: ptAS.ptBaseURI + "s/WEBLIB_PORTAL.PORTAL_SEARCH_PB.FieldFormula.ISCRIPT_PortalSearch?SEARCH_TEXT=",
        meth: "get",
        className: "ptAS",
        timeout: 2500,
        delay: 1000,
        offsety: -5,
        shownoresults: true,
        noresults: "No match.",
        cache: true,
        maxentries: 100   
      };

      for (var opt in def) {
        if (typeof(this.options[opt]) != typeof(def[opt])) {
          this.options[opt] = def[opt];
        }
      }
	  
      var scrollCfg = {
          viewStartEl      : this.fld,
          bottomOffset     : 11,     
          showUpBtnStyle   : "ptASscrollupshow",
          hideUpBtnStyle   : "ptASscrollup",
          showDownBtnStyle : "ptASscrolldownshow",
		  hideDownBtnStyle : "ptASscrolldown"
      };
      
/*      ptAS.scroll = new ptScrollable(scrollCfg);    */
      ptAS.scrollCfg = scrollCfg;
      ptEvent.add(this.fld, "keypress", this.onKeyPress);
      ptEvent.add(this.fld, "keyup", this.onKeyUp);
	  ptEvent.add(this.fld, "blur", this.clearSuggestions);
      ptEvent.add(window, "resize", this.onWinResize);
    },

    onKeyPress: function(ev) {
      var key = (window.event) ? window.event.keyCode: ev.keyCode;
      var bubble = true;
      switch (key) {
        case ptAS.keys.RETURN:
          var highlightRet = ptAS.setHighlightedValue();
	      if (highlightRet != null) {
	        location.href = highlightRet; 
	        bubble = false;
          }
          else
             bubble = true;   
          break;
        case ptAS.keys.ESC:
          ptAS.clearSuggestions();
          break;
      }
      return bubble;
    },
    
    onKeyUp: function(ev) {
      var key = (window.event) ? window.event.keyCode: ev.keyCode;
      var bubble = true;
      switch (key) {
        case ptAS.keys.ARRUP:
          ptAS.changeHighlight(key);
          ptAS.arrowScroll(key); 
          bubble = false;
        break;
        case ptAS.keys.ARRDN:
          ptAS.changeHighlight(key);
          ptAS.arrowScroll(key);
          bubble = false;
          break;
        case ptAS.keys.ESC:
          ptAS.clearSuggestions();
          break;
        default:
          if ((this.value == "") && ((key == 8) || (key == 46))) {
            
            ptAS.clearSuggestions();
            return bubble;				
          }else if (this.value == "\n") {
	    
	    return bubble;   
          }
          ptAS.getSuggestions(ev.target.value); 
      }
      return bubble;
    },
    
    onWinResize: function(){
      var asList = ptUtil.id(ptAS.asId);
      if (asList){
        var newPos = ptAS.getPos(ptAS.fld);
        if (("ltr" == "rtl") && (ptAS.fld.offsetWidth < 188))  
          newPos.x = newPos.x - (188 - ptAS.fld.offsetWidth);
        asList.style.left = newPos.x + "px";
      }
    },

    removeList: function() {
      var list = ptUtil.id(ptAS.asId);
      if (list) { list.parentNode.removeChild(list); }
    },
    
    createElem: function(type, attr, cont, html) {
      var ne = document.createElement(type);
      if (!ne) { return 0; }
      for (var a in attr) {
        ne[a] = attr[a];
      }
      var t = typeof(cont);
      if (t == "string" && !html) {
        ne.appendChild(document.createTextNode(cont));
      } else if (t == "string" && html) {
        ne.innerHTML = cont;
      } else if (t == "object") {
        ne.appendChild(cont);
      }
      return ne;
    },
    
    getPos: function(e) {
      var e = ptUtil.id(e);
      var obj = e;
      var curleft = 0;
      if (obj.offsetParent) {
        while (obj.offsetParent) {
          curleft += obj.offsetLeft;
          obj = obj.offsetParent;
        }
      } else if (obj.x) {
        curleft += obj.x;
      }
      var obj = e;
      var curtop = 0;
      if (obj.offsetParent) {
        while (obj.offsetParent) {
          curtop += obj.offsetTop;
          obj = obj.offsetParent;
        }
      } else if (obj.y) {
        curtop += obj.y;
      }
      return {
        x: curleft,
        y: curtop
      };
    },
    
    resetTimeout: function() {
      clearTimeout(ptAS.toID);
      var pointer = ptAS;
      ptAS.toID = setTimeout(function(){pointer.clearSuggestions();},1000);
    },
    
    clearSuggestions: function(evt, timer) {  
      
      
      
      if ((evt != null) && (typeof(evt) != "undefined")) {
	
        if ((document.activeElement) && (document.activeElement.id === ptAS.scrollDownId || document.activeElement.id === ptAS.scrollUpId)) {
          return;
        } else if (evt.target && (evt.target.id === ptAS.scrollDownId || evt.target.id === ptAS.scrollUpId)) {
            return;
        }                                                           
      } 

      clearTimeout(ptAS.toID);
      var ele = ptUtil.id(ptAS.asId);
      if (ele) {
        if (typeof(timer) == "undefined") 
           timer = 400;
        setTimeout(function(){ptAS.removeList();}, timer); 
      }
    },
    
    getSuggestions: function(val) {
      var doSrchReq = false; 
      if (val == "") 
        return;      
      this.removeList();
      this.inputVal = RegExp.escape(val);
      if (val.length < this.options.minchars) {
        this.autoSuggest = [];
        this.inputCount = val.length;
        return;
      }
      var expMatch, orgexpMatch;  
      var alphanumType = /^\w/.test(val);  

      if (alphanumType)
        expMatch = new RegExp("\\b" + this.inputVal, "i"); 
      else
        expMatch = new RegExp(this.inputVal, "i"); 
      
      if (this.prevVal.length) {
        if (alphanumType)
          orgexpMatch = new RegExp("\\b" + this.prevVal, "i");
        else
          orgexpMatch = new RegExp(this.prevVal, "i");
      }
      else 
        orgExpMatch = null;

      var oldLen = this.inputCount;
      this.inputCount = this.inputVal.length ? this.inputVal.length: 0;
      var l = this.autoSuggest.length;

      
      var matchCond1 = (this.inputCount > oldLen && l && this.options.cache && (orgExpMatch !=null));

      
      var matchCond2 = (l && this.prevVal.length && (this.inputVal.length >= this.prevVal.length) && orgexpMatch.test(val)); 

      
      if (matchCond1 || matchCond2) {
        var arr = [];
        for (var i = 0; i < l; i++) {
            if (expMatch.test(this.autoSuggest[i].value))
              arr.push(this.autoSuggest[i]);
        }
        if (arr.length > 0) {
        	this.createList(arr); 
        	return false;
        }
        else {
          doSrchReq = true;
        }
      }
      else {
        doSrchReq = true;  
      }

      if (doSrchReq) {
        var input = val;
        clearTimeout(this.ajID);
        this.ajID = setTimeout(function() {ptAS.setSuggestions(input);},this.options.delay);
      }
      return false;
    },

    setSuggestions: function(input) {
        if (input != ptAS.fld.value)
          return;

        
        var srchReq = ptAS.options.searchURI + encodeURI(verityEscape(input));
  
        var loader = new net2.ContentLoader(srchReq, null, null, "GET",
          function() {
            ptAS.autoSuggest = [];
	        var jsonData = [];
			
			
            var check = ptParser(this.req.responseText, input);
            if ((this.req.responseText == "") || (check == -1))
               return;   
            else if (check <= 0) {
               ptAS.clearList();
			   ptAS.preload(); 
               ptAS.createList([]);
               return; 
			}

            jsonData = eval('(' + this.req.responseText + ')');
            for (var i = 0;(i < jsonData.ptSearchResults.length); i++) {
              ptAS.autoSuggest.push({'id': jsonData.ptSearchResults[i].id,
                  'value': jsonData.ptSearchResults[i].value,'info': jsonData.ptSearchResults[i].info,
                  'url': jsonData.ptSearchResults[i].url});
            }
            ptAS.clearList();
 			ptAS.preload(); 
            ptAS.createList(ptAS.autoSuggest);
	        ptAS.prevVal = ptAS.inputVal;   
          },  
          null, null, "application/x-www-form-urlencoded"); 
        loader = null;
    },

    clearList: function() {
      
      this.removeList();
      clearTimeout(this.toID)
    },

    createList: function(arr) {      
      
      if (arr.length == 0 && !this.options.shownoresults) 
        return;

      var pointer = this;
      var containsSuggestions = true;
      
      var div = this.createElem("div", {id: this.asId,className: this.options.className, dir: "ltr"}); 
      var hcorner = this.createElem("div", {className: "ptAScorner"});
      var hbar = this.createElem("div", {className: "ptASbar"});
      var header = this.createElem("div", {className: "ptASheader"});
      header.appendChild(hcorner);
      header.appendChild(hbar);
      div.appendChild(header);

      var divUl = this.createElem("div", {id: ptAS.asId + "ScrollRoot", className: "ptASdivlist"});
      divUl.style.position = "relative";

      
      var ul = this.createElem("ul", {id: ptAS.asId + "ul"});

      
      
      if (arr.length) {
        var val, st, output, spanEl, brEl, aEl, smallEl, liEl, pattern;
        var alphanumType = /^\w/.test(ptAS.fld.value);   
        if (alphanumType)  
           pattern = new RegExp("\\b"+this.inputVal, "i");
        else
           pattern = new RegExp(this.inputVal, "i");
        for (var i = 0; i < arr.length; i++) {
          
          
          val = arr[i].value;
          
          
          st = val.toLowerCase().search(pattern);
          if (st == -1)
            continue;
          output = val.substring(0, st) + "<strong>" + val.substring(st, st + ptAS.fld.value.length) 
                    + "</strong>" + val.substring(st + ptAS.fld.value.length);  
          spanEl = this.createElem("span", {},output, true);
          if (arr[i].info != "") {
            brEl = this.createElem("br", {});
            spanEl.appendChild(brEl);
            smallEl = this.createElem("small", {},arr[i].info);
            spanEl.appendChild(smallEl);
          }
          aEl = this.createElem("a", {href: arr[i].url}); 
	      aEl.setAttribute("label", arr[i].value);  
          aEl.appendChild(spanEl);
          aEl.name = i + 1;
          ptEvent.add(aEl, "click", pointer.setHighlightedValue); 
 		  ptEvent.add(aEl, "mouseover", pointer.setHighlight);
          liEl = this.createElem("li", {}, aEl);
          ul.appendChild(liEl);
        } 
      } 
      
      if (ul.childNodes.length == 0)
        containsSuggestions = false;

      if (!containsSuggestions && this.options.shownoresults) {
		
        var li = this.createElem("li", {id: "asliNoMatch", className:"ptASwarning"});
	    var textSpan = this.createElem("span", {}, this.options.noresults);
        li.appendChild(textSpan);
        ul.appendChild(li);
        if (ptAS.IEquirksMode)
           ul.style.height = "100%"
      }
      else {
        
        var scrollup = this.createElem("div",{id: this.scrollUpId,className: "ptASscrollup"},"&nbsp;", true);         
        var scrolldown = this.createElem("div", {id: this.scrollDownId,className: "ptASscrolldown"},"&nbsp;",true);       
        div.appendChild(scrollup); 
      }
     
      divUl.appendChild(ul);  
      div.appendChild(divUl); 

      if (containsSuggestions)
         div.appendChild(scrolldown); 

      var fcorner = this.createElem("div", {className: "ptAScorner"});
      var fbar = this.createElem("div", {className: "ptASbar"});
      var footer = this.createElem("div", {className: "ptASfooter"});
      footer.appendChild(fcorner);
      footer.appendChild(fbar);

      
      var listShadow = this.createElem("div", {id:"ptASshadow", className: "ptASshadow"}, "&nbsp;", true); 

      
      if (("ltr" === "rtl") && !document.documentMode && browserInfoObj2.isIE) {
        listShadow.className += " ptASshadowIE7";
        footer.className += " ptASfooterIE7";
      }
      div.appendChild(footer);
      div.appendChild(listShadow);
 
      //$ get position of target textfield
      
      
      var pos = this.getPos(this.fld);

	  
      if (("ltr" == "rtl") && (this.fld.offsetWidth < 188))  
        pos.x = pos.x - (188 - this.fld.offsetWidth);

      div.style.left = pos.x + "px";
      div.style.top = (pos.y + this.fld.offsetHeight + this.options.offsety) + "px";
      div.style.width = (Math.max(this.fld.offsetWidth, 188)) + "px";  
      div.style.zIndex = 10011;
      
      
      
	  ptEvent.add(div, "mouseover",function() {clearTimeout(this.toID);});
      
      
      document.body.appendChild(div);
      this.highLiteNum = 0;       

      if (containsSuggestions) {
	    
        
        this.scroll.check(ptUtil.id(ptAS.asId + "ul"),false);
	    
        if ((browserInfoObj2.isIE && (divUl.clientHeight  == 0)) ||
            (!ptAS.IEquirksMode && (divUl.scrollHeight == divUl.clientHeight))) {  
            ptAS.hideScrollArrows(scrollup, scrolldown);
            if (ptAS.IEquirksMode)
              ul.style.height = "100%"
        }
      }
       
       var h = divUl.offsetHeight - 2;
       if ((typeof(scrolldown) != "undefined") && (scrolldown.offsetHeight > 10)) {
	     
	     
	     h += (divUl.offsetTop + 3);
       }
       else {
         if (divUl.scrollHeight > divUl.offsetHeight) {
	        
            h += divUl.offsetTop - 5;
         }
       }
       listShadow.style.height = h + "px";
       listShadow.style.left = (div.offsetWidth - 14) + "px";
       
       ul.style.width = "100%"; 
    },
  
    hideScrollArrows: function (up, down) {
      up.style.height = "0px";
      up.style.display = "none";
      down.style.height = "0px";
      down.style.display = "none";
    },    

    arrowScroll: function(key) {
      
      var list = ptUtil.id(ptAS.asId + "ul");
      if (!list) { return false; }   
      
      
      var liElem = list.childNodes[ptAS.highLiteNum - 1];
      var newTop = 0;  
      switch (key) {
        case 38:  
          if ((list.offsetTop < 0) && (liElem.offsetTop < Math.abs(list.offsetTop))) {
	        newTop = Number(0 - liElem.offsetTop);
	        list.style.top = newTop + "px";   
	        ptUtil.id(this.scrollDownId).className = this.scrollCfg.showDownBtnStyle;
	        if (list.offsetTop == 0)
	          ptUtil.id(this.scrollUpId).className = this.scrollCfg.hideUpBtnStyle;
          }
          break;
         case 40:  
           var h = list.parentNode.offsetHeight;
	       var downBtn = ptUtil.isClassMember(ptUtil.id(this.scrollDownId),this.scrollCfg.showDownBtnStyle);
	       var liH1 = (liElem.offsetTop + liElem.offsetHeight);
	       var liH2 = (liElem.offsetTop - Math.abs(list.offsetTop) + liElem.offsetHeight);
           if (downBtn && (liH1 > h) && (liH2 > h)) {
             newTop = Number(list.offsetTop - (liH2 - h));
             list.style.top = newTop + "px";
	         ptUtil.id(this.scrollUpId).className = this.scrollCfg.showUpBtnStyle;
             if (liElem.nextSibling == null) 
		       ptUtil.id(this.scrollDownId).className = this.scrollCfg.hideDownBtnStyle;
           }                 
           break;
      }    
    },

    changeHighlight: function(key) {
      var list = ptUtil.id(ptAS.asId + "ul");
      if (!list) {
        return false;
      }
      
      if (list.childNodes[0].className == "ptASwarning")
         return false; 
  
      var n;
      if (key == 40) {
        n = this.highLiteNum + 1;
      } 
      else if (key == 38) {
        n = this.highLiteNum - 1;
      }
      if (n > list.childNodes.length) {
        n = list.childNodes.length;
      }
      if (n < 1) {
        n = 1;
      }
      this.setHighlight(n);
    },
      
    setHighlight: function(n) {
      var list = ptUtil.id(ptAS.asId + "ul");
      if (!list) {
        return false;
      }
      if (ptAS.highLiteNum > 0) {
        ptAS.clearHighlight();
      }
      
      
      
      if (typeof(n) != "number") {
        n = this.name;
      }
      ptAS.highLiteNum = Number(n);
      list.childNodes[ptAS.highLiteNum - 1].className = "ptAShighlight";
      clearTimeout(ptAS.toID);
    },
      
    clearHighlight: function() {
      var list = ptUtil.id(ptAS.asId + "ul");
      if (!list) {
        return false;
      }
      if (this.highLiteNum > 0) {
        list.childNodes[this.highLiteNum - 1].className = "";
        this.highLiteNum = 0;
      }
    },

    setHighlightFocus: function() {
      if (ptAS.highLiteNum) {
        ptAS.inputVal = ptAS.fld.value = ptAS.autoSuggest[ptAS.highLiteNum - 1].value;
        ptAS.autoSuggest[ptAS.highLiteNum - 1].focus();
      }
    },
    
    setHighlightedValue: function() {
      if (ptAS.highLiteNum) {
	    var ulist = ptUtil.id(ptAS.asId + "ul");
	    if (ulist) {
	      var selected = ulist.childNodes.item([ptAS.highLiteNum - 1]);  
          ptAS.inputVal = ptAS.fld.value = selected.childNodes[0].getAttribute("label");
          if (ptAS.fld.selectionStart) {
            ptAS.fld.setSelectionRange(ptAS.inputVal.length, ptAS.inputVal.length);
          }
          ptAS.clearSuggestions();
          return selected.childNodes[0].href;  
        }
      }
      return null;
    },  

	
	
	
 	preload: function() {
		if (ptAS.firstSearch) {
			ptAS.firstSearch = false;
			ptAS.scroll = new ptScrollable(ptAS.scrollCfg);
			var plHTML = "<div class='ptASheader'><div class='ptAScorner'>&nbsp;</div><div class='ptASbar'>&nbsp;</div></div><div class='ptASfooter'><div class='ptAScorner'>&nbsp;</div><div class='ptASbar'>&nbsp;</div></div><div class='ptASshadow' id='ptASshadow'>&nbsp;</div>"
			plDiv = document.createElement("div");
			plDiv.innerHTML = plHTML;	
			plDiv.id = "ptASpreload";
			plDiv.className="ptAS";
			plDiv = document.body.appendChild(plDiv);
			document.body.removeChild(plDiv);
		}
	}
  };  

  this.clearSuggestions = function(e, timer){	
    ptAS.clearSuggestions(e, timer);			
  }

  
  
  if (typeof(ptScrollable) === "undefined") {
    ptEvent.load(function() { 
      var head = document.getElementsByTagName("head")[0]; 
      var el = document.createElement("script");
      el.src = ptUtil.id("ptasjs1").firstChild.data;
      el.type="text/javascript";
      head.appendChild(el);
    });
  }

  ptAS.init(fld,param,id);

}; 

function preLoadASImg(imgsrc){
    var tmp = new Image();
    tmp.src = imgsrc;
    return tmp;
}

RegExp.escape = function(str){
  var chars = new RegExp("[.*+?$^|()\\[\\]{}\\\\]", "g") 
  return str.replace(chars, "\\$&");
};

ptParser = function (str, srchtxt) {
var chk1 = /^\{ptSearchResults:\[(?:\{"id":\s*"\d+"\s*,\s*"value":\s*"(?:[^"]|(:?\\"))*?"\s*,\s*"info":\s*"(?:[^"]|(:?\\"))*?"\s*,\s*"url":\s*"(?:[^"]|(:?\\"))*?"\})??(?:,\s*(?:\{"id":\s*"\d+"\s*,\s*"value":\s*"(?:[^"]|(:?\\"))*?"\s*,\s*"info":\s*"(?:[^"]|(:?\\"))*?"\s*,\s*"url":\s*"(?:[^"]|(:?\\"))*?"\}))*?\]\}$/.test(str);
var srch = new RegExp(RegExp.escape(srchtxt), "gi");
var chk2 = srch.test(str);

if (!chk1)
   return -1;
else if (!chk2)
   return 0;
else
   return 1;  
};

function verityEscape(str){
  var chars = new RegExp("[,()\"@*<>'=!\\[{\\\\]", "g"); 
  return str.replace(chars, "\\$&");
}
