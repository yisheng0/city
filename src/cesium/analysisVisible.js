import * as Cesium from "cesium";

export const analysisVisible = (viewer) => {
    let positions = [];
    let cartesian = null;
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(
        function (ele) {
            let ray = viewer.camera.getPickRay(ele.position)
            cartesian = viewer.scene.globe.pick(ray, viewer.scene)
            if (!Cesium.defined(cartesian)) return
            if (positions.length < 2 && cartesian !== null) {
                positions.push(cartesian)
            }
            if (positions.length == 2) {
                let start = positions[0]
                let end = positions[1]

                let direction = Cesium.Cartesian3.normalize(
                    Cesium.Cartesian3.subtract(

                        end,
                        start,
                        new Cesium.Cartesian3()
                    ),
                    new Cesium.Cartesian3()
                );
                // 建立射线
                let ray = new Cesium.Ray(start, direction);
                let result = viewer.scene.globe.pick(ray, viewer.scene);

                if (result !== undefined && result !== null) {
                    drawLine(result, start, Cesium.Color.GREEN);
                    drawLine(result, end, Cesium.Color.RED);
                } else {
                    drawLine(start, end, Cesium.Color.GREEN);
                }
                handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            }

        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK
    )
    function drawLine(start, end, color) {
        viewer.entities.add({
            name: '_range',
            polyline: {
                positions: [start, end],
                width: 3,
                material: color,
                depthFailMaterial: Cesium.Color.BLUE,
            }
        });
    }
}