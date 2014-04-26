var listFormat = false;

var ptBaseURI = getptBaseURI();

var const_keyCode = { ARRLEFT : 37,ARRUP : 38,ARRRIGHT : 39,ARRDN : 40,ENTER : 13,
	ARROPEN : ("ltr" == "ltr") ? 39 : 37,ARRCLOSE : ("ltr" == "ltr") ? 37 : 39,
	ARRPREV: ("ltr" == "ltr") ? 37 : 39,ARRNEXT: ("ltr" == "ltr") ? 39 : 37,
    ESC : 27,TAB : 9
};

var pthNav = {
    isHomepage: /\/h\/\?tab=/.test(location),
    isDashboard: false,             
    serviceURI: ptBaseURI +  "s/WEBLIB_PT_NAV.ISCRIPT1.FieldFormula.IScript_PT_NAV_INFRAME?navtype=dropdown",
    mruURI: ptBaseURI + "s/WEBLIB_PT_NAV.ISCRIPT1.FieldFormula.IScript_PT_NAV_MRU_Update",
	searchURI : ptBaseURI + "s/WEBLIB_PORTAL.PORTAL_SEARCH_PB.FieldFormula.",
	UniNaviTrackerURI : ptBaseURI + ptNav2Info.hNavCrefWebLib,
    liFldr: "li." + ptNav2Info.branding.fldr,
    liFldrOpen: "li." + ptNav2Info.branding.fldrOpen,
    fldrAncIdPrefix: "fldra_",      
    crefLiIdPrefix: "crefli_",      
    favLiIdPrefix : "crefli_fav_",  
    bcLiPrefix : "pthnavbc_",       
    bcAncPrefix : "pthnavbca_",     
    bcCrefPrefix : "pthnavbccref_", 
    mruLiIdPrefix: "pthnavmru_",    
    flyoutPrefix : "pthnavfly_",    
    myFavPrefix: "MYFAVORITES",     
    sortBtnPrefix : "pthnavsort_",  
    favRootId: "pthnavfav",
    mruRootId : "pthnavmruroot",
    iframe: null,                   
    portalObjName : "",             
    selectedBC : "",                
    BCPARENT : "",                  
    
    fldrStyle : "pthnavfldr",       
    loadStyle : "pthnavloading",    
    
    templateId : (typeof(ptAppliedTemplateId) !== "undefined") ? ptAppliedTemplateId : "",
    mruRoot : null,
    mainUl : null,                  
    sortBtn : null,                 
    closeBtn : null,                
    preSort : ptNav2Info.sortOrder === "N" ? false : true, 
    as: null,                       
    container : null,               
    scrollFast : false,
    iframes : [],
    isOverIframe : false,
    isOverNav : false,
    isNavOpen : false,
    lastHoveredId : "",
    block : null,                   
    blockParent : null,             
    IEquirksMode : browserInfoObj2.isIE && document.compatMode != "CSS1Compat",
    templateType : "&templatetype=",
    
    bcScroll : null,
    bcScrollNextId : "pthbcnext",
    bcScrollPrevId : "pthbcprev",
    bcScrollId : "pthbcUlScroll",
    bcFldrClass : "pthnavbarfldr",
    bcABNFldrClass : "pthnavbarabnfldr",    
    bcCrefClass : "pthnavbarcref",
    navFldrPrefix : "liFldr_",
    titleClass : "pthnavtitle",
    unmruCref : "false",
    unmruCrefhref : "false",
    bKeyPress : false,      
    lastKeyHighLite : "",   
    fakeBCSetN : 0,
    fakeBCReqWC : false,
    fakeBCReqCTXMenu : false,
    UniNaviTracker : "", 
	isSafariOniPad : browserInfoObj2.isiPad && browserInfoObj2.isSafari,

    init: function () {

        pthNav.container = ptUtil.id("pthnavcontainer");

        if (!pthNav.isHomepage) {
            pthNav.setPortalObjName();
            pthNav.iframe = ptUtil.id("ptifrmtgtframe");
        } else { 
            pthNav.isDashboard = /\&pslnkid=/.test(location);
			if(!pthNav.isDashboard)
			pthNav.isDashboard = /\/h\/\?/.test(location)
        }

		
    		var navLoc = ptUtil.id("pthdr2navloc");
		if (navLoc) {
			if(ptNav2Info.hNavCrefWebLib != "" ) {
		       pthNav.UniNaviTracker = "TRUE";
			}
			navLoc = navLoc.parentNode.replaceChild(pthNav.container,navLoc);
		}

        
        if (pthNav.iframe) { pthNav.templateType += "IFRM"; }

        
        
        if (browserInfoObj2.isSafari && document.compatMode != "CSS1Compat" && pthNav.container) {
            ptUtil.addClass(pthNav.container,"pthnavsafariquirks");
        }

        
        pthNav.mainUl = ptUtil.id("pthnavroot");

        pthNav.addBreadcrumbEvents();
        pthNav.addEvents(pthNav.mainUl);
        pthNav.initCloseBtn();

        
        ptEvent.add(document, "keyup", pthNav.onHPKeyUp);

        pthNav.abn.init();

        
        var favBC = ptUtil.id(pthNav.bcAncPrefix + pthNav.myFavPrefix);
        if (!pthNav.isHomepage) {
            if (favBC) {
                pthNav.initFavMRUContent(favBC);
            }
        }

//      pthNav.addKeyEvent();       
        pthNav.addSearchEvent();

        
        pthNav.sortBtn = ptUtil.id(pthNav.sortBtnPrefix + "PORTAL_ROOT_OBJECT");
        if (pthNav.sortBtn) {
            ptEvent.add(pthNav.sortBtn,"click",pthNav.sort.handle);
            
            pthNav.sort.initialize();
            var accBTN = pthNav.sortBtn.getElementsByTagName("button");
            if (accBTN)
                ptEvent.add(accBTN[0],"click",pthNav.sort.handle);

            pthNav.sort.doPreSort(pthNav.mainUl);
        }

        
        ptEvent.add(pthNav.container,"mouseover",function(){pthNav.isOverNav = true; return false;});
        ptEvent.add(pthNav.container,"mouseout",function(){pthNav.isOverNav = false; return false;});
        ptEvent.add(document,"click",pthNav.onDocClick);

        
        if (browserInfoObj2.isIE) {
            if (pthNav.iframe) {

                
                
                
                
                ptEvent.add(document,"focusout",pthNav.onIframeClick);
            }
        } else {

            if (pthNav.iframe) {
                ptEvent.add(window,"blur",pthNav.onIframeClick);
            }
        }

        
        pthNav.iframes = document.getElementsByTagName("iframe");

        
        pthNav.block = ptUtil.id("pthnavblock");
        if (pthNav.block) {
            pthNav.blockParent = pthNav.block.parentNode;
        }

        
        pthNav.scroll = new ptScrollable();

        
        var bcScrollCfg = {
            viewStartEl      : ptUtil.id("pthnavbc"),
            showPrevBtnStyle : "pthbcprevshow",
            hidePrevBtnStyle : "pthbcprev",
            showNextBtnStyle : "pthbcnextshow",
            hideNextBtnStyle : "pthbcnext",
            initScrollEnd    : true
        };

            pthNav.bcScroll = new ptHScroller(bcScrollCfg);

        
        var srchInput = ptUtil.id("pthnavsrchinput");
        if (srchInput && typeof ptASObj !== "undefined") {
            var limit = parseInt(document.pthnavsrchform.AS_LIMIT.value, 10);
            if (limit > 0 && pthNav.as == null) {
                if (typeof document.pthnavsrchform.MENU_SEARCH_CAT != "undefined")  
                    pthNav.searchURI += "IScript_SESPortalQry";  
                else
                    pthNav.searchURI += "ISCRIPT_PortalSearch";   
                var asOptions = {
                    searchURI: pthNav.searchURI + "?LIMIT=" + document.pthnavsrchform.AS_LIMIT.value + "&SEARCH_TEXT="
                };
                pthNav.as = new ptASObj(srchInput,asOptions, "pthNavAS");
                ptEvent.add(document,"click",pthNav.as.clearSuggestions);
            }
        }
        
        pthNav.container.style.display = "block";
        if (!pthNav.isHomepage || pthNav.isDashboard) {
            pthNav.positionBreadcrumb();
        }
    },

    openMainMenu : function(){
        pthNav.bKeyPress = true;
        var bc = ptUtil.id(pthNav.bcAncPrefix + "PORTAL_ROOT_OBJECT");
        var flyoutid = pthNav.flyoutPrefix + "PORTAL_ROOT_OBJECT";
        pthNav.doClickBC(bc, flyoutid);
    },

    setSearchFocus : function(){
        if (document.pthnavsrchform) {
            if (!pthNav.isNavOpen)
                pthNav.openMainMenu();
            else
                document.pthnavsrchform[0].focus();
        }

    },

    ptIEHoverEvent : function (node, func){
        if (browserInfoObj2.isIE) {
            ptEvent.add(node, "mouseover", func); 
            ptEvent.add(node, "mouseout", func); 
        }
    },

    
    onHPKeyUp : function(ev){
        var key = (window.event) ? window.event.keyCode: ev.keyCode;
        if (ptUtil.isCtrlKey(ev)){
            if (key==89) {
                if (!pthNav.isNavOpen)
                    pthNav.openMainMenu();
                else
                    pthNav.closeNav();
                return false;   
            }  
            else if (key == 90) {
                
                pthNav.setSearchFocus();
            }
        }
        return true;
    },


    
    onKeyPressBC : function (ev) {
        var key = (window.event) ? window.event.keyCode: ev.keyCode;
        var bubble = true;
        var fldr = this;
        pthNav.bKeyPress = true;
        var bcUL = ptUtil.id("pthbcUlScroll");

        switch (key) {
            case const_keyCode.ARRNEXT:
            case const_keyCode.TAB:
                var nextItem = null;
                if (/MYFAVORITES/.test(this.id))
                    nextItem = ptUtil.id(pthNav.bcAncPrefix + "PORTAL_ROOT_OBJECT");
                else if (/PORTAL_ROOT_OBJECT/.test(this.id)) {
                    
                    if (bcUL.scrollWidth > bcUL.parentNode.offsetWidth)
                        pthNav.bcScroll.scrollToBeg(bcUL);
                    if (bcUL && bcUL.childNodes.length > 1) {
                        nextItem = ptUtil.getFirstChild(bcUL);   
                        nextItem = pthNav.getBCNextSibling(nextItem);
                        if (nextItem) {
                            var aElem = nextItem.getElementsByTagName("a");
                            nextItem = aElem[0];
                        }
                    }else
                        return true;   
                }
                else {
                    
                    var gp = ptUtil.getGrandParent(this);
                    if (gp.id == "pthbcUlScroll") {
                        nextItem = pthNav.getBCNextSibling(this.parentNode);
                        if (!nextItem) {
                            
                            if (ptUtil.isClassMember(this.parentNode, pthNav.bcCrefClass)){
                                var abnSrchPrompt = ptUtil.id("ptabnsp_" + this.parentNode.id);
                                if (abnSrchPrompt){
                                    abnSrchPrompt.firstChild.focus();
                                    return false;
                                }
                            }
                            if (key == const_keyCode.TAB)
                                return true;     
                            else
                                return false;   
                        }                   
                        else {
                            var aElem = nextItem.getElementsByTagName("a");
                            nextItem = aElem[0];
                            if (bcUL.scrollWidth > bcUL.parentNode.offsetWidth)
                                pthNav.arrowBCScroll(key, nextItem);
                        }                                               
                    }
                }
                if (nextItem)
                    nextItem.focus();
                if (this.id == "ptabn_SRCHPROMPT" && key == const_keyCode.TAB)
                    bubble = true;   
                else
                    bubble = false;
                break;

            case const_keyCode.ARRPREV:
                var prevItem = null;
                if (/MYFAVORITES/.test(this.id))
                    return true;
                else if (/PORTAL_ROOT_OBJECT/.test(this.id)) {
                    prevItem = ptUtil.id(pthNav.bcAncPrefix + pthNav.myFavPrefix);
                }
                else if (/ptabn_SRCHPROMPT/.test(this.id)){
                    
                    prevItem = this.parentNode.parentNode.firstChild;  // bcCref a elem pointer
                }else {
                    
                    var gp = ptUtil.getGrandParent(this);
                    if (gp.id == "pthbcUlScroll") {  
                        prevItem = pthNav.getBCPrevSibling(this.parentNode);
                        if (!prevItem)
                            prevItem = ptUtil.id(pthNav.bcAncPrefix + "PORTAL_ROOT_OBJECT");
                        else {
                            var aElem = prevItem.getElementsByTagName("a");
                            prevItem = aElem[0];
                            if (bcUL.scrollWidth > bcUL.parentNode.offsetWidth)
                                pthNav.arrowBCScroll(key, prevItem);
                        }
                    }
                }
                if (prevItem)
                    prevItem.focus();
                bubble = false;
                break;

            case const_keyCode.ARRDN:
                
                if (!ptUtil.isClassMember(this.parentNode, pthNav.bcCrefClass) &&
                    !ptUtil.isClassMember(this.parentNode, pthNav.bcABNFldrClass)){                
                    var flyoutId = pthNav.flyoutPrefix + this.id.slice(pthNav.bcAncPrefix.length);
                    if (flyoutId !== pthNav.selectedBC) {
                        if (pthNav.isNavOpen) {
                            pthNav.closeNav();
                        }
                        var self = this;
                     setTimeout(function(){pthNav.doClickBC(self,flyoutId);},0);
                    }
                }
                bubble = false;
                break;


            case const_keyCode.ENTER:
                bubble = true;
                break;

            default:
                break;
        }
        return bubble;
    },

    
    arrowBCScroll : function(key, item) {
        var ulElem = ptUtil.getGrandParent(item);
        var liElem = item.parentNode;
        var scrollNext = ulElem.sCfg.nextImg;
        var scrollPrev = ulElem.sCfg.prevImg;
        var adjusted = false;

        
        
        var doA = function(liElem, ulElem){
            
            var nextPos = Number(0 - liElem.offsetLeft);
            if (nextPos > ulElem.offsetLeft){
                ulElem.style.left = nextPos + "px";
                return true;
            }
            return false;
        };

        var doB = function(liElem, ulElem){
            
            var nextPos = (liElem.offsetLeft + liElem.offsetWidth);
            var scrollWidth = ulElem.parentNode.offsetWidth;

            if (nextPos > scrollWidth) {        
                var offset =  nextPos - scrollWidth;    
                if (Number(0-offset) < ulElem.offsetLeft)
                    ulElem.style.left = Number(0-offset) + "px";
                return true;
            }
            return false;
        };

        switch (key) {
            case const_keyCode.ARRPREV:
                var firstElem = pthNav.firstLIElem(ulElem, "pthnavbarfldr");
                if (firstElem.id == liElem.id) {  
                    pthNav.bcScroll.scrollToBeg(ulElem);
                    return;
                }

                if ("ltr" === "rtl")
                    adjusted = doB(liElem, ulElem);
                else
                    adjusted = doA(liElem, ulElem);

                if (adjusted){
                    if (!scrollNext.events) {
                        pthNav.bcScroll.addEvents(scrollNext);
                        ptUtil.swapClass(scrollNext,"pthbcnext","pthbcnextshow");
                    }   
                }
                break;

            case const_keyCode.ARRNEXT:
            case const_keyCode.TAB:
                var firstElem = pthNav.firstLIElem(ulElem, "pthnavbarfldr");
                if (firstElem.id == liElem.id) {
                    return;
                }

                if ("ltr" === "rtl")
                    adjusted = doA(liElem, ulElem);
                else
                    adjusted = doB(liElem, ulElem);

                if (adjusted){
                    if (!scrollPrev.events) {
                        pthNav.bcScroll.addEvents(scrollPrev);
                        ptUtil.swapClass(scrollPrev,"pthbcprev","pthbcprevshow");
                    }
                    var nextItem = pthNav.getBCNextSibling(liElem);
                    if (!nextItem) {
                        pthNav.bcScroll.removeEvents(scrollNext);
                        ptUtil.swapClass(scrollNext,"pthbcnextshow","pthbcnext");
                    }
                }
             break;

        }
        return true;
    },

    
    getBCNextSibling : function(node) {
        if (!node) { return null; }

        var sibling = node.nextSibling;
        while (sibling) {
            if ((sibling.nodeName.toLowerCase() === "li") && !ptUtil.isClassMember(sibling,"pthnavhiearchysep"))
                return sibling;
            sibling = sibling.nextSibling;
        }
        return null;

    },

    getBCPrevSibling : function (node){
        if (!node) { return null; }

        var sibling = node.previousSibling;
        while (sibling) {
            if ((sibling.nodeName.toLowerCase() === "li") && !ptUtil.isClassMember(sibling,"pthnavhiearchysep"))
                return sibling;
            sibling = sibling.previousSibling;
        }
        return null;

    },

    
    
    firstLIElem : function (pNode,styleClass){
        var item = pNode.firstChild;
        var bInClass = true;
        if (styleClass && styleClass !== "") {
            bInClass = ptUtil.isClassMember(item,styleClass);
        }
        while (item && ((typeof item.nodeName == "undefined") || (item.nodeName.toLowerCase() != "li") || !bInClass)) {
            item = item.nextSibling;
            if (styleClass && styleClass !== "" && !bInClass)
                bInClass = ptUtil.isClassMember(item,styleClass);
        }
        return item;
    },

    
    onKeyPressFAV : function(ev) {
        var key = (window.event) ? window.event.keyCode: ev.keyCode;
        var bubble = true;
        var item = this;

        switch (key) {
            case const_keyCode.ARRCLOSE:
                var gp = ptUtil.getGrandParent(this);
                if (gp.id !== "pthnavmrs") {
                    pthNav.closeNav();
                    return false;
                }
                break;

            case const_keyCode.ARRUP:   
                if (this.nodeName.toLowerCase() == "span" && this.parentNode.id == "pthnavfavli"
                    && ptUtil.isClassMember(this,pthNav.titleClass)) {
                    var next = ptUtil.id("pthnavmrs");
                    if (next){
                        next.getElementsByTagName("a")[0].focus();
                    } else {
                        next = ptUtil.id("pthnavmru");
                        ptUtil.getFirstChild(next).focus();
                    }
                    return false;
                }
                else if (this.parentNode.id == "pthnavmrs"){
                    
                    var mruUL = ptUtil.id("pthnavmru");
                    ptUtil.getFirstChild(mruUL).focus();
                    return false;
                }
                else
                    item = this.parentNode.previousSibling;

                if (item != null && item.nodeName.toLowerCase() == "li") {
                    pthNav.doFocusOn(item);
                }else {
                    if ((item != null) &&
                        ((item.parentNode.id == pthNav.favRootId) || (item.parentNode.id == pthNav.mruRootId))) {
                        item = item.parentNode.previousSibling.previousSibling;
                        item.focus();
                    }else if (item == null & browserInfoObj2.isIE){
                        var gp = ptUtil.getGrandParent(this);
                        if (gp && (gp.id == "pthnavfav" || gp.id == "pthnavmruroot")){
                            item = gp.previousSibling.previousSibling;
                            item.focus();
                        }
                    }
                }

                bubble = false;
                break;

            case const_keyCode.ARRDN:
            case const_keyCode.TAB:
                if (ptUtil.isClassMember(this,"pthnavtitle") && (this.parentNode.id == "pthnavmru")){
                    var mruUL = ptUtil.id("pthnavmruroot");
                    item = pthNav.firstLIElem(mruUL, "pthnavcref");
                    if (!item){
                        
                        var next = ptUtil.id("pthnavmrs");
                        if (next) {
                            var aElem = next.getElementsByTagName("a");
                            aElem[0].focus();
                            bubble = false;
                            break;
                        }
                    } 
                }
                else if (this.parentNode.id == "pthnavmrs"){
                    
                    var favUL = ptUtil.id("pthnavfav");
                    var favULspan = favUL.previousSibling.previousSibling;
                    favULspan.focus();
                }
                else if (ptUtil.isClassMember(this,pthNav.titleClass) && (this.parentNode.id == "pthnavfavli")){
                    var mruUL = ptUtil.id("pthnavfav");
                    item = pthNav.firstLIElem(mruUL);
                }
                else
                    item = ptUtil.getNextSibling(this.parentNode,"li");


                if (item && item.nodeName.toLowerCase() == "li") {
                    pthNav.doFocusOn(item);
                }
                else {
                    var gp = ptUtil.getGrandParent(this);
                    if (gp.id === "pthnavfav") {
                        return false;  //end in list
                    }
                    else if (gp.id === "pthnavmruroot")  {
                        var next = ptUtil.id("pthnavmrs");
                        if (next) {
                          next.getElementsByTagName("a")[0].focus();
                        } else {
                          
                          next = ptUtil.id("pthnavfav");
                          next.previousSibling.previousSibling.focus();
                        }
                    }else {
                        
                        var favUL = ptUtil.id("pthnavfav");
                        favUL.previousSibling.previousSibling.focus();
                    }
                }
                bubble = false;
                break;


            case const_keyCode.ESC :    
                pthNav.lastHoveredId = "";
                pthNav.closeNav();
                break;

            default:
                bubble = true;
                break;
        }
        return bubble;
    },


    
    onKeyPress : function(ev) {
        var key = (window.event) ? window.event.keyCode: ev.keyCode;
        var bubble = true;
        var item = this;

        switch (key) {
            case const_keyCode.ARRCLOSE:     
                pthNav.bKeyPress = true;
                if (pthNav.lastHoveredId != "") {   
                    
                    var fldr = ptUtil.id(pthNav.lastHoveredId);
                    pthNav.doFocusOn(fldr);
                    pthNav.fldr.close(ptUtil.id(pthNav.lastHoveredId));
                }
                else {
                    
                    pthNav.closeNav();
                }
                bubble = false;
                break;

            case const_keyCode.ARRUP:   
                item = (browserInfoObj2.isIE)? this.parentNode.previousSibling : this.parentNode.previousElementSibling;
                if (item && item.nodeName.toLowerCase() === "li") {
                    var gp = ptUtil.getGrandParent(this);
                    if (gp.scrollHeight > gp.parentNode.offsetHeight)
                        pthNav.arrowScroll(key, item);
                    pthNav.doFocusOn(item);
                }
                bubble = false;
                break;

            case const_keyCode.ARRDN:
            case const_keyCode.TAB:
                if (this.parentNode.parentNode.id == "pthnavroot") {
                    item = ptUtil.getNextSibling(this.parentNode, "li");
                }
                else
                    item = (browserInfoObj2.isIE)? this.parentNode.nextSibling : this.parentNode.nextElementSibling;

                if (item && item.nodeName.toLowerCase() === "li") {
                    var gp = ptUtil.getGrandParent(this);
                    if (gp.scrollHeight > gp.parentNode.offsetHeight)
                        pthNav.arrowScroll(key, item);
                    pthNav.doFocusOn(item);
                }
                bubble = false;
                break;

            case const_keyCode.ESC :    
                pthNav.lastHoveredId = "";
                pthNav.closeNav();
                break;

            default:
                bubble = true;
                break;
        }
        return bubble;
    },


    
    
    arrowScroll : function(key, item) {
        var list = item.parentNode;
        var scrollDown = list.sCfg ? list.sCfg.downImg : null;
        var scrollUp = list.sCfg ? list.sCfg.upImg : null;  

        switch (key) {
            case const_keyCode.ARRUP:
                if ((list.offsetTop < 0) && (item.offsetTop < Math.abs(list.offsetTop))) {
                    list.style.top = Number(0 - item.offsetTop) + "px";
                    if (!scrollDown || !scrollDown.events) {
                        pthNav.scroll.addEvents(scrollDown);
                        ptUtil.swapClass(scrollDown,"pthnavscrolldown","pthnavscrolldownshow");
                    }
                    if ((list.offsetTop == 0) && (scrollUp && scrollUp.events)){
                        pthNav.scroll.removeEvents(scrollUp);
                        ptUtil.swapClass(scrollUp,"pthnavscrollupshow","pthnavscrollup");
                    }
                }
                break;

            case const_keyCode.ARRDN:
            case const_keyCode.TAB:
                var nextItem = null;
                if (browserInfoObj2.isIE) {
                    nextItem = item.nextSibling;
                }
                else
                    nextItem = item.nextSibling ? item.nextSibling.nextSibling : null;

                if ((nextItem == null) && (scrollDown && scrollDown.events)) {
                    pthNav.scroll.removeEvents(scrollDown);
                    ptUtil.swapClass(scrollDown,"pthnavscrolldownshow","pthnavscrolldown");
                    list.style.top = Number(list.offsetTop - 15) + "px";
                    return;
                }   

                var h = list.parentNode.offsetHeight;  // this is the pthnavscroll, list = ul#pthnavroot
                var liH1 = (item.offsetTop + item.offsetHeight);
                var liH2 = (item.offsetTop - Math.abs(list.offsetTop) + item.offsetHeight);
                if (scrollDown && scrollDown.events && (liH1 > h) && (liH2 > h)) {
                    list.style.top = Number(list.offsetTop - item.offsetHeight - 5) + "px";
                    if (!scrollUp || !scrollUp.events) {
                        pthNav.scroll.addEvents(scrollUp);
                        ptUtil.swapClass(scrollUp,"pthnavscrollup","pthnavscrollupshow");
                    }
                }
                break;
        }
        return true;
    },

    doFocusOn : function(item) {
        if (item){

            pthNav.lastKeyHighLite = item.id; 
            var aElem = item.getElementsByTagName("a");
            if (typeof aElem[0] != "undefined") {
                if (pthNav.IEquirksMode) {
                    
                    
                    
                    setTimeout(function(){aElem[0].focus();}, 100);
                }
                else
                    aElem[0].focus();
            }
        }
    },





    
    
    onDocClick : function (e) {

        
        if (browserInfoObj2.isiPad && browserInfoObj2.isSafari) {
            if (e.target.className.toLowerCase() === "pthnavclosehide") {
                pthNav.closeNav();
                return true;      
            }
        }

        
        
        if (pthNav.isOverNav || !pthNav.isNavOpen || pthNav.scrollFast ) {
            pthNav.scrollFast = false;
            return;
        }

        
        var asEl = ptUtil.id("pthNavAS");
        var targetParent = e.target.parentNode;
        if (asEl && (targetParent == asEl))
           return;

        pthNav.closeNav();
        return true;      

    },

    checkSignonResponse : function (r) {
        if (r) {
            var newURL;
            var hIdx =String(location).search(/\/h\/\?tab=/gi);  // see if in Homepage
            if (hIdx != -1)
                newURL = String(location).substring(0, hIdx) + "/?";
            else
                newURL = location  + "&";
            
            window.location = newURL + "cmd=login&errorCode=105";
            return true;

        }
        return false;
    },

    
    
    
    
    addFrameEvents : function () {

        for (var i = 0; i < this.iframes.length; i++) {
            ptEvent.add(this.iframes[i],"mouseover",function(){pthNav.isOverIframe = true;});
            ptEvent.add(this.iframes[i],"mouseout",function(){
                                                pthNav.isOverIframe = false;
                                                window.focus();
            });
        }

        
        
        pthNav.isOverIframe = false;
        window.focus();

    },


    
    
    removeFrameEvents : function () {

        for (var i = 0; i < this.iframes.length; i++) {
            ptEvent.remove(this.iframes[i],"mouseover");
            ptEvent.remove(this.iframes[i],"mouseout");
        }
    },


    
    
    onIframeClick : function (e) {

        if(!pthNav.isOverIframe) { return; }
        pthNav.closeNav();

        
        
        pthNav.removeFrameEvents();
        return false;

    },

    
    
    
    addBreadcrumbEvents : function (node) {

        if (!node) {
            node = ptUtil.id("pthnavcontainer");
        }

        var bcAncs = ptUtil.getElemsByClass("pthnavbcanchor",node,"a");
        for (var i = 0, n = bcAncs.length; i < n; i++) {
            ptEvent.add(bcAncs[i],"keydown",pthNav.onKeyPressBC);
            
            ptEvent.add(bcAncs[i],"click",pthNav.onClickBC);
        }

        
        var bcCref = ptUtil.id(pthNav.bcCrefPrefix + pthNav.portalObjName);
        if (bcCref) {
            ptEvent.add(bcCref.firstChild,"keydown",pthNav.onKeyPressBC);
            ptEvent.add(bcCref.firstChild,"click",pthNav.onClickCref);
        }
    },

    
    isAbnNoHoverFldr : function (node) {
        if (ptUtil.isClassMember(node, "ptabnfldrhvrdisabled")) {
            
            return true;
        }
    
        return false;
    },

    
    
    addEvents : function (node) {

        if (!node) { return }

        
        var ancNodes = node.getElementsByTagName("a");
        for (var i = 0, n = ancNodes.length; i < n; i++) {
            
            if (ptUtil.isClassMember(ancNodes[i].parentNode,this.fldrStyle) &&
                ancNodes[i].parentNode.id.indexOf("_AbnRelActn") > -1) {

                
                
                
                var ancNodesRA = ancNodes[i].getElementsByTagName("a");
                for (var j = 0, k = ancNodesRA.length; j < k; j++) {
                    if (ancNodesRA[j].parentNode.className = "pthnavcref") {
                        ptEvent.add(ancNodesRA[j].parentNode,"click",this.onClickCref);
                        ptEvent.add(ancNodesRA[j],"keydown",this.onClickCref);  
                    }
                }
            }
            

            
            if (ptUtil.isClassMember(ancNodes[i].parentNode,this.fldrStyle)) {
                ptEvent.add(ancNodes[i].parentNode,"click",pthNav.doFldrClick);  
                ptEvent.add(ancNodes[i].parentNode,"keydown",pthNav.doFldrHover);  
                if (ancNodes[i].parentNode.id.indexOf("_AbnRelActn") > -1) { 
                    
                    
                    
                    ptEvent.add(ptUtil.getNextSibling(ancNodes[i], "div"),"click",function(){return false;});  
                }else {
                    
                        var eImage = ptUtil.getNextSibling(ancNodes[i], "div"); 
                        if (this.abn.isABNDynFldrImage(eImage)) //don't add the click event to a dyn hierarchy folder
                        ptEvent.add(ptUtil.getNextSibling(ancNodes[i], "div"),"click",this.abn.doFldrClick);
                        else
                        ptEvent.add(ptUtil.getNextSibling(ancNodes[i], "div"),"click",this.onClickCref);  
                } 
            } 
            else {
                
                ptEvent.add(ancNodes[i].parentNode,"click",this.onClickCref);
                ptEvent.add(ancNodes[i],"keydown",this.onClickCref);   
            }
            ptEvent.add(ancNodes[i],"keydown",this.onKeyPress); 
            pthNav.ptIEHoverEvent(ancNodes[i].parentNode,pthNav.doCrefHover); 
            
        }
    
        
        return ancNodes.length;

    }, 


    addFavEvents : function (node) {

        if (!node) {
            node = ptUtil.id(pthNav.favRootId);
        }

        if (node) {
            var ancNodes = node.getElementsByTagName("a");

            for (var i = 0, n = ancNodes.length; i < n; i++) {
                ptEvent.add(ancNodes[i].parentNode,"click",this.onClickCref);
                ptEvent.add(ancNodes[i],"keydown",this.onKeyPressFAV);
                pthNav.ptIEHoverEvent(ancNodes[i].parentNode, pthNav.doCrefHover);  
            }
            
            ptEvent.add(node.previousSibling.previousSibling,"keydown",this.onKeyPressFAV);
        }
    },

    
    addSearchEvent : function () {

        
        var goButton = ptUtil.id("pthnavgo");
        if (goButton) {
            if (document.pthnavsrchform) {
                ptEvent.add(document.pthnavsrchform[0],"keyup", pthNav.onHPKeyUp);
            }
            ptEvent.add(goButton,"click",function () {
                    var newHref = this.href + "?SEARCH_TEXT=" + encodeURI(document.pthnavsrchform.SEARCH_TEXT.value);
                    if (typeof document.pthnavsrchform.SEARCH_TYPE != "undefined" &&
                        typeof document.pthnavsrchform.MENU_SEARCH_CAT != "undefined"){   
                        newHref += "&SEARCH_TYPE=" + encodeURI(document.pthnavsrchform.SEARCH_TYPE.value);
                        newHref += "&MENU_SEARCH_CAT=" + encodeURI(document.pthnavsrchform.MENU_SEARCH_CAT.value);
                    }
                    if (!pthNav.isHomepage && !ptUtil.isClassMember(this,"ptnns") && typeof ptIframe !== "undefined") {
                        ptIframe.saveWarning(newHref);
                    } else {
                        window.open(newHref,"_parent");
                    }
                    return false;
                }
            );
        }
    },
    
    initCloseBtn : function() {
        
        if (browserInfoObj2.isiPad && browserInfoObj2.isSafari) {
            pthNav.addCloseEvent();
        } 
    },
    
    
    addCloseEvent : function () {
        pthNav.closeBtn = ptUtil.id("pthnavclose");
        if (pthNav.closeBtn) {
            ptEvent.add(pthNav.closeBtn,"click",function () {  
                    pthNav.closeNav();
                    return false;
                }
            );
        }
    },

    closeNav : function () {
        if (typeof document.activeElement !== "undefined" && typeof document.activeElement !== "unknown" && 
            ptUtil.isClassMember(document.activeElement, "pthnavscrolldown"))
            return; 


        if (pthNav.selectedBC === "") { return; }

        
        if (pthNav.as) {
            pthNav.as.clearSuggestions(null,10);
        }

        var selBC = ptUtil.id(pthNav.selectedBC);

        if ((pthNav.lastHoveredId !== "") || (pthNav.lastKeyHighLite != "")) {
            pthNav.fldr.closeAll(selBC);
        }

        this.hideBCDropDown(selBC);
        pthNav.isNavOpen = false;
        this.selectedBC = "";

        
        if (pthNav.lastKeyHighLite != "") {
            pthNav.fldr.openEvent = null;
        }


    },

    
    onClickBC : function (e) {

            
        var gblMenu = ptUtil.id("srchgrplistdiv");
        if (gblMenu && gblMenu.style.display == "block")
            gblMenu.style.display = "none";

        
        if (pthNav.iframe && ptIframe.isPIASaveWarning()) { return false; }

        var flyoutId = pthNav.flyoutPrefix
                       + this.id.slice(pthNav.bcAncPrefix.length);

        
        if (flyoutId !== pthNav.selectedBC) {

            if (pthNav.isNavOpen) {
                pthNav.closeNav();
            }

            
            var self = this;
            setTimeout(function(){pthNav.doClickBC(self,flyoutId);},0);
        }
        return false;

    },

    
    doClickBC : function (bc,flyoutId) {

        var flyoutId = pthNav.flyoutPrefix + bc.id.slice(pthNav.bcAncPrefix.length);

		
        if (!pthNav.isHomepage && pthNav.iframes.length > 0) {
            if (!pthNav.iframes[0].events ||
                typeof pthNav.iframes[0].events["mouseout"] === "undefined") {
                pthNav.addFrameEvents();
            }
        }

        pthNav.isNavOpen = true;

        
        
        if (this.isHomepage || pthNav.isReloadFav) {
            if (bc.parentNode.id === this.bcLiPrefix + this.myFavPrefix) {
                if (pthNav.isReloadFav || !ptUtil.isClassMember(bc.parentNode,"pthnavbarclose")) {
                    pthNav.isReloadFav = false;

                    
                    ptUtil.swapClass(bc.parentNode,"pthnavbarclose","pthnavbaropen");
                    this.getFavMRUContent(bc);
                    return;
                }
            }
        }

        
        ptUtil.swapClass(bc.parentNode,"pthnavbarclose","pthnavbaropen");

        
        var flyout = ptUtil.id(flyoutId);

        
        if (flyout) {

            // does the flyout div have the same parent as the breadcrumb anchor
            if (flyout.parentNode.id === bc.parentNode.id) {
                ptUtil.swapClass(flyout,"pthnavbarhide","pthnavbarshow");

            
            
            } else {
                flyout = flyout.parentNode.removeChild(flyout);
                flyout = bc.parentNode.appendChild(flyout);
                flyout.className = "" + "pthnavflyout pthnavbarshow";
            }

            pthNav.selectedBC = flyout.id;

            var childUl = bc.parentNode.getElementsByTagName("ul")[1];

            
            if (flyout.id !== pthNav.flyoutPrefix + pthNav.myFavPrefix) {
                pthNav.sort.check(childUl);
            }
            
            
            var bcParentNodeId = bc.parentNode.id;
            if ((bcParentNodeId !== pthNav.bcLiPrefix + "PORTAL_ROOT_OBJECT") &&
                (bcParentNodeId !== pthNav.bcLiPrefix +  pthNav.myFavPrefix)) {
                flyout = ptUtil.id(flyoutId);
                pthNav.moveBCflyout(flyout, bc.parentNode);
            } else {
                flyout.setAttribute("aria-labelledby", bc.parentNode.firstChild.id);
            }

            
            pthNav.scroll.check(childUl,false);

            
            
            
            if (bc.id === pthNav.bcAncPrefix + "PORTAL_ROOT_OBJECT"){
                if (browserInfoObj2.isFF) { 
                    var firstChd = ptUtil.getFirstChild(pthNav.mainUl);
                    if (firstChd) firstChd.getElementsByTagName("a")[0].focus();
                }
                if (document.pthnavsrchform)
                    document.pthnavsrchform[0].focus();
                else if (pthNav.sortBtn)
                    pthNav.sortBtn.firstChild.focus();
            }
            

            
            
            
            if (pthNav.lastHoveredId !== ""){
               var tgt = ptUtil.id(pthNav.lastHoveredId);
               if (tgt) {
                    pthNav.fldr.close(tgt);
                    ptUtil.removeClass(currNode,pthNav.loadStyle);
               }
            }           
            
            if (pthNav.bKeyPress) {
                if (bc.parentNode.id === this.bcLiPrefix + this.myFavPrefix) {
                    var mruList = ptUtil.id("pthnavmru");
                    if (mruList) ptUtil.getFirstChild(mruList).focus();
                }
                else {
                    if ((childUl.id == "pthnavroot") && ((typeof document.pthnavsrchform != "undefined") || pthNav.sortBtn)) {
                        
                        return false;
                    }
                    else { 
                        var childItem = null;
                        childItem = ptUtil.getFirstChild(childUl);
                        pthNav.doFocusOn(childItem);
                    }
                }
                pthNav.bKeyPress = false;
                
            }
            
        
        } else {

            
            var ajaxUrl;
            var fldrId = bc.parentNode.id.slice(pthNav.bcLiPrefix.length);
        
            
            var currNode = bc.parentNode;
            var fldr = bc.parentNode;
        
            
            var UniNav = {
                    rootfolder: "N",
                    rootfldrLabel: "",  
                    folderid: "",
                    Remote: "",
                    RNode: "",
                    LNode: "",
                    Portal: "",
                    UniNavPatchbc: "",
                    parentId: "",
                    UniNavABN: "N"
                };
                
            
            for (var i = 0; i < fldr.attributes.length; i++){
                if (fldr.attributes[i].nodeName == "location"){
                    if(fldr.attributes[i].nodeValue == "REMOTE"){
                        UniNav.Remote = "REMOTE";}}
                if (fldr.attributes[i].nodeName == "rnode"){
                        UniNav.RNode = fldr.attributes[i].nodeValue;}
                if (fldr.attributes[i].nodeName == "lnode"){
                        UniNav.LNode = fldr.attributes[i].nodeValue;}
                if (fldr.attributes[i].nodeName == "folderid"){
                        UniNav.folderid = fldr.attributes[i].nodeValue;}
                if (fldr.attributes[i].nodeName == "portal"){
                        UniNav.Portal = fldr.attributes[i].nodeValue;}  
                if (fldr.attributes[i].nodeName == "uninavpathbc"){
                        UniNav.UniNavPatchbc = fldr.attributes[i].nodeValue;}
                if (fldr.attributes[i].nodeName == "rootfldrlabel"){
                        UniNav.rootfldrLabel = fldr.attributes[i].nodeValue;}
                if (fldr.attributes[i].nodeName == "dummyparent"){
                        UniNav.parentId = fldr.attributes[i].nodeValue;
                    if (UniNav.parentId == "root"){
                        UniNav.parentId = fldrId;
                        UniNav.rootfolder = "Y";}}}
            if(UniNav.rootfolder == "Y")
                UniNav.rootfldrLabel =  UniNav.folderid;                        


// ABN ROWSET           if (bc.href.search("istree=true") >= 0) {
            if (bc.href.search("abnds=t") >= 0  ||
                bc.href.search("abnds=r") >= 0  || 
                bc.href.search("abnds=d") >= 0 ) {
                ajaxUrl = pthNav.abn.getTreeAjaxURL(bc);
                
                if(UniNav.Remote == "REMOTE"){
                    var RABNodeUpdate = String(ajaxUrl).indexOf('\/'+UniNav.LNode+'\/');
                    if(RABNodeUpdate != -1){
                    ajaxUrl = String(ajaxUrl).replace('\/'+UniNav.LNode+'\/','\/'+UniNav.RNode+'\/');}                                          
                    ajaxUrl = String(ajaxUrl).replace('\/psc\/','\/psp\/');
                    UniNav.UniNavABN = "Y";
                }   
                
            } else {

                
                var fldrPath = "&FolderPath=";
                var re = new RegExp("[?&]" + "FolderPath" + "=([^&$]*)", "i");
                var path = bc.href.match(re);
                if (path) {
                    fldrPath += path[1];
                }
                
                
                if(UniNav.Remote == "REMOTE"){
                    var ajaxUrl = pthNav.serviceURI;
                    var RNodeUpdate = String(ajaxUrl).indexOf('\/'+UniNav.RNode+'\/');
                    if(RNodeUpdate == -1)
                    ajaxUrl = pthNav.fldr.UniNavSwitchNode(ajaxUrl, UniNav.RNode);  
                    
                    ajaxUrl = String(ajaxUrl).replace('\/psc\/','\/psp\/'); 
                    ajaxUrl = ajaxUrl + "&pt_fname=" + UniNav.folderid + fldrPath + "&mode=x" + "&Portal=" + UniNav.Portal + "&Node=" + UniNav.RNode + "&location=REMOTE&ICAJAX=1&cmd=smartnav" + 
                    pthNav.templateType + "&templateid=" + pthNav.templateId + ptNav2Info.userLang;
                }else {    
                    ajaxUrl = pthNav.serviceURI + "&pt_fname=" + fldrId + fldrPath + "&mode=x" +
                    this.templateType + "&templateid=" + pthNav.templateId + ptNav2Info.userLang;
                }
            }       

            
            var blockedEl = bc.parentNode.parentNode.parentNode.parentNode;
            pthNav.addBlock(bc.parentNode,blockedEl,pthNav.loadStyle);

            var loader = new net2.ContentLoader(
                    ajaxUrl,
                    null,
                    fldrId,
                    "GET",
                    function () {
                        if (pthNav.checkSignonResponse(this.req.getResponseHeader("RespondingWithSignonPage")))
                            return;

                        
                        var respHTML = this.req.responseText;
                        
                        
                        if(UniNav.Remote == "REMOTE"){ 
							var newdiv = document.createElement('div');
								newdiv.setAttribute('id',"dummydiv");
								newdiv.setAttribute('style','none');
								newdiv.innerHTML = respHTML;
							var folderList = newdiv.getElementsByTagName('li' );
							var ancSet = newdiv.getElementsByTagName('a');
								if(UniNav.rootfolder == "Y"){
								   newdiv.firstChild.id = "pthnavfly_" + UniNav.parentId;
								}else {
								   newdiv.firstChild.id = newdiv.firstChild.id + "_" + UniNav.parentId;
								}
							for ( var i = 0 ; i < folderList.length ; i++ ){
								 var folderobj = folderList[i];
								 folderobj.setAttribute('portal',UniNav.Portal);
								 folderobj.setAttribute('rnode',UniNav.RNode);
								 folderobj.setAttribute('lnode',UniNav.LNode);
								 folderobj.setAttribute('location',UniNav.Remote);
								 folderobj.setAttribute('dummyparent',UniNav.parentId);												 	
								 folderobj.setAttribute('folderid',folderobj.id);	
								 folderobj.setAttribute('parent',folderobj.id);
								 folderobj.setAttribute('rootfldrlabel',UniNav.rootfldrLabel);
									if(UniNav.rootfolder == "Y"){
									   if(UniNav.parentId == fldrId){		
									     folderobj.setAttribute('uninavpathbc',UniNav.UniNavPatchbc + "." + bc.innerHTML +"{"+ fldrId +","+UniNav.rootfldrLabel +"}");	
									   } else {
										 folderobj.setAttribute('uninavpathbc',UniNav.UniNavPatchbc + "." + bc.innerHTML +"{"+ fldrId + "}");	
									   }	
									 } else if(UniNav.UniNavABN == "Y"){
									   folderobj.setAttribute('uninavpathbc',UniNav.UniNavPatchbc);			
									 } else {
										if(UniNav.parentId == fldrId){		
									     folderobj.setAttribute('uninavpathbc',UniNav.UniNavPatchbc + "." + bc.innerHTML +"{"+ UniNav.folderid +","+UniNav.rootfldrLabel +"}");	
									   } else {
										 folderobj.setAttribute('uninavpathbc',UniNav.UniNavPatchbc + "." + bc.innerHTML +"{"+ UniNav.folderid + "}");	
									   }									   
									}		
								 folderobj.id = folderobj.id + "_" + UniNav.parentId;
							}
						
							for ( var j = 0 ; j < ancSet.length ; j++ ){
								var Ancobj = ancSet[j];
									if(Ancobj.id)
									Ancobj.id = Ancobj.id + "_" + UniNav.parentId;
									if (Ancobj.href.search("abnds=t") < 0  && Ancobj.href.search("abnds=r") < 0  && Ancobj.href.search("abnds=d") < 0)
									Ancobj.href = Ancobj.href + "&cmd=uninav";
									if(!Ancobj.getAttribute("class"))
									Ancobj.setAttribute('class',"ptntop");
							}
					 
							respHTML = newdiv.innerHTML;
							newdiv.innerHTML = "";
						}
    
                        
                        
                        ptUtil.appendHTML(currNode,respHTML);

                        
                        
                        
                        var flyout = ptUtil.id(pthNav.flyoutPrefix + fldrId);

                        ptUtil.swapClass(flyout,"pthnavflyoutopen","pthnavbarshow");

                        pthNav.selectedBC = flyout.id;

                        
                        var childEls = 0;
                        childEls = pthNav.addEvents(flyout);
                        if (childEls === 0 && flyout) {
                            flyout.style.display = "none";
                        }

                        var childUl = currNode.getElementsByTagName("ul")[1];

                        
                        pthNav.sort.doPreSort(childUl);

                        
                        pthNav.scroll.check(childUl,false);

                        
                        pthNav.removeBlock(currNode,blockedEl,pthNav.loadStyle);
                        
                        var bcParentNodeId = bc.parentNode.id;
                        if ((bcParentNodeId !== pthNav.bcLiPrefix + "PORTAL_ROOT_OBJECT") &&
                            (bcParentNodeId !== pthNav.bcLiPrefix +  pthNav.myFavPrefix)) {
                            flyout = ptUtil.id(flyoutId);
                            pthNav.moveBCflyout(flyout, bc.parentNode);
                        }
                    
                        if (childUl && (childUl.id != "pthnavroot") && pthNav.bKeyPress) {
                            var childItem = ptUtil.getFirstChild(childUl);
                            pthNav.doFocusOn(childItem);
                            pthNav.bKeyPress = false;
                        }

                        

                    },      
                    null,
                    null,
                    "application/x-www-form-urlencoded"
            );
            loader = null;
        }

        return false;
    },

    
    
    moveBCflyout : function(flyoutEl, flyoutParent) {
        if (!flyoutEl) return; 

        
        var rootLi = ptUtil.id("pthnavbc_PORTAL_ROOT_OBJECT");
        var ulParent = flyoutParent.parentNode;
        var liBCElem = ptUtil.id("pthnavbc");       
        var pos=0;
        var offset=0;

        rootLi.appendChild(flyoutEl);

        pthNav.abn.displNavElem(flyoutParent);

        if (flyoutParent.parentNode.offsetWidth > flyoutParent.parentNode.parentNode.offsetWidth)
            offset += 22; 

        if ("ltr" === "ltr") {
            
            
            pos = offset + rootLi.offsetWidth + flyoutParent.offsetLeft + ulParent.offsetLeft + 6;
        } else {
            pos = offset + rootLi.offsetWidth + ulParent.parentNode.offsetWidth + 6;
            pos = pos - flyoutParent.offsetLeft - flyoutParent.offsetWidth - ulParent.offsetLeft;
        }
        flyoutEl.style.left = pos + "px";
        pthNav.setBCPosition(flyoutEl, flyoutParent, pos); 
        if (browserInfoObj2.isIE && !document.documentMode) {
            
            
            flyoutEl.style.zoom = 0;         
            flyoutEl.style.zoom = "normal";  
        }
        flyoutEl.setAttribute("aria-labelledby", flyoutParent.firstChild.id);
    },
    
    //to append the fake BC to portal registry BC
    FakeBCUpdate : function (eBC) { 
        var ptalPgltAreaContainer = document.getElementById("ptalPgltAreaContainer");
        if(ptalPgltAreaContainer)
            this.fakeBCReqWC = true;
        else
            this.fakeBCReqWC = false;
        this.bcScrollUl = ptUtil.id(pthNav.bcScrollId);
        var clickedURL = eBC.children[1].firstChild.href;
        var nChildren = 0;
        if (this.bcScrollUl)
            nChildren = this.bcScrollUl.children.length;
                    
        var nIdx = 0;   
        if(this.fakeBCSetN) {
            var isBCpath = false;
            var fakechildindex = 0;
            var i = 0;
            while(nIdx < nChildren) {
                var child = this.bcScrollUl.children[nIdx];
                if(child.id && child.id.indexOf("FAKE") != -1 && child.firstChild && child.firstChild.href == clickedURL) {
                    isBCpath = true;
                    fakechildindex = nIdx;  
                    break;
                }
                nIdx++;
                }
            if(isBCpath) {
                nIdx++;
                while(nIdx < nChildren)
                    {
                    this.bcScrollUl.removeChild(this.bcScrollUl.children[fakechildindex + 1]);
                    nIdx++;
                    }
                }
            }       

        if(!this.fakeBCReqWC && !this.fakeBCReqCTXMenu)
            return; 
		var currBC = "";
		if (this.bcScrollUl) {	
        	currBC = lastChildValid(this.bcScrollUl);
		} 		
        var issamelabel = false;
        var issamehost = false;
        var issamepath = false;
        try{
            if(browserInfoObj2.isIE) {
                if(currBC.innerText.replace(/^\s+|\s+$/g, '') == eBC.lastChild.innerText.replace(/^\s+|\s+$/g, ''))
                    issamelabel = true;
                else if (currBC.firstChild.innerText.replace(/^\s+|\s+$/g, '') == eBC.lastChild.innerText.replace(/^\s+|\s+$/g, '')) 
                    issamelabel = true;
                if(currBC.firstChild.host == eBC.lastChild.firstChild.host)
                    issamehost = true; 
                if(currBC.firstChild.pathname.substring(currBC.firstChild.pathname.indexOf('/')) == eBC.lastChild.firstChild.pathname.substring(eBC.lastChild.firstChild.pathname.indexOf('/')))
                    issamepath = true;  
            }   
            else {
                if(currBC.ownerDocument.title.replace(/^\s+|\s+$/g, '') == eBC.lastChild.textContent.replace(/^\s+|\s+$/g, ''))
                    issamelabel = true; 
                else if (currBC.firstChild.textContent.replace(/^\s+|\s+$/g, '') == eBC.lastChild.textContent.replace(/^\s+|\s+$/g, '')) 
                    issamelabel = true;
                if(currBC.ownerDocument.firstChild.ownerDocument.location.host == eBC.ownerDocument.lastChild.firstChild.ownerDocument.location.host)
                    issamehost = true;  
                if(currBC.ownerDocument.firstChild.ownerDocument.location.pathname.substring(currBC.ownerDocument.firstChild.ownerDocument.location.pathname.indexOf('/',1)) == eBC.ownerDocument.lastChild.firstChild.ownerDocument.location.pathname.substring(eBC.ownerDocument.lastChild.firstChild.ownerDocument.location.pathname.indexOf('/',1)))
                    issamepath = true;  
				if(eBC.ownerDocument.lastChild.firstChild.ownerDocument.location.pathname.substring(eBC.ownerDocument.lastChild.firstChild.ownerDocument.location.pathname.indexOf('/',1)) == "/ps/")  
            		issamepath = true; 
            }  
        } 
        catch (ex) {}
                
        if(issamelabel && issamehost && issamepath) {
            this.fakeBCReqWC = false;
            this.fakeBCReqCTXMenu = false;      
            return;
            }

        if (eBC.hasChildNodes()) {      

            
            
            
            
    
            if(this.fakeBCSetN && !this.fakeBCReqCTXMenu && this.bcScrollUl) {
                while(this.fakeBCSetN) {
                    //remove last two children added as fake breadcrumb 
                    try{
	                    if (this.bcScrollUl.lastChild.id.indexOf("FAKE") > -1) {
                    this.bcScrollUl.removeChild(this.bcScrollUl.lastChild);
                    this.bcScrollUl.removeChild(this.bcScrollUl.lastChild); 
                    }
                    }
                    catch (ex) {}
                    this.fakeBCSetN--;
                    }               
            }
            
            
            
            nChildren = eBC.children.length;
            nIdx = 0;
            var breadCrumb;
			var eBCName; 
            while (nIdx < nChildren) {
                
                
                
                
                
                if (browserInfoObj2.isIE && !document.documentMode && this.bcScrollUl) {
                    var div = document.createElement("div");
                    div.innerHTML = eBC.children[nIdx].outerHTML;
					eBCName = div.children[0]; 
                    this.bcScrollUl.appendChild(div.children[0]);                       
                    } 
                else if (this.bcScrollUl){
					eBCName = eBC.children[0]; 
                    this.bcScrollUl.appendChild(eBC.children[0]);                       
                }
                nIdx += 1;
            }
            this.fakeBCSetN++;
            if (currBC) {
                document.title = browserInfoObj2.isIE ? firstChildValid(currBC).innerText : firstChildValid(currBC).textContent; 

                
                try {
                    ptIframeHdr.updAddToFavPopup(document.title,pthNav.portalObjName,false,pthNav.iframe.src,true);
                    ptIframeHdr.atfShow();
                    } 
                catch (ex) {}
                }

                    
            try { 
                pthNav.bcScroll.check(this.bcScrollUl);
                } 
            catch (e) {}
            }
            this.fakeBCReqWC = false;
            this.fakeBCReqCTXMenu = false;
			
			
			if (pthNav.abn.search.searchEnabled && (pthNav.portalObjName != pthNav.getPortalObjName(eBCName.id))) {
				ptNav2Info.selectedId = eBCName.id;
				pthNav.setPortalObjName(); 

				
                if (!pthNav.isHomepage) {
                    
                    var bcLiEl = ptUtil.id(pthNav.bcCrefPrefix + pthNav.portalObjName);
                    if (bcLiEl) {
                        pthNav.abn.search.resultsPromptCheck();
						var bcList = document.getElementById("pthbcUlScroll");
						var bcChild = "";
						var promptArray = new Array();
						if (bcList && bcList.childNodes.length > 0) {
							for (var i=0; i < bcList.childNodes.length; i++){ 
								bcChild = pthNav.abn.search.getLastChild(bcList.childNodes[i]);
								if (bcChild != null && bcChild.id.indexOf("ptabnsp_") > -1) {
									promptArray.push(bcChild);
                    } 
                }
							if (promptArray.length > 1) {
								promptArray[0].parentNode.removeChild(promptArray[0]); 
			}

						}
	                } 
				}
				
			}
			
        },

    
    positionBreadcrumb : function (){
        var menuObj = ptUtil.id(pthNav.bcLiPrefix + "PORTAL_ROOT_OBJECT");
        var bcPos = 0;

	    if ("ltr" === "ltr") {
            bcPos = (menuObj.offsetLeft + menuObj.offsetWidth) - 18;
		} else {
			if (!pthNav.isDashboard) {
            bcPos = menuObj.parentNode.offsetWidth - menuObj.offsetLeft -18;
			} else {
				bcPos = menuObj.parentNode.offsetWidth - menuObj.offsetLeft;
			}
		}
					
        if (!pthNav.bcScroll.check(ptUtil.id("pthbcUlScroll")))
            ptUtil.id("pthnavbc").style.left = bcPos + "px";
        else
            ptUtil.id("pthnavbc").style.left = (bcPos + 22) + "px";
    },

    
    
    setBCPosition : function (flyout,flyoutParent, orgPos) {
            if (!flyout && !flyoutParent) { return; }
            var scrollProps = pthNav.scroll.props();
            
            var flip = false;
            var flyWidth = orgPos + flyout.offsetWidth + Math.abs(scrollProps.shadowDivInitLeft) + 50;

            if (flyWidth > scrollProps.viewWidth)
                    flip = true;
            if (flip)
               flyout.style.left = (orgPos - (flyout.offsetWidth - flyoutParent.offsetWidth) + 2) + "px";
    },

    
    
    
    getFavMRUContent : function (bc) {

            var ajaxUrl = pthNav.serviceURI + "&pt_fname=" + pthNav.myFavPrefix + "&mode=x" +
                          this.templateType + "&templateid="  + this.templateId + ptNav2Info.userLang + "&favcontent=all" +
                          "&recentsearch=" + String(pthNav.abn.search.searchEnabled);


            
            var currNode = bc.parentNode;

            
            var blockedEl = bc.parentNode.parentNode.parentNode.parentNode;
            pthNav.addBlock(bc.parentNode,blockedEl,pthNav.loadStyle);

            var favMRUloader = new net2.ContentLoader(
                    ajaxUrl,
                    null,
                    null,
                    "GET",
                    function () {
                        if (pthNav.checkSignonResponse(this.req.getResponseHeader("RespondingWithSignonPage")))
                            return;

                        
                        var respHTML = this.req.responseText;

                        
                        var flyout = ptUtil.id(pthNav.flyoutPrefix + pthNav.myFavPrefix);
                        if (flyout) flyout.parentNode.removeChild(flyout);
                        
                        
                        
                        ptUtil.appendHTML(currNode,respHTML);
                        
                        
                        var flyout = ptUtil.id(pthNav.flyoutPrefix + pthNav.myFavPrefix);
                        pthNav.selectedBC = flyout.id;

                        
                        pthNav.addFavEvents();

                        
                        pthNav.mruRoot = ptUtil.id(pthNav.mruRootId);
                        if (pthNav.mruRoot) {
                            pthNav.mru.init();
                        }

                        var childUl = currNode.getElementsByTagName("ul")[1];

                        
                        pthNav.scroll.check(childUl,false);

                        
                        pthNav.abn.search.initSearchFldr();
						
                        pthNav.fixIESeparator();

                        
                        pthNav.removeBlock(currNode,blockedEl,pthNav.loadStyle);

                        
                        ptUtil.swapClass(flyout,"pthnavbarhide","pthnavbarshow");
                
                        if (pthNav.bKeyPress) {
                            var mruList = ptUtil.id("pthnavmru");
                            if (mruList) ptUtil.getFirstChild(mruList).focus();
                            pthNav.bKeyPress = false;
                        }
                        
                    
                    },      
                    null,
                    null,
                    "application/x-www-form-urlencoded"
        );
        favMRUloader = null;
    
    },

    
    
    
    initFavMRUContent : function (bc) {

            var ajaxUrl = pthNav.serviceURI + "&pt_fname=" + pthNav.myFavPrefix + "&mode=x" +
                          this.templateType + "&templateid=" + this.templateId + ptNav2Info.userLang +  
                          "&favcontent=all" + "&recentsearch=" + String(pthNav.abn.search.searchEnabled);

            
            var currNode = bc.parentNode;

            var favMRUloader = new net2.ContentLoader(
                    ajaxUrl,
                    null,
                    null,
                    "GET",
                    function () {

                        
                        var respHTML = this.req.responseText;

                        
                        
                        ptUtil.appendHTML(currNode,respHTML);

                        
                        pthNav.addFavEvents();

                        
                        pthNav.mruRoot = ptUtil.id(pthNav.mruRootId);
                        if (pthNav.mruRoot) {
                            pthNav.mru.init();

                            
                            
                            var bcCref = ptUtil.id(pthNav.bcCrefPrefix + pthNav.portalObjName);
                            if (bcCref) {
                                pthNav.mru.update(bcCref.firstChild);
                            } 
                        }

                        
                        pthNav.abn.search.initSearchFldr();
						
                        pthNav.fixIESeparator();
                    },      
                    null,
                    null,
                    "application/x-www-form-urlencoded"
        );
        favMRUloader = null;
    
    },

    
    
    
    fixIESeparator : function () {

        
        if (!pthNav.abn.search.searchEnabled) {
            var sep = ptUtil.id("pthnavmrssep");
            if (sep) { sep.style.display = "none"; }
        }

        if (browserInfoObj2.isIE && !pthNav.IEquirksMode && !document.documentMode) {
            var sep = ptUtil.id("pthnavmrufavsep");
            if (sep) { sep.style.marginTop = sep.style.marginBottom = "0"; }

            
            if (pthNav.abn.search.searchEnabled) {
                sep = ptUtil.id("pthnavmrssep");
                if (sep) { sep.style.marginTop = sep.style.marginBottom = "0"; }
            }
        }
    },


    
    onMouseOutBC : function (e) {

        pthNav.hideBCDropDown(ptUtil.id(pthNav.flyoutPrefix +
                              this.id.slice(pthNav.bcLiPrefix.length)));
    },

    
    hideBCDropDown : function (flyoutNode) {

        
        
        
        if (!flyoutNode) { return; }

        var flyoutParentId = flyoutNode.id.substr(pthNav.flyoutPrefix.length);
        var flyoutParent = ptUtil.id(pthNav.bcLiPrefix + flyoutParentId);
        
        
        
        if (ptUtil.isClassMember(flyoutParent,"pthnavbaropen")) {

            
            if (flyoutNode.id === pthNav.flyoutPrefix + "PORTAL_ROOT_OBJECT" &&
                document.pthnavsrchform) {
                document.pthnavsrchform[0].blur();
                document.pthnavsrchform[0].value = "";
            }

            
            ptUtil.swapClass(flyoutNode,"pthnavbarshow","pthnavbarhide");

            
            ptUtil.swapClass(flyoutParent,"pthnavbaropen","pthnavbarclose");
            flyoutNode.style.left = "";

            var aElem = flyoutParent.getElementsByTagName("a");
            if (aElem) aElem[0].focus();   

            
            
        }   
    },

    
    onClickCref : function (e) {
        
        if (e.type == "keydown") {
            var key = (window.event) ? window.event.keyCode: e.keyCode;
            if (key != const_keyCode.ENTER)
                return true;                        
        }
    

        
        var aCref = this;
        
        var liCref = this.parentNode;
        if (this.nodeName.toLowerCase() === "li"){  
            aCref = this.firstChild;
            liCref = this;
        }else if (this.nodeName.toLowerCase() === "div") {
			
			aCref = this.parentNode.firstChild;  
			liCref = this.parentNode;
	  	}

		if(pthNav.UniNaviTracker == "TRUE"){
			var strCrefId = "";
			 if(liCref.attributes['location']){
				if(liCref.attributes['location'].value == "REMOTE"){
			        strCrefId = liCref.attributes['folderid'].value;   					
				} else {
			        strCrefId = liCref.id;
				}	
			 } else {
			    strCrefId = liCref.id;
			 }
			 if(strCrefId != ""){	
			 	if (strCrefId.indexOf(pthNav.mruLiIdPrefix) > - 1) {
			 	    strCrefId = strCrefId.slice(pthNav.mruLiIdPrefix.length); 
				} else if (strCrefId.indexOf(pthNav.crefLiIdPrefix) > - 1){
			        strCrefId = strCrefId.slice(pthNav.crefLiIdPrefix.length); 
				} else if (strCrefId.indexOf(pthNav.bcCrefPrefix) > - 1){
			        strCrefId = strCrefId.slice(pthNav.bcCrefPrefix.length); 
				}		
			 }
			 var paramsiTracker = "&crefname="+strCrefId+"&crefurl="+encodeURIComponent(aCref.href);
             var UNiTrackerLoader = new net2.ContentLoader(
		        pthNav.UniNaviTrackerURI, null, null, "GET",
		        function () {
		          
		          
		          var respHTML = this.req.responseText;
		        },
		        function () {
		          
		          
		          var respHTML = this.req.responseText;
		        },
		        paramsiTracker,
		        "application/x-www-form-urlencoded"
		      );
 
        }
        
        
		var UniNavTgtMRU = aCref.href;
 		if(liCref.attributes['location']){
		if(liCref.attributes['location'].value == "REMOTE"){
		var UniNavClass = "";
		var UniNavRNode = liCref.attributes['rnode'].value;
		var UniNavLNode = liCref.attributes['lnode'].value;
		var objname = liCref.attributes['folderid'].value;
		if(String(objname).indexOf(pthNav.crefLiIdPrefix) != -1)
			objname = objname.slice(pthNav.crefLiIdPrefix.length);

		if(aCref.attributes['class'])
  		 UniNavClass = aCref.attributes['class'].value;

		var isUniNav = liCref.attributes['location'].value;
		
		var UniNavTgtLbl = aCref.innerHTML;
		/*var UniNavDummyParent = liCref.attributes['dummyparent'].value;
		var lnode = liCref.attributes['lnode'].value;
		var rnode = liCref.attributes['rnode'].value;
		var UniNavrootfldrLabel = UniNavDummyParent;
		var selObjname = liCref.id;*/

		var UniNavPath ="";
		if (liCref.attributes['uninavpathbc']){
			if(liCref.attributes['dummyparent'].value == "root"){
                UniNavPath = liCref.attributes['uninavpathbc'].value + "." + UniNavTgtLbl + "{"+  liCref.attributes['id'].value+ "," + objname +"}";
			} else {		 	   
				UniNavPath = liCref.attributes['uninavpathbc'].value + "." + UniNavTgtLbl + "{"+ objname + "}";
			}}
		}}
		
		if (UniNavPath){
			var UnDashPos = String(aCref.href).indexOf('\/h\/\?tab=');
			var UnDashTgtPos = String(aCref.href).indexOf('&pslnkid');	
			if(this.nodeName.toLowerCase() === "li")
				UniNavPath = encodeURIComponent(String(UniNavPath).replace(/\&amp;/g,'&'));

			if(UnDashPos > 1 && UnDashTgtPos > 1 ){
				var	UnDashref = String(aCref.href).substr(0,UnDashPos+8) + "REMOTEUNIFIEDDASHBOARD"; 
	          	var UnDashTgt = String(aCref.href).substr(0,UnDashTgtPos); 
				var UnDashNodeUpdate = String(UnDashTgt).indexOf('\/'+UniNavLNode+'\/');
					if(UnDashNodeUpdate != -1)
					UnDashTgt = String(UnDashTgt).replace('\/'+UniNavLNode+'\/','\/'+UniNavRNode+'\/');
					UnDashTgt += "&pslnkid="+ objname;
					UnDashref +=  "&unifieddashboard=y&uninavpath=" + UniNavPath + "&remotedburl=" + encodeURIComponent(UnDashTgt);
					aCref.href = UnDashref;
					UniNavTgtMRU = aCref.href;
					var DashURLnPos = String(UniNavTgtMRU).indexOf('\/psp\/');
					if (DashURLnPos != -1)
					{
						UniNavTgtMRU = String(UniNavTgtMRU).substr(DashURLnPos,String(UniNavTgtMRU).length); 
					}
		
			} else {
				var NodeUpdate = String(aCref.href).indexOf('\/'+UniNavLNode+'\/');
				if(NodeUpdate != -1)
				aCref.href = String(aCref.href).replace('\/'+UniNavLNode+'\/','\/'+UniNavRNode+'\/');

				
				if (this.nodeName.toLowerCase() === "div" && liCref.attributes['id']) {
					aCref.href = String(aCref.href).replace(liCref.attributes['id'].value,objname);
				}
				var UniNavTgt = aCref.href;
				var URLnPos = String(UniNavTgt).indexOf('\/psp\/');
				if (URLnPos != -1)
				{
					UniNavTgt = String(UniNavTgt).substr(URLnPos,String(UniNavTgt).length); 
				}
				var UnPathPos = String(UniNavTgt).indexOf("uninavpath=");
				var UnParam = "&cmd=uninav";
			
				if (UnPathPos == -1){
					UnParam += "&uninavpath=" + UniNavPath;}

				 aCref.href += UnParam;
				 UniNavTgtMRU = UniNavTgt + UnParam;				 
			}
		}


        
        if (ptUtil.isClassMember(aCref,"ptnnonavcoll")) {
            return false;
        }

        
        
        
        if (liCref.id === pthNav.crefLiIdPrefix + "PT_PORTAL_ADD_FAV_GBL") {

            
            pthNav.closeNav();

            var hdrFavEl = ptUtil.id("pthdr2atf");
            if (hdrFavEl) {
                aCref.href = hdrFavEl.href;
        
                
                if (hdrFavEl.handle) {
                    
                    
                    hdrFavEl.handle.call(hdrFavEl,{type:"click",target:hdrFavEl,
                                                   preventDefault:function(){},
                                                   stopPropagation:function(){}});
                    return false;
                }
            }
        }

        var target = "_parent";
        var newWinOpts = "";
        var saveWarn = "Y";

        
        if (ptUtil.isClassMember(aCref,"ptnns")) saveWarn = "N";


		var isWorkCenter = top.document.getElementById('ptalPgltAreaFrame');
		if((isWorkCenter) && (this.target == '_top'))
			target = "_top";


        
        if (ptUtil.isClassMember(aCref,"ptnnw")) {
            target = "_blank";
            var dirs = "directories";
            var locs = "location";
            var mbar = "menubar";
            var tbar = "toolbar";

            if (ptUtil.isClassMember(aCref,"ptnbd")) dirs += "=no";
            if (ptUtil.isClassMember(aCref,"ptnbl")) locs += "=no";
            if (ptUtil.isClassMember(aCref,"ptnbm")) mbar += "=no";
            if (ptUtil.isClassMember(aCref,"ptnbt")) tbar += "=no";
            newWinOpts = "resizable,scrollbars,status," + dirs + "," + locs + "," + mbar + "," + tbar;
        }

        if (pthNav.isHomepage) {
            if (ptUtil.isClassMember(aCref,"ptndbrd")) {
                pthNav.isDashboard = true;
            }
        }

        
        
        if (!pthNav.isHomepage || pthNav.isDashboard) {
            var templateChange = ptUtil.isClassMember(aCref,"ptntop");
            if (templateChange) {
                pthNav.mru.update(aCref,true);

                
				if(typeof(aCref.parentNode.attributes['LOCATION']) !== "undefined" ) {	
				if(aCref.parentNode.attributes['LOCATION'].value == "REMOTE" || aCref.parentNode.attributes['LOCATION'].value == "REMOTEMRU"){
					var Uncref = aCref.parentNode.attributes['id'].value;														
				 	if (Uncref.indexOf(pthNav.mruLiIdPrefix) > - 1) {
				 	    Uncref = Uncref.slice(pthNav.mruLiIdPrefix.length); 
					  } else if (Uncref.indexOf(pthNav.crefLiIdPrefix) > - 1){
				        Uncref = Uncref.slice(pthNav.crefLiIdPrefix.length); 
					  } else if (Uncref.indexOf(pthNav.bcCrefPrefix) > - 1){
				        Uncref = Uncref.slice(pthNav.bcCrefPrefix.length); 
					}							
					pthNav.unmruCref = Uncref+"$$$"+aCref.innerHTML;					
					pthNav.unmruCrefhref = UniNavTgtMRU;
					pthNav.unLNode = aCref.parentNode.attributes['lnode'].value;
					pthNav.unRNode = aCref.parentNode.attributes['rnode'].value;
					var UnNodeUpdate = String(pthNav.mruURI).indexOf('\/'+pthNav.unRNode+'\/');
					if(UnNodeUpdate != -1)
					pthNav.mruURI = String(pthNav.mruURI).replace('\/'+pthNav.unRNode+'\/','\/'+pthNav.unLNode+'\/');
				}}
                pthNav.mru.save();
            }
        }

        if (pthNav.iframe && !ptUtil.isClassMember(aCref,"abnanchor")) {        
            
            if (saveWarn === "Y") {
                ptIframe.saveWarning(aCref,pthNav.iframeDoClick,target,newWinOpts);
                return false;
            } else {
                
                if (target.toLowerCase() === "_blank") {
                    open(aCref.href,target,newWinOpts);
                } else {
                    pthNav.iframeDoClick(aCref);
                }
                return false;
            }
        }

        
        
        
        var tgtHref = aCref.href;
        if (pthNav.abn.isABNFldr(liCref)) {
            tgtHref += pthNav.abn.getPathParams(liCref);
        }
        addExtraParam(saveWarn,"TargetContent",null,target,tgtHref,newWinOpts);

        
        return false;
    },

    // this gets a fldr <li> parent <li> element id
    getPrntFldrId : function (fldr) {

        var parentId;   

        // check if were in a scroll flyout
        if (!ptUtil.isClassMember(fldr.parentNode,"pthnavscrollul")) {
            parentId = fldr.parentNode.parentNode.parentNode.parentNode.parentNode.id;
        } else {
            parentId = fldr.parentNode.parentNode.parentNode.parentNode.id;
        }

        if (parentId.slice(0,pthNav.bcLiPrefix.length) === pthNav.bcLiPrefix) {
            parentId = pthNav.BCPARENT;
        }

        return parentId;

    },

    // this gets a fldr/cref <li> parent <li> element
    getPrntFldr : function (fldr) {

        // check if were in a scroll flyout
        if (!ptUtil.isClassMember(fldr.parentNode,"pthnavscrollul")) {
            return fldr.parentNode.parentNode.parentNode.parentNode.parentNode;
        } else {
            return fldr.parentNode.parentNode.parentNode.parentNode;
        }
    },

    doCrefHover : function (e) {

        if (e.type==="mouseout") {
            ptUtil.removeClass(this,"pthnavcrefquirks");
            return false;
        }

        
        if (pthNav.as) {
            pthNav.as.clearSuggestions(null,10);
        }

        
        ptUtil.addClass(this,"pthnavcrefquirks"); 
        return false;

    },

    
    doFldrClick : function (e) {

        
        if (browserInfoObj2.isiPad && browserInfoObj2.isSafari) {
            if (e.target.className.toLowerCase() === "pthnavclosehide") {
                pthNav.fldr.close(this);  
                pthNav.doFocusOn(this);
                return false;
            }
        }
        
        if (e.type == "keydown") {
            var key = (window.event) ? window.event.keyCode: e.keyCode;
            if ((key != const_keyCode.ARROPEN) && (key != const_keyCode.ENTER))  
                return;
            else if (ptUtil.isShiftKey(e) && (key == const_keyCode.ENTER)) {
                
                var evt;
                var tgt = ptUtil.getNextSibling(e.target, "div");
                if (document.createEvent) {
                    evt = document.createEvent("MouseEvents");
                    evt.initEvent("click",true,false);
                    tgt.dispatchEvent(evt);     
                } else {
                    evt = document.createEventObject();
                    tgt.fireEvent("onclick",evt);
                }
                return false;
            }else
                pthNav.fldr.openEvent = e.type;
                        
        }
        

        if (pthNav.lastHoveredId === "" || pthNav.lastHoveredId !== this.id) {

            
            if (pthNav.as) {
                pthNav.as.clearSuggestions(null,10);
            }

            var flyout = ptUtil.id(pthNav.flyoutPrefix + this.id);
            var blockedEl;
            if (!flyout) {

                
                
                if (typeof(this.parentNode.sCfg) !== "undefined") {
                    pthNav.scroll.removeEvents(this.parentNode);
                }
                blockedEl = this.parentNode.parentNode.parentNode;
                pthNav.addBlock(this,blockedEl,pthNav.loadStyle);
            }

            var self = this;

            
            
            
            (function() {
                if (pthNav.lastHoveredId !== "" && pthNav.lastHoveredId !== self.id) {
                    var parent = pthNav.getPrntFldr(self);
                    if (parent.id !== pthNav.lastHoveredId) {

                        var tgt = ptUtil.id(pthNav.lastHoveredId);
                        if (tgt) {
                            pthNav.fldr.close(tgt);
                        }
                        setTimeout(arguments.callee,0);
                        return;
                    }
                }

                
                
                if (self.id === "pthnavmrs") {
                    pthNav.abn.search.getData(self);
                }

                pthNav.fldr.open(self,flyout,blockedEl);
            })();

        }else if (((e.target.nodeName.toLowerCase() === "a") || (e.target.nodeName.toLowerCase() === "li")) &&
                  (pthNav.lastHoveredId != "") && (pthNav.lastHoveredId === this.id) && ptUtil.isClassMember(this, "pthnavfldropen")){
            pthNav.fldr.close(this);  
            pthNav.doFocusOn(this);
        }
        else if (pthNav.abn.isABNDynFldrImage(e.target) &&
                 (pthNav.lastHoveredId != "") && 
                 (pthNav.lastHoveredId === this.id) && 
                 (ptUtil.isClassMember(this, "pthnavfldropen"))) {
            pthNav.fldr.close(this);  
            pthNav.doFocusOn(this);
        }
        
        return false;
    },

    
    addBlock : function (loadingNode,blockedNode,loadingStyle) {

        if (!loadingNode || !blockedNode) { return; }   

        if (loadingStyle) {
            ptUtil.addClass(loadingNode,loadingStyle);
        }
        
        var block;
        (function() {
            try {
                block = pthNav.blockParent.removeChild(pthNav.block);
            } catch(e) {
                setTimeout(arguments.callee,0);
                return;
            }
            
            var isIEQrkRTL = (browserInfoObj2.isIE && ((document.compatMode != "CSS1Compat") || (!document.documentMode)) &&  ("ltr" === "rtl"));

            
            
            if (!isIEQrkRTL)
                blockedNode.style.display = "none"; 
            blockedNode.appendChild(block);
            block.style.height = blockedNode.offsetHeight + "px";
            block.style.width = blockedNode.offsetWidth + "px";
            block.style.display = "block";
            if (!isIEQrkRTL)
                blockedNode.style.display = "";  
        })();
    
    },

    
    removeBlock : function (loadingNode,blockedNode,loadingStyle) {

        if (!loadingNode || !blockedNode) { return; }   

        try {
            var block = blockedNode.removeChild(pthNav.block);
            pthNav.blockParent.appendChild(block);
            block.style.display = "none";
            block.style.height = 0;
            block.style.width = 0;
        }
        catch (e) { }

        if (loadingStyle) {
            ptUtil.removeClass(loadingNode,loadingStyle);
        }
    },

    
    iframeDoClick : function (tgt) {

        
        if (ptUtil.isClassMember(tgt,"ptntop") || (ptNav2Info.UniNavTemplate == "true")) {          
            window.open(tgt.href,"_self");
            return;
        }
        
        
        
        var re = new RegExp("[\/e\/?]" + "url" + "=([^&$]*)");
        var result = tgt.href.search(re) > -1;
        var newURL;

        if (result) {
            newURL = decodeURIComponent(String(RegExp.$1));
        } else {
            newURL = String(tgt.href).replace('\/psp\/','\/psc\/');
        }

        // we know by the id prefix if this is a folder anchor, and
        // nav collections disabled was checked earlier, so
        // this check will let us know if a nav collection click occurred   

        var isFavNavColl = false;
        var navColl = tgt.id.indexOf(pthNav.fldrAncIdPrefix) > -1 || (isFavNavColl = ptUtil.isClassMember(tgt,"ptnfnc"));

        var updTgtFrame = false;    

        if (!navColl) { 

            // reset the selected id to the newly selected cref
            ptNav2Info.selectedId = tgt.parentNode.id;

            updTgtFrame = true;

        } else {
            // nav collection click occurred
                
            if (ptNav2Info.selectedId.indexOf(pthNav.crefLiIdPrefix) > -1) {

                // previously selected object was a cref

                // reset the selected id to the newly selected nav collection
                if (!isFavNavColl) {
                    ptNav2Info.selectedId = pthNav.fldrAncIdPrefix + tgt.parentNode.id;
                } else {
                    ptNav2Info.selectedId = tgt.parentNode.id;
                }

                updTgtFrame = true;

            } else {


                // previously selected object was a nav collection

                // is the previously selected folder the same as the clicked folder
                if (ptNav2Info.selectedId.substr(pthNav.fldrAncIdPrefix.length) !== tgt.parentNode.id) {

                    // reset the selected id to the newly selected nav collection
                    if (!isFavNavColl) {
                        ptNav2Info.selectedId = pthNav.fldrAncIdPrefix + tgt.parentNode.id;
                    } else {
                        ptNav2Info.selectedId = tgt.parentNode.id;
                    }

                    updTgtFrame = true;

                }
            }               
        }

        if (updTgtFrame && !pthNav.isHomepage) {  
            if (browserInfoObj2.isIE) ptUtil.removeClass(tgt.parentNode,"pthnavcrefquirks"); 
            pthNav.closeNav(); 
            setTimeout(function(){pthNav.iframeUpdate(newURL,navColl,tgt);},0);
        }

        return false;

    },

    
    
    triggerMouseOut : function (newURL,navColl,tgt) {

        pthNav.closeNav();
        var evt;

        
        if (document.createEvent) {

            evt = document.createEvent("MouseEvents");
            evt.initEvent("mouseout",true,false);
            tgt.dispatchEvent(evt);

        
        } else {

            evt = document.createEventObject();
            tgt.fireEvent("onmouseout",evt);
        }

        setTimeout(function(){
                        if (!pthNav.isHomepage) {
                            pthNav.iframeUpdate(newURL,navColl,tgt);
                        }
                    },0);

    },



    
    iframeUpdate : function (newURL,navColl,tgt) {

        

        var i, flyout, fldrId, navFldr;

        
        var bcStartNode = ptUtil.id("pthnavbc");

        
        pthNav.selectedBC = "";

        
        pthNav.setPortalObjName();

        
        var isAbnFldr = this.abn.isABNFldr(tgt.parentNode);
        var isAbnCref = this.abn.isCref(tgt.parentNode);

        if (!isAbnFldr && !isAbnCref) {
            pthNav.mru.update(tgt);
        }
        
        var ajaxUrl = pthNav.serviceURI + "&mode=bc&isfldr=" + navColl +
                      "&objname=" + pthNav.portalObjName + ptNav2Info.userLang;

        if (!isAbnFldr && !isAbnCref) {

            var ajaxUrl = pthNav.serviceURI + "&mode=bc&isfldr=" + navColl +
                      "&objname=" + pthNav.portalObjName + ptNav2Info.userLang;

            var bcLoader = new net2.ContentLoader(
                ajaxUrl,
                null,
                null,
                "GET",
                function () {
                    if (pthNav.checkSignonResponse(this.req.getResponseHeader("RespondingWithSignonPage")))
                        return;


                    
                    var respHTML = this.req.responseText;

                    
                    var bcParent = bcStartNode.parentNode; 
                    if (!bcParent) {
						bcStartNode = ptUtil.id("pthnavbc");
						bcParent = bcStartNode.parentNode;
					}
                    bcParent.removeChild(bcStartNode);

                    
                    
                    ptUtil.appendHTML(bcParent,respHTML);

                    
                    pthNav.addBreadcrumbEvents(bcParent);

                    
                    setTimeout(function(){pthNav.positionBreadcrumb();},0); 

                    
                    if (!navColl) {
                        pthNav.abn.search.resultsPromptCheck();
                    }

                },      
                null,
                null,
                "application/x-www-form-urlencoded"
            );
            bcLoader = null;
            } else if (isAbnFldr) {
            this.abn.bcUpdate(tgt); 
            newURL += this.abn.getPathParams(tgt.parentNode);
            setTimeout(function(){pthNav.positionBreadcrumb();},0); 
        }

        
        var title = browserInfoObj2.isIE ? tgt.innerText : tgt.textContent;
        pthNav.iframe.src = newURL;
        document.title = title;

        

        
        
        if (pthNav.portalObjName !== "PT_PORTAL_EDIT_FAV_GBL") {

            if (pthNav.portalObjName !== "PT_PORTAL_ADD_FAV_GBL") {
                
                pthNav.atfShow();                   
                
                
                try {
                    ptIframeHdr.updAddToFavPopup(title,pthNav.portalObjName,navColl,pthNav.iframe.src,false);
                    ptIframeHdr.atfShow();
                } catch (err) {}
            }
        } else {

            
            pthNav.atfHide();

            
            try {
                ptIframeHdr.atfHide();
            } catch (err) {}
        }

        
        if (ptIframe && ptIframe.rc) {
            ptIframe.rc.cleanup();
        }   


    },

    
    
    setPortalObjName : function () {

        this.portalObjName = this.getPortalObjName(ptNav2Info.selectedId);

    },

    
    getPortalObjName : function (id) {

        var objName;

        if (id.indexOf(pthNav.crefLiIdPrefix) > -1) {
            
            if (id.indexOf(pthNav.favLiIdPrefix) === -1) {
                objName = id.slice(pthNav.crefLiIdPrefix.length);

            
            } else {
                objName = id.slice(pthNav.favLiIdPrefix.length);
            }
        } else {

            
            if (id.indexOf(pthNav.fldrAncIdPrefix) > - 1) {
                objName = id.slice(pthNav.fldrAncIdPrefix.length);  

            
            } else if (id.indexOf(pthNav.mruLiIdPrefix) > - 1) {
                objName = id.slice(pthNav.mruLiIdPrefix.length);    

            
            } else if (id.indexOf(pthNav.bcCrefPrefix) > - 1) {
                objName = id.slice(pthNav.bcCrefPrefix.length); 

            
            } else if (id.indexOf(pthNav.bcLiPrefix) > - 1) {
                var bcScrollUl = ptUtil.id(pthNav.bcScrollId);
                var last = bcScrollUl.children.length - 1;
                var currBC = bcScrollUl.children[last];
		while (!pthNav.abn.isPortalFldr(currBC) && !ptUtil.isClassMember(currBC, pthNav.bcCrefClass)) {
                    currBC = bcScrollUl.children[last-=1];
                }
                objName = currBC.id.slice(pthNav.bcLiPrefix.length); 
            } else { 
                objName = id;
            }
        }

        return objName;
    },

    
    
    forceNavFavUpdate : function (isEditFav) {
        
        
        var myFav = ptUtil.id(pthNav.favRootId);
        if (!myFav) { return; }

        var ajaxUrl = pthNav.serviceURI + "&pt_fname=" + pthNav.myFavPrefix + "&mode=x" +
                      this.templateType + "&templateid=" + this.templateId + ptNav2Info.userLang;

        var favLoader = new net2.ContentLoader(
                ajaxUrl,
                null,
                null,
                "GET",
                function () {
                    if (pthNav.checkSignonResponse(this.req.getResponseHeader("RespondingWithSignonPage")))
                        return;

                    
                    var respHTML = this.req.responseText;

                    
                    var parent = myFav.parentNode;
                    parent.removeChild(myFav);

                    
                    
                    ptUtil.appendHTML(parent,respHTML);

                    
                    pthNav.addFavEvents(parent);

                    
                    
                    
                    if (isEditFav) {
                        pthNav.atfHide();
                    }

                    
                    
                    if (pthNav.isHomepage) {
                        var favBC = ptUtil.id(pthNav.bcLiPrefix + pthNav.myFavPrefix);
                        if (favBC) {
                            ptUtil.removeClass(favBC,"pthnavbarclose");
                        }
                    }
                },      
                null,
                null,
                "application/x-www-form-urlencoded"
        );
        favLoader = null;

    },

    
    atfShow : function () {

        
        var myFav = ptUtil.id(pthNav.bcLiPrefix + "MYFAVORITES");
        if (!myFav) { return; }

        var atfLink = ptUtil.id(pthNav.crefLiIdPrefix + "PT_PORTAL_ADD_FAV_GBL");

        
        if (atfLink) {
            if (ptUtil.getCSSValue(atfLink,"display") === "none") {
                atfLink.style.display = "list-item";
            }
        }
    },

    
    atfHide : function () {

        var atfNode = ptUtil.id(pthNav.crefLiIdPrefix + "PT_PORTAL_ADD_FAV_GBL");
        if (atfNode) {
            atfNode.style.display = "none";
        }
    },

    
    
    
    
    forceNavEditFavUpdate : function () {
        pthNav.forceNavFavUpdate(true);
    },

    langRefresh : function (lang) {

        var selNode = ptUtil.id(ptNav2Info.selectedId);
        if (!selNode) { return; }

        
        
        var ajaxUrl = ptBaseURI + "s/WEBLIB_PT_NAV.ISCRIPT1.FieldFormula.IScript_PT_LangChange" +
                      "?lang=" + lang;

        var langLoader = new net2.ContentLoader(
            ajaxUrl,
            null,
            null,
            "GET",
            function () {

                
                
                
                
                ptNav2Info.userLang = this.req.responseText;

                var refreshURL = selNode.firstChild.href + ptNav2Info.userLang;

                
                if (pthNav.iframe) {
                    document.location.href = refreshURL;
                
                } else {
                    parent.document.location.href = refreshURL;
                }

            },      
            null,
            null,
            "application/x-www-form-urlencoded"
        );
        langLoader = null;
    },

    
    mru : {
        list : [],
        MAX_MRU: 5,

        
        
        init : function () {

            pthNav.initCloseBtn();
            
            var mruNodes = ptUtil.getElemsByClass("pthnavcref",pthNav.mruRoot,"li");

			if (this.list.length > 0) { 
				return;
			}
            for (var i = 0; i < mruNodes.length; i++) {
                ptEvent.add(mruNodes[i].firstChild,"keydown",pthNav.onKeyPressFAV);
                
                ptEvent.add(mruNodes[i],"click",pthNav.onClickCref);

                
                
                this.list.push({
                    objName : mruNodes[i].id.slice(pthNav.mruLiIdPrefix.length)
                });

                pthNav.ptIEHoverEvent(mruNodes[i], pthNav.doCrefHover);  
            }
            
            var node = ptUtil.id("pthnavmru");
            if (node) {
                var nodeFChild = ptUtil.getFirstChild(node);
                if (nodeFChild)
                    ptEvent.add(nodeFChild,"keydown",pthNav.onKeyPressFAV);
            }
        
        },

        
        update : function (tgt,templateChange) {

            if (!pthNav.mruRoot || !this.list || !tgt) { return; }

            
            var mru = tgt.parentNode;

            
            var isNavColl = false;
            if (tgt.id.indexOf(pthNav.fldrAncIdPrefix) > - 1) { return; }

            
            
            
            var mruId = typeof templateChange === "undefined" ?
                        pthNav.portalObjName : pthNav.getPortalObjName(mru.id);

            
            for (var i = 0; i < this.list.length; i++) {

                if (mruId === this.list[i].objName) {
            
                    
                    var m1 = this.list.splice(i,1);
                    this.list.unshift(m1[0]);

                    
                    m1 = ptUtil.id(pthNav.mruLiIdPrefix + mruId);
                    m1.parentNode.insertBefore(m1,m1.parentNode.firstChild);
                    return;
                }
            }

            

            
            this.list.unshift({objName:mruId});
            if (this.list.length > this.MAX_MRU) {
                this.list.pop();
            }

            

            
            var clone = mru.cloneNode(true);

            
            clone.className = "pthnavcref";

            
            clone.id = pthNav.mruLiIdPrefix + this.list[0].objName;

            
            
            if (!browserInfoObj2.isIE) { ptUtil.addClass(clone,"pthnav-mouse"); }

            
            clone.lastChild.className = "pthnavcrefimg";

            
            ptEvent.add(clone,"click",pthNav.onClickCref);
            ptEvent.add(clone.firstChild,"keydown",pthNav.onKeyPressFAV);

            
            var mruNodes = ptUtil.getElemsByClass("pthnavcref",pthNav.mruRoot,"li");

            try {
				if (mruNodes.length !== 0) {
					pthNav.mruRoot.insertBefore(clone,mruNodes[0]);
				} else {
					pthNav.mruRoot.appendChild(clone);
				}
			} catch (ex) {}
        
            
            if (mruNodes.length === this.MAX_MRU) {
                pthNav.mruRoot.removeChild(mruNodes[this.MAX_MRU - 1]);
            }
        },

        
        save : function (link) {

            if (!pthNav.mruRoot) { return; } 

            
            var mruData = "";
            for (var i = 0; i < this.list.length; i++) {
                mruData += this.list[i].objName + "|";
            }

            if (mruData === "") { return; }
            if(pthNav.unmruCref == "false"){
				var isUnav = ptUtil.id("ptifrmatfdescr").attributes['uninav'].value;
				var UniNavTgtMRUval = ptUtil.id("ptifrmatfdescr").attributes['uninavtargetfav'].value;
				var Unavcref = ptUtil.id("ptifrmatfdescr").attributes['uninavcrefname'].value;
				var Unavcreflbl = ptUtil.id("ptifrmatfdescr").attributes['uninavcreflbl'].value;
				var UnavcrefLnode = ptUtil.id("ptifrmatfdescr").attributes['lnode'].value;
				var UnavcrefRnode = ptUtil.id("ptifrmatfdescr").attributes['rnode'].value;
			    var NodeUpdate = String(pthNav.mruURI).indexOf('\/'+UnavcrefRnode+'\/');

				if(NodeUpdate != -1)
				pthNav.mruURI = String(pthNav.mruURI).replace('\/'+UnavcrefRnode+'\/','\/'+UnavcrefLnode+'\/');

				if(isUnav == "true"){			
					pthNav.unmruCref = Unavcref + "$$$" + Unavcreflbl;					
					pthNav.unmruCrefhref = UniNavTgtMRUval;
				}
			}
            var ajaxUrl = pthNav.mruURI;
            var params = "mrulist=" + encodeURIComponent(mruData)+ "&unmruCref=" + pthNav.unmruCref + "&unmruCrefhref=" + encodeURIComponent(pthNav.unmruCrefhref);

            
            
            
            var isAsync = true;
            if (typeof(link) !== "undefined" && typeof(link.href) !== "undefined") {
                if (/cmd=logout/.test(link.href)) {
                    isAsync = false;
                }
            }

            var mruLoader = new net2.ContentLoader(ajaxUrl,null,null,"post",function(){},
                                                  null,params,"application/x-www-form-urlencoded",
                                                  1,0,null,isAsync);
            mruLoader = null;
        }

    }, 

    
    sort : {

        isInnerText  : browserInfoObj2.isIE ? true : false,
        userDefault  : ptNav2Info.sortOrder,    
        currOrder    : ptNav2Info.sortOrder,    
        sortClick    : false,
        NONE         : "N",                     
        ASCEND       : "A",                     
        DESCEND      : "D",                     
        noSortStyle  : "pthnavsortnone",        
        ascendStyle  : "pthnavsortasc",         
        descendStyle : "pthnavsortdes",         
        const_sortText : [],                    


        initialize : function(){
        
            this.const_sortText[this.NONE] = "Menu not sorted. Click to sort in ascending order.";       
            this.const_sortText[this.ASCEND] = "Menu sorted in ascending order. Click to sort in descending order.";
            this.const_sortText[this.DESCEND] = "Menu sorted in descending order. Click to revert back to original order.";
        },

        
        handle : function (e) {

            
            if (pthNav.as) {
                pthNav.as.clearSuggestions(null,10);
            }

            var tgt = e.target;
            var delay = 0;
            if (pthNav.lastHoveredId !== "") {
                delay = pthNav.fldr.closeAll(tgt.parentNode.parentNode.parentNode) * 100;
            }

            setTimeout(function(){pthNav.sort.doMainMenuSort();},delay);

            return false;
        },

        
        doMainMenuSort : function () {

            if (!this.sortClick) { this.sortClick = true; }

            var ulEl = pthNav.mainUl;

            
            this.init(ulEl);

            var fromStyle, toStyle;
            
            
            if (this.currOrder === this.NONE) {
                this.currOrder = this.ASCEND;
                fromStyle = this.noSortStyle;
                toStyle = this.ascendStyle;

                this.add(ulEl,ulEl.sort.fldrs);
                this.add(ulEl,ulEl.sort.crefs);

            } else if (this.currOrder === this.ASCEND) {
                this.currOrder = this.DESCEND;
                fromStyle = this.ascendStyle
                toStyle = this.descendStyle;

                ulEl.sort.fldrs.reverse(this.sort);
                ulEl.sort.crefs.reverse(this.sort);

                this.add(ulEl,ulEl.sort.fldrs);
                this.add(ulEl,ulEl.sort.crefs);

            } else {
                this.currOrder = this.NONE;
                fromStyle = this.descendStyle;
                toStyle = this.noSortStyle;

                
                ulEl.sort.fldrs.reverse(this.sort);
                ulEl.sort.crefs.reverse(this.sort);

                
                this.add(ulEl,ulEl.sort.defaultCfg);
            }

            
            ptUtil.swapClass(pthNav.sortBtn,fromStyle,toStyle);

            
            pthNav.sortBtn.firstChild.firstChild.nodeValue = this.const_sortText[this.currOrder];
        },


        
        
        check : function (ulEl) {

            if (!ulEl || !this.sortClick) { return; }

            if (this.userDefault !== this.currOrder) {

                
                this.init(ulEl);

                this.doCurrOrderSort(ulEl);

            } else {

                
                
                if (ulEl.sort && ulEl.sort.sortType !== this.userDefault) {
                    this.doCurrOrderSort(ulEl);
                }
            }
        },
        

        
        
        doPreSort : function (ulEl) {

            if (!ulEl || this.currOrder === this.NONE) { return; }

            this.init(ulEl);

            if (this.userDefault === this.currOrder) {
            
                var sortType = this.ASCEND;

                
                if (this.userDefault === this.DESCEND) {
                    ulEl.sort.fldrs.reverse(this.sort);
                    ulEl.sort.crefs.reverse(this.sort);

                    sortType = this.DESCEND;
                }

                
                this.add(ulEl,ulEl.sort.fldrs);
                this.add(ulEl,ulEl.sort.crefs);
        
                ulEl.sort.sortType = sortType;

            } else {
                this.doCurrOrderSort(ulEl);
            }
        },


        
        doCurrOrderSort : function (ulEl) {

            var sortType;

            
            if (this.currOrder === this.NONE) {

                
                ulEl.sort.fldrs.reverse(this.sort);
                ulEl.sort.crefs.reverse(this.sort);

                
                this.add(ulEl,ulEl.sort.defaultCfg);
                sortType = this.NONE;

            } else if (this.currOrder === this.ASCEND) {
                this.add(ulEl,ulEl.sort.fldrs);
                this.add(ulEl,ulEl.sort.crefs);
                sortType = this.ASCEND;

            } else {
                ulEl.sort.fldrs.reverse(this.sort);
                ulEl.sort.crefs.reverse(this.sort);

                this.add(ulEl,ulEl.sort.fldrs);
                this.add(ulEl,ulEl.sort.crefs);
                sortType = this.DESCEND;
            }


            ulEl.sort.sortType = sortType;

        },

        
        init : function (ulEl) {

            var i;

            if (typeof ulEl.sort !== "undefined") {

                
                i = ulEl.childNodes.length - 1;
                do {
                    ulEl.removeChild(ulEl.childNodes[i]);
                } while(i--);

                return;
            }

            
            ulEl.sort = {};
            ulEl.sort.defaultCfg = [];
            ulEl.sort.fldrs = [];
            ulEl.sort.crefs = [];

            var i = ulEl.childNodes.length - 1;

            
            do {
        
                
                if (ulEl.childNodes[i].nodeType === 1) {
                    if (ptUtil.isClassMember(ulEl.childNodes[i],pthNav.fldrStyle)) {

                        
                        ulEl.sort.fldrs.push(ulEl.childNodes[i]);
                    } else {

                        
                        ulEl.sort.crefs.push(ulEl.childNodes[i]);
                    }

                    
                    ulEl.sort.defaultCfg.unshift(ulEl.childNodes[i]);
                }   
                ulEl.removeChild(ulEl.childNodes[i]);
            } while (i--);

            
            ulEl.sort.fldrs.sort(this.sort);
            ulEl.sort.crefs.sort(this.sort);

        },

        
        add : function (listRoot,items) {

            if (!listRoot || !items || items.length === 0) { return; }
        
            var len = items.length - 1;
            var i = items.length - 1;

            do {
                listRoot.appendChild(items[len - i]);
            } while(i--);

        },

        
        sort : function (a, b) {

            var aUp, bUp;
        
            if (pthNav.sort.isInnerText) {
                
                aUp = a.firstChild.innerText.toUpperCase();
                bUp = b.firstChild.innerText.toUpperCase();
            } else {
                aUp = a.firstChild.textContent.toUpperCase();
                bUp = b.firstChild.textContent.toUpperCase();
            }

            return (aUp == bUp ? 0 : (aUp < bUp ? -1 : 1));
        }

    }, 

    
    fldr : {

        hideDownBtnStyle  : "pthnavscrolldown",
        showDownBtnStyle  : "pthnavscrolldownshow",
        noBtnImgStyle     : "pthnavnoscrollbtnimg",
        openEvent         : null,      

        
        
        
        moveContent : function (node) {

            if (!node) { return; }

            
            
            var scrollFlyout = node.parentNode.sCfg.scrollFlyout;
            if (!scrollFlyout) { return node; }

            
            
            
            
            scrollFlyout.style.top = node.offsetTop
                                     - Math.abs(node.parentNode.offsetTop)
                                     + node.parentNode.parentNode.offsetTop
                                     + node.parentNode.parentNode.parentNode.offsetTop + "px";


            
            
            
            var ul = scrollFlyout.getElementsByTagName("ul")[0];
            var fakeLi = ul.getElementsByTagName("li")[0];
            fakeLi = ul.removeChild(fakeLi);
            fakeLi.id = "pthnavph_" + node.id;

            node.parentNode.insertBefore(fakeLi,node);
            var realLi = node.parentNode.removeChild(node);

            
            ul.appendChild(realLi);

            
            scrollFlyout.style.display = "block";

            return realLi;

        },

        
        
        setPosition : function (flyout,flyParYPos,ulElem,scroll,upHeight) {

            if (!flyout || !ulElem) { return; }

            // TODO: See if I can get these once and they stay valid
            var scrollProps = pthNav.scroll.props();

            
            var displayDown = true;

            if (!scroll) {

                
                
                if (upHeight !== 0) {
                    displayDown = false;
                }

            } else {

                
                var dHeight = scrollProps.viewHeight - flyParYPos + 10;
                var uHeight = flyParYPos - scrollProps.viewTop;
                if (uHeight > dHeight) { displayDown = false; }
            }

            
            var horDir = "left";

            var flyWidth;
            if ("ltr" === "ltr") {
                
                flyWidth = pthNav.scroll.getPos(flyout.parentNode).x
                           + Math.abs(flyout.offsetLeft)
                           + flyout.parentNode.offsetWidth
                           + Math.abs(scrollProps.shadowDivInitLeft);

                if (flyWidth > scrollProps.viewWidth) {
                    horDir = "right";
                }
            } else {
                flyWidth = pthNav.scroll.getPos(flyout.parentNode).x
                           - flyout.parentNode.offsetWidth
                           - Math.abs(scrollProps.shadowDivInitLeft);

                
                if (flyWidth < 17) {
                    horDir = "right";
                }
            }

            

            
            
            var scrollCfg, downImg, shadowDiv;
            if (scroll || typeof ulElem.sCfg !== "undefined") {
                scrollCfg = true;
                downImg = ulElem.sCfg.downImg;
                shadowDiv = ulElem.sCfg.shadowDiv;
            } else {
                scrollCfg = false;
                downImg = ptUtil.getNextSibling(ulElem.parentNode,"div","");
                shadowDiv = ulElem.parentNode.parentNode;
            }

            if (displayDown) {
                if (!scroll) {

                    downImg.className = "" + this.hideDownBtnStyle;
                    ulElem.parentNode.style.height = "auto";

                    if (scrollCfg) {
                        ulElem.sCfg.displayDown = true;
                    }

                
                } else {

                    downImg.className = "" + this.showDownBtnStyle;

                    ulElem.parentNode.style.height = scrollProps.viewHeight - flyParYPos
                                                     - flyout.parentNode.offsetHeight
                                                     - downImg.offsetHeight
                                                     - Math.abs(scrollProps.shadowDivInitTop) + "px";

                    ulElem.sCfg.displayDown = true;

                }

            
            } else {

                
                var shadowTop = Math.abs(scrollProps.shadowDivInitTop);

                
                var flyParHeight = flyout.parentNode.offsetHeight;

                if (!scroll) {

                    
                    downImg.className = "" + this.noBtnImgStyle;

                    flyout.style.top = -(flyParHeight + ulElem.offsetHeight +
                                       (2 * shadowTop)) + "px";

                    ulElem.parentNode.style.height = "auto";

                    if (scrollCfg) {
                        ulElem.sCfg.displayDown = false;
                    }

                
                } else {

                    downImg.className = "" + this.showDownBtnStyle;

                    flyout.style.top = -(flyParYPos - scrollProps.viewTop + shadowTop) + "px";

                    
                    ulElem.parentNode.style.height = flyParYPos - flyParHeight
                                                     - scrollProps.viewTop
                                                     - shadowTop + "px";
                    ulElem.sCfg.displayDown = false;
                }

            }

            
            if (horDir === "left") {

                
                
                flyout.style.left = "";
                shadowDiv.style.left = "";

            } else {

                
                flyout.style.left = -(flyout.offsetWidth) + "px";

                
                shadowDiv.style.left = Math.abs(scrollProps.shadowDivInitLeft) + "px";
            }
        },

		UniNavSwitchNode : function (Url, SNode)	{           
			var FindNodeArr = String(Url).split('/');
            var FinalURL =  "";
			var RNodePos = 4;

			if(String(Url).indexOf('http') > -1)
            RNodePos = 7;		

			for (var iN = 0; iN < FindNodeArr.length; iN++) {
			    if(iN == RNodePos){			
					FinalURL += SNode + "/";				
				} else {			
					if((FindNodeArr.length-1) == iN)			
					FinalURL += FindNodeArr[iN];
					else
					FinalURL += FindNodeArr[iN] + "/";				
				}
            }
			return FinalURL;
		},

        open : function (fldr,flyout,blockedEl) {

            ptUtil.addClass(fldr,"pthnavfldropen");

            pthNav.lastHoveredId = fldr.id;

            
            
            
            var scrollablePar =  typeof fldr.parentNode.sCfg !== "undefined" &&
                                fldr.parentNode.sCfg.isScroll ? true : false;
                    
            
            
            if (flyout) {

                
                if (flyout.parentNode.id === fldr.id) {

                    
                    ptUtil.swapClass(flyout,"pthnavflyoutclose","pthnavflyoutopen");

                
                
                } else {
                    flyout = flyout.parentNode.removeChild(flyout);
                    flyout = fldr.appendChild(flyout);
                
                    
                    if (ptUtil.isClassMember(flyout,"pthnavbarhide")) {
                        ptUtil.swapClass(flyout,"pthnavbarhide","pthnavflyoutopen");

                    
                    } else {
                        ptUtil.swapClass(flyout,"pthnavflyoutclose","pthnavflyoutopen");
                    }
                    pthNav.abn.displNavElem(flyout.parentNode);

                }

                var childUl = fldr.getElementsByTagName("ul")[1];

                
                
                if ((scrollablePar) && (childUl)) {
                    pthNav.fldr.moveContent(fldr);
                }

                
                pthNav.sort.check(childUl);
            
                
                pthNav.scroll.check(childUl,true);

                
                if ((pthNav.fldr.openEvent != null) && (childUl)) {
                    var childItem = pthNav.firstLIElem(childUl);
					if (childItem.id != "pthnavmrsdummy") {
	                    		    if (pthNav.abn.isABNFldr(fldr) && childItem.style.display == 'none') {
					        
					        
					        
					        childItem =  ptUtil.getNextSibling(childItem, 'li', 'pthnavfldr');
					    }
					    pthNav.doFocusOn(childItem);
					}
                    if (childItem.id == "pthnavmrsdummy") {
                        
                        ptUtil.removeClass(fldr, "pthnavfldropen");
                    }
                }
                

                return false;
            }   

            // check and set an abn Tree ajaxUrl
            var fldrAnc = ptUtil.id(pthNav.fldrAncIdPrefix + fldr.id);
            var ajaxUrl;
            
            
            var UniNav = {
                rootfolder: "N",
                rootfldrLabel: "",  
                folderid: "",
                Remote: "",
                RNode: "",
                LNode: "",
                Portal: "",
                UniNavPatchbc: "",
                parentId: "",
                UniNavABN: "N"
            };
            var fldrId = fldr.id;
            var currNode = fldr;
        
            
            for (var i = 0; i < fldr.attributes.length; i++){
                if (fldr.attributes[i].nodeName == "location"){
                    if(fldr.attributes[i].nodeValue == "REMOTE"){
                        UniNav.Remote = "REMOTE";}}
                if (fldr.attributes[i].nodeName == "rnode"){
                        UniNav.RNode = fldr.attributes[i].nodeValue;}
                if (fldr.attributes[i].nodeName == "lnode"){
                        UniNav.LNode = fldr.attributes[i].nodeValue;}
                if (fldr.attributes[i].nodeName == "folderid"){
                        UniNav.folderid = fldr.attributes[i].nodeValue;}
                if (fldr.attributes[i].nodeName == "portal"){
                        UniNav.Portal = fldr.attributes[i].nodeValue;}  
                if (fldr.attributes[i].nodeName == "uninavpathbc"){
                        UniNav.UniNavPatchbc = fldr.attributes[i].nodeValue;}
                if (fldr.attributes[i].nodeName == "rootfldrlabel"){
                        UniNav.rootfldrLabel = fldr.attributes[i].nodeValue;}
                if (fldr.attributes[i].nodeName == "dummyparent"){
                        UniNav.parentId = fldr.attributes[i].nodeValue;
                    if (UniNav.parentId == "root"){
                        UniNav.parentId = fldrId;
                        UniNav.rootfolder = "Y";}}}
                if(UniNav.rootfolder == "Y")
                    UniNav.rootfldrLabel =  UniNav.folderid;

            if (fldrAnc.href.search("abnds=t") >= 0  ||
                fldrAnc.href.search("abnds=r") >= 0  ||
                fldrAnc.href.search("abnds=d") >= 0) {
                ajaxUrl = pthNav.abn.getTreeAjaxURL(fldrAnc) + pthNav.abn.getPathParams(fldr);
                
                if(UniNav.Remote == "REMOTE"){
                    var RABNodeUpdate = String(ajaxUrl).indexOf('\/'+UniNav.LNode+'\/');
                    if(RABNodeUpdate != -1){
                    ajaxUrl = String(ajaxUrl).replace('\/'+UniNav.LNode+'\/','\/'+UniNav.RNode+'\/');}                                          
                    ajaxUrl = String(ajaxUrl).replace('\/psc\/','\/psp\/');
                    UniNav.UniNavABN = "Y";
                }
    
            } else {

                
                
                var fldrPath = "&FolderPath=";
                if (fldrAnc) {
                    var re = new RegExp("[?&]" + "FolderPath" + "=([^&$]*)", "i");
                    var path = fldrAnc.href.match(re);
                    if (path) {
                        fldrPath += path[1];
                    }
                }
            
                
                if(UniNav.Remote == "REMOTE"){
                    var ajaxUrl = pthNav.serviceURI;
                    var RNodeUpdate = String(ajaxUrl).indexOf('\/'+UniNav.RNode+'\/');
                    if(RNodeUpdate == -1)
					ajaxUrl =  pthNav.fldr.UniNavSwitchNode(ajaxUrl, UniNav.RNode);
                   
                    ajaxUrl = String(ajaxUrl).replace('\/psc\/','\/psp\/');                     
                    ajaxUrl = ajaxUrl + "&pt_fname=" + UniNav.folderid + fldrPath + "&mode=x" +
                    pthNav.templateType + "&templateid=" + pthNav.templateId + ptNav2Info.userLang + "&cmd=smartnav";
                }else{
                    var ajaxUrl = pthNav.serviceURI + "&pt_fname=" + fldrId + fldrPath + "&mode=x" +
                    pthNav.templateType + "&templateid=" + pthNav.templateId + ptNav2Info.userLang; 
                }
            }   

            var flyLoader = new net2.ContentLoader(
                ajaxUrl,
                null,
                fldrId,
                "GET",
                function () {
                    if (pthNav.checkSignonResponse(this.req.getResponseHeader("RespondingWithSignonPage")))
                        return;
                    
                    
                    var respHTML = this.req.responseText;
                    
                    
                    if(UniNav.Remote == "REMOTE"){ 
						var newdiv = document.createElement('div');
							newdiv.setAttribute('id',"dummydiv");
							newdiv.setAttribute('style','none');
							newdiv.innerHTML = respHTML;
						var folderList = newdiv.getElementsByTagName('li' );
						var ancSet = newdiv.getElementsByTagName('a');
							if(UniNav.rootfolder == "Y"){
							   newdiv.firstChild.id = "pthnavfly_" + UniNav.parentId;
							}else {
							   newdiv.firstChild.id = newdiv.firstChild.id + "_" + UniNav.parentId;
							}
						for ( var i = 0 ; i < folderList.length ; i++ ){
							 var folderobj = folderList[i];
							 folderobj.setAttribute('portal',UniNav.Portal);
							 folderobj.setAttribute('rnode',UniNav.RNode);
							 folderobj.setAttribute('lnode',UniNav.LNode);
							 folderobj.setAttribute('location',UniNav.Remote);
							 folderobj.setAttribute('dummyparent',UniNav.parentId);												 	
							 folderobj.setAttribute('folderid',folderobj.id);	
							 folderobj.setAttribute('parent',folderobj.id);
							 folderobj.setAttribute('rootfldrlabel',UniNav.rootfldrLabel);
								 if(UniNav.rootfolder == "Y") {
									if(UniNav.parentId == fldrId){
								    	folderobj.setAttribute('uninavpathbc',UniNav.UniNavPatchbc + "." + fldrAnc.innerHTML +"{"+ fldrId + ","+UniNav.rootfldrLabel +"}");
									  } else{
										folderobj.setAttribute('uninavpathbc',UniNav.UniNavPatchbc + "." + fldrAnc.innerHTML +"{"+ fldrId + "}");}	
								  } else if(UniNav.UniNavABN == "Y") {							   		
								   	  folderobj.setAttribute('uninavpathbc',UniNav.UniNavPatchbc);	
								  } else {		
									  if(UniNav.parentId == fldrId){						
								   		folderobj.setAttribute('uninavpathbc',UniNav.UniNavPatchbc + "." + fldrAnc.innerHTML +"{"+ UniNav.folderid + +","+UniNav.rootfldrLabel+"}");
									  } else{
										folderobj.setAttribute('uninavpathbc',UniNav.UniNavPatchbc + "." + fldrAnc.innerHTML +"{"+ UniNav.folderid + "}");}
								 }
							 folderobj.id = folderobj.id + "_" + UniNav.parentId;
						}
						
						for ( var j = 0 ; j < ancSet.length ; j++ ){
							var Ancobj = ancSet[j];
								if(Ancobj.id)
								Ancobj.id = Ancobj.id + "_" + UniNav.parentId;
								if (Ancobj.href.search("abnds=t") < 0  && Ancobj.href.search("abnds=r") < 0  && Ancobj.href.search("abnds=d") < 0)
								Ancobj.href = Ancobj.href + "&cmd=uninav";
								if(!Ancobj.getAttribute("class"))
								Ancobj.setAttribute('class',"ptntop");
						}
					 
						respHTML = newdiv.innerHTML;
						newdiv.innerHTML = "";
					 }	  

                    
                    
                    ptUtil.appendHTML(currNode,respHTML);

                    pthNav.abn.displNavElem(currNode);  

                    
                    
                    var childEls = 0;
                    var flyout = ptUtil.id(pthNav.flyoutPrefix + currNode.id)
                    childEls = pthNav.addEvents(flyout);
                    if (childEls === 0 && flyout) {
                        flyout.style.display = "none";
                        flyout.parentNode.firstChild.setAttribute("aria-haspopup", "false");
                    }

                    if ((!pthNav.isNavOpen) || (!ptUtil.isClassMember(currNode, "pthnavfldropen"))) {
                       
                       
                       ptUtil.removeClass(currNode,pthNav.loadStyle);
                       pthNav.fldr.close(currNode);
                       pthNav.lastHoveredId = "";
                       return;
                    }
                
                    
                    
                    var parent = currNode.parentNode;
    
                    
                    
                    if ((scrollablePar) && (childEls > 0)) {
                        pthNav.fldr.moveContent(currNode);
                    }

                    
                    var childUl = currNode.getElementsByTagName("ul")[1];

                    
                    pthNav.sort.doPreSort(childUl);
            
                    
                    pthNav.scroll.check(childUl,true);

                    
                    if ((pthNav.fldr.openEvent != null) && (childUl) && (childEls > 0)) {
                        var childItem = ptUtil.getFirstChild(childUl);
                        			if (pthNav.abn.isABNFldr(currNode) && childItem.style.display == 'none') {
						    
						    
						    
			   			    childItem =  ptUtil.getNextSibling(childItem, 'li', 'pthnavfldr');
						}
                        pthNav.doFocusOn(childItem);
                    }
        

                    
                    if (typeof parent.sCfg !== "undefined" && parent.sCfg.isScroll) {
                        pthNav.scroll.addEvents(parent);
                    }

                    
                    pthNav.removeBlock(currNode,blockedEl,pthNav.loadStyle);

                    if (pthNav.fldr.openEvent != null){
                        if (!childUl) {  
                            ptUtil.removeClass(fldr, "pthnavfldropen");
                            currNode.firstChild.focus();
                        }
                        else if ((childEls === 0) && flyout){
                            flyout.parentNode.firstChild.focus();
                        }
                    }


                },      
                null,
                null,
                "application/x-www-form-urlencoded"
            );
            flyLoader = null;
            return false;
        },

        closeReset : function (fldr) {
            
            
            var nonScrollUl = fldr.parentNode;

            
            var fakeLi = ptUtil.id("pthnavph_" + fldr.id);
            if (fakeLi) {
                fakeLi.id = "";

                
                fakeLi = fakeLi.parentNode.replaceChild(nonScrollUl.removeChild(fldr),fakeLi);

                
                nonScrollUl.appendChild(fakeLi);
            }

            if (pthNav.bKeyPress){
                
                fldr.firstChild.focus();
            }

        },

        
        close : function (fldr) {

            var flyout = ptUtil.id(pthNav.flyoutPrefix + fldr.id);

            if (flyout) {
                
                ptUtil.swapClass(flyout,"pthnavflyoutopen","pthnavflyoutclose");

                
                
                
                flyout.style.left = "";                      

                
                var nonScrollDiv = fldr.parentNode.parentNode;
                if (ptUtil.isClassMember(nonScrollDiv,"pthnavflyoutscroll")) {
                    
                    nonScrollDiv.style.display = "none";
                    pthNav.fldr.closeReset(fldr);
                }
            }

            ptUtil.removeClass(fldr,"pthnavfldropen");
            if (browserInfoObj2.isIE) 
                ptUtil.removeClass(fldr,"pthnavcrefquirks");

            if (pthNav.bKeyPress)
                pthNav.bKeyPress = false;
            
            pthNav.lastHoveredId = pthNav.getPrntFldrId(fldr);
        },

        
        
        closeById : function (id) {
            (function () {
                if (pthNav.lastHoveredId !== "" && pthNav.lastHoveredId !== id) {

                    var tgt = ptUtil.id(pthNav.lastHoveredId);
                    if (tgt) {
                        pthNav.fldr.close(tgt);
                    }
                    setTimeout(arguments.callee,0);
                    return;
                }
            })();
        },

        
        closeAll : function (node) {

            var openFldrs = ptUtil.getElemsByClass("pthnavfldropen",node,"li");
            var closeFldrs = 0;
            if (openFldrs.length > 0) {
                closeFldrs = openFldrs.length;

                for (var i = closeFldrs - 1; i >= 0; i--) {
                    this.close(openFldrs[i]);
                }
            }

            return closeFldrs;
        }

    }, 

    abn : {

        separator : null,           
        fldrBC : null,              
        crefBC : null,              
        bcScrollUl : null,          
        crefBCImg : null,           
        portalfldrBC : null,        
        init : function () {

            this.bcScrollUl = ptUtil.id(pthNav.bcScrollId);
            this.separator = ptUtil.id("ptabnsepbc");
            this.fldrBC = ptUtil.id("ptabnfldrbc");
            this.crefBC = ptUtil.id("ptabncrefbc");

            this.crefBCImg = this.crefBC.children[this.crefBC.children.length-1];
            this.portalfldrBC = ptUtil.id("ptabnportalfldrbc");

            
            this.search.init();
        },

        // adds the abn tree response data or updates the existing data if it
        // already exists
        addData : function (node) {

            if (!node) { return; }
            
            
            
            
            this.bcScrollUl = ptUtil.id(pthNav.bcScrollId);
            if (this.isCref(this.bcScrollUl.lastChild)) {
                return;
            }           

            // find the Main Menu breadcrumb
            var rootLi = ptUtil.id("pthnavbc_PORTAL_ROOT_OBJECT");

            // if the flyout contents already exist somewhere within the navigation
            // find it, remove it and add the new data
            var origFlyPar = null, flyout = ptUtil.id(node.id);
            if (flyout) {
                origFlyPar = flyout.parentNode;
                origFlyPar.removeChild(flyout); 

                // if the flyout has a fldr parent, the new incoming flyout data
                // has to reflect a closed folder
                if (ptUtil.isClassMember(origFlyPar,pthNav.fldrStyle)) {
                    node.className = "" + "pthnavflyout pthnavflyoutclose";
                }
            }

            // work around for the infamous invalid argument bug in IE7
            // when trying to use appendNode with a node from a different
            // document, but cross domain safe
            // document.documentMode only exists in IE8
            if (browserInfoObj2.isIE && !document.documentMode) {
                var div = document.createElement("div");
                div.innerHTML = node.outerHTML;

                if (origFlyPar) {
                    flyout = origFlyPar.appendChild(div.firstChild);
                } else {
                    flyout = rootLi.appendChild(div.firstChild);
                }
            } else {
                if (origFlyPar) {
                    flyout = origFlyPar.appendChild(node);
                } else {
                    flyout = rootLi.appendChild(node);
                }
            }

            childEls = pthNav.addEvents(flyout);

        },

        
        isDataFldr : function (node) {
            return node && ptUtil.isClassMember(node,"ptabntn");
        },

        
        isPortalFldr : function (node) {
            return node && ptUtil.isClassMember(node,"ptabnportalfldr");
        },
        
        
        isDynPortalFldr : function (node) {
            return node && ptUtil.isClassMember(node,"ptabndynportalfldr");
        },
        
        
        isCref : function (node) {
            return node && ptUtil.isClassMember(node,"ptabncrefbc");
        },      

        
        isABNFldr : function (node) {
            return node && (this.isDataFldr(node) || this.isPortalFldr(node));
        },

        
        isABNNoClickDataFldr : function (node) {
            return node && this.isDataFldr(node) && ptUtil.isClassMember(node,"ptabnnoclick");
        },

        
        isABNBreadCrumbFldr : function (node) {
            return node && this.isDataFldr(node) && ptUtil.isClassMember(node,pthNav.bcFldrClass);
        },

        
        isABNDynFldrImage : function (node) {
            return node && ptUtil.isClassMember(node,"ptabndynfldrimg");
        },

        
        
        doFldrClick : function (node) {
            if (!node || !this.isABNDynFldrImage(node)) { return; }
            node.previousSibling.onClick();
        },      
        
        
        displNavElem : function(node) {

            if (!node) { return; }

            var abnNavElemId;
            var abnLiNavElem;
            var abnNavElemIdPostFix = "_abnne";
            var abnNavElemIdPreFix = "crefli_";
    
            if ( this.isABNBreadCrumbFldr(node) ) {
                
                
                var nodeIdParts = node.id.split("_");
                
                
                
                nodeIdParts.shift();
                abnNavElemId = abnNavElemIdPreFix + (nodeIdParts.join("_")) + abnNavElemIdPostFix;
                
                abnLiNavElem = document.getElementById(abnNavElemId);
                if ( abnLiNavElem ) {
                    abnLiNavElem.style.display = "block";
                    
                    // set the nav element label to the parent bc label
                    // abnLiNavElem.children[0].firstChild.nodeValue is the nav elemnet anchor tag's text node
                    // node.children[0].firstChild.nodeValue is the bc anchor tag's text node
                    var szViewMessage = "View";
                    if (typeof(abnLiNavElem.children[0].firstChild) != "undefined" && 
                        typeof(node.children[0].firstChild) != "undefined" && 
                        abnLiNavElem.children[0].firstChild.nodeValue == szViewMessage) {   
                        abnLiNavElem.children[0].firstChild.nodeValue = szViewMessage.concat(" ", node.children[0].firstChild.nodeValue);
                    }       
                }   
            }
            else if ( this.isABNFldr(node) ) {
                
                
                abnNavElemId = abnNavElemIdPreFix + node.id + abnNavElemIdPostFix;
                    abnLiNavElem = document.getElementById(abnNavElemId);
                if ( abnLiNavElem ) {
                    abnLiNavElem.style.display = "none";
                }
            }

        },  

        // get the folder parent
        getParent : function (fldr) {

            var prntFldr = null;
            var prntFldrId = pthNav.getPrntFldrId(fldr);


            // if the folder is not a direct descendant of the breadcrumb
            if (prntFldrId !== pthNav.BCPARENT) {
                prntFldr = pthNav.getPrntFldr(fldr);
            }

            return prntFldr;

        },

        getTreeAjaxURL : function (anc) {

            if (!anc) { return; }

            // get the href parts
            var hrefParts = anc.href.split("psp");

            // piggyback on an iScript request by appending the URI + the iScript portion + query string - "?" + extra qs params
            var hrefComp = anc.pathname.split("/c/");
            var scriptPath = "s/WEBLIB_PT_NAV.ISCRIPT1.FieldFormula.IScript_PT_NAV_INFRAME?navtype=dropdown";
            var pathNameParts = anc.pathname.split("/");
            
            
            
            
            
            var nAdjFctr = 0;
            if ( browserInfoObj2.isIE ) {
                nAdjFctr = 1;
            }
            return hrefParts[0] + pathNameParts[1 - nAdjFctr] + "/" + pathNameParts[2 - nAdjFctr] + "/" + pathNameParts[3 - nAdjFctr] + "/" + pathNameParts[4 - nAdjFctr] + "/" + scriptPath + "&" + anc.search.slice(1) + "&mode=x" + "&cmp=" + hrefComp[1] + "&cmd=smartnav";
        },

        // gets the DataPath and PortalPath query string parameters
        getPathParams : function (fldr) {

            if (!fldr) { return; }

            var getFldrPath = function (fldrAnc) {

                
                var re = new RegExp("[?&]" + "FolderPath" + "=([^&$]*)", "i");
                var fldrPath = fldrAnc.href.match(re);
                if (fldrPath) {
                     return fldrPath[1].toString().split(".");
                } else { return null; }
            };

            var dPath, pPath, parent;

            
            if (this.isDataFldr(fldr)) { 
                dPath = [];
                dPath.push(fldr.id);
            } else {

                
                
                pPath = getFldrPath(fldr.firstChild);

                if (!pPath) { 

                    
                    parent = this.getParent(fldr);
                    if (parent) {
                        pPath = getFldrPath(parent.firstChild);

                    } else {    
                        pPath = [];
                        pPath.push("PORTAL_ROOT_OBJECT");
                    }

                    var id = pthNav.getPortalObjName(fldr.id);
                    pPath.push(id);
                }
                return "&DataPath=" + "&PortalPath=" + pPath.toString();
            }

            
            
            parent = this.getParent(fldr);
            while (this.isDataFldr(parent)) {
                dPath.unshift(parent.id);
                parent = this.getParent(parent);
            }

            var abnFldrId;

            
            
            if (parent) {
                abnFldrId = parent.id;
                parent = this.getParent(parent);

                if (parent) {
                    pPath = getFldrPath(parent.firstChild);
                } else {    
                    pPath = [];
                    pPath.push("PORTAL_ROOT_OBJECT");
                }

            } else { 

                var bcUl = ptUtil.id(pthNav.bcScrollId);                    
                var bcEls = bcUl.children;
                var last = bcEls.length - 1;
                var abnFldrNum;
                var dataFldrId;
                var bcDataPath = [];

                
		
		
                for (var i = 1; i <= last; i += 2) {
                    if (this.isPortalFldr(bcEls[i])) {
                        abnFldrId = bcEls[i].id.slice(pthNav.bcLiPrefix.length);
                        abnFldrNum = i;
					} else if (ptUtil.isClassMember(bcEls[i], pthNav.bcCrefClass)) {
                        abnFldrId = bcEls[i].id.slice(pthNav.bcCrefPrefix.length);
                        abnFldrNum = i;
                    } else if (this.isDataFldr(bcEls[i]) ||  ptUtil.isClassMember(bcEls[i], pthNav.bcCrefClass)) {
                        dataFldrId = bcEls[i].id.slice(pthNav.bcLiPrefix.length);
                        if (dPath[0] !== dataFldrId) {
			    if (bcDataPath.length == 0) {
				//always use the id from the redirect element for the first array element
				dataFldrId = bcEls[i - 2].id.slice(pthNav.bcLiPrefix.length);
				bcDataPath.push(dataFldrId);
			    }
			    else {
				bcDataPath.push(dataFldrId);
			    }
			}
							
                        if (ptUtil.isClassMember(bcEls[i],"pthnavbaropen")) {
                            break;
                        }
                    }
                }

                
                if (bcDataPath.length !== 0) {
                    dPath = bcDataPath.concat(dPath);
                }

                
                if (abnFldrNum === 1) {
                    pPath = [];
                    pPath.push("PORTAL_ROOT_OBJECT");
                } else {
                    pPath = getFldrPath(bcEls[abnFldrNum -= 2].firstChild);
                }
            }

            pPath.push(abnFldrId); 
            
            if (dPath.length > 1) {
                var oldString = dPath[0] + "_";
                var newString = dPath[0] + ";;";
                for (var j = 1; j < dPath.length; j++) {
                    dPath[j] = dPath[j].replace(oldString, newString);														
                }
            }            

            var abnPathQS = "&DataPath=" + dPath.toString() +
                            "&PortalPath=" + pPath.toString();
            return abnPathQS;
        },

        // get the breacrumb parent id
        bcPrntId : function (fldr) {

            var bcId, flyout, parentFldr;
            var prntFldrId = pthNav.getPrntFldrId(fldr);

            // is the folder a direct descendant of the breadcrumb
            if (prntFldrId === pthNav.BCPARENT) {

                // get the flyout
                flyout = fldr.parentNode.parentNode.parentNode.parentNode;
                bcId = pthNav.bcLiPrefix + flyout.id.slice(pthNav.flyoutPrefix.length);

            // get the folder parent
            } else {
                bcId = pthNav.bcLiPrefix + pthNav.getPrntFldrId(fldr);
            }

            return bcId;
        },

        // remove a breadcrumb element
        bcRemove : function (bcFldrLIs,bcId,bcContent) {

            // remove any other breadcrumb parts after the folder                   
            var flyout, i = bcFldrLIs.length - 1;
            var isSepNode = bcFldrLIs[i].getAttributeNode("id") ? false : true; // separator nodes don't have ids

            while (isSepNode || bcFldrLIs[i].id !== bcId) {

                // if the fldr contents exist somewhere have to remove the flyout contents, since were going to reget them
                if (!isSepNode) {

                    flyout = ptUtil.id(pthNav.flyoutPrefix + bcFldrLIs[i].id.slice(pthNav.bcLiPrefix.length));
                    if (flyout) {
                        flyout.parentNode.removeChild(flyout);
                    }
                }

                // remove the breadcrumb <li>
                this.bcScrollUl.removeChild(bcFldrLIs[i]);

                i--;
                isSepNode = bcFldrLIs[i].getAttributeNode("id") ? false : true;
            }

            // remove the folder's current flyout contents, since were
            // going to reget them again after the abn.addData code is run
            if (bcContent) {
                flyout = ptUtil.id(pthNav.flyoutPrefix + bcId.slice(pthNav.bcLiPrefix.length));
                if (flyout) {
                    flyout.parentNode.removeChild(flyout);
                }
            }

        },

        // update the breadcrumb when the user performs a chart nav
        // fldrAncId is the chart node that has the focus
       updateBC : function (eBC, eFlyOut) {

            
            this.bcScrollUl = ptUtil.id(pthNav.bcScrollId);

            
            
            if (typeof(eFlyOut) != "undefined") {
                
                var eRootFolder = ptUtil.id("pthnavbc_PORTAL_ROOT_OBJECT");

                if (eRootFolder) {
                    
                    var eExistingFlyOut = document.getElementById(eFlyOut.firstChild.id);
                    if (eExistingFlyOut) {
                        eExistingFlyOut.parentNode.removeChild(eExistingFlyOut);
                    }
            
                    
                    // work around for the infamous invalid argument bug in IE7
                    // when trying to use appendNode with a node from a different
                    // document, but cross domain safe
                    // document.documentMode only exists in IE8
                    var flyout;
                    if (browserInfoObj2.isIE && !document.documentMode) {
                        var div = document.createElement("div");
                        div.innerHTML = eFlyOut.firstChild.outerHTML;
                        flyout = eRootFolder.appendChild(div.firstChild);
                    } else {
                        flyout = eRootFolder.appendChild(eFlyOut.firstChild);
                    }

                    
                    pthNav.addEvents(flyout);
                }
            }

            
            if (typeof(eBC) == "undefined") {
                
                
                
                if (this.bcScrollUl.lastChild && 
                    this.bcScrollUl.lastChild.firstChild &&
                    !pthNav.abn.isDynPortalFldr(this.bcScrollUl.lastChild)) {
                    ptEvent.remove(this.bcScrollUl.lastChild.firstChild,"click");
                }
            } else if (eBC.hasChildNodes()) {           

                
                
                
                
		
                var currBC = this.bcScrollUl.lastChild;
                while (currBC && ((!this.isPortalFldr(currBC) && !ptUtil.isClassMember(currBC, pthNav.bcCrefClass)) || (ptUtil.isClassMember(currBC, "ptfakercfbc")))) {
                    this.bcScrollUl.removeChild(currBC);
                    currBC = this.bcScrollUl.lastChild;
                }

                if (currBC && !pthNav.abn.isDynPortalFldr(currBC) && ptUtil.id(pthNav.mruRootId)) {
                    var fakeCref = currBC.cloneNode(true);
                    fakeCref.appendChild(this.crefBCImg);
                    fakeCref.className = "pthnavcref ptabnportalfldr";
                    fakeCref.firstChild.removeAttribute("class");
                    fakeCref.firstChild.removeAttribute("id");
                    pthNav.mru.update(fakeCref.firstChild,false); 
                }

                
                
                
                
                if ( !pthNav.abn.isDynPortalFldr(this.bcScrollUl.lastChild) ) {
                    ptEvent.remove(this.bcScrollUl.lastChild.firstChild,"click");
                }

                
                
                
                if (pthNav.abn.search.isRSEnabledOnBC(currBC)) {
                    currBC.removeChild(pthNav.abn.search.getLastChild(currBC));
                }

                ptNav2Info.selectedId = eBC.lastChild.id;
                pthNav.setPortalObjName();

		
		
		
		if ((pthNav.abn.isPortalFldr(this.bcScrollUl.lastChild) && !pthNav.abn.isDynPortalFldr(this.bcScrollUl.lastChild)) ||
                    ptUtil.isClassMember(this.bcScrollUl.lastChild, pthNav.bcCrefClass)) {
			var bRemoveFromResponse = true;
			while (bRemoveFromResponse) {
				if (pthNav.abn.isDynPortalFldr(eBC.children[1]) || pthNav.abn.isPortalFldr(eBC.children[1])) {
					eBC.removeChild(eBC.children[0]); //remove the seperator element
					eBC.removeChild(eBC.children[0]); //remove the folder/cref element
				}
				else {
					bRemoveFromResponse = false;
				}
			}
		}                

                
                
                
                var nChildren = eBC.children.length;
                var nIdx = 0;
                var breadCrumb;
                while (nIdx < nChildren) {

                    
                    
                    
                    
                    
                    if (browserInfoObj2.isIE && !document.documentMode) {
                        var div = document.createElement("div");
                        div.innerHTML = eBC.children[nIdx].outerHTML;
                        breadCrumb = this.bcScrollUl.appendChild(div.children[0]);
                    } else {
                        breadCrumb = this.bcScrollUl.appendChild(eBC.children[0]);
                    }

                    
                    if (this.isDataFldr(breadCrumb) && !ptUtil.isClassMember(breadCrumb,"ptabndynportalfldr")) {
                        if (this.isABNNoClickDataFldr(breadCrumb))
                            ptEvent.add(breadCrumb.firstChild,"click",function(){return false;});
                        else {
                            ptEvent.add(breadCrumb.firstChild,"keydown",pthNav.onKeyPressBC);
                            ptEvent.add(breadCrumb.firstChild,"click",pthNav.onClickBC);
                        }
                    }

                    
                    if (this.isCref(breadCrumb)) {
                        //ptEvent.add(breadCrumb.firstChild,"click",function(){return false;});
                        ptEvent.add(breadCrumb.firstChild,"keydown",pthNav.onKeyPressBC);  
                        ptEvent.add(breadCrumb.firstChild,"click",pthNav.onClickCref);
                    }

                    nIdx += 1;
                }

                if (currBC) {
                    if(currBC.firstChild)
                        document.title = browserInfoObj2.isIE ? currBC.firstChild.innerText : currBC.firstChild.textContent;

                    
                    try {
                        ptIframeHdr.updAddToFavPopup(document.title,pthNav.portalObjName,false,pthNav.iframe.src,true);
                        ptIframeHdr.atfShow();
                    } catch (ex) {}
                }

                
                try { 
                    pthNav.bcScroll.check(this.bcScrollUl);
                } catch (e) {} 
            }

            pthNav.abn.search.resultsPromptCheck();

        },

        
        bcUpdate : function (navNodeAnc) {

            if (!navNodeAnc) { return; }

            var bcLis;

            var createBC = function (liElem,isFldrBC) {

                if (!liElem) { return; }

                // breadcrumb folder structure                              
                // <li id="pthnavbc_PT_PORTAL" class="pthnavbarfldr pthbcdispiblock">
                //   <a id="pthnavbca_PT_PORTAL" class="pthnavbcanchor" href="...">Portal</a>

                // navigation folder structure
                // <li id="fldrli_10100" class="pthnavfldr">
                //   <a id="fldra_10100" href="...">10100 - Office of the President</a>
                var createFldrBC = function (fldrLi) {

                    // clone the breadcrumb folder <li>
                    var bcFldrLi = pthNav.abn.fldrBC.cloneNode(true);

                    // get the folder <a> element
                    var bcFldrAnc = bcFldrLi.firstChild;

                    // change the id to be a breadcrumb <li> element id 
                    bcFldrLi.id = pthNav.bcLiPrefix + fldrLi.id;

                    
                    if (pthNav.abn.isDataFldr(fldrLi)) {
                        bcFldrLi.className += " ptabntn";
                    } else if (pthNav.abn.isPortalFldr(fldrLi)) {
                        bcFldrLi.className += " ptabnportalfldr";

                        
                        
                        
                        bcFldrLi.className = bcFldrLi.className.replace(pthNav.bcFldrClass, pthNav.bcABNFldrClass);                     
                    }

                    // change the id to be a breadcrumb <a> element id
                    bcFldrAnc.id = pthNav.bcAncPrefix + fldrLi.id;

                    // change the href to the folder anchor href
                    bcFldrAnc.href = fldrLi.firstChild.href;

                    // change the breadcrumb anchor to the navigation folder's anchor label
                    bcFldrAnc.firstChild.nodeValue = fldrLi.firstChild.firstChild.nodeValue;

                    // add a breadcrumb click event
                    ptEvent.add(bcFldrAnc,"keydown",pthNav.onKeyPressBC);    
                    ptEvent.add(bcFldrAnc,"click",pthNav.onClickBC);
                    
                    return bcFldrLi;
                };

                // breadcrumb cref structure
                // <li id="pthnavbccref_PT_PTFP_VIEW_GBL" class="pthnavbarcref pthbcdispiblock">
                //   <a href="...">My Feeds</a>
                //   <div class="pthnavcrefimg"> </div>

                // navigation cref structure
                // <li id="crefli_8200" class="pthnavcref">
                //   <a href="...">8200</a>
                //   <div class="pthnavcrefimg"> </div>
                var createCrefBC = function (crefLi) {
                    var bcCrefLi;
                    var bcCrefAnc;

                    
                    if (pthNav.abn.isPortalFldr(crefLi)) {

                        bcCrefLi = pthNav.abn.portalfldrBC.cloneNode(true);
                        bcCrefAnc = bcCrefLi.firstChild;

                        // update the ids
                        bcCrefLi.id = pthNav.bcLiPrefix + crefLi.id;
                        bcCrefAnc.id = pthNav.bcAncPrefix + crefLi.id;

                    } else {

                        bcCrefLi = pthNav.abn.crefBC.cloneNode(true);

                        // change the id to be a breadcrumb <li> element id 
                        bcCrefLi.id = pthNav.bcCrefPrefix + crefLi.id.slice(pthNav.crefLiIdPrefix.length);

                        // get the cref <a> element
                        bcCrefAnc = bcCrefLi.firstChild;
                    } 

                    // change the href to the folder anchor href
                    bcCrefAnc.href = crefLi.firstChild.href;

                    // change the breadcrumb anchor to the navigation folder's anchor label
                    bcCrefAnc.firstChild.nodeValue = crefLi.firstChild.firstChild.nodeValue;

                    // add a breadcrumb cref click event
                    ptEvent.add(bcCrefAnc,"keydown",pthNav.onKeyPressBC);    
                    ptEvent.add(bcCrefAnc,"click",pthNav.onClickCref);
                    
                    
                    
		    if (bcCrefAnc.href.search("dynfid") >= 0)
			bcCrefLi.className = "pthnavbarabnfldr ptabntn ptabnnoclick pthbcdispiblock";
                    
                    
                    return bcCrefLi;
                };
    
                if (isFldrBC) {
                    return createFldrBC(liElem);
                } else {
                    return createCrefBC(liElem);
                }

            };

            // checks if a folder or cref is already in the breadcrumbs by looking at the id
            var isInBC = function (fldrId) {

                if (!fldrId) { return; }

                var bcNode = null;
                for (var i = 0, j = bcLis.length; i < j; i++) {
                    if (fldrId === bcLis[i].id.slice(pthNav.bcLiPrefix.length)) {
                        bcNode = bcLis[i];
                        break;
                    }
                }
                return bcNode;

            };

            // get the parent <li> element
            var navNodeLi = navNodeAnc.parentNode;

            // what did we click in the drop down?
            var isNavFldr = ptUtil.isClassMember(navNodeLi,pthNav.fldrStyle) ? true : false;

            var sepNode;

            // this is the current breadcrumb structure 
            this.bcScrollUl = ptUtil.id(pthNav.bcScrollId);
            bcLis = this.bcScrollUl.getElementsByTagName("li");

            // is the nav object already in the breadcrumbs?
            var bcNode = isInBC(navNodeLi.id);
            if (bcNode) {

                // did the user click a tree folder node?
                if (isNavFldr) {
                    // remove any breadcrumb elements after this one
                    this.bcRemove(bcLis,bcNode.id,true);
                }
            
            } else {

                var bcLi, bcPrntId, bcElems = [];

                // traverse up the nav tree until we are at the breadcrumb
                // level or the folder is already in the breadcrumbs
                // here we build the new breadcrumb structure

                do {

                    // this will eventually be the breadcrumb parent once
                    // we traversed to the top of the navigation
                    bcPrntId = this.bcPrntId(navNodeLi);

                    // create a breadcrumb
                    bcLi = createBC(navNodeLi,isNavFldr);
                    bcElems.unshift(bcLi);

                    // there can only be 1 cref breadcrumb
                    isNavFldr = true;

                    // next create a seperator node
                    sepNode = this.separator.cloneNode(true);
                    sepNode.removeAttribute("id");
                    bcElems.unshift(sepNode);

                    navNodeLi = this.getParent(navNodeLi);

                } while (navNodeLi && !isInBC(navNodeLi.id));

                // remove any other breadcrumb parts after the parent breadcrumb                    
                var i = bcLis.length - 1;
                var isSepNode = bcLis[i].getAttributeNode("id") ? false : true; // separator nodes don't have ids

                
                
                while (isSepNode || bcLis[i].id !== bcPrntId) {

                    // remove the breadcrumb <li>
                    this.bcScrollUl.removeChild(bcLis[i]);

                    i--;
                    if (i < 0) {
                        break;
                    }
                    isSepNode = bcLis[i].getAttributeNode("id") ? false : true;
                }

                // now add the newly created breadcrumb struct to the DOM

                // first, create a doc fragment
                var bcFrag = document.createDocumentFragment();

                // add the new breadcrumb elements
                for (var i = 0; i < bcElems.length; i++) {
                    bcFrag.appendChild(bcElems[i]);
                }
                
                // add the breadcrumb fragment to the breadcrumb <ul>
                this.bcScrollUl.appendChild(bcFrag);
            }

            // need to check if the bc needs to be scrolled or not
            pthNav.bcScroll.check(this.bcScrollUl);

        }, // end bcUpdate

        // search dialog
        search : {
            searchEnabled : true,           
            sForm : null,                   
            prevDOM : null,                 
            prevMEM : [],                   
            allRows : [],                   
            inputs : [],                    
            MAX_RESULTS : 5,                
            titleID : "ptabnsrchtitle",     
            prevPrefix : "ptabnprev_",      
            prevObjNamePrefix : "ptabnpon_",
            promptImg : null,               
            bcPromptClass : "ptabnsrchpromptbc",
            navPromptClass : "ptabnsrchpromptnav",
            promptPrefix : "ptabnsp",       
            srDivPrefix : "ptabnsr_",       
            srTblPrefix : "ptabntbl_",      
            container : null,               
            options : null,                 
            srchAgainId : "ptabnsrchagain",
            srchAgain : null,               
            favs : null,                    
            win : null,                     
            useTextContent : false,         
            xlatClass : "ptabnxlat",        
            isIE7 : browserInfoObj2.isIE && !document.documentMode,
            popup : null,                   
            currResults : null,             
            customSearch : false,           
            sbWidth : 0,                    
            dTblConPrefix : "ptabndd_",
            sKey : "pssrdata",              
            tKey : "pssrt",                 
            dataSplitKey : ";SPLITDATA;",   
            clientPersist : false,          
            prevEnableTitle : "",
            prevDisableTitle : "",
            nextEnableTitle : "",
            nextDisableTitle : "",
            prevHot : "",
            nextHot : "",
            resultDetails : "",
            firstResize : true,             
            firstOpen : true,               
            isAccessible : false,           
            waitDiv : null,
            init : function () {

                
                if (ptNav2Info.rsEnabled === "false") { 
                    this.searchEnabled = false; 
                    return;
                }

                
                if (typeof(window.sessionStorage) !== "undefined") { 
                    this.clientPersist = true;
                }

                if (this.clientPersist) {
                    
                    
                    
                    try {
                        sessionStorage.setItem("rstest","enabled");
                        var test = sessionStorage.getItem("rstest");
                        sessionStorage.removeItem("rstest");
                    } catch (e) { this.searchEnabled = false; }
                
                } else if (ptNav2Info.rsEnabledWS === "false") {
                    this.searchEnabled = false;
                }

                if (!this.searchEnabled) { return; }

                this.favs = ptUtil.id("ptiframatfcontent");
                this.container = ptUtil.id("ptabnrscontainer");
                this.srchAgain = ptUtil.id(this.srchAgainId);
                this.sForm = document.ptabn;
                this.prevDOM = ptUtil.id("ptabnprevresults");
                this.promptImg = ptUtil.id("ptabnsp");
                this.title = ptUtil.id(this.titleID);
                this.popup = ptUtil.id("ptpopup");

                if (typeof(ptIframe) !== "undefined") {
                    this.win = ptIframe;
                } else if (pthNav.isHomepage) {
                    if (typeof(ptIframeHdr) !== "undefined") {
                        this.win = ptIframeHdr;
                    }
                }

				
                if (browserInfoObj2.isIE && this.container && this.container.style.display != "none") {
					this.container.style.display = "none"; 
				}

                if (this.container) {
                    this.options = {
                        title : "Recent Search Results", 
                        focusEl : this.srchAgain,
                        onOpen : this.open,     
                        onClose : this.close,   
                        onResize : this.resize,
                        draggable : true
                    };
                }
    
                
                if (this.srchAgain) {
                    ptEvent.add(this.srchAgain,"click",this.onClickSrchAgain);  
                }

                
                this.useTextContent = this.title.innerText ? false : true;

                this.sbWidth = this.getScrollBarWidth(); 

                this.prevHot = " (Alt+,)";
                this.nextHot = " (Alt+.)";
                this.prevEnableTitle = "Show previous rows" + this.prevHot;
                this.prevDisableTitle = "Show previous rows (inactive button)" + this.prevHot;
                this.nextEnableTitle = "Show next rows" + this.nextHot;
                this.nextDisableTitle = "Show next rows (inactive button)" + this.nextHot;
                this.resultDetails = "%d-%d of %d";
                this.isAccessible = ptNav2Info.accessSelectedTxt !== "" ? true : false; 
            },

            
            
            initSearchFldr : function () {  

                if (!this.searchEnabled) { return; }

                
                var flyout = ptUtil.id(pthNav.flyoutPrefix + "pthnavmrs");
                if (flyout) {
                    flyout.style.display = "none";
                    ptEvent.add(flyout.parentNode, "click", pthNav.doFldrClick);  
                    pthNav.ptIEHoverEvent(flyout.parentNode, pthNav.doCrefHover); 

                    
                    var aElem = flyout.parentNode.getElementsByTagName("a");
                    ptEvent.add(aElem[0],"keydown",pthNav.onKeyPressFAV);
                    ptEvent.add(flyout.parentNode,"keydown",pthNav.doFldrClick);
        
                    
                    
                    
                    
                    if (!pthNav.isHomepage) {
                        if (!this.clientPersist) {

                            var wsSearchDiv = ptUtil.id("ptabnwssr");
                            if (wsSearchDiv) {

                                if (!this.useTextContent) {
                                    this.addResultsToDOM(wsSearchDiv.innerText);
                                } else {
                                    this.addResultsToDOM(wsSearchDiv.textContent);
                                }

                                wsSearchDiv.parentNode.removeChild(wsSearchDiv);
                            }
                            
                            flyout.parentNode.className += " ptabnrs";

                        } else { 
                            this.getData(flyout.parentNode);
                        }
                    } 
                    
                    var waitDiv = ptUtil.id("WAIT_empty");
                    if (waitDiv) {
                        waitDiv.style.top = pthNav.container.offsetTop + pthNav.container.offsetHeight + "px";
                        this.waitDiv = pthNav.container.appendChild(waitDiv.parentNode.removeChild(waitDiv));
                    }
                }
            },

            
            add : function (actionURL,searchResults,customSearch) {

                if (!this.searchEnabled) { return; }

                
                if (!actionURL || !searchResults || !pthNav.portalObjName) { return; }

                
                this.clearForm();

                this.sForm.action = actionURL;
                
				
				if (browserInfoObj2.isIE && this.container && this.container.style.display != "none") {
					this.container.style.display = "none"; 
				}

                
                var srDiv;
                

                
                
                
                
                if (browserInfoObj2.isIE && !document.documentMode) {
                    var div = document.createElement("div");
                    div.innerHTML = searchResults.outerHTML;
                      
                    srDiv = this.sForm.appendChild(div.firstChild);
                } else {
                    srDiv = this.sForm.appendChild(searchResults);
                }
                
                
                var cId = pthNav.portalObjName; 
                srDiv.id = this.srDivPrefix + cId;
				
				var srchType = document.getElementById("ptabnsrchtypeKW");
				var srchMode = document.getElementById("ptabnsrchMode");
				var srchCrit = document.getElementById("ptabnsrchCriteria");
				var srchFilters = document.getElementById("ptabnsrchFilters");
				if (srchType && srchMode && srchCrit && (typeof(srchType) != "undefined") && (typeof(srchMode) != "undefined") && (typeof(srchCrit) != "undefined")) {
					srchType.id = srchType.id + "_" + cId;
					srchMode.id = srchMode.id + "_" + cId;
					srchCrit.id = srchCrit.id + "_" + cId;
				}
				if (srchFilters && (typeof(srchFilters) != "undefined")) srchFilters.id = srchFilters.id + "_" +cId;


            if (!ptUtil.id("ptabndatalist")) 
            {
                listFormat = false;
                
                var hTbl = ptUtil.id("ptabnht");
                if (!hTbl) { return; }
                hTbl.id += "_" + cId;            
                var hColGroup = ptUtil.id("ptabnht_cg");
                hColGroup.id += "_" + cId;       
                hTbl.parentNode.id += "_" + cId; 
                    
                
                var dTbl = ptUtil.id("ptabndt");
                if (!dTbl) { return; }
                dTbl.id += "_" + cId;            
                var dColGroup = ptUtil.id("ptabndt_cg");
                dColGroup.id += "_" + cId;       
                dTbl.parentNode.id += "_" + cId; 

                var divContainer = dTbl.parentNode.parentNode.parentNode.parentNode; 
                if (divContainer) divContainer.style.width = "";
                                
                if (typeof(customSearch) === "undefined" || customSearch === "") {  

					this.customSearch = false;
                    
                    var ths = dTbl.tHead.rows[0].cells;

                    

                    for (var i = 0, j = ths.length; i < j; i++) {
                        dTbl.parentNode.parentNode.appendChild(this.addKey(ths[i]));
                    }

                } else {    

                    this.customSearch = true;

                    var jsData;
                    if (window.JSON) {      
                        try {
                            jsData = JSON.parse(customSearch);  
                        } catch(e) { alert(e); }
                    } else {

                        var validate = function () {
                            return /^\{"ptCustomSearch":\[(?:\{"name":\s*"(?:[^"]|(:?\\"))*?"\s*,\s*"value":\s*"(?:[^"]|(:?\\"))*?"\})??(?:,\s*(?:\{"name":\s*"(?:[^"]|(:?\\"))*?"\s*,\s*"value":\s*"(?:[^"]|(:?\\"))*?"\}))*?\]\}$/.test(customSearch);
                        };

                        if (validate()) {
                            jsData = eval('(' + customSearch + ')');
                        } else {
                            alert("parse error");
                            return;
                        }
                    }

                    for (var i = 0; i < jsData.ptCustomSearch.length; i++) {
                        dTbl.parentNode.parentNode.appendChild(this.addCustomKey(jsData.ptCustomSearch[i]));
                    }
                }
                
                
                var sBar = ptUtil.id("ptabnsbc_");
                if (sBar) {
                    sBar.id += cId;
                    var cNode;
                    for (var i = 0; i < sBar.childNodes.length; i++) {
                        cNode = sBar.childNodes[i];
                        if (typeof(cNode.id) !== "undefined") {
                            cNode.id += cId;
                        }
                    }
                }

                
                if (browserInfoObj2.isIE) {  
                    this.stripe(dTbl,"ptabnroweven");
                }

                this.cloneResults(dTbl);

                
                this.addPrompt();

            }
            
    
            else { 
                
                listFormat = true;
                var dList = ptUtil.id("ptabndatalist");
                if (!dList) { return; }
                dList.id += "_" + cId;           
                dList.parentNode.id += "_" + cId; 
                dList.parentNode.className = "ptabnldivcont";

                /* Custom search is not implemented for list format*/
                if (typeof(customSearch) === "undefined" || customSearch === "") {
                	this.customSearch = false;
                } /*else {    

                    this.customSearch = true;

                    var jsData;
                    if (window.JSON) {      
                        try {
                            jsData = JSON.parse(customSearch);  
                        } catch(e) { alert(e); }
                    } else {

                        var validate = function () {
                            return /^\{"ptCustomSearch":\[(?:\{"name":\s*"(?:[^"]|(:?\\"))*?"\s*,\s*"value":\s*"(?:[^"]|(:?\\"))*?"\})??(?:,\s*(?:\{"name":\s*"(?:[^"]|(:?\\"))*?"\s*,\s*"value":\s*"(?:[^"]|(:?\\"))*?"\}))*?\]\}$/.test(customSearch);
                        };

                        if (validate()) {
                            jsData = eval('(' + customSearch + ')');
                        } else {
                            alert("parse error");
                            return;
                        }
                    }
                        for (var i = 0; i < jsData.ptCustomSearch.length; i++) {
                        dList.parentNode.parentNode.appendChild(this.addCustomKey(jsData.ptCustomSearch[i]));
                    }
                }
                */
            
                
                listLength = dList.childNodes.length;
                var newDiv = document.createElement("div");
                for (var i = 0,  j = 0; i < listLength; i++, j++) {
                    var dNode = dList.childNodes[j];    
                    if (dNode.nodeName == "#text") {
                        dNode.nodeValue = "";
                        dNode.parentNode.removeChild[dNode];
                    }
                    else {
                    cNode = dNode.cloneNode(true);
                    newDiv.appendChild(cNode);
                    }
                }
                dList.innerHTML = newDiv.innerHTML;
            
                
                var sBar = ptUtil.id("ptabnsbc_");
                
                if (sBar) {
                    sBar.id += cId;
                    var cNode;
                    for (var i = 0; i < sBar.childNodes.length; i++) {
                        cNode = sBar.childNodes[i];
                        if (typeof(cNode.id) !== "undefined") {
                            cNode.id += cId;
                            cNode.className = "ptabnhide"; 
                        }
                    }
                    sBar.parentNode.className = "ptabnlsb"; 
                }
                
                
				
				var n = 0;
				var tabIndex = 3 + dList.childNodes.length;	
                for (var i = 0; i < dList.childNodes.length; i++) {
                    for (var j = 0; j < dList.childNodes[i].childNodes.length; j++) {
						if (dList.childNodes[i].childNodes[j].className == "ptabntitle") { 
							var relActDiv = document.createElement("div");
							relActDiv.className = "PTSESRSLTRLTDINFODIV";
							var relActLink = document.createElement("a");
							relActLink.id = "relatedActionsPers" + n; 
							relActLink.title = "Related Actions";
							relActLink.className = "PTSESRSLTRLTDINFO";
							relActLink.innerHTML = '<span class="relactionimg">&nbsp;</span><span class="PTSESRSLTRLTDINFO">&nbsp;Related Actions</span>';
							relActLink.style.textDecoration ="none";
							relActDiv = dList.childNodes[i].childNodes[j].appendChild(relActDiv);
							relActLink = relActDiv.appendChild(relActLink);
							relActLink.style.textAlign="left"; 
							relActDiv.style.textAlign="left"; 
							n += 1;
						}
                        for (var k = 0; k < dList.childNodes[i].childNodes[j].childNodes.length; k++) {
                            if (dList.childNodes[i].childNodes[j].childNodes[k].className == "ptabnurl") {
                                var urlNode = dList.childNodes[i].childNodes[j].childNodes[k];
                                var url = urlNode.innerHTML;
                                url = url.replace(/\&amp;/g,'&'); 
                                var linkNode = dList.childNodes[i].childNodes[j].childNodes[0].childNodes[0]; 
								linkNode.tabIndex = tabIndex + 1;
								relActLink.href = "javascript:getRelatedActions(" + "'"+url+"'" + "," + "'"+relActLink.id+"'" + ");"
								relActLink.tabIndex = tabIndex + 2;
                                linkNode.href = url; 
                                urlNode.parentNode.removeChild(urlNode); 
                            }
                        }
						tabIndex += 1; 
                    }
                }
                
                /*
                
                if (browserInfoObj2.isIE) {  
                    this.stripe(dList,"ptabnlisteven");
                }*/
    
                this.cloneResultsList(dList);
                this.addEvents(dList,this.customSearch); 
                
                this.addPrompt();
            }

            },
            
            handleNextRows : function (s,sr,node) {

                
                var prev = ptUtil.id("ptabnpi_" + s.currResults.objName);
                if (prev && ptUtil.isClassMember(prev,"ptabnprevimgD")) {
                    ptUtil.swapClass(prev,"ptabnprevimgD","ptabnprevimg");
                    prev.title = s.prevEnableTitle;

                    var first = ptUtil.id("ptabnf_" + s.currResults.objName);   
                    if (first) {
                        first.className = "PSSRCHRESULTSHYPERLINK";
                        first.href = "";
                    }
                }

                if (typeof(sr.currMin) === "undefined") {
                    sr.currMin = "1";
                }

                
                var nChunkSize = parseInt(sr.chunkSize);
                var nCurrMin = parseInt(sr.currMin) + nChunkSize;
                var nPageSize = nCurrMin + nChunkSize - 1;

                
                var pageSize;
                if (nPageSize > parseInt(sr.totalResults)) {
                    pageSize = sr.totalResults;
                } else {
                    pageSize = String(nPageSize);
                }

                sr.currMin = String(nCurrMin);

                var srSpan = ptUtil.id("ptabnns_" + sr.objName);
                if (srSpan) {
                    srSpan.firstChild.data = s.resultDetails.format(sr.currMin,pageSize,sr.totalResults);
                }

    
                
                
                if (parseInt(pageSize) === parseInt(sr.totalResults)) {

                    var last = ptUtil.id("ptabnl_" + s.currResults.objName);    
                    if (last) {
                        last.className = "PSSRCHRESULTSHYPERLINKD";
                        last.removeAttribute("href");
                    }

                    ptUtil.swapClass(node,"ptabnnextimg","ptabnnextimgD");
                    node.title = s.nextDisableTitle;
                }
                    
                var viewPage = parseInt(nPageSize / nChunkSize - 1);

                
                var dTbl = ptUtil.id("ptabndt_" + sr.objName);
                if (dTbl) {
                    for (var i = 0; i < dTbl.tBodies.length; i++) {
                        dTbl.tBodies[i].className = "ptabnhide";    
                    }
                    dTbl.tBodies[viewPage].className = "";  
                }

                
                if (browserInfoObj2.isIE && pthNav.IEquirksMode) {
                    s.win.popup.resize();
                }

            },

            handlePrevRows : function (s,sr,node) {

                
                var next = ptUtil.id("ptabnni_" + s.currResults.objName);
                if (next && ptUtil.isClassMember(next,"ptabnnextimgD")) {
                    ptUtil.swapClass(next,"ptabnnextimgD","ptabnnextimg");
                    next.title = s.nextEnableTitle;

                    var last = ptUtil.id("ptabnl_" + s.currResults.objName);    
                    if (last) {
                        last.className = "PSSRCHRESULTSHYPERLINK";
                        last.href = "";
                    }
                }

                if (typeof(sr.currMin) === "undefined") {
                    sr.currMin = "1";
                }

                
                var nChunkSize = parseInt(sr.chunkSize);
                var nCurrMin = parseInt(sr.currMin) - nChunkSize;

                
                if (nCurrMin < 1) { nCurrMin = 1; }

                var nPageSize = nCurrMin + nChunkSize - 1;
                sr.currMin = String(nCurrMin);
                var srSpan = ptUtil.id("ptabnns_" + sr.objName);
                if (srSpan) {
                    srSpan.firstChild.data = s.resultDetails.format(sr.currMin,String(nPageSize),sr.totalResults);
                }

                
                
                if (nCurrMin === 1) {

                    var first = ptUtil.id("ptabnf_" + s.currResults.objName);   
                    if (first) {
                        first.className = "PSSRCHRESULTSHYPERLINKD";
                        first.removeAttribute("href");
                    }

                    ptUtil.swapClass(node,"ptabnprevimg","ptabnprevimgD");
                    node.title = s.prevDisableTitle;
                }

                var viewPage = parseInt(nPageSize / nChunkSize - 1);

                
                var dTbl = ptUtil.id("ptabndt_" + sr.objName);
                if (dTbl) {
                    for (var i = 0; i < dTbl.tBodies.length; i++) {
                        dTbl.tBodies[i].className = "ptabnhide";    
                    }
                    dTbl.tBodies[viewPage].className = "";  
                }

                
                if (browserInfoObj2.isIE && pthNav.IEquirksMode) {
                    s.win.popup.resize();
                }

            },
            
            handlePages : function (s,sr,node,id) {
            
                

                if (typeof(sr.currMin) === "undefined") {
                    sr.currMin = "1";
                }

                
                var nChunkSize = parseInt(sr.chunkSize);
                var nCurrMin = parseInt(sr.currMin) + nChunkSize;
                var nPageSize = nCurrMin + nChunkSize - 1;

                
                var pageSize;
                if (nPageSize > parseInt(sr.totalResults)) {
                    pageSize = sr.totalResults;
                } else {
                    pageSize = String(nPageSize);
                }

                sr.currMin = String(nCurrMin);
                
                
                var dList = ptUtil.id("ptabndatalist_" + sr.objName); 
                var nPages = dList.childNodes.length 
                
                
                var pageId = id.lastIndexOf("_"); 
                pageId = id.substring(pageId);
                pageId = pageId.split("_");
                pageNum = parseInt(pageId[1]); 
                
                pType = id.split("_");
                pType = pType[0]; 
                
            
                currPage = parseInt(pageNum); 

                
                var viewPage = "";
                if (pType == "prev" && currPage != 0) viewPage = currPage - 1;
                else if (pType == "next" && currPage != nPages - 1) viewPage = currPage + 1;
                else if (pType == "prev" || pType == "next") viewPage = currPage; 
                else { 
                    viewPage = pageNum;
                }
                
                
                if (dList) {
                    for (var i = 0; i < dList.childNodes.length; i++) {
                        dList.childNodes[i].className = "ptabnhide";    
                    }
                    dList.childNodes[viewPage].className = "";  
                }
                

                var pageContainer = document.getElementById("ptabnlpgCont_" + s.currResults.objName);
                
                
                
                ellips = ptUtil.getElemsByClass("ptabnellip", pageContainer);
                for (var i = 0; i < ellips.length; i++) {
                    pageContainer.removeChild(ellips[i]);
                }
                
                
                for (i = 1; i <= nPages; i++){
                    pageContainer.childNodes[i-1].className = "ptabnpage";
                }
                
                var prevLink = document.getElementById("ptabnppageid_" + s.currResults.objName);
                var nextLink = document.getElementById("ptabnnpageid_" + s.currResults.objName);
                prevLink.className = "ptabnnppage ptabnppage";
                nextLink.className = "ptabnnppage ptabnnpage";
                
                
                var totPgNumShown = parseInt(7); 
                
                
                
                if (totPgNumShown < nPages) {
                    var p = parseInt(viewPage) + 1; 
                    var n = (totPgNumShown - 2); 
                    var n = (n - 1)/2; 
                    
                    
                    
                    for (i = 2; i < nPages; i++){
                        pageContainer.childNodes[i-1].className = "ptabnphide";
                    }
                    
            
                
                    
                    var ellip1 = document.createElement("span");
                    ellip1.className = "ptabnellip";
                    ellip1.innerHTML = "...";
                    
                    var ellip2 = document.createElement("span");
                    ellip2.className = "ptabnellip";
                    ellip2.innerHTML = "...";
                    
                    if (p-n > 2 && p+n < nPages - 1) {
                        for (var i=p-n; i<=p+n; i++) {
                            pageContainer.childNodes[i-1].className = "ptabnpage";
                        }
                        pageContainer.childNodes[viewPage].className = "ptabnpcurr";
                        
                        pageContainer.insertBefore(ellip1, pageContainer.childNodes[p-n-1]);
                        pageContainer.insertBefore(ellip2, pageContainer.childNodes[p+n+1]); 
                    }
                    else if (p <= 1 + totPgNumShown - 2){ 
                        for (var i=2; i<= 1 + totPgNumShown - 2; i++) { 
                            pageContainer.childNodes[i-1].className = "ptabnpage";
                        }
                        if (viewPage == 0) {
                            prevLink.className = "ptabnnppage ptabnppageD"; 
                        }
                        pageContainer.childNodes[viewPage].className = "ptabnpcurr";
                        pageContainer.insertBefore(ellip1, pageContainer.childNodes[1 + totPgNumShown - 2]); 
                    }
                    else { 
                        for (var i = nPages - (totPgNumShown - 2); i<=nPages - 1; i++) {
                            pageContainer.childNodes[i-1].className = "ptabnpage";
                        }
                        if (viewPage == nPages - 1) {
                            nextLink.className = "ptabnnppage ptabnnpageD"; 
                        }
                        pageContainer.childNodes[viewPage].className = "ptabnpcurr";
                        pageContainer.insertBefore(ellip1, pageContainer.childNodes[nPages - (totPgNumShown - 2) - 1]);
                        
                    }
                }
                else { 
                    if (viewPage == 0) {
                        pageContainer.childNodes[viewPage].className = "ptabnpcurr";
                        prevLink.className = "ptabnnppage ptabnppageD"; 
                    }
                    else if (viewPage == nPages - 1) {
                        pageContainer.childNodes[viewPage].className = "ptabnpcurr";
                        nextLink.className = "ptabnnppage ptabnnpageD"; 
                    }
                    else pageContainer.childNodes[viewPage].className = "ptabnpcurr";
                }

                
                if (browserInfoObj2.isIE && pthNav.IEquirksMode) {
                    s.win.popup.resize();
                }

            },
            
            
            onClickSearchBar : function (e) {

                if (!e.target) { return; }

                if (e.type == "keydown") {
                    var key = (window.event) ? window.event.keyCode: e.keyCode;
                    if (key != const_keyCode.ENTER) { return true; }
                }
                
                var tgtPrefix = "";
                if (typeof(e.target.id) !== "undefined") {
                    tgtPrefix = e.target.id.split("_",1)[0];
                    
                    if (tgtPrefix === "ptabnsbc") { return; }
                }

                var s = pthNav.abn.search;
                var elType = e.target.nodeName.toLowerCase();
                

                var viewAllHandler = function (node) {
                    
                    var tBodies = s.sForm.getElementsByTagName("table")[1].tBodies;

                    if (node.name === "ptabnviewall") {

                        
                        for (var i = 0; i < tBodies.length; i++) {
                            tBodies[i].className = "";
                        }

                        
                        var sib = node.nextSibling;
                        while(sib) {
                            if (sib.nodeName.toLowerCase() === "a" || sib.nodeName.toLowerCase() === "div") {
                                if (sib.className === "PSSRCHRESULTSHYPERLINK") {
                                    sib.className = "PSSRCHRESULTSHYPERLINKD";
                                    sib.removeAttribute("href");
                                } else if (ptUtil.isClassMember(sib,"ptabnprevimg")) {
                                    ptUtil.swapClass(sib,"ptabnprevimg","ptabnprevimgD");
                                    sib.title = s.prevDisableTitle;
                                } else if (ptUtil.isClassMember(sib,"ptabnnextimg")) {
                                    ptUtil.swapClass(sib,"ptabnnextimg","ptabnnextimgD");
                                    sib.title = s.nextDisableTitle;
                                }
                            }
                            sib = sib.nextSibling;  
                        }

                        
                        node.name = "ptabnviewchunk";
                        node.firstChild.style.display = "none";
                        node.lastChild.style.display = "inline";

                        
                        sr.currMin = "1";
                        var srDetails = ptUtil.id("ptabnns_" + s.currResults.objName);
                        if (srDetails) {
                            srDetails.firstChild.data = s.resultDetails.format(sr.currMin,sr.totalResults,sr.totalResults);
                        }

                    } else { 

                        
                        for (var i = tBodies.length - 1; i > 0; i--) {
                            tBodies[i].className = "ptabnhide";
                        }

                        
                        var next = ptUtil.id("ptabnni_" + s.currResults.objName);
                        var last = ptUtil.id("ptabnl_" + s.currResults.objName);    

                        if (next) { 
                            ptUtil.swapClass(next,"ptabnnextimgD","ptabnnextimg");
                            next.title = s.nextEnableTitle;
                        }

                        if (last) { 
                            last.className = "PSSRCHRESULTSHYPERLINK";
                            last.href = "";
                        }

                        node.name = "ptabnviewall";
                        node.lastChild.style.display = "none";
                        node.firstChild.style.display = "inline";

                        
                        sr.currMin = "1";
                        var srDetails = ptUtil.id("ptabnns_" + s.currResults.objName);
                        if (srDetails) {
                            srDetails.firstChild.data = s.resultDetails.format(sr.currMin,sr.chunkSize,sr.totalResults);
                        }
                    }

                    
                    s.win.popup.resize();

                };

                var sr = s.currResults;
                if (typeof(sr.currMin) === "undefined") {
                    sr.currMin = "1";
                }

                
                if (elType === "span") {
                    if (e.target.parentNode.id.split("_",1)[0] === "ptabnva") {
                        viewAllHandler(e.target.parentNode);
                    }
                    return false;
                }

                if (elType === "a") {
                    if (tgtPrefix === "ptabnva") { 
                        viewAllHandler(e.target);
                        return false;
                    } 
                    if (e.target.parentNode.id.split("_",1)[0] === "ptabnlpgCont") { 
                    s.handlePages(s,sr,e.target,e.target.id);
                    }
                    else if (!ptUtil.isClassMember(e.target,"PSSRCHRESULTSHYPERLINKD")){

                        if (tgtPrefix === "ptabnf") {   
    
                            
                            var next = ptUtil.id("ptabnni_" + s.currResults.objName);
                            if (next && ptUtil.isClassMember(next,"ptabnnextimgD")) {
                                ptUtil.swapClass(next,"ptabnnextimgD","ptabnnextimg");
                                next.title = s.nextEnableTitle;

                                var last = ptUtil.id("ptabnl_" + sr.objName);   
                                if (last) {
                                    last.className = "PSSRCHRESULTSHYPERLINK";
                                    last.href = "";
                                    s.srchAgain.focus();
                                }
                            }

                            
                            sr.currMin = "1";
                            var srSpan = ptUtil.id("ptabnns_" + sr.objName);
                            if (srSpan) {
                                srSpan.firstChild.data = s.resultDetails.format(sr.currMin,sr.chunkSize,sr.totalResults);
                            }

                            
                            e.target.className = "PSSRCHRESULTSHYPERLINKD";
                            e.target.removeAttribute("href");

                            var prevImg = ptUtil.id("ptabnpi_" + sr.objName);
                            if (prevImg) {
                                ptUtil.swapClass(prevImg,"ptabnprevimg","ptabnprevimgD");
                                prevImg.title = s.prevDisableTitle;
                            }
                            
                            

                            if (!listFormat) {
                            var dTbl = ptUtil.id("ptabndt_" + sr.objName);
                            if (dTbl) {
                                for (var i = 1; i < dTbl.tBodies.length; i++) {
                                    dTbl.tBodies[i].className = "ptabnhide";    
                                }
                                dTbl.tBodies[0].className = ""; 
                            }
                            }
                            else {                          
                            var dTbl = ptUtil.id("ptabndatalist_" + sr.objName); 
                            if (dTbl) {
                                for (var i = 1; i < dTbl.childNodes.length; i++) {
                                    dTbl.childNodes[i].className = "ptabnhide"; 
                                }
                                dTbl.childNodes[0].className = "";  
                            }
                            }
                            
                            
                            if (browserInfoObj2.isIE && pthNav.IEquirksMode) {
                                s.win.popup.resize();
                            }

                        } else if (tgtPrefix === "ptabnl") {    

                            
                            var prev = ptUtil.id("ptabnpi_" + s.currResults.objName);
                            if (prev && ptUtil.isClassMember(prev,"ptabnprevimgD")) {
                                ptUtil.swapClass(prev,"ptabnprevimgD","ptabnprevimg");
                                prev.title = s.prevEnableTitle;

                                var first = ptUtil.id("ptabnf_" + sr.objName);  
                                if (first) {
                                    first.className = "PSSRCHRESULTSHYPERLINK";
                                    first.href = "";
                                    s.srchAgain.focus();
                                }
                            }

                            
                            var nTotalResults = parseInt(sr.totalResults),
                                nChunkSize = parseInt(sr.chunkSize),
                                modRtn = nTotalResults % nChunkSize;

                            if (modRtn === 0) {
                                sr.currMin = String(nTotalResults - nChunkSize + 1);
                            } else {
                                sr.currMin = String(nTotalResults - modRtn + 1);
                            }

                            var srSpan = ptUtil.id("ptabnns_" + sr.objName);
                            if (srSpan) {
                                srSpan.firstChild.data = s.resultDetails.format(sr.currMin,sr.totalResults,sr.totalResults);
                            }

                            
                            e.target.className = "PSSRCHRESULTSHYPERLINKD";
                            e.target.removeAttribute("href");

                            var nextImg = ptUtil.id("ptabnni_" + sr.objName);
                            if (nextImg) {
                                ptUtil.swapClass(nextImg,"ptabnnextimg","ptabnnextimgD");
                                nextImg.title = s.nextDisableTitle;
                            }

                            
                            if (!listFormat) {
                            var dTbl = ptUtil.id("ptabndt_" + sr.objName);
                            if (dTbl) {
                                for (var i = 0; i < dTbl.tBodies.length - 1; i++) {
                                    dTbl.tBodies[i].className = "ptabnhide";    
                                }
                                dTbl.tBodies[i].className = ""; 
                            }
                            }
                            
                            else {
                            var dTbl = ptUtil.id("ptabndatalist_" + sr.objName); 
                            if (dTbl) {
                                for (var i = 0; i < dTbl.childNodes.length - 1; i++) {
                                    dTbl.childNodes[i].className = "ptabnhide"; 
                                }
                                dTbl.childNodes[i].className = "";  
                            }
                            }
                            
                            
                            if (browserInfoObj2.isIE && pthNav.IEquirksMode) {
                                s.win.popup.resize();
                            }

                        } 
                    }

                } else if (elType === "div") {
                    if (tgtPrefix === "ptabnpi" && !ptUtil.isClassMember(e.target,"ptabnprevimgD")) { 
                        s.handlePrevRows(s,sr,e.target);
                    } else if (tgtPrefix === "ptabnni" && !ptUtil.isClassMember(e.target,"ptabnnextimgD")) { 
                        s.handleNextRows(s,sr,e.target);
                    }
                    else if (tgtPrefix === "ptabnnpageid") {
                        var dList = ptUtil.id("ptabndatalist_" + sr.objName); 
                        
                        var currPage = 0;
                        for (i = 0; i < dList.childNodes.length; i++) {
                            if (dList.childNodes[i].className != "ptabnhide") {
                                s.handlePages(s,sr,e.target,"next_" + i);
                                break;
                            }
                        }
                    } 
                    else if (tgtPrefix === "ptabnppageid") {
                        var dList = ptUtil.id("ptabndatalist_" + sr.objName); 
                        
                        var currPage = 0;
                        for (i = 0; i < dList.childNodes.length; i++) {
                            if (dList.childNodes[i].className != "ptabnhide") {
                                s.handlePages(s,sr,e.target,"prev_" + i);
                                break;
                            }
                        }
                    }                   
                }

                return false;
            },

            
            clearForm : function () {
                if (!this.sForm) return;
                
                var resTbl = this.sForm.getElementsByTagName("table")[1];
                if (!resTbl) {
                    resTbl = this.sForm.getElementsByTagName("ul")[0]; 
                    if (!resTbl){ return };
                }

                
                var n = resTbl.parentNode.parentNode; 

                
                n = n.parentNode.removeChild(n);

                
                
                for (var i = 0; i < this.prevMEM.length; i++) {

                    // previous results container div has no results div
                    if (!this.prevMEM[i].results.firstChild) {
                        // put back the results from the form into the
                        // previous results part of the DOM
                        this.prevMEM[i].results.appendChild(n);
                        break;
                    }
            }
            
    },
            
            
            cloneResults : function (resTbl) {

                
                var clone = resTbl.parentNode.parentNode.cloneNode(true);

                
                var dTbl = clone.getElementsByTagName("table")[1]; 
                this.addEvents(dTbl,this.customSearch); 

                var textArea = document.createElement("textarea");
                textArea.className = "ptabnhide";
                textArea.id = "ptabnconfig_" + pthNav.portalObjName;

                
                var lbl = " ";
                var mru = ptUtil.id(pthNav.mruLiIdPrefix + pthNav.portalObjName);
                var isABNSearch = false;
                var abnParams = "";
                var abnPortalPath = "";
                var abnMRU = ptUtil.id(pthNav.bcAncPrefix + pthNav.portalObjName);
                if (abnMRU && (pthNav.abn.isABNFldr(abnMRU.parentNode) || pthNav.abn.isCref(abnMRU.parentNode))) {
                    isABNSearch = true;
                }

                if (mru && !isABNSearch) {
                    
                    lbl = mru.firstChild.innerText ? mru.firstChild.innerText :
                          mru.firstChild.textContent;
                } else {

                    
                    if (isABNSearch) {
                            var bcAnc = abnMRU;
                            lbl = bcAnc.innerText ? bcAnc.innerText : bcAnc.textContent;

                            
                            var bcScrollUl = ptUtil.id(pthNav.bcScrollId);
                            var last = bcScrollUl.children.length - 1;
                            var currBC = bcScrollUl.children[last];
                            while (!pthNav.abn.isPortalFldr(currBC)) {
                                currBC = bcScrollUl.children[last-=1];
                            }

                            mru = currBC;
                            currBC.className += " ptabnpromptbcsn";

                            
                            var liEl = ptUtil.id(currBC.id.slice(pthNav.bcLiPrefix.length));
                            abnPortalPath = pthNav.abn.getPathParams(liEl);

                            abnParams = bcAnc.href.split("?")[1];
                            this.addABNParams(clone,abnParams);
                    } else {
                        mru = null;
                    }
                }
                if (lbl == null || lbl == " ") {
                 var bcLiEl = ptUtil.id(pthNav.bcCrefPrefix + pthNav.portalObjName); 
                 if (bcLiEl && firstChildValid(bcLiEl).nodeType != 3) {
                  lbl = bcLiEl.childNodes[0].innerHTML;
                 }
                 else { 
                  lbl = "Search Results"; 
                 } 
                }

                dTbl.summary += " " + lbl; 
                var customSearch = this.customSearch ? "1" : "0";   
                var isABN = isABNSearch ? "1" : "0";
    
                textArea.innerHTML = pthNav.portalObjName + ","
                                 + lbl + ","
                                 + ptUtil.getElemsByClass("ptabnchunksize",resTbl.parentNode.parentNode,"span")[0].firstChild.nodeValue + ","
                                 + ptUtil.getElemsByClass("ptabntotal",resTbl.parentNode.parentNode,"span")[0].firstChild.nodeValue + ","
                                 + this.sForm.action + ","
                                 + customSearch + ","
                                 + isABN + ","
                                 + abnParams + ","
                                 + encodeURIComponent(abnPortalPath);
                clone.appendChild(textArea);

                
                var resultsFrag = document.createDocumentFragment();
                resultsFrag.appendChild(clone);
                    
                
                var prevResults = document.createElement("div");
                prevResults.id = this.prevPrefix + pthNav.portalObjName;
                prevResults.className = "ptabnprev";
                prevResults.appendChild(resultsFrag);

                
                this.store(prevResults,mru);

            },

                        
            cloneResultsList : function (resList) {
                
                var clone = resList.parentNode.parentNode.cloneNode(true); 


                var dList = clone.getElementsByTagName("ul")[0]; 
				var tabIndex = 3;
                
                if (dList.childNodes.length > 1) {
                    var prevLink = document.createElement("div");
                    prevLink.className = "ptabnnppage ptabnppageD";
                    prevLink.id = "ptabnppageid_" + pthNav.portalObjName;
					prevLink.tabIndex = 2;
                    var nextLink = document.createElement("div");
                    nextLink.className = "ptabnnppage ptabnnpage";
                    nextLink.id = "ptabnnpageid_" + pthNav.portalObjName;
                    var prevLinkInner = ("&nbsp;"); 
                    var nextLinkInner = ("&nbsp;");
                    prevLink.innerHTML = prevLinkInner;
                    nextLink.innerHTML = nextLinkInner;
                    
                    var nPages = dList.childNodes.length;
                    var pageContainer = document.createElement("span");
                    pageContainer.className = "ptabnlpgc";
                    var pageContId = "ptabnlpgCont_" + pthNav.portalObjName;
                    pageContainer.id = pageContId;
                    var pageSpans = "";
                    for (i = 0; i < nPages; i++) {
                        pageNum = i + 1;
                        pageSpans += ("<a class='ptabnpage' id='ptabnpageid" + pthNav.portalObjName + '_' + i + "'" + " " + "tabindex=" + tabIndex + ">" + pageNum + "</a>"); 
						tabIndex += 1;
                    }
					nextLink.tabIndex = tabIndex;
                    pageContainer.innerHTML = pageSpans;
                    
                    
                    dList.parentNode.parentNode.childNodes[0].childNodes[0].appendChild(prevLink);
                    dList.parentNode.parentNode.childNodes[0].childNodes[0].appendChild(pageContainer);
                    dList.parentNode.parentNode.childNodes[0].childNodes[0].appendChild(nextLink);
                }
                            
                
                this.addEvents(dList,this.customSearch);    
                
                var textArea = document.createElement("textarea");
                textArea.className = "ptabnhide";
                textArea.id = "ptabnconfig_" + pthNav.portalObjName;

                
                var lbl = " ";
                var mru = ptUtil.id(pthNav.mruLiIdPrefix + pthNav.portalObjName);
                var isABNSearch = false;
                var abnParams = "";
                var abnPortalPath = "";
                var abnMRU = ptUtil.id(pthNav.bcAncPrefix + pthNav.portalObjName);
                if (abnMRU && (pthNav.abn.isABNFldr(abnMRU.parentNode) || pthNav.abn.isCref(abnMRU.parentNode))) {
                    isABNSearch = true;
                }

                if (mru && !isABNSearch) {
                    
                    lbl = mru.firstChild.innerText ? mru.firstChild.innerText :
                          mru.firstChild.textContent;
                } else {

                    
                    if (isABNSearch) {
                            var bcAnc = abnMRU;
                            lbl = bcAnc.innerText ? bcAnc.innerText : bcAnc.textContent;

                            
                            var bcScrollUl = ptUtil.id(pthNav.bcScrollId);
                            var last = bcScrollUl.children.length - 1;
                            var currBC = bcScrollUl.children[last];
                            while (!pthNav.abn.isPortalFldr(currBC)) {
                                currBC = bcScrollUl.children[last-=1];
                            }

                            mru = currBC;
                            currBC.className += " ptabnpromptbcsn";

                            
                            var liEl = ptUtil.id(currBC.id.slice(pthNav.bcLiPrefix.length));
                            abnPortalPath = pthNav.abn.getPathParams(liEl);

                            abnParams = bcAnc.href.split("?")[1];
                            this.addABNParams(clone,abnParams);
                    } else {
                        mru = null;
                    }
                }
                if (lbl == null || lbl == " ") { 
                 var bcLiEl = ptUtil.id(pthNav.bcCrefPrefix + pthNav.portalObjName);
                 if (bcLiEl && firstChildValid(bcLiEl).nodeType != 3) {
                  lbl = bcLiEl.childNodes[0].innerHTML;
                 }
                 else { 
                  lbl = "Search Results";
                 } 
                }

                dList.summary += " " + lbl; 
                var customSearch = this.customSearch ? "1" : "0";   
                var isABN = isABNSearch ? "1" : "0";
            
                textArea.innerHTML = pthNav.portalObjName + ","
                                 + lbl + ","
                                 + ptUtil.getElemsByClass("ptabnchunksize",resList.parentNode.parentNode,"span")[0].firstChild.nodeValue + ","
                                 + ptUtil.getElemsByClass("ptabntotal",resList.parentNode.parentNode,"span")[0].firstChild.nodeValue + ","
                                 + this.sForm.action + ","
                                 + customSearch + ","
                                 + isABN + ","
                                 + abnParams + ","
                                 + encodeURIComponent(abnPortalPath);
                clone.appendChild(textArea);
                                
                
                var resultsFrag = document.createDocumentFragment();
                resultsFrag.appendChild(clone);
                    
                
                var prevResults = document.createElement("div");
                prevResults.id = this.prevPrefix + pthNav.portalObjName;
                prevResults.className = "ptabnprev";
                prevResults.appendChild(resultsFrag);

                
                this.store(prevResults,mru);

            },
            
            
            addABNParams : function (resTbl,qs) {

                var q,p,pos,key,val,klc;
                q = qs;
                p = q.split("&");
                for (var i = 0; i < p.length; i++) {
                    pos = p[i].indexOf("=");
                    if (pos > 0) {
                        key = p[i].substring(0,pos);
                        klc = key.toLowerCase();
                        if (klc !== "isfolder" && klc !== "pt_fname" && klc !== "abnnode") {
                            val = p[i].substring(pos+1);
                            resTbl.appendChild(this.addCustomKey({name:key, value:val}));
                        }
                    }
                }
            },

            
            store : function (results,mru) {

                if (this.prevMEM.length !== 0) {

                    
                    var prevResults = ptUtil.getElemsByClass("ptabnprev",this.prevDOM,"div");

                    
                    
                    var resultExists = ptUtil.id(results.id);
                    if (resultExists) {
                        
                        var objName = results.id.slice(this.prevPrefix.length);
                        for (var i = 0; i < this.prevMEM.length; i++) {
                            if (this.prevMEM[i].objName === objName) {
                                this.prevMEM.splice(i,1);
                                break;
                            }
                        }
                        
                        resultExists.parentNode.removeChild(resultExists);

                        
                        
                        if (this.currResults) {
                            this.currResults.firstOpen = true;
                        }

                    } else if (this.prevMEM.length === this.MAX_RESULTS) {
                        this.prevDOM.removeChild(prevResults[this.MAX_RESULTS - 1]);
                        this.prevMEM.pop();
                    }

                    
                    
                    prevResults = ptUtil.getElemsByClass("ptabnprev",this.prevDOM,"div");

                    
                    if (this.prevMEM.length !== 0) {
                        results = this.prevDOM.insertBefore(results,prevResults[0]);
                    } else {
                        results = this.prevDOM.appendChild(results);
                    }
                
                } else { 
                    results = this.prevDOM.appendChild(results);

                    var mrsD = ptUtil.id("pthnavmrsdummy");
                    if (mrsD) { mrsD.parentNode.removeChild(mrsD); }

                    
                    var flyout = ptUtil.id(pthNav.flyoutPrefix + "pthnavmrs");
                    flyout.style.display = "block";
                }

                this.updateInMemList(results); 

                
                this.mrs.update(mru);
                
                if (mru == null) { 
                 var bcLiEl = ptUtil.id(pthNav.bcCrefPrefix + pthNav.portalObjName);
                    if (bcLiEl) {
                     this.mrs.update(bcLiEl);
                    }
                }
                if (!this.clientPersist) {

                    var mrsRoot = ptUtil.id("pthnavmrsroot");
                    if (!mrsRoot) { return; }

                    // serialize the list data
                    
                    var div, clone, list, data;
                    div = document.createElement("div");
                    clone = mrsRoot.cloneNode(true);
                    clone.id = "pthnavmrslist";
                    div.appendChild(clone);
                    list = div.innerHTML;

                    
                    div = document.createElement("div");
                    var clone = this.prevDOM.cloneNode(true);
                    div.appendChild(clone);
                    data = div.innerHTML;

                    this.persistResultsToServer(pthNav.portalObjName,list,data);
                } else {
                    this.persistResultsOnClient();
                }
            },

            updateInMemList : function (results) {

                if (!results) { return; }

                var sr = {};
                var configText = results.firstChild.lastChild; 
                if (configText) {
                    var configList = configText.value.split(",");
                    sr.results = results;
                    sr.objName = configList[0];
                    sr.label =   configList[1];
                    sr.chunkSize = configList[2];
                    sr.totalResults = configList[3];
                    sr.actionURL = configList[4];
                    sr.customSearch = configList[5] === "1" ? true : false;
                    sr.isABN = configList[6] === "1" ? true : false;
                    sr.abnParams = configList[7];
                    sr.abnPortalPath = configList[8];
                }

                
                if (this.prevMEM.length !== 0) {
                    this.prevMEM.unshift(sr);
                } else {
                    this.prevMEM.push(sr);
                }
            },

            addResultsToDOM : function (results) {

                if (!results || !this.prevDOM) { return; }

                
                results = results.split(this.dataSplitKey);
                var sList = results[0];  
                var sData = results[1];  

                
                var par = this.prevDOM.parentNode;
                par.removeChild(this.prevDOM);
                ptUtil.appendNodeFromHTML(par,sData);

                
                this.prevDOM = ptUtil.id("ptabnprevresults");

                
                results = ptUtil.getElemsByClass("ptabnprev",this.prevDOM,"div");

                var tbl;                    
                
                
                for (var i = results.length - 1; i >= 0; i--) {

                    
                    this.updateInMemList(results[i]);

                    
                    
                    tbl = results[i].getElementsByTagName("table")[1];
                    if (!tbl) {
                        tbl = results[i].getElementsByTagName("ul")[0]; 
                    }
                    this.addEvents(tbl,this.prevMEM[0].customSearch);
                }

                
                ptUtil.appendNodeFromHTML(this.container,sList);
                this.mrs.init();

                
                if (!pthNav.isHomepage) {

                    
                    var bcLiEl = ptUtil.id(pthNav.bcCrefPrefix + pthNav.portalObjName);
                    if (bcLiEl) {
                        this.resultsPromptCheck();
                    } 
                }

                var flyout = ptUtil.id(pthNav.flyoutPrefix + "pthnavmrs");
                flyout.style.display = "block";
            },

            
            getResultsFromDOM : function () {

                var mrsRoot = ptUtil.id("pthnavmrsroot");
                if (!mrsRoot || this.prevMEM.length === 0) { return ""; }

                var div, clone, list, data;
                
                
                div = document.createElement("div");
                clone = mrsRoot.cloneNode(true);
                clone.id = "pthnavmrslist";
                div.appendChild(clone);
                list = div.innerHTML;

                
                div = document.createElement("div");
                var clone = this.prevDOM.cloneNode(true);
                div.appendChild(clone);
                data = div.innerHTML;

                return list + this.dataSplitKey + data;
            },

            
            
            persistResultsOnClient : function () {

                if (this.clientPersist) {
                    this.tokenCheck();           
                    sessionStorage.removeItem(this.sKey); 
                    sessionStorage.setItem(this.sKey,this.getResultsFromDOM()); 
                }
            },

            persistResultsToServer : function (objName,list,results) {

                var ajaxURL = document.location.href + "&cmd=setSearch";
                var params = "&pssrkey=" + objName + "&pssrlist=" +
                             encodeURIComponent(list) +
                             "&pssrdata=" + encodeURIComponent(results);    
                var sLoader = new net2.ContentLoader(ajaxURL,null,null,"post",
                              function(){},null,params,
                              "application/x-www-form-urlencoded");
            },

            
            getData : function (fldr) {

                
                if (!ptUtil.isClassMember(fldr,"ptabnrs")) {
                    fldr.className += " ptabnrs";
                } else { return; }

                
                if (this.clientPersist) {
                    this.tokenCheck();
                    this.addResultsToDOM(sessionStorage.getItem(this.sKey));
                } else {    

                    var ajaxURL = document.location.href + "&cmd=getSearch";
                    var sLoader = new net2.ContentLoader(ajaxURL,null,null,"post",
                                  function(){
                                    if (pthNav.checkSignonResponse(this.req.getResponseHeader("RespondingWithSignonPage"))) {
                                        return;
                                    }

                                    
                                    var flyout = ptUtil.id(pthNav.flyoutPrefix + fldr.id);
                                    var blockedEl = fldr.parentNode.parentNode.parentNode;
                                    pthNav.addBlock(fldr,blockedEl,pthNav.loadStyle);

                                    
                                    var respHTML = this.req.responseText;
                                    if (respHTML !== "no results") {
                                        pthNav.abn.search.addResultsToDOM(respHTML);    
                                    }else {
                                        if (pthNav.fldr.openEvent != null) {
                                            
                                            var tWait = pthNav.abn.search.isIE7 ? 100 : 0;
                                            setTimeout(function(){fldr.firstChild.focus();},tWait);
                                            pthNav.fldr.openEvent = null; 
                                        }
                                    }


                                    
                                    pthNav.removeBlock(fldr,blockedEl,pthNav.loadStyle);

                                  },
                                  null,"&pssrdata=pssrdata","application/x-www-form-urlencoded"
                    );
                    sLoader = null;
                }
            },

            
            
            tokenCheck : function () {

                if (!this.clientPersist) { return; }

                var ct = this.getCookieVal("PS_TOKEN");         
                if (sessionStorage.length !== 0) {
                    var st = sessionStorage.getItem(this.tKey); 
                    if (st !== ct) {
                        sessionStorage.clear();
                        sessionStorage.setItem(this.tKey,ct);
                    }           
                } else {
                    
                    if (!pthNav.isHomepage) {   
                        sessionStorage.setItem(this.tKey,ct);
                    }
                }
            },

            
            
            clearData : function (cmd) {

                if (!this.searchEnabled) { return; }

                
                if (this.clientPersist) {
                    try {
                        sessionStorage.clear();
                    } catch (e) {}
                }
                if (typeof(cmd) === "undefined") { return; } 

                
                
                
                
                if (!this.clientPersist && cmd === "sl") {
                    var ajaxURL = document.location.href + "&cmd=clearSearch";
                    var sLoader = new net2.ContentLoader(ajaxURL,null,null,"post",
                                  function(){},null,null,"application/x-www-form-urlencoded");
                    sLoader = null;
                }

                
                var prmpt = ptUtil.id(this.promptPrefix + "_" + pthNav.bcCrefPrefix + pthNav.portalObjName);
                if (prmpt) { prmpt.parentNode.removeChild(prmpt); }
                
                
                var flyout = ptUtil.id(pthNav.flyoutPrefix + "pthnavmrs");
                if (flyout) { flyout.style.display = "none"; }

                
                this.clearForm();   

                
                var n, mrsRoot = ptUtil.id("pthnavmrsroot"); 
                if (mrsRoot) {
                    n = mrsRoot.lastChild;
                    while (n) {
                        n.parentNode.removeChild(n);
                        n = mrsRoot.lastChild;
                    }
                }

                
                this.prevDOM = ptUtil.id("ptabnprevresults");
                if (this.prevDOM) {
                    n = this.prevDOM.lastChild;
                    while (n) {
                        n.parentNode.removeChild(n);
                        n = this.prevDOM.lastChild;
                    }
                }

                
                this.prevMEM = [];
                this.mrs.list = [];
                this.currResults = null;
            },

            
            addPrompt : function () {

                var objName = pthNav.portalObjName;

                
                if (!this.isAccessible) {

                    
                    var bc = ptUtil.id(pthNav.bcCrefPrefix + objName);
                    if (!bc) {
                        bc = ptUtil.id(pthNav.bcLiPrefix + objName); 
                    }
                    this.createPrompt(bc,this.bcPromptClass);
                }
            },

            
            createPrompt : function (liEl,sClass) {

                if (!liEl) { return; }

                var clone = this.promptImg.cloneNode(true);
                clone.id = this.promptImg.id + "_" + liEl.id;
                clone.className += " " + sClass;

                
                ptEvent.add(clone,"click",this.onClickPrompt);

                
                ptEvent.add(clone.firstChild,"click",this.onClickPrompt);
                ptEvent.add(clone.firstChild,"keydown",pthNav.onKeyPressBC);
				var promptExists = false;
				for (var i=0; i < liEl.childNodes.length; i++) {
					if (liEl.childNodes[i].id == this.promptImg.id + "_" + liEl.id) 
					promptExists = true;
				}
                if (!promptExists) {
                 clone.style.zIndex = 2;
                 liEl.appendChild(clone);
                }        
				
				
				var bcList = document.getElementById("pthbcUlScroll");
				var bcChild = "";
				var promptArray = new Array();
				if (bcList && bcList.childNodes.length > 0) {
					for (var i=0; i < bcList.childNodes.length; i++){ 
						bcChild = pthNav.abn.search.getLastChild(bcList.childNodes[i]);
						if (bcChild != null && bcChild.id.indexOf("ptabnsp_") > -1) {
							promptArray.push(bcChild);
						}	
					}
					if (promptArray.length > 1) {
						promptArray[0].parentNode.removeChild(promptArray[0]);
					}

				}
            },

                                
            
            mrs : {
                list : [],
                MAX_MRS: 5,
                mrsLiIdPrefix: "pthnavmrs_",    

                
                
                
                
                init : function () {

                    // abn
                    var mrsUl = ptUtil.id("pthnavmrslist");     
                    var mrsRoot = ptUtil.id("pthnavmrsroot");   
                    if (!mrsUl || !mrsRoot) { return; }
                        
                    
                    mrsUl = mrsUl.parentNode.removeChild(mrsUl);

                    
                    var par = mrsRoot.parentNode;
                    par.removeChild(mrsRoot);
                    mrsUl.id = "pthnavmrsroot";
                    mrsUl = par.appendChild(mrsUl);

                    
                    var i, mrsLis = ptUtil.getElemsByClass("pthnavcref",mrsUl,"li");
                    for (i = 0; i < mrsLis.length; i++) {
                        
                        if (mrsLis[i].getAttributeNode("id")) {
                            this.list.push({objName:mrsLis[i].id.slice(this.mrsLiIdPrefix.length)});
                            ptEvent.add(mrsLis[i],"click",pthNav.abn.search.onClickPrompt);

                            
                            ptEvent.add(mrsLis[i].firstChild,"keydown",pthNav.onKeyPress);

                            pthNav.ptIEHoverEvent(mrsLis[i],pthNav.doCrefHover); 
                        }
                    }
                },

                
                update : function (liEl) {

                    if (!liEl) { return; }

                    
                    var mrs = liEl;
                    var mrsId = pthNav.portalObjName;

                    
                    for (var i = 0; i < this.list.length; i++) {

                        if (mrsId === this.list[i].objName) {
            
                            
                            var m1 = this.list.splice(i,1);
                            this.list.unshift(m1[0]);

                            
                            m1 = ptUtil.id(this.mrsLiIdPrefix + mrsId);
                            m1.parentNode.insertBefore(m1,m1.parentNode.firstChild);
                            return;
                        }
                    }

                    

                    
                    this.list.unshift({objName:mrsId});
                    if (this.list.length > this.MAX_MRS) {
                        this.list.pop();
                    }

                    

                    
                    
                    
                    
                    
                    var clone = ptUtil.id("pthnavmrs_").cloneNode(true);

                    if (pthNav.abn.isABNFldr(liEl)) {
                        clone.className += " ptabntn";
                    }

                    clone.id += this.list[0].objName;

                    
                    
                    var ancEl = ptUtil.getFirstChild(mrs);
                    if (!pthNav.abn.search.useTextContent) {
                        clone.firstChild.innerText = ancEl.innerText;
                    } else {
                        clone.firstChild.textContent = ancEl.textContent;
                    }
                    
                    clone.firstChild.href = ancEl.href;

                    
                    ptEvent.add(clone,"click",pthNav.abn.search.onClickPrompt);
                    ptEvent.add(clone.firstChild,"keydown",pthNav.onKeyPress);

                    var mrsRoot = ptUtil.id("pthnavmrsroot");

                    
                    var mrsNodes = ptUtil.getElemsByClass("pthnavcref",mrsRoot,"li");

                    if (mrsNodes.length !== 0) {
                        mrsRoot.insertBefore(clone,mrsNodes[0]);
                    } else {
                        mrsRoot.appendChild(clone);
                    }
        
                    
                    if (mrsNodes.length === this.MAX_MRS) {
                        mrsRoot.removeChild(mrsNodes[this.MAX_MRS - 1]);
                    }
                }
            }, 

            
            onClickPrompt : function (e) {

                var s = pthNav.abn.search;
                var waitDiv = s.waitDiv; 
                waitDiv.style.zIndex = 10000;
                waitDiv.style.display = "block";

                var self = this;
                setTimeout(function(){
                    pthNav.closeNav(); 

                    
                    var id;
                    if (self.nodeName.toLowerCase() === "li") {
                        id = self.id;   
                    } else if ((self.nodeName.toLowerCase() === "a") && (self.id == "ptabn_SRCHPROMPT")){
                        id = ptUtil.getGrandParent(self).id;  
                    } else {
                        id = self.parentNode.id;
                    }

                    
                    s.updateForm(id);

                    if (typeof(s.win.popup) === "undefined") { 
                        var popup = ptUtil.id("ptifrmpopup");
                        if (popup) {
                            s.win.popup = new ptPopup(popup,s.options);
                        }
                    }
                    s.win.popup.open(s.options);
                    waitDiv.style.display = "none";
                    waitDiv.style.zIndex = "";
                },0);
                return false;
            },

            
            updateForm : function (id) {
                
                
                
                var objName = this.getPromptObjName(id);
                if (this.currResults && objName === this.currResults.objName && 
                    (typeof(this.currResults.firstOpen) !== "undefined" && 
                     !this.currResults.firstOpen)) {
                    return;
                }

                this.clearForm();       

                for (var i = 0; i < this.prevMEM.length; i++) {
                    if (this.prevMEM[i].objName === objName) {

                        
                        
                        this.currResults = this.prevMEM[i];

                        var n = this.prevMEM[i].results.firstChild;
                    
                        
                        
                        n = this.sForm.appendChild(n.parentNode.removeChild(n));

                        
                        this.sForm.action = this.currResults.actionURL;

                        
                        var newLbl;

                        if (!this.isAccessible) {
                            newLbl = this.currResults.label;
                        } else {
                            newLbl = "Recent search results for" + " " + this.currResults.label;
                        }
                        this.title.firstChild.nodeValue = newLbl;
                        break;
                    }
                }
            },

            getPromptObjName : function (id) {

                var objName;

                
                if (id.indexOf(pthNav.crefLiIdPrefix) > -1) {
                    if (id.indexOf(pthNav.favLiIdPrefix) === -1) { 
                        objName = id.slice(pthNav.crefLiIdPrefix.length);
                    } else {                                       
                        objName = id.slice(pthNav.favLiIdPrefix.length);
                    }
                } else if (id.indexOf(pthNav.mruLiIdPrefix) > -1) { 
                    objName = id.slice(pthNav.mruLiIdPrefix.length);
                } else if (id.indexOf(this.mrs.mrsLiIdPrefix) > -1) { 
                    objName = id.slice(this.mrs.mrsLiIdPrefix.length);
                } else if (id.indexOf(pthNav.bcCrefPrefix) > -1) { 
                    objName = id.slice(pthNav.bcCrefPrefix.length); 
                } else if (id.indexOf(pthNav.bcLiPrefix) > -1) { 
                    objName = id.slice(pthNav.bcLiPrefix.length);   
                } else { objName = ""; }
                return objName;
            },


            
            
            resultsPromptCheck : function () {

                if (this.isAccessible) { return; }

                
                
                var mrsId = pthNav.portalObjName;

                
                var list = this.mrs.list;
                for (var i = 0; i < this.mrs.list.length; i++) {
                    if (this.mrs.list[i].objName === mrsId) {

                        var bcLiEl = ptUtil.id(pthNav.bcCrefPrefix + mrsId);

                        if (!bcLiEl) {
                            bcLiEl = ptUtil.id(pthNav.bcLiPrefix + mrsId);  
                            if (!bcLiEl) { return; }

                            bcLiEl.className += " ptabnpromptbcsn";
                        }

                        var clone = this.promptImg.cloneNode(true);
                        clone.id = this.promptImg.id + "_" + bcLiEl.id;
                        clone.className += " " + this.bcPromptClass;

                        
                        ptEvent.add(clone,"click",this.onClickPrompt);

                        
                        ptEvent.add(clone.firstChild,"click",this.onClickPrompt);
                        ptEvent.add(clone.firstChild,"keydown",pthNav.onKeyPressBC);
                        
                        clone.style.zIndex = 2;
                        bcLiEl.appendChild(clone);
                        break;
                    }
                }

            },

            
            
            addKey : function (th) {
                var inp;
                try {
                    
                    inp = document.createElement("<input type='hidden' name='" + th.id + "' />");
                } catch(e) {
                    
                    inp = document.createElement("input");
                    inp.type = "hidden";
                    inp.name = th.id;
                }
    
                
                
                if (ptUtil.isClassMember(th,this.xlatClass)) {
                    inp.className = this.xlatClass;
                }
                return inp;
            },

            addCustomKey : function (th) {
                var inp;
                try {
                    
                    inp = document.createElement("<input type='hidden' name='" + th.name + "' />");
                } catch(e) {
                    
                    inp = document.createElement("input");
                    inp.type = "hidden";
                    inp.name = th.name;
                }
        
                inp.value = th.value;
                return inp;
            },

            
            addEvents : function (node,customSearch) {

                
                if (node.nodeName.toLowerCase() === "table") { 

                    
                    if (!customSearch) {
                        ptEvent.add(node,"click",this.onClickKey);
                    }

                    
                    if (node.tBodies.length > 1) {

                        var searchBar = node.parentNode.parentNode.firstChild.firstChild;
                        if (searchBar) {
                            ptEvent.add(searchBar,"click",this.onClickSearchBar);
                            ptEvent.add(searchBar,"keydown",this.onClickSearchBar); 
                        }
                    }
                } 
                
                else if (node.nodeName.toLowerCase() === "ul") { 
                
                    
                    if (!customSearch) {
                        ptEvent.add(node,"click",this.onClickKey);
                    } 
                    
                    
                    if (node.childNodes.length > 1) {

                        var searchBar = node.parentNode.parentNode.firstChild.firstChild;
                        if (searchBar) {
                            ptEvent.add(searchBar,"click",this.onClickSearchBar);   
                        }
                        
                        var pageBar = document.getElementById("ptabnlpgCont_" + pthNav.portalObjName);
                        if (pageBar) {
                            for (i = 0; i < pageBar.childNodes.length; i++) {
                                ptEvent.add(pageBar.childNodes[i],"click",this.onClickSearchBar);   
                            }
                        }
                        
                        var prevPage = document.getElementById("ptabnppageid_" + pthNav.portalObjName); 
                        if (prevPage) {
                            ptEvent.add(prevPage,"click",this.onClickSearchBar);    
                        }
                        
                        var nextPage = document.getElementById("ptabnnpageid_" + pthNav.portalObjName); 
                        if (nextPage) {
                            ptEvent.add(nextPage,"click",this.onClickSearchBar);    
                        }
                    }
                } 
            }, 

            
            
            
            stripe : function (dTbl,eClass) {

                
                
                
                if (!listFormat) {
                    for (var i = 0, j = dTbl.tBodies.length; i < j; i++) {
                        for (var k = 1, l = dTbl.tBodies[i].rows.length; k < l; k += 2) {
                            dTbl.tBodies[i].rows[k].className = eClass;
                        }
                    }
                }
                else {
                    for (var i = 0, j = dTbl.childNodes.length; i < j; i++) {
                        for (var k = 1, l = dTbl.childNodes[i].childNodes.length; k < l; k += 2) {
                            var listItem = dTbl.childNodes[i].childNodes[k];
                            listItem.className = listItem.className + " " + eClass; 
                        }
                    }
                }
            },

            
            
            onClickKey : function (e) {

        
                
                if ((e.target.nodeName.toLowerCase() !== "a" && e.target.parentNode.className !== "ptabnlist") 
                    || e.target.id.indexOf("relatedActionsPers") >= 0 || e.target.parentNode.id.indexOf("relatedActionsPers") >= 0) 
                    { return; }
				
                var eTarget = e.target;
                if (e.target.nodeName.toLowerCase() !== "a" && e.target.parentNode.nodeName.toLowerCase() == "a") { 
                    eTarget = e.target.parentNode;
                }

                var s = pthNav.abn.search;
                
                if (!listFormat) { 
                    var tr = eTarget.parentNode.parentNode;
                    var tds = tr.cells;

                    var inputs = s.sForm.getElementsByTagName("input");
                    inputs[0].value = s.getLinkVal(tds[0],
                                ptUtil.isClassMember(inputs[0],s.xlatClass));

                    
                    for (var i = 1, j = tds.length; i < j; i++) {

                        
                        if (!ptUtil.isClassMember(tds[i],"ptabnblank")) {
                            
                            if (!ptUtil.isClassMember(inputs[i],s.xlatClass)) {
                                inputs[i].value = tds[i].firstChild.nodeValue;
                            } else {
                                
                                inputs[i].value = !s.useTextContent ?
                                              tds[i].lastChild.innerText :
                                              tds[i].lastChild.textContent;
                            }
                        }
                    }
                }
                if (listFormat) { 
                    var dList = ptUtil.id("ptabndatalist_" + s.currResults.objName);
                    
                    
                    var inputs = s.sForm.getElementsByTagName("input");
                    inputsLen = inputs.length;
                    if (inputs) {
                        for (var i = 0; i < inputsLen; i++) {
                            inputs[0].parentNode.removeChild(inputs[0]); 
                        }   
                    }
                    
                    
                    var url = eTarget.href;
                    var urlDataPos = url.indexOf("?", 0);
                    var urlData = url.substring(urlDataPos + 1); 
                    var urlDataAr = new Array();
                    urlDataAr = urlData.split("&"); 
                    
                    for (var i = 0; i < urlDataAr.length; i++) {
                        var urlDataItem = new Array();
                        urlDataItem = urlDataAr[i].split("="); 
                        var input = document.createElement("input");
                        input.type = "hidden";
                        input.name = urlDataItem[0]; 
                        input.value = urlDataItem[1]; 
                        dList.parentNode.appendChild(input);
                    }
                }
                s.doSubmitABN();
                return false;
            },

            
            doSubmitABN : function (piaName) {

                var s = pthNav.abn.search;

                var submitSearch = function () {
                    pthNav.closeNav();
                    s.win.popup.close(); 

                    
                    if (typeof(piaName) !== "undefined") {
                        s.sForm.ICAction.value = piaName;
                        s.sForm.ICResubmit.value = 0;

                        if (s.currResults.isABN) {

                            var srDiv = ptUtil.id(s.srDivPrefix + s.currResults.objName);
                            if (srDiv) {
                                srDiv.appendChild(s.addCustomKey({name:"pt_fname", value:piaName}));
                                srDiv.appendChild(s.addCustomKey({name:"abnnode", value:piaName}));
                                srDiv.appendChild(s.addCustomKey({name:"PERSABNSRCH", value:1})); 
                            }
                        }
                    }

                    
                    if (typeof(ptIframe) !== "undefined") {
                        try {
							var formName = pthNav.iframe.contentWindow.document.forms[0].name;
                            if (!/empty/.test(formName)) { 
                                var procFunc = pthNav.iframe.contentWindow["processing_" + formName];
                                procFunc.call(procFunc,1,3000);
                            }
                        } catch (ex) {}

                        
                        

                        if (!s.currResults.isABN) {
                            ptNav2Info.selectedId = pthNav.crefLiIdPrefix + s.currResults.objName;

                            var tgt = ptUtil.id(s.mrs.mrsLiIdPrefix + s.currResults.objName);
                            if (tgt) {
                                pthNav.iframeUpdate(s.currResults.actionURL,false,tgt.firstChild);
                            }
                        } else {
                            var tgt = ptUtil.id(s.mrs.mrsLiIdPrefix + s.currResults.objName);
                            s.sForm.action = tgt.firstChild.href + decodeURIComponent(s.currResults.abnPortalPath);
                            s.sForm.target = "_self";
                        }

                        s.sForm.submit();
                    } else {
                        if (pthNav.isHomepage) {
                            ptLoadingStatus_empty(1); 
                            var tgt = ptUtil.id(s.mrs.mrsLiIdPrefix + s.currResults.objName);
                            s.sForm.action = tgt.firstChild.href;

                            if (s.currResults.isABN) { 
                                s.sForm.action += decodeURIComponent(s.currResults.abnPortalPath);
                            }
                            s.sForm.target = "_self";
                            s.sForm.submit();
                        }
                    }
                };

                
                
                if (!pthNav.isHomepage && ptNav2Info.saveWarn === "Y") {
                    ptIframe.saveWarning(s.sForm.action,submitSearch,s.sForm.target,"",function(){s.win.popup.close();});
                } else {
                    submitSearch();
                }

            },

            
            getLinkVal : function (tdEl,usesXlatVal) {

                if (!tdEl) { return ""; }

                var ancLbl;
                if (tdEl.firstElementChild) {

                    if (!usesXlatVal) {
                        ancLbl = tdEl.firstElementChild.firstChild.nodeValue;
                    } else {
                        
                        ancLbl = tdEl.lastElementChild.textContent;
                    }
                } else {

                    if (!usesXlatVal) {
                        ancLbl = tdEl.firstChild.firstChild.nodeValue;
                    
                        
                        var firstElChild = tdEl.firstChild;
                        while(firstElChild && firstElChild.nodeType !== 1 ) {
                            firstElChild = firstElChild.nextSibling;
                        }
                        
                        if (firstElChild) {
                            
                            ancLbl = firstElChild.innerText ? firstElChild.innerText
                                     : firstElChild.textContent;
                        }
                    } else {
                        var xlatSpan = this.getLastChild(tdEl);
                        ancLbl = !pthNav.abn.search.useTextContent ?
                                          xlatSpan.innerText :
                                          xlatSpan.textContent;
                    }
                }
                return ancLbl;
            },

            
            getLastChild : function (node) {

                var lastChild;
                if (node.lastElementChild) {
                    lastChild = node.lastElementChild;
                } else {
                    lastChild = node.lastChild;
                    while (lastChild && lastChild.nodeType !== 1) {
                        lastChild = lastChild.previousSibling;
                    }
                }
                return lastChild;
            },

            

            onClickSrchAgain : function (e) {

                var s = pthNav.abn.search;

                
                if (!s.customSearch) { 
                    var inputs = s.sForm.getElementsByTagName("input");
                    for (var i = 0, j = inputs.length; i < j; i++) {
                        inputs[i].value = "";
                    }
                }

                s.win.popup.close(); 
                pthNav.closeNav();   
				
				var srchType = document.getElementById("ptabnsrchtypeKW_" + s.currResults.objName);
				var srchMode = document.getElementById("ptabnsrchMode_" + s.currResults.objName);
				
				var srchCrit = document.getElementById("ptabnsrchCriteria_" + s.currResults.objName);
				var srchFilters = document.getElementById("ptabnsrchFilters_" + s.currResults.objName);
						
				var nSrchFldIndex = 0;				
				var kw="&ICSesSrchTxt=";
				if (srchType && (typeof(srchType) != "undefined") && (srchType.innerHTML == "Y") && (srchCrit.childNodes.length > 0)) {
					nSrchFldIndex = 1;
					kw = "&ICSesSrchTxt=" + srchCrit.childNodes[0].innerHTML;
				}
						
				var srchCritStr = "";
				if (srchCrit && (typeof(srchCrit) != "undefined") && srchCrit.childNodes.length > nSrchFldIndex) {
					for (var i = nSrchFldIndex; i < srchCrit.childNodes.length; i++) {
								var val = srchCrit.childNodes[i].innerHTML;
								var name1 = srchCrit.childNodes[i].id;
								var startLoc = name1.indexOf("ptabnsrchFld_");
								name1 = name1.substring(startLoc + 13);
								srchCritStr += "&" + name1 + "=" + val;
							}
						}
						
				var srchFilStr = "";
				var srchFilCountEx = 0;
				if (srchFilters && (typeof(srchFilters) != "undefined") && srchFilters.childNodes.length > 0) {
					var srchFilCount = srchFilters.childNodes[0];
					if (srchFilCount && srchFilCount.id == "ptabnsrchFilterCount") {
						srchFilCount = srchFilCount.innerHTML;
						srchFilStr = "&" + "FT_count" + "=" + srchFilCount;
						srchFilCountEx = 1;
					}
					for (var i = srchFilCountEx, n = 0; i < srchFilters.childNodes.length; i++, n++) {
						var val = srchFilters.childNodes[i].innerHTML;
						var name1 = srchFilters.childNodes[i].id;
						
						var startLoc1 = name1.indexOf("ptabnsrchFilterIndex_");
						var startLoc2 = name1.indexOf("ptabnsrchFilter_");
						
						if (startLoc1 > -1) {
							name1 = name1.substring(startLoc1 + 21);
							srchFilStr += "&" + "FT_" + name1 + "=" + val;
						}
						if (startLoc2 > -1) {
							name1 = name1.substring(startLoc2 + 16);
							srchFilStr += "&" + "FT_" + name1 + "=" + val;
						}
					}
				}
				
				
				var srchT = "SRCHTYPEKW=N";
				var srchM = "SRCHMODE=0";
				
				if (srchMode && srchType) {
					srchType = srchType.innerHTML;
					srchMode = srchMode.innerHTML;
					srchT = "SRCHTYPEKW=" + srchType;
					srchM = "SRCHMODE=" + srchMode;
				}
				
				if (typeof(ptIframe) !== "undefined") {

					if (!s.currResults.isABN) {
						
						
						ptNav2Info.selectedId = pthNav.crefLiIdPrefix + s.currResults.objName;
						var tgt = ptUtil.id(s.mrs.mrsLiIdPrefix + s.currResults.objName);
						pthNav.iframeUpdate(s.currResults.actionURL+"?"+srchT+"&"+srchM+kw+srchCritStr+srchFilStr,false,tgt.firstChild);
                    } else {
                        var tgt = ptUtil.id(s.mrs.mrsLiIdPrefix + s.currResults.objName);
                        open(tgt.firstChild.href + decodeURIComponent(s.currResults.abnPortalPath),"_self","");
                    }
                } else {
                    if (pthNav.isHomepage) {
                        if (!s.currResults.isABN) {
                            
                            var tgt = ptUtil.id(s.mrs.mrsLiIdPrefix + s.currResults.objName);
                            if (tgt) {
                                open(tgt.firstChild.href,"_parent","");
                            }
                        } else {
                            var tgt = ptUtil.id(s.mrs.mrsLiIdPrefix + s.currResults.objName);
                            open(tgt.firstChild.href + decodeURIComponent(s.currResults.abnPortalPath),"_parent","");
                        }
                    }
                }
                return false;
            },

            open : function () {

                var s = pthNav.abn.search;
                
                
                if ("ltr" === "rtl" && pthNav.IEquirksMode) {
                    s.sForm.style.display = "block";
                }
                
				
				if (browserInfoObj2.isIE && s.container && s.container.style.display == "none") {
					s.container.style.display = ""; 
				}
                
                
                var dList = ptUtil.id("ptabndatalist_" + s.currResults.objName);
                if (dList) {
                    listFormat = true;
                }
                else listFormat = false;
                
                
                
                if (typeof(s.currResults.firstOpen) === "undefined") {
                    s.currResults.firstOpen = true;
                }

                
                
                if (s.container) {
                    if (s.container.parentNode.id !== "ptpopupcontent") {
                        var popupContent = ptUtil.id("ptpopupcontent");
                        if (popupContent) {
                            s.container = popupContent.insertBefore(s.container,popupContent.firstChild);
                        }
                    }

                    
                    if (s.favs) {
                        s.favs.style.display = "none";
                    }
                   
                    
                    var configText = top.document.getElementById("ptabnconfig_" + s.currResults.objName); 
                    if (configText) {
                        var configList = configText.value.split(",");
                        s.objName = configList[0];
                        s.label =   configList[1];
                        s.chunkSize = configList[2];
                        s.totalResults = configList[3];
                        s.actionURL = configList[4];
                        s.customSearch = configList[5] === "1" ? true : false;
                        s.isABN = configList[6] === "1" ? true : false;
                        s.abnParams = configList[7];
                        s.abnPortalPath = configList[8];
                    }

                    
                    ptEvent.add(document,"keydown",s.doKeyDown);

                    s.isResize = false;

                    
                    
                    if (s.firstOpen) {
                        if (s.isIE7 && !pthNav.IEquirksMode) {
                            bM = parseInt(ptUtil.getCSSValue(s.container,"marginBottom"));
                            bM = isNaN(bM) ? 0 : bM;
                            s.sForm.style.marginBottom = bM + "px";
                        } else {
                            s.sForm.style.margin = "0";
                        }
                    }
                    ptUtil.swapClass(s.container,"ptabnconthide","ptabncontshow");
                    
                

                    if (s.currResults.firstOpen) {

                        
                        var d = ptUtil.winSize();
                        s.currResults.currVPHeight = d.height;
                        s.currResults.currVPWidth = d.width;

                        
                        
                        
                        
                        
                        
                        
                        
                        if (!listFormat) {
                            var dTable = ptUtil.id("ptabndt_" + s.currResults.objName); 
                            if (dTable.tBodies.length > 1) {

                                
                                
                                if (browserInfoObj2.isIE && (s.isIE7 || pthNav.IEquirksMode)) {
                                    var firstAnc = dTable.tBodies[0].getElementsByTagName("a")[0];

									if (firstAnc) {
                                    ptEvent.add(firstAnc,"focus",function(e){
                                        if (!e.target) { return; }

                                        var tBody = this.parentNode.parentNode.parentNode;
                                        if (tBody.className === "ptabnhide") {
                                            var dTbl = tBody.parentNode;
                                            var viewTbody;
                                            for (var i = 0; i < dTbl.tBodies.length; i++) {
                                                if (dTbl.tBodies[i].className !== "ptabnhide") {
                                                    viewTbody = dTbl.tBodies[i];
                                                    break;
                                                }
                                            }
                                            var firstAnc = viewTbody.getElementsByTagName("a")[0];
                                            firstAnc.focus();
                                        }
                                    });
                                }
								}

                                var popHeight = s.win.popup.getPopupHeight();
                                var popWidth = s.win.popup.getPopupWidth();
                                if (pthNav.isSafariOniPad || (popHeight < s.currResults.currVPHeight &&
                                    popWidth < s.currResults.currVPWidth)) {
                                    for (var i = 1; i < dTable.tBodies.length; i++) {
                                        dTable.tBodies[i].className = "ptabnhide";  
                                    }
                                }
                                s.win.popup.resize(); 
                            }
                        }
                        else {
                         var dList = ptUtil.id("ptabndatalist_" + s.currResults.objName); 
                         if (dList.childNodes.length > 1) {
                            var popHeight = s.win.popup.getPopupHeight();
                            var popWidth = s.win.popup.getPopupWidth();
                            if (popHeight < s.currResults.currVPHeight && 
                                popWidth < s.currResults.currVPWidth) {
                                for (var i = 1; i < dList.childNodes.length; i++) {
                                    dList.childNodes[i].className = "ptabnhide";    
                                }
                                s.win.popup.resize(); 
                            }
                        }
                            if (dList.childNodes.length > 1) {
                                var nPages = dList.childNodes.length;
                                var pageContainer = document.getElementById("ptabnlpgCont_" + s.currResults.objName);
                                var totPgNumShown = 7;
                                if (totPgNumShown < nPages) {
                                    for (var i = totPgNumShown; i < nPages; i++){
                                        pageContainer.childNodes[i-1].className = "ptabnphide";
                                    }
                                    var ellip = document.createElement("span");
                                    ellip.className = "ptabnellip";
                                    ellip.innerHTML = "...";
                                    pageContainer.insertBefore(ellip, pageContainer.childNodes[nPages - 1]);
                                }
                                pageContainer.childNodes[0].className = "ptabnpcurr";
                                var prevLink = document.getElementById("ptabnppageid_" + s.currResults.objName);
                                prevLink.className = "ptabnnppage ptabnppageD"; 
                            }
                                
                        }
                    }
                    if (listFormat && !s.currResults.firstOpen) s.win.popup.resize(); 
                }

                if (s.firstOpen) {
                    s.firstOpen = false;
                }
                return false;
            },


            close : function () {

                var s = pthNav.abn.search;

				
                if (browserInfoObj2.isIE && s.container && s.container.style.display != "none") {
					s.container.style.display = "none"; 
				}
                
                if (s.isResize) {

                    var frag = document.createDocumentFragment();
                    var inMemContPar = s.container.parentNode;
                    var inMemCont = inMemContPar.removeChild(s.container);
                    inMemCont = frag.appendChild(inMemCont);
                    ptUtil.swapClass(inMemCont,"ptabncontshow","ptabnconthide");
                    
                    if (!listFormat) {
                        var tables = inMemCont.getElementsByTagName("table");
                        var hTable = tables[0]; 
                        var dTable = tables[1]; 
                        
                        dTable.style.width = "100%"; 
                        dTable.parentNode.style.width = "auto"; 
                        dTable.parentNode.style.height = "auto";
                        dTable.tHead.rows[0].className = "";
                        hTable.parentNode.style.display = "none";
                    }
                    s.container = inMemContPar.insertBefore(inMemCont,inMemContPar.firstChild);
                } else {
                    ptUtil.swapClass(s.container,"ptabncontshow","ptabnconthide");
                }

                
                ptEvent.remove(document,"keydown",s.doKeyDown);

                if (s.favs) { 
                    s.win.popup.setCenter(true);
                    s.favs.style.display = "block";
                }
                
                
                if ("ltr" === "rtl" && pthNav.IEquirksMode) {
                    s.sForm.style.display = "none";
                }
                
                return false;
            },

            
            doKeyDown : function (e) {

                
                
                var s = pthNav.abn.search;
                var tgtId = e.target.id;
                if (tgtId === s.srchAgainId || typeof(e.target.name) !== "undefined") {

                    
                    var keyCode = ptUtil.getKeyCode(e);
                    var isShiftKey = ptUtil.isShiftKey(e);
                    var isAltKey = ptUtil.isAltKey(e);

                    if (keyCode == 9) {             
                        if (!isShiftKey) {

                            if (e.target && typeof(e.target.name) !== "undefined") {
                                
                                if (e.target.name === "ptabnSEARCH_RESULTLAST") {
                                    s.srchAgain.focus();
                                    return false;

                                
                                } else if (e.target.name === "ptabnSEARCH_RESULTSECTIONLAST") {
                                    var viewAll = ptUtil.id("ptabnva_" + s.currResults.objName);
                                    if (viewAll) {
                                        
                                        if (ptUtil.getCSSValue(viewAll.lastChild,"display") === "none") {
                                            s.srchAgain.focus();
                                            return false;
                                        }
                                    }
                                }
                            }
                        } else {   
                            if (tgtId === s.srchAgainId) { 
                                return false;
                            }

                        }
                    } else if (keyCode == 27) {     
                        if (tgtId === s.srchAgainId ||
                            e.target.name.indexOf("ptabn") !== -1) {
                            s.win.popup.close();
                            return false;
                        }

                    } else if (isAltKey) {

                        var sr = s.currResults;
                        if (keyCode === 190) {        

                            var nextImg = ptUtil.id("ptabnni_" + sr.objName);
                            if(!ptUtil.isClassMember(nextImg,"ptabnnextimgD")) {
                                s.handleNextRows(s,sr,nextImg);
                                return false;
                            }
                        } else if (keyCode === 188) { 

                            var prevImg = ptUtil.id("ptabnpi_" + sr.objName);
                            if(!ptUtil.isClassMember(prevImg,"ptabnprevimgD")) {
                                s.handlePrevRows(s,sr,prevImg);
                                return false;
                            }
                        }
                    }
                }   
                return true;
            },

            
            
            
            
            
            resize : function (pWidth,pHeight,sbAction) {

            var s = pthNav.abn.search;
            s.isResize = true;
                
            if (!listFormat) {
            var oId = s.currResults.objName;
                var dTable = ptUtil.id("ptabndt_" + oId); 
                var hTable = ptUtil.id("ptabnht_" + oId); 

                if (typeof(sbAction) !== "undefined") { 

                    
                    
                    if ((dTable.offsetHeight + dTable.parentNode.offsetTop + s.containerBottomOffset) > pHeight) {  
                        if (s.currResults.isVertScroll) { return; } 
                        if (!s.currResults.isHorScroll) {
                            dTable.parentNode.style.width = dTable.parentNode.offsetWidth + s.sbWidth + "px";
                        }
                        dTable.parentNode.style.height = pHeight - s.currResults.dTblTopOff - s.containerBottomOffset + "px";
                        s.currResults.isVertScroll = true;
                    } else {
                        if (!s.currResults.isVertScroll) { return; } 

                        if (!s.currResults.isHorScroll) {
                            dTable.parentNode.style.width = "auto";
                        }
                        dTable.parentNode.style.height = "auto";
                        s.currResults.isVertScroll = false;
                    }   
                    return;
                }

                
                dTable.style.width = "auto";
                hTable.parentNode.style.display = "block";

                var htColGroup = ptUtil.id("ptabnht_cg_" + oId);
                var dtColGroup = ptUtil.id("ptabndt_cg_" + oId);

                
                
                var dCols = dTable.tHead.rows[0].cells;
                var c, colWidth, colWidths = [];

                
                for (var i = 0; i < dCols.length; i++) {
                    
                    if (ptUtil.isClassMember(dCols[i],"ptabnhide")) {
                        colWidths.push("0");
                        continue;
                    }

                    if (browserInfoObj2.isIE && (pthNav.IEquirksMode || s.isIE7)) {

                        
                        
                        c = dCols[i];
                        colWidth = c.offsetWidth - (c.offsetWidth - c.clientWidth) -
                                   parseInt(c.currentStyle.paddingRight) -
                                   parseInt(c.currentStyle.paddingLeft) + "px";

                    } else {
                        colWidth = dCols[i].offsetWidth + "px";
                    }
                    colWidths.push(colWidth);
                }

                
                var sbHeight = 0;
                if (s.container.offsetWidth > pWidth) {
                    s.currResults.isHorScroll = true;
                    sbHeight = s.sbWidth;
                } else {
                    s.currResults.isHorScroll = false;
                }

                
                var sbWidth = 0;
                if ((s.container.offsetHeight + s.container.offsetTop + sbHeight) > pHeight) {
                    s.currResults.isVertScroll = true;
                    sbWidth = s.sbWidth;
                    s.currResults.pNodeWidth = dTable.parentNode.offsetWidth + sbWidth + "px";

                    
                    if (!s.currResults.isHorScroll && ((s.container.offsetWidth + sbWidth) > pWidth)) {
                        s.currResults.isHorScroll = true;
                    }
                } else {
                    s.currResults.isVertScroll = false;
                }

                
                if (s.currResults.firstOpen) {
                    for (var i = 1; i < dTable.tBodies.length; i++) {
                        dTable.tBodies[i].className = "ptabnhide";  
                    }

                    
                    if ((s.container.offsetHeight + s.container.offsetTop + sbHeight) < pHeight) {
                        s.currResults.isVertScroll = false;
                    }

                    
                    if (document.documentElement.getBoundingClientRect) {
                        s.currResults.dTblTopOff = dTable.getBoundingClientRect().top;
                        s.currResults.dTblLeftOff = dTable.getBoundingClientRect().left;
                    } else { 
                        var endId = s.container.offsetParent.offsetParent.id;
                        var curTop = 0;
                        var obj = dTable;
                        if (obj.offsetParent) {
                            while (obj.offsetParent && obj.offsetParent.id !== endId) {
                                curTop += obj.offsetTop;
                                obj = obj.offsetParent;
                            }
                        }
                        s.currResults.dTblTopOff = curTop;
                    }
                }

                
                var frag = document.createDocumentFragment();
                var inMemContPar = s.container.parentNode;
                var inMemCont = inMemContPar.removeChild(s.container);
                var inMemForm = inMemCont.getElementsByTagName("form")[0];
                inMemCont = frag.appendChild(inMemCont);

                var tables = inMemForm.getElementsByTagName("table");
                var dTable = tables[1]; 
                var hTable = tables[0]; 
                var htColGroup = hTable.childNodes[0];
                var dtColGroup = dTable.childNodes[0];

                for (var w = 0; w < colWidths.length; w++) {
                    
                    if (colWidths[w] !== "0") {
                        htColGroup.childNodes[w].style.width = colWidths[w];
                        dtColGroup.childNodes[w].style.width = colWidths[w];
                    }
                }

                
                
                var newTHead = dTable.tHead.cloneNode(true);
                hTable.deleteTHead();
                hTable.appendChild(newTHead);

                
                dTable.tHead.rows[0].className = "ptabndthidetr";
                // dTable.tHead.style.display = "none"; 

                if (s.firstResize) { 
                    s.firstResize = false;

                    
                    var c = inMemCont;
                    var tB, bB, tP, bP, tM, bM;
                    bB = parseInt(ptUtil.getCSSValue(c,"borderBottomWidth"));
                    bP = parseInt(ptUtil.getCSSValue(c,"paddingBottom"));
                    bM = parseInt(ptUtil.getCSSValue(c,"marginBottom"));
                    bB = isNaN(bB) ? 0 : bB;
                    bP = isNaN(bP) ? 0 : bP;
                    bM = isNaN(bM) ? 0 : bM;
                    s.containerBottomOffset = bB + bP + bM;

                    
                    var tB, bB, tP, bP, tM, bM;
                    bR = parseInt(ptUtil.getCSSValue(c,"borderRightWidth"));
                    pR = parseInt(ptUtil.getCSSValue(c,"paddingRight"));
                    mR = parseInt(ptUtil.getCSSValue(c,"marginRight"));
                    bR = isNaN(bR) ? 0 : bR;
                    pR = isNaN(pR) ? 0 : pR;
                    mR = isNaN(mR) ? 0 : mR;
                    s.containerRightOffset = bR + pR + mR;
                }

                
                if (s.currResults.firstOpen) {
                    s.currResults.firstOpen = false;
                    hTable.summary = dTable.summary;
                }

                
				if (s.currResults.isVertScroll && !pthNav.isSafariOniPad) {
                    dTable.parentNode.style.height = pHeight - s.currResults.dTblTopOff - s.containerBottomOffset - sbHeight + "px";
                } else {
                    dTable.parentNode.style.height = "auto";
                }

                var newWidth;                   
                
                if (s.currResults.isHorScroll && !pthNav.isSafariOniPad) {
                    dTable.style.tableLayout = "fixed";
                    hTable.style.tableLayout = "fixed";

                    var newWidth = pWidth - s.currResults.dTblLeftOff - sbWidth - s.containerRightOffset + "px";
                    dTable.style.width = newWidth;
                    hTable.style.width = newWidth;

                    dTable.parentNode.style.width = newWidth;
                    hTable.parentNode.style.width = newWidth;

//                  hTable.parentNode.style.borderRight = "1px solid #CCBBCC";
                } else {

                    hTable.style.tableLayout = "auto";
                    hTable.style.width = "auto";
                    hTable.parentNode.style.width = "auto";

                    dTable.style.tableLayout = "auto";
                    dTable.style.width = "auto";
                    dTable.parentNode.style.width = "auto";

                    if (s.currResults.isVertScroll && !pthNav.isSafariOniPad) {
                        dTable.parentNode.style.width = s.currResults.pNodeWidth;
                    }
                }
                
                
                
                s.container = inMemContPar.insertBefore(inMemCont,inMemContPar.firstChild);
                s.sForm = document.ptabn;

                if (s.currResults.isVertScroll || s.currResults.isHorScroll) {
                    return false;
                } else {
                    return true;
                }
            }
            
            
            else if (listFormat) {
            
                var oId = s.currResults.objName;
                var dList = ptUtil.id("ptabndatalist_" +oId); 
                var currPage = 0;
                
                
                if (typeof(sbAction) !== "undefined") { 

                    
                    
                    if ((dList.offsetHeight + dList.parentNode.offsetTop + s.containerBottomOffset) > pHeight) {  
                        if (s.currResults.isVertScroll) { return; } 
                        if (!s.currResults.isHorScroll) {
                            dList.parentNode.style.width = dList.parentNode.offsetWidth + s.sbWidth + "px";
                        }
                        dList.parentNode.style.height = pHeight - s.currResults.dTblTopOff - s.containerBottomOffset + "px";
                        s.currResults.isVertScroll = true;
                    } else {
                        if (!s.currResults.isVertScroll) { return; } 

                        if (!s.currResults.isHorScroll) {
                            dList.parentNode.style.width = "auto";
                        }
                        dList.parentNode.style.height = "auto";
                        s.currResults.isVertScroll = false;
                    }   
                    return;
                }
            
                    for (var i = 0; i < dList.childNodes.length; i++) {
                            if (dList.childNodes[i].className != "ptabnhide") {
                                currPage = i;
                            }
                            else dList.childNodes[i].className = ""; 
                    }
                
                if (s.currResults.firstOpen) currPage = 0;
                
                dList.style.width = "auto";
                

                dList.parentNode.style.display = "block";
                
                var sbHeight = 0;
                if (s.container.offsetWidth > pWidth) {
                    s.currResults.isHorScroll = true;
                    sbHeight = s.sbWidth;
                } else {
                    s.currResults.isHorScroll = false;
                }

                
                var sbWidth = 0;
                if ((s.container.offsetHeight + s.container.offsetTop + sbHeight) > pHeight) {
                    s.currResults.isVertScroll = true;
                    sbWidth = s.sbWidth;
                    s.currResults.pNodeWidth = dList.parentNode.offsetWidth + sbWidth + "px";

                    
                    if (!s.currResults.isHorScroll && ((s.container.offsetWidth + sbWidth) > pWidth)) {
                        s.currResults.isHorScroll = true;
                    }
                } else {
                    s.currResults.isVertScroll = false;
                }


                    for (var i = 0; i < dList.childNodes.length; i++) {
                        dList.childNodes[i].className = "ptabnhide";    
                    }
                    dList.childNodes[currPage].className = ""; 
                
                
                    if (s.currResults.firstOpen) {
                            
                        
                        if ((s.container.offsetHeight + s.container.offsetTop + sbHeight) < pHeight) {
                            s.currResults.isVertScroll = false;
                        }

                        
                        if (document.documentElement.getBoundingClientRect) {
                            s.currResults.dTblTopOff = dList.getBoundingClientRect().top;
                            s.currResults.dTblLeftOff = dList.getBoundingClientRect().left;
                        } else { 
                            var endId = s.container.offsetParent.offsetParent.id;
                            var curTop = 0;
                            var obj = dList;
                            if (obj.offsetParent) {
                                while (obj.offsetParent && obj.offsetParent.id !== endId) {
                                    curTop += obj.offsetTop;
                                    obj = obj.offsetParent;
                                }
                            }
                            s.currResults.dTblTopOff = curTop;
                            }
                    }

                
                var frag = document.createDocumentFragment();
                var inMemContPar = s.container.parentNode;
                var inMemCont = inMemContPar.removeChild(s.container);
                var inMemForm = inMemCont.getElementsByTagName("form")[0];
                inMemCont = frag.appendChild(inMemCont);
                        
                if (s.firstResize) { 

                    
                    var c = inMemCont;
                    var tB, bB, tP, bP, tM, bM;
                    bB = parseInt(ptUtil.getCSSValue(c,"borderBottomWidth"));
                    bP = parseInt(ptUtil.getCSSValue(c,"paddingBottom"));
                    bM = parseInt(ptUtil.getCSSValue(c,"marginBottom"));
                    bB = isNaN(bB) ? 0 : bB;
                    bP = isNaN(bP) ? 0 : bP;
                    bM = isNaN(bM) ? 0 : bM;
                    s.containerBottomOffset = bB + bP + bM;

                    
                    var tB, bB, tP, bP, tM, bM;
                    bR = parseInt(ptUtil.getCSSValue(c,"borderRightWidth"));
                    pR = parseInt(ptUtil.getCSSValue(c,"paddingRight"));
                    mR = parseInt(ptUtil.getCSSValue(c,"marginRight"));
                    bR = isNaN(bR) ? 0 : bR;
                    pR = isNaN(pR) ? 0 : pR;
                    mR = isNaN(mR) ? 0 : mR;
                    s.containerRightOffset = bR + pR + mR;
                }

                
                if (s.currResults.firstOpen) {
                    s.currResults.firstOpen = false;
                }

                
                if (s.currResults.isVertScroll) {
                    dList.parentNode.style.height = pHeight - s.currResults.dTblTopOff - s.containerBottomOffset - sbHeight + "px";
                } else {
                    dList.parentNode.style.height = "auto";
                }

                var newWidth;                   
                
                if (s.currResults.isHorScroll) {
                    dList.style.tableLayout = "fixed";
                    
                    var newWidth = pWidth - s.currResults.dTblLeftOff - sbWidth - s.containerRightOffset + "px";
                    dList.style.width = newWidth;
                    dList.parentNode.style.width = newWidth;
                } else {
                        dList.parentNode.style.width = s.currResults.pNodeWidth;
                }

                    var divContainer = dList.parentNode.parentNode.parentNode.parentNode;
                    divContainer.style.width = dList.parentNode.style.width
                
                
                
                s.container = inMemContPar.insertBefore(inMemCont,inMemContPar.firstChild);
                s.sForm = document.ptabn;

                if (s.currResults.isVertScroll || s.currResults.isHorScroll) {
                    return false;
                } else {
                    return true;
                }
            }
            },

            getScrollBarWidth : function() {

                var sbWidth = 0;
                var db = document.body;

                if (browserInfoObj2.isIE) {

                    var ta1 = document.createElement("textarea");
                    ta1.cols = "10";
                    ta1.rows = "2";
                    ta1.className = "ptabntatest";

                    var ta2 = ta1.cloneNode();
                    ta2.style.overflow = "hidden";

                    db.appendChild(ta1);
                    db.appendChild(ta2);

                    sbWidth = ta1.offsetWidth - ta2.offsetWidth;

                    db.removeChild(db.lastChild); 
                    db.removeChild(db.lastChild); 

                } else {

                    var oDiv, iDiv, wNoScroll = 0, wScroll = 0;

                    
                    oDiv = document.createElement('div');
                    oDiv.className = "ptabndtest";

                    
                    iDiv = document.createElement("div");
                    iDiv.style.width = "100%";
                    iDiv.style.height = "200px";

                    
                    oDiv.appendChild(iDiv);

                    db.appendChild(oDiv);

                    
                    wNoScroll = iDiv.offsetWidth;

                    
                    oDiv.style.overflow = "auto";

                    
                    wScroll = iDiv.offsetWidth;

                    db.removeChild(db.lastChild);

                    sbWidth = wNoScroll - wScroll;
                }
                return sbWidth;
            },

            getCookieVal : function (cName) {
                
                var s, e, rv = "", ac = document.cookie;
                if (ac.length > 0) {
                    s = ac.indexOf(cName + "=");
                    if (s !== -1) {
                        s += cName.length + 1;   
                        e = ac.indexOf(";",s);
                        if (e === -1) { e = document.cookie.length; }
                        rv = decodeURIComponent(ac.substring(s,e));
                    }
                }
                return rv;
            },

            isRSEnabledOnBC : function (liEl) {
                return liEl && ptUtil.isClassMember(this.getLastChild(liEl),this.bcPromptClass);
            }
        } 
    } 
};

