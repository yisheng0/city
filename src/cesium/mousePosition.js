
import * as Cesium from "cesium";

export default class mousePosition{
    constructor(viewer){
        this.divDom = document.createElement("div");
        this.divDom.style.cssText = `
        position:fixed;
        bottom:0;
        right:0;
        width:200px;
        height:50px;
        background-color: rgba(0,0,0,.4);
        color: #fff;
        font-size:14px;
        line-height:50ox;
        text-align:center;
        z-index:120
        
        `;
        document.body.appendChild(this.divDom);
        //监听鼠标
        const handler = new Cesium.ScreenSpaceEventHandler();
        handler.setInputAction(
            (movement)=>{
                let ellipsoid = viewer.scene.globe.ellipsoid;
                let cartesian = viewer.scene.camera.pickEllipsoid (movement.endPosition, ellipsoid);
                if (cartesian) {
                    let cartographic = ellipsoid.cartesianToCartographic (cartesian);
                    let lon = Cesium.Math.toDegrees (cartographic.longitude).toFixed(3);
                    let lat = Cesium.Math.toDegrees (cartographic.latitude).toFixed(3);
                    let height = cartographic.height.toFixed(2);
                    //显示'
                    this.divDom.innerHTML = `经度：${lon} <br>  纬度:  ${lat}`;
                  }
            },
            Cesium.ScreenSpaceEventType.MOUSE_MOVE
        

        )
    }

}