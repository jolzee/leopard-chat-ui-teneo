<template>
	<v-dialog
		id="leopard-add-edit-dialog"
		v-model="showDialog"
		scrollable
		:persistent="true"
		max-width="calc(900px - 10%)"
		no-click-animation
		:fullscreen="fullscreen || $vuetify.breakpoint.mdAndDown"
	>
		<v-card>
			<v-system-bar
				height="25px"
				color="teal darken-4"
				:class="{
					'grab-cursor': !fullscreen && !embed && !$vuetify.breakpoint.mdAndDown
				}"
				dark
			>
				<v-spacer style="height:30px" class="teneo-systembar-spacer"></v-spacer>

				<v-icon
					v-if="!embed && !$vuetify.breakpoint.mdAndDown"
					tabindex="0"
					tag="button"
					:aria-label="fullscreen ? 'Restore dialog size' : 'Maximize dialog'"
					@click="toggleFullscreen"
				>{{ fullscreen ? "mdi-window-restore" : "mdi-window-maximize" }}</v-icon>
				<v-icon
					tag="button"
					aria-label="Close dialog"
					tabindex="0"
					@click="closeAddNewSolutionDialog"
				>mdi-close</v-icon>
			</v-system-bar>

			<v-app-bar :color="`teal darken-3 white--text`" dense>
				<v-toolbar-title>{{ dialogTitle }}</v-toolbar-title>
				<v-spacer></v-spacer>
				<span class="d-none d-md-inline-block">
					<v-btn
						x-small
						style="opacity:0.8"
						aria-label="Open Marterial Design Icons in a new window"
						:color="`teal darken-4 white--text`"
						href="https://petershaggynoble.github.io/MDI-Sandbox/"
						target="_blank"
						dark
					>MDI Icons (mdi-icon-name)</v-btn>
				</span>
			</v-app-bar>

			<v-card-text
				id="add-edit"
				style="height: 90vh"
				class="leopard-code-font teneo-hide-scroll-x mx-0 px-3 py-0"
			>
				<v-form ref="form">
					<v-container class="px-0 pa-0">
						<v-row>
							<v-col :cols="12">
								<v-row no-gutters>
									<v-col :cols="12">
										<v-text-field
											v-model.trim="solution.name"
											filled
											color="teal darken-4"
											validate-on-blur
											label="Solution Name"
											:rules="[ruleMustHaveValue]"
										></v-text-field>
									</v-col>
									<v-col :cols="12">
										<v-text-field
											v-model.trim="solution.id"
											disabled
											solo
											outlined
											dense
											append-icon="mdi-key"
											color="teal darken-4"
											validate-on-blur
											label="Solution Id"
										></v-text-field>
									</v-col>
								</v-row>
							</v-col>
						</v-row>
						<v-row>
							<v-col :cols="12">
								<v-text-field
									v-model.trim="solution.deepLink"
									filled
									color="teal darken-4"
									validate-on-blur
									class="leopard-code-font"
									label="Deep links can be accessed with ?dl=<deep-link>"
									:rules="[ruleMustHaveValue, ruleNoSpaces, ruleDeepLinkUnique]"
									append-outer-icon="mdi-link-box-outline"
									@click:append-outer="createSlug"
								></v-text-field>
							</v-col>
						</v-row>
						<v-row>
							<v-col :cols="12" class="pb-0">
								<v-text-field
									v-model.trim="solution.url"
									filled
									clearable
									color="teal darken-4"
									class="leopard-code-font"
									validate-on-blur
									label="URL to Teneo Runtime - no parameters"
									append-icon="mdi-link-variant"
									:rules="[ruleMustHaveValue, ruleMustBeUrl]"
								></v-text-field>
							</v-col>
						</v-row>
						<v-row>
							<v-col :cols="12">
								<v-switch
									v-model="solution.useInProduction"
									color="purple darken-4"
									label="Use in production"
								></v-switch>
								<v-text-field
									v-if="
										('useInProduction' in solution && !solution.useInProduction) ||
											!('useInProduction' in solution)
									"
									v-model.trim="solution.iframeUrl"
									filled
									clearable
									color="teal darken-4"
									class="leopard-code-font"
									validate-on-blur
									label="Enter the IFRAME URL"
									append-icon="mdi-link-variant"
									:rules="[ruleMustHaveValue, ruleMustBeUrl]"
								></v-text-field>
							</v-col>
						</v-row>
						<v-row>
							<v-col :cols="12">
								<v-text-field
									v-model.trim="solution.chatTitle"
									filled
									clearable
									color="teal darken-4"
									validate-on-blur
									label="Chat Window Title"
									:rules="[ruleMustHaveValue]"
								></v-text-field>
							</v-col>
						</v-row>
						<v-row>
							<v-col :cols="12" class="pt-0">
								<v-card elevation-2>
									<v-row no-gutters class="pl-5">
										<v-col cols="12" :lg="4" :sm="6">
											<v-switch v-model="solution.enableLiveChat" color="purple darken-4" label="Live Chat"></v-switch>
										</v-col>
										<v-col cols="12" :lg="4" :sm="6">
											<v-switch v-model="solution.float" color="purple darken-4" label="Float UI"></v-switch>
										</v-col>
										<v-col cols="12" :lg="4" :sm="6">
											<v-switch v-model="solution.pulseButton" color="purple darken-4" label="Pulse Button"></v-switch>
										</v-col>
										<v-col cols="12" :lg="4" :sm="6">
											<v-switch v-model="solution.showChatIcons" color="purple darken-4" label="Chat Icons"></v-switch>
										</v-col>
										<v-col cols="12" :lg="4" :sm="6">
											<v-switch v-model="solution.displayAccent" color="purple darken-4" label="Show Accent"></v-switch>
										</v-col>
										<v-col cols="12" :lg="4" :sm="6">
											<v-switch
												v-model="solution.longResponsesInModal"
												color="purple darken-4"
												label="Long Answers in Modal"
											></v-switch>
										</v-col>
									</v-row>
								</v-card>
							</v-col>
						</v-row>
						<v-row>
							<v-col :cols="12" class="pb-0">
								<v-text-field
									v-model.trim="solution.responseIcon"
									filled
									validate-on-blur
									color="teal darken-4"
									label="Response Icon - MDI Icons (mdi-icon-name)"
									:append-icon="solution.responseIcon"
									:rules="[ruleMustHaveValue]"
								></v-text-field>
							</v-col>
						</v-row>
						<v-row>
							<v-col :cols="12" class="py-0">
								<v-btn
									v-for="(icon, index) in chatIcons"
									:key="index + 'response-icons'"
									:aria-label="`Set the virtual assistant icon to ${icon}`"
									dark
									small
									:elevation="solution.responseIcon === icon ? '2' : '0'"
									icon
									:color="solution.responseIcon === icon ? 'orange darken-4' : 'indigo'"
									@click="solution.responseIcon = icon"
								>
									<v-icon>{{ icon }}</v-icon>
								</v-btn>
							</v-col>
						</v-row>
						<v-row>
							<v-col :cols="12" class="pb-0">
								<v-text-field
									v-model.trim="solution.userIcon"
									filled
									validate-on-blur
									color="teal darken-4"
									label="User Icon - MDI Icons (mdi-icon-name)"
									:aria-label="`Set the icon representing the customer in the chat UI`"
									:append-icon="solution.userIcon"
									:rules="[ruleMustHaveValue]"
								></v-text-field>
							</v-col>
						</v-row>
						<v-row>
							<v-col :cols="12" class="py-0">
								<v-btn
									v-for="(icon, index) in chatIcons"
									:key="index + 'user-icons'"
									:aria-label="`Set the icon representing the customer to ${icon}`"
									dark
									small
									:elevation="solution.userIcon === icon ? '2' : '0'"
									icon
									:color="solution.userIcon === icon ? 'orange darken-4' : 'indigo'"
									@click="solution.userIcon = icon"
								>
									<v-icon>{{ icon }}</v-icon>
								</v-btn>
							</v-col>
						</v-row>
						<v-row>
							<v-col :cols="12">
								<v-select
									v-model="solution.locale"
									:items="locales"
									color="teal darken-4"
									menu-props="auto"
									filled
									label="Specify Chat Locale"
									append-icon="mdi-translate"
								></v-select>
							</v-col>
						</v-row>
						<v-row>
							<v-col cols="12" class="my-0">
								<v-subheader class="pb-10">Delay Teneo Responses in Milliseconds</v-subheader>
								<v-slider
									v-model="solution.responseDelay"
									:min="responseDelay.min"
									:max="responseDelay.max"
									thumb-label="always"
									color="teal darken-4"
								></v-slider>
							</v-col>
						</v-row>
						<v-row>
							<v-col :cols="12">
								<v-row align="center" justify="center" style="min-height: 300px; height: 300px;">
									<transition
										name="leoaprd-transition"
										:enter-active-class="'animated ' + solution.animations.in"
										:leave-active-class="'animated ' + solution.animations.out"
									>
										<v-img
											v-if="showLeopardAnimationImage"
											src="@/assets/leopard-small.png"
											max-height="300"
											style="z-index: 20"
											contain
											@click="toggleDisplayAnimationImage()"
										></v-img>
									</transition>
								</v-row>
							</v-col>
						</v-row>
						<v-row>
							<v-col :cols="12">
								<v-select
									v-model="solution.animations.in"
									:items="animations.in"
									dense
									menu-props="auto"
									color="teal darken-4"
									filled
									label="Specify Enter Animation"
									append-icon="mdi-expand-all"
								></v-select>
							</v-col>
						</v-row>
						<v-row>
							<v-col :cols="12">
								<v-select
									v-model="solution.animations.out"
									:items="animations.out"
									dense
									color="light-blue darken-1"
									menu-props="auto"
									filled
									label="Specify Exit Animation"
									append-icon="mdi-collapse-all"
								></v-select>
							</v-col>
						</v-row>
						<v-row>
							<v-col :cols="12" class="pt-0">
								<v-row>
									<v-col class="py-0">
										<v-subheader class="mb-2">
											Theme
											<v-tooltip open-delay="300" bottom>
												<template v-slot:activator="{ on, attrs }">
													<v-btn
														class="mx-2"
														:aria-label="`Reset theme colors to default`"
														v-bind="attrs"
														icon
														dark
														small
														color="teal darken-4 white--text"
														v-on="on"
														@click="resetColorsToDefault"
													>
														<v-icon dark>mdi-undo-variant</v-icon>
													</v-btn>
												</template>
												<span>Reset Colors to Default</span>
											</v-tooltip>
										</v-subheader>
									</v-col>
								</v-row>
								<v-row no-gutters>
									<v-col cols="12" class="pt-0">
										<v-color-picker
											v-model="color"
											class="pt-0 mt-0"
											:dot-size="15"
											:canvas-height="80"
											:hide-canvas="false"
											:hide-inputs="true"
											:hide-mode-switch="true"
											:show-swatches="true"
											swatches-max-height="98"
											:height="300"
											width="800"
											@input="updateColor"
										></v-color-picker>
									</v-col>
								</v-row>
								<v-row>
									<v-col
										v-for="filteredColor in themeColorsFiltered"
										:key="filteredColor"
										:cols="12"
										:sm="6"
										:md="6"
										:lg="3"
									>
										<v-btn
											class="mr-2"
											:aria-label="`Set the active color for editing to ${filteredColor}`"
											fab
											:dark="!isLight(solution.theme[filteredColor])"
											small
											:color="`${solution.theme[filteredColor]}`"
											@click="setActiveColor(filteredColor)"
										>
											<v-icon v-if="activeColor === filteredColor">mdi-star</v-icon>
										</v-btn>
										<v-text-field
											v-model.trim="solution.theme[filteredColor]"
											clearable
											color="teal darken-4"
											filled
											:value="
												typeof solution.theme[filteredColor] === 'string' ? solution.theme[filteredColor] : ''
											"
											:label="filteredColor"
											:rules="[ruleMustHaveValue, ruleMustHaveColor]"
											@click="setActiveColor(filteredColor)"
										></v-text-field>
									</v-col>
								</v-row>
							</v-col>
						</v-row>
						<v-row>
							<!-- Colors of Responses and questions -->

							<v-col cols="12">
								<v-subheader class="font-weight-bold">Bot Response</v-subheader>
							</v-col>
							<v-col :cols="12">
								<v-row align="start" justify="start" no-gutters class="pl-1">
									<v-col cols="12" class="mb-2">
										<v-slider
											v-model="font.fontIndex"
											name="fontSlider1"
											color="teal darken-4"
											:max="6"
											ticks
											step="1"
											tick-size="5"
											thumb-label="always"
										></v-slider>
									</v-col>
									<v-col cols="3" :sm="2" :md="2" class="text-right">
										<v-btn
											aria-label="Chat icon representing the virtual assitant"
											:color="solution.theme[solution.lookAndFeel.response.iconColor]"
											text
											tile
											icon
											large
										>
											<v-icon large>{{ solution.responseIcon }}</v-icon>
										</v-btn>
									</v-col>
									<v-col cols="9" :sm="10" :md="7" class="text-left pl-2" :class="solution.font">
										<v-card
											:color="
												$vuetify.theme.dark
													? '#333333'
													: solution.theme[solution.lookAndFeel.response.blockBgColor]
											"
											class="chat-card chat-card-left text-left mb-3 leopard-default-font"
											:class="
												solution.lookAndFeel.response.blockTextColor === 'light'
													? ' white--text'
													: ''
											"
										>
											<span>
												Hello and welcome! My name is Leo and I’m here to answer your
												questions.
											</span>
										</v-card>
									</v-col>
									<v-spacer></v-spacer>
								</v-row>
								<v-row no-gutters class="mt-2">
									<v-col cols="12" :md="6" :lg="4" class="pr-1">
										<v-select
											v-model="solution.lookAndFeel.response.iconColor"
											dense
											:items="themeColors"
											filled
											label="Response Icon Color"
										></v-select>
									</v-col>
									<v-col cols="12" :md="6" :lg="4" class="pr-1">
										<v-select
											v-model="solution.lookAndFeel.response.blockBgColor"
											dense
											:items="themeColors"
											filled
											label="Response Block BG Color"
										></v-select>
									</v-col>
									<v-col cols="12" :md="12" :lg="4" class="pr-1">
										<v-select
											v-model="solution.lookAndFeel.response.blockTextColor"
											dense
											:items="
												solution.lookAndFeel.response.blockBgColor === 'white'
													? ['dark']
													: ['dark', 'light']
											"
											filled
											label="Response Block Text Color"
										></v-select>
									</v-col>
								</v-row>
							</v-col>
						</v-row>
						<v-row>
							<v-col cols="12">
								<v-subheader class="font-weight-bold">User Question</v-subheader>
							</v-col>

							<v-col :cols="12">
								<v-row align="start" justify="start" no-gutters class="pl-1">
									<v-col cols="12" class="mb-2">
										<v-slider
											v-model="font.fontIndex"
											name="fontSlider2"
											color="teal darken-4"
											:max="6"
											ticks
											step="1"
											tick-size="5"
											thumb-label="always"
										></v-slider>
									</v-col>

									<v-col cols="9" :sm="10" :md="7" class="text-right pl-2" :class="solution.font">
										<v-card
											:color="
												$vuetify.theme.dark
													? '#333333'
													: solution.theme[solution.lookAndFeel.question.blockBgColor]
											"
											class="chat-card chat-card-right text-right mb-3 leopard-default-font"
											:class="
												solution.lookAndFeel.question.blockTextColor === 'light'
													? ' white--text'
													: ''
											"
										>
											<span>I would like to book a flight from Seattle to Cape Town</span>
										</v-card>
									</v-col>
									<v-col cols="3" :sm="2" :md="2" class="text-left">
										<v-btn
											aria-label="Chat icon representing you in the chat"
											:color="solution.theme[solution.lookAndFeel.question.iconColor]"
											text
											tile
											icon
											large
										>
											<v-icon large>{{ solution.userIcon }}</v-icon>
										</v-btn>
									</v-col>
									<v-spacer></v-spacer>
								</v-row>
								<v-row no-gutters class="mt-2">
									<v-col cols="12" :md="6" :lg="4" class="pr-1">
										<v-select
											v-model="solution.lookAndFeel.question.iconColor"
											dense
											:items="themeColors"
											filled
											color="teal darken-4"
											label="User Question Icon Color"
										></v-select>
									</v-col>
									<v-col cols="12" :md="6" :lg="4" class="pr-1">
										<v-select
											v-model="solution.lookAndFeel.question.blockBgColor"
											dense
											:items="themeColors"
											filled
											color="teal darken-4"
											label="User Question Block BG Color"
										></v-select>
									</v-col>
									<v-col cols="12" :md="12" :lg="4" class="pr-1">
										<v-select
											v-model="solution.lookAndFeel.question.blockTextColor"
											dense
											:items="
												solution.lookAndFeel.question.blockBgColor === 'white'
													? ['dark']
													: ['dark', 'light']
											"
											filled
											color="teal darken-4"
											label="User Question Block Text Color"
										></v-select>
									</v-col>
								</v-row>
							</v-col>
						</v-row>
						<v-row>
							<v-col :cols="12">
								<v-switch
									v-model="solution.promptTriggers.enabled"
									label="Poll for Prompt Triggers"
									color="purple darken-4"
								></v-switch>
								<v-alert
									v-if="solution.promptTriggers.enabled"
									border="top"
									colored-border
									color="teal darken-4"
									type="info"
									elevation="2"
								>
									You must return the number of active flows from Teneo in each response.
									<a
										target="_blank"
										href="https://jolzee.gitbook.io/leopard/configuration/prompt-trigger-polling"
									>Leopard Documentation</a>
								</v-alert>
								<v-text-field
									v-if="solution.promptTriggers.enabled"
									v-model.trim="solution.promptTriggers.pollSeconds"
									color="teal darken-4"
									validate-on-blur
									filled
									label="How often should Leopard poll in seconds?"
									append-icon="mdi-repeat"
									:rules="[ruleMustHaveValue, ruleMustBeInteger]"
								></v-text-field>
							</v-col>
						</v-row>
						<v-row>
							<v-col :cols="12">
								<v-textarea
									v-model.trim="solution.customCssButtonToolbar"
									filled
									color="teal darken-4"
									name="input-7-4"
									class="leopard-code-font"
									label="Button and Toolbar Custom CSS"
								></v-textarea>
							</v-col>
						</v-row>
						<v-row>
							<!-- ASR Corrections -->
							<v-col :cols="12">
								<v-textarea
									v-model.trim="solution.asrCorrections"
									filled
									class="leopard-code-font"
									color="teal darken-4"
									name="input-7-4"
									label="ASR Corrections"
								></v-textarea>
							</v-col>
						</v-row>
						<v-row>
							<!-- help -->

							<v-col :cols="12">
								<v-row>
									<v-col cols="12">
										<v-btn
											small
											color="light-green black--text"
											:aria-label="`Add a help question`"
											class="mr-2"
											@click="addUserInput"
										>
											Help
											<v-icon right dark>mdi-plus-circle</v-icon>
										</v-btn>
									</v-col>
								</v-row>

								<v-row v-for="(question, index) in solution.knowledgeData" :key="index">
									<v-col cols="11">
										<v-text-field
											v-model.trim="solution.knowledgeData[index]"
											:value="question"
											validate-on-blur
											filled
											color="teal darken-4"
											label="Example question"
											append-icon="mdi-android-messages"
											:rules="[ruleMustHaveValue]"
										></v-text-field>
									</v-col>
									<v-col cols="1" class="pl-2 pt-3">
										<v-icon color="red" dark @click="solution.knowledgeData.splice(index, 1)">mdi-minus-circle</v-icon>
									</v-col>
								</v-row>
							</v-col>
						</v-row>
						<v-row>
							<!-- context parameters -->

							<v-col :cols="12" :lg="6" class="pt-0">
								<v-radio-group
									v-model="solution.sendContextParams"
									label="When to send CTX params"
									mandatory
								>
									<v-radio label="At login" value="login"></v-radio>
									<v-radio label="All requests" value="all"></v-radio>
								</v-radio-group>
							</v-col>
							<v-spacer></v-spacer>
							<v-col :cols="12" :lg="4">
								<v-row align="start" justify="end">
									<v-btn
										color="light-green black--text"
										small
										:aria-label="`Add a new context parameter`"
										class="mr-4"
										@click="addContextParam"
									>
										CTX Param
										<v-icon right dark>mdi-plus-circle</v-icon>
									</v-btn>
								</v-row>
							</v-col>

							<v-col :cols="12" class="px-7">
								<!-- Itterate over all CTX parameters and their values -->
								<v-row
									v-for="(contextParam, index) in solution.contextParams"
									:key="index"
									class="mb-4 grey lighten-5 pa-2 elevation-2"
									align="start"
									justify="start"
								>
									<v-col :cols="10">
										<v-text-field
											v-model.trim="contextParam.name"
											validate-on-blur
											color="teal darken-4"
											label="Parameter Name"
											append-icon="mdi-key-variant"
											:rules="[ruleMustHaveValue]"
										></v-text-field>
									</v-col>
									<v-col :cols="2">
										<v-tooltip top>
											<template v-slot:activator="{ on, attrs }">
												<v-icon
													v-bind="attrs"
													color="red"
													dark
													v-on="on"
													@click="solution.contextParams.splice(index, 1)"
												>mdi-minus-circle</v-icon>
											</template>
											<span>Remove CTX Parameter</span>
										</v-tooltip>
										<v-tooltip top>
											<template v-slot:activator="{ on, attrs }">
												<v-icon
													v-bind="attrs"
													color="light-green black--text"
													dark
													v-on="on"
													@click="addNewContextParameterValue(index)"
												>mdi-plus-circle</v-icon>
											</template>
											<span>Add Parameter Value</span>
										</v-tooltip>
									</v-col>

									<!-- Show each ctx parameter value -->
									<v-row v-for="(value, valueIndex) in contextParam.values" :key="valueIndex" no-gutters>
										<v-col class="elevation-2 pa-3 mb-2 mr-2 white">
											<v-tooltip top>
												<template v-slot:activator="{ on, attrs }">
													<v-icon
														v-bind="attrs"
														color="red"
														dark
														v-on="on"
														@click="contextParam.values.splice(valueIndex, 1)"
													>mdi-minus-circle</v-icon>
												</template>
												<span>Delete Parameter Value</span>
											</v-tooltip>
											<v-tooltip top>
												<template v-slot:activator="{ on, attrs }">
													<v-icon
														v-bind="attrs"
														:color="value.active ? 'light-green' : 'grey lighten-1'"
														dark
														v-on="on"
														@click="
															toggleActiveContextParameterValue(value.active, index, valueIndex)
														"
													>
														{{
														value.active ? "mdi-checkbox-marked" : "mdi-checkbox-blank-outline"
														}}
													</v-icon>
												</template>
												<span>Enable/Disable</span>
											</v-tooltip>
											<!-- show input box for context parameter value -->
											<v-text-field
												v-model.trim="value.text"
												class="mt-2"
												validate-on-blur
												solo
												outlined
												clearable
												color="teal darken-4"
												label="Parameter Value"
												hint="Parameter Value"
												:rules="[ruleMustHaveValue]"
											></v-text-field>
										</v-col>
									</v-row>
								</v-row>
							</v-col>
						</v-row>
					</v-container>
				</v-form>
			</v-card-text>
			<v-divider></v-divider>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn
					:aria-label="`Close the solution editing dialog`"
					:color="`teal darken-3 white--text`"
					small
					light
					@click="closeAddNewSolutionDialog"
				>Close</v-btn>
				<v-btn
					class="mr-2"
					:color="`teal darken-3 white--text`"
					small
					:aria-label="`Save edits to the solution`"
					@click="saveForm"
				>
					Save
					<v-icon right dark>mdi-content-save</v-icon>
				</v-btn>
				<v-snackbar
					v-model="snackbar"
					:timeout="snackbarTimeout"
					class="mb-5"
				>🧟‍ Please fix all form validation errors.</v-snackbar>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
