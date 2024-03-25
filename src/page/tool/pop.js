import * as Cesium from "cesium";
import popupv from "../popup.vue"
import { h, render } from "vue";

export default function pop(viewer) {
    let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    // 定义一个空数组，用于存储弹窗的div元素
    let divs = []; 
    handler.setInputAction((e) => {
        const pickedFeature = viewer.scene.pick(e.position);
        // 判断是否有要素被选中
        if (Cesium.defined(pickedFeature)) { 
            let worldPosition = viewer.scene.pickPosition(e.position); 
            console.log(pickedFeature);
            let container = viewer.cesiumWidget.container;
            let div = document.createElement("div"); 
            div.setAttribute('class', 'popup')
            div.setAttribute('data-position', JSON.stringify(worldPosition)); // 添加自定义属性，存储位置信息
            div.style.cssText = `
            position: absolute;
            width:100px;
            height:100px;
            `
            container.appendChild(div);
            render(h(popupv, { type: pickedFeature.content._model.type }), div)
            console.log(1)
            divs.push(div); // 将div元素添加到divs数组中
        }

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    // 在外面添加postRender事件的监听器，用于更新弹窗的位置
    viewer.scene.postRender.addEventListener(() => {
        let container = viewer.cesiumWidget.container;
        for (let i = 0; i < divs.length; i++) { 
            const canvasHeight = viewer.scene.canvas.height;
            const windowPosition = new Cesium.Cartesian2();
            let worldPosition = JSON.parse(divs[i].getAttribute('data-position'));
            Cesium.SceneTransforms.wgs84ToWindowCoordinates(
                viewer.scene,
                worldPosition,
                windowPosition
            );
            divs[i].style.bottom = canvasHeight - windowPosition.y + 40 + "px";
            const elWidth = divs[i].offsetWidth;
            divs[i].style.left = windowPosition.x - elWidth / 2 + 30 + "px";

            const camerPosition = viewer.camera.position;
            let height = viewer.scene.globe.ellipsoid.cartesianToCartographic(camerPosition).height;
            height += viewer.scene.globe.ellipsoid.maximumRadius;
            if ((!(Cesium.Cartesian3.distance(camerPosition, worldPosition) > height)) && viewer.camera.positionCartographic.height < 50000000) { 
                divs[i].style.display = "block";
            } else {
                divs[i].style.display = "none";
                divs.splice(i, 1); 
                container.removeChild(divs[i]); 
            }
        }

    })
}
