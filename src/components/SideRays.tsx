import React, { useRef, useEffect } from 'react';

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
    : [1, 1, 1];
};

interface SideRaysProps {
  speed?: number;
  rayColor1?: string;
  rayColor2?: string;
  intensity?: number;
  spread?: number;
  origin?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  tilt?: number;
  saturation?: number;
  blend?: number;
  falloff?: number;
  opacity?: number;
  className?: string;
}

/**
 * 100% Native Atmospheric Light Rays Component
 * Built from scratch with pure WebGL (zero external libraries, no React Bits/OGL).
 * Strict Mobile-First responsive rendering with hardcoded CSS properties.
 */
export const SideRays: React.FC<SideRaysProps> = ({
  speed = 2.5,
  rayColor1 = '#EAB308',
  rayColor2 = '#96c8ff',
  intensity = 2,
  spread = 2,
  origin = 'top-right',
  tilt = 0,
  saturation = 1.5,
  blend = 0.75,
  falloff = 1.6,
  opacity = 1.0,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isVisibleRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGL availability
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false });
    if (!gl) return;

    let animId: number | null = null;
    let observer: IntersectionObserver | null = null;

    // Intersection observer for performance optimization
    observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    // Native vertex shader
    const vertSrc = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Native fragment shader for organic atmospheric light beams
    const fragSrc = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_res;
      uniform float u_speed;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform float u_intensity;
      uniform float u_spread;
      uniform float u_flipX;
      uniform float u_flipY;
      uniform float u_tilt;
      uniform float u_saturation;
      uniform float u_blend;
      uniform float u_falloff;
      uniform float u_opacity;

      float rayStrength(vec2 raySource, vec2 rayRefDir, vec2 coord, float seedA, float seedB, float speed) {
        vec2 sourceToCoord = coord - raySource;
        float cosAngle = dot(normalize(sourceToCoord), rayRefDir);
        return clamp(
          (0.45 + 0.15 * sin(cosAngle * seedA + u_time * speed)) +
          (0.3 + 0.2 * cos(-cosAngle * seedB + u_time * speed)),
          0.0, 1.0) *
          clamp((u_res.x - length(sourceToCoord)) / u_res.x, 0.5, 1.0);
      }

      void main() {
        vec2 fragCoord = gl_FragCoord.xy;
        if (u_flipX > 0.5) fragCoord.x = u_res.x - fragCoord.x;
        if (u_flipY > 0.5) fragCoord.y = u_res.y - fragCoord.y;

        vec2 coord = vec2(fragCoord.x, u_res.y - fragCoord.y);
        vec2 rayPos = vec2(u_res.x * 1.1, -0.5 * u_res.y);

        float tiltRad = u_tilt * 3.14159265 / 180.0;
        float cs = cos(tiltRad);
        float sn = sin(tiltRad);
        vec2 rel = coord - rayPos;
        vec2 tiltedCoord = vec2(rel.x * cs - rel.y * sn, rel.x * sn + rel.y * cs) + rayPos;

        float halfSpread = u_spread * 0.275;
        vec2 rayRefDir1 = normalize(vec2(cos(0.785398 + halfSpread), sin(0.785398 + halfSpread)));
        vec2 rayRefDir2 = normalize(vec2(cos(0.785398 - halfSpread), sin(0.785398 - halfSpread)));

        vec4 rays1 = vec4(u_color1, 1.0) * rayStrength(rayPos, rayRefDir1, tiltedCoord, 36.2214, 21.11349, u_speed);
        vec4 rays2 = vec4(u_color2, 1.0) * rayStrength(rayPos, rayRefDir2, tiltedCoord, 22.3991, 18.0234, u_speed * 0.2);

        vec4 color = rays1 * (1.0 - u_blend) * 0.9 + rays2 * u_blend * 0.9;
        float distToLight = length(fragCoord.xy - vec2(rayPos.x, u_res.y - rayPos.y)) / u_res.y;
        float brightness = u_intensity * 0.4 / pow(max(distToLight, 0.001), u_falloff);
        color.rgb *= brightness;

        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = mix(vec3(gray), color.rgb, u_saturation);
        color.a = max(color.r, max(color.g, color.b)) * u_opacity;

        gl_FragColor = color;
      }
    `;

    const createShader = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl.VERTEX_SHADER, vertSrc);
    const fragShader = createShader(gl.FRAGMENT_SHADER, fragSrc);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }
    gl.useProgram(program);

    // Quad geometry (covers full clip space)
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_res');
    const uSpeed = gl.getUniformLocation(program, 'u_speed');
    const uColor1 = gl.getUniformLocation(program, 'u_color1');
    const uColor2 = gl.getUniformLocation(program, 'u_color2');
    const uIntensity = gl.getUniformLocation(program, 'u_intensity');
    const uSpread = gl.getUniformLocation(program, 'u_spread');
    const uFlipX = gl.getUniformLocation(program, 'u_flipX');
    const uFlipY = gl.getUniformLocation(program, 'u_flipY');
    const uTilt = gl.getUniformLocation(program, 'u_tilt');
    const uSaturation = gl.getUniformLocation(program, 'u_saturation');
    const uBlend = gl.getUniformLocation(program, 'u_blend');
    const uFalloff = gl.getUniformLocation(program, 'u_falloff');
    const uOpacity = gl.getUniformLocation(program, 'u_opacity');

    const [c1R, c1G, c1B] = hexToRgb(rayColor1);
    const [c2R, c2G, c2B] = hexToRgb(rayColor2);
    const flipX = origin === 'top-left' || origin === 'bottom-left' ? 1.0 : 0.0;
    const flipY = origin === 'bottom-right' || origin === 'bottom-left' ? 1.0 : 0.0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      const displayW = Math.floor(width * dpr);
      const displayH = Math.floor(height * dpr);

      if (canvas.width !== displayW || canvas.height !== displayH) {
        canvas.width = displayW;
        canvas.height = displayH;
        gl.viewport(0, 0, displayW, displayH);
      }
    };

    window.addEventListener('resize', resize);
    resize();

    // Render loop
    const render = (timeMs: number) => {
      animId = requestAnimationFrame(render);
      if (!isVisibleRef.current) return;

      gl.useProgram(program);
      gl.uniform1f(uTime, timeMs * 0.001);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uSpeed, speed);
      gl.uniform3f(uColor1, c1R, c1G, c1B);
      gl.uniform3f(uColor2, c2R, c2G, c2B);
      gl.uniform1f(uIntensity, intensity);
      gl.uniform1f(uSpread, spread);
      gl.uniform1f(uFlipX, flipX);
      gl.uniform1f(uFlipY, flipY);
      gl.uniform1f(uTilt, tilt);
      gl.uniform1f(uSaturation, saturation);
      gl.uniform1f(uBlend, blend);
      gl.uniform1f(uFalloff, falloff);
      gl.uniform1f(uOpacity, opacity);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      if (observer) observer.disconnect();
      if (posBuffer) gl.deleteBuffer(posBuffer);
      if (vertShader) gl.deleteShader(vertShader);
      if (fragShader) gl.deleteShader(fragShader);
      if (program) gl.deleteProgram(program);
    };
  }, [speed, rayColor1, rayColor2, intensity, spread, origin, tilt, saturation, blend, falloff, opacity]);

  return (
    <div className={`w-full h-full relative pointer-events-none z-[3] overflow-hidden ${className}`.trim()}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default SideRays;
