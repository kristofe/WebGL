//Vertex Shader
uniform vec3 LightSource;
 
attribute vec4 tangent;
 
varying vec2 vUv;
varying vec3 vPosition;
 
varying vec3 vNormal;
varying vec3 vTangent;
varying vec3 vBinormal;
 
varying vec3 tsPosition;
varying vec3 tsCameraPosition;
varying vec3 tsLightSource;
 
void main( void ) {
     
    vUv = uv;
    vPosition = position;
     
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
     
    // Find & normalize the plane's normal, tangent, and binormal vectors
    vNormal = normalize( normal );
    vTangent = normalize( tangent.xyz );
    vBinormal = normalize( cross( vNormal, vTangent ) * tangent.w );
     
    // Convert vertice, camera, and light vector positions into tangent space
    mat3 TBNMatrix = mat3(vTangent, vBinormal, vNormal);
    tsPosition = position * TBNMatrix;
    tsCameraPosition = cameraPosition * TBNMatrix;
    tsLightSource = LightSource * TBNMatrix;

}





//Fragment Shader



uniform sampler2D base; // base texture
uniform sampler2D map; // normal map in rgb space, heightmap in alpha channel
 
uniform vec3 ambientColor; // color of ambient light
uniform vec3 diffuseColor; // color of diffuse lighting
uniform vec3 specularColor; // color of specular highlights
uniform float shininess; // how shiny the surface is
uniform vec2 scaleBias; // x = scale, y = bias
 
varying vec3 vPosition;
varying vec2 vUv;
 
varying vec3 tsPosition;
varying vec3 tsCameraPosition;
varying vec3 tsLightSource;
 
void main()
{
    // calculate the UV offset
    float height = texture2D(map, vUv).a;
    float v = height * scaleBias.r - scaleBias.g;
 
    // normalize the camera's tangent space position
    vec3 eye = normalize(tsCameraPosition);
 
    vec2 newCoords = vUv + (eye.xy * v);
     
    vec3 color = texture2D(base, newCoords).rgb; // default color 
    vec3 normal = texture2D(map, newCoords).rgb * 2.0 - 1.0;
     
    // normalize the other tangent space vectors
    vec3 viewVector = normalize(tsCameraPosition - tsPosition);
    vec3 lightVector = normalize(tsLightSource - tsPosition);
     
    // calculate lighting values
    float nxDir = max(0.0, dot(normal, lightVector));
    vec3 ambient = ambientColor * color;
 
    float specularPower = 0.0;
    if(nxDir != 0.0)
    {
        vec3 halfVector = normalize(lightVector + viewVector);
        float nxHalf = max(0.0, dot(normal, halfVector));
        specularPower = pow(nxHalf, shininess);
    }
    vec3 specular = specularColor * specularPower;
 
    gl_FragColor = vec4(ambient + (diffuseColor * nxDir * color) + specular, 1.0);
     
     
}
