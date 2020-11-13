(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-edca8624"],{"608c":function(t,e,i){},"8adc":function(t,e,i){},"8f5a":function(t,e,i){},ae8d:function(t,e,i){"use strict";i.r(e),i("b0c0");var s=i("ca6b").getLogger("Card.vue"),n=i("7463"),r={name:"Card",props:{item:{type:Object,required:!0}},data:function(){return{chipSelectionIndex:null}},computed:{isValidCard:function(){var t=!1;return this.item.teneoResponse&&n.wrap(this.item.teneoResponse).hasParameter("displayCard")&&(t=!0),t},config:function(){var t=n.wrap(this.item.teneoResponse).getParameter("displayCard");return s.debug("Card JSON",t),t}},methods:{actionClicked:function(t){var e="",i="";if(null!==this.chipSelectionIndex){var n=this.config.chips[this.chipSelectionIndex];e=n.name,i="&".concat(n.params)}else e=t.name;i+="&".concat(t.params),this.$store.commit("SHOW_PROGRESS_BAR"),this.$store.commit("SET_USER_INPUT",e),this.$store.dispatch("sendUserInput",i+"&isClick=true").then((function(){s.debug("Card info sent to Teneo")}))}}},c=i("2877"),a=i("6544"),o=i.n(a),l=i("8336"),h=i("b0af"),u=i("99d9"),f=i("cc20"),p=i("5530"),d=(i("8f5a"),i("99af"),i("caad"),i("fb6a"),i("608c"),i("9d26")),v=i("0789"),g=i("604c"),m=i("e4cd"),b=i("dc22"),w=i("c3f0"),C=i("58df"),x=Object(C.a)(g.a,m.a).extend({name:"base-slide-group",directives:{Resize:b.a,Touch:w.a},props:{activeClass:{type:String,default:"v-slide-item--active"},centerActive:Boolean,nextIcon:{type:String,default:"$next"},prevIcon:{type:String,default:"$prev"},showArrows:{type:[Boolean,String],validator:function(t){return"boolean"==typeof t||["always","desktop","mobile"].includes(t)}}},data:function(){return{internalItemsLength:0,isOverflowing:!1,resizeTimeout:0,startX:0,scrollOffset:0,widths:{content:0,wrapper:0}}},computed:{__cachedNext:function(){return this.genTransition("next")},__cachedPrev:function(){return this.genTransition("prev")},classes:function(){return Object(p.a)(Object(p.a)({},g.a.options.computed.classes.call(this)),{},{"v-slide-group":!0,"v-slide-group--has-affixes":this.hasAffixes,"v-slide-group--is-overflowing":this.isOverflowing})},hasAffixes:function(){switch(this.showArrows){case"always":return!0;case"desktop":return!this.isMobile;case!0:return this.isOverflowing;case"mobile":return this.isMobile||this.isOverflowing;default:return!this.isMobile&&this.isOverflowing}},hasNext:function(){if(!this.hasAffixes)return!1;var t=this.widths,e=t.content,i=t.wrapper;return e>Math.abs(this.scrollOffset)+i},hasPrev:function(){return this.hasAffixes&&0!==this.scrollOffset}},watch:{internalValue:"setWidths",isOverflowing:"setWidths",scrollOffset:function(t){this.$refs.content.style.transform="translateX(".concat(-t,"px)")}},beforeUpdate:function(){this.internalItemsLength=(this.$children||[]).length},updated:function(){this.internalItemsLength!==(this.$children||[]).length&&this.setWidths()},methods:{genNext:function(){var t=this,e=this.$scopedSlots.next?this.$scopedSlots.next({}):this.$slots.next||this.__cachedNext;return this.$createElement("div",{staticClass:"v-slide-group__next",class:{"v-slide-group__next--disabled":!this.hasNext},on:{click:function(){return t.onAffixClick("next")}},key:"next"},[e])},genContent:function(){return this.$createElement("div",{staticClass:"v-slide-group__content",ref:"content"},this.$slots.default)},genData:function(){return{class:this.classes,directives:[{name:"resize",value:this.onResize}]}},genIcon:function(t){var e=t;this.$vuetify.rtl&&"prev"===t?e="next":this.$vuetify.rtl&&"next"===t&&(e="prev");var i="".concat(t[0].toUpperCase()).concat(t.slice(1)),s=this["has".concat(i)];return this.showArrows||s?this.$createElement(d.a,{props:{disabled:!s}},this["".concat(e,"Icon")]):null},genPrev:function(){var t=this,e=this.$scopedSlots.prev?this.$scopedSlots.prev({}):this.$slots.prev||this.__cachedPrev;return this.$createElement("div",{staticClass:"v-slide-group__prev",class:{"v-slide-group__prev--disabled":!this.hasPrev},on:{click:function(){return t.onAffixClick("prev")}},key:"prev"},[e])},genTransition:function(t){return this.$createElement(v.d,[this.genIcon(t)])},genWrapper:function(){var t=this;return this.$createElement("div",{staticClass:"v-slide-group__wrapper",directives:[{name:"touch",value:{start:function(e){return t.overflowCheck(e,t.onTouchStart)},move:function(e){return t.overflowCheck(e,t.onTouchMove)},end:function(e){return t.overflowCheck(e,t.onTouchEnd)}}}],ref:"wrapper"},[this.genContent()])},calculateNewOffset:function(t,e,i,s){var n=i?-1:1,r=n*s+("prev"===t?-1:1)*e.wrapper;return n*Math.max(Math.min(r,e.content-e.wrapper),0)},onAffixClick:function(t){this.$emit("click:".concat(t)),this.scrollTo(t)},onResize:function(){this._isDestroyed||this.setWidths()},onTouchStart:function(t){var e=this.$refs.content;this.startX=this.scrollOffset+t.touchstartX,e.style.setProperty("transition","none"),e.style.setProperty("willChange","transform")},onTouchMove:function(t){this.scrollOffset=this.startX-t.touchmoveX},onTouchEnd:function(){var t=this.$refs,e=t.content,i=t.wrapper,s=e.clientWidth-i.clientWidth;e.style.setProperty("transition",null),e.style.setProperty("willChange",null),this.$vuetify.rtl?this.scrollOffset>0||!this.isOverflowing?this.scrollOffset=0:this.scrollOffset<=-s&&(this.scrollOffset=-s):this.scrollOffset<0||!this.isOverflowing?this.scrollOffset=0:this.scrollOffset>=s&&(this.scrollOffset=s)},overflowCheck:function(t,e){t.stopPropagation(),this.isOverflowing&&e(t)},scrollIntoView:function(){this.selectedItem&&(0===this.selectedIndex||!this.centerActive&&!this.isOverflowing?this.scrollOffset=0:this.centerActive?this.scrollOffset=this.calculateCenteredOffset(this.selectedItem.$el,this.widths,this.$vuetify.rtl):this.isOverflowing&&(this.scrollOffset=this.calculateUpdatedOffset(this.selectedItem.$el,this.widths,this.$vuetify.rtl,this.scrollOffset)))},calculateUpdatedOffset:function(t,e,i,s){var n=t.clientWidth,r=i?e.content-t.offsetLeft-n:t.offsetLeft;i&&(s=-s);var c=e.wrapper+s,a=n+r,o=.4*n;return r<=s?s=Math.max(r-o,0):c<=a&&(s=Math.min(s-(c-a-o),e.content-e.wrapper)),i?-s:s},calculateCenteredOffset:function(t,e,i){var s=t.offsetLeft,n=t.clientWidth;if(i){var r=e.content-s-n/2-e.wrapper/2;return-Math.min(e.content-e.wrapper,Math.max(0,r))}var c=s+n/2-e.wrapper/2;return Math.min(e.content-e.wrapper,Math.max(0,c))},scrollTo:function(t){this.scrollOffset=this.calculateNewOffset(t,{content:this.$refs.content?this.$refs.content.clientWidth:0,wrapper:this.$refs.wrapper?this.$refs.wrapper.clientWidth:0},this.$vuetify.rtl,this.scrollOffset)},setWidths:function(){var t=this;window.requestAnimationFrame((function(){var e=t.$refs,i=e.content,s=e.wrapper;t.widths={content:i?i.clientWidth:0,wrapper:s?s.clientWidth:0},t.isOverflowing=t.widths.wrapper<t.widths.content,t.scrollIntoView()}))}},render:function(t){return t("div",this.genData(),[this.genPrev(),this.genWrapper(),this.genNext()])}}),O=(x.extend({name:"v-slide-group",provide:function(){return{slideGroup:this}}}),i("a9ad")),_=Object(C.a)(x,O.a).extend({name:"v-chip-group",provide:function(){return{chipGroup:this}},props:{column:Boolean},computed:{classes:function(){return Object(p.a)(Object(p.a)({},x.options.computed.classes.call(this)),{},{"v-chip-group":!0,"v-chip-group--column":this.column})}},watch:{column:function(t){t&&(this.scrollOffset=0),this.$nextTick(this.onResize)}},methods:{genData:function(){return this.setTextColor(this.color,Object(p.a)({},x.options.methods.genData.call(this)))}}}),$=i("adda"),y=i("2fa4"),k=Object(c.a)(r,(function(){var t=this,e=t.$createElement,i=t._self._c||e;return t.isValidCard?i("v-card",{staticClass:"mx-2 mt-2",attrs:{"max-width":"400"}},[t.config.imageUrl?i("v-img",{staticClass:"white--text align-end",attrs:{contain:"",src:t.config.imageUrl}}):t._e(),t.config.title?i("v-card-title",{staticClass:"subtitle-2 white--text primary cardTitleBackground mb-5"},[t._v(t._s(t.config.title))]):t._e(),t.config.subTitle?i("v-card-subtitle",{staticClass:"pb-1"},[t._v(t._s(t.config.subTitle))]):t._e(),t.config.bodyText?i("v-card-text",{staticClass:"text--primary"},[t._v(t._s(t.config.bodyText))]):t._e(),t.config.chips?i("v-card-text",{staticClass:"my-0 py-0"},[i("v-chip-group",{attrs:{"active-class":"secondary white--text",column:""},model:{value:t.chipSelectionIndex,callback:function(e){t.chipSelectionIndex=e},expression:"chipSelectionIndex"}},t._l(t.config.chips,(function(e,s){return i("v-chip",{key:"chip"+s},[t._v(t._s(e.name))])})),1)],1):t._e(),t.config.actions?i("v-card-actions",[i("v-spacer"),t._l(t.config.actions,(function(e,s){return i("v-btn",{key:"action"+s,attrs:{disabled:t.config.chips&&null===t.chipSelectionIndex,small:"",color:"secondary"},on:{click:function(i){return t.actionClicked(e)}}},[t._v(t._s(e.name))])}))],2):t._e()],1):t._e()}),[],!1,null,null,null);e.default=k.exports,o()(k,{VBtn:l.a,VCard:h.a,VCardActions:u.a,VCardSubtitle:u.b,VCardText:u.c,VCardTitle:u.d,VChip:f.a,VChipGroup:_,VImg:$.a,VSpacer:y.a})},cc20:function(t,e,i){"use strict";i("4de4"),i("4160");var s=i("3835"),n=i("5530"),r=(i("8adc"),i("58df")),c=i("0789"),a=i("9d26"),o=i("a9ad"),l=i("4e82"),h=i("7560"),u=i("f2e7"),f=i("1c87"),p=i("af2b"),d=i("d9bd");e.a=Object(r.a)(o.a,p.a,f.a,h.a,Object(l.a)("chipGroup"),Object(u.b)("inputValue")).extend({name:"v-chip",props:{active:{type:Boolean,default:!0},activeClass:{type:String,default:function(){return this.chipGroup?this.chipGroup.activeClass:""}},close:Boolean,closeIcon:{type:String,default:"$delete"},disabled:Boolean,draggable:Boolean,filter:Boolean,filterIcon:{type:String,default:"$complete"},label:Boolean,link:Boolean,outlined:Boolean,pill:Boolean,tag:{type:String,default:"span"},textColor:String,value:null},data:function(){return{proxyClass:"v-chip--active"}},computed:{classes:function(){return Object(n.a)(Object(n.a)(Object(n.a)(Object(n.a)({"v-chip":!0},f.a.options.computed.classes.call(this)),{},{"v-chip--clickable":this.isClickable,"v-chip--disabled":this.disabled,"v-chip--draggable":this.draggable,"v-chip--label":this.label,"v-chip--link":this.isLink,"v-chip--no-color":!this.color,"v-chip--outlined":this.outlined,"v-chip--pill":this.pill,"v-chip--removable":this.hasClose},this.themeClasses),this.sizeableClasses),this.groupClasses)},hasClose:function(){return Boolean(this.close)},isClickable:function(){return Boolean(f.a.options.computed.isClickable.call(this)||this.chipGroup)}},created:function(){var t=this;[["outline","outlined"],["selected","input-value"],["value","active"],["@input","@active.sync"]].forEach((function(e){var i=Object(s.a)(e,2),n=i[0],r=i[1];t.$attrs.hasOwnProperty(n)&&Object(d.a)(n,r,t)}))},methods:{click:function(t){this.$emit("click",t),this.chipGroup&&this.toggle()},genFilter:function(){var t=[];return this.isActive&&t.push(this.$createElement(a.a,{staticClass:"v-chip__filter",props:{left:!0}},this.filterIcon)),this.$createElement(c.b,t)},genClose:function(){var t=this;return this.$createElement(a.a,{staticClass:"v-chip__close",props:{right:!0,size:18},on:{click:function(e){e.stopPropagation(),e.preventDefault(),t.$emit("click:close"),t.$emit("update:active",!1)}}},this.closeIcon)},genContent:function(){return this.$createElement("span",{staticClass:"v-chip__content"},[this.filter&&this.genFilter(),this.$slots.default,this.hasClose&&this.genClose()])}},render:function(t){var e=[this.genContent()],i=this.generateRouteLink(),s=i.tag,r=i.data;r.attrs=Object(n.a)(Object(n.a)({},r.attrs),{},{draggable:this.draggable?"true":void 0,tabindex:this.chipGroup&&!this.disabled?0:r.attrs.tabindex}),r.directives.push({name:"show",value:this.active}),r=this.setBackgroundColor(this.color,r);var c=this.textColor||this.outlined&&this.color;return t(s,this.setTextColor(c,r),e)}})}}]);