import * as Cesium from "cesium";
export const addPoint = (viewer) => {
    let pointInfo = [
        {
            id: "392f7fbb-ae25-4eef-ac43-58fd91148d1f",
            latitude: "31.24194",
            longitude: "121.49517",
            psName: "东方明珠",
        },

    ];
    viewer.entities.removeAll();
    pointInfo.forEach((pointObj) => {
        viewer.entities.add({
            name: pointObj.psName,
            code: pointObj.id,
            id: pointObj.id,
            position: Cesium.Cartesian3.fromDegrees(
                pointObj.longitude * 1,
                pointObj.latitude * 1,
                700
            ),
            label: {
                text: pointObj.psName,
                fillColor: Cesium.Color.fromCssColorString("rgb(110,55,244)"),
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 3,
                font: '60px sans-serif',
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                scaleByDistance: new Cesium.ConstantProperty(
                    new Cesium.NearFarScalar(3600, 0.4, 5000, 0.0)),

            },
            billboard: {
                image: "../assets/pz.png",
                width: 130,
                height: 100,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.CENTER,
                scaleByDistance: new Cesium.ConstantProperty(
                    new Cesium.NearFarScalar(8600, 0.4, 15000, 0.0)),
            },
        });
    });
}