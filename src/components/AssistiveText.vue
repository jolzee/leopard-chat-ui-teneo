

<template>
  <div class="assistive-text" :aria-live="ariaLive" aria-relevant="additions">
    <slot></slot>
    <div v-for="(text, index) in textToRead" :key="index">{{text}}</div>
  </div>
</template>

<script>
export default {
  props: {
    value: String,
    ariaLive: {
      type: String,
      default: "polite",
      validator: value => {
        return ["assertive", "polite", "off"].indexOf(value) !== -1;
      }
    }
  },
  data() {
    return {
      textToRead: []
    };
  },
  methods: {
    say(text) {
      if (text) {
        this.textToRead.push(text);
      }
    }
  },
  mounted() {
    this.say(this.value);
  },
  watch: {
    value(val) {
      this.say(val);
    }
  }
};
</script>

<style scoped>
.assistive-text {
  position: absolute;
  margin: -1px;
  border: 0;
  padding: 0;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>