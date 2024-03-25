import * as Cesium from "cesium";

export default class cesiumPopup {
    constructor(viewer) {
        this.div = document.createElement("div");
        this.div.setAttribute('class','popup')
        this.div.style.cssText = `
            position:fixed;
            width:200px;
            height:250px;
            background-color: rgba(199,0,99,.2);
            color: #fff;
            ont-size:14px;
            line-height:50ox;
            text-align:center;
            display :none;
            `;
        document.body.appendChild(this.div);
        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction(
            (click) => {
                let ellipsoid = viewer.scene.globe.ellipsoid;
                let cartesian = viewer.scene.camera.pickEllipsoid(click.position, ellipsoid);
                let lon, lat, canvasPosition;
                if (cartesian) {
                    let cartographic = ellipsoid.cartesianToCartographic(cartesian)
                    lon = Number(Cesium.Math.toDegrees(cartographic.longitude).toFixed(3));
                    lat = Number(Cesium.Math.toDegrees(cartographic.latitude).toFixed(3));
                }
                // cesium二维笛卡尔 笛卡尔二维坐标系就是我们熟知的而二维坐标系；三维也如此

                var divPosition = Cesium.Cartesian3.fromDegrees(lon, lat, 0);
                let arr = [10, 0];
                const pick = viewer.scene.pick(click.position);
                viewer.scene.preRender.addEventListener(() => {
                    // cartesianToCanvasCoordinates 笛卡尔坐标（3维度）到画布坐标
                    if (Cesium.defined(divPosition)) {
                        canvasPosition = viewer.scene.cartesianToCanvasCoordinates(divPosition);
                        let divs =  document.getElementsByClassName('popup')
                        for(let i =0;i<divs.length;i++){
                            divs[i].style.left =  canvasPosition.x + arr[0] + "px";
                            divs[i].style.top = canvasPosition.y + arr[1] + "px";                                 
                        }
                        // this.div.style.left = canvasPosition.x + arr[0] + "px";
                        // this.div.style.top = canvasPosition.y + arr[1] + "px";
                    }
                });
                if (pick) {
                    this.div.innerHTML = ' 这是弹框';
                    if (this.div.style.display == 'none') {
                        this.div.style.display = "block";
                    } else {
                        this.div.style.display = "none";
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }
}