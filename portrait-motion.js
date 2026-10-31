const portraitMotion = {
  teto: { image: 'assets/duo-studio.png', crop: [64, 5, 353, 932], angles: [-0.024, 0.045, 0.065], gesture: [0.66, 0.35, 0.35, 0.17], pivot: [0.55, 0.27], hair: -0.008 },
  miku: { image: 'assets/miku-oficinista.png', crop: [20, 1, 994, 1519], angles: [0.025, -0.05, -0.085], gesture: [0.79, 0.35, 0.24, 0.17], pivot: [0.59, 0.27], hair: 0.012 },
  neru: { image: 'assets/neru-maestra-v2.png', crop: [225, 7, 649, 1511], angles: [-0.018, 0.04, 0.10], gesture: [0.16, 0.24, 0.27, 0.15], pivot: [0.31, 0.31], hair: -0.01 },
};
function createPortraitRenderer(canvas, image, motion) {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true });
  if (!gl) return null;
  const vertexSource = `
    attribute vec2 aPoint;
    uniform vec4 uRect;
    uniform vec4 uTextureRect;
    uniform vec3 uAngles;
    uniform vec4 uGesture;
    uniform vec2 uPivot;
    uniform float uHair;
    uniform float uProgress;
    varying vec2 vTexture;
    vec2 turn(vec2 point, vec2 pivot, float angle) {
      float c = cos(angle), s = sin(angle);
      vec2 d = point - pivot;
      return pivot + vec2(c * d.x - s * d.y, s * d.x + c * d.y);
    }
    void main() {
      vec2 size = uRect.zw;
      vec2 rest = aPoint * size;
      float upper = 1.0 - smoothstep(0.60, 0.90, aPoint.y);
      vec2 point = mix(rest, turn(rest, size * vec2(0.5, 0.58), uAngles.x * uProgress), upper);
      float head = 1.0 - smoothstep(0.16, 0.28, aPoint.y);
      point += (turn(rest, size * vec2(0.5, 0.23), uAngles.y * uProgress) - rest) * head;
      vec2 distance = (aPoint - uGesture.xy) / uGesture.zw;
      float gesture = exp(-dot(distance, distance) * 2.0);
      point += (turn(rest, size * uPivot, uAngles.z * uProgress) - rest) * gesture;
      float outer = smoothstep(0.18, 0.43, abs(aPoint.x - 0.5));
      float hair = smoothstep(0.15, 0.30, aPoint.y) * (1.0 - smoothstep(0.65, 0.87, aPoint.y));
      point.x += sin(aPoint.y * 3.14159265) * outer * hair * uHair * size.x * uProgress;
      vec2 screen = point + uRect.xy;
      gl_Position = vec4(screen.x / 384.0 * 2.0 - 1.0, 1.0 - screen.y / 576.0 * 2.0, 0.0, 1.0);
      vTexture = uTextureRect.xy + aPoint * uTextureRect.zw;
    }`;
  const fragmentSource = `precision mediump float; varying vec2 vTexture; uniform sampler2D uImage; void main() { gl_FragColor = texture2D(uImage, vTexture); }`;
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Portrait shader unavailable');
    return shader;
  }
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);
  const points = [], indices = [];
  const columns = 24, rows = 36;
  for (let y = 0; y <= rows; y++) for (let x = 0; x <= columns; x++) points.push(x / columns, y / rows);
  for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++) {
    const a = y * (columns + 1) + x, b = a + columns + 1;
    indices.push(a, b, a + 1, a + 1, b, b + 1);
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  const point = gl.getAttribLocation(program, 'aPoint');
  gl.enableVertexAttribArray(point);
  gl.vertexAttribPointer(point, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  const [x, y, width, height] = motion.crop;
  const bodyHeight = 548, bodyWidth = width / height * bodyHeight;
  const location = name => gl.getUniformLocation(program, name);
  gl.uniform4f(location('uRect'), (384 - bodyWidth) / 2, 16, bodyWidth, bodyHeight);
  gl.uniform4f(location('uTextureRect'), x / image.naturalWidth, y / image.naturalHeight, width / image.naturalWidth, height / image.naturalHeight);
  gl.uniform3fv(location('uAngles'), motion.angles);
  gl.uniform4fv(location('uGesture'), motion.gesture);
  gl.uniform2fv(location('uPivot'), motion.pivot);
  gl.uniform1f(location('uHair'), motion.hair);
  const progressLocation = location('uProgress');
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 0);
  return progress => {
    gl.uniform1f(progressLocation, progress);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    canvas.dataset.progress = progress.toFixed(4);
  };
}
