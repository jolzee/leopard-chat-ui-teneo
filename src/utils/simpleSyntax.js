export default class SimpleSyntax {
  constructor(tResp) {
    this.tResp = tResp;
  }

  expandAll() {
    this.tResp.getParameterNames().forEach(param => {
      if (param.trim() === "card_title") {
        this.card();
      }
      if (param.trim() === "modal_title") {
        this.modal();
      }
      switch (param) {
        case "audio":
          this.audio();
          break;
        case "video":
          this.video();
          break;
        case "table":
          this.table();
          break;
        case "linkbuttons":
          this.linkButtons();
          break;
        case "image":
          this.image();
          break;
        case "images":
          this.imageCarousel("images");
          break;
        case "carousel":
          this.imageCarousel("carousel");
          break;
        case "map":
          this.map();
          break;
        case "system":
          this.system();
          break;
        case "quickreply":
          this.quickReply();
          break;
        case "buttons":
          this.buttons();
          break;
        case "clickablelist":
          this.clickableList();
          break;
        case "text":
          this.text();
          break;
        default:
          break;
      }
    });
    return this.tResp;
  }

  table() {
    let output = {
      name: "displaySimpleTable",
      inline: true,
      dense: true,
      height: null,
      fixedHeader: false,
      headers: [],
      rows: []
    };
    const tableDef = this.tResp.getParameter("table");
    let elements = tableDef.split(/\r?\n/);
    let headers = elements[0].split("|").map(x => x.trim());
    output.headers = headers;
    for (let index = 1; index < elements.length; index++) {
      const row = elements[index];
      let rowElements = row.split("|").map(x => x.trim());
      output.rows.push(rowElements);
    }
    this.tResp.addParameter("extensions", output);
  }

  map() {
    let output = {
      name: "displayMap",
      parameters: {
        address: this.tResp.getParameter("map")
      },
      inline: true
    };
    this.tResp.addParameter("extensions", output);
  }

  audio() {
    let output = {
      name: "displayVideo",
      parameters: {
        video_url: this.tResp.getParameter("audio")
      },
      inline: true
    };
    this.tResp.addParameter("extensions", output);
  }

  video() {
    let output = {
      name: "displayVideo",
      parameters: {
        video_url: this.tResp.getParameter("video")
      },
      inline: true
    };
    this.tResp.addParameter("extensions", output);
  }

  image() {
    let output = {
      name: "displayImage",
      parameters: {
        image_url: this.tResp.getParameter("image")
      },
      inline: true
    };
    this.tResp.addParameter("extensions", output);
  }

  imageCarousel(paramName) {
    let output = {
      name: "displayImageCarousel",
      parameters: {
        images: this.tResp.getParameter(paramName).split("|")
      },
      inline: true
    };
    this.tResp.addParameter("extensions", output);
  }

  system() {
    let output = {
      name: "displayAlert",
      inline: true,
      text: this.tResp.getParameter("system")
    };
    this.tResp.addParameter("extensions", output);
  }

  quickReply() {
    let output = {
      name: "displayCollection",
      hasLongOptions: false,
      permanent: false,
      parameters: {
        content: {
          items: []
        }
      }
    };

    this.tResp
      .getParameter("quickreply")
      .split("|")
      .forEach(buttonVal => {
        output.parameters.content.items.push({ name: buttonVal.trim() });
      });

    this.tResp.addParameter("extensions", output);
  }

  linkButtons() {
    let output = {
      name: "displayCollection",
      hasLongOptions: false,
      permanent: false,
      parameters: {
        content: {
          items: []
        }
      }
    };

    if (this.tResp.hasParameter("linkbuttons_title")) {
      output.parameters.content.title = this.tResp.getParameter("linkbuttons_title");
    }

    this.tResp
      .getParameter("linkbuttons")
      .split("|")
      .forEach(linkRaw => {
        const linkElements = linkRaw.split(",");
        output.parameters.content.items.push({
          name: linkElements[0].trim(),
          url: linkElements[1].trim(),
          target: linkElements[2] ? linkElements[2].trim() : ""
        });
      });

    this.tResp.addParameter("extensions", output);
  }

  buttons() {
    let output = {
      name: "displayCollection",
      hasLongOptions: false,
      permanent: false,
      parameters: {
        content: {
          items: []
        }
      }
    };

    this.tResp
      .getParameter("buttons")
      .split("|")
      .forEach(buttonVal => {
        output.parameters.content.items.push({ name: buttonVal.trim() });
      });

    if (this.tResp.hasParameter("buttons_title")) {
      output.parameters.content.title = this.tResp.getParameter("buttons_title");
    }
    this.tResp.addParameter("extensions", output);
  }

  clickableList() {
    let output = {
      name: "displayCollection",
      hasLongOptions: true,
      permanent: false,
      parameters: {
        content: {
          items: []
        }
      }
    };

    this.tResp
      .getParameter("clickablelist")
      .split("|")
      .forEach(listVal => {
        output.parameters.content.items.push({ name: listVal.trim() });
      });

    if (this.tResp.hasParameter("clickablelist_title")) {
      output.parameters.content.title = this.tResp.getParameter("clickablelist_title");
    }
    this.tResp.addParameter("extensions", output);
  }

  card() {
    // eslint-disable-next-line no-unused-vars
    let output = {
      title: this.tResp.getParameter("card_title"),
      subTitle: this.tResp.getParameter("card_subtitle"),
      bodyText: this.tResp.getParameter("card_bodytext"),
      buttons: [],
      clickableList: [],
      linkButtons: []
    };

    if (this.tResp.hasParameter("card_image")) {
      let imageAtts = this.tResp.getParameter("card_image").split("|");
      output.imageUrl = imageAtts[0];
      output.imageAlt = imageAtts[1] ? imageAtts[1] : "";
    }

    if (this.tResp.hasParameter("card_buttons")) {
      this.tResp
        .getParameter("card_buttons")
        .split("|")
        .forEach(element => {
          output.buttons.push(element.trim());
        });
    }

    if (this.tResp.hasParameter("card_clickablelist")) {
      this.tResp
        .getParameter("card_clickablelist")
        .split("|")
        .forEach(element => {
          output.clickableList.push(element.trim());
        });
    }

    if (this.tResp.hasParameter("card_linkbuttons")) {
      this.tResp
        .getParameter("card_linkbuttons")
        .split("|")
        .forEach(linkRaw => {
          const linkElements = linkRaw.split(",");
          output.linkButtons.push({
            title: linkElements[0].trim(),
            url: linkElements[1].trim(),
            target: linkElements[2] ? linkElements[2].trim() : ""
          });
        });
    }

    if (this.tResp.hasParameter("card_links")) {
      this.tResp
        .getParameter("card_links")
        .split("|")
        .forEach(linkRaw => {
          const linkElements = linkRaw.split(",");
          output.linkButtons.push({
            title: linkElements[0].trim(),
            url: linkElements[1].trim(),
            target: linkElements[2] ? linkElements[2].trim() : ""
          });
        });
    }

    this.tResp.addParameter("displayCard", output);
  }

  modal() {
    // eslint-disable-next-line no-unused-vars
    let output = {
      title: this.tResp.getParameter("modal_title"),
      subTitle: this.tResp.getParameter("modal_subtitle"),
      bodyText: this.tResp.getParameter("modal_bodytext"),
      buttons: [],
      clickableList: [],
      linkButtons: []
    };

    if (this.tResp.hasParameter("modal_image")) {
      let imageAtts = this.tResp.getParameter("modal_image").split("|");
      output.imageUrl = imageAtts[0];
      output.imageAlt = imageAtts[1] ? imageAtts[1] : "";
    }

    if (this.tResp.hasParameter("modal_buttons")) {
      this.tResp
        .getParameter("modal_buttons")
        .split("|")
        .forEach(element => {
          output.buttons.push(element.trim());
        });
    }

    if (this.tResp.hasParameter("modal_clickablelist")) {
      this.tResp
        .getParameter("modal_clickablelist")
        .split("|")
        .forEach(element => {
          output.clickableList.push(element.trim());
        });
    }

    if (this.tResp.hasParameter("modal_linkbuttons")) {
      this.tResp
        .getParameter("modal_linkbuttons")
        .split("|")
        .forEach(linkRaw => {
          const linkElements = linkRaw.split(",");
          output.linkButtons.push({
            title: linkElements[0].trim(),
            url: linkElements[1].trim(),
            target: linkElements[2] ? linkElements[2].trim() : ""
          });
        });
    }

    if (this.tResp.hasParameter("modal_links")) {
      this.tResp
        .getParameter("modal_links")
        .split("|")
        .forEach(linkRaw => {
          const linkElements = linkRaw.split(",");
          output.linkButtons.push({
            title: linkElements[0].trim(),
            url: linkElements[1].trim(),
            target: linkElements[2] ? linkElements[2].trim() : ""
          });
        });
    }

    this.tResp.addParameter("displaySimpleModal", output);
  }

  text() {
    let output = {
      type: "success", // [simple/success/info/warning/error]
      title: "Success", // optional
      body: this.tResp.getParameter("text"),
      config: {
        timeout: 2000, // default: 2000 = 2 seconds
        showProgressBar: true, // default: true
        closeOnClick: true, // default: true
        pauseOnHover: true, // default: true
        position: "centerBottom" // [leftBottom, leftTop, leftCenterm rightTop, rightCenter, rightBottom, centerTop, centerCenter, centerBottom]
      }
    };
    this.tResp.addParameter("toast", output);
  }
}
