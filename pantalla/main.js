let tipeo;

const WIDTH = 640;
const HEIGHT = 360;
const USAR_GRAFICOS = true;
const DEBUG = true;
const VERDE = 0x33ff33;

const archivoEfecto = 'efecto.frag';
let fragment;

function crearFiltro(app, fragment, noise) {
    const glProgram = PIXI.GlProgram.from({
        fragment,
        vertex: PIXI.defaultFilterVert,
        name: 'custom-filter',
    });

    const filterUniforms = new PIXI.UniformGroup({
        iTime: { value: 0.0, type: 'f32' },
        iResolution: { value: [app.canvas.width * 1.0, app.canvas.height * 1.0, 1.0], type: 'vec3<f32>' },
    })

    const compatibleRenderers = PIXI.RendererType.WEBGL;
    const filter = new PIXI.Filter({
        glProgram,
        compatibleRenderers,
        resources: {
            filterUniforms,
            iChannel1: noise.source,
        },
    });
    return { filter, filterUniforms };
}

window.addEventListener("DOMContentLoaded", async () => {
    if (USAR_GRAFICOS) {
        const app = new PIXI.Application({
        });
        if (DEBUG) {
            window.app = app;
        }

        await app.init({
            // resizeTo: window,
            preference: 'webgl',
            width: WIDTH,
            height: HEIGHT,
        });

        document.querySelector('.mensaje').style.display = "none";
        document.body.appendChild(app.canvas);

        PIXI.Assets.addBundle('assets', {
            retroFont: 'assets/minkler.ttf',
            noise: 'assets/noise.png',
        });

        const assets = await PIXI.Assets.loadBundle('assets');

        const response = await fetch(archivoEfecto);
        fragment = await response.text();

        const wrapper = new PIXI.Container();
        app.stage.addChild(wrapper);

        const fondo = new PIXI.Graphics();
        wrapper.addChild(fondo);

        fondo
            .rect(0, 0, WIDTH, HEIGHT)
            .fill(0x113332);

        const noise = assets['noise'];
        noise.source.addressMode = "repeat";
        noise.source.mipmap = false;
        // const s = PIXI.Sprite.from(noise);
        // wrapper.addChild(s);
    

            const cursor = new PIXI.Graphics();
        wrapper.addChild(cursor);

        cursor
            .rect(0, 0, 20, 50)
            .fill(0xffffff)
            .stroke({ width: 2, color: VERDE});

        const style = new PIXI.TextStyle({
            fontFamily: 'retroFont',
            fontSize: 30,
            fontWeight: 'bold',
            fill: 0xffffff,
            stroke: {
                color: VERDE,
                width: 2,
            },
            // dropShadow: {
            //     alpha: 1,
            //     angle: Math.PI / 6,
            //     blur: 10,
            //     color: VERDE,
            //     distance: 5,
            //   },
            wordWrap: true,
            breakWords: true,
            wordWrapWidth: WIDTH - 100,
            lineJoin: 'round',
            lineHeight: 55,
        });

        const texto = new PIXI.Text({
            text: "",
            renderMode: "canvas",
            style: style,
        });

        if (DEBUG) {
            window.texto = texto;
        }

        wrapper.addChild(texto);

        let { filter, filterUniforms } = crearFiltro(app, fragment, noise);
        wrapper.filters = [filter];

        // const blurFilter = new PIXI.BlurFilter({ strength: 10, quality: 4 });
        // wrapper.filters = [blurFilter, filter];

        const tryLoadShader = async () => {
            const response = await fetch(archivoEfecto);
            const newFragment = await response.text();
            if (fragment !== newFragment) {
                fragment = newFragment;
                const x = crearFiltro(app, fragment, noise);
                filter = x.filter;
                filterUniforms = x.filterUniforms;
                wrapper.filters = [filter];
            }
        };

        let lastTimeShaderLoaded = 0;
        const tryLoadShaderTime = 1000;
        app.ticker.add(({ lastTime }) => {
            if (DEBUG && lastTime > tryLoadShaderTime + lastTimeShaderLoaded) {
                tryLoadShader();
                lastTimeShaderLoaded = lastTime;
            }
            cursor.x = texto.x + texto.width;
            cursor.y = texto.y + texto.height - cursor.height;
            cursor.visible = Math.cos(lastTime / 200) > 0.3;
            filterUniforms.uniforms.iTime = lastTime / 1000;
        });
  }

  if (USAR_GRAFICOS) {
    tipeo = new Tipeo(texto);
  } else {
    tipeo = new Tipeo('.mensaje');
  }
    tipeo.tipear('Conectando...');

    // // descomentar para pruebas:
    // const websocket = {};
    // setTimeout(() => {
    //     tipeo.tipear("este es el primer mensaje");
    // }, 2000)
    // setTimeout(() => {
    //     tipeo.tipear("y este es el segundo mensaje");
    // }, 4000)
    // setTimeout(() => { 
    //     tipeo.tipear(", qué bueno, ¿no?", sinBorrar=true);
    // }, 10000)
    // setTimeout(() => {
    //     tipeo.tipear("FIN");
    // }, 15000)
    // setTimeout(() => {
    //     tipeo.borrar();
    // }, 50000)

    // comentar para pruebas:
    const websocket = new WebSocket("ws://localhost:8001/");

    websocket.onerror = () => {
        tipeo.tipear('¡Sin conexión!');
    };

    websocket.onopen = () => {
        tipeo.borrar();
    };

    websocket.onmessage = (event) => {
        if (event.data[0] === "_") {
            tipeo.tipear(event.data.substring(1), sinBorrar=true);
        } else {
            tipeo.tipear(event.data);
        }
    };
});
