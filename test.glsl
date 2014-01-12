-- MouseFrag
    precision mediump float;
    uniform vec2 uViewportSize;
    uniform vec2 uMouseLocation;
    uniform float uMouseRadius;
    varying vec2 vUV;

    void main(void) {
      vec4 orig_color = vec4(vUV.x, vUV.y, 1.0, 1.0);
      vec4 mouse_color = vec4(1, 0, 0, 1.0);

      float dist = length(
                          vec2(gl_FragCoord) - 
                          vec2(uMouseLocation.x - uMouseRadius,
                               uMouseLocation.y + uMouseRadius
                              )
                         );
      float t =  clamp(dist/uMouseRadius, 0.0, 1.0);

      gl_FragColor = mix(mouse_color, orig_color, t);
    }

-- Frag
    precision mediump float;
    varying vec2 vUV;
    varying vec3 vNormal;
    uniform sampler2D uTexture01;
    uniform vec2 uMouseLocation;
    uniform float uMouseRadius;

    void main(void) {
     	vec3 light = normalize(vec3(0.8,  1.0,  0.2));
        
			float d = dot(vNormal, light);
      d = clamp(d, 0.0, 1.0);
      float c = mix(0.1, 1.0, d);
      vec4 tex = texture2D(uTexture01,vUV);
      tex.xyz *= c;
      gl_FragColor = tex;
      //gl_FragColor = vec4(vNormal.xyz, 1.0);
    }

-- Vertex
    precision mediump float;
    //Data from bufferData
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aUV;
    //attribute vec4 aTangent;
    attribute vec4 aColor;

    uniform mat4 uMVMatrix;
    uniform mat4 uInverse;
    uniform mat4 uInverseTranspose;
    uniform mat4 uPMatrix;
    uniform float uTime;    
    uniform sampler2D uTexture01;
    uniform sampler2D uTexture02;
    uniform vec2 uMouseLocation;
    uniform float uMouseRadius;

    //These will be passed to the fragment shader and will be interpreted per
    //pixel
    varying vec2 vUV;
    varying vec3 vNormal;
    varying vec3 vTangent;
    varying vec4 vVertColor;


    void main(void) {

        gl_Position = uPMatrix * uMVMatrix * vec4(aPosition, 1.0);
        //The line below will ignore any translation of perspective matrix
        //gl_Position =  vec4(aPosition, 1.0);
        //vTangent = aTangent.xyz;
        vVertColor = aColor;
        
        vUV = aUV.xy;
        vec3 norm = mat3(uInverseTranspose) * normalize(aNormal);
        vNormal = norm.xyz;
    }