String.prototype.format = function() {
    var i = 0, args = arguments;
    return this.replace(/%d/g, function(m) {
        var value = (i in args) ? args[i] : m;
        i++;
        return value;
    });
};

function keyHandler(keyCode, isAltKey, isCtrlKey) {

    var actualKeyCode = keyCode | 0x40;

    
    if (isCtrlKey && actualKeyCode == 90) {

        
        var subFrame = parent.document.getElementById("SubFrame");
        if (subFrame) {

            
            var noCols = "0,*";         
            if("ltr" === "rtl") {
                noCols = "*,0";
            }

            
            
            
            
            if (subFrame.cols !== noCols) {
//              pthNav.setSearchFocus();
            } else {
            
                var hdrFrame = parent.frames["UniversalHeader"];

                if (hdrFrame && !isCrossDomain(hdrFrame)) {
                    if (hdrFrame.keyHandler) {
                        if (hdrFrame.keyHandler(89, isAltKey, isCtrlKey)) {
//                          pthNav.setSearchFocus();    
                        }
                    }
                }   
            }
        }
    }
    
    return false;
}

function parentKeyHandler(currFrame, keyCode, isAltKey, isCtrlKey) {
    var tgtFrame;
    for (var i = 0; i < parent.frames.length; i++) {

        tgtFrame = parent.frames[i];

        if (tgtFrame.name != "NAV") {
            if (isCrossDomain(tgtFrame))
                continue;
        }

        if (tgtFrame.name != currFrame.name) {
            
            if (tgtFrame.keyHandler) {
                
                if (tgtFrame.keyHandler(keyCode, isAltKey, isCtrlKey)) {
                    return true;
                }
            }
        }
    }
}
ptEvent.load(pthNav.init);

