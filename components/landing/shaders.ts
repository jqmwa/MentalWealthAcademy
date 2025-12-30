export const fragmentShader = `precision highp float;

uniform float colorNum;
uniform float pixelSize;
uniform vec2 resolution;

const mat2x2 bayerMatrix2x2 = mat2x2(
    0.0, 2.0,
    3.0, 1.0
) / 4.0;

const mat4x4 bayerMatrix4x4 = mat4x4(
    0.0,  8.0,  2.0, 10.0,
    12.0, 4.0,  14.0, 6.0,
    3.0,  11.0, 1.0, 9.0,
    15.0, 7.0,  13.0, 5.0
) / 16.0;

const float bayerMatrix8x8[64] = float[64](
    0.0/ 64.0, 48.0/ 64.0, 12.0/ 64.0, 60.0/ 64.0,  3.0/ 64.0, 51.0/ 64.0, 15.0/ 64.0, 63.0/ 64.0,
  32.0/ 64.0, 16.0/ 64.0, 44.0/ 64.0, 28.0/ 64.0, 35.0/ 64.0, 19.0/ 64.0, 47.0/ 64.0, 31.0/ 64.0,
    8.0/ 64.0, 56.0/ 64.0,  4.0/ 64.0, 52.0/ 64.0, 11.0/ 64.0, 59.0/ 64.0,  7.0/ 64.0, 55.0/ 64.0,
  40.0/ 64.0, 24.0/ 64.0, 36.0/ 64.0, 20.0/ 64.0, 43.0/ 64.0, 27.0/ 64.0, 39.0/ 64.0, 23.0/ 64.0,
    2.0/ 64.0, 50.0/ 64.0, 14.0/ 64.0, 62.0/ 64.0,  1.0/ 64.0, 49.0/ 64.0, 13.0/ 64.0, 61.0/ 64.0,
  34.0/ 64.0, 18.0/ 64.0, 46.0/ 64.0, 30.0/ 64.0, 33.0/ 64.0, 17.0/ 64.0, 45.0/ 64.0, 29.0/ 64.0,
  10.0/ 64.0, 58.0/ 64.0,  6.0/ 64.0, 54.0/ 64.0,  9.0/ 64.0, 57.0/ 64.0,  5.0/ 64.0, 53.0/ 64.0,
  42.0/ 64.0, 26.0/ 64.0, 38.0/ 64.0, 22.0/ 64.0, 41.0/ 64.0, 25.0/ 64.0, 37.0/ 64.0, 21.0 / 64.0
);

vec3 dither(vec2 uv, vec3 color) {
  // Use a fixed reference resolution for consistent dithering across all screen sizes
  // This ensures the pattern looks the same regardless of actual resolution
  float refResolution = 1920.0; // Reference resolution for consistent dithering scale
  int x = int(uv.x * refResolution) % 8;
  int y = int(uv.y * refResolution) % 8;
  float threshold = bayerMatrix8x8[y * 8 + x] - 0.25;

  color.rgb += threshold;
  color.r = floor(color.r * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
  color.g = floor(color.g * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
  color.b = floor(color.b * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);

  return color;
}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 normalizedPixelSize = pixelSize / resolution;  
  vec2 uvPixel = normalizedPixelSize * floor(uv / normalizedPixelSize);

  vec4 color = texture2D(inputBuffer, uvPixel);
  color.rgb = dither(uvPixel, color.rgb);

  outputColor = color;
}`;

