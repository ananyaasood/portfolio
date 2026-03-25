/* ===================================================================
   CLOTH HOVER SHADER v2 — Fabric Deformation Effect
   Ultra-subtle textile tension simulation for garment images.
   Uses WebGL for GPU-accelerated displacement mapping.
   =================================================================== */

(function () {
    'use strict';

    // ── Vertex Shader ──────────────────────────────────
    const VERT = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      // Flip Y for texture coordinates
      v_uv.y = 1.0 - v_uv.y;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

    // ── Fragment Shader ────────────────────────────────
    const FRAG = `
    precision highp float;
    
    uniform sampler2D u_image;
    uniform vec2 u_mouse;        // Mouse position in UV space (0-1)
    uniform float u_strength;    // 0 = no effect, 1 = full
    uniform float u_aspect;      // width / height
    uniform float u_time;
    
    varying vec2 v_uv;
    
    void main() {
      vec2 uv = v_uv;
      
      // Vector from UV to mouse position
      vec2 toMouse = u_mouse - uv;
      toMouse.x *= u_aspect;
      
      float dist = length(toMouse);
      
      // Gaussian falloff — radius ~15% of width, sharp falloff
      float radius = 0.18;
      float influence = exp(-pow(dist / radius, 2.0)) * u_strength;
      
      // Fabric tension displacement:
      // Pull UVs slightly toward cursor (like fabric being pressed)
      vec2 displacement = normalize(toMouse + 0.0001) * influence * 0.06;
      
      // Add very subtle concentric ripple (textile tension wave)
      float ripple = sin(dist * 30.0 - u_time * 2.5) * 0.008;
      ripple *= exp(-dist * 6.0) * u_strength;
      displacement += normalize(toMouse + 0.0001) * ripple;
      
      uv += displacement;
      
      // Clamp to prevent sampling outside texture
      uv = clamp(uv, 0.0, 1.0);
      
      vec4 color = texture2D(u_image, uv);
      
      // Subtle shadow in deformed region (fabric depth cue)
      float shadow = 1.0 - influence * 0.25;
      color.rgb *= shadow;
      
      // Subtle highlight at edges of deformation (light catching fold)
      float edge = abs(dFdx(influence)) + abs(dFdy(influence));
      color.rgb += edge * 0.4;
      
      gl_FragColor = color;
    }
  `;

    // ── Helper: compile shader ─────────────────────────
    function compileShader(gl, src, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createProgram(gl, vertSrc, fragSrc) {
        const vert = compileShader(gl, vertSrc, gl.VERTEX_SHADER);
        const frag = compileShader(gl, fragSrc, gl.FRAGMENT_SHADER);
        if (!vert || !frag) return null;

        const program = gl.createProgram();
        gl.attachShader(program, vert);
        gl.attachShader(program, frag);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program link error:', gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    // ── Cloth Effect Instance ──────────────────────────
    class ClothEffect {
        constructor(wrap) {
            this.wrap = wrap;
            this.img = wrap.querySelector('img');
            if (!this.img) return;

            // State
            this.mouse = { x: 0.5, y: 0.5 };
            this.smoothMouse = { x: 0.5, y: 0.5 };
            this.strength = 0;
            this.targetStrength = 0;
            this.time = 0;
            this.running = false;

            this._setup();
        }

        _setup() {
            // Create canvas
            this.canvas = document.createElement('canvas');
            Object.assign(this.canvas.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                opacity: '0',
                transition: 'opacity 0.5s ease',
                zIndex: '2',
                borderRadius: 'inherit',
            });
            this.wrap.style.position = 'relative';
            this.wrap.appendChild(this.canvas);

            // Get WebGL context
            this.gl = this.canvas.getContext('webgl', {
                alpha: false,
                antialias: false,
                premultipliedAlpha: false,
                preserveDrawingBuffer: false,
            });

            if (!this.gl) {
                console.warn('ClothEffect: no WebGL');
                this.canvas.remove();
                return;
            }

            // Enable derivatives for edge highlight
            this.gl.getExtension('OES_standard_derivatives');

            this._resize();
            this._initGL();
            this._loadTexture();
            this._bind();
        }

        _resize() {
            const r = this.wrap.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio, 2);
            this.canvas.width = r.width * dpr;
            this.canvas.height = r.height * dpr;
            this.aspect = r.width / r.height;
        }

        _initGL() {
            const gl = this.gl;

            // Compile program
            // Add derivatives extension to fragment shader
            const fragWithExt = '#extension GL_OES_standard_derivatives : enable\n' + FRAG;
            this.program = createProgram(gl, VERT, fragWithExt);
            if (!this.program) return;

            gl.useProgram(this.program);

            // Fullscreen quad: two triangles covering clip space (-1 to 1)
            const quad = new Float32Array([
                -1, -1,
                1, -1,
                -1, 1,
                -1, 1,
                1, -1,
                1, 1,
            ]);

            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

            const aPos = gl.getAttribLocation(this.program, 'a_position');
            gl.enableVertexAttribArray(aPos);
            gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

            // Get uniform locations
            this.loc = {
                image: gl.getUniformLocation(this.program, 'u_image'),
                mouse: gl.getUniformLocation(this.program, 'u_mouse'),
                strength: gl.getUniformLocation(this.program, 'u_strength'),
                aspect: gl.getUniformLocation(this.program, 'u_aspect'),
                time: gl.getUniformLocation(this.program, 'u_time'),
            };
        }

        _loadTexture() {
            const gl = this.gl;
            this.texture = gl.createTexture();
            this.textureReady = false;

            const upload = () => {
                gl.bindTexture(gl.TEXTURE_2D, this.texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.img);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                this.textureReady = true;
            };

            if (this.img.complete && this.img.naturalWidth > 0) {
                upload();
            } else {
                this.img.addEventListener('load', upload, { once: true });
            }
        }

        _bind() {
            // Pointer events on the canvas itself when active
            this.wrap.addEventListener('mouseenter', () => {
                this.targetStrength = 1;
                this._resize();
                // Re-upload texture in case it changed
                if (this.textureReady) {
                    const gl = this.gl;
                    gl.bindTexture(gl.TEXTURE_2D, this.texture);
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.img);
                }
                this.canvas.style.opacity = '1';
                this._start();
            });

            this.wrap.addEventListener('mouseleave', () => {
                this.targetStrength = 0;
                // Let it fade out gracefully — loop will stop itself
            });

            this.wrap.addEventListener('mousemove', (e) => {
                const r = this.wrap.getBoundingClientRect();
                this.mouse.x = (e.clientX - r.left) / r.width;
                this.mouse.y = (e.clientY - r.top) / r.height;
            });

            window.addEventListener('resize', () => this._resize());
        }

        _start() {
            if (this.running) return;
            this.running = true;
            this._loop();
        }

        _loop() {
            if (!this.running) return;

            // Smooth mouse (fabric lag)
            this.smoothMouse.x += (this.mouse.x - this.smoothMouse.x) * 0.06;
            this.smoothMouse.y += (this.mouse.y - this.smoothMouse.y) * 0.06;

            // Spring strength
            this.strength += (this.targetStrength - this.strength) * 0.08;

            // Stop when fully faded out
            if (this.targetStrength === 0 && this.strength < 0.005) {
                this.strength = 0;
                this.running = false;
                this.canvas.style.opacity = '0';
                return;
            }

            this.time += 0.016;
            this._render();
            requestAnimationFrame(() => this._loop());
        }

        _render() {
            const gl = this.gl;
            if (!gl || !this.textureReady || !this.program) return;

            gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            gl.useProgram(this.program);

            // Set uniforms
            gl.uniform1i(this.loc.image, 0);
            gl.uniform2f(this.loc.mouse, this.smoothMouse.x, this.smoothMouse.y);
            gl.uniform1f(this.loc.strength, this.strength);
            gl.uniform1f(this.loc.aspect, this.aspect);
            gl.uniform1f(this.loc.time, this.time);

            // Bind texture
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);

            // Draw fullscreen quad
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
    }

    // ── Initialize ─────────────────────────────────────
    function init() {
        document.querySelectorAll('.rflxns__img-wrap').forEach(wrap => {
            new ClothEffect(wrap);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 200);
    }

})();
