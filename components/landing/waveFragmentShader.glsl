precision highp float;

uniform vec2 resolution;
uniform float time;
uniform vec2 mouse;

varying vec2 vUv;

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

const int OCTAVES = 5;

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * cnoise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

float pattern(vec2 p) {  
    // Mouse interaction - create dynamic flow
    vec2 mouseOffset = (mouse - 0.5) * 2.0;
    
    // Multiple layers for depth
    vec2 p1 = p + mouseOffset * 0.4;
    vec2 p2 = p * 1.3 - mouseOffset * 0.3 + time * 0.1;
    vec2 p3 = p * 0.7 + mouseOffset * 0.2 - time * 0.05;
    
    float f1 = fbm(p1);
    float f2 = fbm(p2);
    float f3 = fbm(p3);
    
    // Combine layers with different weights
    float pattern = f1 * 0.5 + f2 * 0.3 + f3 * 0.2;
    
    // Add time-based animation
    pattern += sin(time * 0.3 + p.x * 2.0 + p.y * 2.0) * 0.1;
    
    return pattern;
}

void main() {
  vec2 uv = vUv;
  uv -= 0.5;
  uv.x *= resolution.x / resolution.y;

  // Get pattern value
  float f = pattern(uv);
  f = (f + 1.0) * 0.5; // Normalize to 0-1
  
  // Simple directional lighting based on gradient
  vec2 mousePos = (mouse - 0.5) * 2.0;
  mousePos.x *= resolution.x / resolution.y;
  
  // Simple light direction (cheap approximation)
  vec2 lightVec = normalize(mousePos - uv);
  float lightAngle = dot(normalize(uv), lightVec);
  
  // Simple lighting - brighten areas facing the light
  float lighting = mix(0.6, 1.2, lightAngle * 0.5 + 0.5);
  
  // Add subtle mouse glow
  float mouseDist = length(uv - mousePos);
  float mouseGlow = exp(-mouseDist * 1.2) * 0.4;
  lighting += mouseGlow;
  
  // Color palette
  vec3 darkBase = vec3(0.12, 0.12, 0.16);
  vec3 darkMid = vec3(0.18, 0.18, 0.24);
  vec3 purpleDark = vec3(0.22, 0.25, 0.38);
  vec3 purpleMid = vec3(0.28, 0.35, 0.55);
  vec3 purple = vec3(0.318, 0.408, 1.0);
  vec3 purpleBright = vec3(0.45, 0.55, 1.0);
  
  // Base color from pattern
  vec3 baseColor;
  if (f < 0.2) {
    baseColor = mix(darkBase, darkMid, f / 0.2);
  } else if (f < 0.4) {
    baseColor = mix(darkMid, purpleDark, (f - 0.2) / 0.2);
  } else if (f < 0.6) {
    baseColor = mix(purpleDark, purpleMid, (f - 0.4) / 0.2);
  } else if (f < 0.8) {
    baseColor = mix(purpleMid, purple, (f - 0.6) / 0.2);
  } else {
    baseColor = mix(purple, purpleBright, (f - 0.8) / 0.2);
  }
  
  // Apply simple lighting
  vec3 col = baseColor * lighting;
  
  // Final contrast
  col = pow(col, vec3(0.9));

  gl_FragColor = vec4(col, 1.0);
}