export const waveFragmentShader = `precision highp float;

uniform vec2 resolution;
uniform float time;
uniform float colorNum;
uniform float pixelSize;
uniform vec2 mouse;

varying vec2 vUv;

// Bayer dithering matrix
const float bayerMatrix8x8[64] = float[64](
    0.0/ 64.0, 48.0/ 64.0, 12.0/ 64.0, 60.0/ 64.0,  3.0/ 64.0, 51.0/ 64.0, 15.0/ 64.0, 63.0/ 64.0,
  32.0/ 64.0, 16.0/ 64.0, 44.0/ 64.0, 28.0/ 64.0, 35.0/ 64.0, 19.0/ 64.0, 47.0/ 64.0, 31.0/ 64.0,
    8.0/ 64.0, 56.0/ 64.0,  4.0/ 64.0, 52.0/ 64.0, 11.0/ 64.0, 59.0/ 64.0,  7.0/ 64.0, 55.0/ 64.0,
  40.0/ 64.0, 24.0/ 64.0, 36.0/ 64.0, 20.0/ 64.0, 43.0/ 64.0, 27.0/ 64.0, 39.0/ 64.0, 23.0/ 64.0,
    2.0/ 64.0, 50.0/ 64.0, 14.0/ 64.0, 62.0/ 64.0,  1.0/ 64.0, 49.0/ 64.0, 13.0/ 64.0, 61.0/ 64.0,
  34.0/ 64.0, 18.0/ 64.0, 46.0/ 64.0, 30.0/ 64.0, 33.0/ 64.0, 17.0/ 64.0, 45.0/ 64.0, 29.0/ 64.0,
  10.0/ 64.0, 58.0/ 64.0,  6.0/ 64.0, 54.0/ 64.0,  9.0/ 64.0, 57.0/ 64.0,  5.0/ 64.0, 53.0/ 64.0,
  42.0/ 64.0, 26.0/ 64.0, 38.0/ 64.0, 22.0/ 64.0, 41.0/ 64.0, 25.0/ 64.0, 37.0/ 64.0, 21.0 / 64.0
);

vec3 dither(vec2 uv, vec3 color) {
  // Use a fixed reference resolution for consistent dithering across all screen sizes
  // This ensures the pattern looks the same regardless of actual resolution
  float refResolution = 1920.0; // Reference resolution for consistent dithering scale
  int x = int(uv.x * refResolution) % 8;
  int y = int(uv.y * refResolution) % 8;
  float threshold = bayerMatrix8x8[y * 8 + x] - 0.25;

  color.rgb += threshold;
  color.r = floor(color.r * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
  color.g = floor(color.g * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
  color.b = floor(color.b * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);

  return color;
}

vec4 mod289(vec4 x) {
 return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
 return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec2 P) {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod289(Pi); // To avoid truncation effects in permutation
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;

    vec4 i = permute(permute(ix) + iy);

    vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
    vec4 gy = abs(gx) - 0.5 ;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;

    vec2 g00 = vec2(gx.x,gy.x);
    vec2 g10 = vec2(gx.y,gy.y);
    vec2 g01 = vec2(gx.z,gy.z);
    vec2 g11 = vec2(gx.w,gy.w);

    vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;

    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));

    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}

const int OCTAVES = 4;

float fbm(vec2 p) {
    // Initial values
    float value = -0.2;
    float amplitude = 1.0;
    float frequency = 2.5;
    // Loop of octaves - reduced from 8 to 4 for better performance
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * abs(cnoise(p));
        p *= frequency;
        amplitude *= 0.35;
    }
    return value;
}

float pattern(vec2 p) {  
    // Mouse interaction - create flow effect
    vec2 mouseOffset = (mouse - 0.5) * 2.0; // Convert to -1 to 1 range
    vec2 p2 = p - time * 0.05 + mouseOffset * 0.3;
    vec2 p3 = p + mouseOffset * 0.5;
    return fbm(p3 - fbm(p + fbm(p2 * 0.8)));
}

void main() {

  vec2 uv = vUv;
  uv -= 0.5;
  uv.x *= resolution.x / resolution.y;

  vec3 col = vec3(0.0);

  float f = pattern(uv);
  
  // Design system colors
  vec3 purple = vec3(0.318, 0.408, 1.0); // #5168FF (primary purple)
  vec3 whiteLight = vec3(0.956, 0.961, 0.996); // #F4F5FE (background)
  vec3 gradientStart = vec3(0.925, 0.925, 1.0); // #ECECFF
  vec3 gradientEnd = vec3(0.882, 0.882, 0.996); // #E1E1FE
  
  // Create a gradient from purple to white based on noise pattern
  // Use the pattern value to mix between colors - make more solid
  float purpleAmount = smoothstep(0.2, 0.8, f);
  float gradientMix = smoothstep(0.0, 1.0, f);
  
  // Mix gradient colors first - increase saturation for more solid look
  vec3 gradientColor = mix(gradientStart, gradientEnd, gradientMix);
  
  // Then mix in purple accents - increase opacity for more solid background
  col = mix(gradientColor, purple, purpleAmount * 0.5);
  
  // Add some white highlights - reduce for more solid appearance
  float whiteHighlight = smoothstep(0.5, 0.85, f);
  col = mix(col, whiteLight, whiteHighlight * 0.15);
  
  // Increase overall saturation and brightness for more solid appearance
  col = mix(col, col * 1.1, 0.3);

  // Apply dithering using normalized UV coordinates for consistent pattern across resolutions
  // Use vUv (normalized 0-1 coordinates) instead of screen coordinates
  vec2 ditherUV = vUv;
  // Scale by pixelSize to maintain consistent dithering density
  float ditherScale = pixelSize * 1920.0; // Scale relative to reference resolution
  vec2 uvPixel = (1.0 / ditherScale) * floor(ditherUV * ditherScale);
  col = dither(uvPixel, col);

  gl_FragColor = vec4(col, 1.0);
}`;

export const waveVertexShader = `precision highp float;

varying vec2 vUv;

void main() {
  vUv = uv;

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}`;