var ptHover = function(element,mouseOverFunc,mouseOutFunc,hoverCfg) {

    if (!element || !mouseOverFunc || !mouseOutFunc) { return };

    
    var cfg = {
        threshold: 7,       
        compareWait: 300,   
        mouseOutWait: 0,    
        isFldr : true
    };

    
    if (hoverCfg) {
        cfg.threshold = hoverCfg.threshold;
        cfg.compareWait = hoverCfg.compareWait;
        cfg.mouseOutWait = hoverCfg.mouseOutWait;
        cfg.isFldr = hoverCfg.isFldr;
    }

    cfg.onMouseOver = mouseOverFunc;
    cfg.onMouseOut = mouseOutFunc;

    
    
    var mouseCurrX, mouseCurrY, mousePrevX, mousePrevY;

    
    var getMousePos = function(e) {
        mouseCurrX = e.pageX;
        mouseCurrY = e.pageY;
    };

    
    var compareMousePos = function(e,hoverEl) {

        hoverEl.hoverTimer = clearTimeout(hoverEl.hoverTimer);

        
        if ((Math.abs(mousePrevX - mouseCurrX) + Math.abs(mousePrevY - mouseCurrY)) < cfg.threshold) {

            ptEvent.remove(hoverEl,"mousemove",getMousePos);

            
            hoverEl.hoverState = true;

            
            return cfg.onMouseOver.apply(hoverEl,[e]);

        } else {
            
            mousePrevX = mouseCurrX; 
            mousePrevY = mouseCurrY;

            
            hoverEl.hoverTimer = setTimeout(function(){compareMousePos(e,hoverEl);},cfg.compareWait);
        }
    };

    var clearMouseOutProps = function(hoverEl) {
        hoverEl.hoverTimer = clearTimeout(hoverEl.hoverTimer);
        hoverEl.hoverState = false;
    };

    
    var mouseOutDelay = function(e,hoverEl) {

        
        
        
        
        if (!cfg.isFldr || pthNav.isOverNav || (pthNav.iframe && 
            !pthNav.isOverIframe) || !pthNav.isNavOpen) {
            clearMouseOutProps(hoverEl);

            
            return cfg.onMouseOut.apply(hoverEl,[e]);
        }
    };

    
    var hoverHandler = function(e) {

        
        var parent = e.relatedTarget;

        while (parent && parent != this) { 
            try { 
                parent = parent.parentNode; 
            } catch(e) { 
                parent = this; 
            }
        }

        if (parent == this) { return false; }

        
        
        var event = {};
        var options;

        for (var name in e) {
            options = e[name];
            if (options != "undefined") {
                event[name] = e[name];
            }
        }

        var hoverEl = this;

        
        if (hoverEl.hoverTimer) { 
            hoverEl.hoverTimer = clearTimeout(hoverEl.hoverTimer);
        }

        
        if (e.type === "mouseover") {

            
            mousePrevX = event.pageX;
            mousePrevY = event.pageY;

            
            ptEvent.add(hoverEl,"mousemove",getMousePos);   

            
            if (!hoverEl.hoverState) { 
                hoverEl.hoverTimer = setTimeout(function(){compareMousePos(event,hoverEl);},cfg.compareWait);
            }

        
        } else {
            ptEvent.remove(hoverEl,"mousemove",getMousePos);    

            
            if (hoverEl.hoverState) { 
                hoverEl.hoverTimer = setTimeout(function(){mouseOutDelay(event,hoverEl);},cfg.mouseOutWait);
            }
        }
    };

    
    if (element.events) {
        if (element.events["mouseout"]) {
            ptEvent.remove(element,"mouseout");
        }
        if (element.events["mouseover"]) {
            ptEvent.remove(element,"mouseover");
        }
    }

    ptEvent.add(element,"mouseover",hoverHandler);
    ptEvent.add(element,"mouseout",hoverHandler);

    
    element.clearMouseOut = function () {
        clearMouseOutProps(element);
    }
}; 

