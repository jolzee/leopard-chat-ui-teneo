import { doesParameterExist } from "@/utils/utils";
export function leopardLogBanner() {
  if (!doesParameterExist("embed") && !doesParameterExist("button")) {
    console.groupCollapsed(
      `%c Powered by %c Leopard Chat UI 💬 %c`,
      "background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff",
      "background:#41b883 ; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff",
      "background:transparent"
    );
    console.log("Author: Peter Joles - peter.joles@artificial-solutions.com");
    // console.log("Documentation: https://jolzee.gitbook.io/leopard/");
    // console.log("Code: https://github.com/jolzee/chat-teneo-vue");
    console.groupEnd();
  }
}
