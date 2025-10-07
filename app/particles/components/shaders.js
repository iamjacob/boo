// Simple fade vertex shader
export const fadeVertexShader = `
  uniform float uProgress;
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  
  void main() {
    vPosition = position;
    vNormal = normal;
    vUv = uv;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Simple fade fragment shader
export const fadeFragmentShader = `
  uniform float uProgress;
  uniform vec3 uColor;
  uniform sampler2D uTexture;
  
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  
  void main() {
    // Simple fade based on progress
    if (uProgress > 0.5) {
      discard;
    }
    
    // Sample the texture
    vec4 textureColor = texture2D(uTexture, vUv);
    
    // Simple fade out
    float alpha = 1.0 - (uProgress * 2.0);
    
    // Basic lighting
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(vNormal, lightDir), 0.0);
    vec3 finalColor = textureColor.rgb * uColor * (0.3 + 0.7 * diff);
    
    gl_FragColor = vec4(finalColor, textureColor.a * alpha);
  }
`;