var ptTouch = function(element,touchStartFunc,touchEndFunc,touchCfg) {

    if (!element || !touchStartFunc || !touchEndFunc) { return };

    
    var cfg = {
        touchStartWait: 0,  
        touchEndWait: 0     
    };

    
    if (touchCfg) {
        cfg.compareWait = touchCfg.touchStartWait;
        cfg.touchEndWait = touchCfg.touchEndWait;
    }

    cfg.onTouchStart = touchStartFunc;
    cfg.onTouchEnd = touchEndFunc;

    var touchStart = function(e,touchEl) {

        
        touchEl.touchState = true;

        
        return cfg.onTouchStart.apply(touchEl,[e]);

    };

    var clearTouchEndProps = function(touchEl) {
        touchEl.touchTimer = clearTimeout(touchEl.touchTimer);
        touchEl.touchState = false;
    };

    var tounchEndDelay = function(e,touchEl) {

        
        
        
        
        if (pthNav.isOverNav || (pthNav.iframe && 
            !pthNav.isOverIframe) || !pthNav.isNavOpen) {
            clearTouchEndProps(touchEl);

            
            return cfg.onTouchEnd.apply(touchEl,[e]);
        }
    };

    
    var touchHandler = function(e) {
        
        var parent = e.relatedTarget;

        while (parent && parent != this) { 
            try { 
                parent = parent.parentNode; 
            } catch(e) { 
                parent = this; 
            }
        }

        if (parent == this) { return false; }

        
        
        var event = {};
        var options;

        for (var name in e) {
            options = e[name];
            if (options != "undefined") {
                event[name] = e[name];
            }
        }

        var touchEl = this;

        
        if (touchEl.touchTimer) { 
            touchEl.touchTimer = clearTimeout(touchEl.touchTimer);
        }

        
        if (e.type === "touchstart") {
            
            if (!touchEl.touchState) { 
                touchEl.touchTimer = setTimeout(function(){touchStart(event,touchEl);},cfg.touchStartWait);
            }

        
        } else {

            //ptEvent.remove(touchEl,"touchend",getMousePos);   

            
            if (touchEl.touchState) { 
                touchEl.touchTimer = setTimeout(function(){tounchEndDelay(event,touchEl);},cfg.touchEndWait);
            }
        }
    };

    
    if (element.events) {
        if (element.events["touchstart"]) {
            ptEvent.remove(element,"touchstart");
        }
        if (element.events["touchend"]) {
            ptEvent.remove(element,"touchend");
        }
    }

    ptEvent.add(element,"touchstart", touchHandler);
    ptEvent.add(element,"touchend", touchHandler);

    
    element.clearMouseOut = function () {
        clearTouchEndProps(element);
    }
}; 

