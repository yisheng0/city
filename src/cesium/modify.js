import * as Cesium from "cesium";

//修改建筑颜色
export const modifyBulid = (viewer)=>{

    //buliding
    let tiles3D =  Cesium.createOsmBuildingsAsync();
    let buliding = viewer.scene.primitives.add(tiles3D)
        
    //监听瓦片加载执行事件  
    tiles3D.tileVisible.addEventListener(function(tile){
        //console.log(tile)
        const cesium3DTileCon = tile.content;
        // console.log(cesium3DTileCon);
       let  featuresLength = cesium3DTileCon.featuresLength;
        for(let i=0; i<featuresLength; i++){
           const model = cesium3DTileCon.getFeature(i).content._model;
          //console.log(model);
           let fragment = model._rendererResources.sourceShaders[1] = `
           //varying vec3 v_positionMC;
           varying vec3 v_positionEC;
           //varying vec2 v_st;
           void main()
          {   
            czm_materialInput materialInput;
            gl_FragColor = vec4(1.0,0.0,0.0, 1.0);
            // 获取模型position信息
            vec4 position = czm_inverseModelView * vec4(v_positionEC, 1.0);
            float strength = position.z/125.0;
            gl_FragColor = vec4(strength*0.9, 0.1*strength , strength, 1.0);
          }
           
           `
           model. _shouldRegenerateShaders = true;
        }
    })
}

//修改地图颜色
export const modifyMap = (viewer)=>{
    //获取地图
    // let baselayer =viewer.imageryLayers.get(0);
    let baselayer ={};
    baselayer.invertColor = true;
    baselayer.filterRgb = [0,50,100];
    //更改底图
    const baseFragment = viewer.scene._globe._surfaceShaderSet.baseFragmentShaderSource.sources;

    for(let i=0; i<baseFragment.length; i++){

       let strs = "color = czm_saturation(color, textureSaturation);\n#endif\n";
       let strT = "color = czm_saturation(color, textureSaturation);\n#endif\n";

       if(baselayer.invertColor){
          strT += `
          color.r = 1.0 - color.r;
          color.g = 1.0 - color.g;
          color.b = 1.0 - color.b;
          
          `;
       }
  if(baselayer.filterRgb){
       strT += 
       `
       color.r = color.r * ${baselayer.filterRgb[0]}.0/255.0;
       color.g = color.g * ${baselayer.filterRgb[1]}.0/255.0;
       color.b = color.b * ${baselayer.filterRgb[2]}.0/255.0;
          `
    }
       baseFragment[i] = baseFragment[i].replace(strs,strT);
    }  ;
   
 
 
 }