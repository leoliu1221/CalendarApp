/*
Copyright (c) 2000, 2011, Oracle and/or its affiliates. All rights reserved.

ToolsRel: 8.52.10
*/

var ptIframe = {
	ptalPage: null,  	
	popup: null,		
    	tgtIframe: null,	
	rcIframe: null,		
	rcUpMask: null, 	
	rcDownMask: null,	
	rcDragHndl : null,	
	currRcSize : 0,	
	isRCMin : false, 	
					 	
	rcSep : null,	 	
	rcMinHeight : 0, 	

	iframes : [],
	TARGET : "TargetContent",
	RELATEDCONTENT : "RelatedContent",
    	PAGELETAREA : "PageletArea",
	offsetWidthPercent : 0,
	resizeIframes : [],
	ptcxmceDiv: null,  			
    	ptcxmcAnc: null,  		 	
    	ptcxmeAnc: null,   			
	ptcxmpageletDiv: null,		
    	tgtDiv: null,  		

	init: function () {

		
		var rcMask = document.createElement("div");
		rcMask.id="ptalPageMask";
		rcMask.className ="ptalPageMask";
		var theBody = document.getElementsByTagName("body");
		if (theBody && theBody.length)
			theBody[0].appendChild(rcMask);

		
		if ((typeof ptalPage != "undefined") && (ptalPage)) {
			ptIframe.ptalPage = ptalPage;
			ptIframe.ptalPage.init();
		}


		
		ptIframe.ptcxmceDiv = ptUtil.id("ptcxmcollexpdiv");

		if (ptIframe.ptcxmceDiv) {

			ptIframe.ptcxmcAnc = ptUtil.id("ptcxmifrmsbcoll");
			ptIframe.ptcxmeAnc = ptUtil.id("ptcxmifrmsbexp");
			ptIframe.ptcxmpageletDiv = ptUtil.id("ptcxmpageletdiv");
			ptIframe.tgtDiv = ptUtil.id("ptifrmtarget");

			
			ptEvent.add(ptIframe.ptcxmcAnc,"click",function(){ptIframe.ptcxmToggleframe();});

			
			ptEvent.add(ptIframe.ptcxmeAnc,"click",function(){ptIframe.ptcxmToggleframe();});

		}

		ptIframe.tgtIframe = ptUtil.id("ptifrmtgtframe");

		var contentParent = ptIframe.tgtIframe.parentNode.parentNode;

		
		
		ptIframe.iframes = contentParent.getElementsByTagName("iframe");
		var pNode, iframe, winWidth;
		var offsetWidth = 0, offsetWidthPercent = 0;

		for (var i = 0; i < ptIframe.iframes.length; i++) {

			if (ptIframe.iframes[i].name.indexOf(ptIframe.TARGET) === -1 &&
				ptIframe.iframes[i].name.indexOf(ptIframe.RELATEDCONTENT) === -1 &&
				ptIframe.iframes[i].name.indexOf(ptIframe.PAGELETAREA) === -1) {
				
				iframe = ptIframe.iframes[i];
				pNode = ptIframe.iframes[i].parentNode;
				
				if (pNode && pNode.nodeType === 1) {
					
					
					winWidth = ptIframe.winSize().width;
					offsetWidth = parseFloat(ptUtil.getCSSValue(pNode,"width"));
					ptIframe.offsetWidthPercent = offsetWidth / winWidth;

					
					pNode.style.left = winWidth - offsetWidth + 2 + "px";

					
					ptIframe.resizeWidth(iframe.name,2);
					ptIframe.resizeHeight(iframe.name,0);

					//
					ptIframe.resizeIframes.push(iframe);
				}
			}
		}

		
		
		if (ptIframe.ptcxmceDiv) {
				if (ptUtil.getCSSValue(ptIframe.ptcxmpageletDiv,"display") !== "none") {
					ptIframe.resizeWidth("ptcxmiframe",0);
					ptIframe.resizeHeight("ptcxmiframe",0);
					ptIframe.resizeWidth("ptifrmtgtframe",200);
					ptIframe.resizeHeight("ptifrmtgtframe",0);
					}
				else {
					ptIframe.resizeWidth("ptcxmiframe",80);
					ptIframe.resizeHeight("ptcxmiframe",0);
					ptIframe.resizeWidth("ptifrmtgtframe",125);
					ptIframe.resizeHeight("ptifrmtgtframe",0);
					}
		}
		else if (ptIframe.ptalPage) {
			
			ptIframe.ptalPage.resize();
		}
		else {
		
			ptIframe.resizeWidth("ptifrmtgtframe",offsetWidth);
			ptIframe.resizeHeight("ptifrmtgtframe",0);
		}

		ptIframe.rcIframe = ptUtil.id("RelatedContent");

		
		if (ptIframe.rcIframe) {
			ptIframe.rcDragHndl = ptUtil.id("ptifrmrchandle");
			ptIframe.rcSep = ptUtil.id("ptifrmsep");
			ptIframe.rcUpMask = ptUtil.id("ptifrmresizeupmask");
			ptIframe.rcDownMask = ptUtil.id("ptifrmresizedownmask");

			
			ptIframe.rc.dragResize.init(ptUtil.id("ptifrmrchandle"));

			
			ptUtil.swapClass(ptIframe.rcIframe.parentNode,"ptifrmrcstd","ptifrmrcmax");
		}

		
        	ptEvent.add(window,"resize",function() {ptIframe.resizeAll();});
		ptEvent.add(window,"load",function() {ptIframe.resizeAll();});

		
		var popup = ptUtil.id("ptifrmpopup");
		if (popup) {

			var options = {
				center : true,
				draggable : false,
				resizeable : false
			};

			ptIframe.popup = new ptPopup(popup,options);
		}

		
		if (window.onbeforeprint !== "undefined") {
			ptEvent.add(window,"beforeprint",function(){
				iframeHeight = ptIframe.tgtIframe.offsetHeight; 
				ptIframe.tgtIframe.style.height = "2000px";}); 
			ptEvent.add(window,"afterprint",function(){ptIframe.tgtIframe.style.height = iframeHeight + "px";}); 
		}
	},

    	resizeAll: function(){
		var offsetWidth = 0;
		if (ptIframe.offsetWidthPercent !== 0) {
			var winWidth = ptIframe.winSize().width;
			offsetWidth = winWidth * ptIframe.offsetWidthPercent;

			var iframe = ptIframe.resizeIframes[0];

			
			iframe.parentNode.style.left = winWidth - offsetWidth + 2 + "px";

			
			ptIframe.resizeWidth(iframe.name,2);
			ptIframe.resizeHeight(iframe.name,0);
		}

		if (ptIframe.ptcxmceDiv) {
			 if (ptUtil.getCSSValue(ptIframe.ptcxmpageletDiv,"display") !== "none") {
				ptIframe.resizeWidth("ptcxmiframe",0);
				ptIframe.resizeHeight("ptcxmiframe",0);
				ptIframe.resizeWidth("ptifrmtgtframe",200);
				ptIframe.resizeHeight("ptifrmtgtframe",0);
				}
			else {
				ptIframe.resizeWidth("ptcxmiframe",80);
				ptIframe.resizeHeight("ptcxmiframe",0);
				ptIframe.resizeWidth("ptifrmtgtframe",125);
				ptIframe.resizeHeight("ptifrmtgtframe",0);
				}
		}
		else if (ptIframe.ptalPage) {
			
			ptIframe.ptalPage.resize();
			if ((typeof RCPage != "undefined") && RCPage && RCPage.initialized) {
				ptIframe.resizeWidth("ptifrmtgtframe",offsetWidth);
				RCPage.resize();
				if (RCPage.visible) ptrc.resizeSideRCFrame(window.frames['SRelatedContent'], 20);
			}
		}
		else {
			ptIframe.resizeWidth("ptifrmtgtframe",offsetWidth);
			ptIframe.resizeHeight("ptifrmtgtframe",0);
			if ((typeof RCPage != "undefined") && RCPage && RCPage.initialized) {
				RCPage.resize();
				if (RCPage.visible) ptrc.resizeSideRCFrame(window.frames['SRelatedContent'], 20);
			}
		}
		
		
		if (!RCPage.visible) {
			if (!(browserInfoObj2.isiPad && browserInfoObj2.isSafari)) 
				ptIframe.rc.resize();  
		}
		
		
		if (typeof ptCommonObj2.popMask != 'undefined' 
				&& ptCommonObj2.popMask != null 
				&& ptCommonObj2.popMask.style.display != "none")
			ptCommonObj2.setMaskSize(window);     

    	},

	
	
	
	resizeHeight: function (e,buf) {
		var elem = ptUtil.id(e);
		try {

			// elem.style.height = String(ptIframe.winSize().height - (ptIframe.getPos(elem).y + elem.scrollTop) - buf) + 'px';
			elem.style.height = String(ptIframe.winSize().height - (ptIframe.getPos(elem).y) - buf) + 'px';

		} catch(err) {}
	},

	ptcxmToggleframe: function () {

		if (ptUtil.getCSSValue(ptIframe.ptcxmeAnc,"display") !== "none") {
				
            	ptIframe.ptcxmeAnc.style.display = "none";
				ptIframe.ptcxmcAnc.style.display = "inline";
				ptIframe.ptcxmpageletDiv.style.display="inline";
				ptUtil.swapClass(ptIframe.tgtDiv,"ptifrmtgtmax","ptcxmifrmtgtstd");
				
				ptIframe.resizeWidth("ptifrmtgtframe",200);
				ptIframe.resizeHeight("ptcxmiframe",0);	
				ptIframe.resizeHeight("ptifrmtgtframe",0);			
				
		}
		else {
				
				ptIframe.ptcxmeAnc.style.display = "inline";
				ptIframe.ptcxmcAnc.style.display = "none";
				ptIframe.ptcxmpageletDiv.style.display="none";
				ptUtil.swapClass(ptIframe.tgtDiv,"ptcxmifrmtgtstd","ptifrmtgtmax");
				
				ptIframe.resizeWidth("ptifrmtgtframe",125);
				ptIframe.resizeHeight("ptifrmtgtframe",0);

		}

	},

	resizeWidth: function (e,buf) {

		var elem = ptUtil.id(e);
		try {

			if ("ltr" === "ltr") {
				elem.style.width = String(ptIframe.winSize().width - ptIframe.getPos(elem).x - buf) + "px";
			} else {

				
				if ((e === "ptifrmtgtframe") || (e === "RelatedContent")) {
					elem.style.width = String(ptIframe.getPos(elem).x + elem.offsetParent.offsetWidth - buf) + "px";
				}
			}
		} catch(err) {}
	},

	winSize : function () {

		var de = document.documentElement;
		var height = window.innerHeight || self.innerHeight || (de && de.clientHeight) || document.body.clientHeight;
		var width = window.innerWidth || self.innerWidth || (de && de.clientWidth) || document.body.clientWidth;
		return {height:height, width:width};
	},	

	getPos : function (el) {	

		var x = 0, y = 0, objX = 0;	
    	var e = el;	
		while(e) {
			x += e.offsetLeft || 0;
			y += e.offsetTop || 0;
			e = e.offsetParent;
		}
		return {x:x, y:y};
	},

	
	isPIASaveWarning : function () {

		var retVal = false;
		var piaPopup = getMainPopupObject();
		if (piaPopup && piaPopup.isSaveWarn) {
			retVal = true;
		}
		return retVal;

	},

	
	
	
	
	
   	
    
	saveWarning : function(tgt,cancelFn,tgtName,newWinOptions,okFn) {

		
		if (this.isPIASaveWarning()) { return; }

		if (!tgt) { return; }

		if (!tgtName) { tgtName = "_parent"; }


		var isWorkCenter = top.document.getElementById('ptalPgltAreaFrame');


		
		
		var processCancel = function () {

			if (typeof cancelFn !== "undefined") {
				if (tgtName.toLowerCase() === "_blank") {
					open(tgt.constructor === String ? tgt : tgt.href,tgtName,newWinOptions);
				} 

			else if (isWorkCenter && (tgtName.toLowerCase() === "_top")) {
					open(tgt.constructor === String ? tgt : tgt.href,tgtName,newWinOptions);
				}

			else {
					cancelFn.call(this,tgt);
				}
			} else {
				open(tgt.constructor === String ? tgt : tgt.href,tgtName);
			}

			return false;
		};

		var processOk = function () {
			if (typeof(okFn) !== "undefined") {
				okFn.call(this);
			}
			return false;
		};

		
		if (ptIframe.isDataChange()) {
			ptIframe.popup.prompt("Save Warning",
								  "You have unsaved data on this page. Click OK to go back and save, or Cancel to continue.",
				   		   		  "OK_CANCEL",
								  processOk,	    
								  processCancel		
			);
			return false;

		} else {
			processCancel();
		}

	},


	isWorkCenterDirty : function( ) {
		var pageletFrameObj = top.document.getElementById('ptalPgltAreaFrame');
		
		if (!pageletFrameObj)
			return false;

		var tgtFrameForm = top.frames['TargetContent'].document.forms[0]; 
		if (!tgtFrameForm)
			return false;
		
		if(!tgtFrameForm.ICChanged)
			return false;

		
		if(tgtFrameForm.ICChanged.value === '-1')
			return false;
		
		
		var  isDirty = ptIframe.isDataChange();
	
		if (isDirty == "undefined") {
			isDirty = false;
		}

		return isDirty;
	},

	
	
    
    
	
	
   	
	saveWarningForWorkCenter : function( cancelFn, okFn, calledFrom,arg1, arg2)  {
		
		
        if (this.isPIASaveWarning()) { return -1; }

        
		var curAnchorObj = null;
		var bCallCancelFn = false;

		if(calledFrom === 1) { 
		
			if (browserInfoObj2.isIE) {
				if (arg1 != null && typeof arg1.document != "undefined")
            		curAnchorObj = arg1.document.getElementById(arg2);
			}
			else {
			    if (arg1 != null && typeof arg1.ownerDocument != "undefined")
			        curAnchorObj = arg1.ownerDocument.getElementById(arg2);
			}		
	
			if((typeof curAnchorObj === 'undefined') || !curAnchorObj)
				return false;

			var anchorType = curAnchorObj.getAttribute("ptlinktgt");
			if((anchorType) && (anchorType  !== 'pt_replace')) 
				return false;
					
		} else if (calledFrom === 2){ 
		
		   	if (browserInfoObj2.isIE) {
				if (arg1 && arg1.form != null && typeof arg1.form.document != "undefined")
            		curAnchorObj = arg1.form.document.getElementById(arg1.name);
			}
			else {
			    if (arg1 && arg1.form != null && typeof arg1.form.ownerDocument != "undefined")
			        curAnchorObj = arg1.form.ownerDocument.getElementById(arg1.name);
			}		
	
			if((typeof curAnchorObj === 'undefined') || !curAnchorObj)
				bCallCancelFn = true;
		
			var anchorType = curAnchorObj.getAttribute("ptlinktgt");                
			
			if((anchorType) && (anchorType !== 'pt_peoplecode')) 
				bCallCancelFn = true;
			
		} else if (calledFrom === 3) { 
            var cancelFn = function WorkCenterHome(arg1,arg2) {
				top.location.href=arg1;
			};

		} else { 
				return false;
			
		}
			
		var processCancel = function () {
            if (typeof cancelFn !== "undefined"  && cancelFn != null) {
				cancelFn(arg1,arg2);
			}
			return false;
        };

        var processOk = function () {
        	if (typeof okFn !== "undefined"  && okFn != null) {
        		okFn(arg1,arg2);
            	return true;
	        }
	        return false;
	    };

		if(bCallCancelFn)
			processCancel();
	
		if(ptIframe.isWorkCenterDirty()) {  
				ptIframe.popup.prompt("Save Warning",
                          "You have unsaved data on this page. Click OK to go back and save, or Cancel to continue.",
                          "OK_CANCEL",
                           processOk,     
                           processCancel  
                 		);     
				return true;
   
		} else {
			processCancel();			

		}
        return false;
	},

   

	
	
	
	isDataChange : function () {

		var changed = false;

		if (top.frames) {
			changed = checkAnyFrameChanged(top.frames);
		}

		
		
		if (changed == "undefined") {
			changed = false;
		}	

		return changed;

	},
	

    
	
	keyHandler : function (evt) {
		var keyCode = ptUtil.getKeyCode(evt);
		var actualKeyCode = keyCode | 0x40;
		var isCtrlKey = ptUtil.isCtrlKey(evt);
        	var isAltKey = ptUtil.isAltKey(evt);

		if (isCtrlKey && (actualKeyCode == 89 || actualKeyCode == 90)) {
			ptIframe.handleNavKeyEvent(actualKeyCode);
			return false;
		} else if (isAltKey && (actualKeyCode == 89) && (ptIframe.ptalPage)) {
			
			ptIframe.ptalPage.onTogglePageletArea();
			return false;
		} else {
			if (isAltKey || isCtrlKey) {
				ptIframe.parentKeyHandler(window, keyCode, isAltKey, isCtrlKey);
				return true;
			}	
		}
	},

	
	
	handleNavKeyEvent : function (keyCode) {
		
		if (keyCode == 89) {
			if (typeof pthNav != "undefined"){
				if (!pthNav.isNavOpen){
		  			pthNav.openMainMenu();
		  		}
		  		else{
					pthNav.closeNav();
		  		}
		  		return false;	
			
			} else if (typeof ptNav2 != "undefined")
				ptIframe.toggleNav();
		} else if (keyCode == 90) {
			
			if (typeof pthNav != "undefined"){
				pthNav.setSearchFocus();
			}
			else if (typeof ptNav2 != "undefined"){
				if (ptUtil.getCSSValue(ptIframe.leftNav,"display") === "none") {
					ptIframe.toggleNav();
				}
				ptNav2.setSearchFocus();
			}
		}

	},
	
	
	parentKeyHandler : function(caller,keyCode,isAltKey,isCtrlKey) {

		
		if (caller == self) {
			
			if (typeof parentKeyHandler != "undefined") {
				parentKeyHandler(caller,keyCode,isAltKey,isCtrlKey);
				return true;
			} else {
				
				var tgtFrame = parent.frames["TargetContent"];
				if (tgtFrame && !isCrossDomain(tgtFrame) && tgtFrame.keyHandler) {
					tgtFrame.keyHandler(keyCode, isAltKey, isCtrlKey);
					return true;
				}

			}
		
		
		} else {
			if (isCtrlKey && (keyCode == 89 || keyCode == 90)) {
				ptIframe.handleNavKeyEvent(keyCode);
				return false;
			} else if (isAltKey && (keyCode == 89) && (ptIframe.ptalPage)) {
				
				ptIframe.ptalPage.onTogglePageletArea();
				return false;
			}

		}

	},

	
	
	resizeOtherIframes : function (newHeightOffset) {

		if (ptIframe.iframes.length === 0 ||
			ptIframe.resizeIframes.length === 0) { return; }

		
		var iframe = ptIframe.resizeIframes[0];
		ptIframe.resizeHeight(iframe.name,newHeightOffset);
	},

	
	rc : {

		
		toggleDisplay : function (hide) {

			if (!ptIframe.rcIframe) { return; }
			
			
			
			if (hide) {
				ptIframe.rcIframe.parentNode.style.display = "none";
				ptIframe.resizeHeight("ptifrmtgtframe",0);
				ptIframe.resizeOtherIframes(0);

			} else {
				ptIframe.rcIframe.parentNode.style.display = "block";
				this.resize();
			}
		},

		
		resize : function (height) {

			if (!ptIframe.rcIframe || ptUtil.getCSSValue(ptIframe.rcIframe.parentNode,"display") === "none") {
				return;
			}

			
			var viewPortHeight = ptIframe.winSize().height -
								 ptIframe.getPos(ptIframe.tgtIframe).y;

			var rcHeight;

			
			if (typeof(height) !== "undefined") {

				
				if (!ptIframe.isRCMin) {
					rcHeight = height;

				
				} else {
					rcHeight = ptIframe.rcMinHeight;
				}

			} else {

				if (!ptIframe.isRCMin) {

					
					if (ptIframe.currRcSize !== 0) {
						rcHeight = ptIframe.currRcSize;
				
					
					} else {
						rcHeight = viewPortHeight * .40;
					}
				} else {
					rcHeight = ptIframe.rcMinHeight;
				}

			}

            
            if (browserInfoObj2.isiPad && browserInfoObj2.isSafari) {
                var pgHeight = 0;   
                var tgtHeight = 0;  
                var tc = window.frames['TargetContent'];
                var theForms = tc.document.getElementsByTagName("form");  
                if (theForms && theForms.length) {
                    var theFormName = theForms[0].name;
                    var pageContainerDiv = theFormName + "divPAGECONTAINER";
                    var pageContainer = tc.document.getElementById(pageContainerDiv);
                    if (pageContainer != null) {
                        var pgContainerHeight = pageContainer.offsetHeight;
                        var ifrmTemplateHeight = 67;  
                        var ifrmTemplate = ptUtil.id("ptifrmtemplate");
                        if (ifrmTemplate != null) 
                            ifrmTemplateHt = ifrmTemplate.offsetHeight;
                        pgHeight = ifrmTemplateHeight + pgContainerHeight;  
                    }
                }
                if (pgHeight > 0) {
                   tgtHeight = pgHeight;	    
                } else {
                   tgtHeight = viewPortHeight;	
                }
            } else {
                var tgtHeight = viewPortHeight - rcHeight;
            }

			
			if (!ptIframe.isRCMin) {
				ptIframe.currRcSize = rcHeight;
			}
			var RCPanelSize = ((typeof RCPage != "undefined") && RCPage && RCPage.objPageletAreaContainer) ? RCPage.objPageletAreaContainer.clientWidth : 0;
			if (ptIframe.ptalPage) {
				
				ptalPage.WCPanel.resizeBottomRC(tgtHeight, rcHeight);
			} else if (RCPanelSize > 0){
				RCPage.RCPanel.resizeBottomRC(tgtHeight, rcHeight);
		    } else {

				
				ptIframe.resizeHeight("ptifrmtgtframe",rcHeight);
				ptIframe.resizeOtherIframes(rcHeight);

				
				if (ptIframe.isRCMin && (!browserInfoObj2.isIE || browserInfoObj2.version > 7)) {
					ptIframe.resizeWidth("RelatedContent",ptIframe.rcIframe.parentNode.offsetLeft);
				} else {
					ptIframe.resizeWidth("RelatedContent",0);
				}

				
				ptIframe.rcSep.style.width = ptUtil.getCSSValue(ptIframe.rcIframe,"width");

				
				if (browserInfoObj2.isiPad && browserInfoObj2.isSafari) {	
					if (typeof(height) === "undefined") {
						
						ptIframe.rcIframe.parentNode.style.top = tgtHeight + "px";  
					}
				}
				else {
					ptIframe.rcIframe.parentNode.style.top = tgtHeight + "px";
				}
                
				var rcSepHeight = 0;
				if (ptIframe.rcSep) {
					rcSepHeight = ptIframe.rcSep.offsetHeight;
				}

				
                ptIframe.rcIframe.style.height = rcHeight - rcSepHeight + "px";
                //*************ICE 1857134003*********************
                var outifrm = ptUtil.id("ptifrmtgtframe");
                var rc = window.frames['RelatedContent'];
                var RCArea = rc.document.getElementById('RCArea');			
                if(!RCArea) return;
                var height = ptIframe.rcIframe.offsetHeight;
                if (height > ptIframe.rcIframe.offsetTop)
                    height = height - ptIframe.rcIframe.offsetTop;
                if (height>12) height = height -12; //ICE 1908183003 in order that the horizontal scrollbar is displayed properly
                RCArea.style.height = height + "px";
                //*********************************************/

			}

		},

		
		toggleHeight : function (rcBodyHeight) {

			
			
 			
			if (rcBodyHeight === 0) {
				ptIframe.isRCMin = false;
				ptIframe.rcDragHndl.style.display = "block";
			} else {
				ptIframe.isRCMin = true;
				ptIframe.rcDragHndl.style.display = "none";

				
				if (ptIframe.rcMinHeight === 0) {

					ptIframe.rcMinHeight = rcBodyHeight;

					
					
					if (ptIframe.rcSep) {
						ptIframe.rcMinHeight += ptIframe.rcSep.offsetHeight;
					}
				}
			}

			this.resize();
		},

		
		cleanup : function () {
			if (ptrc.typeRC == "S") {
				if (RCPage.RCPanel) {
					RCPage.hideRC();
					ptIframe.resizeWidth("ptifrmtgtframe",0);   
				}
			} else	{
				ptIframe.rcIframe.parentNode.style.display = "none";
				
				ptIframe.resizeHeight("ptifrmtgtframe",0);
 				ptIframe.resizeOtherIframes(0);
			}
		},

		
		
		dragResize : {

			element: null,              
			handle: null,				
			minHeight: 0,				
			minTop: 0,
			currMouseX: 0,				
			mouseY: 0,					
			lastMouseX: 0,				
			lastMouseY: 0,				
			mOffX: 0,					
			mOffY: 0,					
			elmY: 0,					
			elmH: 0,					

			init : function (handle,config) {
	
				if (!handle) { return; }

				ptIframe.rc.dragResize.handle = handle;

				if (handle.parentNode) {		
					this.element = handle.parentNode.parentNode;
				}

				
				if (browserInfoObj2.isiPad && browserInfoObj2.isSafari) 
    				ptEvent.add(this.handle, "touchstart",this.onMouseDown);
				else 
  					ptEvent.add(this.handle,"mousedown",this.onMouseDown);

				
				if (browserInfoObj2.isIE && browserInfoObj2.version <= 7) {
					ptIframe.rcUpMask.style.backgroundColor = "#FFFFFF";
					ptIframe.rcDownMask.style.backgroundColor = "#FFFFFF";
					ptIframe.rcUpMask.style.filter = "alpha(opacity=1)";
					ptIframe.rcDownMask.style.filter = "alpha(opacity=1)";
				}
			},

			
			onMouseDown : function (e) {

				
				
				if (ptIframe.isRCMin) { return false; }

				var dr = ptIframe.rc.dragResize;
				
				if (browserInfoObj2.isiPad && browserInfoObj2.isSafari)  {
					var targetEvent =  e.touches.item(0); 
			    	dr.handle.style.borderWidth = "3px";
					dr.handle.style.borderStyle = "dotted";  
					dr.handle.style.borderColor = "red";
				}

				
				
				if (!dr.element) {
					dr.element = dr.handle.parentNode.parentNode;
				}

				
				if (ptIframe.rcSep && dr.minHeight === 0) {
					dr.minHeight = ptIframe.rcSep.offsetHeight;
				}

				
				if (browserInfoObj2.isiPad && browserInfoObj2.isSafari)  {
					ptEvent.add(document,"touchmove", dr.onMouseMove);
					ptEvent.add(document,"touchend", dr.onMouseUp);
				} else {
					ptEvent.add(document,"mousemove", dr.onMouseMove);
					ptEvent.add(document,"mouseup", dr.onMouseUp);
				}

				if (browserInfoObj2.isiPad && browserInfoObj2.isSafari)  {	
					dr.lastMouseX = targetEvent.clientX;
					dr.lastMouseY = targetEvent.clientY;
				} else {
			 		dr.lastMouseX = e.pageX;
					dr.lastMouseY = e.pageY;
				}

				dr.elmY = parseInt(ptUtil.getCSSValue(dr.element,"top"));
				dr.elmH = dr.element.offsetHeight;	

				
				dr.element.style.height = ptUtil.getCSSValue(ptIframe.rcIframe,"height");

				
				ptIframe.rcUpMask.style.display = "block";
				ptIframe.rcDownMask.style.display = "block";
				
				if (browserInfoObj2.isiPad && browserInfoObj2.isSafari)
					e.preventDefault(); 
					
				return false;
	
			},

			
			
			
			onMouseMove : function (e) {
	
				var dr = ptIframe.rc.dragResize;

				
				if (browserInfoObj2.isiPad && browserInfoObj2.isSafari) {
					var targetEvent =  e.touches.item(0); 
					dr.currMouseX = targetEvent.clientX;
					dr.currMouseY = targetEvent.clientY;
				} else {
					dr.currMouseX = e.pageX;
					dr.currMouseY = e.pageY;
				}

				
				
				var diffX = dr.currMouseX - dr.lastMouseX + dr.mOffX;
				var diffY = dr.currMouseY - dr.lastMouseY + dr.mOffY;
				dr.mOffX = dr.mOffY = 0;

				
				dr.lastMouseX = dr.currMouseX;
				dr.lastMouseY = dr.currMouseY;

				
				dr.constraintCheck(diffY);

				
				dr.element.style.top = dr.elmY + 'px';
				dr.element.style.height = dr.elmH + 'px';
				
				if (browserInfoObj2.isiPad && browserInfoObj2.isSafari)
					e.preventDefault(); 

				return false;
	
			},

			
			onMouseUp : function (e) {

				var dr = ptIframe.rc.dragResize;

				if (browserInfoObj2.isiPad && browserInfoObj2.isSafari) {
					dr.handle.style.borderStyle = "none";  
					ptEvent.remove(document,"touchmove", dr.onMouseMove);
					ptEvent.remove(document,"touchend", dr.onMouseUp);
				} else {
					ptEvent.remove(document,"mousemove", dr.onMouseMove);
					ptEvent.remove(document,"mouseup", dr.onMouseUp);
				}

				
				
				dr.mOffX = dr.mOffY = 0;
				ptIframe.rc.resize(dr.elmH);

				
				ptIframe.rcUpMask.style.display = "none";
				ptIframe.rcDownMask.style.display = "none";

				return false;
		
			},
	
			
			constraintCheck : function (diffY) {

				var dY = diffY;

				if (this.elmH - dY <  this.minHeight) {
					 this.mOffY = (dY - (diffY =  this.elmH - this.minHeight));
				} else if ( this.elmY + dY <  this.minTop) {
					 this.mOffY = (dY - (diffY =  this.minTop - this.elmY));
				}
			
				 this.elmY += diffY;
				 this.elmH -= diffY;
			}
		}
	}


};

ptEvent.load(ptIframe.init);