var ptScrollable = function (cCfg) {
    
    var cfg = {
        isNav : true,                   
        
        viewStartEl : typeof pthNav !== "undefined" ? pthNav.container : null, 
        container : null,               
        scrollDistance : 36,            
        bottomOffset : 5,               
        sideOffset : 18,                
                                        

        
        showUpBtnStyle    : "pthnavscrollupshow",   
        hideUpBtnStyle    : "pthnavscrollup",   
        showDownBtnStyle  : "pthnavscrolldownshow",
        hideDownBtnStyle  : "pthnavscrolldown",
        
        noBtnImgStyle     : "pthnavnoscrollbtnimg",
        shadowDownStyle   : "pthnavshadowdown",
        scrollFlyoutStyle : "pthnavflyoutscroll" 
    };

    var vs = {
        firstTime : true,
        viewHeight : 0,        
        viewWidth : 0,         
        viewTop : 0,           
        downImgMinHeight : 0,  
        shadowDivInitTop : 0,  
        shadowDivInitLeft : 0, 
        upImgHeight : 0,       
        sInterval : null,      
        IEquirksMode : browserInfoObj2.isIE && document.compatMode != "CSS1Compat", 

        init : function () {

            
            if (cCfg) {
                
                cfg.viewStartEl = cCfg.viewStartEl;
                cfg.showUpBtnStyle = cCfg.showUpBtnStyle; 
                cfg.hideUpBtnStyle = cCfg.hideUpBtnStyle;
                cfg.showDownBtnStyle = cCfg.showDownBtnStyle;
                cfg.hideDownBtnStyle = cCfg.hideDownBtnStyle;
                
                cfg.isNav = (typeof cCfg.isNav === "undefined") ? false : cCfg.isNav;
                cfg.container = (typeof cCfg.container === "undefined") ? null : cCfg.container;
                cfg.scrollDistance = (typeof cCfg.scrollDistance === "undefined") ? 18 : cCfg.scrollDistance;
                cfg.bottomOffset = (typeof cCfg.bottomOffset === "undefined") ? 5 : cCfg.bottomOffset;
                cfg.sideOffset = (typeof cCfg.sideOffset === "undefined") ? 18 : cCfg.sideOffset;
                cfg.noBtnImgStyle = (typeof cCfg.noBtnImgStyle === "undefined") ? "" : cCfg.noBtnImgStyle;
                cfg.shadowDownStyle = (typeof cCfg.shadownDownStyle === "undefined") ? "" : cCfg.shadownDownStyle;
                cfg.scrollFlyoutStyle = (typeof cCfg.scrollFlyoutStyle === "undefined") ? "" : cCfg.scrollFlyoutStyle;
            }

            
            vs.setViewPort();

            
            ptEvent.add(window,"resize",function() { vs.setViewPort(); });
        },

        
        setViewPort : function () {
            this.viewHeight = ptUtil.winSize().height - cfg.bottomOffset;
            this.viewWidth = ptUtil.winSize().width - cfg.sideOffset;
        },

        
        getPos : function (el) {    

            var x = y = 0;  
            var e = el; 
            while (e) {
                x += e.offsetLeft || 0;
                y += e.offsetTop || 0;
                e = e.offsetParent;
            }
            return {x:x, y:y};
        },

        
        configure : function (ulElem,isFldr) {

            if (!ulElem) { return; }

            
            if (this.firstTime) {

                this.firstTime = false;

                
                this.downImgMinHeight = ptUtil.getNextSibling(ulElem.parentNode,
                                        "div",cfg.hideDownBtnStyle).offsetHeight;

                
                
                this.viewTop = this.getPos(cfg.viewStartEl).y + 
                           cfg.viewStartEl.offsetHeight + cfg.bottomOffset;

                if (cfg.isNav) {
                    this.shadowDivInitTop = ulElem.parentNode.parentNode.offsetTop;
                    this.shadowDivInitLeft = ulElem.parentNode.parentNode.offsetLeft;

                    if (isFldr) {
                        
                        this.upImgHeight =  ptUtil.getPrevSibling(
                                            ulElem.parentNode,"div",
                                            cfg.hideUpBtnStyle).offsetHeight;
                    }
                }
            }

            var scroll = false;
            var container;

            
            
            
            if (cfg.isNav) {

                
                container = ulElem.parentNode.parentNode.parentNode;
            } else {

                
                if (!cfg.container) {
                    container = ulElem.parentNode;
                } else {
                    container = cfg.container;
                }
            }
            container.style.top = ""; 
            var yTop, yHeight, downHeight, upHeight = 0;

            
            if (typeof ulElem.sCfg !== "undefined") {
                ulElem.style.position = "relative"; 
                ulElem.style.top = 0;
                ulElem.parentNode.style.overflow = "visible";
                ulElem.parentNode.style.height = "auto";
            }

            if (cfg.isNav && isFldr) {
                yTop = this.getPos(container.parentNode).y;
                yHeight = container.parentNode.offsetHeight;
                downHeight = yTop + yHeight + ulElem.offsetHeight
                                + this.downImgMinHeight + this.shadowDivInitTop;
            } else {
                yTop = this.getPos(ulElem).y;
                downHeight = yTop + ulElem.offsetHeight
                             + this.downImgMinHeight + this.shadowDivInitTop;
            }

            if (downHeight > this.viewHeight) {

                
                
                if (cfg.isNav && isFldr) {
                    upHeight = yTop - yHeight - ulElem.offsetHeight
                               - Math.abs(this.shadowDivInitTop)
                               - this.upImgHeight;

                    if (upHeight < this.viewTop) {
                        scroll = true;
                    }
                
                } else {
                    scroll = true;
                }
            }

            if (!scroll) {

                
                if (ulElem.sCfg) {

                    
                    if (ulElem.sCfg.isScroll) {
                
                        
                        ulElem.sCfg.isScroll = false;
                
                        
                        ulElem.style.position = "relative"; 
                        ulElem.style.top = 0;
                
                        
                        ulElem.parentNode.style.overflow = "visible";
                        ulElem.parentNode.style.height = "auto";

                        if (cfg.isNav && !isFldr) {

                            
                            ulElem.sCfg.container.style.top = "100%";

                            
                            ulElem.sCfg.shadowDiv.style.top = "";
                            ulElem.sCfg.shadowDiv.style.left = "";
                        }
                        
                        
                        ulElem.sCfg.upImg.className = "" + cfg.hideUpBtnStyle;
                        ulElem.sCfg.downImg.className = "" + cfg.hideDownBtnStyle;

                        
                        this.removeAllEvents(ulElem);
                        this.removeAllEvents(ulElem.sCfg.upImg);
                        this.removeAllEvents(ulElem.sCfg.downImg);

                        
                        
                        
                        if (this.IEquirksMode) { 
                            ulElem.parentNode.style.zoom = 1;
                        }

                    
                    } else {

                        if (cfg.isNav ) {

                            if (isFldr) {
                                pthNav.fldr.setPosition(container,yTop,ulElem,
                                                              scroll,upHeight);
                            } else {
                                
                                ulElem.sCfg.container.style.top = "100%";

                                
                                ulElem.sCfg.shadowDiv.style.top = "";
                                ulElem.sCfg.shadowDiv.style.left = "";

                                
                                ulElem.sCfg.downImg.className = "" + cfg.hideDownBtnStyle;
                            }
                        }
                    }

                
                } else {

                    if (cfg.isNav) {

                        if (isFldr) {
                            pthNav.fldr.setPosition(container,yTop,ulElem,
                                                              scroll,upHeight);
                        } else {
                            
                            
                            container.style.top = "100%";

                            
                            ulElem.parentNode.parentNode.style.top = "";
                            ulElem.parentNode.parentNode.style.left = "";

                            
                            var downImg = ptUtil.getNextSibling(ulElem.parentNode,"div","");
                            downImg.className = "" + cfg.hideDownBtnStyle

                        }
                    }
                }
                return; 
            }

            
            
            
            if (!ulElem.sCfg) {

                
                
                
                if (this.IEquirksMode) {
                    ulElem.parentNode.style.zoom = "normal";
                }

                
                ulElem.sCfg = {};
        
                
                
                
                var sibling = ptUtil.getNextSibling(ulElem.parentNode,"div","");
                ulElem.sCfg.downImg = sibling;
                sibling.scrollUl = ulElem;

                
                
                sibling = ptUtil.getPrevSibling(ulElem.parentNode,"div","");
                ulElem.sCfg.upImg = sibling;
                sibling.scrollUl = ulElem;
    
                
                
                this.addEvents(ulElem);
                this.addEvents(ulElem.sCfg.downImg);

                
                if (cfg.isNav) {

                    
                    ulElem.sCfg.shadowDiv = ulElem.parentNode.parentNode;

                    
                    
                    
                    
                    sibling = ptUtil.getPrevSibling(ulElem.parentNode.parentNode,"div",cfg.scrollFlyoutStyle);
                    ulElem.sCfg.scrollFlyout = sibling;

                    
                    ulElem.sCfg.container = container;
                }
            } else {

                
                ulElem.style.top = 0;   
                this.removeAllEvents(ulElem.sCfg.upImg);
                ulElem.sCfg.upImg.className = "" + cfg.hideUpBtnStyle;

                if (cfg.isNav) {

                    ulElem.sCfg.shadowDiv.style.top = "";
                    ulElem.sCfg.shadowDiv.style.left = "";

                    if (!isFldr) {
                        ulElem.sCfg.container.style.top = "100%";
                    }
                }

                
                
                if (!ulElem.sCfg.downImg.events) {
                    this.addEvents(ulElem.sCfg.downImg);
                }

                if (!ulElem.events) {
                    this.addEvents(ulElem);
                }
            }

            ulElem.sCfg.isScroll = true;
            ulElem.sCfg.displayDown = true;

            
            ulElem.style.position = "absolute";
            
            
            ulElem.parentNode.style.overflow = "hidden";

            
            ulElem.sCfg.downImg.className = "" + cfg.showDownBtnStyle;
        
            
            

            if (cfg.isNav) {

                
                ulElem.parentNode.style.height = Math.abs(this.viewHeight
                                             - this.getPos(ulElem.parentNode).y
                                             - ulElem.sCfg.downImg.offsetHeight
                                             - Math.abs(this.shadowDivInitTop)) + "px";

                if (isFldr) {
                    pthNav.fldr.setPosition(container,yTop,ulElem,scroll,
                                            upHeight);
                }
            } else {
                ulElem.parentNode.style.height = Math.abs(this.viewHeight + getYScroll()
                                             - this.getPos(ulElem.parentNode).y
                                             - ulElem.sCfg.downImg.offsetHeight
                                             - Math.abs(this.shadowDivInitTop)) + "px";
            }
        },

        
        addEvents : function (el) {

            var elType = "";
            if (el) { elType = el.nodeName.toLowerCase(); }

            
            if (elType === "div") {
                if (browserInfoObj2.isiPad && browserInfoObj2.isSafari) {
                    
                    ptTouch(el,this.onTouch,this.onTouch, {touchStartWait:0,touchEndWait:0});
                        ptEvent.add(el,"touchstart",function() {
            
                        this.scrollFast = true;

                        
                        
                        if (typeof pthNav !== "undefined") {
                            pthNav.scrollFast = false;
                        }
                        return false;
                    });
                
                    ptEvent.add(el,"touchend",function() {
                        this.scrollFast = false;

                        return false;
                    });
                }
                else
                {
                    
                    ptHover(el,this.onHover,this.onHover,
                        {threshold:7,compareWait:300,mouseOutWait:0,isFldr:false});

                    
                    ptEvent.add(el,"mousedown",function() {
                        this.scrollFast = true;

                        
                        
                        if (typeof pthNav !== "undefined") {
                            pthNav.scrollFast = false;
                        }
                        return false;
                    });
                    ptEvent.add(el,"mouseup",function() {
                        this.scrollFast = false;

                        
                        
                        if (typeof pthNav !== "undefined") {
                            pthNav.scrollFast = true;
                        }
                        return false;
                    });
                }
            
            } else if (elType === "ul") {

                if (!browserInfoObj2.isFF) { 
                    ptEvent.add(el,"mousewheel",this.onMouseWheel);
                } else {
                    ptEvent.add(el,"DOMMouseScroll",this.onMouseWheel);
                }
            }
        },

        
        removeAllEvents : function (el) {
            if (el) { ptEvent.remove(el); }
        },

        
        onHover : function(e) {
    
            if (e.type === "mouseout") {
                if (vs.sInterval) {
                    clearInterval(vs.sInterval);
                    vs.sInterval = null;
                }
                return false;
            }

            
            if (cfg.isNav && pthNav.lastHoveredId !== "") {
                pthNav.fldr.closeAll(this.scrollUl.sCfg.scrollFlyout);
            }

            var self = this;
            setTimeout(function(){vs.doScrollHover(self);},0);
        },

                
        onTouch : function(e) {
    
            if (e.type === "touchend") {
                if (vs.sInterval) {
                    clearInterval(vs.sInterval);
                    vs.sInterval = null;
                }
                return false;
            }

            
            if (cfg.isNav && pthNav.lastHoveredId !== "") {
                pthNav.fldr.closeAll(this.scrollUl.sCfg.scrollFlyout);
            }

            var self = this;
            setTimeout(function(){vs.doScrollHover(self);},0);
        },
        
        
        doScrollHover : function (scrollBtnImg) {

            var scrollBtn = scrollBtnImg;
            var downBtn = ptUtil.isClassMember(scrollBtnImg,cfg.showDownBtnStyle);
            var sUl = scrollBtnImg.scrollUl.sCfg;
            var scrollHeight = parseFloat(ptUtil.getCSSValue(scrollBtnImg.scrollUl.parentNode,"height"));
            var scrollUl = scrollBtnImg.scrollUl;
            var doScroll = function () {

                
                var scrollDistance = cfg.scrollDistance / 4;     
                var newTop;
                var currTop = scrollUl.offsetTop;
                var fast = scrollBtn.scrollFast ? 2 : 1;

                
                if (downBtn) {
                
                    if ((scrollUl.offsetHeight + currTop) > scrollHeight) {
                        newTop = currTop - (scrollDistance * fast);

                        if (!sUl.upImg.events) {
                            vs.addEvents(sUl.upImg);
                            ptUtil.swapClass(sUl.upImg,cfg.hideUpBtnStyle,cfg.showUpBtnStyle);
                        }

                    } else {
                        newTop = scrollHeight - scrollUl.offsetHeight;
                    } 

                } else {
                    if (currTop < 0) {
                        newTop = currTop + (scrollDistance  * fast);

                        if (!sUl.downImg.events) {
                            vs.addEvents(sUl.downImg);
                            sUl.downImg.className = "" + cfg.showDownBtnStyle;
                        }

                    } else {
                        newTop = 0;
                    }
                }

                scrollUl.style.top = newTop + "px";
        
                if (newTop === 0) {
                    
                    ptUtil.swapClass(sUl.upImg,cfg.showUpBtnStyle,cfg.hideUpBtnStyle);      
                    vs.removeAllEvents(sUl.upImg);
                    sUl.upImg.clearMouseOut();
                    sUl.upImg.scrollFast = false;
                    clearInterval(vs.sInterval);
                    vs.sInterval = null;
                } else if ((scrollUl.offsetHeight + newTop) <= scrollHeight) {  

                    
                    
                    
                    if (sUl.displayDown) {
                        sUl.downImg.className = "" + cfg.hideDownBtnStyle;
                    } else {
                        sUl.downImg.className = "" + cfg.noBtnImgStyle;
                    }

                    vs.removeAllEvents(sUl.downImg);
                    sUl.downImg.clearMouseOut();
                    sUl.downImg.scrollFast = false;
                    clearInterval(vs.sInterval);
                    vs.sInterval = null;
                }

            };
            this.sInterval = setInterval(doScroll,50);
        },

        
        onMouseWheel : function (e) {

            
            var delay = 0;
            if (cfg.isNav && pthNav.lastHoveredId !== "") {
                delay = pthNav.fldr.closeAll(this.sCfg.scrollFlyout) * 100;
            }

            var delta;

            
            if (e.wheelDelta) {
                delta = e.wheelDelta/120;
            
            } else {
                delta = -e.detail/3;
            }

            var self = this;
            setTimeout(function(){vs.doMouseWheel(self,delta);},delay);
            return false;
        },

        doMouseWheel : function (ulElem,delta) {

            var scrollUl = ulElem;
            var sUl = ulElem.sCfg;
            var scrollHeight = parseFloat(ptUtil.getCSSValue(scrollUl.parentNode,"height"));

            
            var scrollDistance = cfg.scrollDistance;
            var newTop;
            var currTop = scrollUl.offsetTop;
            var fast = 1;
        
            
            if (delta < 0) {
                if ((scrollUl.offsetHeight + currTop) > scrollHeight) {

                    newTop = currTop - (scrollDistance * fast);

                    if (!sUl.upImg.events) {
                        this.addEvents(sUl.upImg);
                        ptUtil.swapClass(sUl.upImg,cfg.hideUpBtnStyle,cfg.showUpBtnStyle);
                    }

                } else {
                    newTop = scrollHeight - scrollUl.offsetHeight;
                } 

            } else {
                if (currTop < 0) {
                    newTop = currTop + (scrollDistance  * fast);

                    if (!sUl.downImg.events) {
                        this.addEvents(sUl.downImg);
                        sUl.downImg.className = "" + cfg.showDownBtnStyle;
                    }

                } else {
                    newTop = 0;
                }
            }

            scrollUl.style.top = newTop + "px";
            
            
            if (newTop === 0) {
                

                
                
                ptUtil.swapClass(sUl.upImg,cfg.showUpBtnStyle,cfg.hideUpBtnStyle);

                
                
                
                if (sUl.upImg.events) {
                    this.removeAllEvents(sUl.upImg);
                    sUl.upImg.clearMouseOut();
                    sUl.upImg.scrollFast = false;
                }
                clearInterval(this.sInterval);
                this.sInterval = null;

            } else if ((scrollUl.offsetHeight + newTop) <= scrollHeight) {  

                
                
                
                if (sUl.displayDown) {
                    sUl.downImg.className = "" + cfg.hideDownBtnStyle;
                } else {
                    sUl.downImg.className = "" + cfg.noBtnImgStyle;
                }
                this.removeAllEvents(sUl.downImg);

                
                sUl.downImg.clearMouseOut(); 
                sUl.downImg.scrollFast = false;
                clearInterval(this.sInterval);
                this.sInterval = null;
            }
            return false;
        }
    };

    
    this.check = function (ulElem,isFldr) { vs.configure(ulElem,isFldr); }
    this.addEvents = function (el) { vs.addEvents(el); }
    this.removeEvents = function (el) { vs.removeAllEvents(el); }
    this.getPos = function (el) { return vs.getPos(el); }

    
    this.props = function () {
        return { viewHeight : vs.viewHeight,viewWidth : vs.viewWidth,
                viewTop : vs.viewTop,shadowDivInitTop : vs.shadowDivInitTop,
                shadowDivInitLeft : vs.shadowDivInitLeft
               };
    }
    vs.init();
}; 

