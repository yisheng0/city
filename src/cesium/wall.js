

import {
    MaterialAppearance,
    Material,
    Cartesian3,
    GeometryInstance,
    Primitive,
    WallGeometry,
    Color
} from 'cesium'

export default function wall(viewer) {
    const polylinePulseLinkFabric = {
        type: 'PolylinePulseLink',
        uniforms: {
            color: Color.fromCssColorString('rgba(0, 255, 255, 1)'),
            speed: 0,
            image: 'twoR.png', // 可以自己指定泛光墙体渐变材质
        },
        source: `czm_material czm_getMaterial(czm_materialInput materialInput) {
      czm_material material = czm_getDefaultMaterial(materialInput);
      vec2 st = materialInput.st;
      vec4 colorImage = texture2D(image, vec2(fract((st.t - speed * czm_frameNumber * 0.005)), st.t));
      vec4 fragColor;
      fragColor.rgb = color.rgb / 1.0;
      fragColor = czm_gammaCorrect(fragColor); // 伽马校正
  
      material.alpha = colorImage.a * color.a;
      material.diffuse = (colorImage.rgb + color.rgb) / 2.0;
      material.emission = fragColor.rgb;
      return material;
    }`,
    }

    // 使用
    const wallInstance = new GeometryInstance({
        geometry: WallGeometry.fromConstantHeights({
            positions: Cartesian3.fromDegreesArray([
                97.0, 43.0,
                107.0, 43.0,
                107.0, 40.0,
                97.0, 40.0,
                97.0, 43.0,
            ]),
            maximumHeight: 100000.0,
            vertexFormat: MaterialAppearance.VERTEX_FORMAT,
        }),
    })

    let primitives = new Primitive({
        geometryInstances: wallInstance,
        appearance: new MaterialAppearance({
            material: new Material({ fabric: polylinePulseLinkFabric }),
        }),
    })
    viewer.scene.primitives.add(primitives)
}