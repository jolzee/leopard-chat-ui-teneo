(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-f7d2312e","chunk-6912f43e"],{"2a7f":function(e,t,a){"use strict";a.d(t,"a",(function(){return l}));var i=a("71d9"),s=a("80d2"),l=Object(s.i)("v-toolbar__title");Object(s.i)("v-toolbar__items");i.a},"3f7a":function(e,t,a){"use strict";a.r(t);var i=a("5530"),s=a("2f62"),l={name:"Dialog",props:{title:{type:String,required:!0},show:{type:Boolean,required:!0},width:{type:String,required:!0}},data:function(){return{fullscreen:!1,overlay:!1,isVisible:!1}},watch:{show:function(){this.isVisible=this.$props.show}},computed:Object(i.a)({},Object(s.b)(["uuid","dark","embed","fullscreenEmbed","textColor"])),methods:{close:function(){this.$emit("close")},toggleFullscreen:function(){document.getElementsByClassName("leopard-dialog")[0].setAttribute("style",""),this.fullscreen=!this.fullscreen}}},r=(a("4f49"),a("2877")),o=a("6544"),n=a.n(o),c=a("0798"),d=a("40dc"),u=a("8336"),b=a("b0af"),v=a("99d9"),f=a("62ad"),p=a("a523"),m=a("169a"),h=a("ce7e"),g=a("0789"),w=a("132d"),y=a("a797"),V=a("0fd9"),k=a("2fa4"),x=a("afd9"),_=a("2a7f"),C=Object(r.a)(l,(function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("transition",{attrs:{name:"leopard-dialog-transition","enter-active-class":"flipInY","leave-active-class":"fadeOutRightBig"}},[a("v-dialog",{directives:[{name:"show",rawName:"v-show",value:e.isVisible,expression:"isVisible"}],attrs:{id:"leopard-dialog",transition:void 0,persistent:"",scrollable:"","max-width":"80%",width:e.width?e.width:"600px",fullscreen:e.fullscreen||e.$vuetify.breakpoint.mdAndDown,"content-class":"leopard-dialog resizable"},model:{value:e.isVisible,callback:function(t){e.isVisible=t},expression:"isVisible"}},[a("v-card",{staticClass:"mx-auto"},[a("v-fade-transition",[a("v-overlay",{attrs:{absolute:"",opacity:"0.7",value:e.overlay}},[a("v-alert",{attrs:{border:"left",light:"","colored-border":"",type:"info",elevation:"2"},on:{click:function(t){e.overlay=!1}}},[e._v('"Welcome to my dialog!!"')])],1)],1),a("v-system-bar",{class:{"grab-cursor":!e.fullscreen&&!e.embed&&!e.$vuetify.breakpoint.mdAndDown,"teneo-toolbar-embed":e.embed&&!e.fullscreenEmbed,"teneo-toolbar-embed-fullscreen":e.fullscreenEmbed},attrs:{height:"25px",color:"primary darken-3",dark:""}},[a("v-spacer",{staticClass:"teneo-systembar-spacer",staticStyle:{height:"30px"}}),e.embed||e.$vuetify.breakpoint.mdAndDown?e._e():a("v-icon",{attrs:{tabindex:"0",tag:"button","aria-label":e.fullscreen?"Restore dialog size":"Maximize dialog"},on:{click:e.toggleFullscreen}},[e._v(e._s(e.fullscreen?"mdi-window-restore":"mdi-window-maximize"))]),a("v-icon",{attrs:{tag:"button","aria-label":"Close dialog",tabindex:"0"},on:{click:e.close}},[e._v("mdi-close")])],1),a("v-app-bar",{attrs:{color:"primary "+e.textColor("primary"),dense:""}},[a("v-toolbar-title",[e._v(e._s(e.title))]),a("v-spacer")],1),a("v-card-text",{staticClass:"px-3 py-0",class:{"dark-scroll":e.dark,"light-scroll":!e.dark},staticStyle:{height:"90%"}},[a("v-container",{attrs:{fluid:""}},[a("v-row",{attrs:{align:"start",justify:"start"}},[a("v-col",{staticClass:"pa-2",attrs:{cols:"12"}},[e._t("default",[e._v("Nothing passed to the dialog")])],2)],1)],1)],1),a("v-divider"),a("v-card-actions",[a("v-spacer"),e._t("buttons",[a("v-btn",{attrs:{small:"",color:"secondary white--text"},on:{click:e.close}},[e._v(e._s(e.$t("forms.close")))])])],2)],1)],1)],1)}),[],!1,null,null,null);t.default=C.exports,n()(C,{VAlert:c.a,VAppBar:d.a,VBtn:u.a,VCard:b.a,VCardActions:v.a,VCardText:v.c,VCol:f.a,VContainer:p.a,VDialog:m.a,VDivider:h.a,VFadeTransition:g.d,VIcon:w.a,VOverlay:y.a,VRow:V.a,VSpacer:k.a,VSystemBar:x.a,VToolbarTitle:_.a})},"4f49":function(e,t,a){"use strict";a("6a82")},"6a82":function(e,t,a){}}]);