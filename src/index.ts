
import { EXPONENT_CSS_BODY_STYLES, EXPONENT_CSS_STYLES, Panel } from "@repcomm/exponent-ts";
import { Renderer } from "./renderer";


EXPONENT_CSS_BODY_STYLES.mount(document.head);
EXPONENT_CSS_STYLES.mount(document.head);

async function main () {

  const container = new Panel()
  .setId("container")
  .mount(document.body);

  let renderer = new Renderer()
  .setId("renderer")
  .mount(container);

  setInterval(()=>{
    renderer.needsRender = true;
  }, 1000/20);
  
}

main();