import { createSlug, cloneObject, isLight } from "@/utils/utils";
import urlRegex from "url-regex";
import { mapGetters } from "vuex";
import COLOR_NAMES from "@/constants/color-names";
import { SOLUTION_DEFAULT } from "@/constants/solution-config-default";

const logger = require("@/utils/logging").getLogger("ChatAddEditSolution.vue");

export default {
	name: "ConfigAddEditSolution",
	components: {},
	props: {
		config: { type: Object, required: true },
		currentModeEdit: { type: String, required: true },
		selectedSolution: { type: Object, required: true }
	},
	data() {
		return {
			showLeopardAnimationImage: true,
			dialogTitle: this.currentModeEdit === "edit" ? "Editing Solution" : "Adding Solution",
			solution: this.selectedSolution,
			animations: {
				in: [
					"none",
					"bounce",
					"flash",
					"pulse",
					"rubberBand",
					"shake",
					"headShake",
					"swing",
					"tada",
					"wobble",
					"jello",
					"bounceIn",
					"bounceInDown",
					"bounceInLeft",
					"bounceInRight",
					"bounceInUp",
					"fadeIn",
					"fadeInDown",
					"fadeInDownBig",
					"fadeInLeft",
					"fadeInLeftBig",
					"fadeInRight",
					"fadeInRightBig",
					"fadeInUp",
					"fadeInUpBig",
					"flipInX",
					"flipInY",
					"lightSpeedIn",
					"rotateIn",
					"rotateInDownLeft",
					"rotateInDownRight",
					"rotateInUpLeft",
					"rotateInUpRight",
					"hinge",
					"jackInTheBox",
					"rollIn",
					"zoomIn",
					"zoomInDown",
					"zoomInLeft",
					"zoomInRight",
					"zoomInUp",
					"slideInDown",
					"slideInLeft",
					"slideInRight",
					"slideInUp",
					"heartBeat"
				],
				out: [
					"none",
					"bounce",
					"flash",
					"pulse",
					"rubberBand",
					"shake",
					"headShake",
					"swing",
					"tada",
					"wobble",
					"jello",
					"bounceOut",
					"bounceOutDown",
					"bounceOutLeft",
					"bounceOutRight",
					"bounceOutUp",
					"fadeOut",
					"fadeOutDown",
					"fadeOutDownBig",
					"fadeOutLeft",
					"fadeOutLeftBig",
					"fadeOutRight",
					"fadeOutRightBig",
					"fadeOutUp",
					"fadeOutUpBig",
					"flipOutX",
					"flipOutY",
					"lightSpeedOut",
					"rotateOut",
					"rotateOutDownLeft",
					"rotateOutDownRight",
					"rotateOutUpLeft",
					"rotateOutUpRight",
					"hinge",
					"jackInTheBox",
					"rollOut",
					"zoomOut",
					"zoomOutDown",
					"zoomOutLeft",
					"zoomOutRight",
					"zoomOutUp",
					"slideOutDown",
					"slideOutLeft",
					"slideOutRight",
					"slideOutUp",
					"heartBeat"
				]
			},
			font: {
				fontIndex: 3,
				ticksLabels: [
					"leopard-font-xs",
					"leopard-font-small",
					"leopard-font-medium",
					"leopard-font-normal",
					"leopard-font-large",
					"leopard-font-xl",
					"leopard-font-xxl"
				]
			},
			snackbar: false,
			showDialog: true,
			fullscreen: false,
			snackbarTimeout: 3000,
			responseDelay: {
				setting: 0,
				min: 0,
				max: 2000
			},
			globalSnackbarMessage: "",
			globalSnackbar: false,
			globalSnackbarTimeout: 2000,
			globalSnackbarColor: "",
			tabIndex: 1,
			activeColor: "",
			color: "#D60270",
			themeColors: [
				"white",
				"primary",
				"secondary",
				"accent",
				"error",
				"info",
				"success",
				"warning",
				"dark",
				"sendButton",
				"focusButton",
				"textButton",
				"custom1",
				"custom2",
				"custom3"
			],
			trueFalseOptions: ["true", "false"],
			locales: [
				"en-us-male",
				"en-us-female",
				"en-uk-male",
				"en-uk-female",
				"fr",
				"es",
				"nl",
				"de",
				"ru",
				"sv",
				"no",
				"da",
				"jp",
				"cn",
				"cn(hk)",
				"id"
			],
			chatIcons: [
				"mdi-message-bulleted",
				"mdi-comment-arrow-left",
				"mdi-comment-arrow-left-outline",
				"mdi-comment-arrow-right",
				"mdi-comment-arrow-right-outline ",
				"mdi-comment-question",
				"mdi-comment-question-outline",
				"mdi-comment-quote",
				"mdi-comment-quote-outline",
				"mdi-comment-text-outline",
				"mdi-message-text",
				"mdi-message-outline",
				"mdi-message",
				"mdi-chat-outline",
				"mdi-chat",
				"mdi-message-reply",
				"mdi-message-reply-text",
				"mdi-android-messages",
				"mdi-assistant",
				"mdi-bullseye-arrow",
				"mdi-account",
				"mdi-account-arrow-right",
				"mdi-account-arrow-left",
				"mdi-account-box",
				"mdi-account-circle",
				"mdi-account-supervisor-circle",
				"mdi-account-tie",
				"mdi-comment-account",
				"mdi-tooltip-account",
				"mdi-face",
				"mdi-face-profile",
				"mdi-face-profile-woman",
				"mdi-face-woman",
				"mdi-emoticon-outline",
				"mdi-cowboy",
				"mdi-cow",
				"mdi-doctor",
				"mdi-human-greeting",
				"mdi-pirate",
				"mdi-robot",
				"mdi-alien",
				"mdi-space-invaders",
				"mdi-teach",
				"mdi-ninja",
				"mdi-owl"
			]
		};
	},
	computed: {
		...mapGetters(["embed", "textColor"]),
		themeColorsFiltered() {
			return this.themeColors.filter(color => {
				return color !== "white";
			});
		},
		blockBgColor() {
			return this.solution ? this.solution.lookAndFeel.response.blockBgColor : "#FFFFFF";
		},
		blockTextColor() {
			return this.solution ? this.solution.lookAndFeel.response.blockTextColor : "#FFFFFF";
		}
	},
	watch: {
		// eslint-disable-next-line func-names
		"font.fontIndex": function(newIndex) {
			if (this.solution) {
				this.solution.font = this.font.ticksLabels[newIndex];
			}
		},
		blockBgColor(newColor) {
			if (this.solution && newColor === "white") {
				this.solution.lookAndFeel.response.blockTextColor = "dark";
			}
		},
		blockTextColor(shade) {
			if (this.solution && shade === "light" && this.blockBgColor === "white") {
				this.solution.lookAndFeel.response.blockTextColor = "dark";
			}
		}
	},
	mounted() {
		this.font.fontIndex = this.font.ticksLabels.indexOf(this.solution.font);
	},

	updated() {},
	methods: {
		isLight(color) {
			return isLight(color);
		},
		createSlug() {
			this.solution.deepLink = createSlug(this.solution.name);
		},
		toggleFullscreen() {
			const dialogElements = document.getElementById("leopard-add-edit-dialog");
			dialogElements.setAttribute("style", "");
			this.fullscreen = !this.fullscreen;
		},
		toggleDisplayAnimationImage() {
			this.showLeopardAnimationImage = false;
			const that = this;
			setTimeout(() => {
				that.showLeopardAnimationImage = true;
			}, 1500);
		},
		displaySnackBar(message, timeout = 2000, color = "") {
			this.globalSnackbarMessage = message;
			this.globalSnackbar = true;
			this.globalSnackbarTimeout = timeout;
			this.globalSnackbarColor = color;
		},
		failsValidation() {
			logger.debug(this.$refs.form);
			if (!this.$refs.form.validate()) {
				this.snackbar = true;
				return true;
			}
			return false;
		},
		cloneObject(obj) {
			// this is a deep clone
			return JSON.parse(JSON.stringify(obj));
		},
		saveForm() {
			logger.debug("Saving Solution");
			if (this.failsValidation()) {
				return;
			}
			if (this.currentModeEdit === "edit") {
				logger.debug("About to save an edit to an existing solution");
				for (let index = 0; index < this.config.solutions.length; index += 1) {
					if (this.config.solutions[index].id === this.solution.id) {
						this.config.solutions.splice(index, 1, cloneObject(this.solution));
						break;
					}
				}
				// adding a new solution config
			} else {
				logger.debug("About to add a new solution");
				this.config.solutions.push(cloneObject(this.solution));
				// this.selectedSolution = cloneObject(this.solution);
				if (this.config.solutions.length === 1) {
					// first one added. Make it active
					this.config.activeSolution = this.solution.id;
				}
			}
			this.saveAndCloseAddNewSolutionDialog();
		},
		closeAddNewSolutionDialog() {
			this.$refs.form.reset();
			this.$emit("result");
		},
		saveAndCloseAddNewSolutionDialog() {
			this.$emit("result", {
				config: this.config,
				selectedSolutionId: this.solution.id
			});
			this.$refs.form.reset();
		},
		addNewContextParameterValue(index) {
			this.solution.contextParams[index].values.push({
				text: "",
				active: false
			});
		},
		toggleActiveContextParameterValue(active, index, valueIndex) {
			if (active) {
				this.solution.contextParams[index].values[valueIndex].active = false;
			} else {
				this.solution.contextParams[index].values.forEach(value => {
					if (value.active) {
						value.active = false;
					}
				});

				this.solution.contextParams[index].values[valueIndex].active = true;
			}
		},
		addContextParam() {
			this.solution.contextParams.push({
				name: "",
				values: [
					{
						text: "",
						active: true
					}
				]
			});
		},
		addUserInput() {
			this.solution.knowledgeData.push("");
		},
		getBackGroundColor(color) {
			return `background-color:${color}`;
		},
		resetColorsToDefault() {
			this.solution.theme = { ...SOLUTION_DEFAULT.theme };
		},
		setActiveColor(activeTheme) {
			this.activeColor = activeTheme;
			const foundColor = this.solution.theme[activeTheme];
			if (typeof foundColor === "string") {
				this.color = foundColor;
			}
		},
		updateColor() {
			if (this.activeColor) {
				this.solution.theme[this.activeColor] = this.color;
			}
		},
		getTabIndex() {
			this.tabIndexCount += 1;
			return this.tabIndexCount;
		},
		ruleDeepLinkUnique(value) {
			if (!this.currentModeEdit) {
				// adding a new solution
				const foundSolutions = this.config.solutions.filter(
					solution => solution.deepLink === value
				);
				if (foundSolutions && foundSolutions.length > 0) {
					return "That deep link is already taken";
				}
				return true;
			}
			// editing and existing solution config
			logger.debug("Editing solution: checking deep link validity");
			const foundSolution = this.config.solutions.find(solution => solution.deepLink === value);
			logger.debug(foundSolution);
			if (foundSolution && foundSolution.id !== this.selectedSolution.id) {
				return "That deep link is already taken!!";
			}
			return true;
		},
		ruleMustBeInteger(value) {
			// logger.debug(`The value is ${Number(value)}`);
			if (Number.isInteger(Number(value))) {
				return true;
			}
			return "Value must be an integer";
		},
		ruleMustBeUrl(value) {
			if (
				urlRegex({
					strict: true
				}).test(value)
			) {
				return true;
			}
			return "Please provide a well-formed URL";
		},
		ruleNoSpaces(value) {
			if (value && value.indexOf(" ") > -1) {
				return "no spaces allowed";
			}
			return true;
		},
		ruleMustHaveColor(color) {
			// logger.debug(`Color validation`, color);
			if (color && this.isValidColor(color)) {
				return true;
			}
			return "Must be HEX #8A2BE2 or named html name color";
		},
		ruleMustHaveValue(value) {
			// logger.debug(`ruleMustHaveValue`, value);
			if (value && /\S/.test(value)) {
				return true;
			}
			return "You must provide a value";
		},
		isValidColor(color) {
			if (color && typeof color === "string" && color.charAt(0) === "#") {
				color = color.substring(1);
				return [3, 4, 6, 8].indexOf(color.length) > -1 && !Number.isNaN(parseInt(color, 16));
			}
			if (color) {
				if (color.toLowerCase() in COLOR_NAMES) {
					return true;
				}
				return false;
			}
			return false;
		}
	}
};
</script>

<style scoped>
.leopard-default-font {
	font-family: "Roboto", sans-serif;
}

.leopard-add-edit-shadow {
	border-color: #acafb1 !important;
	border-right: 2px solid #acafb1 !important;
}

.teneo-hide-scroll-x {
	overflow-x: hidden;
}

.chat-card {
	font-weight: 400;
	padding: 8px !important;
	margin-top: 4px;
	line-height: 1.4em;
	width: fit-content;
	display: table;
}

.chat-card-left {
	border-radius: 3px 13px 13px 13px !important;
	-moz-border-radius: 3px 13px 13px 13px !important;
	-webkit-border-radius: 3px 13px 13px 13px !important;
}

.chat-card-right {
	border-radius: 13px 3px 13px 13px !important;
	-moz-border-radius: 13px 3px 13px 13px !important;
	-webkit-border-radius: 13px 3px 13px 13px !important;
	margin-left: auto !important;
}
</style>
