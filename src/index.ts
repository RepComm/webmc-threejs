
import { EXPONENT_CSS_BODY_STYLES, EXPONENT_CSS_STYLES, Panel } from "@repcomm/exponent-ts";
import { GameInput } from "@repcomm/gameinput-ts";
import { FreeCamera } from "@repcomm/three.lookcamera";
import { Camera, PerspectiveCamera } from "three";
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

  let freecam = new FreeCamera();
  renderer.camera = freecam.getCamera() as PerspectiveCamera;
  renderer.scene.add(freecam);

  let input = GameInput.get();
  input.getOrCreateAxis("horizontal")
  .addInfluence({
    value: 1,
    mouseAxes: [0]
  });
  input.getOrCreateAxis("vertical")
  .addInfluence({
    value: 1,
    mouseAxes: [1]
  });

  input.getOrCreateAxis("forward")
  .addInfluence({
    value: 1,
    keys: ["w"]
  })
  .addInfluence({
    value: -1,
    keys: ["s"]
  });

  input.getOrCreateAxis("strafe")
  .addInfluence({
    value: -1,
    keys: ["d"]
  })
  .addInfluence({
    value: 1,
    keys: ["a"]
  });

  setInterval(()=>{
    freecam.addRotationInput(
      input.getAxisValue("horizontal"),
      input.getAxisValue("vertical")
    );

    freecam.addMovementInput(
      input.getAxisValue("forward"),
      input.getAxisValue("strafe")
    );

    if (input.raw.pointerIsLocked()) {
    } else {
      if (input.raw.getPointerButton(0)) {
        input.raw.pointerTryLock(renderer.element);
      }
    }

    
    renderer.needsRender = true;
  }, 1000/20);
  
}

main();
