(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-0358c79e"],{"2a7f":function(e,t,a){"use strict";a.d(t,"a",(function(){return r}));var n=a("71d9"),i=a("80d2"),r=Object(i.i)("v-toolbar__title");Object(i.i)("v-toolbar__items");n.a},5311:function(e,t,a){"use strict";var n=a("5607"),i=a("2b0e");t.a=i.default.extend({name:"rippleable",directives:{ripple:n.b},props:{ripple:{type:[Boolean,Object],default:!0}},methods:{genRipple:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return this.ripple?(e.staticClass="v-input--selection-controls__ripple",e.directives=e.directives||[],e.directives.push({name:"ripple",value:{center:!0}}),this.$createElement("div",e)):null}}})},"696f":function(e,t,a){},a6be:function(e,t,a){"use strict";a.r(t),a("99af");var n=a("5530"),i=a("2f62"),r=a("ca6b").getLogger("Feedback.vue"),o={name:"Feedback",props:{feedbackConfig:{type:Object,required:!0}},data:function(){return{dialogm1:"",dialog:!0,rating:4,reasons:[],comment:"",items:this.feedbackConfig.reasons?this.feedbackConfig.reasons:[]}},computed:Object(n.a)({},Object(i.b)(["textColor"])),methods:{hideFeedback:function(){this.$emit("hide-feedback")},sendFeedback:function(){r.debug("Rating: ".concat(this.rating," Reasons: ").concat(this.reasons," Comment: ").concat(this.comment));var e={rating:this.rating,reasons:this.reasons,comment:this.comment,nodeId:this.feedbackConfig.nodeId};this.hideFeedback(),this.$store.dispatch("sendFeedback",e),this.$store.commit("CLEAR_FEEDBACK_FORM"),this.$store.commit("SHOW_MESSAGE_IN_CHAT","Thanks for your feedback.")}}},s=a("2877"),l=a("6544"),c=a.n(l),d=a("40dc"),u=a("8336"),h=a("b0af"),f=a("99d9"),m=a("62ad"),v=a("2b5d"),p=a("a523"),b=a("169a"),g=a("ce7e"),k=(a("d81d"),a("a9e3"),a("c96a"),a("696f"),a("9d26")),x=a("a9ad"),y=a("16b7"),C=a("af2b"),I=a("5311"),H=a("7560"),V=a("80d2"),F=a("58df"),$=Object(F.a)(x.a,y.a,I.a,C.a,H.a).extend({name:"v-rating",props:{backgroundColor:{type:String,default:"accent"},color:{type:String,default:"primary"},clearable:Boolean,dense:Boolean,emptyIcon:{type:String,default:"$ratingEmpty"},fullIcon:{type:String,default:"$ratingFull"},halfIcon:{type:String,default:"$ratingHalf"},halfIncrements:Boolean,hover:Boolean,length:{type:[Number,String],default:5},readonly:Boolean,size:[Number,String],value:{type:Number,default:0}},data:function(){return{hoverIndex:-1,internalValue:this.value}},computed:{directives:function(){return this.readonly||!this.ripple?[]:[{name:"ripple",value:{circle:!0}}]},iconProps:function(){var e=this.$props,t=e.dark,a=e.large,n=e.light,i=e.medium,r=e.small;return{dark:t,large:a,light:n,medium:i,size:e.size,small:r,xLarge:e.xLarge,xSmall:e.xSmall}},isHovering:function(){return this.hover&&this.hoverIndex>=0}},watch:{internalValue:function(e){e!==this.value&&this.$emit("input",e)},value:function(e){this.internalValue=e}},methods:{createClickFn:function(e){var t=this;return function(a){if(!t.readonly){var n=t.genHoverIndex(a,e);t.clearable&&t.internalValue===n?t.internalValue=0:t.internalValue=n}}},createProps:function(e){var t={index:e,value:this.internalValue,click:this.createClickFn(e),isFilled:Math.floor(this.internalValue)>e,isHovered:Math.floor(this.hoverIndex)>e};return this.halfIncrements&&(t.isHalfHovered=!t.isHovered&&(this.hoverIndex-e)%1>0,t.isHalfFilled=!t.isFilled&&(this.internalValue-e)%1>0),t},genHoverIndex:function(e,t){var a=this.isHalfEvent(e);return this.halfIncrements&&this.$vuetify.rtl&&(a=!a),t+(a?.5:1)},getIconName:function(e){var t=this.isHovering?e.isHovered:e.isFilled,a=this.isHovering?e.isHalfHovered:e.isHalfFilled;return t?this.fullIcon:a?this.halfIcon:this.emptyIcon},getColor:function(e){if(this.isHovering){if(e.isHovered||e.isHalfHovered)return this.color}else if(e.isFilled||e.isHalfFilled)return this.color;return this.backgroundColor},isHalfEvent:function(e){if(this.halfIncrements){var t=e.target&&e.target.getBoundingClientRect();if(t&&e.pageX-t.left<t.width/2)return!0}return!1},onMouseEnter:function(e,t){var a=this;this.runDelay("open",(function(){a.hoverIndex=a.genHoverIndex(e,t)}))},onMouseLeave:function(){var e=this;this.runDelay("close",(function(){return e.hoverIndex=-1}))},genItem:function(e){var t=this,a=this.createProps(e);if(this.$scopedSlots.item)return this.$scopedSlots.item(a);var n={click:a.click};return this.hover&&(n.mouseenter=function(a){return t.onMouseEnter(a,e)},n.mouseleave=this.onMouseLeave,this.halfIncrements&&(n.mousemove=function(a){return t.onMouseEnter(a,e)})),this.$createElement(k.a,this.setTextColor(this.getColor(a),{attrs:{tabindex:-1},directives:this.directives,props:this.iconProps,on:n}),[this.getIconName(a)])}},render:function(e){var t=this,a=Object(V.h)(Number(this.length)).map((function(e){return t.genItem(e)}));return e("div",{staticClass:"v-rating",class:{"v-rating--readonly":this.readonly,"v-rating--dense":this.dense}},a)}}),_=a("0fd9"),w=a("2fa4"),S=a("a844"),E=a("2a7f"),A=Object(s.a)(o,(function(){var e=this,t=e.$createElement,a=e._self._c||t;return e.dialog?a("v-row",{attrs:{justify:"center"}},[a("v-dialog",{attrs:{scrollable:"","max-width":"400px",fullscreen:e.$vuetify.breakpoint.mdAndDown},model:{value:e.dialog,callback:function(t){e.dialog=t},expression:"dialog"}},[a("v-card",[a("v-app-bar",{attrs:{color:"primary "+e.textColor("primary"),"max-height":"64"}},[a("v-toolbar-title",[e._v("Feedback")]),a("v-spacer")],1),a("v-card-text",{staticClass:"px-2",staticStyle:{height:"360px"}},[a("v-container",{attrs:{fluid:""}},[a("v-row",[a("v-col",{staticClass:"mb-0 pb-0",attrs:{cols:"12"}},[a("div",{staticClass:"text-center"},[a("v-rating",{attrs:{color:"primary","background-color":"secondary lighten-5","empty-icon":"$ratingFull","x-large":e.$vuetify.breakpoint.lgAndUp,large:e.$vuetify.breakpoint.md,"x-small":e.$vuetify.breakpoint.smAndDown},model:{value:e.rating,callback:function(t){e.rating=t},expression:"rating"}})],1)]),e.feedbackConfig.reasons?a("v-col",{staticClass:"mb-0 pb-0",attrs:{cols:"12"}},[a("v-combobox",{attrs:{items:e.items,label:"Reasons",color:"primary","append-icon":"mdi-bookmark-plus",clearable:"",solo:"","deletable-chips":"","item-color":"secondary","hide-selected":"","small-chips":"",chips:"",multiple:"",outlined:"",dense:""},model:{value:e.reasons,callback:function(t){e.reasons=t},expression:"reasons"}})],1):e._e(),a("v-col",{staticClass:"my-0 py-0",attrs:{cols:"12"}},[a("v-textarea",{attrs:{outlined:"",clearable:"",color:"primary",solo:"",name:"feedbackComment","append-icon":"mdi-comment-processing-outline",label:"Additional Feedback",hint:"All feedback is welcome.",rows:"5","auto-grow":"",value:e.comment},model:{value:e.comment,callback:function(t){e.comment=t},expression:"comment"}})],1)],1)],1)],1),a("v-divider"),a("v-card-actions",[a("v-spacer"),a("v-btn",{attrs:{small:"",color:"error",text:""},on:{click:e.hideFeedback}},[e._v(e._s(e.$t("forms.close")))]),a("v-btn",{attrs:{small:"",color:"success"},on:{click:e.sendFeedback}},[e._v(e._s(e.$t("forms.send")))])],1)],1)],1)],1):e._e()}),[],!1,null,null,null);t.default=A.exports,c()(A,{VAppBar:d.a,VBtn:u.a,VCard:h.a,VCardActions:f.a,VCardText:f.c,VCol:m.a,VCombobox:v.a,VContainer:p.a,VDialog:b.a,VDivider:g.a,VRating:$,VRow:_.a,VSpacer:w.a,VTextarea:S.a,VToolbarTitle:E.a})}}]);