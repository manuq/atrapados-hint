in vec2 vTextureCoord; // shadertoy: fragCoord

out vec4 fragColor;

// nuestros
uniform float glitch;
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

float onOff(float a, float b, float c)
{
	return step(c, sin(iTime + a*cos(iTime*b)));
}

vec2 distorsionVertical(vec2 uv) {
  float window = 1./(1.+20.*(uv.y-mod(iTime/4.,1.))*(uv.y-mod(iTime/4.,1.)));
  uv.x = uv.x + sin(uv.y*10. + iTime)/50.*onOff(4.,4.,.3)*(1.+cos(iTime*80.))*window;
  float vShift = 0.4*onOff(2.,3.,.9)*(sin(iTime)*sin(iTime*20.) + 
                    (0.5 + 0.1*sin(iTime*200.)*cos(iTime)));
  uv.y = mod(uv.y + vShift, 1.);
  return uv;
}

vec3 getVideo(vec2 uv) {
  vec3 video;
	float x =  sin(0.3*iTime+uv.y*21.0)*sin(0.7*iTime+uv.y*29.0)*sin(0.3+0.33*iTime+uv.y*31.0)*(0.0017+(glitch * 0.01));
  float rShift = 2.*onOff(3.,1.,.5)*(cos(iTime)*cos(iTime*20.) + 
                    (0.5 + 0.1*cos(iTime*200.)*sin(iTime)));
  vec3 dx = vec3(
    // x+0.001+(0.02 * glitch * sin(iTime*20.)),
    x+0.001+(0.02 * glitch * rShift),
    x,
    x-0.002-(0.01 * glitch)
  );
  vec3 dy = vec3(
    0.001,
    0.002,
    0.000
  );
  video.r = texture(uSampler,vec2(uv.x+dx.r,uv.y+dy.r)*0.5).x;
  video.g = texture(uSampler,vec2(uv.x+dx.g,uv.y-dy.g)*0.5).y;
  video.b = texture(uSampler,vec2(uv.x+dx.b,uv.y+dy.b)*0.5).z;
  video += 0.05;
  return video;
}

vec3 espejar(vec3 rgb, vec2 uv) {
	float x =  sin(0.3*iTime+uv.y*21.0)*sin(0.7*iTime+uv.y*29.0)*sin(0.3+0.33*iTime+uv.y*31.0)*(0.0017+(glitch * 0.01));
  rgb.r += 0.08*texture(uSampler,0.75*vec2(x+0.025, -0.027)+vec2(uv.x+0.001,uv.y+0.001)*0.5).x;
  rgb.g += 0.05*texture(uSampler,0.75*vec2(x+-0.022, -0.02)+vec2(uv.x+0.000,uv.y-0.002)*0.5).y;
  rgb.b += 0.08*texture(uSampler,0.75*vec2(x+-0.02, -0.018)+vec2(uv.x-0.002,uv.y+0.000)*0.5).z;
  return rgb;
}

vec3 vinieta(vec3 rgb, vec2 uv) {
  float vig = (0.0 + 1.0*16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y));
	return rgb * vec3(pow(vig,0.3+0.2*glitch));
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
  rgb *= 1.0+(glitch*0.1+0.05)*sin((glitch*10.0-50.0)*iTime);
  return rgb;
}

vec3 ajustarBrilloColor(vec3 rgb) {
  rgb *= vec3(0.95,1.05,0.95);
	rgb *= 1.8+0.5*glitch;
  return rgb;
}

void pantalla() {
	vec2 uv = getUV(vTextureCoord);

	uv = curvar(uv);

  vec2 uvd = uv;
  if (glitch > 0.5) {
    uvd = distorsionVertical(uvd);
  }

  vec3 video = getVideo(uvd);
  video = espejar(video, uvd);
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