var ptHScroller = function (cCfg) {
    var cfg = {
        viewStartEl       : null, 
        container         : null,               
        scrollDistance    : 36,                         
        sideOffset        : 18,                
        showPrevBtnStyle  : "pthnavscrollprevshow", 
        hidePrevBtnStyle  : "pthnavscrollprev",     
        showNextBtnStyle  : "pthnavscrollnextshow",
        hideNextBtnStyle  : "pthnavscrollnext",
        initScrollEnd     : true   
    };

    var hs = {
        firstTime : true,      
        viewWidth : 0,                 
        nextImgMinWidth : 14,         
        sInterval : null,      
        IEquirksMode : browserInfoObj2.isIE && document.compatMode != "CSS1Compat", 

        init : function () {            
            if (cCfg) { 
                cfg.viewStartEl = cCfg.viewStartEl;
                cfg.showPrevBtnStyle = cCfg.showPrevBtnStyle; 
                cfg.hidePrevBtnStyle = cCfg.hidePrevBtnStyle;
                cfg.showNextBtnStyle = cCfg.showNextBtnStyle;
                cfg.hideNextBtnStyle = cCfg.hideNextBtnStyle;
                cfg.container = (typeof cCfg.container === "undefined") ? null : cCfg.container;
                cfg.scrollDistance = (typeof cCfg.scrollDistance === "undefined") ? 18 : cCfg.scrollDistance;
                cfg.sideOffset = (typeof cCfg.sideOffset === "undefined") ? 18 : cCfg.sideOffset;
                cfg.initScrollEnd = (typeof cCfg.initScrollEnd === "undefined") ? true : cCfg.initScrollEnd;   
            }

            hs.setViewPort();
            ptEvent.add(window,"resize",function(){hs.setViewPort();});
        },

        setViewPort : function () {
            this.viewWidth = ptUtil.winSize().width - cfg.sideOffset;
        },
        
        getPos : function (el) {    
            var x = y = 0;  
            var e = el; 
            while (e) {
                x += e.offsetLeft || 0;
                y += e.offsetTop || 0;
                e = e.offsetParent;
            }
            return {x:x, y:y};
        },

        configure : function (ulElem) {
            if (!ulElem) { return; }
            
            ulElem.parentNode.style.width = (ptUtil.winSize().width - 300) + "px";
            if (this.firstTime) {
                this.firstTime = false; 
                this.viewLeft = this.getPos(cfg.viewStartEl).x + cfg.viewStartEl.offsetWidth + cfg.sideOffset;
            }

            var scroll = false;
            var container;          

            if (!cfg.container) 
               container = ulElem.parentNode;
            else 
               container = cfg.container;

            var xLeft, xWidth, nextWidth, prevWidth, index = 0;

            xLeft = this.getPos(ulElem).x;
            if ("ltr" === "ltr")
                nextWidth = xLeft + ulElem.offsetWidth + this.nextImgMinWidth;
            else
                nextWidth = ulElem.offsetWidth + this.nextImgMinWidth;  
            
            if (nextWidth > this.viewWidth) 
                scroll = true;

            if (!scroll) {              
                ulElem.parentNode.style.width = (this.viewWidth - xLeft-20) + "px";                 
                return scroll; 
            }
            
            if (this.IEquirksMode)
                ulElem.parentNode.style.zoom = "normal";

            ulElem.sCfg = {};
        
            var sibling = ptUtil.getNextSibling(ulElem.parentNode,"div","");
            ulElem.sCfg.nextImg = sibling;
            sibling.scrollUl = ulElem;
            sibling = ptUtil.getPrevSibling(ulElem.parentNode,"div","");
            ulElem.sCfg.prevImg = sibling;
            sibling.scrollUl = ulElem;
            this.addEvents(ulElem);
            ulElem.sCfg.isScroll = true;
            
            var divScrollWidth = 0;
            if ("ltr" === "ltr")
                divScrollWidth = (this.viewWidth - this.getPos(ulElem.parentNode).x - 20) + 7;
            else {
                var parentOffset = ptUtil.winSize().width - this.getPos(ulElem.parentNode).x - ulElem.parentNode.offsetWidth;
                divScrollWidth = (this.viewWidth - parentOffset - 20) + 7;
            }

            ulElem.parentNode.style.width = divScrollWidth + "px";
            ulElem.sCfg.nextImg.style.left=(divScrollWidth+24)+ "px";
            
            if (!cfg.initScrollEnd){
                ulElem.sCfg.displayNext = true;
                ulElem.sCfg.nextImg.className = "" + cfg.showNextBtnStyle;
                this.addEvents(ulElem.sCfg.nextImg);
            }else {
                ulElem.sCfg.prevImg.className = "" + cfg.showPrevBtnStyle;
                this.addEvents(ulElem.sCfg.prevImg);
                
                
                if ("ltr" === "ltr")
                    ulElem.style.left = ((divScrollWidth) - ulElem.offsetWidth) + "px";
                else
                    ulElem.style.right = "0px";
            }
            return scroll;
            
        },

        
        
        scrollToBeg : function(ulElem){
            var prevBtn = ulElem.sCfg.prevImg;

            ptUtil.swapClass(prevBtn,cfg.showPrevBtnStyle,cfg.hidePrevBtnStyle);        
            hs.removeAllEvents(prevBtn);
            
            if ("ltr" === "rtl")
                ulElem.style.right = Number(0 - (ulElem.firstChild.offsetLeft - ulElem.parentNode.offsetWidth + 20)) + "px";
            else
                ulElem.style.left = "0px";

            var nextBtn = ulElem.sCfg.nextImg;
            if (!nextBtn.events) {
                hs.addEvents(nextBtn);
                nextBtn.className = "" + cfg.showNextBtnStyle;
            }
        },

        
        addEvents : function (el) {
            var elType = "";
            if (el) 
                elType = el.nodeName.toLowerCase();

            if (elType === "div") {
                ptEvent.add(el,"mousedown", this.goScroll);
                ptEvent.add(el,"mouseup",function() {
                    this.scrollFast = false;
                    if (hs.sInterval) {
                        clearInterval(hs.sInterval);
                        hs.sInterval = null;
                    }
                    return false;
                });


            } else if (elType === "ul") {
                if (!browserInfoObj2.isFF) 
                    ptEvent.add(el,"mousewheel",this.onMouseWheel);
                else 
                    ptEvent.add(el,"DOMMouseScroll",this.onMouseWheel);
            }
        },

        removeAllEvents : function (el) {
            if (el) { ptEvent.remove(el); }
        },

        goScroll : function(e) {
            if (pthNav.selectedBC != "") {
                
                var selBCElem = ptUtil.id(pthNav.selectedBC);

                if (pthNav.lastHoveredId !== "")
                    pthNav.fldr.closeAll(selBCElem);

                pthNav.hideBCDropDown(selBCElem);
                pthNav.isNavOpen = false;
                pthNav.selectedBC = "";
            }
            var self = this;
            if ("ltr" === "ltr") 
                setTimeout(function(){hs.doScrolling(self);},0);
            else
                setTimeout(function(){hs.doRTLScrolling(self);},0);
        },

        
        doScrolling : function (scrollBtnImg) {
            var scrollBtn = scrollBtnImg;
            var nextBtn = ptUtil.isClassMember(scrollBtnImg,cfg.showNextBtnStyle);
            var sUl = scrollBtnImg.scrollUl.sCfg;
            
            var scrollWidth = scrollBtnImg.scrollUl.parentNode.offsetWidth; ;
            var scrollUl = scrollBtnImg.scrollUl;
            var scrollDistance = cfg.scrollDistance / 4;     
            var fast = 2;

            var doScroll = function () {
                var currLeft = scrollUl.offsetLeft;
                if (nextBtn) {
                    if ((scrollUl.offsetWidth + currLeft) > scrollWidth) { 
                        newLeft = currLeft - (scrollDistance * fast);
                        if (!sUl.prevImg.events) {
                            hs.addEvents(sUl.prevImg);
                            ptUtil.swapClass(sUl.prevImg,cfg.hidePrevBtnStyle,cfg.showPrevBtnStyle);
                        }
                    } else {
                        newLeft = scrollWidth - scrollUl.offsetWidth;
                    } 
                } else {
                    if (currLeft < 0) {
                        newLeft = currLeft + (scrollDistance  * fast);
                        if (!sUl.nextImg.events) {
                            hs.addEvents(sUl.nextImg);
                            sUl.nextImg.className = "" + cfg.showNextBtnStyle;
                        }
                    } else {
                        newLeft = 0;
                    }
                }
                
                scrollUl.style.left = newLeft + "px";  
                if (newLeft === 0) {
                    ptUtil.swapClass(sUl.prevImg,cfg.showPrevBtnStyle,cfg.hidePrevBtnStyle);        
                    hs.removeAllEvents(sUl.prevImg);
                    sUl.prevImg.scrollFast = false;
                    clearInterval(hs.sInterval);
                    hs.sInterval = null;
                } else if ((scrollUl.offsetWidth + newLeft) <= scrollWidth) {   
                    sUl.nextImg.className = "" + cfg.hideNextBtnStyle;
                    hs.removeAllEvents(sUl.nextImg);
                    sUl.nextImg.scrollFast = false;
                    clearInterval(hs.sInterval);
                    hs.sInterval = null;
                }
            };

            this.sInterval = setInterval(doScroll,50);
        },


        
        doRTLScrolling : function (scrollBtnImg) {
            var scrollBtn = scrollBtnImg;
            var nextBtn = ptUtil.isClassMember(scrollBtnImg,cfg.showNextBtnStyle);
            var sUl = scrollBtnImg.scrollUl.sCfg;
            
            var scrollWidth = scrollBtnImg.scrollUl.parentNode.offsetWidth;
            var scrollUl = scrollBtnImg.scrollUl;
            var initialOffLeft = scrollUl.offsetLeft;
            var scrollDistance = cfg.scrollDistance / 4;     
            
            var fast = 2;
            var size = 0 - (scrollUl.offsetWidth - scrollUl.offsetParent.offsetWidth);

            var doRTLScroll = function () { 
                var currLeft = scrollUl.offsetLeft;
                if (nextBtn) {
                    if ((currLeft + (scrollDistance * fast)) < 0) { 
                        
                        newLeft = currLeft + (scrollDistance * fast);
                        if (!sUl.prevImg.events) {
                            hs.addEvents(sUl.prevImg);
                            ptUtil.swapClass(sUl.prevImg,cfg.hidePrevBtnStyle,cfg.showPrevBtnStyle);
                        }
                    } else {
                        newLeft = 0;
                    } 
                } else {
                    if (currLeft <= 0) {
                        
                        newLeft = currLeft - (scrollDistance  * fast);
                        if (!sUl.nextImg.events) {
                            hs.addEvents(sUl.nextImg);
                            sUl.nextImg.className = "" + cfg.showNextBtnStyle;
                        }
                    } else {
                        newLeft = initialOffLeft;
                    }
                }
                
                scrollUl.style.right = newLeft + "px";
                
                if (newLeft <= size) {
                    
                    ptUtil.swapClass(sUl.prevImg,cfg.showPrevBtnStyle,cfg.hidePrevBtnStyle);        
                    hs.removeAllEvents(sUl.prevImg);
                    sUl.prevImg.scrollFast = false;
                    clearInterval(hs.sInterval);
                    hs.sInterval = null;
                } else if (newLeft >= 0) {
                    
                    sUl.nextImg.className = "" + cfg.hideNextBtnStyle;
                    hs.removeAllEvents(sUl.nextImg);
                    sUl.nextImg.scrollFast = false;
                    clearInterval(hs.sInterval);
                    hs.sInterval = null;
                }
            };

            this.sInterval = setInterval(doRTLScroll,50);
        },

        doRTLMouseWheel : function (ulElem,delta) {
            var scrollUl = ulElem;
            var sUl = ulElem.sCfg;
            var scrollWidth = scrollUl.parentNode.offsetWidth;
            var scrollDistance = cfg.scrollDistance;
            var newLeft;
            var currLeft = scrollUl.offsetLeft;
            var fast = 1;
            var size = 0 - (scrollUl.offsetWidth - scrollUl.offsetParent.offsetWidth);
            if (delta < 0) {
                if (!sUl.nextImg.events) 
                   return;

                if ((currLeft + (scrollDistance * fast)) < 0) { 
                    
                    newLeft = currLeft + (scrollDistance * fast);
                    if (!sUl.prevImg.events) {
                        hs.addEvents(sUl.prevImg);
                        ptUtil.swapClass(sUl.prevImg,cfg.hidePrevBtnStyle,cfg.showPrevBtnStyle);
                    }
                } else {
                    newLeft = 0;
                } 
            } else {
                if (!sUl.prevImg.events) 
                   return;
                if (currLeft <= 0) {
                    
                    newLeft = currLeft - (scrollDistance  * fast);
                    if (!sUl.nextImg.events) {
                        hs.addEvents(sUl.nextImg);
                        sUl.nextImg.className = "" + cfg.showNextBtnStyle;
                    }
                } else {
                    newLeft = initialOffLeft;
                }
            }
            
            scrollUl.style.right = newLeft + "px";
            
            if (newLeft <= size) {
                ptUtil.swapClass(sUl.prevImg,cfg.showPrevBtnStyle,cfg.hidePrevBtnStyle);                
                if (sUl.prevImg.events) {
                    this.removeAllEvents(sUl.prevImg);
                    sUl.prevImg.scrollFast = false;
                }
                clearInterval(this.sInterval);
                this.sInterval = null;
              } else if (newLeft >= 0) {    
                sUl.nextImg.className = "" + cfg.hideNextBtnStyle;
                this.removeAllEvents(sUl.nextImg);
                sUl.nextImg.scrollFast = false;
                clearInterval(this.sInterval);
                this.sInterval = null;
            }

            return false;
        },
        
        onMouseWheel : function (e) {
            var delay = 0;

            if (pthNav.selectedBC != "") {
                
                var selBCElem = ptUtil.id(pthNav.selectedBC);
                if (pthNav.lastHoveredId !== "")
                    pthNav.fldr.closeAll(selBCElem);
                pthNav.hideBCDropDown(selBCElem);
                pthNav.isNavOpen = false;
                pthNav.selectedBC = "";
            }

            var delta;
            if (e.wheelDelta) 
                delta = e.wheelDelta/120;
            else 
                delta = -e.detail/3;
            
            var self = this;
            if ("ltr" === "ltr") 
                setTimeout(function(){hs.doMouseWheel(self,delta);},delay);
            else
                setTimeout(function(){hs.doRTLMouseWheel(self,delta);},delay);
            return false;

        },

        doMouseWheel : function (ulElem,delta) {
            var scrollUl = ulElem;
            var sUl = ulElem.sCfg;
            var scrollWidth = parseFloat(ptUtil.getCSSValue(scrollUl.parentNode,"width"));
            var scrollDistance = cfg.scrollDistance;
            var newLeft;
            var currLeft = scrollUl.offsetLeft;
            var fast = 1;
                  
            if (delta < 0) {
                if (!sUl.nextImg.events) 
                   return;
                if ((scrollUl.offsetWidth + currLeft) > scrollWidth) {  
                    newLeft = currLeft - (scrollDistance * fast);
                    if (!sUl.prevImg.events) {
                        this.addEvents(sUl.prevImg);
                        ptUtil.swapClass(sUl.prevImg,cfg.hidePrevBtnStyle,cfg.showPrevBtnStyle);
                    }
                } else {
                    newLeft = scrollWidth - scrollUl.offsetWidth;
                } 
            } else {
                if (!sUl.prevImg.events) 
                   return;
                if (currLeft < 0) {
                    newLeft = currLeft + (scrollDistance  * fast);
                    if (!sUl.nextImg.events) {
                        this.addEvents(sUl.nextImg);
                        sUl.nextImg.className = "" + cfg.showNextBtnStyle;
                    }
                } else {
                    newLeft = 0;
                }
            }
            
            scrollUl.style.left = newLeft + "px";
            if (newLeft === 0) {
                ptUtil.swapClass(sUl.prevImg,cfg.showPrevBtnStyle,cfg.hidePrevBtnStyle);                
                if (sUl.prevImg.events) {
                    this.removeAllEvents(sUl.prevImg);
                    sUl.prevImg.scrollFast = false;
                }
                clearInterval(this.sInterval);
                this.sInterval = null;

              } else if ((scrollUl.offsetWidth + newLeft) <= scrollWidth) { 
                sUl.nextImg.className = "" + cfg.hideNextBtnStyle;
                this.removeAllEvents(sUl.nextImg);
                sUl.nextImg.scrollFast = false;
                clearInterval(this.sInterval);
                this.sInterval = null;
            }
            return false;
        }
    }; 
    
    this.check = function (ulElem) { return hs.configure(ulElem); }
    this.addEvents = function (el) { hs.addEvents(el); }
    this.removeEvents = function (el) { hs.removeAllEvents(el); }
    this.getPos = function (el) { return hs.getPos(el); }
    this.scrollToBeg  = function (ulElem) { return hs.scrollToBeg(ulElem); }
    hs.init();
}; 
