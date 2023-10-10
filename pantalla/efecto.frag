in vec2 vTextureCoord; // shadertoy: fragCoord

out vec4 fragColor;

// nuestros
uniform float iTime;
uniform vec3 iResolution;
uniform sampler2D iChannel1;

// de pixi
// uniform highp vec4 inputSize;
uniform highp vec4 outputFrame;
uniform vec4 inputPixel;
// uniform vec4 inputClamp;
// uniform vec4 globalFrame;
// uniform vec4 outputTexture;

uniform sampler2D uSampler; // shadertoy: iChannel0

vec2 getUV(vec2 coord) {
	return coord * inputPixel.xy / outputFrame.zw;
}

void pruebaCoord() {
  vec2 uv = getUV(vTextureCoord);

  vec2 uv2 = uv * 2.0 - 1.0;
  float d = length(uv2);

  vec3 col1 = vec3(uv.x, uv.y, 0.);
  vec3 col2 = vec3(d, 0.0, d);

  float comp = smoothstep(0.6, 0.9, sin(iTime * 1.));
  vec3 col = mix(col1, col2, comp);
  fragColor = vec4(col, 1.0);
}

vec2 curvar(vec2 uv) {
	uv -= vec2(.5,.5);
	uv = uv*1.2*(1./1.2+2.*uv.x*uv.x*uv.y*uv.y);
	uv += vec2(.5,.5);
	return uv;
}

vec3 getVideo(vec2 uv) {
  vec3 video;
	float x =  sin(0.3*iTime+uv.y*21.0)*sin(0.7*iTime+uv.y*29.0)*sin(0.3+0.33*iTime+uv.y*31.0)*0.0017;
	// float x = 0.0;
  video.r = texture(uSampler,vec2(x+uv.x+0.001,uv.y+0.001)*0.5).x+0.05;
  video.g = texture(uSampler,vec2(x+uv.x+0.000,uv.y-0.002)*0.5).y+0.05;
  video.b = texture(uSampler,vec2(x+uv.x-0.002,uv.y+0.000)*0.5).z+0.05;
  return video;
}

vec3 espejar(vec3 rgb, vec2 uv) {
	float x =  sin(0.3*iTime+uv.y*21.0)*sin(0.7*iTime+uv.y*29.0)*sin(0.3+0.33*iTime+uv.y*31.0)*0.0017;
	// float x = 0.0;
  rgb.r += 0.08*texture(uSampler,0.75*vec2(x+0.025, -0.027)+vec2(uv.x+0.001,uv.y+0.001)*0.5).x;
  rgb.g += 0.05*texture(uSampler,0.75*vec2(x+-0.022, -0.02)+vec2(uv.x+0.000,uv.y-0.002)*0.5).y;
  rgb.b += 0.08*texture(uSampler,0.75*vec2(x+-0.02, -0.018)+vec2(uv.x-0.002,uv.y+0.000)*0.5).z;
  return rgb;
}

vec3 vinieta(vec3 rgb, vec2 uv) {
  float vig = (0.0 + 1.0*16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y));
	return rgb * vec3(pow(vig,0.3));
}

vec3 lineas(vec3 rgb, vec2 uv) {
	float lineas = clamp( 0.35+0.35*sin(3.5*iTime+uv.y*iResolution.y*1.5), 0.0, 1.0);
	return rgb * vec3( 0.4+2.7 * lineas);
}

vec3 recortar(vec3 rgb, vec2 uv) {
	if (uv.x < 0.0 || uv.x > 1.0)
		rgb *= 0.0;
	if (uv.y < 0.0 || uv.y > 1.0)
		rgb *= 0.0;
  return rgb;
}

vec3 parpadeo(vec3 rgb) {
  rgb *= 1.0+0.05*sin(110.0*iTime);
  return rgb;
}

vec3 ajustarBrilloColor(vec3 rgb) {
  rgb *= vec3(0.95,1.05,0.95);
	rgb *= 2.5;
  return rgb;
}

void pantalla() {
	vec2 uv = getUV(vTextureCoord);

	uv = curvar(uv);

  vec3 video = getVideo(uv);
  video = espejar(video, uv);
  video = vinieta(video, uv);
  video = lineas(video, uv);
  video = recortar(video, uv);
  video = parpadeo(video);
  video = ajustarBrilloColor(video);

  fragColor = vec4(video, 1.0);
}

void main() {
  // pruebaCoord();
  pantalla();
}