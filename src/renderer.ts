
import { Exponent } from "@repcomm/exponent-ts";
import { AmbientLight, Camera, DirectionalLight, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from "three";
import { World } from "./world";

export class Renderer extends Exponent {
  element: HTMLCanvasElement;

  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;

  renderCallback: FrameRequestCallback;

  needsRender: boolean;

  world: World;

  constructor() {
    super();

    this.world = new World();
    this.world.loadChunkIndex(0, 0, 0);

    this.scene = new Scene();
    this.scene.add(this.world);

    let sun = new DirectionalLight(0xffffff, 0.9);
    this.scene.add(sun);
    sun.target.translateX(10);
    sun.target.translateY(10);
    
    let ambient = new AmbientLight(0xffffff, 0.2);
    this.scene.add(ambient);

    this.needsRender = true;

    this.renderer = new WebGLRenderer({
      alpha: false
    });

    this.useNative(this.renderer.domElement);

    this.applyRootClasses();
    this.addClasses("exponent-canvas");

    window.addEventListener("resize", () => {
      this.adjustSize();
    });

    setTimeout(() => {
      this.adjustSize();
    }, 100);

    this.renderCallback = () => {
      if (this.needsRender) this.render();

      requestAnimationFrame(this.renderCallback);
    };

    requestAnimationFrame(this.renderCallback);
  }
  adjustSize() {
    this.renderer.setSize(
      this.rect.width,
      this.rect.height,
      false
    );
    if (this.camera) {
      console.log("adjusting aspect");
      this.camera.aspect = this.rect.width / this.rect.height;
      this.camera.updateProjectionMatrix();
      
    }
  }
  render() {
    if (!this.scene || !this.camera) {
      throw `scene or camera missing`;
      return;
    }

    if (this.world) {
      for (let c of this.world.renderedChunks) {
        if (c.needsRender) c.tryRender();
      }
    }

    this.needsRender = false;
    this.renderer.render(this.scene, this.camera);
  }
  setCamera(camera: PerspectiveCamera): this {
    this.camera = camera;
    return this;
  }
  setScene(scene: Scene): this {
    this.scene = scene;
    return this;
  }
}
